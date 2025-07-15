/*****************
    cui.js
    スニャイヴ
    2025/03/19
*****************/

module.exports = {
    getCmds: getCmds,
    mention: mention,
    cmd: cmd,
}

const {SlashCommandBuilder} = require('discord.js');
const chat = require('./execute/chat');
const draw = require('./execute/draw');

//コマンドの取得
function getCmds(){
    const cmds = [];

    cmds.push(getAiCmd());

    return cmds;
}

//AIコマンドの取得
function getAiCmd(){
    const command = new SlashCommandBuilder();

    command.setName("ai");
    command.setDescription("AI機能を利用するコマンドなのだ！");
    command.addStringOption(option => {
        option.setName("exe");
        option.setDescription("使いたい機能を選ぶのだ！");
        option.addChoices(
            {name : "chat",value : "ai_chat_exe"},
            {name : "draw",value : "ai_draw_exe"}
        )
        option.required=true;
        return option;
    });

    return command;
}

//メンションの実行
async function mention(message, map){

    await chat.exe(message, map);
    
    return 0;
}

//コマンドの実行
async function cmd(interaction, map){
    
    switch(interaction.options.get("exe").value){
        case "ai_chat_exe" : {
            await chat.exe(interaction, map);
            return 0;
        }
        case "ai_draw_exe" : {
            await draw.exe(interaction, map);
            return 0;
        }
        default : break;
    }

    return -1;
}