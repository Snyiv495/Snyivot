/*****************
    borrow.js
    スニャイヴ
    2024/01/03
*****************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, TextInputBuilder, ModalBuilder, TextInputStyle} = require('discord.js');
const db = require('../../db');

//モーダルの作成
function createModal(user_info){
    const money = new TextInputBuilder();
    const modal = new ModalBuilder();
    
    money.setCustomId("money");
    money.setLabel(`3円でコイン1枚借りれるのだ！(所持金：${user_info.money}円)`);
    money.setPlaceholder("数値のみで記入");
    money.setStyle(TextInputStyle.Short);
    money.setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(money));

    modal.setCustomId("game_casino_borrow_modal");
    modal.setTitle("コインにするお金の金額を教えてほしいのだ！");

    return modal;
}

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

//貸出の実行
async function execute(interaction){
    const user_info = await db.getUserInfo(interaction.user.id);
    
    //金額の取得
    if(!interaction.isModalSubmit()){
        await interaction.showModal(createModal(user_info));

        try{await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: [], ephemeral: true});}catch(e){};

        return 0;
    }

    const money = interaction.fields.getTextInputValue("money");
    
    if(!isNaN(money)){
        const coins = Math.min(Math.max(0, (money - money%3)/3), (user_info.money - user_info.money%3)/3);
        user_info.money -= coins * 3;
        user_info.coins += coins;
        await db.setUserInfo(interaction.user.id, user_info);
    }

    await interaction.editReply(await createEmbed(user_info));

    return 0;
}