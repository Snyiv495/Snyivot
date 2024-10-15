/*****************
    index.js
    スニャイヴ
    2024/10/07
*****************/

require('dotenv').config();
const {Client, GatewayIntentBits} = require('discord.js');
const fs = require('fs');
const cohere = require('./cohere/cohere');
const cui = require('./cui/cui');
const gui = require('./gui/gui');
const voicevox = require('./voicevox/voicevox');

const client = new Client({intents:[GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates]});
const channel_map = new Map();
const subsc_map = new Map();
let readme;
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

    //voicevoxのスピーカーの取得
    try{
        vv_speakers = await voicevox.getSpeakers();
    }catch(e){
        console.log("### voicevoxのスピーカーの取得に失敗しました ###\n### 再起動してください ###\n");
        process.exit();
    }

    //コマンドの登録
    try{
        await client.application.commands.set(cui.getCmds());
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
        return;
    }

    //メンションに反応
    if(message.mentions.users.has(client.user.id)){

        //内容がなければヘルプ
        if(message.content.match(new RegExp('^<@'+process.env.BOT_ID+'>$'))){
            //await guide.menu(message);
        }
       
        //内容があれば回答
        else{
            await cohere.sendAns(message, readme);
        }
        
        //メンション文を削除
        if(message.deletable){
            await message.delete().catch(() => null);
        }

        return;
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
    if(!interaction.isCommand() || !interaction.guild){
        return;
    }

    //cohereコマンド
    if(interaction.commandName === "help_cohere"){
        await cohere.sendHelp(interaction);
        return;
    }
    
    if(interaction.commandName === "cohere"){
        await cohere.showModal(interaction);
        return;
    }
    
    await interaction.deferReply();
    await (await interaction.followUp({content: "コマンドを受理したのだ"})).delete().catch(()=>{});

    //helpコマンド
    if(interaction.commandName === "help"){
        await guide.help(interaction);
        return;
    }

    

    //voicevox_startコマンド
    if(interaction.commandName === "voicevox_start"){
        await voicevox.start(interaction, channel_map, subsc_map);
        return;   
    }

    //voicevox_endコマンド
    if(interaction.commandName === "voicevox_end"){
        await voicevox.end(interaction, channel_map, subsc_map);
        return;
    }

    //voicevox_setting_userコマンド
    if(interaction.commandName === "voicevox_setting_user"){
        await voicevox.setUser(interaction, vv_speakers);
        return;
    }

    //voicevox_setting_serverコマンド
    if(interaction.commandName === "voicevox_setting_server"){
        await voicevox.setServer(interaction, vv_speakers);
        return;
    }

    //voicevox_dictionary_addコマンド
    if(interaction.commandName === "voicevox_dictionary_add"){
        await voicevox.dictAdd(interaction);
        return;
    }

    //voicevox_dictionary_deleteコマンド
    if(interaction.commandName === "voicevox_dictionary_delete"){
        await voicevox.dictDel(interaction);
        return;
    }

    return;
})

//コマンド自動補動作
client.on('interactionCreate', async (interaction) => {
    //コマンド自動補完以外を除外
    if(!interaction.isAutocomplete()){
        return;
    }

    //voicevox_setting_*コマンド
    if(interaction.commandName === "voicevox_setting_user" || interaction.commandName === "voicevox_setting_server"){
        await voicevox.autocomplete(interaction, vv_speakers);
        return;
    }

    return;
})

//ボタン動作
client.on('interactionCreate', async (interaction) => {
    //ボタン以外を除外
    if(!interaction.isButton()){
        return;
    }

    if(interaction.customId === "menu_cohere"){
        await interaction.message.delete().catch(()=>{});
        await cohere.showModal(interaction);
        return;
    }

    //ボタンの削除
    await interaction.update({components: [], ephemeral: true});

    if(interaction.customId === "menu_vv" || interaction.customId === "menu_help" || interaction.customId === "menu_help_vv01" || interaction.customId === "menu_help_vv02"){
        await guide.menu(interaction);
        return;
    }

    if(interaction.customId === "start_vv"){
        await voicevox.start(interaction, channel_map, subsc_map);
        return;
    }

    if(interaction.customId === "end_vv" || interaction.customId === "endAll_vv"){
        await voicevox.end(interaction, channel_map, subsc_map);
        return;
    }

    if(interaction.customId === "help_readme" || interaction.customId === "help_cohere" || interaction.customId === "help_vv_start" || interaction.customId === "help_vv_end" || interaction.customId === "help_vv_setUser" || interaction.customId === "help_vv_setServer" || interaction.customId === "help_vv_dictAdd" || interaction.customId === "help_vv_dictDel"){
        await guide.help(interaction);
        return;
    }

    return;
})

//モーダル動作
client.on('interactionCreate', async (interaction) => {
    //モーダル以外を除外
    if(!interaction.isModalSubmit()){
        return
    }

	if(interaction.customId === "modal_cohere"){
        await cohere.sendAns(interaction, readme);
        return;
	}

    return;
})

//ボイスチャンネル動作
client.on('voiceStateUpdate', (oldState, newState) => {
    //自動終了
    if(subsc_map.get(oldState.channelId) && oldState.channel.members.filter((member)=>!member.user.bot).size < 1){
        voicevox.autoEnd(oldState, channel_map, subsc_map);
        return;
    }

    //強制退出時の処理
    if(subsc_map.get(oldState.channelId) && !oldState.channel.members.has(process.env.BOT_ID) && !newState.channel){
        voicevox.compulsionEnd(oldState, channel_map, subsc_map);
        return;
    }

    //強制移動時の処理
    if(subsc_map.get(oldState.channelId) && !oldState.channel.members.has(process.env.BOT_ID) && newState.channel){
        voicevox.compulsionMove(oldState, newState, channel_map, subsc_map);
        return;
    }

    return;
});