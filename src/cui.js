/*****************
    cui.js
    スニャイヴ
    2024/10/29
*****************/

module.exports = {
    getSlashCmds: getSlashCmds,
}

const cohere = require('./cohere/cohere');
const voicevox = require('./voicevox/voicevox');

//コマンドの取得
function getSlashCmds(){
    let cmds = [];

    //cmds = cmds.concat(cohere.getSlashCmd());
    cmds = cmds.concat(voicevox.getSlashCmd());

    return cmds;
}