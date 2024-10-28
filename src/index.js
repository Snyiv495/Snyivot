/*****************
    index.js
    スニャイヴ
    2024/10/23
*****************/

require('dotenv').config();
const {Client, GatewayIntentBits} = require('discord.js');
const fs = require('fs');
const cohere = require('./cohere/cohere');
const cui = require('./cui');
const gui = require('./gui');
const voicevox = require('./voicevox/voicevox');

const client = new Client({intents:[GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates]});
const channel_map = new Map();
const subsc_map = new Map();
let readme;
let scene;
let vv_speakers;

//botのログイン
client.login(process.env.BOT_TOKEN);

//起動動作
client.once('ready', async () => {
    //READMEの取得
    try{
        readme = fs.readFileSync("./README.md", {encoding: "utf8"});
    }catch(e){
        console.log("### READMEの取得に失敗しました ###\n### 再起動してください ###\n");
        process.exit();
    }

    //voicevoxのGUIの取得
    try{
        scene = JSON.parse(fs.readFileSync("./src/scene.json", {encoding: "utf8"}));
    }catch(e){
        console.log("### GUIの取得に失敗しました ###\n### 再起動してください ###\n");
        process.exit();
    }

    //voicevoxのスピーカーの取得
    try{
        vv_speakers = await voicevox.getSpeakers();
    }catch(e){
        console.log("### voicevoxのスピーカーの取得に失敗しました ###\n### 再起動してください ###\n");
        process.exit();
    }

    //コマンドの登録
    try{
        await client.application.commands.set(cui.getSlashCmds());
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
    //botの発言, スポイラーのみ, コードブロックを含むメッセージを除外
    if(message.author.bot || (message.content.match(/^\|\|.*?\|\|$/)) || (message.content.match(/```.*?```/))){
        return -1;
    }

    //メンションに反応
    if(message.mentions.users.has(client.user.id)){

        //内容がなければヘルプ
        if(message.content.match(new RegExp('^<@'+process.env.BOT_ID+'>$'))){
            await message.reply(await gui.createGui("mention", scene));
        }
       
        //内容があれば回答
        else{
            await cohere.sendAns(message, readme);
        }
        
        //メンション文を削除
        if(message.deletable){
            await message.delete().catch(() => null);
        }

        return 0;
    }
    
    //読み上げ
    if(channel_map.get(message.channelId)){
        voicevox.read(message, subsc_map.get(channel_map.get(message.channelId)));
        return;
    }
    
    return;
});

//コマンド動作
client.on('interactionCreate', async (interaction) => {
    //コマンド以外を除外
    if(!interaction.isCommand()){
        return -1;
    }

    //cohere
    if(interaction.commandName.includes("cohere")){
        await cohere.cuiCmd(interaction);
        return 0;
    }

    //voicevox
    if(interaction.commandName.includes("voicevox")){
        await voicevox.cuiCmd(interaction, channel_map, subsc_map, vv_speakers);
        return 0;
    }

    return -1;
});

//コマンド補助
client.on('interactionCreate', async (interaction) => {
    //コマンド補助以外を除外
    if(!interaction.isAutocomplete()){
        return -1;
    }

    //voicevox
    if(interaction.commandName.includes("voicevox_setting")){
        await voicevox.autocomplete(interaction, vv_speakers);
        return 0;
    }

    return -1;
});

//セレクトメニュー動作
client.on('interactionCreate', async (interaction) => {
    //セレクトメニュー以外を除外
    if(!interaction.isAnySelectMenu()){
        return -1;
    }
    
    if(interaction.values[0].includes("voicevox")){
        await voicevox.guiMenu(interaction, channel_map, subsc_map, vv_speakers, vv_gui);
        return 0;
    }

    return -1;

});

//ボタン動作
client.on('interactionCreate', async (interaction) => {
    //ボタン以外を除外
    if(!interaction.isButton()){
        return -1;
    }

    //GUI
    if(interaction.customId.includes("gui")){
        await gui.guiButton(interaction);
        return 0;
    }

    return -1;
});

//モーダル動作
client.on('interactionCreate', async (interaction) => {
    //モーダル以外を除外
    if(!interaction.isModalSubmit()){
        return -1;
    }

    //cohere
	if(interaction.customId === "modal_cohere"){
        await cohere.sendAns(interaction, readme);
        return 0;
	}

    //voicevox
    if(interaction.customId.includes("voicevox")){
        await voicevox.guiModal(interaction, channel_map, subsc_map, vv_speakers);
        return 0;
    }

    return -1;
});

//ボイスチャンネル動作
client.on('voiceStateUpdate', (oldState, newState) => {

    //voicevox
    voicevox.observe(oldState, newState, channel_map, subsc_map);

    return 0;
});