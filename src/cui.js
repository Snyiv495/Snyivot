/*****************
    cui.js
    スニャイヴ
    2024/10/21
*****************/

module.exports = {
    getSlashCmds: getSlashCmds,
}

const cohere = require('./cohere/cohere');
const voicevox = require('./voicevox/voicevox');

//コマンドの取得
function getSlashCmds(){
    const cmd_cohere = cohere.getCmd();
    const cmd_voicevox = voicevox.getSlashCmd();
    
    const cmds = cmd_cohere.concat(cmd_voicevox);

    return cmds;
}