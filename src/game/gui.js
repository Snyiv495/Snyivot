/*****************
    gui.js
    スニャイヴ
    2024/12/05
*****************/

module.exports = {
    menu: menu,
    button: button,
    modal: modal,
}

require('dotenv').config();
const db = require('./db');
const casino_slot = require('./execute/casino/slot');
//const game_help = require('./execute/help');

//GUIメニューの実行
async function menu(interaction, casino_slot_map){
    //サーバー以外を除外
    if(!interaction.guild){
        console.log("後で修正");
        return;
    }

    switch(interaction.values[0]){
        case "game_casino_slot_exe" : {
            await interaction.deferUpdate();
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            await casino_slot.exe(interaction, casino_slot_map);
            break;
        }
        default: break;
    }

    return 0;
}

//GUIボタンの実行
async function button(interaction, casino_slot_map){

    await interaction.deferUpdate();
    await interaction.editReply({components: []});
    const user_info = await db.getUserInfo(interaction.user.id);
    const casino_slot_info = casino_slot_map.get(interaction.user.id);

    switch(interaction.customId){
        case "game_casino_slot_again_exe" : {
            await casino_slot.exe(interaction, casino_slot_map);
            break;
        }
        case "game_casino_slot_3bet_exe" : {
            casino_slot_info.state = 1;
            casino_slot_info.bet = 3;
            user_info.coins -= 3;
            casino_slot_map.set(interaction.user.id, casino_slot_info);
            await db.setUserInfo(interaction.user.id, user_info);
            await casino_slot.exe(interaction, casino_slot_map);
            break;
        }
        case "game_casino_slot_2bet_exe" : {
            casino_slot_info.state = 1;
            casino_slot_info.bet = 2;
            user_info.coins -= 2;
            casino_slot_map.set(interaction.user.id, casino_slot_info);
            await db.setUserInfo(interaction.user.id, user_info);
            await casino_slot.exe(interaction, casino_slot_map);
            break;
        }
        case "game_casino_slot_1bet_exe" : {
            casino_slot_info.state = 1;
            casino_slot_info.bet = 1;
            user_info.coins -= 1;
            casino_slot_map.set(interaction.user.id, casino_slot_info);
            await db.setUserInfo(interaction.user.id, user_info);
            await casino_slot.exe(interaction, casino_slot_map);
            break;
        }
        case "game_casino_slot_left_exe" : {
            casino_slot_info.left_stop = true;
            casino_slot_map.set(interaction.user.id, casino_slot_info);
            await casino_slot.exe(interaction, casino_slot_map);
            break;
        }
        case "game_casino_slot_center_exe" : {
            casino_slot_info.center_stop = true;
            casino_slot_map.set(interaction.user.id, casino_slot_info);
            await casino_slot.exe(interaction, casino_slot_map);
            break;
        }
        case "game_casino_slot_right_exe" : {
            casino_slot_info.right_stop = true;
            casino_slot_map.set(interaction.user.id, casino_slot_info);
            await casino_slot.exe(interaction, casino_slot_map);
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