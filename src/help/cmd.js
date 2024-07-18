/*****************
    cmd.js
    スニャイヴ
    2024/07/08
*****************/

module.exports = {
    getCmd: getCmd,
    help: help
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
    if(!interaction.options.get("content")){
        interaction.reply(embed.readme());
        return;
    }

    //cohereのhelp
    if(interaction.options.get("content").value === "cohere"){
        interaction.reply(embed.cohere());
        return;
    }


    //voicevoxのhelp
    if(interaction.options.get("content").value === "voicevox"){
        interaction.reply(embed.voicevox());
        return;
    }
}
