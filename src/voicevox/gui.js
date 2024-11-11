/*****************
    gui.js
    スニャイヴ
    2024/10/29
*****************/

module.exports = {
    guiMenu: guiMenu,
    guiButton: guiButton,
    guiModal: guiModal,
}

const {EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuOptionBuilder, TextInputBuilder, ModalBuilder, TextInputStyle} = require("discord.js");
const axios = require('axios').create({baseURL: process.env.VOICEVOX_SERVER, proxy: false});

require('dotenv').config();
const vv_start = require('./execute/start');
const vv_end = require('./execute/end');
const vv_setting_user = require('./execute/setUser');
const vv_setting_server = require('./execute/setServer');
const vv_dictionary_add = require('./execute/dictAdd');
const vv_dictionary_delete = require('./execute/dictDel');
const vv_help = require('./execute/help');

//キャラクター設定GUIの作成
async function createSpeakerStyleGUI(id, speakers, is_user_setting){
    const embed = new EmbedBuilder();
    const icon = new AttachmentBuilder();
    const voice_sample = new AttachmentBuilder();
    const buttons = new ActionRowBuilder();
    const now_style_id = id.split("_")[4];

    let files = [];
    let embeds = [];
    let components = [];

    let now_speaker_name = null;
    let now_style_name = null;

    let pre_speaker_id = null;
    let pre_speaker_name = null;
    let pre_style_id =  null;
    let pre_style_name = null;

    let next_speaker_id = null;
    let next_speaker_name = null;
    let next_style_id = null;
    let next_style_name = null;

    let uuid = null
    let style_infos = null;

    for(let i=0; i<speakers.length; i++){
        for(let j=0; j<speakers[i].styles.length; j++){
            if(speakers[i].styles[j].id == now_style_id){

                now_speaker_name = speakers[i].name;
                now_style_name = speakers[i].styles[j].name;

                if(speakers[i-1]){
                    pre_speaker_id = speakers[i-1].styles[0].id;
                    pre_speaker_name = speakers[i-1].name;
                }

                if(speakers[i].styles[j-1]){
                    pre_style_id = speakers[i].styles[j-1].id;
                    pre_style_name = speakers[i].styles[j-1].name;
                }

                if(speakers[i+1]){
                    next_speaker_id = speakers[i+1].styles[0].id;
                    next_speaker_name = speakers[i+1].name;
                }

                if(speakers[i].styles[j+1]){
                    next_style_id = speakers[i].styles[j+1].id;
                    next_style_name = speakers[i].styles[j+1].name;
                }

                uuid = speakers[i].speaker_uuid;

                break;
            }
        }
    }

    await axios.get(`speaker_info?speaker_uuid=${uuid}`).then(
        function(res){
            style_infos = res.data.style_infos;
        }
    ).catch(function(e){});
    
    for(let i=0; i<style_infos.length; i++){
        if(style_infos[i].id == now_style_id){
            icon.setName("icon.jpg");
            icon.setFile(Buffer.from(style_infos[i].icon, 'base64'));
            voice_sample.setName("sample.mp3");
            voice_sample.setFile(Buffer.from(style_infos[i].voice_samples[0], 'base64'));
            files.push(icon);
            files.push(voice_sample);
            break;
        }
    }

    embed.setTitle(`${now_speaker_name}(${now_style_name})`);
    embed.setImage("attachment://icon.jpg");
    embed.setFooter({text: "このキャラクターにするのだ？"});
    embed.setColor(0x00FF00);        

    embeds.push(embed);

    const pre_speaker = new ButtonBuilder();
    pre_speaker.setEmoji("⏮");
    if(pre_speaker_id != null){
        pre_speaker.setLabel(`${pre_speaker_name}`);
        if(is_user_setting){
            pre_speaker.setCustomId(`voicevox_setting_user_id_${pre_speaker_id}_exe`);
        }else{
            pre_speaker.setCustomId(`voicevox_setting_server_id_${pre_speaker_id}_exe`);
        }
        pre_speaker.setDisabled(false);
    }else{
        pre_speaker.setLabel("-");
        pre_speaker.setCustomId("voicevox_setting_*_id_pre_speaker");
        pre_speaker.setDisabled(true);
    }
    pre_speaker.setStyle(ButtonStyle.Secondary);  
    buttons.addComponents(pre_speaker);

    const pre_style = new ButtonBuilder();
    pre_style.setEmoji("⏪");
    if(pre_style_id != null){
        pre_style.setLabel(`${pre_style_name}`);
        if(is_user_setting){
            pre_style.setCustomId(`voicevox_setting_user_id_${pre_style_id}_exe`);
        }else{
            pre_style.setCustomId(`voicevox_setting_server_id_${pre_style_id}_exe`);
        }
        pre_style.setDisabled(false);
    }else{
        pre_style.setLabel("-");
        pre_style.setCustomId("voicevox_setting_*_id_pre_style");
        pre_style.setDisabled(true);
    }
    pre_style.setStyle(ButtonStyle.Secondary);  
    buttons.addComponents(pre_style);

    const now_style = new ButtonBuilder();
    if(is_user_setting){
        now_style.setCustomId(`voicevox_setting_user_${now_speaker_name}_${now_style_name}_exe`);
    }else{
        now_style.setCustomId(`voicevox_setting_server_${now_speaker_name}_${now_style_name}_exe`);
    }
    now_style.setEmoji("⭕");
    now_style.setLabel("決定");
    now_style.setDisabled(false);
    now_style.setStyle(ButtonStyle.Primary);  
    buttons.addComponents(now_style);

    const next_style = new ButtonBuilder();
    next_style.setEmoji("⏩");
    if(next_style_id != null){
        next_style.setLabel(`${next_style_name}`);
        if(is_user_setting){
            next_style.setCustomId(`voicevox_setting_user_id_${next_style_id}_exe`);
        }else{
            next_style.setCustomId(`voicevox_setting_server_id_${next_style_id}_exe`);
        }
        next_style.setDisabled(false);
    }else{
        next_style.setLabel("-");
        next_style.setCustomId("voicevox_setting_*_id_next_style");
        next_style.setDisabled(true);
    }
    next_style.setStyle(ButtonStyle.Secondary);  
    buttons.addComponents(next_style);

    const next_speaker = new ButtonBuilder();
    next_speaker.setEmoji("⏭️");
    if(next_speaker_id != null){
        next_speaker.setLabel(`${next_speaker_name}`);
        if(is_user_setting){
            next_speaker.setCustomId(`voicevox_setting_user_id_${next_speaker_id}_exe`);
        }else{
            next_speaker.setCustomId(`voicevox_setting_server_id_${next_speaker_id}_exe`);
        }
        next_speaker.setDisabled(false);
    }else{
        next_speaker.setLabel("-");
        next_speaker.setCustomId("voicevox_setting_*_id_next_speaker");
        next_speaker.setDisabled(true);
    }
    next_speaker.setStyle(ButtonStyle.Secondary);  
    buttons.addComponents(next_speaker);

    components.push(buttons);

    return {content: "", files: files, embeds: embeds, components: components, ephemeral: true};
}

