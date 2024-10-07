/*****************
    help.js
    スニャイヴ
    2024/10/07    
*****************/

module.exports = {
    getCmd: getCmd,
    menu: menu,
    help: help,
}

const help_cmd = require('./cmd');

//コマンドの取得
function getCmd(){
    return help_cmd.getCmd();
}

//メニュー
async function menu(interaction){
    await help_cmd.menu(interaction);
    return;
}

//helpコマンド
async function help(interaction){
    await help_cmd.help(interaction);
    return;
}