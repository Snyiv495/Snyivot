/*****************
    gui.js
    スニャイヴ
    2024/10/29
*****************/

module.exports = {
    guiCmd: guiCmd,
    guiModal: guiModal,
}

require('dotenv').config();
const vv_start = require('./execute/start');
const vv_end = require('./execute/end');
const vv_setting_user = require('./execute/setUser');
const vv_setting_server = require('./execute/setServer');
const vv_dictionary_add = require('./execute/dictAdd');
const vv_dictionary_delete = require('./execute/dictDel');
const vv_help = require('./execute/help');

//GUIメニューの実行
async function guiCmd(interaction, channel_map, subsc_map, speakers){
    //サーバー以外を除外
    if(!interaction.guild){
        console.log("後で修正");
        return;
    }

    switch(interaction.values[0]){
        case "voicevox_start_exe" : {
            await interaction.deferUpdate();
            await interaction.editReply({content: "NOW LOADING...", files: [], embeds: [], components: []});
            await vv_start.exe(interaction, channel_map, subsc_map);
            break;
        }
        case "voicevox_end_exe" : {
            await interaction.deferUpdate();
            await interaction.editReply({content: "NOW LOADING...", files: [], embeds: [], components: []});
            await vv_end.exe(interaction, channel_map, subsc_map);
            break;
        }
        case "voicevox_setting_user_exe" : {
            break;
        }
        case "voicevox_setting_server_exe" : {
            break;
        }
        case "voicevox_dictionary_add" : {
            break;
        }
        case "voicevox_dictionary_delete" : {
            break;
        }
        case "voicevox_help" : {
            break;
        }
        default : break;
    }

    return 0;
}

//GUIモーダルの実行
async function guiModal(interaction, channel_map, subsc_map, speakers){
    switch(interaction.customId){
        case "voicevox_end" : {
            const opt_all = ["はい","True","true"].includes(interaction.fields.getTextInputValue("all"));
            await vv_end.exe(interaction, channel_map, subsc_map, opt_all);
            break;
        }
        case "voicevox_setting_user_parameter" : {
            const opt_parameter = {speaker: null, style: null, speed: null, pitch: null, intonation: null, volume: null, username: null};
            opt_parameter.speed = Math.min(Math.max((isNaN(parseFloat(interaction.fields.getTextInputValue("speed"))) ? parseFloat(interaction.fields.getTextInputValue("speed")) : 1.0), 0.5), 2.0);
            opt_parameter.pitch = Math.min(Math.max((isNaN(parseFloat(interaction.fields.getTextInputValue("pitch"))) ? parseFloat(interaction.fields.getTextInputValue("pitch")) : 0), -0.15), 0.15);
            opt_parameter.intonation = Math.min(Math.max((isNaN(parseFloat(interaction.fields.getTextInputValue("intonation"))) ? parseFloat(interaction.fields.getTextInputValue("intonation")) : 1.0), 0), 2);
            opt_parameter.volume = Math.min(Math.max((isNaN(parseFloat(interaction.fields.getTextInputValue("volume"))) ? parseFloat(interaction.fields.getTextInputValue("volume")) : 1.0), 0), 2);
            opt_parameter.username = (interaction.fields.getTextInputValue("username") != "") ? interaction.fields.getTextInputValue("username") : null;
            await vv_setting_user.setUser(interaction, speakers, opt_parameter);
            break;
        }
        default : break;
    }

    return 0;
}