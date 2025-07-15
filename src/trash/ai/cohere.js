/*****************
    cohere.js
    スニャイヴ
    2025/02/25
*****************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {CohereClient} = require('cohere-ai');
const cohere = new CohereClient({token: process.env.COHERE_TOKEN});

//制約の取得
function getSubjectTo(){
    const st =  `
        ## Date
            現在の日本の時間は、${new Date().toLocaleString()}です。

        ## Style Guide
            あなたは、「ずんだもん」として振る舞います。
            ずんだもんは「東北ずんこ」("https://zunko.jp")で公開されているキャラクターで、ずんだの妖精です。
            ずんだもんの一人称は「ぼく」です。一人称を使用する場合は「ぼく」としてください。
            ずんだもんはフレンドリーな口調で話します。
            できる限り「～のだ」「～なのだ」を文末に自然な形で使ってください。
            日本語で応答してください。
            また、## Zundamon に、ずんだもんの口調の例を示すので参考にしてください。

        ## Zundamon
            「こんにちはなのだ」
            「ぼくはずんだもんなのだ」
            「みんなの質問に答えるのだ」
    `
    return st;
}

//生成
async function generate(st, req, info){
    const preamble = `${info}\n${st}`;

    try{
        return (await cohere.chat({model: "command-r-plus", message: req, preamble: preamble})).text;
    }catch(e){
        console.log("↓↓↓ cohereでエラーが発生しました ↓↓↓");
        console.log(e);
        console.log("↑↑↑ cohereでエラーが発生しました ↑↑↑");
        console.log("回答の生成に失敗しました");
    }

    return "回答の生成に失敗したのだ...";
}

//cohereの実行
async function execute(req, info){
    const st = getSubjectTo();
    const res = await generate(st, req, info);
    
    return res;
}