/******************
    question.js
    スニャイヴ
    2024/10/10
******************/

module.exports = {
    getCmd: getCmd,
    showModal: showModal,
    sendAns: sendAns,
}

require('dotenv').config();
const {SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, AttachmentBuilder} = require('discord.js');
const {CohereClient} = require('cohere-ai');
const cohere = new CohereClient({token: process.env.COHERE_TOKEN});

//コマンドの取得
function getCmd(){
    const cohere = new SlashCommandBuilder();

    cohere.setName("cohere");
    cohere.setDescription("AI質問コマンド");
    
    return cohere;
}

//モーダルの表示
async function showModal(interaction){
    const question = new TextInputBuilder();
    const modal = new ModalBuilder();

    question.setCustomId("inputFiled_question")
    question.setLabel("質問内容を入力してください")
    question.setStyle(TextInputStyle.Short);
    question.setRequired(true);

	modal.setCustomId("modal_cohere")
	modal.setTitle("質問送信フォーム");
    modal.addComponents(new ActionRowBuilder().addComponents(question));

    await interaction.showModal(modal);

    return;
}

//回答の生成
async function generateAns(question, readme){
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
    try{
        
        return (await cohere.chat({model: "command-r-plus", message: question, preamble: preamble})).text;
    }catch(e){console.log(e);}

    return;
}

//埋め込みの作成
function createEmbed(question, anser){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    
    embed.setTitle("Q.");
    embed.setThumbnail("attachment://icon.png");
    embed.setDescription(question);
    embed.addFields({name: "A.", value: anser});
    embed.setFooter({text: "Cohere AIによる生成"});
    embed.setColor(0x00FF00);

    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/dream.png");

    return {embeds: [embed], ephemeral: true};
}

//回答の送信
async function sendAns(msgInte, readme){
    let question = msgInte.content ? msgInte.content.replace(`<@${process.env.BOT_ID}>`, "") : msgInte.fields.getTextInputValue("inputFiled_question");
    let anser = await generateAns(question, readme);

    question = (question.length>4000) ? question.substr(0, 3992) + "...<以下略>" : question;
    anser = (anser.length>1000) ? anser.substr(0, 992) + "...<以下略>" : anser;

    try{
        await msgInte.reply(createEmbed(question, anser));
    }catch(e){}

    return;
}