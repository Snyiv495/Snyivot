/*****************
    index.js
    スニャイヴ
    2025/12/09
*****************/

//環境変数の読み込み
require('dotenv').config();
if(!process.env.BOT_TOKEN || !process.env.BOT_ID){
    console.error("index.js => require('dotenv').config() \n .envの読み込みに失敗しました");
    process.exit();
}

const {Client, GatewayIntentBits, Partials} = require('discord.js');
const fs = require('fs');
const path = require('path');

const cui = require('./core/cui');
const gui = require('./core/gui');
const vc = require('./core/vc');
const helper = require('./core/helper');

const client = new Client({intents:[GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions], partials: [Partials.Message, Partials.Channel, Partials.Reaction]});
const map = new Map();

//botのログイン
client.login(process.env.BOT_TOKEN);

//起動動作
client.once('clientReady', async () => {
    //READMEの取得
    try{
        map.set("readme_md", await fs.promises.readFile("./README.md", "utf-8"));
    }catch(e){
        console.error("index.js => client.once() \n READMEの取得に失敗しました \n", e);
        process.exit();
    }

    //リアクションの取得
    try{
        map.set("reaction_json", JSON.parse(await fs.promises.readFile("./src/json/reaction.json", "utf-8")));
    }catch(e){
        console.error("index.js => client.once() \n リアクションフォーマットの取得に失敗しました \n", e);
        process.exit();
    }

    //オリジナルコラ画像の取得
    try{
        map.set("collage_original_json", JSON.parse(await fs.promises.readFile("./src/json/collage-original.json", "utf-8")));
    }catch(e){
        console.error("index.js => client.once() \n オリジナルコラ画像フォーマットの取得に失敗しました \n", e);
        process.exit();
    }

    //GUIの取得
    try{
        const files = ["./src/json/home.json", "./src/json/collage.json", "./src/json/ai.json", "./src/json/faq.json", "./src/json/omikuji.json", "./src/json/read.json"];
        map.set("gui_json", (await Promise.all(files.map(file => fs.promises.readFile(file, "utf-8")))).flatMap(json => JSON.parse(json)));
    }catch(e){
        console.error("index.js => client.once() \n GUIフォーマットの取得に失敗しました \n", e);
        process.exit();
    }

    //アセット画像の取得
    try{
        const asset_images = new Map();
        const assets_dir = "./assets";
        const image_exts = [".png", ".jpg"];
        const readAssets = async (dir) => {
            const entries = await fs.promises.readdir(dir, {withFileTypes: true});
            const promises = entries.map(async (entry) => {
                const full_path = path.join(dir, entry.name);
                
                if(entry.isDirectory()){
                    await readAssets(full_path);
                    return;
                }
                
                if(entry.isFile()){
                    const ext = path.extname(entry.name).toLowerCase();
                    if(image_exts.includes(ext)){
                        const re_full_path = full_path.replace(/\\/g, "/");
                        const buffer = await fs.promises.readFile(re_full_path);
                        asset_images.set(re_full_path, buffer);
                    }
                }
            });
            await Promise.all(promises);
        };

        await readAssets(assets_dir);
        map.set("asset_images", asset_images);
        
    }catch(e){
        console.error("index.js => client.once() \n アセットのキャッシュに失敗しました \n", e);
        process.exit();
    }

    //コマンドの登録
    try{
        client.application.commands.set(cui.getSlashCmds(JSON.parse(await fs.promises.readFile("./src/json/slashcmd.json", "utf-8"))));
    }catch(e){
        console.error("index.js => client.once() \n コマンドの登録に失敗しました \n", e);
        process.exit();
    }

    //スピーカーの取得
    try{
        map.set("voicevox_speakers", (await require("./integrations/voicevox").getSpeakers()).data);
    }catch(e){
        console.error("index.js => client.once() \n スピーカーの取得に失敗しました \n", e);
        process.exit();
    }

    //botのステータス設定
    client.user.setActivity("メンションで起動できるよ！");
    console.log("### すにゃBotが起動しました ###\n");
});
  
