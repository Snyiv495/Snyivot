/*****************
    embed.js
    スニャイヴ
    2024/05/23
*****************/

module.exports = {
    invoke: invoke
}

const {EmbedBuilder, AttachmentBuilder} = require('discord.js');

function invoke(resTxt){
    const embed = new EmbedBuilder();
    
    embed.setTitle("A.");
    embed.addFields({name: resTxt.substr(0, 256), value: "\n"});
    embed.setFooter({text: "Cohere AIによる生成"});
    embed.setColor(0x00FF00);

    return {embeds: [embed]};
}