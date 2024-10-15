/*****************
    cmds.js
    スニャイヴ
    2024/10/11
*****************/

const {EmbedBuilder, AttachmentBuilder} = require("discord.js");

module.exports = {
    sendCmds: sendCmds,
}

//埋め込みの作成
function createEmbed(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const buttons = new ActionRowBuilder();
    const menu_cohere = new ButtonBuilder();
    const menu_vv = new ButtonBuilder();
    const menu_zundamocchi = new ButtonBuilder();
    const menu_help = new ButtonBuilder();
    
    embed.setTitle("呼ばれたのだ！\n何がしたいのだ？");
    embed.setThumbnail("attachment://icon.png");
    embed.setFooter({text: "ボタンを押してください"});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/delight.png");

    menu_cohere.setCustomId("menu_cohere");
    menu_cohere.setStyle(ButtonStyle.Primary);
    menu_cohere.setLabel("質問");
    menu_cohere.setDisabled(false);
    
    menu_vv.setCustomId("menu_vv");
    menu_vv.setStyle(ButtonStyle.Primary);
    menu_vv.setLabel("読み上げ");
    menu_vv.setDisabled(false);

    menu_zundamocchi.setCustomId("menu_zundamocchi");
    menu_zundamocchi.setStyle(ButtonStyle.Primary);
    menu_zundamocchi.setLabel("ずんだもっち");
    menu_zundamocchi.setDisabled(true);

    menu_help.setCustomId("menu_help");
    menu_help.setStyle(ButtonStyle.Secondary);
    menu_help.setLabel("使い方");
    menu_help.setDisabled(false);

    buttons.addComponents(menu_cohere);
    buttons.addComponents(menu_vv);
    buttons.addComponents(menu_zundamocchi);
    buttons.addComponents(menu_help);

    return {files: [attachment], embeds: [embed], components: [buttons]};
}

//コマンド群の送信
async function sendCmds(interaction){
    await interaction.reply(createEmbed());
    return;
}