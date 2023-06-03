var { Interaction, Client } = require('discord.js')
var tickets = require('../controllers/tickets')

module.exports = {
    event: "ticketSelect",

    /**
     * 
     * @param {Interaction} interaction 
     * @param {Client} client 
     */
    async execute(interaction, client){
        if (!interaction.isStringSelectMenu()) return;

        // get ticket code and ticket type
        var ticketCode = interaction.values[0];
        var ticketType = client.config.tickets.ticketTypes.find(type=> type.codeName == ticketCode );

        // ask questions if have
        if (ticketType.askQuestions) return tickets.askQuestions(
                interaction, 
                client, 
                ticketType
            );
        // else - create ticket
        tickets.create(interaction, client, ticketType);
    }
}