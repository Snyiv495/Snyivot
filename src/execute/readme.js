/*****************
    readme.js
    スニャイヴ
    2024/11/13
*****************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, AttachmentBuilder} = require('discord.js');
const cui = require('../cui');


//埋め込みの作成
async function createEmbed(){
    const embed = new EmbedBuilder();
    const icon = new AttachmentBuilder();
    const readme = new AttachmentBuilder();
    const files = [];

    embed.setTitle("READMEなのだ");
    embed.setThumbnail("attachment://icon.png");
    embed.setDescription("Snyivotのすべてが書いてあるのだ");
    embed.setFooter({text: "よく読んで使いこなすのだ"});
    embed.setColor(0x00FF00);        

    icon.setName("icon.png");
    icon.setFile("assets/zundamon/icon/guide.png");
    files.push(icon);

    readme.setName("README.md");
    readme.setFile("README.md");
    files.push(readme);

    return {content: "", files: files, embeds: [embed],  ephemeral: true};
}

//READMEの送信
async function execute(interaction){
    let progress = null;

    //進捗の表示
    progress = await cui.createProgressbar(interaction, 1);
    progress = await cui.stepProgressbar(progress);

    await interaction.editReply(await createEmbed());
    
    return 0;
}