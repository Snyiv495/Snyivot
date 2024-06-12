/*****************
    index.js
    スニャイヴ
    2024/06/12    
*****************/

require('dotenv').config();
const {Client, GatewayIntentBits} = require('discord.js');
const cohere = require('./src/cohere/cohere')
const voicevox = require('./src/voicevox/voicevox');

const client = new Client({intents:[GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates]});
const channel_map = new Map();
const subsc_map = new Map();
let vv_speakers;

//botのログイン
client.login(process.env.SNYIVOT_TOKEN);

//起動動作
client.once('ready', async () => {
    //voicevoxのスピーカーの取得
    vv_speakers = await voicevox.getSpeakers();

    //コマンドの登録
    try{
        await client.application.commands.set([voicevox.getCmd(vv_speakers)]);
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
    //botの発言, spoilerのみのメッセージを除外
    if(message.author.bot || (message.content.match(/^\|\|.*?\|\|$/))){
        return;
    }

    //メンションに反応
    if(message.mentions.users.has(client.user.id)){
        await cohere.invoke(message);
        return;
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
    if(!interaction.isCommand()){
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

//ボイスチャンネル動作
client.on('voiceStateUpdate', (oldState, newState) => {
    //自動終了
    voicevox.autoStop(oldState, channel_map, subsc_map);

    //強制退出時の処理
    voicevox.compulsionEnd(oldState, newState, channel_map, subsc_map);

    //強制移動時の処理
    voicevox.compulsionMove(oldState, newState, channel_map, subsc_map);

    return;
});