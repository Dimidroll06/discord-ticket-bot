/**
 *
 * @param {Text} text
 * @param {import("discord.js").Client} client
 * @param {import("discord.js").Interaction} interaction
 * @returns
 */
module.exports = (text, client, interaction, ticket) => text
  .replace('USERNAME', interaction?.user?.username)
  .replace('USERID', interaction?.user?.id)
  .replace('USER', `<@${interaction?.user?.id}>`)
  .replace('TICKETCHANNEL', `<#${interaction?.channel?.id}>`)
  .replace('TICKETNAME', ticket?.type?.name)
  .replace('TICKETLIMIT', client?.config?.tickets?.maxTicketOpened)
  .replace('TICKETCOUNT', ticket?.id + 1)
  .replace('QUESTION1', ticket?.questions ? ticket.questions[0] : 'x')
  .replace('QUESTION2', ticket?.questions ? ticket.questions[1] : 'x')
  .replace('QUESTION3', ticket?.questions ? ticket.questions[2] : 'x')
  .replace('QUESTION4', ticket?.questions ? ticket.questions[3] : 'x')
  .replace('QUESTION5', ticket?.questions ? ticket.questions[4] : 'x')
  .replace('QUESTION6', ticket?.questions ? ticket.questions[5] : 'x')
  .replace('QUESTION7', ticket?.questions ? ticket.questions[6] : 'x')
  .replace('QUESTION8', ticket?.questions ? ticket.questions[7] : 'x')
  .replace('QUESTION9', ticket?.questions ? ticket.questions[8] : 'x');
