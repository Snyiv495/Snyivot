/*****************
    cohere.js
    スニャイヴ
    2024/10/10
*****************/

module.exports = {
    getCmd: getCmd,
    showModal: showModal,
    sendAns: sendAns,
}

const cohere_question = require('./question');

//コマンドの取得
function getCmd(){
    return cohere_question.getCmd();
}

//モーダルの作成
async function showModal(interaction){
    await cohere_question.showModal(interaction);
    return;
}

//回答の送信
async function sendAns(msgInte, readme){
    await cohere_question.sendAns(msgInte, readme);
    return;
}