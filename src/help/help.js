/*****************
    help.js
    スニャイヴ
    2024/09/03    
*****************/

module.exports = {
    getCmd: getCmd,
    help: help,
    menu_home: menu_home,
    menu_voicevox: menu_voicevox,
    menu_help: menu_help,
    menu_help_voicevox_1: menu_help_voicevox_1,
    menu_help_voicevox_2: menu_help_voicevox_2,
}

const help_cmd = require('./cmd');

//コマンドの取得
function getCmd(){
    return help_cmd.getCmd();
}

//helpコマンド
async function help(interaction){
    await interaction.deferReply({ephemeral: true});
    help_cmd.help(interaction);
    return;
}

//ホームメニュー
function menu_home(message){
    help_cmd.menu_home(message);
    return;
}

//voicevoxメニュー
async function menu_voicevox(interaction){
    await interaction.deferReply({ephemeral: true});
    help_cmd.menu_voicevox(interaction);
    return;
}

//ヘルプメニュー
async function menu_help(interaction){
    await interaction.deferReply({ephemeral: true});
    help_cmd.menu_help(interaction);
    return;
}

//voicevoxヘルプメニュー1
async function menu_help_voicevox_1(interaction){
    await interaction.deferReply({ephemeral: true});
    help_cmd.menu_help_voicevox_1(interaction);
    return;
}

//voicevoxヘルプメニュー2
async function menu_help_voicevox_2(interaction){
    await interaction.deferReply({ephemeral: true});
    help_cmd.menu_help_voicevox_2(interaction);
    return;
}