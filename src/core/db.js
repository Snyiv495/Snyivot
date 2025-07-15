/*****************
    db.js
    スニャイヴ
    2025/07/15
*****************/

module.exports = {
    getUserInfo: getUserInfo,
    setUserInfo: setUserInfo,
    getServerInfo: getServerInfo,
    setServerInfo: setServerInfo,
}

const Keyv = require('keyv');

const user = new Keyv('sqlite://db.sqlite', {table: 'user'});
const server = new Keyv('sqlite://db.sqlite', {table: 'server'});
const pre_user = new Keyv('sqlite://db.sqlite', {table: 'voicevox_user'});  //一定期間引継ぎ用

user.on('error', e => console.error('データベースの接続に失敗しました:', e));
server.on('error', e => console.error('データベースの接続に失敗しました:', e));
pre_user.on('error', e => console.error('データベースの接続に失敗しました:', e));   //一定期間引継ぎ用

//ユーザ情報を取得する
async function getUserInfo(id){
    const info = await user.has(id) ? await user.get(id) : 
    {
        username: null,
        gemini_log: [],
        vv_uuid: null,
        vv_id: null,
        vv_pitch: null,
        vv_intonation: null,
    };

    //一定期間引継ぎ用
    if(!(await user.has(id)) && await pre_user.has(id)){
        const pre_info = await pre_user.get(id);
        info.username = pre_info.username ?? info.username;
        info.vv_uuid = pre_info.uuid ?? info.vv_uuid;
        info.vv_id = pre_info.id ?? info.vv_id;
        info.vv_pitch = pre_info.pitch ?? info.vv_pitch;
        info.vv_intonation = pre_info.intonation ?? info.vv_intonation;
    }

    info.username = info.username ?? null;
    info.gemini_log = info.gemini_log ?? [];
    info.vv_uuid = info.vv_uuid ?? null;
    info.vv_id = info.vv_id ?? null;
    info.vv_pitch = info.vv_pitch ?? null;
    info.vv_intonation = info.vv_intonation ?? null;

    return info;
}

//ユーザ情報を保存する
async function setUserInfo(id, info){
    await user.set(id, info);
    return 0;
}

//サーバ情報を取得する
async function getServerInfo(id){
    const info = await server.has(id) ? await server.get(id) : 
    {
        read_username: true,
        read_username_always: false,
        read_max: 50,
        read_dict: [],
        read_app: "VOICEVOX",
        read_set_override: false,

        vv_uuid: "35b2c544-660e-401e-b503-0e14c635303a",
        vv_id: 8,
        vv_speed: 1.00,
        vv_pitch: 0.00,
        vv_intonation: 1.00,
        vv_volume: 1.00,
        vv_dict: {}
    };

    info.read_username = info.read_username ?? true;
    info.read_username_always = info.read_username_always ?? false;
    info.read_max = info.read_max ?? 50;
    info.read_dict = info.read_dict ?? [];
    info.read_app = info.read_app ?? "voicevox";
    info.read_set_override = info.read_set_override ?? false;

    info.vv_uuid = info.vv_uuid ?? "35b2c544-660e-401e-b503-0e14c635303a";
    info.vv_id = info.vv_id ?? 8;
    info.vv_speed = info.vv_speed ?? 1.00;
    info.vv_pitch = info.vv_pitch ?? 0.00;
    info.vv_intonation = info.vv_intonation ?? 1.00;
    info.vv_volume = info.vv_volume ?? 1.00;
    info.vv_dict = info.vv_dict ?? {};
    
    return info;
}

//サーバ情報を保存する
async function setServerInfo(id, info){
    await server.set(id, info);
    return 0;
}