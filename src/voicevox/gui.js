/*****************
    gui.js
    スニャイヴ
    2024/10/21
*****************/

module.exports = {
    guiMenu: guiMenu,
    guiModal: guiModal,
}

require('dotenv').config();
const {StringSelectMenuOptionBuilder, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, TextInputBuilder, ModalBuilder, TextInputStyle} = require('discord.js');
const fs = require('fs');
const gui = require('../gui');
const exe_start = require('./execute/start');
const exe_end = require('./execute/end');
const exe_setting_user = require('./execute/setUser');
const exe_setting_server = require('./execute/setServer');
const exe_dictionary_add = require('./execute/dictAdd');
const exe_dictionary_delete = require('./execute/dictDel');
const exe_help = require('./execute/help');

//GUIメニューの実行
async function guiMenu(interaction, channel_map, subsc_map, speakers, gui){
    //サーバー以外を除外
    if(!interaction.guild){
        console.log("後で修正");
        return;
    }

    switch(interaction.values[0]){
        case "voicevox" : {
            await interaction.deferUpdate();
            await interaction.editReply({content: "Loading...", files: [], embeds: [], components: []});
            await interaction.editReply(createMenu(interaction, gui));
            break;
        }
        case "voicevox_start" : {
            await interaction.deferUpdate();
            await interaction.editReply({content: "Loading...", files: [], embeds: [], components: []});
            await exe_start.start(interaction, channel_map, subsc_map);
            break;
        }
        case "voicevox_end" : {
            await interaction.deferUpdate();
            await interaction.editReply({content: "Loading...", files: [], embeds: [], components: []});
            await exe_end.end(interaction, channel_map, subsc_map);
            break;
        }
        case "voicevox_setting_user" : {
            await interaction.deferUpdate();
            await interaction.editReply({content: "Loading...", files: [], embeds: [], components: []});
            await interaction.editReply(createMenu(interaction, gui));
            break;
        }
        case "voicevox_setting_user_speaker" : {
            break;
        }
        case "voicevox_setting_user_parameter" : {
            await interaction.showModal(getSetUserModal());
            await interaction.editReply({content: "Loading...", files: [], embeds: [], components: []});
            break;
        }
        case "voicevox_setting_server" : {
            await interaction.showModal();
            await interaction.editReply({content: "Loading...", files: [], embeds: [], components: []});
            break;
        }
        case "voicevox_dictionary_add" : {
            await interaction.showModal();
            await interaction.editReply({content: "Loading...", files: [], embeds: [], components: []});
            break;
        }
        case "voicevox_dictionary_delete" : {
            await interaction.showModal();
            await interaction.editReply({content: "Loading...", files: [], embeds: [], components: []});
            break;
        }
        case "voicevox_help" : {
            await interaction.showModal();
            await interaction.editReply({content: "Loading...", files: [], embeds: [], components: []});
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
            await exe_end.end(interaction, channel_map, subsc_map, opt_all);
            break;
        }
        case "voicevox_setting_user_parameter" : {
            const opt_parameter = {speaker: null, style: null, speed: null, pitch: null, intonation: null, volume: null, username: null};
            opt_parameter.speed = Math.min(Math.max((isNaN(parseFloat(interaction.fields.getTextInputValue("speed"))) ? parseFloat(interaction.fields.getTextInputValue("speed")) : 1.0), 0.5), 2.0);
            opt_parameter.pitch = Math.min(Math.max((isNaN(parseFloat(interaction.fields.getTextInputValue("pitch"))) ? parseFloat(interaction.fields.getTextInputValue("pitch")) : 0), -0.15), 0.15);
            opt_parameter.intonation = Math.min(Math.max((isNaN(parseFloat(interaction.fields.getTextInputValue("intonation"))) ? parseFloat(interaction.fields.getTextInputValue("intonation")) : 1.0), 0), 2);
            opt_parameter.volume = Math.min(Math.max((isNaN(parseFloat(interaction.fields.getTextInputValue("volume"))) ? parseFloat(interaction.fields.getTextInputValue("volume")) : 1.0), 0), 2);
            opt_parameter.username = (interaction.fields.getTextInputValue("username") != "") ? interaction.fields.getTextInputValue("username") : null;
            await exe_setting_user.setUser(interaction, speakers, opt_parameter);
            break;
        }
        default : break;
    }

    return 0;
}