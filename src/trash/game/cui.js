/*****************
    cui.js
    スニャイヴ
    2025/01/24
*****************/

module.exports = {
    getSlashCmds: getSlashCmds,
    cmd: cmd,
    createProgressbar: createProgressbar,
    stepProgressbar: stepProgressbar,
}

require('dotenv').config();
const {SlashCommandBuilder} = require('discord.js');
const shop = require('./execute/shop');
const casino_shop = require('./execute/casino/shop');
const casino_slot = require('./execute/casino/slot');
const work_calc = require('./execute/work/calc');
const work_prot = require('./execute/work/prot');
//const help = require('./execute/help');

//スラッシュコマンドの取得
function getSlashCmds(){
    const slash_cmds = [];

    slash_cmds.push(getShopCmd());
    slash_cmds.push(getCasinoShopCmd());
    slash_cmds.push(getCasinoSlotCmd());
    slash_cmds.push(getWorkProtCmd());
    slash_cmds.push(getWorkCalcCmd());
    //slash_cmds.push(getHelpCmd());

    return slash_cmds;
}

//売買コマンドの取得
function getShopCmd(){
    const cmd = new SlashCommandBuilder();

    cmd.setName("game_shop");
    cmd.setDescription("売買をするコマンドなのだ！");

    return cmd;
}

//カジノ関連の売買コマンドの取得
function getCasinoShopCmd(){
    const cmd = new SlashCommandBuilder();

    cmd.setName("game_casino_shop");
    cmd.setDescription("カジノ関連の売買をするコマンドなのだ！");

    return cmd;
}

//スロットコマンドの取得
function getCasinoSlotCmd(){
    const cmd = new SlashCommandBuilder();

    cmd.setName("game_casino_slot");
    cmd.setDescription("スロットをするコマンドなのだ！");

    return cmd;
}

//保護士コマンドの取得
function getWorkProtCmd(){
    const cmd = new SlashCommandBuilder();

    cmd.setName("game_work_prot");
    cmd.setDescription("保護の仕事をするコマンドなのだ！");

    return cmd;
}

//演算士コマンドの取得
function getWorkCalcCmd(){
    const cmd = new SlashCommandBuilder();

    cmd.setName("game_work_calc");
    cmd.setDescription("計算の仕事をするコマンドなのだ！");

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
            {name: "casino_slot", value: "casino_slot"},
            {name: "casino_shop", value: "casino_shop"},
            {name: "work_calc", value: "work_calc"},
            {name: "work_prot", value: "work_prot"}
        );
        option.setRequired(true);
        return option;
    });
    
    return cmd;
}

//CUIコマンドの実行
async function cmd(interaction, map){
    //サーバー以外を除外
    if(!interaction.guild){
        console.log("後で修正");
        return -1;
    }

    switch(interaction.commandName){
        case "game_shop" : {
            await shop.exe(interaction);
            break;
        }
        case "game_casino_slot" : {
            await interaction.deferReply({ephemeral: true});
            await casino_slot.exe(interaction, map);
            break;
        }
        case "game_casino_shop" : {
            await casino_shop.exe(interaction);
            break;
        }
        case "game_work_calc" : {
            await work_calc.exe(interaction, map);
            break;
        }
        case "game_work_prot" : {
            await interaction.deferReply({ephemeral: true});
            await work_prot.exe(interaction, map);
            break;
        }
        case "game_help" : {
            await interaction.deferReply({ephemeral: true});
            await game_help.exe(interaction, {content : interaction.options.get("content").value});
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