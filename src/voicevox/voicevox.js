/******************
    voicevox.js    
    スニャイヴ
    2024/08/20
******************/

module.exports = {
    getSpeakers: getSpeakers,
    getCmd: getCmd,
    setUser: setUser,
    setServer: setServer,
    autocomplete: autocomplete,
    start: start,
    read: read,
    end: end,
    autoEnd: autoEnd,
    compulsionEnd: compulsionEnd,
    compulsionMove: compulsionMove,
}

require('dotenv').config();
const axios = require('axios').create({baseURL: process.env.VOICEVOX_SERVER, proxy: false});
const vv_cmd = require('./cmd');
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
    return vv_cmd.getCmd();
}

//ユーザー情報の設定
async function setUser(interaction, speakers){
    await vv_cmd.setUser(interaction, speakers);
}

//サーバー情報の設定
async function setServer(interaction, speakers){
    await vv_cmd.setServer(interaction, speakers);
}

//voicevoxコマンドの補助
async function autocomplete(interaction, channel_map, speakers){
    await vv_cmd.autocomplete(interaction, channel_map, speakers);
}

//開始
function start(interaction, channel_map, subsc_map){
    vv_cmd.start(interaction, channel_map, subsc_map);
}

//読み上げ
async function read(message, subsc){
    await vv_read.read(message, subsc);
}

//終了
async function end(interaction, channel_map, subsc_map){
    vv_cmd.end(interaction, channel_map, subsc_map);
}

//自動停止
function autoEnd(oldState, channel_map, subsc_map){
    vv_observe.autoEnd(oldState, channel_map, subsc_map);
}

//強制終了
function compulsionEnd(oldState, channel_map, subsc_map){
    vv_observe.compulsionEnd(oldState, channel_map, subsc_map);
}

//強制移動
function compulsionMove(oldState, newState, channel_map, subsc_map){
    vv_observe.compulsionMove(oldState, newState, channel_map, subsc_map);
}