//パラメーター設定GUIの作成
async function createParameterGUI(interaction){
    const speed = new TextInputBuilder();
    const pitch = new TextInputBuilder();
    const intonation = new TextInputBuilder();
    const volume = new TextInputBuilder();
    const username = new TextInputBuilder();
    const modal = new ModalBuilder();


    speed.setCustomId("speed");
    speed.setLabel("読み上げる速度を入力するのだ！[0.50 ~ 2.00]");
    speed.setStyle(TextInputStyle.Short);
    speed.setRequired(false);
    modal.addComponents(new ActionRowBuilder().addComponents(speed));

    pitch.setCustomId("pitch");
    pitch.setLabel("読み上げる高さを入力するのだ！[-0.15 ~ 0.15]");
    pitch.setStyle(TextInputStyle.Short);
    pitch.setRequired(false);
    modal.addComponents(new ActionRowBuilder().addComponents(pitch));

    intonation.setCustomId("intonation");
    intonation.setLabel("読み上げのる抑揚の度合いを入力するのだ！[0.00 ~ 2.00]");
    intonation.setStyle(TextInputStyle.Short);
    intonation.setRequired(false);
    modal.addComponents(new ActionRowBuilder().addComponents(intonation));

    volume.setCustomId("volume");
    volume.setLabel("読み上げる音量を入力するのだ！[0.00 ~ 2.00]");
    volume.setStyle(TextInputStyle.Short);
    volume.setRequired(false);
    modal.addComponents(new ActionRowBuilder().addComponents(volume));

    switch(true){
        case /voicevox_setting_user_parameter_exe/.test(interaction.values[0]) : {
            username.setCustomId("username");
            username.setLabel("あなたの名前の読み方を入力するのだ！");
            username.setStyle(TextInputStyle.Short);
            username.setRequired(false);
            modal.addComponents(new ActionRowBuilder().addComponents(username));
            modal.setCustomId("modal_voicevox_setting_user_parameter");
            break;
        }
        case /voicevox_setting_server_parameter_exe/.test(interaction.values[0]) : {
            modal.setCustomId("modal_voicevox_setting_server_parameter");
            break;
        }
        default : break;
    }
    
	modal.setTitle("読み上げのパラメーター設定");

    return modal;
}

