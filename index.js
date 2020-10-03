const Discord = require("discord.js");
const fetch = require('node-fetch')
const QuickChart = require('quickchart-js')
let houranalytics = []
const bot = new Discord.Client();
const token = require('./token.json').token
setInterval(async function () {
    let worlds = await (await fetch('https://api.prodigygame.com/multiplayer-api/worlds')).json()
    let playerCounts = []

    for (i = 0; i < worlds.length; i++) {
        playerCounts.push(worlds[i].count)
    }
    var today = new Date();

    var hour = today.getHours()
    let hourstats = [hour + ':00', playerCounts.reduce((a, b) => a + b)]
    houranalytics.push(hourstats)
}, 3600000)
bot.on('ready', () => {
    console.log('Online');
    bot.user.setActivity('p:traffic', {
        type: 'PLAYING'
    }).catch(console.error);

})
bot.on('message', async message => {
    if (houranalytics.length > 12) {
        houranalytics.length = 12
    }
    let args = message.content.split(' ')
    switch (args[0]) {
        case 'p:traffic':
            let worlds = await (await fetch('https://api.prodigygame.com/multiplayer-api/worlds')).json()
            let playerCounts = []

            for (i = 0; i < worlds.length; i++) {
                playerCounts.push(worlds[i].count)
            }
            const trafficEmb = new Discord.MessageEmbed()
                .setTitle('Here is the current Prodigy traffic.')
                .setDescription(`Currently **${playerCounts.reduce((a, b) => a + b)}** users are on in **${worlds.length}** different worlds.`)
                .setTimestamp()
                .setFooter(`Requested by ${message.author.tag}.`)
            message.channel.send(trafficEmb)
            break;
        case 'p:ping':
            message.channel.send(new Discord.MessageEmbed().setTitle('Pong! Latency is ' + '`' + Math.round(bot.ws.ping) + ' ms' + '`'))
            break;
        case 'p:daily':
            if (houranalytics.length < 12) {
                message.channel.send(new Discord.MessageEmbed().setTitle(`Not enough data yet. :(`))
            } else {

                const trafficDaily = new QuickChart();
                const timestamps = []
                for (let i = 0; i < houranalytics.length; i++) {
                    timestamps.push(houranalytics[i][0])
                }
                const traffic = []
                for (let i = 0; i < houranalytics.length; i++) {
                    traffic.push(houranalytics[i][1])
                }
                trafficDaily
                    .setConfig({
                        type: 'line',
                        data: { labels: timestamps, datasets: [{ label: 'Traffic', data: traffic }] },
                    })
                    .setWidth(800)
                    .setHeight(400)
                    .setBackgroundColor('transparent');

                const dailyEmb = new Discord.MessageEmbed()
                dailyEmb.setTitle('Here is the traffic over the last 12 hours.')
                dailyEmb.setImage(trafficDaily.getUrl())
                message.channel.send(dailyEmb)
            }
            break;
        case 'p:eval':
            args.shift()

            if (message.author.id !== '683792601219989601') return;
            try {
                function clean(text) {
                    if (typeof (text) === "string")
                        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
                    else
                        return text;
                }
                const code = args.join(" ");
                let evaled = eval(code);

                if (typeof evaled !== "string")
                    evaled = require("util").inspect(evaled);

                message.channel.send(clean(evaled), { code: "js" });
            } catch (err) {
                message.channel.send(` \`\`\`js\n${clean(err)}\n\`\`\``);
            }
            break;
        case 'p:avg':
            let avgworlds = await (await fetch('https://api.prodigygame.com/multiplayer-api/worlds')).json()
            let avgplayerCounts = []

            for (i = 0; i < avgworlds.length; i++) {
                avgplayerCounts.push(avgworlds[i].count)
            }
            const avgemb = new Discord.MessageEmbed()
                .setTitle('Here is the average Prodigy traffic per world.')
                .setDescription(`Currently an average of **${avgplayerCounts.reduce((a, b) => a + b) / avgworlds.length}** users are on per world out of **${avgworlds.length}** different worlds.`)
                .setTimestamp()
                .setFooter(`Requested by ${message.author.tag}.`)
            message.channel.send(avgemb)
            break;
        case 'p:popular':
            let popularworlds = await (await fetch('https://api.prodigygame.com/multiplayer-api/worlds')).json()
            let popularplayerCounts = []

            for (i = 0; i < popularworlds.length; i++) {
                popularplayerCounts.push(popularworlds[i].count)
            }
            function findbiggest() {
                let max = popularplayerCounts.reduce(function (a, b) {
                    return Math.max(a, b);
                })
                return max;
            };
            let fourmax = []
            fourmax.push(popularworlds[popularplayerCounts.indexOf(findbiggest())])
            popularplayerCounts[popularplayerCounts.indexOf(findbiggest())] = 0
            fourmax.push(popularworlds[popularplayerCounts.indexOf(findbiggest())])
            popularplayerCounts[popularplayerCounts.indexOf(findbiggest())] = 0
            fourmax.push(popularworlds[popularplayerCounts.indexOf(findbiggest())])
            popularplayerCounts[popularplayerCounts.indexOf(findbiggest())] = 0
            fourmax.push(popularworlds[popularplayerCounts.indexOf(findbiggest())])
            popularplayerCounts[popularplayerCounts.indexOf(findbiggest())] = 0
            let first = fourmax[0]
            let second = fourmax[1]
            let third = fourmax[2]
            let fourth = fourmax[3]
            const popularembed = new Discord.MessageEmbed()
            .setTitle('Here are the current most popular Prodigy worlds.')
            .setDescription('This lists the four worlds that most people are in.')
            .addField(':first_place: First:',`${first.name}, with a count of ${first.count} people online.`)
            .addField(':second_place: Second:',`${second.name}, with a count of ${second.count} people online.`)
            .addField(':third_place: Third:',`${third.name}, with a count of ${third.count} people online.`)
            .addField(':medal: Fourth:',`${fourth.name}, with a count of ${fourth.count} people online.`)
            message.channel.send(popularembed)
            break;
            case 'p:unpopular':
                let unpopularworlds = await (await fetch('https://api.prodigygame.com/multiplayer-api/worlds')).json()
            let unpopularplayerCounts = []

            for (i = 0; i < unpopularworlds.length; i++) {
                unpopularplayerCounts.push(unpopularworlds[i].count)
            }
            function findsmallest() {
                let min = unpopularplayerCounts.reduce(function (a, b) {
                    return Math.min(a, b);
                })
                return min;
            };
            let fourmin = []
            fourmin.push(unpopularworlds[unpopularplayerCounts.indexOf(findsmallest())])
            unpopularplayerCounts[unpopularplayerCounts.indexOf(findsmallest())] = Infinity
            fourmin.push(unpopularworlds[unpopularplayerCounts.indexOf(findsmallest())])
            unpopularplayerCounts[unpopularplayerCounts.indexOf(findsmallest())] = Infinity
            fourmin.push(unpopularworlds[unpopularplayerCounts.indexOf(findsmallest())])
            unpopularplayerCounts[unpopularplayerCounts.indexOf(findsmallest())] = Infinity
            fourmin.push(unpopularworlds[unpopularplayerCounts.indexOf(findsmallest())])
            unpopularplayerCounts[unpopularplayerCounts.indexOf(findsmallest())] = Infinity
            let minfirst = fourmin[0]
            let minsecond = fourmin[1]
            let minthird = fourmin[2]
            let minfourth = fourmin[3]
            const unpopularembed = new Discord.MessageEmbed()
            .setTitle('Here are the current least popular Prodigy worlds.')
            .setDescription('This lists the four worlds that the least people are in.')
            .addField('<:downvote:690303949475152004> First:',`${minfirst.name}, with a count of ${minfirst.count} people online.`)
            .addField(':arrow_down_small: Second:',`${minsecond.name}, with a count of ${minsecond.count} people online.`)
            .addField(':arrow_down: Third:',`${minthird.name}, with a count of ${minthird.count} people online.`)
            .addField(':arrow_double_down: Fourth:',`${minfourth.name}, with a count of ${minfourth.count} people online.`)
            message.channel.send(unpopularembed)
            break;
        }
})
bot.login(token)
