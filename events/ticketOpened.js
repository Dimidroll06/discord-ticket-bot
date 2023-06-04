const {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const locales = require('../utils/locales');

module.exports = {
  event: 'ticketOpened',

  async execute(interaction, client, channel, ticket) {
    // creating embed in channel
    const ticketOpenedEmbed = new EmbedBuilder()
      .setColor(parseInt(ticket.type.color ?? client.config.tickets.mainColor, 16))
      .setTitle(
        locales(client.locales.openedTicket.embed.title, client, interaction, ticket),
      )
      .setDescription(
        locales(ticket.type.embedDescription ?? client.locales.openedTicket.embed.description, client, interaction, ticket),
      );

    // if ticket type has image - set thumbnail
    if (ticket.type.image) ticketOpenedEmbed.setThumbnail(ticket.type.image);

    const row = new ActionRowBuilder();

    // claim button
    row.addComponents(new ButtonBuilder()
      .setCustomId('claimTicket')
      .setLabel(client.locales.openedTicket.claimButton)
      .setEmoji(client.locales.openedTicket.claimEmoji)
      .setStyle(ButtonStyle.Success));

    // close button
    row.addComponents(new ButtonBuilder()
      .setCustomId(client.config.tickets.askCloseReason ? 'askClose' : 'closeTicket')
      .setLabel(client.locales.openedTicket.closeButton)
      .setEmoji(client.locales.openedTicket.closeEmoji)
      .setStyle(ButtonStyle.Danger));

    // creating set of roles to ping (to avoid repeating)
    const rolesToPing = Array.from(new Set([...client.config.tickets.rolesWhoHaveAccessToTheTickets, ...ticket.type.rolesHaveAccess]));
    // sending message and buttons
    const message = await channel.send({
      content: `<@${interaction.user.id}>\n${client.config.tickets.pingRolesWhenOpened ? rolesToPing.map((key) => `<@&${key}>`).join(', ') : ''}`,
      embeds: [ticketOpenedEmbed],
      components: [row],
    });

    client.db.set(`ticket_${channel.id}.messageId`, message.id);
  },

};
