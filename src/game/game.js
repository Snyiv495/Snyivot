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
async function cuiCmd(interaction, game_slot_map){
    gm_cui.cmd(interaction, game_slot_map);
    return 0;
}

//GUIメニューの実行
async function guiMenu(interaction, game_slot_map){
    await gm_gui.menu(interaction, game_slot_map);
    return 0;
}

//GUIボタンの実行
async function guiButton(interaction, game_slot_map){
    await gm_gui.button(interaction, game_slot_map);
    return 0;
}

//GUIモーダルの実行
async function guiModal(interaction){
    await gm_gui.modal(interaction);
    return 0;
}