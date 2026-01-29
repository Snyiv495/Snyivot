/*****************
    db.js
    スニャイヴ
    2025/12/16
*****************/

module.exports = {
    getUserInfo : getUserInfo,
    setUserInfo : setUserInfo,
    getServerInfo : getServerInfo,
    setServerInfo : setServerInfo,
}

const Keyv = require('keyv');
const helper = require('./helper');

const user = new Keyv('sqlite://db.sqlite', {table: 'user'});
const server = new Keyv('sqlite://db.sqlite', {table: 'server'});

user.on("error", e => console.error("db.js => user.on() \n データベースの接続に失敗しました \n", e));
server.on("error", e => console.error("db.js => server.on() \n データベースの接続に失敗しました \n", e));

//ユーザ情報を取得する
async function getUserInfo(id, map){
    const info = await user.has(id) ? await user.get(id) : 
    {
        username: null,
        gemini_log: [],
        vv_uuid: null,
        vv_id: null,
        vv_pitch: null,
        vv_intonation: null,
        uranai: {}
    };

    info.gemini_log = info.gemini_log ?? [];
    info.uranai = info.uranai ?? {};

    return info;
}

//ユーザ情報を保存する
async function setUserInfo(id, info){
    try{
        await user.set(id, info);
        return;
    }catch(e){
        throw new Error(`db.js => setUserInfo() \n ${e}`);
    }
}

//サーバ情報を取得する
async function getServerInfo(id, map){
    const vv_config = helper.getConfig("VOICEVOX", map);
    const info = await server.has(id) ? await server.get(id) : 
    {
        read_username: true,
        read_username_always: false,
        read_set_override: false,
        read_max: 50,

        vv_uuid: vv_config.uuid,
        vv_id: vv_config.id,
        vv_speed: vv_config.speed,
        vv_pitch: vv_config.pitch,
        vv_intonation: vv_config.intonation,
        vv_volume: vv_config.volume,
        vv_dict: {}
    };

    info.read_username = info.read_username ?? true;
    info.read_username_always = info.read_username_always ?? false;
    info.read_set_override = info.read_set_override ?? false;
    info.read_max = info.read_max ?? 50;

    info.vv_uuid = info.vv_uuid ?? vv_config.uuid;
    info.vv_id = info.vv_id ?? vv_config.id;
    info.vv_speed = info.vv_speed ?? vv_config.speed;
    info.vv_pitch = info.vv_pitch ?? vv_config.pitch;
    info.vv_intonation = info.vv_intonation ?? vv_config.intonation;
    info.vv_volume = info.vv_volume ?? vv_config.volume;
    info.vv_dict = info.vv_dict ?? {};
    
    return info;
}

//サーバ情報を保存する
async function setServerInfo(id, info){
    try{
        await server.set(id, info);
        return;
    }catch(e){
        throw new Error(`db.js => setServerInfo() \n ${e}`);
    }
}