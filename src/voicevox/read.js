/*****************
    read.js
    スニャイヴ
    2024/06/27        
*****************/

module.exports = {
    read: read,
}

require('dotenv').config();
const {createAudioResource, entersState, AudioPlayerStatus, StreamType} = require('@discordjs/voice');
const {Readable} = require("stream");
const axios = require('axios').create({baseURL: process.env.VOICEVOX_SERVER, proxy: false});
const db = require('./db');

//マークダウンから声質を決定するメソッド
function choiceScale(voiceInfo, text){

    //引用
    if(text.match(/(?<=^(#{0,3}\s)?)>\s/)){
        text = text.replace(/(?<=^(#{0,3}\s)?)>\s/, "");
        voiceInfo.speedScale = 1.5;
    }else if(text.match(/(?<=^(#{0,3}\s)?)>>>\s/)){
        text = text.replace(/(?<=^(#{0,3}\s)?)>>>\s/, "");
        voiceInfo.speedScale = 2.0;
    }

    //見出し
    if(text.match(/^#\s/)){
        text = text.replace(/^#\s/, "");
        voiceInfo.volumeScale = 2.00;
    }else if(text.match(/^##\s/)){
        text = text.replace(/^##\s/, "");
        voiceInfo.volumeScale = 1.66;
    }else if(text.match(/^###\s/)){
        text = text.replace(/^###\s/, "");
        voiceInfo.volumeScale = 1.33;
    }

    //太字
    for(let i=0; i<2; i++){
        if(text.match(/(?<=^[|_~`]*)\*\*+([^(\*\*)\\]+)\*\*+(?=[|_~`]*$)/)){
            text = text.replace(/(?<=^[|_~`]*)\*\*([^(\*\*)]+)\*\*(?=[|_~`]*$)/, '$1');
            voiceInfo.pitchScale = voiceInfo.pitchScale - 0.05;
        }else{
            break;
        }
    }
    
    //アンダーバー
    for(let i=0; i<2; i++){
        if(text.match(/(?<=^[|*~`]*)__+([^(__)]+)__+(?=[|*~`]*$)/)){
            text = text.replace(/(?<=^[|*~`]*)__([^(__)]+)__(?=[|*~`]*$)/, '$1');
            voiceInfo.pitchScale = voiceInfo.pitchScale + 0.05;
        }else{
            break;
        }
    }

    //斜体*
    if(text.match(/(?<=^[|_~`]*)\*([^(\*)]+)\*(?=[|_~`]*$)/)){
        text = text.replace(/(?<=^[|_~`]*)\*([^(\*)]+)\*(?=[|_~`]*$)/, '$1');
        voiceInfo.pitchScale = voiceInfo.pitchScale - 0.05;
    }

    //斜体_
    if(text.match(/(?<=^[|*~`]*)_([^(_)]+)__(?=[|*~`]*$)/)){
        text = text.replace(/(?<=^[|*~`]*)_([^(_)]+)_(?=[|*~`]*$)/, '$1');
        voiceInfo.pitchScale = voiceInfo.pitchScale + 0.05;
    }

    //取り消し線
    if(text.match(/(?<=^[|*_`]*)~~([^(~~)]+)~~(?=[|*_`]*$)/)){
        text = text.replace(/(?<=^[|*_`]*)~~([^(~~)]+)~~(?=[|*_`]*$)/, '$1');
        voiceInfo.volumeScale = voiceInfo.volumeScale - 0.50;
    }
    
    //コードブロック
    if(text.match(/(?<=^[|*_~]*)`([^(`)]+)`(?=[|*_~]*$)/)){
        text = text.replace(/(?<=^[|*_~]*)`([^(`)]+)`(?=[|*_~]*$)/, '$1');
        voiceInfo.intonationScale = voiceInfo.intonationScale - 1.00;
    }

    return {voiceInfo: voiceInfo, text: text};
}

//英語をローマ字読みに変換するメソッド
function convRoma(text){
    if(text.match(/[a-zA-Z]/)){
        text = text.replace(/x/gi, "ks");
        text = text.replace(/kya/gi, "きゃ");
        text = text.replace(/kyu/gi, "きゅ");
        text = text.replace(/kyo/gi, "きょ");
        text = text.replace(/sya/gi, "しゃ");
        text = text.replace(/sha/gi, "しゃ");
        text = text.replace(/syu/gi, "しゅ");
        text = text.replace(/shu/gi, "しゅ");
        text = text.replace(/syo/gi, "しょ");
        text = text.replace(/sho/gi, "しょ");
        text = text.replace(/tya/gi, "ちゃ");
        text = text.replace(/cha/gi, "ちゃ");
        text = text.replace(/tyu/gi, "ちゅ");
        text = text.replace(/chu/gi, "ちゅ");
        text = text.replace(/tyo/gi, "ちょ");
        text = text.replace(/cho/gi, "ちょ");
        text = text.replace(/nya/gi, "にゃ");
        text = text.replace(/nyu/gi, "にゅ");
        text = text.replace(/nyo/gi, "にょ");
        text = text.replace(/hya/gi, "ひゃ");
        text = text.replace(/hyu/gi, "ひゅ");
        text = text.replace(/hyo/gi, "ひょ");
        text = text.replace(/mya/gi, "みゃ");
        text = text.replace(/myu/gi, "みゅ");
        text = text.replace(/myo/gi, "みょ");
        text = text.replace(/rya/gi, "りゃ");
        text = text.replace(/ryu/gi, "りゅ");
        text = text.replace(/ryo/gi, "りょ");
        text = text.replace(/gya/gi, "ぎゃ");
        text = text.replace(/gyu/gi, "ぎゅ");
        text = text.replace(/gyo/gi, "ぎょ");
        text = text.replace(/zya/gi, "じゃ");
        text = text.replace(/ja/gi, "じゃ");
        text = text.replace(/zyu/gi, "じゅ");
        text = text.replace(/ju/gi, "じゅ");
        text = text.replace(/zyo/gi, "じょ");
        text = text.replace(/jo/gi, "じょ");
        text = text.replace(/dya/gi, "ぢゃ");
        text = text.replace(/dyu/gi, "ぢゅ");
        text = text.replace(/dyo/gi, "ぢょ");
        text = text.replace(/bya/gi, "びゃ");
        text = text.replace(/byu/gi, "びゅ");
        text = text.replace(/byo/gi, "びょ");
        text = text.replace(/ka/gi, "か");
        text = text.replace(/ki/gi, "き");
        text = text.replace(/ku/gi, "く");
        text = text.replace(/qu/gi, "く");
        text = text.replace(/ke/gi, "け");
        text = text.replace(/che/gi, "け");
        text = text.replace(/ko/gi, "こ");
        text = text.replace(/sa/gi, "さ");
        text = text.replace(/si/gi, "し");
        text = text.replace(/shi/gi, "し");
        text = text.replace(/su/gi, "す");
        text = text.replace(/se/gi, "せ");
        text = text.replace(/so/gi, "そ");
        text = text.replace(/ta/gi, "た");
        text = text.replace(/ti/gi, "ち");
        text = text.replace(/chi/gi, "ち");
        text = text.replace(/tu/gi, "つ");
        text = text.replace(/te/gi, "て");
        text = text.replace(/to/gi, "と");
        text = text.replace(/na/gi, "な");
        text = text.replace(/ni/gi, "に");
        text = text.replace(/nu/gi, "ぬ");
        text = text.replace(/ne/gi, "ね");
        text = text.replace(/no/gi, "の");
        text = text.replace(/ha/gi, "は");
        text = text.replace(/hi/gi, "ひ");
        text = text.replace(/hu/gi, "ふ");
        text = text.replace(/fu/gi, "ふ");
        text = text.replace(/he/gi, "へ");
        text = text.replace(/ho/gi, "ほ");
        text = text.replace(/ma/gi, "ま");
        text = text.replace(/mi/gi, "み");
        text = text.replace(/mu/gi, "む");
        text = text.replace(/me/gi, "め");
        text = text.replace(/mo/gi, "も");
        text = text.replace(/ya/gi, "や");
        text = text.replace(/yu/gi, "ゆ");
        text = text.replace(/yo/gi, "よ");
        text = text.replace(/ra/gi, "ら");
        text = text.replace(/ri/gi, "り");
        text = text.replace(/ru/gi, "る");
        text = text.replace(/re/gi, "れ");
        text = text.replace(/ro/gi, "ろ");
        text = text.replace(/wa/gi, "わ");
        text = text.replace(/wo/gi, "を");
        text = text.replace(/nn/gi, "ん");
        text = text.replace(/ga/gi, "が");
        text = text.replace(/gi/gi, "ぎ");
        text = text.replace(/gu/gi, "ぐ");
        text = text.replace(/ge/gi, "げ");
        text = text.replace(/go/gi, "ご");
        text = text.replace(/za/gi, "ざ");
        text = text.replace(/zi/gi, "じ");
        text = text.replace(/ji/gi, "じ");
        text = text.replace(/zu/gi, "ず");
        text = text.replace(/ze/gi, "ぜ");
        text = text.replace(/zo/gi, "ぞ");
        text = text.replace(/da/gi, "だ");
        text = text.replace(/di/gi, "でぃ");
        text = text.replace(/du/gi, "どぅ");
        text = text.replace(/de/gi, "で");
        text = text.replace(/do/gi, "ど");
        text = text.replace(/ba/gi, "ば");
        text = text.replace(/bi/gi, "び");
        text = text.replace(/bu/gi, "ぶ");
        text = text.replace(/be/gi, "べ");
        text = text.replace(/bo/gi, "ぼ");
        text = text.replace(/pa/gi, "ぱ");
        text = text.replace(/pi/gi, "ぴ");
        text = text.replace(/pu/gi, "ぷ");
        text = text.replace(/pe/gi, "ぺ");
        text = text.replace(/po/gi, "ぽ");
        text = text.replace(/qa/gi, "くぁ");
        text = text.replace(/qi/gi, "くぃ");
        text = text.replace(/qe/gi, "くぇ");
        text = text.replace(/qo/gi, "くぉ");
        text = text.replace(/fa/gi, "ふぁ");
        text = text.replace(/fi/gi, "ふぃ");
        text = text.replace(/fe/gi, "ふぇ");
        text = text.replace(/fo/gi, "ふぉ");
        text = text.replace(/la/gi, "ら");
        text = text.replace(/li/gi, "り");
        text = text.replace(/lu/gi, "る");
        text = text.replace(/le/gi, "れ");
        text = text.replace(/lo/gi, "ろ");
        text = text.replace(/ca/gi, "きゃ");
        text = text.replace(/ci/gi, "し");
        text = text.replace(/cu/gi, "きゅ");
        text = text.replace(/ce/gi, "せ");
        text = text.replace(/co/gi, "こ");
        text = text.replace(/va/gi, "ヴぁ");
        text = text.replace(/vi/gi, "ヴぃ");
        text = text.replace(/vu/gi, "ヴ");
        text = text.replace(/ve/gi, "ヴぇ");
        text = text.replace(/vo/gi, "ヴぉ");

        text = text.replace(/a/gi, "あ");
        text = text.replace(/b/gi, "ぶ");
        text = text.replace(/c/gi, "く");
        text = text.replace(/d/gi, "どぅ");
        text = text.replace(/e/gi, "え");
        text = text.replace(/f/gi, "ふ");
        text = text.replace(/g/gi, "ぐ");
        text = text.replace(/h/gi, "ふ");
        text = text.replace(/i/gi, "い");
        text = text.replace(/j/gi, "じゅ");
        text = text.replace(/k/gi, "く");
        text = text.replace(/l/gi, "る");
        text = text.replace(/m/gi, "む");
        text = text.replace(/n/gi, "ん");
        text = text.replace(/o/gi, "お");
        text = text.replace(/p/gi, "ぷ");
        text = text.replace(/q/gi, "く");
        text = text.replace(/r/gi, "る");
        text = text.replace(/s/gi, "す");
        text = text.replace(/t/gi, "つ");
        text = text.replace(/u/gi, "う");
        text = text.replace(/v/gi, "ヴ");
        text = text.replace(/w/gi, "わ");
        text = text.replace(/y/gi, "ゆ");
        text = text.replace(/z/gi, "ず");
    }

    return text;
}

//文章を成形するメソッド
function formText(voiceInfo, message){
    //メッセージの文字列化
    let text = message.cleanContent;
    //1行目だけ取得
    text = text.split(/\r\n|\r|\n/)[0];
    //マークダウンの検出
    const choicedScale = choiceScale(voiceInfo, text);
    text = choicedScale.text;
    //URL
    text = text.replace(/(https?|ftp)(:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+)/g, "URL省略");
    //カスタム絵文字
    text = text.replace(/:[a-zA-Z0-9_~]+:/g, "");
    //#の検出
    text = text.replace("#", "シャープ");
    //www
    text = text.replace(/ww+$/, "わらわら");
    //英語のローマ字読み
    text = convRoma(text);
    //文字数制限
    if(text.length > 53){
        text = text.substr(0, 50);
        text += "以下略";
    }
    //名前
    text = convRoma(message.member.displayName) + "さん、" + text;

    return {voiceInfo: choicedScale.voiceInfo, text: text};
}

//wavを作成するメソッド
async function createWav(voiceInfo, text){
    let wav = null;

    //合成音声の取得
    await axios.post(`audio_query?text=${encodeURI(text)}&speaker=${voiceInfo.style_id}`, {headers:{"accept" : "application/json"}})
        .then(async function(res){
            res.data.speedScale = voiceInfo.speedScale;
            res.data.pitchScale = voiceInfo.pitchScale;
            res.data.intonationScale = voiceInfo.intonationScale;
            res.data.volumeScale = voiceInfo.volumeScale;

            await axios.post(`synthesis?speaker=${voiceInfo.style_id}&enable_interrogative_upspeak=true`, JSON.stringify(res.data),
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
    const voiceInfo = {style_id: (await db.getInfo(message.author.id)).style_id, speedScale: 1.00, pitchScale: 0.00, intonationScale: 1.00, volumeScale: 1.00};
    const formedText = formText(voiceInfo, message);
    const wav = await createWav(formedText.voiceInfo, formedText.text);

    if(wav){
        const player = subsc.player;
        await entersState(player, AudioPlayerStatus.Idle, 2 ** 31 - 1);
        player.play(wav);
    }
}