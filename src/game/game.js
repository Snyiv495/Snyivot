/*****************
    game.js
    スニャイヴ
    2024/11/20
*****************/

module.exports = {
    getSlashCmd: getSlashCmd,
    cuiCmd: cuiCmd,
    guiMenu: guiMenu,
    guiButton: guiButton,
    guiModal: guiModal
}

require('dotenv').config();
const gm_cui = require('./cui');
const gm_gui = require('./gui');

//コマンドの取得
function getSlashCmd(){
    return gm_cui.getSlashCmds();
}

//CUIコマンドの実行
async function cuiCmd(interaction){
    gm_cui.cmd(interaction);
    return 0;
}

//GUIメニューの実行
async function guiMenu(interaction){
    await gm_gui.menu(interaction);
    return 0;
}

//GUIボタンの実行
async function guiButton(interaction){
    await gm_gui.button(interaction);
    return 0;
}

//GUIモーダルの実行
async function guiModal(interaction){
    await gm_gui.modal(interaction);
    return 0;
}