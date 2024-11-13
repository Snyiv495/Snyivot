/*****************
    gui.js
    スニャイヴ
    2024/11/12
*****************/

module.exports = {
    menu: menu,
    button: button,
    modal: modal,
}

const {ActionRowBuilder, TextInputBuilder, ModalBuilder, TextInputStyle} = require("discord.js");
const axios = require('axios').create({baseURL: process.env.VOICEVOX_SERVER, proxy: false});

require('dotenv').config();
const ch_question = require('./execute/question');
const ch_help = require('./execute/help');

//質問送信GUIの作成
async function createQestionGUI(){
    const question = new TextInputBuilder();
    const modal = new ModalBuilder();

    question.setCustomId("question")
    question.setLabel("質問内容を入力するのだ！")
    question.setStyle(TextInputStyle.Short);
    question.setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(question));

	modal.setCustomId("modal_cohere_question");
	modal.setTitle("質問送信画面");

    return modal;
}

//GUIメニューの実行
async function menu(interaction){
    //サーバー以外を除外
    if(!interaction.guild){
        console.log("後で修正");
        return;
    }
    
    switch(interaction.values[0]){
        case "cohere_question_exe" : {
            await interaction.showModal(await createQestionGUI());
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            break;
        }
        case "cohere_help_question_exe" : {
            const option = {content : "question"};
            await interaction.deferUpdate();
            await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});
            await ch_help.exe(interaction, option);
            break;
        }
        default : break;
    }

    return 0;
}

//GUIボタンの実行
async function button(interaction){

    await interaction.deferUpdate();
    await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});

    return 0;
}

//GUIモーダルの実行
async function modal(interaction, readme){
    await interaction.deferUpdate();
    await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: []});

    switch(interaction.customId){
        case "modal_cohere_question" : {
            await ch_question.exe(interaction, interaction.fields.getTextInputValue("question"), readme);
            break;
        }
        default : break;
    }

    return 0;
}