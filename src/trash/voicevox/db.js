/*****************
    db.js
    スニャイヴ
    2024/01/24
*****************/

module.exports = {
    getUserInfo: getUserInfo,
    setUserInfo: setUserInfo,
    getServerInfo: getServerInfo,
    setServerInfo: setServerInfo,
}

const Keyv = require('keyv');
const user = new Keyv('sqlite://db.sqlite', {table: 'voicevox_user'});
const server = new Keyv('sqlite://db.sqlite', {teble: 'voicevox_server'})

user.on('error', e => console.error('データベースの接続に失敗しました:', e));
server.on('error', e => console.error('データベースの接続に失敗しました:', e));

//ユーザ情報を取得する
async function getUserInfo(id){
    const info = await user.has(id) ? await user.get(id) : {username: null, speaker: null, uuid: null, style: null, id: null, speed: 1.00, pitch: 0.00, intonation: 1.00, volume: 1.00};
    if(info.username === undefined){info.username = null;}
    if(info.speaker === undefined){info.speaker = null;}
    if(info.uuid === undefined){info.uuid = null;}
    if(info.style === undefined){info.style = null;}
    if(info.id === undefined){info.id = null;}
    if(info.speed === undefined){info.speed = 1.00;}
    if(info.pitch === undefined){info.pitch = 0.00;}
    if(info.intonation === undefined){info.intonation = 1.00;}
    if(info.volume === undefined){info.volume = 1.00;}
    return info;
}

//ユーザ情報を保存する
async function setUserInfo(id, info){
    await user.set(id, info);
    return 0;
}

//サーバ情報を取得する
async function getServerInfo(id){
    const info = await server.has(id) ? await server.get(id) : {need_sudo: false, read_name: true, read_sameuser: false, read_multiline: true, maxwords: 50, unif: false, speaker: "ずんだもん", uuid: "388f246b-8c41-4ac1-8e2d-5d79f3ff56d9", style: "ノーマル", id: 3, speed: 1.00, pitch: 0.00, intonation: 1.00, volume: 1.00, dict: {}};
    if(info.need_sudo === undefined){info.need_sudo = false;}
    if(info.read_name === undefined){info.read_name = true;}
    if(info.read_sameuser === undefined){info.read_sameuser = false;}
    if(info.read_multiline === undefined){info.read_multiline = true;}
    if(info.maxwords === undefined){info.maxwords = 50;}
    if(info.unif === undefined){info.unif = false;}
    if(info.speaker === undefined){info.speaker = "ずんだもん";}
    if(info.uuid === undefined){info.uuid = "388f246b-8c41-4ac1-8e2d-5d79f3ff56d9";}
    if(info.style === undefined){info.style = "ノーマル";}
    if(info.id === undefined){info.id = 3;}
    if(info.speed === undefined){info.speed = 1.00;}
    if(info.pitch === undefined){info.pitch = 0.00;}
    if(info.intonation === undefined){info.intonation = 1.00;}
    if(info.volume === undefined){info.volume = 1.00;}
    if(info.dict === undefined){info.dict = {};}
    return info;
}

//サーバ情報を保存する
async function setServerInfo(id, info){
    await server.set(id, info);
    return 0;
}