/*****************
    cui.js
    スニャイヴ
    2024/10/15
*****************/

module.exports = {
    getCmds: getCmds,
}

const cohere = require('../cohere/cohere');
const voicevox = require('../voicevox/voicevox');

//コマンドの取得
function getCmds(){
    const cmd_cohere = cohere.getCmd();
    const cmd_voicevox = voicevox.getCmd();
    const cmds = cmd_cohere.concat(cmd_voicevox);

    return cmds;
}