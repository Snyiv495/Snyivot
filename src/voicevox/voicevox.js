/******************
    voicevox.js    
    スニャイヴ
    2024/10/21
******************/

module.exports = {
    getSpeakers: getSpeakers,
    getSlashCmd: getSlashCmd,
    getMenu: getMenu,
    cuiCmd: cuiCmd,
    guiCmd: guiCmd,
    autocomplete: autocomplete,
    read: read,
    observe: observe,
}

require('dotenv').config();
const axios = require('axios').create({baseURL: process.env.VOICEVOX_SERVER, proxy: false});
const cui = require('./cui');
const gui = require('./gui')
const exe_read = require('./execute/read');
const exe_observe = require('./execute/observe');

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
    return cui.getSlashCmds();
}

function getMenu(){
    return gui.getMenu();;
}

//CUIコマンドの実行
async function cuiCmd(interaction, channel_map, subsc_map, speakers){
    cui.cuiCmd(interaction, channel_map, subsc_map, speakers);
    return 0;
}

//GUIコマンドの実行
async function guiCmd(interaction, channel_map, subsc_map, speakers){
    await gui.guiCmd(interaction, channel_map, subsc_map, speakers);
    return 0;
}

//コマンドの補助
async function autocomplete(interaction, speakers){
    cui.autocomplete(interaction, speakers)
    return 0;
}

//読み上げ
function read(message, subsc){
    exe_read.read(message, subsc);
    return 0;
}

//VCの監視
function observe(oldState, newState, channel_map, subsc_map){
    //自動終了
    if(subsc_map.get(oldState.channelId) && oldState.channel.members.filter((member)=>!member.user.bot).size < 1){
        exe_observe.autoEnd(oldState, channel_map, subsc_map);
        return 0;
    }

    //強制退出時の処理
    if(subsc_map.get(oldState.channelId) && !oldState.channel.members.has(process.env.BOT_ID) && !newState.channel){
        exe_observe.compulsionEnd(oldState, channel_map, subsc_map);
        return 0;
    }

    //強制移動時の処理
    if(subsc_map.get(oldState.channelId) && !oldState.channel.members.has(process.env.BOT_ID) && newState.channel){
        exe_observe.compulsionMove(oldState, newState, channel_map, subsc_map);
        return 0;
    }

    return -1;
}