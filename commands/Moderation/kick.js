const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Case = require('../../util/case');

module.exports = class extends Command {

  constructor(...args) {
    super(...args, {
      enabled: true,
      runIn: ['text'],
      requiredPermissions: ['KICK_MEMBERS'],
      guarded: true,
      permissionLevel: 0,
      description: '',
      extendedHelp: 'No extended help available.',
      usage: '<member:member> [reason:...string]',
      usageDelim: ' ',
    });
  }

  async run(msg, [member, reason]) {
    if (member.id === this.client.user.id) return 'bot not kickable';
    if (member.id === msg.author.id) return 'cant kick yourself';
    if (member.roles.highest.position >= msg.member.roles.highest.position) return 'role height';
    if (!member.kickable) return 'not kickable';
    await member.kick(reason);
    const c = await Case(this.client, msg, member.user, {
      type: 'KICK',
      reason: reason,
      duration: null,
      warnPointsAdded: warnPointDiff
    });
    this.sendEmbed(msg, member, reason, c);
  }

  async init() {}

  sendEmbed(msg, member, reason, c) {
    const logChId = msg.guild.settings.get('publicLogChannel');
    if (!logChId) return 'logchannel';
    const embed = new MessageEmbed()
      .setTitle('Member Kicked')
      .setThumbnail(member.user.avatarURL({format: 'jpg'}))
      .setColor('RED')
      .addField('Member', `${member.user.tag} (<@${member.id}>)`, true)
      .addField('Mod', msg.author.tag, true)
      .addField('Reason', reason ? reason : 'No reason.')
      .setFooter(`Case #${c.id} | ${member.id}`)
      .setTimestamp();
    this.client.channels.cache.get(logChId).send(embed);
  }
};