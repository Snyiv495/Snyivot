/*****************
    cui.js
    スニャイヴ
    2024/12/16
*****************/

module.exports = {
    getSlashCmds: getSlashCmds,
    cmd: cmd,
    autocomplete: autocomplete,
    createProgressbar: createProgressbar,
    stepProgressbar: stepProgressbar,
}

require('dotenv').config();
const {SlashCommandBuilder} = require('discord.js');
const vv_start = require('./execute/start');
const vv_end = require('./execute/end');
const vv_setting_user = require('./execute/setUser');
const vv_setting_server = require('./execute/setServer');
const vv_autocomplete = require('./execute/autocomplete');
const vv_dictionary_add = require('./execute/dictAdd');
const vv_dictionary_delete = require('./execute/dictDel');
const vv_help = require('./execute/help');

//スラッシュコマンドの取得
function getSlashCmds(){
    const slashCmds = [];

    slashCmds.push(getStartCmd());
    slashCmds.push(getEndCmd());
    slashCmds.push(getSetUserCmd());
    slashCmds.push(getSetServerCmd());
    slashCmds.push(getDictAddCmd());
    slashCmds.push(getDictDelCmd());
    slashCmds.push(getHelpCmd());

    return slashCmds;
}

//開始コマンドの取得
function getStartCmd(){
    const start = new SlashCommandBuilder();

    start.setName("voicevox_start");
    start.setDescription("voicevoxの読み上げ開始コマンドなのだ！");

    return start;
}

//終了コマンドの取得
function getEndCmd(){
    const end = new SlashCommandBuilder();

    end.setName("voicevox_end");
    end.setDescription("voicevoxの終了コマンドなのだ！");
    
    return end;
}

//ユーザー設定コマンドの取得
function getSetUserCmd(){
    const setting_user = new SlashCommandBuilder();

    setting_user.setName("voicevox_setting_user");
    setting_user.setDescription("voicevoxのユーザー用設定コマンドなのだ！");
    setting_user.addStringOption(option => {
        option.setName("speaker");
        option.setDescription("キャラ名を入力するのだ！");
        option.setAutocomplete(true);
        return option;
    });
    setting_user.addStringOption(option => {
        option.setName("style");
        option.setDescription("キャラのスタイルを入力するのだ！");
        option.setAutocomplete(true);
        return option;
    });
    setting_user.addNumberOption(option => {
        option.setName("speed");
        option.setDescription("読み上げの速度を入力するのだ！[0.5~2.0]");
        option.setMaxValue(2.0);
        option.setMinValue(0.5);
        return option;
    });
    setting_user.addNumberOption(option => {
        option.setName("pitch");
        option.setDescription("読み上げの高さを入力するのだ！[-0.15~0.15]");
        option.setMaxValue(0.15);
        option.setMinValue(-0.15);
        return option;
    });
    setting_user.addNumberOption(option => {
        option.setName("intonation");
        option.setDescription("読み上げの抑揚を入力するのだ！[0.0~2.0]");
        option.setMaxValue(2.0);
        option.setMinValue(0.0);
        return option;
    });
    setting_user.addNumberOption(option => {
        option.setName("volume");
        option.setDescription("読み上げの音量を入力するのだ！[0.0~2.0]");
        option.setMaxValue(2.0);
        option.setMinValue(0.0);
        return option;
    });
    setting_user.addStringOption(option => {
        option.setName("username");
        option.setDescription("読み上げに使うあなたの名前を入力するのだ！");
        return option;
    });
    
    return setting_user;
}

