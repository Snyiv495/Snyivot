/*****************
    index.js
    スニャイヴ
    2024/07/22    
*****************/

require('dotenv').config();
const {Client, GatewayIntentBits} = require('discord.js');
const fs = require('fs');
const help = require('./help/help');
const cohere = require('./cohere/cohere');
const voicevox = require('./voicevox/voicevox');

const client = new Client({intents:[GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates]});
const channel_map = new Map();
const subsc_map = new Map();
let readme;
let vv_speakers;

//botのログイン
client.login(process.env.SNYIVOT_TOKEN);

//起動動作
client.once('ready', async () => {
    //READMEの取得
    try{
        readme = fs.readFileSync("./README.md", {encoding: "utf8"});
    }catch(e){
        console.log("### READMEの取得に失敗しました ###\n### 再起動してください ###\n");
        process.exit();
    }

    //voicevoxのスピーカーの取得
    vv_speakers = await voicevox.getSpeakers();

    //コマンドの登録
    try{
        await client.application.commands.set([help.getCmd(), voicevox.getCmd(vv_speakers)]);
    }catch(e){
        console.log("### コマンドの登録に失敗しました ###\n### 再起動してください ###\n");
        process.exit();
    }

    //botのステータス設定
    client.user.setActivity("メンションで質問できるよ！");
    console.log("### Snyivotが起動しました ###\n");
});

//メッセージ動作
client.on('messageCreate', async message => {
    //botの発言, コードブロックのメッセージを除外
    if(message.author.bot || (message.content.match(/```.*?```/))){
        return;
    }

    //メンションに反応
    if(message.mentions.users.has(client.user.id)){
        //内容がなければヘルプ
        if(message.content.match(new RegExp('^<@'+process.env.SNYIVOT_ID+'>$'))){
            help.menu_home(message);
            return;
        }
       
        //内容があれば回答
        else{
            await cohere.invoke(message, readme);
            return;
        }
        
    }

    //読み上げ
    if(channel_map.get(message.channelId)){
        await voicevox.read(message, subsc_map.get(channel_map.get(message.channelId)));
        return;
    }
    
    return;
});

//コマンド動作
client.on('interactionCreate', async (interaction) => {
    //コマンド以外を除外
    if(!interaction.isCommand() || !interaction.guild){
        return;
    }
    
    //helpコマンド
    if(interaction.commandName === "help"){
        help.help(interaction);
        return;
    }

    //voicevoxコマンド
    if(interaction.commandName === "voicevox"){
        voicevox.voicevox(interaction, channel_map, subsc_map, vv_speakers);
        return;   
    }


    return;
})

//コマンド補助動作
client.on('interactionCreate', async (interaction) => {
    if(!interaction.isAutocomplete()){
        return;
    }

    //voicevoxコマンド
    if(interaction.commandName === "voicevox"){
        await voicevox.voicevox_autocomplete(interaction, channel_map, vv_speakers);
        return;
    }

    return;
})

//ボタン動作
client.on('interactionCreate', async (interaction) => {
    if(!interaction.isButton()){
        return;
    }

    if(interaction.customId === "help"){
        help.menu_help(interaction);
        return;
    }

    if(interaction.customId === "help_cohere"){
        help.help(interaction);
        return;
    }

    if(interaction.customId === "help_voicevox"){
        help.help(interaction);
        return;
    }

    if(interaction.customId === "readme"){
        help.help(interaction);
        return;
    }

    if(interaction.customId === "voicevox"){
        voicevox.voicevox(interaction, channel_map, subsc_map, vv_speakers);
        return;
    }
})

//ボイスチャンネル動作
client.on('voiceStateUpdate', (oldState, newState) => {
    //自動終了
    if(subsc_map.get(oldState.channelId) && oldState.channel.members.filter((member)=>!member.user.bot).size < 1){
        voicevox.autoStop(oldState, channel_map, subsc_map);
        return;
    }

    //強制退出時の処理
    if(subsc_map.get(oldState.channelId) && !oldState.channel.members.has(process.env.SNYIVOT_ID) && !newState.channel){
        voicevox.compulsionEnd(oldState, channel_map, subsc_map);
        return;
    }

    //強制移動時の処理
    if(subsc_map.get(oldState.channelId) && !oldState.channel.members.has(process.env.SNYIVOT_ID) && newState.channel){
        voicevox.compulsionMove(oldState, newState, channel_map, subsc_map);
        return;
    }

    return;
});