//コンフィグ設定GUIの作成
async function createConfigGUI(){
    const read_name = new TextInputBuilder();
    const read_sameuser = new TextInputBuilder();
    const read_multiline = new TextInputBuilder();
    const maxwords = new TextInputBuilder();
    const unif = new TextInputBuilder();
    const modal = new ModalBuilder();


    read_name.setCustomId("read_name")
    read_name.setLabel("発言者の名前を読むのだ？[はい/いいえ]")
    read_name.setStyle(TextInputStyle.Short);
    read_name.setRequired(false);
    modal.addComponents(new ActionRowBuilder().addComponents(read_name));

    read_sameuser.setCustomId("read_sameuser")
    read_sameuser.setLabel("同じ人が連続で発言しても名前を読むのだ？[はい/いいえ]")
    read_sameuser.setStyle(TextInputStyle.Short);
    read_sameuser.setRequired(false);
    modal.addComponents(new ActionRowBuilder().addComponents(read_sameuser));

    read_multiline.setCustomId("read_multiline")
    read_multiline.setLabel("文章が2行以上でも全部読むのだ？[はい/いいえ]")
    read_multiline.setStyle(TextInputStyle.Short);
    read_multiline.setRequired(false);
    modal.addComponents(new ActionRowBuilder().addComponents(read_multiline));

    maxwords.setCustomId("maxwords")
    maxwords.setLabel("最大で何文字まで読むのだ？[10~50]")
    maxwords.setStyle(TextInputStyle.Short);
    maxwords.setRequired(false);
    modal.addComponents(new ActionRowBuilder().addComponents(maxwords));

    unif.setCustomId("unif")
    unif.setLabel("読み上げるキャラクターやパラメーターを統一するのだ？[はい/いいえ]")
    unif.setStyle(TextInputStyle.Short);
    unif.setRequired(false);
    modal.addComponents(new ActionRowBuilder().addComponents(unif));

	modal.setCustomId("modal_voicevox_setting_server_config")
	modal.setTitle("サーバーの構成設定");

    return modal;
}

