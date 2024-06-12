/*****************
    db.js
    スニャイヴ
    2024/06/12
*****************/

module.exports = {
    getInfo: getInfo,
    setInfo: setInfo,
}

const Keyv = require('keyv');
const user = new Keyv('sqlite://db.sqlite', {table: 'info'});

//ユーザ情報を取得する
async function getInfo(id){
    user.on('error', e => console.error('データベースの接続に失敗しました:', e));
    return (await user.get(id)) || {speaker_name: "ずんだもん", speaker_uuid: "388f246b-8c41-4ac1-8e2d-5d79f3ff56d9", style_name: "ノーマル", style_id: 3};
}

//ユーザ情報を保存する
async function setInfo(id, info){
    user.on('error', e => console.error('データベースの接続に失敗しました:', e));
    await user.set(id, info);
    return;
}
