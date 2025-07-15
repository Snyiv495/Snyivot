/******************
    readout.js    
    スニャイヴ
    2025/02/25
******************/

module.exports = {
    getCmd: getCmd,
    cuiCmd: cuiCmd,
    guiMenu: guiMenu,
    guiButton: guiButton,
    guiModal: guiModal,
    autocomplete: autocomplete,
    observe: observe,
    exe: execute
}

const readout_cui = require('./cui');
const readout_gui = require('./gui')
const readout_observe = require('./execute/observe');
const readout_execute = require('./execute/execute');

//コマンドの取得
function getCmd(){
    return readout_cui.getCmds();
}

//コマンドの実行
async function cuiCmd(interaction, channel_map, subsc_map, speakers){
    readout_cui.cmd(interaction, channel_map, subsc_map, speakers);
    return 0;
}

//GUIメニューの実行
async function guiMenu(interaction, channel_map, subsc_map, speakers){
    await readout_gui.menu(interaction, channel_map, subsc_map, speakers);
    return 0;
}

//GUIボタンの実行
async function guiButton(interaction, speakers){
    await readout_gui.button(interaction, speakers);
    return 0;
}

//GUIモーダルの実行
async function guiModal(interaction, speakers){
    await readout_gui.modal(interaction, speakers);
    return 0;
}

//コマンドの補助
async function autocomplete(interaction, speakers){
    readout_cui.autocomplete(interaction, speakers)
    return 0;
}

//読み上げ
function execute(message, subsc){
    readout_execute.exe(message, subsc);
    return 0;
}

//VCの監視
function observe(oldState, newState, map){
    //自動終了
    if(map.get(`voice_${oldState.channelId}`) && oldState.channel.members.filter((member)=>!member.user.bot).size < 1){
        readout_observe.autoEnd(oldState, map);
        return 0;
    }

    //強制退出時の処理
    if(map.get(`voice_${oldState.channelId}`) && !oldState.channel.members.has(process.env.BOT_ID) && !newState.channel){
        readout_observe.compulsionEnd(oldState, map);
        return 0;
    }

    //強制移動時の処理
    if(map.get(`voice_${oldState.channelId}`) && !oldState.channel.members.has(process.env.BOT_ID) && newState.channel){
        readout_observe.compulsionMove(oldState, newState, map);
        return 0;
    }

    return -1;
}