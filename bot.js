const { Client, Intents } = require('discord.js');
const path = require('path');
const fs = require('fs');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES] });

const resourcePath = global.GetResourcePath ? global.GetResourcePath(global.GetCurrentResourceName()) : global.__dirname;
require('dotenv').config({ path: path.join(resourcePath, './.env') });
const settingsjson = require(resourcePath + '/settings.js');
const statusLeaderboard = require(resourcePath + '/statusleaderboard.json');
module.exports = client;

client.path = resourcePath;
client.ip = settingsjson.settings.ip;

if (process.env.TOKEN === "" || process.env.TOKEN === "TOKEN") {
    console.log(`Error! No Token Provided. You forgot to edit the .env`);
    throw new Error('Whoops!');
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}! Players: ${GetNumPlayerIndices()}`);
    console.log(`Your Prefix Is ${process.env.PREFIX}`);
    client.user.setActivity(`${GetNumPlayerIndices()}/${GetConvarInt("sv_maxclients", 64)} players`, { type: 'WATCHING' });
    client.user.setStatus('dnd');
    init();
});

client.on("guildMemberAdd", function (member) {
    if (member.guild.id === settingsjson.settings.GuildID) {
        try {
            exports.mg.execute("SELECT * FROM `mg_verification` WHERE discord_id = ? AND verified = 1", [member.id], (result) => {
                if (result.length > 0) {
                    let role = member.guild.roles.cache.find(r => r.name === '[Verified]');
                    if (role) {
                        member.roles.add(role);
                    }
                }
            });
        } catch (error) {
            console.error(error);
        }
    }
});

let onlinePD = 0;
let onlineStaff = 0;
let onlineNHS = 0;
let serverStatus = "";
let memberCount = 0;
let currentFooterEmoji = '⚪';

setInterval(() => {
    currentFooterEmoji = currentFooterEmoji === "⚪" ? "⚫" : "⚪";
}, 300);

if (settingsjson.settings.StatusEnabled) {
    setInterval(() => {
        if (!client.guilds.cache.get(settingsjson.settings.GuildID)) {
            return console.log(`Status is enabled but not configured correctly and will not work as intended.`);
        }

        let guild = client.guilds.cache.get(settingsjson.settings.GuildID);
        memberCount = guild.memberCount;

        let channel = guild.channels.cache.find(r => r.name === settingsjson.settings.StatusChannel);
        if (!channel) {
            return console.log(`Status channel is not available / cannot be found.`);
        }

        let settingsjsons = require(resourcePath + '/params.json');
        let totalSeconds = (client.uptime / 1000) % 5000;
        client.user.setActivity(`${GetNumPlayerIndices()}/${GetConvarInt("sv_maxclients", 64)} players`, { type: 'WATCHING' });

        exports.mg.execute("SELECT * FROM `mg_users`", (result) => {
            playersSinceRelease = result.length;
        });

        exports.mg.frbot('getUsersByPermission', ['police.armoury'], function (result) {
            onlinePD = result.length || 0;
        });

        exports.mg.frbot('getUsersByPermission', ['admin.tickets'], function (result) {
            onlineStaff = result.length || 0;
        });

        exports.mg.frbot('getUsersByPermission', ['nhs.menu'], function (result) {
            onlineNHS = result.length || 0;
        });

        exports.mg.execute("SELECT * FROM mg_users WHERE banned = 1", (result) => {
            bannedPlayers = result.length;
        });

        exports.mg.getServerStatus([], function (result) {
            serverStatus = result; // Assuming result is either 'online' or 'offline'
        });

        let embedColor = serverStatus === '🛑 Offline' ? 0xff0000 : (serverStatus === '✅ Online' ? 0x00ff00 : 0x000000);

        let status = {
            color: embedColor,
            fields: [
                { name: "Server Status", value: `${serverStatus}`, inline: true },
                { name: "Average Player Ping", value: `${MathRandomised(8, 27)}ms`, inline: true },
                { name: "Ping", value: `${MathRandomised(8, 17)}ms`, inline: true },
                { name: "<:pd:1182375270850777209> Police", value: `${onlinePD}`, inline: true },
                { name: "<:nhs:1182375074221801532> NHS", value: `${onlineNHS}`, inline: true },
                { name: "<:mg:1181943547444871208> Staff", value: `${onlineStaff}`, inline: true },
                { name: "<:danny1:1151595988893585479> Players", value: `${GetNumPlayerIndices()}/${GetConvarInt("sv_maxclients", 60)}`, inline: true },
                { name: "<:discord:1151596000197234769> Members", value: `${memberCount}`, inline: true },
                { name: "How do I direct connect?", value: '``F8 -> connect 141.11.196.216``', inline: true }
            ],
            author: {
                name: "MG Server #1 Status",
                icon_url: "https://cdn.discordapp.com/attachments/1196137757219762256/1196166502106275910/FRLOGO1.png?ex=65b6a3dd&is=65a42edd&hm=f685e229e53e447d0a3ef77084732ef5723710a54a1d517d28918f060434aa2b&"
            },
            footer: {
                text: `${currentFooterEmoji} MG`
            },
            timestamp: new Date()
        };

        channel.messages.fetch(settingsjsons.messageid)
            .then(msg => {
                msg.edit({ embed: status });
            })
            .catch(err => {
                channel.send('Status Starting..').then(id => {
                    settingsjsons.messageid = id.id;
                    fs.writeFile(`${resourcePath}/params.json`, JSON.stringify(settingsjsons), function (err) { });
                });
            });
    }, 8000);
}

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

client.commands = new Discord.Collection();

const init = async () => {
    fs.readdir(resourcePath + '/commands/', (err, files) => {
        if (err) console.error(err);
        console.log(`Loading a total of ${files.length} commands.`);
        files.forEach(f => {
            let command = require(`${resourcePath}/commands/${f}`);
            client.commands.set(command.conf.name, command);
        });
        if (!statusLeaderboard['leaderboard']) {
            statusLeaderboard['leaderboard'] = {};
        } else {
            statusLeaderboard['leaderboard'] = statusLeaderboard['leaderboard'];
        }
    });
};

setInterval(function () {
    promotionDetection();
}, 60 * 1000);



function promotionDetection() {
    client.users.cache.forEach(user => {
        if ((user.presence?.status === "online" || user.presence?.status === 'dnd' || user.presence?.status === 'idle') && !user.bot) {
            if (!statusLeaderboard['leaderboard'][user.id]) {
                statusLeaderboard['leaderboard'][user.id] = 0;
            }
            if (user.presence?.activities?.some(activity => activity.state?.includes('discord.gg/frrp'))) {
                statusLeaderboard['leaderboard'][user.id] += 1;
            } else {
                delete statusLeaderboard['leaderboard'][user.id];
            }
            fs.writeFileSync(`${resourcePath}/statusleaderboard.json`, JSON.stringify(statusLeaderboard), function (err) { });
        }
    });
}



client.getPerms = function (msg) {
    let settings = settingsjson.settings;
    let levels = [
        { name: settings.Level1Perm, level: 1 },
        { name: settings.Level2Perm, level: 2 },
        { name: settings.Level3Perm, level: 3 },
        { name: settings.Level4Perm, level: 4 },
        { name: settings.Level5Perm, level: 5 },
        { name: settings.Level6Perm, level: 6 },
        { name: settings.Level7Perm, level: 7 },
        { name: settings.Level8Perm, level: 8 },
        { name: settings.Level9Perm, level: 9 },
        { name: settings.Level10Perm, level: 10 },
        { name: settings.Level10AltPerm, level: 10 },
        { name: settings.Level11Perm, level: 11 },
    ];

    let guild = client.guilds.cache.get(msg.guild.id);
    let member = guild.members.cache.get(msg.author.id);

    let level = 0;
    levels.forEach(lvl => {
        let role = guild.roles.cache.find(r => r.name === lvl.name);
        if (role && member.roles.cache.has(role.id)) {
            level = lvl.level;
        }
    });

    if (level === 0) {
        console.log(`Your permissions are not setup correctly and the bot will not function as intended.`);
    }

    return level;
};

client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    if (message.channel.name.includes('auction-')) {
        if (message.channel.name !== 'auction-room' && !message.content.startsWith(`${process.env.PREFIX}bid`) && !message.content.startsWith(`${process.env.PREFIX}auction`) && !message.content.startsWith(`${process.env.PREFIX}houseauction`) && !message.content.startsWith(`${process.env.PREFIX}embed`)) {
            message.delete();
            return;
        }
    } else if (message.channel.name.includes('verify') && !message.content.startsWith(`${process.env.PREFIX}verify `)) {
        message.delete();
        return;
    }

    let command = message.content.split(' ')[0].slice(process.env.PREFIX.length).toLowerCase();
    let params = message.content.split(' ').slice(1);
    let cmd;
    let permissions = 0;

    if (message.guild.id === settingsjson.settings.GuildID) {
        permissions = client.getPerms(message);
    }

    if (client.commands.has(command)) {
        cmd = client.commands.get(command);
    }

    if (cmd) {
        if (message.guild.id === cmd.conf.guild) {
            if (!message.channel.name.includes('verify') && cmd.conf.name === 'verify') {
                message.delete();
                message.reply('Please use <#1184282144403640390> for this command.').then(msg => {
                    setTimeout(() => msg.delete(), 5000);
                });
            } else if (!message.channel.name.includes('commands') && !message.channel.name.includes('verify') && !message.channel.name.includes('staff') && !message.member.roles.cache.has("1181754563951345735") && !message.member.roles.cache.has("1181755002226741338") && !message.member.roles.cache.has("1181754507865100330")) {
                message.delete();
                message.reply('Please use <#1189740952378687489> for this command.').then(msg => {
                    setTimeout(() => msg.delete(), 5000);
                });
            } else {
                if (permissions < cmd.conf.perm) return;
                try {
                    cmd.runcmd(exports, client, message, params, permissions);
                    if (cmd.conf.perm > 0 && params) {
                        params = params.join('\n ');
                        if (params !== '') {
                            const { Webhook, MessageBuilder } = require('discord-webhook-node');
                            const hook = new Webhook(settingsjson.settings.botLogWebhook);
                            const embed = new MessageBuilder()
                                .setTitle('Bot Command Log')
                                .addField('Command Used:', `${cmd.conf.name}`)
                                .addField('Parameters:', `${params}`)
                                .addField('Admin:', `${message.author.username} - <@${message.author.id}>`)
                                .setColor(settingsjson.settings.botColour)
                                .setFooter('MG')
                                .setTimestamp();
                            hook.send(embed);
                        }
                    }
                } catch (err) {
                    const embed = {
                        title: "Error Occurred!",
                        description: `\nAn error occurred. Contact <@1072976053456339105> about the issue:\n\n\`\`\`${err.message}\n\`\`\``,
                        color: settingsjson.settings.botColour,
                    };
                    message.channel.send({ embeds: [embed] });
                }
            }
        } else {
            if (cmd.conf.support && message.guild.id === "1127275385751613543") {
                if (message.member.roles.cache.has("1181757495983747092")) {
                    cmd.runcmd(exports, client, message, params, permissions);
                }
            } else {
                message.reply('This command is expected to be used within another guild.').then(msg => {
                    setTimeout(() => msg.delete(), 5000);
                });
            }
        }
    }
});

