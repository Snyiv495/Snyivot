/*****************
    gui.js
    スニャイヴ
    2024/11/27
*****************/

module.exports = {
    menu: menu,
    button: button,
    modal: modal,
}

require('dotenv').config();
const db = require('./db');
const gm_casino_slot = require('./execute/casinoSlot');
//const gm_help = require('./execute/help');

//GUIメニューの実行
async function menu(interaction){
    //サーバー以外を除外
    if(!interaction.guild){
        console.log("後で修正");
        return;
    }

    return 0;
}

//GUIボタンの実行
async function button(interaction){

    await interaction.deferUpdate();
    await interaction.editReply({components: []});

    switch(interaction.customId){
        case "game_casino_slot_again_exe" : {
            await gm_casino_slot.exe(interaction);
            break;
        }
        case "game_casino_slot_3bet_exe" : {
            const user_info = await db.getUserInfo(interaction.user.id);
            user_info.slot_state = 1;
            user_info.slot_bet = 3;
            await db.setUserInfo(interaction.user.id, user_info);
            await gm_casino_slot.exe(interaction);
            break;
        }
        case "game_casino_slot_2bet_exe" : {
            const user_info = await db.getUserInfo(interaction.user.id);
            user_info.slot_state = 1;
            user_info.slot_bet = 2;
            await db.setUserInfo(interaction.user.id, user_info);
            await gm_casino_slot.exe(interaction);
            break;
        }
        case "game_casino_slot_1bet_exe" : {
            const user_info = await db.getUserInfo(interaction.user.id);
            user_info.slot_state = 1;
            user_info.slot_bet = 1;
            await db.setUserInfo(interaction.user.id, user_info);
            await gm_casino_slot.exe(interaction);
            break;
        }
        case "game_casino_slot_left_exe" : {
            const user_info = await db.getUserInfo(interaction.user.id);
            user_info.slot_left_stop = true;
            await db.setUserInfo(interaction.user.id, user_info);
            await gm_casino_slot.exe(interaction);
            break;
        }
        case "game_casino_slot_center_exe" : {
            const user_info = await db.getUserInfo(interaction.user.id);
            user_info.slot_center_stop = true;
            await db.setUserInfo(interaction.user.id, user_info);
            await gm_casino_slot.exe(interaction);
            break;
        }
        case "game_casino_slot_right_exe" : {
            const user_info = await db.getUserInfo(interaction.user.id);
            user_info.slot_right_stop = true;
            await db.setUserInfo(interaction.user.id, user_info);
            await gm_casino_slot.exe(interaction);
            break;
        }
        default : break;
    }

    return 0;
}

//GUIモーダルの実行
async function modal(interaction){
    await interaction.deferUpdate();
    await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});

    return 0;
}