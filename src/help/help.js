/*****************
    help.js
    スニャイヴ
    2024/07/22    
*****************/

module.exports = {
    getCmd: getCmd,
    help: help,
    menu_home: menu_home,
    menu_help: menu_help,
}

const help_cmd = require('./cmd');

//コマンドの取得
function getCmd(){
    return help_cmd.getCmd();
}

//helpコマンド
function help(interaction){
    help_cmd.help(interaction);
    return;
}

//ホームメニュー
function menu_home(message){
    help_cmd.menu_home(message);
    return;
}

//ヘルプメニュー
function menu_help(interaction){
    help_cmd.menu_help(interaction);
    return;
}
