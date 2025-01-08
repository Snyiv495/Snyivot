/*****************
    index.js
    スニャイヴ
    2025/01/08
*****************/

require('dotenv').config();
const {Client, GatewayIntentBits} = require('discord.js');
const fs = require('fs');
const cui = require('./cui');
const gui = require('./gui');
const cohere = require('./cohere/cohere');
const game = require('./game/game');
const voicevox = require('./voicevox/voicevox');

const client = new Client({intents:[GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates]});
const voicevox_map = new Map();
const game_map = new Map();

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
        console.log("### シーンの取得に失敗しました ###\n### 再起動してください ###\n");
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
        client.application.commands.set(cui.getSlashCmds());
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

        //内容がなければGUIの送信
        if(message.content.match(new RegExp('^<@'+process.env.BOT_ID+'>$'))){
            await gui.send(message, scene);
        }
       
        //内容があれば回答
        else{
            await cohere.mention(message, readme);
        }
        
        //メンション文を削除
        if(message.deletable){
            await message.delete().catch(() => null);
        }

        return 0;
    }
    
    //読み上げ
    if(voicevox_map.get(`text_${message.channelId}`)){
        voicevox.read(message, voicevox_map.get(`voice_${voicevox_map.get(`text_${message.channelId}`)}`));
        return 0;
    }
    
    return -1;
});

//インタラクション動作
client.on('interactionCreate', async (interaction) => {
    //スラッシュコマンド
    if(interaction.isCommand()){
        //cohere
        if(interaction.commandName.includes("cohere")){
            await cohere.cuiCmd(interaction);
            return 0;
        }

        //game
        if(interaction.commandName.includes("game")){
            await game.cuiCmd(interaction, game_map);
            return 0;
        }

        //voicevox
        if(interaction.commandName.includes("voicevox")){
            await voicevox.cuiCmd(interaction, voicevox_map, vv_speakers);
            return 0;
        }

        //readme
        if(interaction.commandName === "readme"){
            await cui.cmd(interaction);
            return 0;
        }

        return -1;
    }

    //スラッシュコマンド補助
    if(interaction.isAutocomplete()){
        //voicevox
        if(interaction.commandName.includes("voicevox")){
            await voicevox.autocomplete(interaction, vv_speakers);
            return 0;
        }

        return -1;
    }

    //セレクトメニュー
    if(interaction.isAnySelectMenu()){
        //実行
        if(interaction.values[0].includes("exe")){
            //cohere
            if(interaction.customId.includes("cohere")){
                await cohere.guiMenu(interaction);
                return 0;
            }

            //game
            if(interaction.customId.includes("game")){
                await game.guiMenu(interaction, game_map);
                return 0;
            }

            //voicevox
            if(interaction.customId.includes("voicevox")){
                await voicevox.guiMenu(interaction, voicevox_map, vv_speakers);
                return 0;
            }

            //GUI
            if(interaction.customId.includes("home")){
                await gui.menu(interaction);
                return 0;
            }

            return -1;
        }

        //GUIの遷移
        await gui.send(interaction, scene);

        return 0;
    }

    //ボタン
    if(interaction.isButton()){
        //実行
        if(interaction.customId.includes("exe")){
            //cohere
            if(interaction.customId.includes("cohere")){
                await cohere.guiButton(interaction);
                return 0;
            }
    
            //game
            if(interaction.customId.includes("game")){
                await game.guiButton(interaction, game_map);
                return 0;
            }
    
            //voicevox
            if(interaction.customId.includes("voicevox")){
                await voicevox.guiButton(interaction, vv_speakers);
                return 0
            }
    
            return -1;
        }
    
        //GUIの遷移
        await gui.send(interaction, scene);
    
        return 0;
    }

    //モーダル
    if(interaction.isModalSubmit()){
        //cohere
        if(interaction.customId.includes("cohere")){
            await cohere.guiModal(interaction, readme);
            return 0;
        }

        //game
        if(interaction.customId.includes("game")){
            await game.guiModal(interaction, game_map);
            return 0;
        }

        //voicevox
        if(interaction.customId.includes("voicevox")){
            await voicevox.guiModal(interaction, vv_speakers);
            return 0;
        }

        return -1;
    }

    return -1;
});

//ボイスチャンネル動作
client.on('voiceStateUpdate', (oldState, newState) => {

    //voicevox
    voicevox.observe(oldState, newState, voicevox_map);

    return 0;
});