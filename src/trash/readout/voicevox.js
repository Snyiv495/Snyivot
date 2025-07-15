/******************
    voicevox.js
    スニャイヴ
    2025/02/25
******************/

module.exports = {
    getSpeakers: getSpeakers
}

require('dotenv').config();
const voicevox = require('axios').create({baseURL: process.env.VOICEVOX_SERVER, proxy: false});

//スピーカーの取得
async function getSpeakers(){

    try{
        const res = await voicevox.get("speakers");
        return res.data;
    }catch(e){
        throw new Error(e);
    }

}
