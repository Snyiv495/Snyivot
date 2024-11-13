/*****************
    help.js
    スニャイヴ
    2024/11/12
*****************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, AttachmentBuilder} = require('discord.js');
const cui = require('../cui');

//埋め込みの作成
function createEmbed(content){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    switch(content){
        case "question" : {
            embed.setTitle("cohere AIの使い方を教えるのだ");
            embed.setURL("https://cohere.com/");
            embed.setThumbnail("attachment://icon.png");
            embed.addFields({name: "1️⃣ ぼくにメンションしながら質問をしてくれたら答えるのだ", value: "例：@Snyivot 読み上げの始め方を教えて"});
            embed.addFields({name: "2️⃣ コマンドの送信で、他の人に見えないように質問を送信できるのだ", value: "コマンド：/cohere content 好きな人への告白文を考えて"});
            embed.setFooter({text: "出力は最大1000文字なのだ"});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
            attachment.setFile("assets/zundamon/icon/flaunt.png");
            break;
        }
        default : break;
    }

    return {content: "", files: [attachment], embeds: [embed], ephemeral: true};
}

//ヘルプの送信
async function execute(interaction, options){
    let progress = null;
    
    progress = await cui.createProgressbar(interaction, 1);
    progress = await cui.stepProgressbar(progress);
    
    await interaction.editReply(createEmbed(options.content));

    return 0;
}