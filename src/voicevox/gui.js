/*****************
    gui.js
    スニャイヴ
    2024/10/21
*****************/

module.exports = {
    getMenu: getMenu,
    guiMenu: guiMenu,
    guiModal: guiModal,
}

require('dotenv').config();
const {StringSelectMenuOptionBuilder, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, TextInputBuilder, ModalBuilder, TextInputStyle} = require('discord.js');
const gui = require('../gui');
const exe_start = require('./execute/start');
const exe_end = require('./execute/end');
const exe_setting_user = require('./execute/setUser');
const exe_setting_server = require('./execute/setServer');
const exe_dictionary_add = require('./execute/dictAdd');
const exe_dictionary_delete = require('./execute/dictDel');
const exe_help = require('./execute/help');

//GUIメニューの取得
function getMenu(){
    const voicevox = new StringSelectMenuOptionBuilder();

    voicevox.setLabel("voicevox");
    voicevox.setDescription("読み上げができるよ!");
    voicevox.setEmoji("🎙️");
    voicevox.setValue("voicevox");

    return voicevox;
}

//開始メニューの取得
function getStartMenu(){
    const voicevox_start = new StringSelectMenuOptionBuilder();

    voicevox_start.setLabel("voicevox_start");
    voicevox_start.setDescription("読み上げを開始するよ!");
    voicevox_start.setEmoji("🔈");
    voicevox_start.setValue("voicevox_start");

    return voicevox_start;
}

//終了メニューの取得
function getEndMenu(){
    const voicevox_end = new StringSelectMenuOptionBuilder();

    voicevox_end.setLabel("voicevox_end");
    voicevox_end.setDescription("読み上げを終了するよ!");
    voicevox_end.setEmoji("🔇");
    voicevox_end.setValue("voicevox_end");

    return voicevox_end;
}

function getEndModal(){
    const modal = new ModalBuilder();
    const row = new ActionRowBuilder();
    const all = new TextInputBuilder();

    all.setCustomId("all")
    all.setLabel("全てのテキストチャンネルの読み上げを終了する？")
    all.setStyle(TextInputStyle.Short);
    all.setPlaceholder("Enter 'True' or 'False'");
    all.setValue("False");
    all.setMinLength(4);
    all.setMaxLength(5);

    row.addComponents(all);

	modal.setCustomId("voicevox_end")
	modal.setTitle("voicevox_endオプション");
    modal.addComponents(row);

    return modal;
}

//ユーザー設定メニューの取得
function getSetUserMenu(){
    const voicevox_setting_user = new StringSelectMenuOptionBuilder();

    voicevox_setting_user.setLabel("voicevox_setting_user");
    voicevox_setting_user.setDescription("ユーザー情報の設定をするよ!");
    voicevox_setting_user.setEmoji("👤");
    voicevox_setting_user.setValue("voicevox_setting_user");

    return voicevox_setting_user;
}

//サーバー設定メニューの取得
function getSetServerMenu(){
    const voicevox_setting_server = new StringSelectMenuOptionBuilder();

    voicevox_setting_server.setLabel("voicevox_setting_server");
    voicevox_setting_server.setDescription("サーバー情報の設定をするよ!");
    voicevox_setting_server.setEmoji("👥");
    voicevox_setting_server.setValue("voicevox_setting_server");

    return voicevox_setting_server;
}

//辞書追加メニューの取得
function getDictAddMenu(){
    const voicevox_dictionary_add = new StringSelectMenuOptionBuilder();

    voicevox_dictionary_add.setLabel("voicevox_dictionary_add");
    voicevox_dictionary_add.setDescription("辞書に単語を追加するよ!");
    voicevox_dictionary_add.setEmoji("📥");
    voicevox_dictionary_add.setValue("voicevox_dictionary_add");

    return voicevox_dictionary_add;
}

//辞書追加メニューの取得
function getDictDelMenu(){
    const voicevox_dictionary_delete = new StringSelectMenuOptionBuilder();

    voicevox_dictionary_delete.setLabel("voicevox_dictionary_delete");
    voicevox_dictionary_delete.setDescription("辞書の単語を削除するよ!");
    voicevox_dictionary_delete.setEmoji("📤");
    voicevox_dictionary_delete.setValue("voicevox_dictionary_delete");

    return voicevox_dictionary_delete;
}

//GUIメニューの作成
function createMenu(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const menus = new ActionRowBuilder();
    const menu = new StringSelectMenuBuilder();
    const buttons = new ActionRowBuilder();
    const voicevox_start = getStartMenu();
    const voicevox_end = getEndMenu();
    const voicevox_setting_user = getSetUserMenu();
    const voicevox_setting_server = getSetServerMenu();
    const voicevox_dictionary_add = getDictAddMenu();
    const voicevox_dictionary_delete = getDictDelMenu();
    const quit = gui.getQuitButton();
    
    embed.setTitle("voicevoxで何をするのだ？");
    embed.setThumbnail("attachment://icon.png");
    embed.setFooter({text: "メニューから選択してください"});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/think.png");

    menu.setCustomId("menu_voicevox");
    menu.setPlaceholder("何も選択されてないのだ");
    menu.addOptions(voicevox_start);
    menu.addOptions(voicevox_end);
    menu.addOptions(voicevox_setting_user);
    menu.addOptions(voicevox_setting_server);
    menu.addOptions(voicevox_dictionary_add);
    menu.addOptions(voicevox_dictionary_delete);

    menus.addComponents(menu);
    buttons.addComponents(quit);

    return {content: "", files: [attachment], embeds: [embed], components: [menus, buttons], ephemeral: true};
}

//GUIメニューの実行
async function guiMenu(interaction, channel_map, subsc_map, speakers){
    //サーバー以外を除外
    if(!interaction.guild){
        console.log("後で修正");
        return;
    }

    switch(interaction.values[0]){
        case "voicevox" : {
            await interaction.deferUpdate();
            await interaction.editReply({content: "Loading...", files: [], embeds: [], components: []});
            await interaction.editReply(createMenu(interaction, channel_map, subsc_map));
            break;
        }
        case "voicevox_start" : {
            await interaction.deferUpdate();
            await interaction.editReply({content: "Loading...", files: [], embeds: [], components: []});
            await exe_start.start(interaction, channel_map, subsc_map);
            break;
        }
        case "voicevox_end" : {
            await interaction.showModal(getEndModal());
            await interaction.editReply({content: "Loading...", files: [], embeds: [], components: []});
            break;
        }
        case "voicevox_setting_user" : {
            await exe_setting_user.setUser(interaction, speakers);
            break;
        }
        case "voicevox_setting_server" : {
            await exe_setting_server.setServer(interaction, speakers);
            break;
        }
        case "voicevox_dictionary_add" : {
            await exe_dictionary_add.dictAdd(interaction);
            break;
        }
        case "voicevox_dictionary_delete" : {
            await exe_dictionary_delete.dictDel(interaction);
            break;
        }
        case "voicevox_help" : {
            await exe_help.sendHelp(interaction);
            break;
        }
        default : break;
    }

    return 0;
}

//GUIモーダルの実行
async function guiModal(interaction, channel_map, subsc_map){
    switch(interaction.customId){
        case "voicevox_end" : {
            await exe_end.end(interaction, channel_map, subsc_map);
            break;
        }
        default : break;
    }

    return 0;
}