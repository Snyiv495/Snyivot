/*****************
    cui.js
    スニャイヴ
    2024/12/26
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
const work_calc = require('./execute/work/calc');
//const help = require('./execute/help');

//スラッシュコマンドの取得
function getSlashCmds(){
    const slash_cmds = [];

    //slash_cmds.push(getZundamocchiFoodCmd());
    //slash_cmds.push(getZundamocchiPlayCmd());
    //slash_cmds.push(getZundamocchiCleanCmd());
    slash_cmds.push(getCasinoSlotCmd());
    //slash_cmds.push(getWorkIdentCmd());
    //slash_cmds.push(getWorkInspectCmd());
    slash_cmds.push(getWorkCalcCmd());
    //slash_cmds.push(getHelpCmd());

    return slash_cmds;
}

//食べ物コマンドの取得
function getZundamocchiFoodCmd(){
    const cmd = new SlashCommandBuilder();

    cmd.setName("game_zundamocchi_food");
    cmd.setDescription("ずんだもんにご飯をあげるコマンドなのだ！");

    return cmd;
}

//遊ぶコマンドの取得
function getZundamocchiPlayCmd(){
    const cmd = new SlashCommandBuilder();

    cmd.setName("game_zundamocchi_play");
    cmd.setDescription("ずんだもんと遊ぶコマンドなのだ！");

    return cmd;
}

//掃除コマンドの取得
function getZundamocchiCleanCmd(){
    const cmd = new SlashCommandBuilder();

    cmd.setName("game_zundamocchi_clean");
    cmd.setDescription("ずんだもんの部屋を掃除するコマンドなのだ！");

    return cmd;
}

//スロットコマンドの取得
function getCasinoSlotCmd(){
    const cmd = new SlashCommandBuilder();

    cmd.setName("game_casino_slot");
    cmd.setDescription("スロットをプレイするコマンドなのだ！");

    return cmd;
}

//識別士コマンドの取得
function getWorkIdentCmd(){
    const cmd = new SlashCommandBuilder();

    cmd.setName("game_work_ident");
    cmd.setDescription("識別の仕事をするコマンドなのだ！");

    return cmd;
}

//検品士コマンドの取得
function getWorkInspectCmd(){
    const cmd = new SlashCommandBuilder();

    cmd.setName("game_work_inspect");
    cmd.setDescription("検品の仕事をするコマンドなのだ！");

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
            {name: "casino_slot", value: "casino_slot"}
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
        case "game_zundamocchi_food" : {
            await interaction.deferReply({ephemeral: true});
            await zundamocchi_food.exe(interaction);
            break;
        }
        case "game_zundamocchi_play" : {
            await interaction.deferReply({ephemeral: true});
            await zundamocchi_play.exe(interaction);
            break;
        }
        case "game_zundamocchi_clean" : {
            await interaction.deferReply({ephemeral: true});
            await zundamocchi_clean.exe(interaction);
            break;
        }
        case "game_zundamocchi_shop" : {
            await interaction.deferReply({ephemeral: true});
            await zundamocchi_shop.exe(interaction);
            break;
        }
        case "game_casino_slot" : {
            await interaction.deferReply({ephemeral: true});
            await casino_slot.exe(interaction, map);
            break;
        }
        case "game_work_calc" : {
            await work_calc.exe(interaction, map);
            break;
        }
        case "game_work_ident" : {
            await interaction.deferReply({ephemeral: true});
            await work_ident.exe(interaction, map);
            break;
        }
        case "game_work_inspect" : {
            await interaction.deferReply({ephemeral: true});
            await work_inspect.exe(interaction, map);
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
async function stepProgressbar(progress, activity){
    let bar = "";

    progress.current = ((progress.current+(progress.step*2)-1)<100) ? progress.current+progress.step : 100;
    
    for(let i=0; i<10; i++){
        bar += (i < Math.floor(progress.current/10)) ? "#" : "-";
    }

    await progress.interaction.editReply({content: `進捗[${bar}]${Math.floor(progress.current)}%\n${activity}`});

    return progress;
}