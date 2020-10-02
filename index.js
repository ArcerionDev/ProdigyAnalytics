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
setInterval(function(){
    while (houranalytics > 12) {
        houranalytics.pop()
    }
},)
bot.on('ready', () => {
    console.log('Online');
    bot.user.setActivity('p:traffic', {
        type: 'PLAYING'
    }).catch(console.error);

})
bot.on('message', async message => {
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
    }
})
bot.login(token)
