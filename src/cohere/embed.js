/*****************
    embed.js
    スニャイヴ
    2024/09/03
*****************/

module.exports = {
    invoke: invoke
}

const {EmbedBuilder} = require('discord.js');

function invoke(question, anser){
    const embed = new EmbedBuilder();

    if(question > 4000){
        question = question.substr(0, 3992) + "...<以下略>";
    }

    if(anser > 1000){
        anser = anser.substr(0, 992) + "...<以下略>";
    }
    
    embed.setTitle("Q.");
    embed.setDescription(question)
    embed.addFields({name: "A.", value: anser});
    embed.setFooter({text: "Cohere AIによる生成"});
    embed.setColor(0x00FF00);

    return {embeds: [embed], ephemeral: true};
}