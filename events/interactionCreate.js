const tickets = require('../controllers/tickets');

module.exports = {
  event: 'interactionCreate',

  async execute(interaction, client) {
    const { ticketTypes } = client.config.tickets; // all ticket types
    const emmiter = client.ticketEmmiter; // custom emmiter
    // ticket type (If open ticket interaction)
    const ticketType = ticketTypes.find((v) => v.codeName == interaction.customId);

    /* DEBUG MODE */

    if (
      client.config.bot.debug_mode
            && !interaction.member.roles.cache.has(client.config.bot.debbuger_role)
    ) {
      return interaction.reply({
        content: 'Bot is currently in debug mode',
        ephemeral: true,
      });
    }

    /* DEBUG MODE END */

    // if interaction made on another server - abort
    if (interaction.guild.id !== client.config.bot.guildId) return;

    if (interaction.customId === 'ticket-list') tickets.showTicketList(interaction, client);
    else if (interaction.customId === 'ticket-select') emmiter.emit('ticketSelect', interaction, client);
    // interaction with tickets
    // if close need questions
    else if (interaction.customId === 'askClose') tickets.askClose(interaction, client);
    // if closing ticket
    else if (interaction.customId === 'closeTicket') tickets.close(interaction, client);
    // if claiming
    else if (interaction.customId === 'claimTicket') tickets.claim(interaction, client);
    // if open ticket - open ticket
    else if (ticketType) tickets.create(interaction, client, ticketType);
  },
};
