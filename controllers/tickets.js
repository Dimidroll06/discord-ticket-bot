const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits  } = require("discord.js");
const locales = require('../utils/locales');

module.exports = {
    create: async (interaction, client, ticketType)=>{
        // destruct
        const db = client.db;

        // questions
        var questions = [];
        if ( interaction.isModalSubmit() ) interaction.fields.fields.forEach( field => questions.push(field.value) );

        // destruct 
        const maxTickets = client.config.tickets.maxTicketOpened;
        var userTickets = (await db.all())
            .filter(o => o.id.startsWith('ticket_'))
            .filter( o => o.value.creator == interaction.user.id);
        // counting userOpenedTickets
        var ticketsCount = ( await db.all() ).filter( o => o.id.startsWith("ticket_") ).length;

        // if opened more than limit
        if ( maxTickets > 0 && userTickets.filter( o => !o.value.closed ).length >= maxTickets ){
            // break
            interaction.reply({ 
                content: locales(client.locales.openTicketChannel.ticketLimit, client, interaction, { type: ticketType }),
                ephemeral: true 
            }); 
            return;
        };

        // if user have role, that blocked at ticket or at server
        if([...client.config.tickets.blockedRoles, ...ticketType.blockedRoles].some(blockedRoleId => interaction.member.roles.cache.some( roleId => blockedRoleId == roleId ) )) {
            // break
            interaction.reply({ 
                content: locales(client.locales.openTicketChannel.blockedRole, client, interaction, { type: ticketType }), 
                ephemeral: true 
            });
            return;
        };
        
        // getting category, where we open ticket
        var category = client.channels.cache.get(ticketType.categoryId);
        if(!category) throw new Error(`Category with id ${ticketType.categoryId} is not definded`);

        // creating ticket channel
        var ticketChannel = await interaction.guild.channels.create({
                name: locales(ticketType.customChannelName ?? client.config.tickets.ticketName, client, interaction, { id: ticketsCount - 1, type: ticketType }),
                parent: category,
                permissionOverwrites: [
					{
						id: interaction.guild.roles.everyone,
						deny: [PermissionFlagsBits.ViewChannel],
					},
				]
            });

        if(!ticketChannel) throw new Error(`Can't create channel with parent: ${ticketType.categoryId}`);
        
        // TICKET
        var ticket = {
            id: ticketsCount,

            creator: interaction.user.id,
            createdAt: Date.now(),
            questions,

            claimed: false,
            claimedBy: undefined,
            claimedAt: undefined,

            closed: false,
            closedBy: undefined,
            closedAt: undefined,
            closeReason: undefined,

            messageId: undefined,
            channelId: ticketChannel.id,
            type: ticketType,
        };

        // setting ticket in db
        await db.set(`ticket_${ticket.channelId}`, ticket);

        // OVEVRWRITING PERMISSIONS 
        // for creator
        ticketChannel.permissionOverwrites.edit(interaction.user, {
                SendMessages: true,
                AddReactions: true,
                ReadMessageHistory: true,
                AttachFiles: true,
                ViewChannel: true,
            }).catch( e => {
                console.log(e)
            });
        
        // and STUFF
        [...client.config.tickets.rolesWhoHaveAccessToTheTickets, ...ticketType.rolesHaveAccess].forEach(role => {
            ticketChannel.permissionOverwrites.edit(role, {
                    SendMessages: true,
                    AddReactions: true,
                    ReadMessageHistory: true,
                    AttachFiles: true,
                    ViewChannel: true,
                }).catch( e => {
                    console.log(e)
                });
        });

        // emmiter
        client.ticketEmmiter.emit('ticketOpened', interaction, client, ticketChannel, ticket, questions);
        
        // reply (to prevent error)
        interaction.reply({
            content: locales(client.locales.openTicketChannel.ticketOpened, client, interaction, ticket),
            ephemeral: true
        });

        // logger
        client.log('ticket_open', ticket.channelId);
    },

    claim: async (interaction, client) => {
        // destruct
        const db = client.db;

        // get ticket
        var ticket = await db.get(`ticket_${interaction.channel.id}`);
        // check if ticket exist
        if (!ticket){
            interaction.reply({
                content: "Ticket not found",
                ephemeral: true
            }).catch((e) => console.log(e));
            return;
        } 

        // if ticket already claimed
        if (ticket.claimed) {
            interaction.reply({
                content: locales(client.locales.openedTicket.ticketAlreadyClaimed, client, interaction, ticket),
                ephemeral: true
            })
            return;
        }

        // if user is creator (and not debug mode)
        if ( ticket.creator == interaction.user.id && !client.config.bot.debug_mode ) {
            interaction.reply({
                content: locales(client.locales.openedTicket.youCantClaimTicket, client, interaction),
                ephemeral: true
            });
            return;
        }
 
        // set claim button disabled
        var message = interaction.channel.messages.cache.get(await db.get(`ticket_${interaction.channel.id}.messageId`));
        message.components[0]?.components?.map( component => {
            if(component.data.custom_id == "claimTicket") component.data.disabled = true;
        });

        message.edit({
            content: message.content,
            embeds: message.embeds,
            components: message.components,
        }).catch(e => console.log(e));

        //

        // set claimed in db
        await db.set(`ticket_${interaction.channel.id}.claimed`, true);
        await db.set(`ticket_${interaction.channel.id}.claimedAt`, Date.now());
        await db.set(`ticket_${interaction.channel.id}.claimedBy`, interaction.user.id);

        // sending message
        interaction.channel.send(
            locales(client.locales.openedTicket.claimed, client, interaction, ticket)
        );
        // setting prefix
        interaction.channel.setName(client.config.tickets.ticketNamePrefixClaimed + interaction.channel.name);
        // reply to prevent errors
        interaction.reply({
            content: locales(client.locales.openedTicket.youClaimedTicket, client, interaction, ticket),
            ephemeral: true
        });

        // logger
        client.log('ticket_claimed', interaction.channel.id)
    },

    close: async (interaction, client) => {
        // destruct
        const db = client.db;

        // if no ticket in database - break
        if( !(await db.has(`ticket_${interaction.channel.id}`)) ) return console.log(`ticket_${interaction.channel.id} is undefinded`);
        
        // set default close reason
        var reason = client.locales.openedTicket.closeReasonAsk.default;
        // but if we have reason - change variable
        if( interaction.isModalSubmit() ) reason = interaction.fields.getTextInputValue('reason') || reason;

        // get ticket
        var ticket = await db.get(`ticket_${interaction.channel.id}`);

        // if ticket already closed
        if (ticket.closed) {
            // break
            interaction.reply({
                content: locales(client.locales.openedTicket.ticketAlreadyClosed, client, interaction, ticket),
                ephemeral: true
            })
            return;
        }

        // if user don't have roles that can close ticket
        if ( 
            (
                client.config.tickets.rolesWhoCanCloseTicket.length > 0 
                && 
                !client.config.tickets.rolesWhoCanCloseTicket.some(
                    roleWhoCanCloseTicket => interaction.member.roles.cache.has(roleWhoCanCloseTicket)
                ) 
            )
            ||
            (
                ticket.creator == interaction.user.id 
                && 
                !client.config.bot.debug_mode
            )
        ) {
            // break
            interaction.reply({
                content: locales(client.locales.openedTicket.youCantCloseTicket, client, interaction, ticket),
                ephemeral: true
            });
            return;
        };

        // if close category id exists
        if ( client.config.tickets.closeTicketCategoryId ){
            // try to get category
            var closeCategory = await interaction.guild.channels.fetch(client.config.tickets.closeTicketCategoryId).catch(e=>{
                // if channel is undefinded - log
                console.log("close category is undefinded");
            });
            // else set new parent category to closed ticket
            if(closeCategory) await interaction.channel.setParent(closeCategory).catch( e => console.log(e) );
        };

        // disable buttons
        var message = interaction.channel.messages.cache.get(await db.get(`ticket_${interaction.channel.id}.messageId`));
        message.components[0]?.components?.map( component => {
            if(component.data.custom_id == "claimTicket") component.data.disabled = true;
            if(component.data.custom_id == "closeTicket") component.data.disabled = true;
            if(component.data.custom_id == "askClose")    component.data.disabled = true;
        });

        message.edit({
            content: message.content,
            embeds: message.embeds,
            components: message.components,
        }).catch(e => console.log(e));


        // overwrites permissions for creator
        interaction.channel.permissionOverwrites.edit(ticket.creator, {
            ViewChannel: false,
        }).catch( e => {
            console.log(e)
        });

        // changing ticket in db
        await db.set(`ticket_${interaction.channel.id}.closed`, true);
        await db.set(`ticket_${interaction.channel.id}.closedAt`, Date.now());
        await db.set(`ticket_${interaction.channel.id}.closedBy`, interaction.user.id);
        await db.set(`ticket_${interaction.channel.id}.closeReason`, reason);

        // reply to prevent errors
        interaction.reply({
            content: locales(client.locales.openedTicket.youClosedTicket, client, interaction, ticket),
            ephemeral: true
        });
        interaction.channel.send(
            locales(client.locales.openedTicket.closed, client, interaction, ticket).replace("REASON", reason)
        );

        // logger
        client.log('ticket_closed', interaction.channel.id)
    },

    // MODALS

    askClose: async (interaction, client) => {
        var modal = new ModalBuilder()
            .setCustomId(`closeTicket`)
            .setTitle(client.locales.openedTicket.closeReasonAsk.title);
    
        var row = new ActionRowBuilder();
        row.addComponents( 
            new TextInputBuilder()
                .setCustomId(`reason`) 
                .setLabel(locales(client.locales.openedTicket.closeReasonAsk.label))
                .setPlaceholder(client.locales.openedTicket.closeReasonAsk.placeholder)
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
        );
    

        modal.addComponents(row);

        interaction.showModal(modal);
    },

    askQuestions: async (interaction, client, ticketType) => {
        var modal = new ModalBuilder()
            .setCustomId(ticketType.codeName)
            .setTitle(locales(client.locales.ticketQuestions.title, client, interaction, { type: ticketType }));
        
        var row = new ActionRowBuilder();
        ticketType.questions.forEach((question, index) => {
            row.addComponents( 
                new TextInputBuilder()
                    .setCustomId(`question-${index}`) 
                    .setLabel(locales(question.label, client, interaction, { type: ticketType }))
                    .setPlaceholder(locales(question.placeholder, client, interaction, { type: ticketType }))
                    .setStyle(TextInputStyle[question.style] ?? TextInputStyle.Short)
                    .setMaxLength(question.maxLength)
                    .setRequired(question.required)
            );
        });

        modal.addComponents(row);

        interaction.showModal(modal);
    },

    showTicketList: async (interaction, client) => {
        // creating action builder
        const row = new ActionRowBuilder();
        var select = new StringSelectMenuBuilder()
            .setCustomId('ticket-select');

        // for each type of tickets
        client.config.tickets.ticketTypes.forEach( type => {
            // create option for string menu
            var option = new StringSelectMenuOptionBuilder()
                .setLabel(type.name)
                .setValue(type.codeName)
                .setDescription(type.description);
            // and emoji
            if(type.emoji) { option.setEmoji(type.emoji); };
            select.addOptions(option);
        });

        row.addComponents(select)

        // the send to user
        interaction.reply({
            components: [row],
            ephemeral: true,
        });
    }
}
