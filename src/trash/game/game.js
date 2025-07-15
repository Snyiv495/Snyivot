/*****************
    game.js
    スニャイヴ
    2024/12/16
*****************/

module.exports = {
    getSlashCmd: getSlashCmd,
    cuiCmd: cuiCmd,
    guiMenu: guiMenu,
    guiButton: guiButton,
    guiModal: guiModal
}

require('dotenv').config();
const cui = require('./cui');
const gui = require('./gui');

//コマンドの取得
function getSlashCmd(){
    return cui.getSlashCmds();
}

//CUIコマンドの実行
async function cuiCmd(interaction, map){
    cui.cmd(interaction, map);
    return 0;
}

//GUIメニューの実行
async function guiMenu(interaction, map){
    await gui.menu(interaction, map);
    return 0;
}

//GUIボタンの実行
async function guiButton(interaction, map){
    await gui.button(interaction, map);
    return 0;
}

//GUIモーダルの実行
async function guiModal(interaction, map){
    await gui.modal(interaction, map);
    return 0;
}