/******************
    voicevox.js    
    スニャイヴ
    2024/10/16
******************/

module.exports = {
    getSpeakers: getSpeakers,
    getCmd: getCmd,
    setUser: setUser,
    setUser_autocomplete: setUser_autocomplete,
    setServer: setServer,
    setServer_autocomplete: setServer_autocomplete,
    start: start,
    read: read,
    end: end,
    autoEnd: autoEnd,
    compulsionEnd: compulsionEnd,
    compulsionMove: compulsionMove,
    dictAdd: dictAdd,
    dictDel: dictDel,
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

//ユーザー情報の設定
async function setUser(interaction, speakers){
    await vv_setUser.setUser(interaction, speakers);
    return;
}

//サーバー情報の設定
async function setServer(interaction, speakers){
    await vv_setServer.setServer(interaction, speakers);
    return;
}

//voicevoxコマンドの補助
async function setUser_autocomplete(interaction, speakers){
    await vv_setUser.setUser_autocomplete(interaction, speakers);
    return;
}

//voicevoxコマンドの補助
async function setServer_autocomplete(interaction, speakers){
    await vv_setServer.setServer_autocomplete(interaction, speakers);
    return;
}

//開始
async function start(interaction, channel_map, subsc_map){
    await vv_start.start(interaction, channel_map, subsc_map);
    return;
}

//読み上げ
function read(message, subsc){
    vv_read.read(message, subsc);
    return;
}

//終了
async function end(interaction, channel_map, subsc_map){
    await vv_end.end(interaction, channel_map, subsc_map);
    return;
}

//自動停止
function autoEnd(oldState, channel_map, subsc_map){
    vv_observe.autoEnd(oldState, channel_map, subsc_map);
    return;
}

//強制終了
function compulsionEnd(oldState, channel_map, subsc_map){
    vv_observe.compulsionEnd(oldState, channel_map, subsc_map);
    return;
}

//強制移動
function compulsionMove(oldState, newState, channel_map, subsc_map){
    vv_observe.compulsionMove(oldState, newState, channel_map, subsc_map);
    return;
}

//辞書の追加
async function dictAdd(interaction){
    await vv_dictAdd.dictAdd(interaction);
    return;
}

//辞書の削除
async function dictDel(interaction){
    await vv_dictDel.dictDel(interaction);
    return;
}