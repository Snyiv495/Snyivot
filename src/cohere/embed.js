/*****************
    embed.js
    スニャイヴ
    2024/05/23
*****************/

module.exports = {
    invoke: invoke
}

const {EmbedBuilder, AttachmentBuilder} = require('discord.js');

function invoke(rep, opt){
    const embed = new EmbedBuilder();
    
    switch(opt){
        case 0:{
            embed.setTitle("🤖");
            embed.addFields({name: rep.substr(0, 256), value: "~~知らんけど~~"});
            embed.setFooter({text: "Cohere"});
            embed.setColor(0x00FF00);
            break;
        }
        case 1:{
            embed.setTitle("呼ばれた気がしました🫡");
            embed.setFooter({text: "聞きたいことがあれば聞いてください"});
            embed.setColor(0x00FF00);
            break;
        }
        default: embed.setTitle("undefined").setColor(0x000000);
    }

    return {embeds: [embed]};
}