//辞書追加GUIの作成
async function createDictAddGUI(){
    const surface = new TextInputBuilder();
    const pronunciation = new TextInputBuilder();
    const accent = new TextInputBuilder();
    const priority = new TextInputBuilder();
    const modal = new ModalBuilder();


    surface.setCustomId("surface")
    surface.setLabel("読み方を覚える言葉を入力するのだ！")
    surface.setStyle(TextInputStyle.Short);
    surface.setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(surface));

    pronunciation.setCustomId("pronunciation")
    pronunciation.setLabel("読み方をカタカナで入力するのだ！")
    pronunciation.setStyle(TextInputStyle.Short);
    pronunciation.setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(pronunciation));

    accent.setCustomId("accent")
    accent.setLabel("アクセントが下がる位置を入力するのだ！")
    accent.setStyle(TextInputStyle.Short);
    accent.setRequired(false);
    modal.addComponents(new ActionRowBuilder().addComponents(accent));

    priority.setCustomId("priority")
    priority.setLabel("この読み方をする優先度を入力するのだ！[1~9]")
    priority.setStyle(TextInputStyle.Short);
    priority.setRequired(false);
    modal.addComponents(new ActionRowBuilder().addComponents(priority));

	modal.setCustomId("modal_voicevox_dictionary_add");
	modal.setTitle("辞書の追加");

    return modal;
}

//辞書削除GUIの作成
async function createDictDelGUI(){
    const uuid = new TextInputBuilder();
    const modal = new ModalBuilder();

    uuid.setCustomId("uuid")
    uuid.setLabel("読み方を忘れる言葉のuuidを入力するのだ！")
    uuid.setStyle(TextInputStyle.Short);
    uuid.setRequired(false);
    modal.addComponents(new ActionRowBuilder().addComponents(uuid));

	modal.setCustomId("modal_voicevox_dictionary_delete");
	modal.setTitle("辞書の削除");

    return modal;
}

//GUIメニューの実行
async function guiMenu(interaction, channel_map, subsc_map, speakers){
    //サーバー以外を除外
    if(!interaction.guild){
        console.log("後で修正");
        return;
    }
    
    switch(interaction.values[0]){
        case "voicevox_start_exe" : {
            await interaction.deferUpdate();
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            await vv_start.exe(interaction, channel_map, subsc_map);
            break;
        }
        case "voicevox_end_exe" : {
            await interaction.deferUpdate();
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            await vv_end.exe(interaction, channel_map, subsc_map);
            break;
        }
        case "voicevox_setting_user_speaker_style_exe" : {
            await interaction.deferUpdate();
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            await interaction.editReply(await createSpeakerStyleGUI("voicevox_setting_user_id_3_exe", speakers, true));
            break;
        }
        case "voicevox_setting_user_parameter_exe" : {
            await interaction.showModal(await createParameterGUI(interaction));
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            break;
        }
        case "voicevox_setting_server_config_exe" : {
            await interaction.showModal(await createConfigGUI(interaction));
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            break;
        }
        case "voicevox_setting_server_speaker_style_exe" : {
            await interaction.deferUpdate();
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            await interaction.editReply(await createSpeakerStyleGUI("voicevox_setting_user_id_3_exe", speakers, false));
            break;
        }
        case "voicevox_setting_server_parameter_exe" : {
            await interaction.showModal(await createParameterGUI(interaction));
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            break;
        }
        case "voicevox_dictionary_add_exe" : {
            await interaction.showModal(await createDictAddGUI());
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            break;
        }
        case "voicevox_dictionary_delete_exe" : {
            await interaction.showModal(await createDictDelGUI());
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            break;
        }
        case "voicevox_help_start_exe" : {
            const option = {content : "start"};
            await interaction.deferUpdate();
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            await vv_help.exe(interaction, option);
            break;
        }
        case "voicevox_help_end_exe" : {
            const option = {content : "end"};
            await interaction.deferUpdate();
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            await vv_help.exe(interaction, option);
            break;
        }
        case "voicevox_help_setting_user_exe" : {
            const option = {content : "setting_user"};
            await interaction.deferUpdate();
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            await vv_help.exe(interaction, option);
            break;
        }
        case "voicevox_help_setting_server_exe" : {
            const option = {content : "setting_server"};
            await interaction.deferUpdate();
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            await vv_help.exe(interaction, option);
            break;
        }
        case "voicevox_help_dictionary_add_exe" : {
            const option = {content : "dictionary_add"};
            await interaction.deferUpdate();
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            await vv_help.exe(interaction, option);
            break;
        }
        case "voicevox_help_dictionary_delete_exe" : {
            const option = {content : "dictionary_delete"};
            await interaction.deferUpdate();
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            await vv_help.exe(interaction, option);
            break;
        }
        default : break;
    }

    return 0;
}

