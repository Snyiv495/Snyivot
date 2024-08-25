/******************
    voicevox.js    
    スニャイヴ
    2024/08/26
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
    dictAdd: dictAdd,
    dictDel: dictDel,
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
    await interaction.deferReply({ephemeral: true});
    vv_cmd.setUser(interaction, speakers);
    return;
}

//サーバー情報の設定
async function setServer(interaction, speakers){
    await interaction.deferReply({ephemeral: false});
    vv_cmd.setServer(interaction, speakers);
    return;
}

//voicevoxコマンドの補助
function autocomplete(interaction, channel_map, speakers){
    vv_cmd.autocomplete(interaction, channel_map, speakers);
    return;
}

//開始
async function start(interaction, channel_map, subsc_map){
    await interaction.deferReply({ephemeral: false});
    vv_cmd.start(interaction, channel_map, subsc_map);
    return;
}

//読み上げ
function read(message, subsc){
    vv_read.read(message, subsc);
    return;
}

//終了
async function end(interaction, channel_map, subsc_map){
    await interaction.deferReply({ephemeral: false});
    vv_cmd.end(interaction, channel_map, subsc_map);
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
    await interaction.deferReply({ephemeral: false});
    vv_cmd.dictAdd(interaction);
    return;
}

//辞書の削除
async function dictDel(interaction){
    await interaction.deferReply({ephemeral: false});
    vv_cmd.dictDel(interaction);
    return;
}