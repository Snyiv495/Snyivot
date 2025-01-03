/*****************
    exchange.js
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
    const coins = new TextInputBuilder();
    const modal = new ModalBuilder();
    
    coins.setCustomId("coins");
    coins.setLabel(`コイン3枚で1円に換金できるよ！(所持コイン：${user_info.coins}枚)`);
    coins.setPlaceholder("数値のみで記入");
    coins.setStyle(TextInputStyle.Short);
    coins.setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(coins));

    modal.setCustomId("game_casino_exchange_modal");
    modal.setTitle("換金したいコインの枚数を教えてほしいのだ！");

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

//換金の実行
async function execute(interaction){
    const user_info = await db.getUserInfo(interaction.user.id);
    
    //メダルの取得
    if(!interaction.isModalSubmit()){
        await interaction.showModal(createModal(user_info));

        try{await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: [], ephemeral: true});}catch(e){};

        return 0;
    }

    const coins = interaction.fields.getTextInputValue("coins");
    
    if(!isNaN(coins)){
        const money = Math.min(Math.max(0, (coins - coins%3)/3), (user_info.coins - user_info.coins%3)/3);
        user_info.coins -= money * 3;
        user_info.money += money;
        await db.setUserInfo(interaction.user.id, user_info);
    }

    await interaction.editReply(await createEmbed(user_info));

    return 0;
}