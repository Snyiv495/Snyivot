/*****************
    gui.js
    スニャイヴ
    2025/01/24
*****************/

module.exports = {
    menu: menu,
    button: button,
    modal: modal,
}

require('dotenv').config();
const shop = require('./execute/shop');
const casino_shop = require('./execute/casino/shop');
const casino_slot = require('./execute/casino/slot');
const work_calc = require('./execute/work/calc');
const work_prot = require('./execute/work/prot');
//const game_help = require('./execute/help');

//GUIメニューの実行
async function menu(interaction, map){
    //サーバー以外を除外
    if(!interaction.guild){
        console.log("後で修正");
        return -1;
    }
    
    switch(interaction.values[0]){
        case "game_shop_exe" : {
            await shop.exe(interaction);
            break;
        }
        case "game_casino_slot_exe" : {
            await interaction.deferUpdate();
            await interaction.editReply({components: []});
            await casino_slot.exe(interaction, map);
            break;
        }
        case "game_casino_shop_exe" : {
            await casino_shop.exe(interaction);
            break;
        }
        case "game_work_calc_exe" : {
            await work_calc.exe(interaction, map);
            break;
        }
        case "game_work_prot_exe" : {
            await interaction.deferUpdate();
            await interaction.editReply({components: []});
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
        case /game_shop/.test(interaction.customId) : {
            await shop.exe(interaction);
            break;
        }
        case /game_casino_slot/.test(interaction.customId) : {
            await interaction.deferUpdate();
            await interaction.editReply({components: []});
            await casino_slot.exe(interaction, map);
            break;
        }
        case /game_casino_shop/.test(interaction.customId) : {
            await casino_shop.exe(interaction);
            break;
        }
        case /game_work_calc/.test(interaction.customId) : {
            await work_calc.exe(interaction, map);
            break;
        }
        case /game_work_prot/.test(interaction.customId) : {
            await interaction.deferUpdate();
            await interaction.editReply({components: []});
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
        case "game_shop_modal" : {
            await shop.exe(interaction);
            break;
        }
        case "game_casino_shop_modal" : {
            await casino_shop.exe(interaction);
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