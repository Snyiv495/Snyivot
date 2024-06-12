/*****************
    read.js
    スニャイヴ
    2024/06/12        
*****************/

module.exports = {
    read: read,
}

require('dotenv').config();
const {createAudioResource, entersState, AudioPlayerStatus, StreamType} = require('@discordjs/voice');
const {Readable} = require("stream");
const axios = require('axios').create({baseURL: process.env.VOICEVOX_SERVER, proxy: false});
const db = require('./db');

//文章を成形するメソッド
function formText(info, message){
    //メッセージの成形
    let text = message.cleanContent;
    //spoiler
    text = text.replace((/\|\|.*?\|\|/g), "ホニャララ");
    //URL
    text = text.replace(/(https?|ftp)(:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+)/g, "URL省略");
    //シャープの除去
    text = text.replace("#", "");
    //改行
    text = text.replace(/\r?\n/g, "、");
    //カスタム絵文字
    text = text.replace(/<:[a-zA-Z0-9_]+:[0-9]+>/g, "");
    //文字数制限
    if(text.length > 53){
        text = text.substr(0, 50);
        text += "以下略";
    }
    //名前
    text = message.member.displayName + "さん、" + text;

    return text;
}

//wavを作成するメソッド
async function createWav(info, text){
    let wav = null;

    //合成音声の取得
    await axios.post(`audio_query?text=${encodeURI(text)}&speaker=${info.style_id}`, {headers:{"accept" : "application/json"}})
        .then(async function(res){
            res.data.speedScale = info.speedScale;
            res.data.pitchScale = info.pitchScale;
            res.data.intonationScale = info.intonationScale;
            res.data.volumeScale = info.volumeScale;
            res.data.prePhonemeLength = info.prePhonemeLength;
            res.data.postPhonemeLength = info.postPhonemeLength;

            await axios.post(`synthesis?speaker=${info.style_id}&enable_interrogative_upspeak=true`, JSON.stringify(res.data),
                {responseType: "arraybuffer",
                    headers: {
                        "accept" : "audio/wav",
                        "Content-Type" : "application/json"
                    }
                })
                .then(function(res){
                    const stream = new Readable();
                    stream.push(res.data);
                    stream.push(null);
                    wav = createAudioResource(stream, {inputType: StreamType.Arbitrary});
                })
                .catch(function(){
                    console.log("### VOICEVOXサーバとの接続が不安定です ###");
                }
            )
        })
        .catch(function(){
            console.log("### VOICEVOXサーバとの接続が不安定です ###");
        }
    );
    
    return wav;
}

//読み上げメソッド
async function read(message, subsc){
    const info = {style_id: 3, speedScale: 1, pitchScale: 0, intonationScale: 1, volumeScale: 1, prePhonemeLength: 0.1, postPhonemeLength: 0.1}
    info.style_id = (await db.getInfo(message.author.id)).style_id;
    const text = formText(info, message);
    const wav = await createWav(info, text);

    if(wav){
        const player = subsc.player;
        await entersState(player, AudioPlayerStatus.Idle, 2 ** 31 - 1);
        player.play(wav);
    }
}
