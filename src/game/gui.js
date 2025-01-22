/*****************
    gui.js
    スニャイヴ
    2025/01/22
*****************/

module.exports = {
    menu: menu,
    button: button,
    modal: modal,
}

require('dotenv').config();
const {TextInputBuilder, ModalBuilder, TextInputStyle, ActionRowBuilder} = require('discord.js');
const db = require('./db');
const casino_borrow = require('./execute/casino/borrow');
const casino_exchange = require('./execute/casino/exchange');
const casino_slot = require('./execute/casino/slot');
const work_calc = require('./execute/work/calc');
const work_prot = require('./execute/work/prot');
//const game_help = require('./execute/help');

//借入モーダル
function borrowModal(user_info){
    const money_input_text = new TextInputBuilder();
    const borrow_modal = new ModalBuilder();
    
    money_input_text.setCustomId("money_input_text");
    money_input_text.setLabel(`3円でコイン1枚借りれるのだ！ (所持金：${user_info.money}円)`);
    money_input_text.setPlaceholder("数値のみを記入");
    money_input_text.setStyle(TextInputStyle.Short);
    money_input_text.setRequired(true);
    borrow_modal.addComponents(new ActionRowBuilder().addComponents(money_input_text));

    borrow_modal.setCustomId("game_casino_borrow_modal");
    borrow_modal.setTitle("何円分のお金をコインにするのだ？");

    return borrow_modal;
}

//換金モーダル
function exchangeModal(user_info){
    const coins_input_text = new TextInputBuilder();
    const exchange_modal = new ModalBuilder();
    
    coins_input_text.setCustomId("coins_input_text");
    coins_input_text.setLabel(`コイン3枚で1円に換金できるのだ！ (所持コイン：${user_info.coins}枚)`);
    coins_input_text.setPlaceholder("数値のみを記入");
    coins_input_text.setStyle(TextInputStyle.Short);
    coins_input_text.setRequired(true);
    exchange_modal.addComponents(new ActionRowBuilder().addComponents(coins_input_text));

    exchange_modal.setCustomId("game_casino_exchange_modal");
    exchange_modal.setTitle("換金したいコインの枚数を教えてほしいのだ！");

    return exchange_modal;
}

//GUIメニューの実行
async function menu(interaction, map){
    //サーバー以外を除外
    if(!interaction.guild){
        console.log("後で修正");
        return;
    }

    const user_info = await db.getUserInfo(interaction.user.id);
    
    switch(interaction.values[0]){
        case "game_casino_borrow_exe" : {
            await interaction.showModal(borrowModal(user_info));
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            break;
        }
        case "game_casino_exchange_exe" : {
            await interaction.showModal(exchangeModal(user_info));
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            break;
        }
        case "game_casino_slot_exe" : {
            await interaction.deferUpdate();
            await interaction.editReply({components: []});
            await casino_slot.exe(interaction, map);
            break;
        }
        case "game_work_calc_exe" : {
            await work_calc.exe(interaction, map);
            break;
        }
        case "game_work_prot_exe" : {
            await interaction.deferUpdate();
            await work_prot.exe(interaction, map);
            break;
        }
        default: break;
    }

    return 0;
}

//GUIボタンの実行
async function button(interaction, map){

    switch(true){
        case /game_casino_slot/.test(interaction.customId) : {
            await interaction.deferUpdate();
            await interaction.editReply({components: []});
            await casino_slot.exe(interaction, map);
            break;
        }
        case /game_work_calc/.test(interaction.customId) : {
            await work_calc.exe(interaction, map);
            break;
        }
        case /game_work_prot/.test(interaction.customId) : {
            await interaction.deferUpdate();
            await work_prot.exe(interaction, map);
            break;
        }
        default : break;
    }

    return 0;
}

//GUIモーダルの実行
async function modal(interaction, map){
    
    try{
        await interaction.update({content: "Snyivot が考え中...", files: [], embeds: [], components: [], ephemeral: true});
    }catch(e){
        await interaction.reply({content: "Snyivot が考え中...", files: [], embeds: [], components: [], ephemeral: true});
    }

    switch(interaction.customId){
        case "game_casino_borrow_modal" : {
            await casino_borrow.exe(interaction, interaction.fields.getTextInputValue("money_input_text"));
            break;
        }
        case "game_casino_exchange_modal" : {
            await casino_exchange.exe(interaction, interaction.fields.getTextInputValue("coins_input_text"));
            break;
        }
        case "game_work_calc_modal" : {
            await work_calc.exe(interaction, map);
            break;
        }
        default : break;
    }

    return 0;
}