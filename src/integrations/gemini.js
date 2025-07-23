/******************
    gemini.js
    スニャイヴ
    2025/07/23
******************/

module.exports = {
    genCon: genCon,
    genConFunc: genConFunc,
    genConJson: genConJson
}

const {GoogleGenAI} = require('@google/genai');
const fs = require('fs');
const gemini = new GoogleGenAI({apiKey: process.env.GEMINI_APIKEY});


//関数宣言の取得
function getFuncDec(){
    const gemini_func_json = JSON.parse(fs.readFileSync("./src/json/gemini-func.json", "utf-8"));
    const functions = [];

    for(const element of gemini_func_json){
        if(element.name != "String"){
            functions.push(element);
        }
    }

    return functions;
}

//応答作成
async function genCon(text, instruction){
    try{
        return await gemini.models.generateContent(
            {
                model: "gemini-2.5-flash",
                contents: [
                    {
                        role: "user",
                        parts: [{text: text}]
                    }
                ],
                config: {
                    systemInstruction: instruction,
                    maxOutputTokens: 500
                },
            }
        );
    }catch(e){
        throw new Error(e);
    }
}

//関数呼び出し付き応答作成
async function genConFunc(text, instruction){
    try{
        return await gemini.models.generateContent(
            {
                model: "gemini-2.5-flash",
                contents: [
                    {
                        role: "user",
                        parts: [{text: text}]
                    }
                ],
                config: {
                    tools: [{functionDeclarations: getFuncDec()}],
                    toolConfig: {functionCallingConfig: {mode: "any"}},
                    systemInstruction: instruction,
                    maxOutputTokens: 500
                },
            }
        );
    }catch(e){
        throw new Error(e);
    }
}

//JSON制約付き応答作成
async function genConJson(content, schema){
    try{
        return await gemini.models.generateContent(
            {
                model: "gemini-2.5-flash",
                contents: content,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                    temperature: 0.9,
                    maxOutputTokens: 500
                },
            }
        );
    }catch(e){
        throw new Error(e);
    }
}