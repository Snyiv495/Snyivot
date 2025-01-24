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
const user = new Keyv('sqlite://db.sqlite', {table: 'casino_user'});
const server = new Keyv('sqlite://db.sqlite', {teble: 'casino_server'})

user.on('error', e => console.error('データベースの接続に失敗しました:', e));
server.on('error', e => console.error('データベースの接続に失敗しました:', e));

//ユーザ情報を取得する
async function getUserInfo(id){
    const info = await user.has(id) ? await user.get(id) : {money: 0, fox: 0, fox_update: null, coin: 0, ticket: 0};
    if(info.money === undefined){info.money = 0;}
    if(info.fox === undefined){info.fox = 0;}
    if(info.fox_update === undefined){info.fox_update = null;}
    if(info.coin === undefined){info.coin = 0;}
    if(info.ticket === undefined){info.ticket = 0;}
    return info;
}

//ユーザ情報を保存する
async function setUserInfo(id, info){
    await user.set(id, info);
    return 0;
}

//サーバ情報を取得する
async function getServerInfo(id){
    const info = await server.has(id) ? await server.get(id) : {shop_fox_update: null, shop_fox_price: [], casino_slot_jackpot_coin: 100};
    if(info.shop_fox_update === undefined){info.shop_fox_update = null};
    if(info.shop_fox_price === undefined){info.shop_fox_price = []};
    if(info.casino_slot_jackpot_coin === undefined){info.casino_slot_jackpot_coin = 100};
    return info;
}

//サーバ情報を保存する
async function setServerInfo(id, info){
    await server.set(id, info);
    return 0;
}