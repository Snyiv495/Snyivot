/******************
    voicevox.js    
    スニャイヴ
    2024/10/17
******************/

module.exports = {
    getSpeakers: getSpeakers,
    getCmd: getCmd,
    CuiCmd: CuiCmd,
    autocomplete: autocomplete,
    read: read,
    observe: observe,
}

require('dotenv').config();
const axios = require('axios').create({baseURL: process.env.VOICEVOX_SERVER, proxy: false});
const vv_start = require('./start');
const vv_end = require('./end');
const vv_setUser = require('./setUser');
const vv_setServer = require('./setServer');
const vv_dictAdd = require('./dictAdd');
const vv_dictDel = require('./dictDel');
const vv_read = require('./read');
const vv_observe = require('./observe');

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
function getCmd(){
    return [vv_start.getCmd(), vv_end.getCmd(), vv_setUser.getCmd(), vv_setServer.getCmd(), vv_dictAdd.getCmd(), vv_dictDel.getCmd()];
}

//コマンドの実行
async function CuiCmd(interaction, channel_map, subsc_map, vv_speakers){
    switch(interaction.commandName){
        case "voicevox_start" : {
            await vv_start.start(interaction, channel_map, subsc_map);
            break;
        }
        case "voicevox_end" : {
            await vv_end.end(interaction, channel_map, subsc_map);
            break;
        }
        case "voicevox_setting_user" : {
            await vv_setUser.setUser(interaction, vv_speakers);
            break;
        }
        case "voicevox_setting_server" : {
            await vv_setServer.setServer(interaction, vv_speakers);
            break;
        }
        case "voicevox_dictionary_add" : {
            await vv_dictAdd.dictAdd(interaction);
            break;
        }
        case "voicevox_dictionary_delete" : {
            await vv_dictDel.dictDel(interaction);
            break;
        }
        default : break;
    }

    return;
}

//コマンドの補助
async function autocomplete(interaction, speakers){
    switch(interaction.commandName){
        case "voicevox_setting_user" : {
            await vv_setUser.setUser_autocomplete(interaction, speakers);
            break;
        }
        case "voicevox_setting_server" : {
            await vv_setServer.setServer_autocomplete(interaction, speakers);
            break;
        }
    }
    return;
}

//読み上げ
function read(message, subsc){
    vv_read.read(message, subsc);
    return;
}

//VCの監視
function observe(oldState, newState, channel_map, subsc_map){
    //自動終了
    if(subsc_map.get(oldState.channelId) && oldState.channel.members.filter((member)=>!member.user.bot).size < 1){
        vv_observe.autoEnd(oldState, channel_map, subsc_map);
        return;
    }

    //強制退出時の処理
    if(subsc_map.get(oldState.channelId) && !oldState.channel.members.has(process.env.BOT_ID) && !newState.channel){
        vv_observe.compulsionEnd(oldState, channel_map, subsc_map);
        return;
    }

    //強制移動時の処理
    if(subsc_map.get(oldState.channelId) && !oldState.channel.members.has(process.env.BOT_ID) && newState.channel){
        vv_observe.compulsionMove(oldState, newState, channel_map, subsc_map);
        return;
    }

    return;
}