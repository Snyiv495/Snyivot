/*****************
    ai.js
    スニャイヴ
    2025/03/19
*****************/

module.exports = {
    getCmd: getCmd,
    cuiCmd: cuiCmd,
    cuiMention: cuiMention,
    guiMenu: guiMenu,
    guiButton: guiButton,
    guiModal: guiModal
}

const ai_cui = require('./cui');
const ai_gui = require('./gui');

//コマンドの取得
function getCmd(){
    return ai_cui.getCmds();
}

//メンションの実行
async function cuiMention(message, map){
    await ai_cui.mention(message, map);
    return 0;
}

//コマンドの実行
async function cuiCmd(interaction, map){
    await ai_cui.cmd(interaction, map);
    return 0;
}

//メニューの実行
async function guiMenu(interaction, map){
    await ai_gui.menu(interaction, map);
    return 0;
}

//ボタンの実行
async function guiButton(interaction, map){
    await ai_gui.button(interaction, map);
    return 0;
}

//モーダルの実行
async function guiModal(interaction, map){
    await ai_gui.modal(interaction, map);
    return 0;
}