/*****************
    cohere.js
    スニャイヴ
    2024/09/12
*****************/

module.exports = {
    getCmd: getCmd,
    invoke_mention: invoke_mention,
    invoke_cmd: invoke_cmd,
    invoke_modal: invoke_modal,
}

const cohere_cmd = require('./cmd');

//コマンドの取得
function getCmd(){
    return cohere_cmd.getCmd();
}

//メンションからの呼び出し
async function invoke_mention(message, readme){
    await cohere_cmd.invoke_mention(message, readme);
    return;
}

//コマンドからの呼び出し
async function invoke_cmd(interaction, readme){
    await cohere_cmd.invoke_cmd(interaction, readme);
    return;
}

//モーダルからの呼び出し
async function invoke_modal(interaction, readme){
    await cohere_cmd.invoke_modal(interaction, readme);
    return;
}