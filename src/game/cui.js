/*****************
    cui.js
    スニャイヴ
    2024/12/05
*****************/

module.exports = {
    getSlashCmds: getSlashCmds,
    cmd: cmd,
    createProgressbar: createProgressbar,
    stepProgressbar: stepProgressbar,
}

require('dotenv').config();
const {SlashCommandBuilder} = require('discord.js');
const casino_slot = require('./execute/casino/slot');
//const help = require('./execute/help');

//スラッシュコマンドの取得
function getSlashCmds(){
    const slash_cmds = [];

    slash_cmds.push(getCasinoSlotCmd());
    slash_cmds.push(getHelpCmd());

    return slash_cmds;
}

//スロットコマンドの取得
function getCasinoSlotCmd(){
    const cmd = new SlashCommandBuilder();

    cmd.setName("game_casino_slot");
    cmd.setDescription("スロットをプレイするコマンドなのだ！");

    return cmd;
}

//ヘルプコマンドの取得
function getHelpCmd(){
    const cmd = new SlashCommandBuilder();

    cmd.setName("game_help");
    cmd.setDescription("ゲームのヘルプコマンドなのだ！");
    cmd.addStringOption(option => {
        option.setName("content");
        option.setDescription("内容を選択するのだ！");
        option.addChoices(
            {name: "casino_slot", value: "casino_slot"}
        );
        option.setRequired(true);
        return option;
    });
    
    return cmd;
}

//CUIコマンドの実行
async function cmd(interaction, slot_map){
    //サーバー以外を除外
    if(!interaction.guild){
        console.log("後で修正");
        return -1;
    }

    switch(interaction.commandName){
        case "game_casino_slot" : {
            await interaction.deferReply({ephemeral: true});
            await casino_slot.exe(interaction, slot_map);
            break;
        }
        case "game_help" : {
            const options = {content : null};
            options.content = interaction.options.get("content").value;
            await game_help.exe(interaction, options);
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