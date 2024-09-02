/*****************
    db.js
    スニャイヴ
    2024/08/26
*****************/

module.exports = {
    getUserInfo: getUserInfo,
    setUserInfo: setUserInfo,
    getServerInfo: getServerInfo,
    setServerInfo: setServerInfo,
}

const Keyv = require('keyv');
const user = new Keyv('sqlite://db.sqlite', {table: 'user'});
const server = new Keyv('sqlite://db.sqlite', {teble: 'server'})

//ユーザ情報を取得する
async function getUserInfo(id){
    user.on('error', e => console.error('データベースの接続に失敗しました:', e));
    return (await user.get(id)) || {username: null, speaker: null, uuid: null, style: null, id: null, speed: 1.00, pitch: 0.00, intonation: 1.00, volume: 1.00};
}

//ユーザ情報を保存する
async function setUserInfo(id, info){
    user.on('error', e => console.error('データベースの接続に失敗しました:', e));
    await user.set(id, info);
    return;
}

//サーバ情報を取得する
async function getServerInfo(id){
    server.on('error', e => console.error('データベースの接続に失敗しました:', e));
    return (await server.get(id)) || {need_sudo: false, read_name: true, continue_name: true, continue_line: true, maxwords: 50, unif: false, speaker: "ずんだもん", uuid: "388f246b-8c41-4ac1-8e2d-5d79f3ff56d9", style: "ノーマル", id: 3, speed: 1.00, pitch: 0.00, intonation: 1.00, volume: 1.00, dict: {}};
}

//サーバ情報を保存する
async function setServerInfo(id, info){
    server.on('error', e => console.error('データベースの接続に失敗しました:', e));
    await server.set(id, info);
    return;
}