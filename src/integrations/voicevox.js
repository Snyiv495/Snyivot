/******************
    voicevox.js
    スニャイヴ
    2025/05/26
******************/

module.exports = {
    postAudioQuery: postAudioQuery,
    postSynthesis: postSynthesis,
    getSpeakers: getSpeakers,
    getSpeakerInfo: getSpeakerInfo,
    getUserDict: getUserDict,
    postUserDictWord: postUserDictWord,
    putUserDictWord: putUserDictWord,
    deleteUserDictWord: deleteUserDictWord,
    postImportUserDict: postImportUserDict
}

const axios = require('axios').create({baseURL: process.env.VOICEVOX_SERVER, proxy: false});
const fs = require('fs');

//クエリの作成
async function postAudioQuery(text, speaker_id){
    try{
        return await axios.post(`audio_query?text=${encodeURIComponent(text)}&speaker=${speaker_id}`, null, {headers:{"accept" : "application/json"}});
    }catch(e){
        throw new Error(e);
    }
}

//合成音声の作成
async function postSynthesis(query, speaker_id){
    try{
        return await axios.post(`synthesis?speaker=${speaker_id}&enable_interrogative_upspeak=true`, JSON.stringify(query.data),{responseType: "arraybuffer", headers: {"accept" : "audio/wav", "Content-Type" : "application/json"}});
    }catch(e){
        throw new Error(e);
    }
}

//スピーカーの取得
async function getSpeakers(){
    try{
        return await axios.get("speakers");
    }catch(e){
        throw new Error(e);
    }
}

//スピーカー情報の取得
async function getSpeakerInfo(uuid){
    try{
        return await axios.get(`speaker_info?speaker_uuid=${uuid}`);
    }catch(e){
        throw new Error(e);
    }
}

//辞書の取得
async function getUserDict(){
    try{
        return await axios.get("user_dict", {headers:{"accept" : "application/json"}});
    }catch(e){
        throw new Error(e);
    }
}

//辞書に単語追加
async function postUserDictWord(surface, pronunciation, accent, priority){
    try{
        return await axios.post(`user_dict_word?surface=${encodeURI(surface)}&pronunciation=${encodeURI(pronunciation)}&accent_type=${accent}&priority=${priority}`, {headers:{"accept" : "application/json"}});
    }catch(e){
        throw new Error(e);
    }
}

//辞書の単語更新
async function putUserDictWord(uuid, surface, pronunciation, accent, priority){
    try{
        return await axios.put(`user_dict_word/${uuid}?surface=${encodeURI(surface)}&pronunciation=${encodeURI(pronunciation)}&accent_type=${accent}&priority=${priority}`, {headers:{"accept" : "*/*"}});
    }catch(e){
        throw new Error(e);
    }
}

//辞書の単語削除
async function deleteUserDictWord(uuid){
    try{
        return await axios.delete(`user_dict_word/${uuid}`, {headers:{"accept" : "*/*"}});
    }catch(e){
        throw new Error(e);
    }
}

//辞書のインポート
async function postImportUserDict(dictionary){
    try{
        fs.unlink(process.env.VOICEVOX_DICTIONARY, (e) => {});
        return await axios.post("import_user_dict?override=true", dictionary, {headers:{"Content-Type": "application/json"}});
    }catch(e){
        throw new Error(e);
    }
}