/*****************
    read.js
    スニャイヴ
    2024/08/21        
*****************/

module.exports = {
    read: read,
}

require('dotenv').config();
const {createAudioResource, entersState, AudioPlayerStatus, StreamType} = require('@discordjs/voice');
const fs = require('fs');
const {Readable} = require("stream");
const axios = require('axios').create({baseURL: process.env.VOICEVOX_SERVER, proxy: false});
const db = require('./db');

//マークダウン検出
function detectMarkdown(text){

    //引用
    if(text.match(/(?<=^(#{0,3}\s)?)>\s/)){
        text = text.replace(/(?<=^(#{0,3}\s)?)>\s/, "");
    }else if(text.match(/(?<=^(#{0,3}\s)?)>>>\s/)){
        text = text.replace(/(?<=^(#{0,3}\s)?)>>>\s/, "");
    }

    //見出し
    if(text.match(/^#\s/)){
        text = text.replace(/^#\s/, "");
    }else if(text.match(/^##\s/)){
        text = text.replace(/^##\s/, "");
    }else if(text.match(/^###\s/)){
        text = text.replace(/^###\s/, "");
    }

    //太字
    for(let i=0; i<2; i++){
        if(text.match(/(?<=^[|_~`]*)\*\*+([^(\*\*)\\]+)\*\*+(?=[|_~`]*$)/)){
            text = text.replace(/(?<=^[|_~`]*)\*\*([^(\*\*)]+)\*\*(?=[|_~`]*$)/, '$1');
        }else{
            break;
        }
    }
    
    //アンダーバー
    for(let i=0; i<2; i++){
        if(text.match(/(?<=^[|*~`]*)__+([^(__)]+)__+(?=[|*~`]*$)/)){
            text = text.replace(/(?<=^[|*~`]*)__([^(__)]+)__(?=[|*~`]*$)/, '$1');
        }else{
            break;
        }
    }

    //斜体*
    if(text.match(/(?<=^[|_~`]*)\*([^(\*)]+)\*(?=[|_~`]*$)/)){
        text = text.replace(/(?<=^[|_~`]*)\*([^(\*)]+)\*(?=[|_~`]*$)/, '$1');
    }

    //斜体_
    if(text.match(/(?<=^[|*~`]*)_([^(_)]+)__(?=[|*~`]*$)/)){
        text = text.replace(/(?<=^[|*~`]*)_([^(_)]+)_(?=[|*~`]*$)/, '$1');
    }

    //取り消し線
    if(text.match(/(?<=^[|*_`]*)~~([^(~~)]+)~~(?=[|*_`]*$)/)){
        text = text.replace(/(?<=^[|*_`]*)~~([^(~~)]+)~~(?=[|*_`]*$)/, '$1');
    }
    
    //コードブロック
    if(text.match(/(?<=^[|*_~]*)`([^(`)]+)`(?=[|*_~]*$)/)){
        text = text.replace(/(?<=^[|*_~]*)`([^(`)]+)`(?=[|*_~]*$)/, '$1');
    }

    return text;
}

//文章成形
async function formText(message, userInfo, serverInfo){
    //メッセージの文字列化
    let text = message.cleanContent;

    //1行目だけ取得
    if(!serverInfo.continue_line){
        text = text.split(/\r\n|\r|\n/)[0];
    }

    //マークダウンの検出
    text = detectMarkdown(text);

    //URLの検出
    text = text.replace(/(https?|ftp)(:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+)/g, "URL省略");

    //カスタム絵文字の検出
    text = text.replace(/:[a-zA-Z0-9_~]+:/g, "");

    //#の検出
    text = text.replace("#", "シャープ");

    //文字数制限
    if(text.length > serverInfo.maxwords+5){
        text = text.substr(0, serverInfo.maxwords);
        text += "以下略";
    }

    //名前
    if(serverInfo.name){
        let beforeUserId = null;

        if(!serverInfo.continue_name){
            await message.channel.messages.fetch({before: message.id, limit:1})
                .then(messages => {
                    beforeUserId = messages.first().member.id;
                })
                .catch(function(){
                    console.log("### 直前のメッセージはありません ###");
                })
        }

        if(beforeUserId != message.member.id){
            text = userInfo.name_user ? (userInfo.name_user).substr(0, 10) + "さん、" + text : (message.member.displayName).substr(0, 10) + "さん、" + text;
        }
    }

    return text;
}

//wav作成
async function createWav(text, userInfo, serverInfo){
    let id = serverInfo.unif ? serverInfo.id : (userInfo.uuid ? userInfo.id : serverInfo.id);
    let speed = serverInfo.unif ? serverInfo.speed : (userInfo.uuid ? userInfo.speed : serverInfo.speed);
    let pitch = serverInfo.unif ? serverInfo.pitch : (userInfo.uuid ? userInfo.pitch : serverInfo.pitch);
    let intonation = serverInfo.unif ? serverInfo.intonation : (userInfo.uuid ? userInfo.intonation : serverInfo.intonation);
    let volume = serverInfo.unif ? serverInfo.volume : (userInfo.uuid ? userInfo.volume : serverInfo.volume);
    let wav = null;

    //辞書ファイルの削除
    fs.unlink(`${process.env.VOICEVOX_DICTIONARY}`, (e) => {});

    //辞書のインポート
    await axios.post("import_user_dict?override=true", JSON.stringify(serverInfo.dict), {headers:{"Content-Type": "application/json"}})
        .then(async function(){
            //合成音声の取得
            await axios.post(`audio_query?text=${encodeURI(text)}&speaker=${id}`, {headers:{"accept" : "application/json"}})
                .then(async function(res){
                    res.data.speedScale = speed;
                    res.data.pitchScale = pitch;
                    res.data.intonationScale = intonation;
                    res.data.volumeScale = volume;

                    await axios.post(`synthesis?speaker=${id}&enable_interrogative_upspeak=true`, JSON.stringify(res.data),
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
                })
            ;
        })
        .catch(function(){
            console.log("### VOICEVOXサーバとの接続が不安定です ###");
        })
    ;
    
    return wav;
}

//読み上げ
async function read(message, subsc){
    const userInfo = await db.getUserInfo(message.member.id);
    const serverInfo = await db.getServerInfo(message.guild.id);
    const text = await formText(message, userInfo, serverInfo);
    const wav = await createWav(text, userInfo, serverInfo);

    if(wav){
        const player = subsc.player;
        await entersState(player, AudioPlayerStatus.Idle, 2 ** 31 - 1);
        player.play(wav);
    }
}