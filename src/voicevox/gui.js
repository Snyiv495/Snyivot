/*****************
    gui.js
    スニャイヴ
    2024/10/21
*****************/

module.exports = {
    guiCmd: guiCmd,
    getMenu: getMenu,
}

require('dotenv').config();
const {StringSelectMenuOptionBuilder, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder} = require('discord.js');
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
    voicevox_start.setEmoji("🎙️");
    voicevox_start.setValue("voicevox_start");

    return voicevox_start;
}

//GUIメニューの作成
function createMenu(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();;
    const menus = new ActionRowBuilder();
    const menu = new StringSelectMenuBuilder();
    const buttons = new ActionRowBuilder();
    const voicevox_start = getStartMenu();
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

    menus.addComponents(menu);
    buttons.addComponents(quit);

    return {content: "", files: [attachment], embeds: [embed], components: [menus, buttons], ephemeral: true};
}


//終了コマンドの取得
function getEndCmd(){
    const end = new SlashCommandBuilder();

    end.setName("voicevox_end");
    end.setDescription("voicevoxの終了コマンド");
    end.addBooleanOption(option => {
        option.setName("all");
        option.setDescription("サーバー全体の読み上げを終了する？");
        return option;
    });
    
    return end;
}

//ユーザー設定コマンドの取得
function getSetUserCmd(){
    const setting_user = new SlashCommandBuilder();

    setting_user.setName("voicevox_setting_user");
    setting_user.setDescription("voicevoxのユーザー用設定コマンド");
    setting_user.addStringOption(option => {
        option.setName("speaker");
        option.setDescription("キャラ名を入力してください");
        option.setAutocomplete(true);
        return option;
    });
    setting_user.addStringOption(option => {
        option.setName("style");
        option.setDescription("キャラのスタイルを入力してください");
        option.setAutocomplete(true);
        return option;
    });
    setting_user.addNumberOption(option => {
        option.setName("speed");
        option.setDescription("読み上げの速度を入力してください[0.5~2.0]");
        option.setMaxValue(2.0);
        option.setMinValue(0.5);
        return option;
    });
    setting_user.addNumberOption(option => {
        option.setName("pitch");
        option.setDescription("読み上げの高さを入力してください[-0.15~0.15]");
        option.setMaxValue(0.15);
        option.setMinValue(-0.15);
        return option;
    });
    setting_user.addNumberOption(option => {
        option.setName("intonation");
        option.setDescription("読み上げの抑揚を入力してください[0.0~2.0]");
        option.setMaxValue(2.0);
        option.setMinValue(0.0);
        return option;
    });
    setting_user.addNumberOption(option => {
        option.setName("volume");
        option.setDescription("読み上げの音量を入力してください[0.0~2.0]");
        option.setMaxValue(2.0);
        option.setMinValue(0.0);
        return option;
    });
    setting_user.addStringOption(option => {
        option.setName("username");
        option.setDescription("読み上げに使うあなたの名前を入力してください");
        return option;
    });
    
    return setting_user;
}

//サーバー設定コマンドの取得
function getSetServerCmd(){
    const setting_server = new SlashCommandBuilder();

    setting_server.setName("voicevox_setting_server")
    setting_server.setDescription("voicevoxのサーバー用設定コマンド")
    setting_server.addBooleanOption(option => {
        option.setName("need_sudo");
        option.setDescription("このコマンドの利用に管理者権限を必要とする？");
        return option;
    });
    setting_server.addBooleanOption(option => {
        option.setName("read_name");
        option.setDescription("読み上げ時に名前を読み上げる？");
        return option;
    });
    setting_server.addBooleanOption(option => {
        option.setName("read_sameuser");
        option.setDescription("発言者が連続しても名前を読み上げる？");
        return option;
    });
    setting_server.addBooleanOption(option => {
        option.setName("read_multiline");
        option.setDescription("複数行の文章も全て読み上げる？");
        return option;
    });
    setting_server.addIntegerOption(option => {
        option.setName("maxwords");
        option.setDescription("読み上げる最大文字数を入力してください[10~50]");
        option.setMaxValue(50);
        option.setMinValue(10);
        return option;
    });
    setting_server.addBooleanOption(option => {
        option.setName("unif");
        option.setDescription("全員の読み上げ音声をサーバー設定で統一する？");
        return option;
    });
    setting_server.addStringOption(option => {
        option.setName("speaker");
        option.setDescription("キャラ名を入力してください");
        option.setAutocomplete(true);
        return option;
    });
    setting_server.addStringOption(option => {
        option.setName("style");
        option.setDescription("キャラのスタイルを入力してください");
        option.setAutocomplete(true);
        return option;
    });
    setting_server.addNumberOption(option => {
        option.setName("speed");
        option.setDescription("読み上げの速度を入力してください[0.5~2.0]");
        option.setMaxValue(2.0);
        option.setMinValue(0.5);
        return option;
    });
    setting_server.addNumberOption(option => {
        option.setName("pitch");
        option.setDescription("読み上げの高さを入力してください[-0.15~0.15]");
        option.setMaxValue(0.15);
        option.setMinValue(-0.15);
        return option;
    });
    setting_server.addNumberOption(option => {
        option.setName("intonation");
        option.setDescription("読み上げの抑揚を入力してください[0.0~2.0]");
        option.setMaxValue(2.0);
        option.setMinValue(0.0);
        return option;
    });
    setting_server.addNumberOption(option => {
        option.setName("volume");
        option.setDescription("読み上げの音量を入力してください[0.0~2.0]");
        option.setMaxValue(2.0);
        option.setMinValue(0.0);
        return option;
    });
    
    return setting_server;
}

