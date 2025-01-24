/*****************
    shop.js
    スニャイヴ
    2025/01/24
*****************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, ModalBuilder, TextInputStyle, AttachmentBuilder} = require('discord.js');
const db = require('../../db');

//モーダルの作成
function createModal(user_info){
    const modal = new ModalBuilder();
    const res_buy_coin = new TextInputBuilder();
    const res_buy_ticket = new TextInputBuilder();
    
    modal.setCustomId("game_casino_shop_modal");
	modal.setTitle("注文書なのだ！");

    res_buy_coin.setCustomId("res_buy_coin")
    res_buy_coin.setLabel(`コインの購入枚数(1コイン：10円)💡所持金：${user_info.money}円`)
    res_buy_coin.setPlaceholder("0");
    res_buy_coin.setStyle(TextInputStyle.Short);
    modal.addComponents(new ActionRowBuilder().addComponents(res_buy_coin));

    res_buy_ticket.setCustomId("res_buy_ticket")
    res_buy_ticket.setLabel(`チケットの購入枚数(1チケット：100コイン)💡所持コイン：${user_info.coin}`)
    res_buy_ticket.setPlaceholder("0");
    res_buy_ticket.setStyle(TextInputStyle.Short);
    modal.addComponents(new ActionRowBuilder().addComponents(res_buy_ticket));

    return modal;
}

//埋め込みの作成
function createEmbed(user_info){
    const files = [];
    const embeds = [];
    const components = [];

    const attachment = new AttachmentBuilder();
    const embed = new EmbedBuilder();
    const buttons = new ActionRowBuilder();

    const again = new ButtonBuilder();
    const home = new ButtonBuilder();
    const game_home = new ButtonBuilder();
    const quit = new ButtonBuilder();

    embed.setTitle("ご利用ありがとうなのだ！");
    embed.setThumbnail("attachment://icon.png");
    embed.addFields({name: "所持金", value: `${user_info.money}円`});
    embed.addFields({name: "コイン", value: `${user_info.coin}枚`});
    embed.addFields({name: "チケット", value: `${user_info.ticket}枚`});
    embed.setColor(0x00FF00);

    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/bunny.png");

    home.setLabel("ホーム");
    home.setEmoji("🏠");
    home.setCustomId("home");
    home.setStyle(ButtonStyle.Secondary);
    buttons.addComponents(home);

    game_home.setLabel("戻る");
    game_home.setEmoji("🎮");
    game_home.setCustomId("game_home");
    game_home.setStyle(ButtonStyle.Secondary);
    buttons.addComponents(game_home);

    again.setLabel("続ける");
    again.setEmoji("🔂");
    again.setCustomId("game_casino_shop_again_exe");
    again.setStyle(ButtonStyle.Success);
    buttons.addComponents(again);

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

//売買の実行
async function execute(interaction){
    const user_info = await db.getUserInfo(interaction.user.id);

    //注文書
    if(!interaction.isModalSubmit()){
        await interaction.showModal(createModal(user_info));

        try{await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: [], ephemeral: true});}catch(e){};

        return 0;
    }

    //コインの購入
    if(interaction.fields.getTextInputValue("res_buy_coin") && !isNaN(interaction.fields.getTextInputValue("res_buy_coin"))){
        const num_buy_coin = parseInt(interaction.fields.getTextInputValue("res_buy_coin"));
        user_info.coin += Math.max(0, Math.min(num_buy_coin, (user_info.money-(user_info.money%10))/10));
        user_info.money -= Math.max(0, Math.min(num_buy_coin*10, user_info.money-(user_info.money%10)));
    }

    //チケットの購入
    if(interaction.fields.getTextInputValue("res_buy_ticket") && !isNaN(interaction.fields.getTextInputValue("res_buy_ticket"))){
        const num_buy_ticket = parseInt(interaction.fields.getTextInputValue("res_buy_ticket"));
        user_info.ticket += Math.max(0, Math.min(num_buy_ticket, (user_info.coin-(user_info.coin%100))/100));
        user_info.coin -= Math.max(0, Math.min(num_buy_ticket*100, user_info.coin-(user_info.coin%100)));
    }

    await db.setUserInfo(interaction.user.id, user_info);
    await interaction.editReply(createEmbed(user_info));
    
    return 0;
}