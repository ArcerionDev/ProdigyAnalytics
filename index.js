const Discord = require("discord.js");
const fetch = require('node-fetch')
const bot = new Discord.Client();
const token = require('./token.json').token
bot.on('ready', () => {
    console.log('Online');
    bot.user.setActivity('p:traffic', {
        type: 'PLAYING'
    }).catch(console.error);

})
bot.on('message', async message => {
    let args = message.content.split(' ')
    if(args[0] === 'p:traffic'){
        let worlds = await (await fetch('https://api.prodigygame.com/multiplayer-api/worlds')).json()
let playerCounts = []

for(i = 0; i < worlds .length; i++){
  playerCounts.push(worlds [i].count)
}
const trafficEmb = new Discord.MessageEmbed()
.setTitle('Here is the current Prodigy traffic.')
.setDescription(`Currently **${playerCounts.reduce((a, b) => a + b)}** users are on in **${worlds.length}** different worlds.`)
.setTimestamp()
.setFooter(`Requested by ${message.author.tag}.`)
message.channel.send(trafficEmb)
}else{if(args[0] === 'p:ping'){
    message.channel.send(new Discord.MessageEmbed().setTitle('Pong! Latency is `'+Math.round(bot.ws.ping) + ' ms'+'`'))
}}
})
bot.login(token)