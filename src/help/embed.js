/*****************
    embed.js
    スニャイヴ
    2024/07/08
*****************/

module.exports = {
    readme: readme,
    cohere: cohere,
    voicevox: voicevox
}

const {EmbedBuilder, AttachmentBuilder,  ButtonBuilder, ButtonStyle, ActionRowBuilder} = require('discord.js');

function readme(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    
    embed.setTitle("Snyivotの使い方は\nこれを読めばばっちりなのだ");
    embed.setThumbnail("attachment://icon.png");
    embed.setFooter({text: "Discordのファイルプレビューではマークダウンが綺麗に表示されないため読みにくいです"});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("img/face/zunmon_3002.png");
    
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
    embed.setFooter({text: "わからなくても適当に試してみてください"});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("img/face/zunmon001.png");

    return {files: [attachment], embeds: [embed], ephemeral: true};
}

function voicevox(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const button = new ButtonBuilder();

    embed.setTitle("voicevoxの使い方を教えるのだ");
    embed.setURL("https://voicevox.hiroshiba.jp/");
    embed.setThumbnail("attachment://icon.png");
    embed.addFields({name: "スラッシュコマンドで読み上げの制御ができるのだ", value: "例：/voicevox"});
    embed.addFields({name: "ぼくが読み上げをしてないボイチャにいる時にコマンドを打つと、読み上げを開始するのだ", value: "すでに読み上げをしているボイチャにいる時にコマンドを打つと、読み上げを終了するのだ"});
    embed.addFields({name: "読み上げの音声を変更するオプションも存在するのだ", value: "例：/voicevox speaker ずんだもん"});
    embed.addFields({name: "キャラクターの名前を途中まで入力するとその文字が含まれてるキャラクターが選択肢にでるのだ", value: "例：/voicevox speaker ず"});
    embed.addFields({name: "キャラクターの名前を何も入力してないときは「ランダム」の選択肢が出るのだ", value: "例：/voicevox speaker "});
    embed.addFields({name: "キャラクターのスタイルを変更するオプションも存在するのだ", value: "例：/voicevox style ノーマル"});
    embed.addFields({name: "スタイルを何も入力してないときは、現在設定されているキャラクターのスタイル一覧が選択肢として出るのだ", value: "例：/voicevox style"});
    embed.addFields({name: "speakerオプションとstyleオプションは併用できるのだ", value: "例：/voicevox speaker ずんだもん style あまあま"});
    embed.addFields({name: "オプションを併用したときのstyleの選択肢は、speakerオプションに入力したキャラクターのスタイルが出るのだ", value: "例：/voicevox speaker ずんだもん style"});
    embed.addFields({name: "speakerオプションを「ランダム」にすると、styleオプションの選択肢にも「ランダム」が出るのだ", value: "例：/voicevox speaker ランダム style ランダム"});
    embed.setFooter({text: "わからなくても適当に試してみてください"});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("img/face/zunmon001.png");

    return {files: [attachment], embeds: [embed], ephemeral: true};

}


async function getButton(message){
    const homeMenu = new EmbedBuilder()
        .setTitle("呼ばれたのだ！\n何がしたいのだ？")
        .setFooter({text: "ボタンを押してください"})
        .setColor(0x00FF00);

    const button = new ButtonBuilder()
        .setCustomId("abc")
        .setStyle(ButtonStyle.Primary)
        .setLabel("test")
        .setDisabled(true);

    message.reply({embeds: [homeMenu], components: [new ActionRowBuilder().setComponents(button)]});
}