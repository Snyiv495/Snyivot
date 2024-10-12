/*****************
    cohere.js
    スニャイヴ
    2024/10/10
*****************/

module.exports = {
    getCmd: getCmd,
    sendHelp: sendHelp,
    showModal: showModal,
    sendAns: sendAns,
}

const help = require('./help');
const question = require('./question');

//コマンドの取得
function getCmd(){
    const cmds = [help.getCmd(), question.getCmd()];
    return cmds;
}

//ヘルプの送信
async function sendHelp(interaction){
    await help.sendHelp(interaction);
    return;
}

//モーダルの作成
async function showModal(interaction){
    await question.showModal(interaction);
    return;
}

//回答の送信
async function sendAns(msgInte, readme){
    await question.sendAns(msgInte, readme);
    return;
}