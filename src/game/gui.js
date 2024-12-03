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
async function menu(interaction, game_slot_map){
    //サーバー以外を除外
    if(!interaction.guild){
        console.log("後で修正");
        return;
    }

    switch(interaction.values[0]){
        case "game_slot_exe" : {
            await interaction.deferUpdate();
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            await gm_casino_slot.exe(interaction, game_slot_map);
            break;
        }
        default: break;
    }

    return 0;
}

//GUIボタンの実行
async function button(interaction, game_slot_map){

    await interaction.deferUpdate();
    await interaction.editReply({components: []});
    const user_info = await db.getUserInfo(interaction.user.id);
    const slot_info = game_slot_map.get(interaction.user.id);

    switch(interaction.customId){
        case "game_casino_slot_again_exe" : {
            await gm_casino_slot.exe(interaction, game_slot_map);
            break;
        }
        case "game_casino_slot_3bet_exe" : {
            slot_info.state = 1;
            slot_info.bet = 3;
            user_info.coins -= 3;
            game_slot_map.set(interaction.user.id, slot_info);
            await db.setUserInfo(interaction.user.id, user_info);
            await gm_casino_slot.exe(interaction, game_slot_map);
            break;
        }
        case "game_casino_slot_2bet_exe" : {
            slot_info.state = 1;
            slot_info.bet = 2;
            user_info.coins -= 2;
            game_slot_map.set(interaction.user.id, slot_info);
            await db.setUserInfo(interaction.user.id, user_info);
            await gm_casino_slot.exe(interaction, game_slot_map);
            break;
        }
        case "game_casino_slot_1bet_exe" : {
            slot_info.state = 1;
            slot_info.bet = 1;
            user_info.coins -= 1;
            game_slot_map.set(interaction.user.id, slot_info);
            await db.setUserInfo(interaction.user.id, user_info);
            await gm_casino_slot.exe(interaction, game_slot_map);
            break;
        }
        case "game_casino_slot_left_exe" : {
            slot_info.left_stop = true;
            game_slot_map.set(interaction.user.id, slot_info);
            await gm_casino_slot.exe(interaction, game_slot_map);
            break;
        }
        case "game_casino_slot_center_exe" : {
            slot_info.center_stop = true;
            game_slot_map.set(interaction.user.id, slot_info);
            await gm_casino_slot.exe(interaction, game_slot_map);
            break;
        }
        case "game_casino_slot_right_exe" : {
            slot_info.right_stop = true;
            game_slot_map.set(interaction.user.id, slot_info);
            await gm_casino_slot.exe(interaction, game_slot_map);
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