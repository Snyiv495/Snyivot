/******************
    voicevox.js    
    スニャイヴ
    2024/12/16
******************/

module.exports = {
    getSpeakers: getSpeakers,
    getSlashCmd: getSlashCmd,
    cuiCmd: cuiCmd,
    guiMenu: guiMenu,
    guiButton: guiButton,
    guiModal: guiModal,
    autocomplete: autocomplete,
    read: read,
    observe: observe,
}

require('dotenv').config();
const axios = require('axios').create({baseURL: process.env.VOICEVOX_SERVER, proxy: false});
const vv_cui = require('./cui');
const vv_gui = require('./gui')
const vv_read = require('./execute/read');
const vv_observe = require('./execute/observe');

//スピーカーの取得
async function getSpeakers(){
    let speakers;
    await axios.get("speakers").then(
        function(res){
            speakers = res.data;
        }
    ).catch(
        function(){
            console.log("### VOICEVOXサーバーからスピーカー情報を取得できませんでした ###\n### 再起動して下さい ###\n");
            process.exit();
        }
    );

    return speakers;
}

//コマンドの取得
function getSlashCmd(){
    return vv_cui.getSlashCmds();
}

//CUIコマンドの実行
async function cuiCmd(interaction, channel_map, subsc_map, speakers){
    vv_cui.cmd(interaction, channel_map, subsc_map, speakers);
    return 0;
}

//GUIメニューの実行
async function guiMenu(interaction, channel_map, subsc_map, speakers){
    await vv_gui.menu(interaction, channel_map, subsc_map, speakers);
    return 0;
}

//GUIボタンの実行
async function guiButton(interaction, speakers){
    await vv_gui.button(interaction, speakers);
    return 0;
}

//GUIモーダルの実行
async function guiModal(interaction, speakers){
    await vv_gui.modal(interaction, speakers);
    return 0;
}

//コマンドの補助
async function autocomplete(interaction, speakers){
    vv_cui.autocomplete(interaction, speakers)
    return 0;
}

//読み上げ
function read(message, subsc){
    vv_read.exe(message, subsc);
    return 0;
}

//VCの監視
function observe(oldState, newState, map){
    //自動終了
    if(map.get(`voice_${oldState.channelId}`) && oldState.channel.members.filter((member)=>!member.user.bot).size < 1){
        vv_observe.autoEnd(oldState, map);
        return 0;
    }

    //強制退出時の処理
    if(map.get(`voice_${oldState.channelId}`) && !oldState.channel.members.has(process.env.BOT_ID) && !newState.channel){
        vv_observe.compulsionEnd(oldState, map);
        return 0;
    }

    //強制移動時の処理
    if(map.get(`voice_${oldState.channelId}`) && !oldState.channel.members.has(process.env.BOT_ID) && newState.channel){
        vv_observe.compulsionMove(oldState, newState, map);
        return 0;
    }

    return -1;
}