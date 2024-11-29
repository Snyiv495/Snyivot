/*****************
    cui.js
    スニャイヴ
    2024/11/20
*****************/

module.exports = {
    getSlashCmds: getSlashCmds,
    cmd: cmd,
    createProgressbar: createProgressbar,
    stepProgressbar: stepProgressbar,
}

require('dotenv').config();
const {SlashCommandBuilder} = require('discord.js');
const gm_casino_slot = require('./execute/casinoSlot');
//const gm_help = require('./execute/help');

//スラッシュコマンドの取得
function getSlashCmds(){
    const slash_cmds = [];

    slash_cmds.push(getCasinoSlotCmd());
    slash_cmds.push(getHelpCmd());

    return slash_cmds;
}

//スロットコマンドの取得
function getCasinoSlotCmd(){
    const casino_slot = new SlashCommandBuilder();

    casino_slot.setName("game_casino_slot");
    casino_slot.setDescription("スロットをプレイするコマンドなのだ！");

    return casino_slot;
}

//ヘルプコマンドの取得
function getHelpCmd(){
    const help = new SlashCommandBuilder();

    help.setName("game_help");
    help.setDescription("ゲームのヘルプコマンドなのだ！");
    help.addStringOption(option => {
        option.setName("content");
        option.setDescription("内容を選択するのだ！");
        option.addChoices(
            {name: "casino_slot", value: "casino_slot"}
        );
        option.setRequired(true);
        return option;
    });
    
    return help;
}

//CUIコマンドの実行
async function cmd(interaction){
    //サーバー以外を除外
    if(!interaction.guild){
        console.log("後で修正");
        return -1;
    }

    switch(interaction.commandName){
        case "game_casino_slot" : {
            await interaction.deferReply({ephemeral: true});
            await gm_casino_slot.exe(interaction);
            break;
        }
        case "game_help" : {
            const options = {content : null};
            options.content = interaction.options.get("content").value;
            await gm_help.exe(interaction, options);
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