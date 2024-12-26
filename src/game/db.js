/*****************
    db.js
    スニャイヴ
    2024/12/13
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
    const info = await user.has(id) ? await user.get(id) : {money: 0, coins: 0};
    if(info.money == undefined){info.money = 0;}
    if(info.coins == undefined){info.coins = 0;}
    return info;
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
    const info = await server.has(id) ? await server.get(id) : {casino_slot_jackpot: 100};
    if(info.casino_slot_jackpot == undefined){info.casino_slot_jackpot = 100};
    return info;
}

//サーバ情報を保存する
async function setServerInfo(id, info){
    server.on('error', e => console.error('データベースの接続に失敗しました:', e));
    await server.set(id, info);
    return 0;
}