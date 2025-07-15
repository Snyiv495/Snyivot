/*****************
    db.js
    スニャイヴ
    2024/01/27
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
    const info = await user.has(id) ? await user.get(id) : {money: 0, fox: 0, fox_update: null, zundamocchi_hp: 0, zundamocchi_mp: 0, zundamocchi_pp: 0, zundamocchi_hp_update: null, zundamocchi_mp_update: null, zundamocchi_pp_update: null, casino_coin: 0, casino_ticket: 0};
    if(info.money === undefined){info.money = 0;}
    if(info.fox === undefined){info.fox = 0;}
    if(info.fox_update === undefined){info.fox_update = null;}
    if(info.zundamocchi_hp === undefined){info.zundamocchi_hp = 0;}
    if(info.zundamocchi_mp === undefined){info.zundamocchi_mp = 0;}
    if(info.zundamocchi_pp === undefined){info.zundamocchi_pp = 0;}
    if(info.zundamocchi_hp_update === undefined){info.zundamocchi_hp_update = null;}
    if(info.zundamocchi_mp_update === undefined){info.zundamocchi_mp_update = null;}
    if(info.zundamocchi_pp_update === undefined){info.zundamocchi_pp_update = null;}
    if(info.casino_coin === undefined){if(info.coin){info.casino_coin=info.coin;}else{info.casino_coin = 0;}}
    if(info.ticket === undefined){if(info.ticket){info.casino_ticket=info.ticket;}else{info.casino_ticket = 0;}}
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