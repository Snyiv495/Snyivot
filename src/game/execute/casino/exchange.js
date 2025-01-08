/*****************
    exchange.js
    スニャイヴ
    2024/01/03
*****************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const db = require('../../db');
const cui = require('../../cui');

//埋め込みの作成
async function createEmbed(user_info){
    const embeds = [];
    const components = [];

    const embed = new EmbedBuilder();
    const buttons = new ActionRowBuilder();

    embed.setTitle(`現在の貸出枚数は${user_info.coins}枚なのだ！`);
    embed.setFooter({text: `所持金：${user_info.money}`});
    embed.setColor(0x00FF00);
    embeds.push(embed);

    const home = new ButtonBuilder();
    const quit = new ButtonBuilder();

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
    
    components.push(buttons);

    return {content: "", files: [], embeds: embeds, components: components, ephemeral: true};
}

//換金の実行
async function execute(interaction, coins){
    let progress = null;
    try{
        progress = await cui.createProgressbar(interaction, 3);
        progress = await cui.stepProgressbar(progress);
    }catch(e){}
    
    const user_info = await db.getUserInfo(interaction.user.id);
    progress = await cui.stepProgressbar(progress);
    
    if(!isNaN(coins)){
        const money = Math.min(Math.max(0, (coins - coins%3)/3), (user_info.coins - user_info.coins%3)/3);
        user_info.coins -= money * 3;
        user_info.money += money;
        await db.setUserInfo(interaction.user.id, user_info);
    }
    
    progress = await cui.stepProgressbar(progress);
    await interaction.editReply(await createEmbed(user_info));

    return 0;
}