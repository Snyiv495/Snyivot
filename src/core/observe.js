/*****************
    observe.js
    スニャイヴ
    2025/05/19
*****************/

module.exports = {
    textChannel : textChannel,
    voiceChannel: voiceChannel,
}

const read = require('../features/read');

//テキストチャンネルの監視
async function textChannel(message, map){
    try{
        await read.observeTC(message, map);
        return 0;
    }catch(e){
        throw new Error(e);
    }
}

//ボイスチャンネルの監視
function voiceChannel(old_state, new_state, map){
    try{
        read.observeVC(old_state, new_state, map);
        return 0;
    }catch(e){
        throw new Error(e);
    }
}