/******************
    voicevox.js    
    スニャイヴ
    2024/06/12
******************/

module.exports = {
    getSpeakers: getSpeakers,
    getCmd: getCmd,
    voicevox: voicevox,
    voicevox_autocomplete: voicevox_autocomplete,
    read: read,
    autoStop: autoStop,
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

//voicevoxコマンド
async function voicevox(interaction, channel_map, subsc_map, speakers){
    await vv_cmd.voicevox(interaction, channel_map, subsc_map, speakers);
}

//voicevoxコマンドの補助
async function voicevox_autocomplete(interaction, channel_map, speakers){
    await vv_cmd.voicevox_autocomplete(interaction, channel_map, speakers);
}

//読み上げ
async function read(message, subsc){
    await vv_read.read(message, subsc);
}

//自動停止
function autoStop(oldState, channel_map, subsc_map){
    vv_observe.autoStop(oldState, channel_map, subsc_map);
}

//強制終了
function compulsionEnd(oldState, channel_map, subsc_map){
    vv_observe.compulsionEnd(oldState, channel_map, subsc_map);
}

//強制移動
function compulsionMove(oldState, newState, channel_map, subsc_map){
    vv_observe.compulsionMove(oldState, newState, channel_map, subsc_map);
}