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
const db = require('../db');

//fox価格の更新
function updateFoxPrice(shop_fox_price){
    const chart = Math.floor(Math.random()*4);

    let base = [];
    switch(chart){
        case 0 : {base = [90,70,65,60,55,50,115,125,480,115,70,65,60];break;}
        case 1 : {base = [90,65,60,55,50,115,125,65,65,65,65,65,65];break;}
        case 2 : {base = [90,65,65,85,115,85,115,85,115,85,65,65,50];break;}
        case 3 : {base = [90,70,65,60,55,50,45,40,35,30,25,20,15];break;}
        default : break;
    }

    shop_fox_price[0] = base[0] + Math.floor(Math.random()*20);
    for(let i=1; i<13; i++){
        shop_fox_price[i] = base[i] + Math.floor(Math.random()*5);
    }

    return shop_fox_price;
}

//モーダルの作成
function createModal(user_info, server_info, date, price_idx){
    const modal = new ModalBuilder();
    const res_buy_fox = new TextInputBuilder();
    const res_sell_fox = new TextInputBuilder();
    const res_sell_ticket = new TextInputBuilder();
    
    modal.setCustomId("game_shop_modal");
	modal.setTitle("注文書なのだ！");

    if(!date.getDay()){
        res_buy_fox.setCustomId("res_buy_fox")
        res_buy_fox.setLabel(`キツネの購入数(1キツネ：${server_info.shop_fox_price[price_idx]}円)💡所持金：${user_info.money}円`);
        res_buy_fox.setPlaceholder("0");
        res_buy_fox.setStyle(TextInputStyle.Short);
        res_buy_fox.setRequired(false);
        modal.addComponents(new ActionRowBuilder().addComponents(res_buy_fox));
    }else{
        res_sell_fox.setCustomId("res_sell_fox")
        res_sell_fox.setLabel(`キツネの売却数(1キツネ：${server_info.shop_fox_price[price_idx]}円)💡所持キツネ：${user_info.fox}匹`);
        res_sell_fox.setPlaceholder("0");
        res_sell_fox.setStyle(TextInputStyle.Short);
        res_sell_fox.setRequired(false);
        modal.addComponents(new ActionRowBuilder().addComponents(res_sell_fox));
    }

    res_sell_ticket.setCustomId("res_sell_ticket")
    res_sell_ticket.setLabel(`チケットの売却数(1チケット：1000円)💡所持チケット：${user_info.ticket}枚`);
    res_sell_ticket.setPlaceholder("0");
    res_sell_ticket.setStyle(TextInputStyle.Short);
    res_sell_ticket.setRequired(false);
    modal.addComponents(new ActionRowBuilder().addComponents(res_sell_ticket));

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
    embed.addFields({name: "キツネ", value: `${user_info.fox}匹`});
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
    const server_info = await db.getServerInfo(interaction.guild.id);
    const date = new Date();
    const price_idx = (date.getDay()===0?0:(date.getDay()-1))*2+(date.getHours()>=12?1:0)+1;

    //fox価格の更新
    if(!server_info.update || ((server_info.shop_fox.update != date.toLocaleDateString()) && !date.getDay())){
        server_info.shop_fox_update = date.toLocaleDateString();
        server_info.shop_fox_price = updateFoxPrice(server_info.shop_fox_price);
        await db.setServerInfo(interaction.guild.id, server_info);
    }
    
    //foxの廃棄
    if((((new Date()).setHours(0,0,0,0))-(new Date(user_info.fox_update)).setHours(0,0,0,0))/(1000*60*60*24) >= 7){
        user_info.fox = 0;
        user_info.fox_update = date.toLocaleDateString();
        await db.setUserInfo(interaction.user.id, user_info);
    }

    //注文書
    if(!interaction.isModalSubmit()){
        await interaction.showModal(createModal(user_info, server_info, date, price_idx));

        try{await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: [], ephemeral: true});}catch(e){};

        return 0;
    }

    //キツネの購入
    if(interaction.fields.fields.has("res_buy_fox") && interaction.fields.getTextInputValue("res_buy_fox") && !isNaN(interaction.fields.getTextInputValue("res_buy_fox"))){
        const num_buy_fox = parseInt(interaction.fields.getTextInputValue("res_buy_fox"));
        user_info.fox += Math.max(0, Math.min(num_buy_fox, (user_info.money-(user_info.money%server_info.shop_fox_price[price_idx]))/server_info.shop_fox_price[price_idx]));
        user_info.money -= Math.max(0, Math.min(num_buy_fox*server_info.shop_fox_price[price_idx], user_info.money-(user_info.money%server_info.shop_fox_price[price_idx])));
    }

    //キツネの売却
    if(interaction.fields.fields.has("res_sell_fox") && interaction.fields.getTextInputValue("res_sell_fox") && !isNaN(interaction.fields.getTextInputValue("res_sell_fox"))){
        const num_sell_fox = parseInt(interaction.fields.getTextInputValue("res_sell_fox"));
        user_info.money += Math.max(0, Math.min(num_sell_fox*server_info.shop_fox_price[price_idx], user_info.fox*server_info.shop_fox_price[price_idx]));
        user_info.fox -= Math.max(0, Math.min(num_sell_fox, user_info.fox));
    }

    //チケットの売却
    if(interaction.fields.getTextInputValue("res_sell_ticket") && !isNaN(interaction.fields.getTextInputValue("res_sell_ticket"))){
        const num_sell_ticket = parseInt(interaction.fields.getTextInputValue("res_sell_ticket"));
        user_info.money += Math.max(0, Math.min(num_sell_ticket*1000, user_info.ticket*1000));
        user_info.ticket -= Math.max(0, Math.min(num_sell_ticket, user_info.ticket));
    }

    await db.setUserInfo(interaction.user.id, user_info);
    await interaction.editReply(createEmbed(user_info));
    
    return 0;
}