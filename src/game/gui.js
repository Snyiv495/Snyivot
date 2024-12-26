/*****************
    gui.js
    スニャイヴ
    2024/12/26
*****************/

module.exports = {
    menu: menu,
    button: button,
    modal: modal,
}

require('dotenv').config();
const db = require('./db');
const casino_slot = require('./execute/casino/slot');
const work_calc = require('./execute/work/calc');
//const game_help = require('./execute/help');

//GUIメニューの実行
async function menu(interaction, map){
    //サーバー以外を除外
    if(!interaction.guild){
        console.log("後で修正");
        return;
    }

    switch(interaction.values[0]){
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
        default: break;
    }

    return 0;
}

//GUIボタンの実行
async function button(interaction, map){
    const user_info = await db.getUserInfo(interaction.user.id);
    const casino_slot_info = map.get(`casino_slot_${interaction.user.id}`);

    switch(interaction.customId){
        case "game_casino_slot_again_exe" : {
            await interaction.deferUpdate();
            await interaction.editReply({components: []});
            await casino_slot.exe(interaction, map);
            break;
        }
        case "game_casino_slot_3bet_exe" : {
            await interaction.deferUpdate();
            await interaction.editReply({components: []});
            casino_slot_info.bet = 3;
            user_info.coins -= 3;
            map.set(`casino_slot_${interaction.user.id}`, casino_slot_info);
            await db.setUserInfo(interaction.user.id, user_info);
            await casino_slot.exe(interaction, map);
            break;
        }
        case "game_casino_slot_2bet_exe" : {
            await interaction.deferUpdate();
            await interaction.editReply({components: []});
            casino_slot_info.bet = 2;
            user_info.coins -= 2;
            map.set(`casino_slot_${interaction.user.id}`, casino_slot_info);
            await db.setUserInfo(interaction.user.id, user_info);
            await casino_slot.exe(interaction, map);
            break;
        }
        case "game_casino_slot_1bet_exe" : {
            await interaction.deferUpdate();
            await interaction.editReply({components: []});
            casino_slot_info.bet = 1;
            user_info.coins -= 1;
            map.set(`casino_slot_${interaction.user.id}`, casino_slot_info);
            await db.setUserInfo(interaction.user.id, user_info);
            await casino_slot.exe(interaction, map);
            break;
        }
        case "game_casino_slot_left_exe" : {
            await interaction.deferUpdate();
            await interaction.editReply({components: []});
            casino_slot_info.stop = "left";
            casino_slot_info.left_stop = true;
            map.set(`casino_slot_${interaction.user.id}`, casino_slot_info);
            await casino_slot.exe(interaction, map);
            break;
        }
        case "game_casino_slot_center_exe" : {
            await interaction.deferUpdate();
            await interaction.editReply({components: []});
            casino_slot_info.stop = "center";
            casino_slot_info.center_stop = true;
            map.set(`casino_slot_${interaction.user.id}`, casino_slot_info);
            await casino_slot.exe(interaction, map);
            break;
        }
        case "game_casino_slot_right_exe" : {
            await interaction.deferUpdate();
            await interaction.editReply({components: []});
            casino_slot_info.stop = "right";
            casino_slot_info.right_stop = true;
            map.set(`casino_slot_${interaction.user.id}`, casino_slot_info);
            await casino_slot.exe(interaction, map);
            break;
        }
        case "game_work_calc_again_exe" : {
            await work_calc.exe(interaction, map);
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
        case "game_work_calc_modal" : {
            await work_calc.exe(interaction, map);
            break;
        }
        default : break;
    }

    return 0;
}