function MathRandomised(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function daysBetween(dateString) {
    var d1 = new Date(dateString);
    var d2 = new Date();
    return Math.round((d2 - d1) / (1000 * 3600 * 24));
}

const { Webhook, MessageBuilder } = require('discord-webhook-node');

exports('dmUser', (source, args) => {
    let discordid = args[0].trim();
    let verifycode = args[1].toUpperCase();
    let permid = args[2];
    const guild = client.guilds.cache.get(settingsjson.settings.GuildID);
    const member = guild.members.cache.get(discordid);

    const embed = {
        title: `Discord Account Link Request`,
        description: `User ID ${permid} has requested to link this Discord account.\n\nThe code to link is **${verifycode}**\nThis code will expire in 5 minutes.\n\nIf you have not requested this then you can safely ignore the message. Do **NOT** share this message or code with anyone else.`,
        color: settingsjson.settings.botColour,
    };

    member.send({ embeds: [embed] });

    const hook = new Webhook(settingsjson.settings.reverifyLogWebhook);
    const reverifyLog = new MessageBuilder()
        .setTitle('Reverify Log')
        .addField('Discord:', `${discordid} - <@${discordid}>`)
        .addField('User ID:', `${permid}`)
        .addField('Code:', `${verifycode}`)
        .setColor(settingsjson.settings.botColour)
        .setFooter('MG')
        .setTimestamp();

    hook.send(reverifyLog);
});

exports('storedm', (source, args) => {
    let discordid = args[0].trim();
    let permid = args[1];
    let message = args[2];
    const guild = client.guilds.cache.get(settingsjson.settings.GuildID);
    const member = guild.members.cache.get(discordid);

    const embed = {
        title: `MG Store Notification`,
        description: `${message}`,
        color: settingsjson.settings.botColour,
    };

    member.send({ embeds: [embed] });
});

if (!settingsjson.settings.devMode) {
    client.login(process.env.TOKEN);
}
