/*****************
    embed.js
    スニャイヴ
    2024/07/22
*****************/

module.exports = {
    invoke: invoke
}

const {EmbedBuilder} = require('discord.js');

function invoke(resTxt){
    const embed = new EmbedBuilder();
    
    embed.setTitle("A.");
    embed.addFields({name: resTxt.substr(0, 256), value: "\n"});
    embed.setFooter({text: "Cohere AIによる生成"});
    embed.setColor(0x00FF00);

    return {embeds: [embed]};
}