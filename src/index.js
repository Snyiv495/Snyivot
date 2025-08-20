/*****************
    index.js
    スニャイヴ
    2025/08/20
*****************/

require('dotenv').config();
const {Client, GatewayIntentBits, Partials} = require('discord.js');
const fs = require('fs');
// const psd = require('ag-psd');

const cui = require('./core/cui');
const gui = require('./core/gui');
const vc = require('./core/vc');
const helper = require('./core/helper');

const client = new Client({intents:[GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions], partials: [Partials.Message, Partials.Channel, Partials.Reaction]});
const map = new Map();

//botのログイン
client.login(process.env.BOT_TOKEN);

//起動動作
client.once('ready', async () => {
    //READMEの取得
    try{
        map.set("readme_md", fs.readFileSync("./README.md", "utf-8"));
    }catch(e){
        console.error("index.js => client.once() \n READMEの取得に失敗しました \n", e);
        process.exit();
    }

    //GUIの取得
    try{
        const files = ["./src/json/home.json", "./src/json/ai.json", "./src/json/faq.json", "./src/json/omikuji.json", "./src/json/read.json"];
        map.set("gui_json", files.flatMap(file => JSON.parse(fs.readFileSync(file, "utf-8"))));
    }catch(e){
        console.error("index.js => client.once() \n GUIの取得に失敗しました \n", e);
        process.exit();
    }

    //psdの取得
    /*
    try{
        psd.initializeCanvas(require('canvas').createCanvas, require('canvas').loadImage);
        map.set("kasukabe_tsumugi_psd", psd.readPsd(fs.readFileSync("./assets/sakamoto_ahiru/kasukabe_tsumugi.psd")));
        map.set("zundamon_psd", psd.readPsd(fs.readFileSync("./assets/sakamoto_ahiru/zundamon.psd")));
        fs.writeFileSync("./assets/sakamoto_ahiru/kasukabe_tsumugi/default.json", JSON.stringify(JSON.parse(JSON.stringify(psd.readPsd(fs.readFileSync("./assets/sakamoto_ahiru/kasukabe_tsumugi/default.psd"), {skipLayerImageData: true, skipCompositeImageData: true, skipThumbnail: true}))), null, 4), 'utf-8');
        fs.writeFileSync("./assets/sakamoto_ahiru/zundamon/default.json", JSON.stringify(JSON.parse(JSON.stringify(psd.readPsd(fs.readFileSync("./assets/sakamoto_ahiru/zundamon/default.psd"), {skipLayerImageData: true, skipCompositeImageData: true, skipThumbnail: true}))), null, 4), 'utf-8');
    }catch(e){
        console.log(`↓↓↓ psdの取得に失敗しました ↓↓↓\n${e}\n↑↑↑ psdの取得に失敗しました ↑↑↑`);
        process.exit();
    }
    */

    //コマンドの登録
    try{
        client.application.commands.set(cui.getSlashCmds(JSON.parse(fs.readFileSync("./src/json/slashcmd.json", "utf-8"))));
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
        if(message.author.bot){
            return;
        }

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

        //名前に反応
        if(helper.isContainBotName(message)){
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
        console.error("index.js => client.on(interactionCreate) \n", e);
        return;
    }

    console.error("index.js => client.on(interactionCreate) \n not define interaction");
    return;
});

//ボイスチャンネル動作
client.on('voiceStateUpdate', async (old_state, new_state) => {
    try{
        //関与していないチャンネルを除外
        if(!map.get(`read_voice_${old_state.channelId}`)){
           return;
        }

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
client.on('messageReactionAdd', async (reaction) => {
    const message = reaction.partial ? await reaction.fetch().then(react => react.message) : reaction.message;

    //他人のメッセージを除外
    if(helper.getUserId(message) != client.user.id){
        return;
    }

    try{
        gui.reaction(message, reaction, map);
        return;
    }catch(e){
        console.error("index.js => client.on(messageReactionAdd) \n", e);
    }

    return;
});

/*  todo
psdの読み取り
リアクション動作の改修
*/