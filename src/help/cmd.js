/*****************
    cmd.js
    スニャイヴ
    2024/09/12
*****************/

module.exports = {
    getCmd: getCmd,
    menu: menu,
    help: help,
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
                {name: "AIの回答生成", value: "help_cohere"},
                {name: "読み上げ開始", value: "help_vv_start"},
                {name: "読み上げ終了", value: "help_vv_end"},
                {name: "読み上げユーザー設定", value: "help_vv_setUser"},
                {name: "読み上げサーバー設定", value: "help_vv_setServer"},
                {name: "読み上げ辞書追加", value: "help_vv_dictAdd"},
                {name: "読み上げ辞書削除", value: "help_vv_dictDel"}
            )   
        );

    return help;
}

//メニュー
async function menu(interaction){

    //メンションメニュー
    if(interaction.applicationId != process.env.BOT_ID){
        let menu_mention = await interaction.reply(embed.menu_mention());
        setTimeout(() => menu_mention.delete().catch(()=>{}), 10000);
        return;
    }

    //cohereメニュー
    if(interaction.customId === "menu_cohere"){
        await interaction.message.delete().catch(()=>{});
        interaction.showModal(embed.menu_cohere());
        return;
    }

    //voicevoxメニュー
    if(interaction.customId === "menu_vv"){
        await interaction.message.delete().catch(()=>{});
        interaction.followUp(embed.menu_vv());
        return;
    }

    //使い方メニュー
    if(interaction.customId === "menu_help"){
        await interaction.message.delete().catch(()=>{});
        interaction.followUp(embed.menu_help());
        return
    }

    //voicevox使い方メニュー01
    if(interaction.customId === "menu_help_vv01"){
        await interaction.editReply(embed.menu_help_vv01());
        return;
    }

    //voicevox使い方メニュー02
    if(interaction.customId === "menu_help_vv02"){
        await interaction.editReply(embed.menu_help_vv02());
        return;
    }

    return;
}

//helpコマンド
async function help(interaction){

    //helpコマンド
    if((interaction.isCommand() && !interaction.options.get("content")) || (interaction.isButton() && interaction.customId === "help_readme")){
        await interaction.followUp(embed.help_readme());
    }

    //cohereのhelp
    else if((interaction.isCommand() && interaction.options.get("content").value === "help_cohere") ||  (interaction.isButton() && interaction.customId === "help_cohere")){
        await interaction.followUp(embed.help_cohere());
    }

    //voicevox_startのhelp
    else if((interaction.isCommand() && interaction.options.get("content").value === "help_vv_start") ||  (interaction.isButton() && interaction.customId === "help_vv_start")){
        await interaction.followUp(embed.help_vv_start());
    }

    //voicevox_endのhelp
    else if((interaction.isCommand() && interaction.options.get("content").value === "help_vv_end") ||  (interaction.isButton() && interaction.customId === "help_vv_end")){
        await interaction.followUp(embed.help_vv_end());
    }

    //voicevox_setting_userのhelp
    else if((interaction.isCommand() && interaction.options.get("content").value === "help_vv_setUser") ||  (interaction.isButton() && interaction.customId === "help_vv_setUser")){
        await interaction.followUp(embed.help_vv_setUser());
    }

    //voicevox_setting_serverのhelp
    else if((interaction.isCommand() && interaction.options.get("content").value === "help_vv_setServer") ||  (interaction.isButton() && interaction.customId === "help_vv_setServer")){
        await interaction.followUp(embed.help_vv_setServer());
    }

    //voicevox_dictAddのhelp
    else if((interaction.isCommand() && interaction.options.get("content").value === "help_vv_dictAdd") ||  (interaction.isButton() && interaction.customId === "help_vv_dictAdd")){
        await interaction.followUp(embed.help_vv_dictAdd());
    }

    //voicevox_dictDeleteのhelp
    else if((interaction.isCommand() && interaction.options.get("content").value === "help_vv_dictDel") ||  (interaction.isButton() && interaction.customId === "help_vv_dictDel")){
        await interaction.followUp(embed.help_vv_dictDel());
    }

    return;
}