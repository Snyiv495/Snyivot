/*****************
    gui.js
    スニャイヴ
    2024/10/15
*****************/

module.exports = {
    sendBell: sendBell,
    sendGui: sendGui,
}

const bell = require('./bell');
const guide = require('./guide');

//ベルの送信
function sendBell(message){
    bell.sendBell(message);
    return;
}

//GUIの送信
async function sendGui(interaction){
    await guide.sendGui(interaction);
    return;
}