/*****************
    guide.js
    スニャイヴ
    2024/10/11
*****************/

module.exports = {
    sendBell: sendBell,
    sendCmds: sendCmds,
}

const bell = require('./bell');
const cmds = require('./cmds');
const cmd_vv = require('./cmdVoicevox');
const cmd_zm = require('./cmdZundamocchi');

//ベルの送信
function sendBell(message){
    bell.sendBell(message);
    return;
}

//GUIコマンド群の送信
async function sendCmds(interaction){
    await cmds.sendCmds(interaction);
    return;
}