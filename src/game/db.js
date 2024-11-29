/*****************
    db.js
    スニャイヴ
    2024/11/20
*****************/

module.exports = {
    getUserInfo: getUserInfo,
    setUserInfo: setUserInfo,
    getServerInfo: getServerInfo,
    setServerInfo: setServerInfo,
}

const Keyv = require('keyv');
const user = new Keyv('sqlite://db.sqlite', {table: 'casino_user'});
const server = new Keyv('sqlite://db.sqlite', {teble: 'casino_server'})

//ユーザ情報を取得する
async function getUserInfo(id){
    user.on('error', e => console.error('データベースの接続に失敗しました:', e));
    return (await user.get(id)) || {last_interaction: null, coins: 0, slot_state: 0, slot_bet: 0, slot_interval: null, slot_left_stop: false, slot_center_stop: false, slot_right_stop: false, slot_left_line: 0, slot_center_line: 0, slot_right_line: 0, payout: 0};
}

//ユーザ情報を保存する
async function setUserInfo(id, info){
    user.on('error', e => console.error('データベースの接続に失敗しました:', e));
    await user.set(id, info);
    return 0;
}

//サーバ情報を取得する
async function getServerInfo(id){
    server.on('error', e => console.error('データベースの接続に失敗しました:', e));
    return (await server.get(id)) || {};
}

//サーバ情報を保存する
async function setServerInfo(id, info){
    server.on('error', e => console.error('データベースの接続に失敗しました:', e));
    await server.set(id, info);
    return 0;
}