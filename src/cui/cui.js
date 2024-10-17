/*****************
    cui.js
    スニャイヴ
    2024/10/17
*****************/

module.exports = {
    getCmds: getCmds,
    createProgressbar: createProgressbar,
    stepProgress: stepProgress,
}

const progressbar = require('./progressbar');
const cohere = require('../cohere/cohere');
const voicevox = require('../voicevox/voicevox');

//コマンドの取得
function getCmds(){
    const cmd_cohere = cohere.getCmd();
    const cmd_voicevox = voicevox.getCmd();
    const cmds = cmd_cohere.concat(cmd_voicevox);

    return cmds;
}

async function createProgressbar(interaction, stepNum){
    return await progressbar.createProgressbar(interaction, stepNum);
}

async function stepProgress(interaction, progress){
    return await progressbar.stepProgress(interaction, progress);
}