//メッセージ動作
client.on('messageCreate', async (message) => {
    try{
        //botの発言を除外
        if(message.author.bot) return;

        //ギルド以外での動作
        if(!message.guild){
            await gui.nguild(message, map);
            return;
        }

        //メンションに反応
        if(helper.isContainBotMention(message)){
            message.system_id = "mention";
            await cui.msgCmd(message, map);
            return;
        }

        //名前か返信に反応
        if(helper.isContainBotName(message) || (message.reference && (await message.fetchReference())?.author.id===client.user.id)){
            message.system_id = "ai_chat_public";
            await cui.msgCmd(message, map);
            return;
        }

        //読み上げ
        if(map.get(`read_text_${message.channelId}`)){
            message.system_id = "read_text";
            await cui.msgCmd(message, map);
            return;
        }

    }catch(e){
        const date = helper.getDate(message);
        const time = helper.getTime(message);
        console.log(`#####\n${date.year}/${date.month}/${date.date}(${date.day}) ${time.hours}:${time.minutes}:${time.seconds}.${time.milliseconds}\n#####`);
        console.error("index.js => client.on(messageCreate) \n", e);
    }
    
    return;
});

//インタラクション動作
client.on('interactionCreate', async (interaction) => {
    try{
        //ギルド以外での動作
        if(!interaction.guild){
            await gui.nguild(interaction, map);
            return;
        }

        //スラッシュコマンド
        if(interaction.isCommand()){
            await cui.slashCmd(interaction, map);
            return;
        }

        //スラッシュコマンド補助
        if(interaction.isAutocomplete()){
            await cui.autoComplete(interaction, map);
            return;
        }
        
        //セレクトメニュー
        if(interaction.isAnySelectMenu()){
            await gui.menu(interaction, map);
            return;
        }

        //ボタン
        if(interaction.isButton()){
            await gui.button(interaction, map);
            return;
        }

        //モーダル
        if(interaction.isModalSubmit()){
            await gui.modal(interaction, map);
            return;
        }

    }catch(e){
        const date = helper.getDate(interaction);
        const time = helper.getTime(interaction);
        console.log(`#####\n${date.year}/${date.month}/${date.date}(${date.day}) ${time.hours}:${time.minutes}:${time.seconds}.${time.milliseconds}\n#####`);
        console.error("index.js => client.on(interactionCreate) \n", e);
        await helper.sendGUI(interaction, gui.create(map, "null"));
        return;
    }

    //未定義インタラクション
    const date = helper.getDate(interaction);
    const time = helper.getTime(interaction);
    console.log(`#####\n${date.year}/${date.month}/${date.date}(${date.day}) ${time.hours}:${time.minutes}:${time.seconds}.${time.milliseconds}\n#####`);
    console.error("index.js => client.on(interactionCreate) \n not define interaction");
    await helper.sendGUI(interaction, gui.create(map, "null"));
    return;
});

//ボイスチャンネル動作
client.on('voiceStateUpdate', async (old_state, new_state) => {
    try{
        //関与していないチャンネルを無視
        if(!map.get(`read_voice_${old_state.channelId}`)) return;

        //ボイチャにユーザーがいなくなる
        if(!old_state.channel.members.filter((member)=>!member.user.bot).size){
            old_state.system_id = "read_voice_auto_end";
            await vc.voiceStateCmd(old_state, new_state, map);
            return;
        }

        //ボイチャを蹴られる
        if(!old_state.channel.members.has(process.env.BOT_ID) && !new_state.channel){
            old_state.system_id = "read_voice_manual_kick";
            await vc.voiceStateCmd(old_state, new_state, map);
            return;
        }

        //ボイチャを移動させられる
        if(!old_state.channel.members.has(process.env.BOT_ID) && new_state.channel){
            old_state.system_id = "read_voice_manual_move";
            await vc.voiceStateCmd(old_state, new_state, map);
            return;
        }

    }catch(e){
        console.error("index.js => client.on(voiceStateUpdate) \n", e);
    }

    return;
});

//リアクション動作
client.on('messageReactionAdd', async (reaction, user) => {
    try{
        //データの補完
        if(reaction.partial) await reaction.fetch();
        if(user.partial) await user.fetch();
        if(user.bot || reaction.count > 1) return;

        const emoji = reaction.emoji.name;
        const message = reaction.message;

        //コラ画像リアクション
        for(const element of map.get("collage_original_json")){
            if(element.emoji === emoji){
                message.react(reaction.emoji);
                message.system_id = `collage_${element.type}_${message.id}_${user.id}_${emoji}`;
                await gui.reaction(message, map);
                return;
            }
        }

        //その他リアクション
        for(const element of map.get("reaction_json")){
            if(element.emoji === emoji){
                message.system_id = element.system_id;
                await gui.reaction(message, map);
                return;
            }
        }

    }catch(e){
        console.error("index.js => client.on(messageReactionAdd) \n", e);
    }
});

//Discord.jsクライアントのエラー処理
client.on('error', (e) => {
    console.error("index.js => client.on(error) \n", e);
});