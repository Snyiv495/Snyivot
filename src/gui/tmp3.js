/*****************
    embed.js
    スニャイヴ
    2024/10/07
*****************/

module.exports = {
    menu_mention: menu_mention,
    menu_vv: menu_vv,
    menu_help: menu_help,
    menu_help_vv01: menu_help_vv01,
    menu_help_vv02: menu_help_vv02,
    help_readme: help_readme,
    help_cohere: help_cohere,
    help_vv_start: help_vv_start,
    help_vv_end: help_vv_end,
    help_vv_setUser: help_vv_setUser,
    help_vv_setServer: help_vv_setServer,
    help_vv_dictAdd: help_vv_dictAdd,
    help_vv_dictDel: help_vv_dictDel,
}

const {EmbedBuilder, AttachmentBuilder,  ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');

function menu_mention(){
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

function menu_vv(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const buttons = new ActionRowBuilder();
    const start_vv = new ButtonBuilder();
    const end_vv = new ButtonBuilder();
    const endAll_vv = new ButtonBuilder();

    embed.setTitle("読み上げの開始か終了をするのだ？")
    embed.setThumbnail("attachment://icon.png")
    embed.setFooter({text: "ボタンを押してください"})
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/delight.png");
    
    start_vv.setCustomId("start_vv");
    start_vv.setStyle(ButtonStyle.Primary);
    start_vv.setLabel("開始");
    start_vv.setDisabled(false);

    end_vv.setCustomId("end_vv");
    end_vv.setStyle(ButtonStyle.Danger);
    end_vv.setLabel("終了");
    end_vv.setDisabled(false);

    endAll_vv.setCustomId("endAll_vv");
    endAll_vv.setStyle(ButtonStyle.Danger);
    endAll_vv.setLabel("全体終了");
    endAll_vv.setDisabled(false);

    buttons.addComponents(start_vv);
    buttons.addComponents(end_vv);
    buttons.addComponents(endAll_vv);

    return {files: [attachment], embeds: [embed], components: [buttons], ephemeral: true};
}

function menu_help(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const buttons = new ActionRowBuilder();
    const help_cohere = new ButtonBuilder();
    const menu_help_vv01 = new ButtonBuilder();
    const menu_help_zundamocchi01 = new ButtonBuilder();
    const help_readme = new ButtonBuilder();

    embed.setTitle("何について知りたいのだ？")
    embed.setThumbnail("attachment://icon.png")
    embed.setFooter({text: "ボタンを押してください"})
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/delight.png");

    
    help_cohere.setCustomId("help_cohere");
    help_cohere.setStyle(ButtonStyle.Primary);
    help_cohere.setLabel("質問");
    help_cohere.setDisabled(false);

    menu_help_vv01.setCustomId("menu_help_vv01");
    menu_help_vv01.setStyle(ButtonStyle.Primary);
    menu_help_vv01.setLabel("読み上げ");
    menu_help_vv01.setDisabled(false);

    menu_help_zundamocchi01.setCustomId("menu_help_zundamocchi01");
    menu_help_zundamocchi01.setStyle(ButtonStyle.Primary);
    menu_help_zundamocchi01.setLabel("ずんだもっち");
    menu_help_zundamocchi01.setDisabled(true);

    help_readme.setCustomId("help_readme");
    help_readme.setStyle(ButtonStyle.Secondary);
    help_readme.setLabel("Snyivot");
    help_readme.setDisabled(false);

    buttons.addComponents(help_cohere);
    buttons.addComponents(menu_help_vv01);
    buttons.addComponents(menu_help_zundamocchi01);
    buttons.addComponents(help_readme);

    return {files: [attachment], embeds: [embed], components: [buttons], ephemeral: true};
}

function menu_help_vv01(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const buttons = new ActionRowBuilder();
    const help_vv_start = new ButtonBuilder();
    const help_vv_end = new ButtonBuilder();
    const help_vv_setUser = new ButtonBuilder();
    const help_vv_setServer = new ButtonBuilder();
    const menu_help_vv02 = new ButtonBuilder();

    embed.setTitle("何について知りたいのだ？")
    embed.setThumbnail("attachment://icon.png")
    embed.setFooter({text: "ボタンを押してください"})
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/delight.png");

    help_vv_start.setCustomId("help_vv_start");
    help_vv_start.setStyle(ButtonStyle.Primary);
    help_vv_start.setLabel("開始");
    help_vv_start.setDisabled(false);

    help_vv_end.setCustomId("help_vv_end");
    help_vv_end.setStyle(ButtonStyle.Primary);
    help_vv_end.setLabel("終了");
    help_vv_end.setDisabled(false);

    help_vv_setUser.setCustomId("help_vv_setUser");
    help_vv_setUser.setStyle(ButtonStyle.Success);
    help_vv_setUser.setLabel("ユーザー設定");
    help_vv_setUser.setDisabled(false);

    help_vv_setServer.setCustomId("help_vv_setServer");
    help_vv_setServer.setStyle(ButtonStyle.Success);
    help_vv_setServer.setLabel("サーバー設定");
    help_vv_setServer.setDisabled(false);

    menu_help_vv02.setCustomId("menu_help_vv02");
    menu_help_vv02.setStyle(ButtonStyle.Secondary);
    menu_help_vv02.setLabel("次へ");
    menu_help_vv02.setDisabled(false);


    buttons.addComponents(help_vv_start);
    buttons.addComponents(help_vv_end);
    buttons.addComponents(help_vv_setUser);
    buttons.addComponents(help_vv_setServer);
    buttons.addComponents(menu_help_vv02);

    return {files: [attachment], embeds: [embed], components: [buttons], ephemeral: true};
}

function menu_help_vv02(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const buttons = new ActionRowBuilder();
    const menu_help_vv01 = new ButtonBuilder();
    const help_vv_dictAdd = new ButtonBuilder();
    const help_vv_dictDel = new ButtonBuilder();

    embed.setTitle("何について知りたいのだ？")
    embed.setThumbnail("attachment://icon.png")
    embed.setFooter({text: "ボタンを押してください"})
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/delight.png");

    menu_help_vv01.setCustomId("menu_help_vv01");
    menu_help_vv01.setStyle(ButtonStyle.Secondary);
    menu_help_vv01.setLabel("前へ");
    menu_help_vv01.setDisabled(false);

    help_vv_dictAdd.setCustomId("help_vv_dictAdd");
    help_vv_dictAdd.setStyle(ButtonStyle.Success);
    help_vv_dictAdd.setLabel("辞書追加");
    help_vv_dictAdd.setDisabled(false);

    help_vv_dictDel.setCustomId("help_vv_dictDel");
    help_vv_dictDel.setStyle(ButtonStyle.Success);
    help_vv_dictDel.setLabel("辞書削除");
    help_vv_dictDel.setDisabled(false);

    buttons.addComponents(menu_help_vv01);
    buttons.addComponents(help_vv_dictAdd);
    buttons.addComponents(help_vv_dictDel);

    return {files: [attachment], embeds: [embed], components: [buttons], ephemeral: true};
}

function help_readme(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    
    embed.setTitle("Snyivotの使い方は\nこれを読めばばっちりなのだ");
    embed.setURL("https://github.com/Snyiv495/Snyivot");
    embed.setThumbnail("attachment://icon.png");
    embed.setFooter({text: "プレビューでは読みにくいのでリンクから飛んでください"});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/delight.png");
    
    return {files: ["./README.md", attachment], embeds: [embed], ephemeral: true};
}

function help_vv_dictDel(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    

    return {files: [attachment], embeds: [embed], ephemeral: true};
}