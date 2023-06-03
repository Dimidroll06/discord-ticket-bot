const { Client, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,  } = require("discord.js");
const locales = require('../utils/locales');

module.exports = {
    event: "clientReady",

    /**
     * @param {Client} client 
     */
    async execute(client){
        console.log("Bot is ready");
        if (client.config.bot.debug_mode) console.log("BOT IS RUNNING IN DEBUG MODE");

        // init logger
        (()=>{
            let _loggerClass = require('../utils/logger.js');
            let logger = new _loggerClass(client);
            client.log = (type, channelId) => { return logger.log(type, channelId) };
        })();

        // init events
        client.on(Events.InteractionCreate, async interaction => {
            client.ticketEmmiter.emit("interactionCreate", interaction, client);
        });
        
        // if bot dont have administrator permission
        if( !client.guilds.cache.get(client.config.bot.guildId).members.me.permissions.has("Administrator") ){
            console.log("Please add administrator permission to prevent any issues.");
            process.exit(0);
        }

        // checking if channel existis where we sending openTicketPanel
        await client.channels.fetch(client.config.tickets.openTicketPanelChannel).catch( () => {
            console.log(
                `Channel with id ${ client.config.tickets.openTicketPanelChannel } is not definded`,
                "Edit configs\\tickets.json"
            );
            process.exit(0);
        });
        
        // channel with pannel
        var openTicketPanelChannel = client.channels.cache.get(client.config.tickets.openTicketPanelChannel);
        
        // check if channel text based(can we send messages)
        if(!openTicketPanelChannel.isTextBased()){
            console.log(
                `Channel ${ openTicketPanelChannel.name } is not text based`,
                "Edit configs\\tickets.json or channel type"
            );
            process.exit(0);
        }

        // creating panel
        var row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("ticket-list")
                .setLabel(locales(client.locales.openTicketChannel.message.openButton, client))
                .setStyle(ButtonStyle.Primary)
        );
        var embed = new EmbedBuilder()
            .setTitle(locales(client.locales.openTicketChannel.message.title, client))
            .setDescription(locales(client.locales.openTicketChannel.message.description, client))
            .setColor(parseInt(client.config.tickets.mainColor, 16));

                        
        // finding panel (if exist) in temp 
        var msg = client.temp?.embed ? (await openTicketPanelChannel.messages.fetch(client.temp.embed)) : undefined;

        // if we have messsage
        if( msg ){
            console.log(`Editing open ticket panel on channel ${openTicketPanelChannel.name}`);
            // editing
            msg.edit({
                embeds: [embed],
                components: [row]
            });
            client.openTicketPanelMessage = msg;
        } 
        else {
            console.log(`Creating open ticket panel on channel ${openTicketPanelChannel.name}`);
            // sending panel
            var msg = await openTicketPanelChannel.send({
                embeds: [embed],
                components: [row]
            }); 

            client.openTicketPanelMessage = msg;

            // if we send successfully
            if(msg){
                // we update temp variable
                console.log('updating temp.embed');
                await client.db.set("temp.embed", msg.id);
            }
        }

        /*
         SETTING STATUS
        */
        // later
    }
}