//GUIボタンの実行
async function guiButton(interaction, speakers){

    await interaction.deferUpdate();
    await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});

    switch(true){
        case /user_id/.test(interaction.customId) : {
            await interaction.editReply(await createSpeakerStyleGUI(interaction.customId, speakers, true));
            break;
        }
        case /server_id/.test(interaction.customId) : {
            await interaction.editReply(await createSpeakerStyleGUI(interaction.customId, speakers, false));
            break;
        }
        case /voicevox_setting_user/.test(interaction.customId) : {
            const options = {speaker: null, style: null, speed: null, pitch: null, intonation: null, volume: null, username: null};
            options.speaker = interaction.customId.split("_")[3];
            options.style = interaction.customId.split("_")[4];
            await vv_setting_user.exe(interaction, speakers, options);
            break;
        }
        case /voicevox_setting_server/.test(interaction.customId) : {
            const options = {need_sudo: null, read_name: null, read_sameuser: null, read_multiline: null, maxwords: null, unif: null, speaker: null, style: null, speed: null, pitch: null, intonation: null, volume: null};
            options.speaker = interaction.customId.split("_")[3];
            options.style = interaction.customId.split("_")[4];
            await vv_setting_server.exe(interaction, speakers, options);
            break;
        }
        default : break;
    }

    return 0;
}

