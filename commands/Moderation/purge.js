// Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.
const { Command } = require('klasa');

module.exports = class extends Command {

  constructor(...args) {
    super(...args, {
      permissionLevel: 5,
      requiredPermissions: ['MANAGE_MESSAGES'],
      runIn: ['text'],
      description: 'Purges a certain amount of messages between 1 and 100.',
      extendedHelp: '!purge <amount> [optional: link (website links) | invite (discord invites) | bots (any bot) | you (the bot) | me (yourself) | upload (attachments) | user (usertag | userid)',
      usage: '<limit:integer> [link|invite|bots|you|me|upload|user:user]',
      usageDelim: ' '
    });
  }

  async run(msg, [limit, filter = null]) {
    let messages = await msg.channel.messages.fetch({ limit: 100 });
    if (filter) {
      const user = typeof filter !== 'string' ? filter : null;
      const type = typeof filter === 'string' ? filter : 'user';
      messages = messages.filter(this.getFilter(msg, type, user));
    }
    messages = messages.array().slice(0, limit);
    await msg.channel.bulkDelete(messages);
    return msg.sendMessage(`Successfully deleted ${messages.length} messages from ${limit}.`);
  }

  getFilter(msg, filter, user) {
    switch (filter) {
      case 'link': return mes => /https?:\/\/[^ /.]+\.[^ /.]+/.test(mes.content);
      case 'invite': return mes => /(https?:\/\/)?(www\.)?(discord\.(gg|li|me|io)|discordapp\.com\/invite)\/.+/.test(mes.content);
      case 'bots': return mes => mes.author.bot;
      case 'you': return mes => mes.author.id === this.client.user.id;
      case 'me': return mes => mes.author.id === msg.author.id;
      case 'upload': return mes => mes.attachments.size > 0;
      case 'user': return mes => mes.author.id === user.id;
      default: return () => true;
    }
  }

};
