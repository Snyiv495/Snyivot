/*****************
    embed.js
    スニャイヴ
    2024/08/26
*****************/

module.exports = {
    readme: readme,
    cohere: cohere,
    voicevox: voicevox,
    menu_home: menu_home,
    menu_voicevox: menu_voicevox,
    menu_help: menu_help,
}

const {EmbedBuilder, AttachmentBuilder,  ButtonBuilder, ButtonStyle, ActionRowBuilder} = require('discord.js');

function readme(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    
    embed.setTitle("Snyivotの使い方は\nこれを読めばばっちりなのだ");
    embed.setURL("https://github.com/Snyiv495/Snyivot");
    embed.setThumbnail("attachment://icon.png");
    embed.setFooter({text: "プレビューでは読みにくいのでリンクから飛んでください"});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/happy.png");
    
    return {files: ["./README.md", attachment], embeds: [embed], ephemeral: true};
}

function cohere(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    embed.setTitle("cohereの使い方を教えるのだ");
    embed.setURL("https://cohere.com/");
    embed.setThumbnail("attachment://icon.png");
    embed.addFields({name: "ぼくにメンションしながら質問をしてくれたら答えるのだ", value: "例：@Snyivot チャットの読み上げを開始する方法を教えて"});
    embed.addFields({name: "使い方以外の質問も大歓迎なのだ", value: "例：@Snyivot ダジャレを言ってみて"});
    embed.setFooter({text: "出力は最大でも200文字程度です"});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/normal.png");

    return {files: [attachment], embeds: [embed], ephemeral: true};
}

function voicevox(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    embed.setTitle("voicevoxの使い方を教えるのだ");
    embed.setURL("https://voicevox.hiroshiba.jp/");
    embed.setThumbnail("attachment://icon.png");
    embed.addFields({name: "スラッシュコマンドで読み上げを開始できるのだ", value: "/voicevox"});
    embed.addFields({name: "endオプションを加えると読み上げを終了できるのだ", value: "例：/voicevox endoption end"});
    embed.addFields({name: "読み上げのユーザー情報を変更するコマンドがあるのだ", value: "例：/voicevox_setting_user speaker ずんだもん speed 1.5"});
    embed.addFields({name: "読み上げのサーバー情報を変更するコマンドがあるのだ", value: "例：/voicevox_setting_server maxwords 20"});
    embed.addFields({name: "読み方の辞書を追加するコマンドがあるのだ", value: "例：/voicevox_dictionary_add surface 摩訶不思議 pronunciation パルプンテ accent 4"});
    embed.addFields({name: "読み方の辞書を削除するコマンドがあるのだ", value: "例：/voicevox_dictionary_delete uuid xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"});
    embed.setFooter({text: "公式サイトから読み上げるキャラクター一覧を確認できます(1行目をクリック)"});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/normal.png");

    return {files: [attachment], embeds: [embed], ephemeral: true};

}

function menu_home(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const buttons = new ActionRowBuilder();
    const voicevox = new ButtonBuilder();
    const help = new ButtonBuilder();

    embed.setTitle("呼ばれたのだ！\n何がしたいのだ？")
    embed.setThumbnail("attachment://icon.png")
    embed.setFooter({text: "ボタンを押してください"})
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/dumb.png");
    
    voicevox.setCustomId("voicevox");
    voicevox.setStyle(ButtonStyle.Primary);
    voicevox.setLabel("読み上げ");
    voicevox.setDisabled(false);

    help.setCustomId("help");
    help.setStyle(ButtonStyle.Secondary);
    help.setLabel("使い方");
    help.setDisabled(false);

    buttons.addComponents(voicevox);
    buttons.addComponents(help);

    return {files: [attachment], embeds: [embed], components: [buttons]};
}

function menu_voicevox(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const buttons = new ActionRowBuilder();
    const start = new ButtonBuilder();
    const end = new ButtonBuilder();

    embed.setTitle("読み上げの開始か終了をするのだ？")
    embed.setThumbnail("attachment://icon.png")
    embed.setFooter({text: "ボタンを押してください"})
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/dumb.png");
    
    start.setCustomId("vv_start");
    start.setStyle(ButtonStyle.Primary);
    start.setLabel("開始");
    start.setDisabled(false);

    end.setCustomId("vv_end");
    end.setStyle(ButtonStyle.Primary);
    end.setLabel("修了");
    end.setDisabled(false);

    buttons.addComponents(start);
    buttons.addComponents(end);

    return {files: [attachment], embeds: [embed], components: [buttons], ephemeral: true};
}

function menu_help(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const buttons = new ActionRowBuilder();
    const cohere = new ButtonBuilder();
    const voicevox = new ButtonBuilder();
    const readme = new ButtonBuilder();

    embed.setTitle("何について知りたいのだ？")
    embed.setThumbnail("attachment://icon.png")
    embed.setFooter({text: "ボタンを押してください"})
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/dumb.png");

    
    cohere.setCustomId("help_cohere");
    cohere.setStyle(ButtonStyle.Primary);
    cohere.setLabel("会話AI");
    cohere.setDisabled(false);

    voicevox.setCustomId("help_voicevox");
    voicevox.setStyle(ButtonStyle.Primary);
    voicevox.setLabel("読み上げ");
    voicevox.setDisabled(false);

    readme.setCustomId("readme");
    readme.setStyle(ButtonStyle.Primary);
    readme.setLabel("Snyivot");
    readme.setDisabled(false);

    buttons.addComponents(cohere);
    buttons.addComponents(voicevox);
    buttons.addComponents(readme);

    return {files: [attachment], embeds: [embed], components: [buttons], ephemeral: true};
}