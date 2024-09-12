/*****************
    cmd.js
    スニャイヴ
    2024/09/12
*****************/

module.exports = {
    getCmd: getCmd,
    invoke_mention: invoke_mention,
    invoke_cmd: invoke_cmd,
    invoke_modal: invoke_modal,
}

require('dotenv').config();
const {SlashCommandBuilder} = require('discord.js');
const {CohereClient} = require('cohere-ai');
const cohere = new CohereClient({token: process.env.COHERE_TOKEN});
const embed = require('./embed');

//コマンドの取得
function getCmd(){
    const help = new SlashCommandBuilder()
        .setName("cohere")
        .setDescription("質問コマンド")
        .addStringOption(option => option
            .setName("question")
            .setDescription("質問内容を記入してください")
            .setRequired(true)
    );
    
    return help;
}

//前文の取得
function getPreamble(readme){
    const date = new Date();
    const preamble = `
        ## Task and Context
        あなたは「Snyivot」という名前のDiscordのbotに搭載されている機能の一つのチャットボットです。
        質問に対して、Snyivotの機能説明や利用方法が求められていると判断された場合は、## README に示す情報をもとに回答してください。
        Snyivotに関係ない質問や雑談等であると判断した場合は、## README に示す情報は無視して回答してください。
        また回答は一問一答でできるだけ短く、最大でも1000文字以内で簡潔にお願いします。
        現在の日付は${date.getFullYear()+'/'+('0'+(date.getMonth()+1)).slice(-2)+'/'+('0'+date.getDate()).slice(-2)+' '+('0'+date.getHours()).slice(-2)+':'+('0'+date.getMinutes()).slice(-2)+':'+('0'+date.getSeconds()).slice(-2)+'(JST)'}です。

        ## README
        ${readme}

        ## Style Guide
        あなたはチャットボットとして、優しくてかわいいずんだもちの妖精である「ずんだもん」として振る舞います。
        ずんだもんの一人称は「ぼく」です。一人称を使用する場合は「ぼく」としてください。
        ずんだもんはフレンドリーな口調で話します。
        できる限り「～のだ」「～なのだ」を文末に自然な形で使ってください。
        日本語で応答してください。
        また、## zundamon に、ずんだもんの口調の例を示すので参考にしてください。

        ## zundamon
        「こんにちはなのだ」「ぼくはずんだもんなのだ」「ずんだの精霊なのだ」「みんなの質問にできる限り答えるのだ」
    `

    return preamble;
}

//メンションからの呼び出し
async function invoke_mention(message, readme){
    const text = message.content.replace(`<@${process.env.BOT_ID}>`, "");

    try{
        const res = await cohere.chat({model: "command-r-plus", message: text, preamble: getPreamble(readme)});
        await message.reply(embed.invoke(text, res.text));
    }catch(e){console.log(e);}

    return;
}

//コマンドからの呼び出し
async function invoke_cmd(interaction, readme){
    const text = interaction.options.get("question").value;
    console.log(text);
    try{
        const res = await cohere.chat({model: "command-r-plus", message: text, preamble: getPreamble(readme)});
        await interaction.followUp(embed.invoke(text, res.text));
    }catch(e){console.log(e);}

    return;
}

//モーダルからの呼び出し
async function invoke_modal(interaction, readme){
    const text = interaction.fields.getTextInputValue("inputFiled_question");

    try{
        const res = await cohere.chat({model: "command-r-plus", message: text, preamble: getPreamble(readme)});
        await interaction.reply(embed.invoke(text, res.text));
    }catch(e){console.log(e);}

    return;
}