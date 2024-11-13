/*****************
    cui.js
    スニャイヴ
    2024/11/12
*****************/

module.exports = {
    getSlashCmds: getSlashCmds,
    cmd: cmd,
    createProgressbar: createProgressbar,
    stepProgressbar: stepProgressbar,
}

require('dotenv').config();
const {SlashCommandBuilder} = require('discord.js');
const ch_question = require('./execute/question');
const ch_help = require('./execute/help');

//スラッシュコマンドの取得
function getSlashCmds(){
    const slashCmds = [];

    slashCmds.push(getQuestionCmd());
    slashCmds.push(getHelpCmd());

    return slashCmds;
}

//質問コマンドの取得
function getQuestionCmd(){
    const question = new SlashCommandBuilder();

    question.setName("cohere_question");
    question.setDescription("Snyivotに質問するコマンドなのだ！");
    question.addStringOption(option => {
        option.setName("content");
        option.setDescription("質問内容を入力するのだ！");
        option.setRequired(true);
        return option;
    });

    return question;
}

//ヘルプコマンドの取得
function getHelpCmd(){
    const help = new SlashCommandBuilder();

    help.setName("cohere_help");
    help.setDescription("cohereのヘルプコマンドなのだ！");
    help.addStringOption(option => {
        option.setName("content");
        option.setDescription("内容を選択するのだ！");
        option.addChoices(
            {name: "question", value: "question"}
        );
        option.setRequired(true);
        return option;
    });
    
    return help;
}

//CUIコマンドの実行
async function cmd(interaction, readme){
    //サーバー以外を除外
    if(!interaction.guild){
        console.log("後で修正");
        return -1;
    }

    switch(interaction.commandName){
        case "cohere_question" : {
            await ch_question.exe(interaction, interaction.options.get("content").value, readme);
            break;
        }
        case "cohere_help" : {
            const options = {content : null};
            options.content = interaction.options.get("content").value;
            await ch_help.exe(interaction, options);
            break;
        }
        default : break;
    }

    return -1;
}

//進捗バーの作成
async function createProgressbar(interaction, stepMax){
    const progress = {interaction: interaction, current: 0, step: 100.0/stepMax};

    try{await interaction.deferReply({ephemeral: true});}catch(e){};
    await interaction.editReply({content: "進捗[----------]0%"});

    return progress;
}

//進捗バーの進展
async function stepProgressbar(progress){
    let bar = "";

    progress.current = ((progress.current+(progress.step*2)-1)<100) ? progress.current+progress.step : 100;
    
    for(let i=0; i<10; i++){
        if(i < Math.floor(progress.current/10)){
            bar += "#";
        }else{
            bar += "-";
        }
    }
    await progress.interaction.editReply({content: `進捗[${bar}]${Math.floor(progress.current)}%`});

    return progress;
}