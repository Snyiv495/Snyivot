/*****************
    cmd.js
    スニャイヴ
    2024/07/22
*****************/

module.exports = {
    getCmd: getCmd,
    help: help,
    menu_home: menu_home,
    menu_help: menu_help,
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
                {name: "cohere", value: "cohere"},
                {name: "voicevox", value: "voicevox"}
            )   
        );

    return help;
}

//helpコマンド
async function help(interaction){

    //helpコマンド
    if((interaction.isCommand() && !interaction.options.get("content")) || (interaction.isButton() && interaction.customId === "readme")){
        interaction.reply(embed.readme());
        return;
    }

    //cohereのhelp
    if((interaction.isCommand() && interaction.options.get("content").value === "cohere") ||  (interaction.isButton() && interaction.customId === "help_cohere")){
        interaction.reply(embed.cohere());
        return;
    }

    //voicevoxのhelp
    if((interaction.isCommand() && interaction.options.get("content").value === "voicevox") ||  (interaction.isButton() && interaction.customId === "help_voicevox")){
        interaction.reply(embed.voicevox());
        return;
    }
}

//ホームメニュー
function menu_home(message){
    message.reply(embed.menu_home());
    return;
}

//ヘルプメニュー
function menu_help(interaction){
    interaction.reply(embed.menu_help());
    return;
}
