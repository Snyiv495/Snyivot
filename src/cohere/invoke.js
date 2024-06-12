/*****************
    invoke.js
    スニャイヴ
    2024/05/23        
*****************/

module.exports = {
    invoke: invoke
}

require('dotenv').config();
const {Cohere} = require('@langchain/cohere');
const embed  = require('./embed');

const cohere = new Cohere({apiKey: process.env.COHERE_TOKEN, model: "command-r-plus"});

function formText(message){
    let text = message.content.replace(`<@${process.env.SNYIVOT_ID}>`, "");
    text = text + "\nただし、以下の制約に従って回答してください\n"
    text = text + "・200文字以内の回答にする\n"
    text = text + "・関西弁で回答する\n"
    return text;
}

async function invoke(message){
    const content = formText(message);

    if(content === ""){
        message.reply(embed.invoke(null, 1));
        return;
    }

    try{
        const rep = await cohere.invoke(content);
        message.reply(embed.invoke(rep, 0));
    }catch(e){
        console.log(e);
    }
}