const { Client, EmbedBuilder } = require("discord.js")

module.exports = class Logger {
    /**
     * @param {Client} client 
     */
    constructor(client){
        this.channelId = client.config.bot.logger.logChannelId;
        this.enabled = !!this.channelId;

        console.log(this.enabled ? 'Logger enabled' : 'Logger disabled')

        this.client = client;
        this.l = client.locales.logger

        this.init();
    }

    async init(){
        if ( !this.enabled ) return;

        // initializing channel
        this.channel = await this.client.channels.fetch(this.channelId)

        // if there no channels 
        if(!this.channel){
            // then disable logger
            this.enabled = false;
            console.log('Channel for logger is undefinded');
            return;
        }

        // check is channel text based
        if(!this.channel.isTextBased()){
            // if not then disable logger
            this.enabled = false;
            console.log('Logger channel is not text based');
            return;
        }
            
        // get webhooks
        this.webhooks = await this.channel.fetchWebhooks();
        // if there are no any webhooks
        if ( this.webhooks.size == 0 ){
            // creating new one
            await this.channel.createWebhook({ name: "Ticket bot logger" });
            this.webhooks = await this.channel.fetchWebhooks();
        };

        // initializing webhook
        this.webhook = this.webhooks.find(w => w.token);

        return;
    }

    /**
     * 
     * @param {'ticket_open'|'ticket_claimed'|'ticket_closed'} type 
     * @param {*} channelId 
     * @returns 
     */
    async log(type, channelId){
        var db = this.client.db;
        let ticket = await db.get(`ticket_${channelId}`);
        if ( !this.enabled ) return;
        
        if (ticket.creator) ticket.creator = this.client.users.cache.get(ticket.creator);
        if (ticket.claimedBy) ticket.claimedBy = this.client.users.cache.get(ticket.claimedBy);
        if (ticket.closedBy) ticket.closedBy = this.client.users.cache.get(ticket.closedBy);

        let embed = new EmbedBuilder();

        if( type == 'ticket_open' ){
            embed
                .setColor(parseInt( this.client.config.bot.logger.mainColor, 16 ))
                .setAuthor({
                    'name': this.l.ticket_open.author.name,
                    'iconURL': this.l.ticket_open.author.avatarURL
                })
                .setDescription( this.l.ticket_open.description
                    .replace('CREATOR', `<@${ticket?.creator.id}>`) 
                    .replace('TICKETID', ticket?.id)
                    .replace('TICKETCOUNT', ticket?.id + 1)
                    .replace('CHANNEL', `<#${ticket?.channelId}>`)
                    .replace('QUESTIONS', ticket?.questions ? ticket?.questions?.join(' \n') : ticket?.questions)
                    .replace('DURATION', (new Date(ticket?.createdAt - ticket?.createdAt)).toUTCString().split(' ')[4])
                )
        }

        else if( type == 'ticket_claimed' ){
            embed
                .setColor(parseInt( this.client.config.bot.logger.mainColor, 16 ))
                .setAuthor({
                    'name': this.l.ticket_claimed.author.name,
                    'iconURL': this.l.ticket_claimed.author.avatarURL
                })
                .setDescription( this.l.ticket_claimed.description
                    .replace('CREATOR', `<@${ticket?.creator?.id}>`) 
                    .replace('CLAIMEDBY', `<@${ticket?.claimedBy?.id}>`)
                    .replace('TICKETID', ticket?.id)
                    .replace('TICKETCOUNT', ticket?.id + 1)
                    .replace('CHANNEL', `<#${ticket?.channelId}>`)
                    .replace('QUESTIONS', ticket?.questions ? ticket?.questions?.join(' \n') : ticket?.questions)
                    .replace('DURATION', (new Date(ticket?.claimedAt - ticket?.createdAt)).toUTCString().split(' ')[4])
                )
        }

        else if( type == 'ticket_closed' ){
            embed
                .setColor(parseInt( this.client.config.bot.logger.mainColor, 16 ))
                .setAuthor({
                    'name': this.l.ticket_closed.author.name,
                    'iconURL': this.l.ticket_closed.author.avatarURL
                })
                .setDescription( this.l.ticket_closed.description
                    .replace('CREATOR', `<@${ticket?.creator?.id}>`) 
                    .replace('CLAIMEDBY', `<@${ticket?.claimedBy?.id}>`)
                    .replace('CLOSEDBY', `<@${ticket?.closedBy?.id}>`)
                    .replace('TICKETID', ticket?.id)
                    .replace('TICKETCOUNT', ticket?.id + 1)
                    .replace('CHANNEL', `<#${ticket?.channelId}>`)
                    .replace('QUESTIONS', ticket?.questions ? ticket?.questions?.join(' \n') : ticket?.questions)
                    .replace('REASON', ticket?.closeReason)
                    .replace('DURATION', (new Date(ticket?.closedAt - ticket?.createdAt)).toUTCString().split(' ')[4])
                )
        }

        else { return console.log(`Logger:\n '${type}' is undefinded type `) }

        this.webhook.send({
            username: this.l[type].author.name,
            avatarURL: this.l[type].author.avatarURL,
            embeds: [embed]
        }).catch((e) => console.log(e));
    }
}