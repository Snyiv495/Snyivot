/*****************
    game.js
    スニャイヴ
    2024/12/05
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
async function cuiCmd(interaction, casino_slot_map){
    cui.cmd(interaction, casino_slot_map);
    return 0;
}

//GUIメニューの実行
async function guiMenu(interaction, casino_slot_map){
    await gui.menu(interaction, casino_slot_map);
    return 0;
}

//GUIボタンの実行
async function guiButton(interaction, casino_slot_map){
    await gui.button(interaction, casino_slot_map);
    return 0;
}

//GUIモーダルの実行
async function guiModal(interaction){
    await gui.modal(interaction);
    return 0;
}