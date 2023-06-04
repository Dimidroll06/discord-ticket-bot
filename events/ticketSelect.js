const tickets = require('../controllers/tickets');

module.exports = {
  event: 'ticketSelect',

  async execute(interaction, client) {
    if (!interaction.isStringSelectMenu()) return;

    // get ticket code and ticket type
    const ticketCode = interaction.values[0];
    const ticketType = client.config.tickets.ticketTypes.find((type) => type.codeName == ticketCode);

    // ask questions if have
    if (ticketType.askQuestions) {
      tickets.askQuestions(
        interaction,
        client,
        ticketType,
      );
    // else - create ticket
    } else tickets.create(interaction, client, ticketType);
  },
};
