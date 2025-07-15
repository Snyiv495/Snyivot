/*****************
    qna.js
    スニャイヴ
    2025/05/11
*****************/

module.exports = {
    cuiCmd: cuiCmd,
    guiMenu: guiMenu,
    guiButton: guiButton,
    guiModal: guiModal
}

const qna_cui = require('./cui');
const qna_gui = require('./gui');

//コマンドの実行
async function cuiCmd(interaction, map){
    await qna_cui.cmd(interaction, map);
    return 0;
}

//メニューの実行
async function guiMenu(interaction, map){
    await qna_gui.menu(interaction, map);
    return 0;
}

//ボタンの実行
async function guiButton(interaction, map){
    await qna_gui.button(interaction, map);
    return 0;
}

//モーダルの実行
async function guiModal(interaction, map){
    await qna_gui.modal(interaction, map);
    return 0;
}