//GUIモーダルの実行
async function guiModal(interaction, speakers){
    await interaction.deferUpdate();
    await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});

    switch(true){
        case /voicevox_setting_user/.test(interaction.customId) : {
            const options = {speaker: null, style: null, speed: null, pitch: null, intonation: null, volume: null, username: null};
            options.speed = (interaction.fields.fields.has("speed") && interaction.fields.getTextInputValue("speed") && !isNaN(interaction.fields.getTextInputValue("speed"))) ? Math.min(Math.max(parseFloat(interaction.fields.getTextInputValue("speed")), 0.50), 2.00) : null;
            options.pitch = (interaction.fields.fields.has("pitch") && interaction.fields.getTextInputValue("pitch") && !isNaN(interaction.fields.getTextInputValue("pitch"))) ? Math.min(Math.max(parseFloat(interaction.fields.getTextInputValue("pitch")), -0.15), 0.15) : null;
            options.intonation = (interaction.fields.fields.has("intonation") && interaction.fields.getTextInputValue("intonation") && !isNaN(interaction.fields.getTextInputValue("intonation"))) ? Math.min(Math.max(parseFloat(interaction.fields.getTextInputValue("intonation")), 0.00), 2.00) : null;
            options.volume = (interaction.fields.fields.has("volume") && interaction.fields.getTextInputValue("volume") && !isNaN(interaction.fields.getTextInputValue("volume"))) ? Math.min(Math.max(parseFloat(interaction.fields.getTextInputValue("volume")), 0.00), 2.00) : null;
            options.username = (interaction.fields.fields.has("username") && interaction.fields.getTextInputValue("username")) ? interaction.fields.getTextInputValue("username") : null;
            await vv_setting_user.exe(interaction, speakers, options);
            break;
        }
        case /voicevox_setting_server/.test(interaction.customId) : {
            const options = {need_sudo: null, read_name: null, read_sameuser: null, read_multiline: null, maxwords: null, unif: null, speaker: null, style: null, speed: null, pitch: null, intonation: null, volume: null};
            options.read_name = (interaction.fields.fields.has("read_name") && interaction.fields.getTextInputValue("read_name")) ? interaction.fields.getTextInputValue("read_name").match(/(true|True|TRUE|yes|Yes|YES|はい|する)/) ? true : false : null;
            options.read_sameuser = (interaction.fields.fields.has("read_sameuser") && interaction.fields.getTextInputValue("read_sameuser")) ? interaction.fields.getTextInputValue("read_sameuser").match(/(true|True|TRUE|yes|Yes|YES|はい|する)/) ? true : false : null;
            options.read_multiline = (interaction.fields.fields.has("read_multiline") && interaction.fields.getTextInputValue("read_sameuser")) ? interaction.fields.getTextInputValue("read_sameuser").match(/(true|True|TRUE|yes|Yes|YES|はい|する)/) ? true : false : null;
            options.maxwords = (interaction.fields.fields.has("maxwords") && interaction.fields.getTextInputValue("maxwords") && !isNaN(interaction.fields.getTextInputValue("maxwords"))) ? Math.min(Math.max(parseFloat(interaction.fields.getTextInputValue("maxwords")), 10), 50) : null;
            options.unif = (interaction.fields.fields.has("unif") && interaction.fields.getTextInputValue("unif")) ? interaction.fields.getTextInputValue("unif").match(/(true|True|TRUE|yes|Yes|YES|はい|する)/) ? true : false : null;
            options.speed = (interaction.fields.fields.has("speed") && interaction.fields.getTextInputValue("speed") && !isNaN(interaction.fields.getTextInputValue("speed"))) ? Math.min(Math.max(parseFloat(interaction.fields.getTextInputValue("speed")), 0.50), 2.00) : null;
            options.pitch = (interaction.fields.fields.has("pitch") && interaction.fields.getTextInputValue("pitch") && !isNaN(interaction.fields.getTextInputValue("pitch"))) ? Math.min(Math.max(parseFloat(interaction.fields.getTextInputValue("pitch")), -0.15), 0.15) : null;
            options.intonation = (interaction.fields.fields.has("intonation") && interaction.fields.getTextInputValue("intonation") && !isNaN(interaction.fields.getTextInputValue("intonation"))) ? Math.min(Math.max(parseFloat(interaction.fields.getTextInputValue("intonation")), 0.00), 2.00) : null;
            options.volume = (interaction.fields.fields.has("volume") && interaction.fields.getTextInputValue("volume") && !isNaN(interaction.fields.getTextInputValue("volume"))) ? Math.min(Math.max(parseFloat(interaction.fields.getTextInputValue("volume")), 0.00), 2.00) : null;
            await vv_setting_server.exe(interaction, speakers, options);
            break;
        }case /voicevox_dictionary_add/.test(interaction.customId) : {
            const options = {surface: null, pronunciation: null, accent: null, priority: null}
            options.surface = interaction.fields.getTextInputValue("surface");
            options.pronunciation = interaction.fields.getTextInputValue("pronunciation");
            options.accent = (interaction.fields.fields.has("accent") && interaction.fields.getTextInputValue("accent") && !isNaN(interaction.fields.getTextInputValue("accent"))) ? parseInt(interaction.fields.getTextInputValue("accent")) : 1;
            options.priority = (interaction.fields.fields.has("priority") && interaction.fields.getTextInputValue("priority") && !isNaN(interaction.fields.getTextInputValue("priority"))) ? Math.min(Math.max(parseInt(interaction.fields.getTextInputValue("priority")), 1), 9) : 5;
            await vv_dictionary_add.exe(interaction, options);
            break;
        }case /voicevox_dictionary_delete/.test(interaction.customId) : {
            const options = {need_sudo: null, read_name: null, read_sameuser: null, read_multiline: null, maxwords: null, unif: null, speaker: null, style: null, speed: null, pitch: null, intonation: null, volume: null};
            options.uuid = (interaction.fields.fields.has("uuid") && interaction.fields.getTextInputValue("uuid")) ? interaction.fields.getTextInputValue("uuid") : null;
            await vv_dictionary_delete.exe(interaction, options);
            break;
        }
        default : break;
    }

    return 0;
}