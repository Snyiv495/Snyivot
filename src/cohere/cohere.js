/*****************
    cohere.js
    スニャイヴ
    2024/11/13
*****************/

module.exports = {
    getSlashCmd: getSlashCmd,
    cuiCmd: cuiCmd,
    guiMenu: guiMenu,
    guiModal: guiModal,
    mention: mention,
}

const ch_cui = require('./cui');
const ch_gui = require('./gui');
const ch_question = require('./execute/question');

//コマンドの取得
function getSlashCmd(){
    return ch_cui.getSlashCmds();
}

//コマンドの実行
async function cuiCmd(interaction, readme){
    ch_cui.cmd(interaction, readme);
    return 0;
}

//GUIメニューの実行
async function guiMenu(interaction){
    await ch_gui.menu(interaction);
    return 0;
}

//GUIボタンの実行
async function guiButton(interaction){
    await ch_gui.button(interaction);
    return 0;
}

//GUIモーダルの実行
async function guiModal(interaction, readme){
    await ch_gui.modal(interaction, readme);
    return 0;
}

//メンションの実行
async function mention(message, readme){
    await ch_question.exe(message, message.content.replace(`<@${process.env.BOT_ID}>`, ""), readme);
    return 0;
}