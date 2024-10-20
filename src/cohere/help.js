/*****************
    help.js
    スニャイヴ
    2024/10/18
*****************/

module.exports = {
    getCmd: getCmd,
    sendHelp: sendHelp,
}

require('dotenv').config();
const {SlashCommandBuilder, EmbedBuilder, AttachmentBuilder} = require('discord.js');
const cui = require('../cui');

//コマンドの取得
function getCmd(){
    const help = new SlashCommandBuilder();

    help.setName("cohere_help");
    help.setDescription("AI質問のヘルプコマンド");
    
    return help;
}

//埋め込みの作成
function createEmbed(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    embed.setTitle("cohere AIの使い方を教えるのだ");
    embed.setURL("https://cohere.com/");
    embed.setThumbnail("attachment://icon.png");
    embed.addFields({name: "1️⃣ ぼくにメンションしながら質問をしてくれたら答えるのだ", value: "例：@Snyivot 読み上げの始め方を教えて"});
    embed.addFields({name: "2️⃣ コマンドの送信で、質問フォームから内緒で質問を送信できるのだ", value: "コマンド：/cohere"});
    embed.setFooter({text: "出力は最大1000文字です"});
    embed.setColor(0x00FF00);

    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/flaunt.png");

    return {content: "", files: [attachment], embeds: [embed], ephemeral: true};
}

//ヘルプの送信
async function sendHelp(interaction){
    let progress = await cui.createProgressbar(interaction, 1);
    progress = await cui.stepProgress(interaction, progress);
    
    await interaction.editReply(createEmbed());

    return;
}