/*****************
    borrow.js
    スニャイヴ
    2024/01/09
*****************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder} = require('discord.js');
const db = require('../../db');
const cui = require('../../cui');

//借用埋め込み
async function borrowEmbed(user_info){
    const files = [];
    const embeds = [];
    const components = [];

    const attachment = new AttachmentBuilder();
    const embed = new EmbedBuilder();
    const buttons = new ActionRowBuilder();

    const home = new ButtonBuilder();
    const quit = new ButtonBuilder();

    embed.setTitle(`現在の貸出枚数は${user_info.coins}枚なのだ！`);
    embed.setThumbnail("attachment://icon.png");
    embed.setFooter({text: `所持金：${user_info.money}`});
    embed.setColor(0x00FF00);

    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/bunny.png");
    
    home.setLabel("ゲーム選択");
    home.setEmoji("🎮");
    home.setCustomId("game_home");
    home.setStyle(ButtonStyle.Secondary);
    buttons.addComponents(home);

    quit.setLabel("終わる");
    quit.setEmoji("⚠️");
    quit.setCustomId("quit");
    quit.setStyle(ButtonStyle.Danger);
    quit.setDisabled(false);
    buttons.addComponents(quit);
    
    files.push(attachment);
    embeds.push(embed);
    components.push(buttons);

    return {content: "", files: files, embeds: embeds, components: components, ephemeral: true};
}

//貸出の実行
async function execute(interaction, money){
    let progress = null;
    try{
        progress = await cui.createProgressbar(interaction, 3);
        progress = await cui.stepProgressbar(progress);
    }catch(e){}

    const user_info = await db.getUserInfo(interaction.user.id);
    progress = await cui.stepProgressbar(progress);
    
    if(!isNaN(money)){
        const coins = Math.min(Math.max(0, (money - money%3)/3), (user_info.money - user_info.money%3)/3);
        user_info.money -= coins * 3;
        user_info.coins += coins;
        await db.setUserInfo(interaction.user.id, user_info);
    }

    progress = await cui.stepProgressbar(progress);
    await interaction.editReply(await borrowEmbed(user_info));

    return 0;
}