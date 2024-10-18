/*****************
    cohere.js
    スニャイヴ
    2024/10/18
*****************/

module.exports = {
    getCmd: getCmd,
    cuiCmd: cuiCmd,
    sendAns: sendAns,
}

const help = require('./help');
const question = require('./question');

//コマンドの取得
function getCmd(){
    const cmds = [help.getCmd(), question.getCmd()];
    return cmds;
}

//コマンドの実行
async function cuiCmd(interaction){
    switch(interaction.commandName){
        case "cohere" : {
            await question.showModal(interaction);
            break;
        }
        case "cohere_help" : {
            await help.sendHelp(interaction);
            break;
        }
        default : break;
    }

    return;
}

//回答の送信
async function sendAns(msgInte, readme){
    await question.sendAns(msgInte, readme);
    return;
}