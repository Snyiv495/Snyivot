/*****************
    help.js
    スニャイヴ
    2024/07/08    
*****************/

module.exports = {
    getCmd: getCmd,
    help, help,
}

const help_cmd = require('./cmd');

//コマンドの取得
function getCmd(){
    return help_cmd.getCmd();
}

//helpコマンド
function help(interaction){
    help_cmd.help(interaction);
}