//サーバー設定コマンドの取得
function getSetServerCmd(){
    const setting_server = new SlashCommandBuilder();

    setting_server.setName("voicevox_setting_server")
    setting_server.setDescription("voicevoxのサーバー用設定コマンドなのだ！")
    setting_server.addBooleanOption(option => {
        option.setName("need_sudo");
        option.setDescription("このコマンドの利用に管理者権限を必要とするのだ？");
        return option;
    });
    setting_server.addBooleanOption(option => {
        option.setName("read_name");
        option.setDescription("読み上げ時に名前を読み上げるのだ？");
        return option;
    });
    setting_server.addBooleanOption(option => {
        option.setName("read_sameuser");
        option.setDescription("発言者が連続しても名前を読み上げるのだ？");
        return option;
    });
    setting_server.addBooleanOption(option => {
        option.setName("read_multiline");
        option.setDescription("複数行の文章も全て読み上げるのだ？");
        return option;
    });
    setting_server.addIntegerOption(option => {
        option.setName("maxwords");
        option.setDescription("読み上げる最大文字数を入力するのだ！[10~50]");
        option.setMaxValue(50);
        option.setMinValue(10);
        return option;
    });
    setting_server.addBooleanOption(option => {
        option.setName("unif");
        option.setDescription("全員の読み上げ音声をサーバー設定で統一するのだ？");
        return option;
    });
    setting_server.addStringOption(option => {
        option.setName("speaker");
        option.setDescription("キャラ名を入力するのだ！");
        option.setAutocomplete(true);
        return option;
    });
    setting_server.addStringOption(option => {
        option.setName("style");
        option.setDescription("キャラのスタイルを入力するのだ！");
        option.setAutocomplete(true);
        return option;
    });
    setting_server.addNumberOption(option => {
        option.setName("speed");
        option.setDescription("読み上げの速度を入力するのだ！[0.5~2.0]");
        option.setMaxValue(2.0);
        option.setMinValue(0.5);
        return option;
    });
    setting_server.addNumberOption(option => {
        option.setName("pitch");
        option.setDescription("読み上げの高さを入力するのだ！[-0.15~0.15]");
        option.setMaxValue(0.15);
        option.setMinValue(-0.15);
        return option;
    });
    setting_server.addNumberOption(option => {
        option.setName("intonation");
        option.setDescription("読み上げの抑揚を入力するのだ！[0.0~2.0]");
        option.setMaxValue(2.0);
        option.setMinValue(0.0);
        return option;
    });
    setting_server.addNumberOption(option => {
        option.setName("volume");
        option.setDescription("読み上げの音量を入力するのだ！[0.0~2.0]");
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
    dictionary_add.setDescription("voicevoxの辞書追加コマンドなのだ！")
    dictionary_add.addStringOption(option => {
        option.setName("surface");
        option.setDescription("覚える言葉を入力するのだ！");
        option.setRequired(true);
        return option;
    });
    dictionary_add.addStringOption(option => {
        option.setName("pronunciation");
        option.setDescription("発音を「カタカナ」で入力するのだ！");
        option.setRequired(true);
        return option;
    });
    dictionary_add.addIntegerOption(option => {
        option.setName("accent");
        option.setDescription("語調が下がるのは何文字目かを入力するのだ！");
        return option;
    });
    dictionary_add.addIntegerOption(option => {
        option.setName("priority");
        option.setDescription("読み替えを行う優先度を入力するのだ！");
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
    dictionary_delete.setDescription("voicevoxの辞書削除コマンドなのだ！")
    dictionary_delete.addStringOption(option => {
        option.setName("uuid");
        option.setDescription("削除したい言葉のuuidを入力するのだ！");
        return option;
    });
    
    return dictionary_delete;
}

//ヘルプコマンドの取得
function getHelpCmd(){
    const help = new SlashCommandBuilder();

    help.setName("voicevox_help");
    help.setDescription("voicevoxのヘルプコマンドなのだ！");
    help.addStringOption(option => {
        option.setName("content");
        option.setDescription("内容を選択するのだ！");
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

//CUIコマンドの実行
async function cmd(interaction, map, speakers){
    //サーバー以外を除外
    if(!interaction.guild){
        console.log("後で修正");
        return -1;
    }

    switch(interaction.commandName){
        case "voicevox_start" : {
            await vv_start.exe(interaction, map);
            break;
        }
        case "voicevox_end" : {
            await vv_end.exe(interaction, map);
            break;
        }
        case "voicevox_setting_user" : {
            const options = {speaker: null, style: null, speed: null, pitch: null, intonation: null, volume: null, username: null};
            options.speaker = interaction.options.get("speaker") ? interaction.options.get("speaker").value : null;
            options.style = interaction.options.get("style") ? interaction.options.get("style").value : null;
            options.speed = interaction.options.get("speed") ? interaction.options.get("speed").value : null;
            options.pitch = interaction.options.get("pitch") ? interaction.options.get("pitch").value : null;
            options.intonation = interaction.options.get("intonation") ? interaction.options.get("intonation").value : null;
            options.volume = interaction.options.get("volume") ? interaction.options.get("volume").value : null;
            options.username = interaction.options.get("username") ? interaction.options.get("username").value : null;
            await vv_setting_user.exe(interaction, speakers, options);
            break;
        }
        case "voicevox_setting_server" : {
            const options = {need_sudo: null, read_name: null, read_sameuser: null, read_multiline: null, maxword: null, unif: null, speaker: null, style: null, speed: null, pitch: null, intonation: null, volume: null, username: null};
            options.need_sudo = interaction.options.get("need_sudo") ? interaction.options.get("need_sudo").value : null;
            options.read_name = interaction.options.get("read_name") ? interaction.options.get("read_name").value : null;
            options.read_sameuser = interaction.options.get("read_sameuser") ? interaction.options.get("read_sameuser").value : null;
            options.read_multiline = interaction.options.get("read_multiline") ? interaction.options.get("read_multiline").value : null;
            options.maxword = interaction.options.get("maxword") ? interaction.options.get("maxword").value : null;
            options.unif = interaction.options.get("unif") ? interaction.options.get("unif").value : null;            
            options.speaker = interaction.options.get("speaker") ? interaction.options.get("speaker").value : null;
            options.style = interaction.options.get("style") ? interaction.options.get("style").value : null;
            options.speed = interaction.options.get("speed") ? interaction.options.get("speed").value : null;
            options.pitch = interaction.options.get("pitch") ? interaction.options.get("pitch").value : null;
            options.intonation = interaction.options.get("intonation") ? interaction.options.get("itonation").value : null;
            options.volume = interaction.options.get("volume") ? interaction.options.get("volume").value : null;
            await vv_setting_server.exe(interaction, speakers, options);
            break;
        }
        case "voicevox_dictionary_add" : {
            const options = {surface: null, pronunciation: null, accent: null, priority: null};
            options.surface = interaction.options.get("surface").value;
            options.pronunciation = interaction.options.get("pronunciation").value;
            options.accent = interaction.options.get("accent") ? interaction.options.get("accent").value : 1;
            options.priority = interaction.options.get("priority") ? interaction.options.get("priority").value : 5;
            await vv_dictionary_add.exe(interaction, options);
            break;
        }
        case "voicevox_dictionary_delete" : {
            const options = {uuid: null};
            options.uuid = interaction.options.get("uuid") ? interaction.options.get("uuid").value : null;
            await vv_dictionary_delete.exe(interaction, options);
            break;
        }
        case "voicevox_help" : {
            const options = {content : null};
            options.content = interaction.options.get("content").value;
            await vv_help.exe(interaction, options);
            break;
        }
        default : break;
    }

    return -1;
}

//CUIコマンドの補助
async function autocomplete(interaction, speakers){
    await vv_autocomplete.exe(interaction, speakers);
    return;
}

//進捗バーの作成
async function createProgressbar(interaction, stepMax){
    const progress = {interaction: interaction, current: 0, step: 100.0/stepMax};

    try{await interaction.deferReply({ephemeral: true});}catch(e){};
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