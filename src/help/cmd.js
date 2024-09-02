/*****************
    cmd.js
    スニャイヴ
    2024/09/03
*****************/

module.exports = {
    getCmd: getCmd,
    help: help,
    menu_home: menu_home,
    menu_voicevox: menu_voicevox,
    menu_help: menu_help,
    menu_help_voicevox_1: menu_help_voicevox_1,
    menu_help_voicevox_2: menu_help_voicevox_2,
}

require('dotenv').config();
const {SlashCommandBuilder} = require('discord.js');
const embed = require('./embed');

//コマンドの取得
function getCmd(){
    const help = new SlashCommandBuilder()
        .setName("help")
        .setDescription("ヘルプコマンド")
        .addStringOption(option => option
            .setName("content")
            .setDescription("知りたい内容を選択してください")
            .addChoices(
                {name: "AIの回答生成", value: "cohere"},
                {name: "読み上げ開始", value: "voicevox_start"},
                {name: "読み上げ終了", value: "voicevox_end"},
                {name: "読み上げユーザー設定", value: "voicevox_setting_user"},
                {name: "読み上げサーバー設定", value: "voicevox_setting_server"},
                {name: "読み上げ辞書追加", value: "voicevox_dictAdd"},
                {name: "読み上げ辞書削除", value: "voicevox_dictDel"}
            )   
        );

    return help;
}

//helpコマンド
function help(interaction){

    //helpコマンド
    if((interaction.isCommand() && !interaction.options.get("content")) || (interaction.isButton() && interaction.customId === "readme")){
        interaction.editReply(embed.readme());
        return;
    }

    //cohereのhelp
    if((interaction.isCommand() && interaction.options.get("content").value === "cohere") ||  (interaction.isButton() && interaction.customId === "help_cohere")){
        interaction.editReply(embed.cohere());
        return;
    }

    //voicevox_startのhelp
    if((interaction.isCommand() && interaction.options.get("content").value === "voicevox_start") ||  (interaction.isButton() && interaction.customId === "help_voicevox_start")){
        interaction.editReply(embed.help_voicevox_start());
        return;
    }

    //voicevox_endのhelp
    if((interaction.isCommand() && interaction.options.get("content").value === "voicevox_end") ||  (interaction.isButton() && interaction.customId === "help_voicevox_end")){
        interaction.editReply(embed.help_voicevox_end());
        return;
    }

    //voicevox_setting_userのhelp
    if((interaction.isCommand() && interaction.options.get("content").value === "voicevox_setting_user") ||  (interaction.isButton() && interaction.customId === "help_voicevox_setting_user")){
        interaction.editReply(embed.help_voicevox_setting_user());
        return;
    }

    //voicevox_setting_serverのhelp
    if((interaction.isCommand() && interaction.options.get("content").value === "voicevox_setting_server") ||  (interaction.isButton() && interaction.customId === "help_voicevox_setting_server")){
        interaction.editReply(embed.help_voicevox_setting_server());
        return;
    }

    //voicevox_dictAddのhelp
    if((interaction.isCommand() && interaction.options.get("content").value === "voicevox_dictAdd") ||  (interaction.isButton() && interaction.customId === "help_voicevox_dictAdd")){
        interaction.editReply(embed.help_voicevox_dictAdd());
        return;
    }

    //voicevox_dictDeleteのhelp
    if((interaction.isCommand() && interaction.options.get("content").value === "voicevox_dictDel") ||  (interaction.isButton() && interaction.customId === "help_voicevox_dictDel")){
        interaction.editReply(embed.help_voicevox_dictDel());
        return;
    }

    return;
}

//ホームメニュー
function menu_home(message){
    message.reply(embed.menu_home());
    return;
}

//voicevoxメニュー
function menu_voicevox(interaction){
    interaction.editReply(embed.menu_voicevox());
    return;
}

//ヘルプメニュー
function menu_help(interaction){
    interaction.editReply(embed.menu_help());
    return;
}

//voicevoxヘルプメニュー1
function menu_help_voicevox_1(interaction){
    interaction.editReply(embed.menu_help_voicevox_1());
    return;
}

//voicevoxヘルプメニュー2
function menu_help_voicevox_2(interaction){
    interaction.editReply(embed.menu_help_voicevox_2());
    return;
}