//辞書追加コマンドの取得
function getDictAddCmd(){
    const dictionary_add = new SlashCommandBuilder();

    dictionary_add.setName("voicevox_dictionary_add")
    dictionary_add.setDescription("voicevoxの辞書追加コマンド")
    dictionary_add.addStringOption(option => {
        option.setName("surface");
        option.setDescription("言葉を入力してください");
        option.setRequired(true);
        return option;
    });
    dictionary_add.addStringOption(option => {
        option.setName("pronunciation");
        option.setDescription("発音をカタカナで入力してください");
        option.setRequired(true);
        return option;
    });
    dictionary_add.addIntegerOption(option => {
        option.setName("accent");
        option.setDescription("語調が下がる文字の番目を入力してください");
        return option;
    });
    dictionary_add.addIntegerOption(option => {
        option.setName("priority");
        option.setDescription("読み替えを行う優先度を入力してください");
        option.setMaxValue(9);
        option.setMinValue(1);
        return option;
    });
    
    return dictionary_add;
}

//辞書削除コマンドの取得
function getDictDelCmd(){
    const dictionary_delete = new SlashCommandBuilder();

    dictionary_delete.setName("voicevox_dictionary_delete")
    dictionary_delete.setDescription("voicevoxの辞書削除コマンド")
    dictionary_delete.addStringOption(option => {
        option.setName("uuid");
        option.setDescription("削除したい言葉のuuidを入力してください");
        return option;
    });
    
    return dictionary_delete;
}

//ヘルプコマンドの取得
function getHelpCmd(){
    const help = new SlashCommandBuilder();

    help.setName("voicevox_help");
    help.setDescription("voicevoxのヘルプコマンド");
    help.addStringOption(option => {
        option.setName("content");
        option.setDescription("内容を選択してください");
        option.addChoices(
            {name: "start", value: "start"},
            {name: "end", value: "end"},
            {name: "setting_user", value: "setting_user"},
            {name: "setting_server", value: "setting_server"},
            {name: "dictionary_add", value: "dictionary_add"},
            {name: "dictionary_delete", value: "dictionary_delete"}
        );
        option.setRequired(true);
        return option;
    });
    
    return help;
}

//GUIコマンドの実行
async function guiCmd(interaction, channel_map, subsc_map, speakers){
    //サーバー以外を除外
    if(!interaction.guild){
        console.log("後で修正");
        return;
    }

    switch(interaction.values[0]){
        case "voicevox" : {
            await interaction.editReply(createMenu(interaction, channel_map, subsc_map));
            break;
        }
        case "voicevox_start" : {
            await exe_start.start(interaction, channel_map, subsc_map);
            break;
        }
        case "voicevox_end" : {
            await exe_end.end(interaction, channel_map, subsc_map);
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

//コマンドの補助
async function autocomplete(interaction, speakers){
    switch(interaction.commandName){
        case "voicevox_setting_user" : {
            await exe_setting_user.setUser_autocomplete(interaction, speakers);
            break;
        }
        case "voicevox_setting_server" : {
            await exe_setting_server.setServer_autocomplete(interaction, speakers);
            break;
        }
    }
    return;
}

//進捗バーの作成
async function createProgressbar(interaction, stepMax){
    const progress = {interaction: interaction, current: 0, step: 100.0/stepMax};

    await interaction.deferReply({ephemeral: true});
    await interaction.editReply({content: "進捗[----------]0%"});

    return progress;
}

//進捗バーの進展
async function stepProgressbar(progress){
    let bar = "";

    progress.current = ((progress.current+(progress.step*2)-1)<100) ? progress.current+progress.step : 100;
    
    for(let i=0; i<10; i++){
        if(i < Math.floor(progress.current/10)){
            bar += "#";
        }else{
            bar += "-";
        }
    }
    await progress.interaction.editReply({content: `進捗[${bar}]${Math.floor(progress.current)}%`});

    return progress;
}