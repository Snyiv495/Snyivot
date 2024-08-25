/*****************
    help.js
    スニャイヴ
    2024/08/26    
*****************/

module.exports = {
    getCmd: getCmd,
    help: help,
    menu_home: menu_home,
    menu_voicevox: menu_voicevox,
    menu_help: menu_help,
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
function menu_voicevox(interaction){
    help_cmd.menu_voicevox(interaction);
    return;
}

//ヘルプメニュー
function menu_help(interaction){
    help_cmd.menu_help(interaction);
    return;
}
