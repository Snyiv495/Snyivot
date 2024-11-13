/*****************
    cui.js
    スニャイヴ
    2024/11/13
*****************/

module.exports = {
    getSlashCmds: getSlashCmds,
    cmd: cmd,
    createProgressbar: createProgressbar,
    stepProgressbar: stepProgressbar,
}

const {SlashCommandBuilder} = require('discord.js');
const readme = require('./execute/readme')
const cohere = require('./cohere/cohere');
const voicevox = require('./voicevox/voicevox');

//コマンドの取得
function getSlashCmds(){
    let cmds = [];

    cmds = cmds.concat(getReadmeCmd());
    cmds = cmds.concat(cohere.getSlashCmd());
    cmds = cmds.concat(voicevox.getSlashCmd());

    return cmds;
}

//READMEコマンドの取得
function getReadmeCmd(){
    const readme = new SlashCommandBuilder();

    readme.setName("readme");
    readme.setDescription("readmeの取得コマンドなのだ！");
    
    return readme;
}

//CUIコマンドの実行
async function cmd(interaction){
    //サーバー以外を除外
    if(!interaction.guild){
        console.log("後で修正");
        return -1;
    }

    switch(interaction.commandName){
        case "readme" : {
            await readme.exe(interaction);
            break;
        }
        default : break;
    }

    return 0;
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