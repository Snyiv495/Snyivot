/*****************
    index.js
    スニャイヴ
    2025/07/15
*****************/

require('dotenv').config();
const {Client, GatewayIntentBits, Partials} = require('discord.js');
const fs = require('fs');
// const psd = require('ag-psd');

const cui = require('./core/cui');
const gui = require('./core/gui');
const observe = require('./core/observe');

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
        console.log(`↓↓↓ READMEの取得に失敗しました ↓↓↓\n${e}\n↑↑↑ READMEの取得に失敗しました ↑↑↑`);
        process.exit();
    }

    //GUIの取得
    try{
        const files = ["./src/json/home.json", "./src/json/ai.json", "./src/json/faq.json", "./src/json/read.json"];
        map.set("gui_json", files.flatMap(file => JSON.parse(fs.readFileSync(file, "utf-8"))));
    }catch(e){
        console.log(`↓↓↓ GUIの取得に失敗しました ↓↓↓\n${e}\n↑↑↑ GUIの取得に失敗しました ↑↑↑`);
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
        console.log(`↓↓↓ コマンドの登録に失敗しました ↓↓↓\n${e}\n↑↑↑ コマンドの登録に失敗しました ↑↑↑`);
        process.exit();
    }

    //スピーカーの取得
    try{
        map.set("voicevox_speakers", (await require("./integrations/voicevox").getSpeakers()).data);
    }catch(e){
        console.log(`↓↓↓ スピーカーの取得に失敗しました ↓↓↓\n${e}\n↑↑↑ スピーカーの取得に失敗しました ↑↑↑`);
        process.exit();
    }

    //botのステータス設定
    client.user.setActivity("メンションで質問できるよ！");
    console.log("### すにゃBotが起動しました ###\n");
});
  
//メッセージ動作
client.on('messageCreate', async (message) => {

    //botの発言を除外
    if(message.author.bot){
        return 0;
    }

    //呼び出しに反応
    if(message.content.match(new RegExp(`^<@${process.env.BOT_ID}>.?`)) || message.content.match(new RegExp(`^@${message.guild.members.me.displayName}.?`)) || message.content.match(new RegExp(/(すにゃ|スニャ|すな|スナ|すに|スニ)(ぼっと|ボット|ぼ|ボ|bot|Bot|BOT)/))){
        try{
            await cui.call(message, map);
            return 0;
        }catch(e){
            console.log(`↓↓↓ 呼び出しの反応に失敗しました ↓↓↓\n${e}\n↑↑↑ 呼び出しの反応に失敗しました ↑↑↑`);
            return -1;
        }
    }

    //読み上げ
    if(map.get(`read_text_${message.channelId}`)){
        try{
            await observe.textChannel(message, map);
            return 0;
        }catch(e){
            console.log(`↓↓↓ 読み上げに失敗しました ↓↓↓\n${e}\n↑↑↑ 読み上げに失敗しました ↑↑↑`);
            return -1;
        }
    }
    
    return -1;
});

//インタラクション動作
client.on('interactionCreate', async (interaction) => {

    //ギルド以外での動作
    if(!interaction.guild){
        try{
            gui.nguild(interaction, map);
            return 0;
        }catch(e){
            console.log(`↓↓↓ ギルド外での反応に失敗しました ↓↓↓\n${e}\n↑↑↑ ギルド外での反応に失敗しました ↑↑↑`);
            return -1;
        }
    }

    //スラッシュコマンド
    if(interaction.isCommand()){
        try{
            await cui.slashCmd(interaction, map);
            return 0;
        }catch(e){
            console.log(`↓↓↓ コマンドの実行に失敗しました ↓↓↓\n${e}\n↑↑↑ コマンドの実行に失敗しました ↑↑↑`);
            return -1;
        }
    }

    //スラッシュコマンド補助
    if(interaction.isAutocomplete()){
        try{
            await cui.autoComplete(interaction, map);
            return 0;
        }catch(e){
            console.log(`↓↓↓ コマンドの補助に失敗しました ↓↓↓\n${e}\n↑↑↑ コマンドの補助に失敗しました ↑↑↑`);
            return -1;
        }
    }
    
    //セレクトメニュー
    if(interaction.isAnySelectMenu()){
        try{
            await gui.menu(interaction, map);
            return 0;
        }catch(e){
            console.log(`↓↓↓ メニューの実行に失敗しました ↓↓↓\n${e}\n↑↑↑ メニューの実行に失敗しました ↑↑↑`);
            return -1;
        }
    }

    //ボタン
    if(interaction.isButton()){
        try{
            await gui.button(interaction, map);
            return 0;
        }catch(e){
            console.log(`↓↓↓ ボタンの実行に失敗しました ↓↓↓\n${e}\n↑↑↑ ボタンの実行に失敗しました ↑↑↑`);
            return -1;
        }
    }

    //モーダル
    if(interaction.isModalSubmit()){
        try{
            await gui.modal(interaction, map);
            return 0;
        }catch(e){
            console.log(`↓↓↓ モーダルの実行に失敗しました ↓↓↓\n${e}\n↑↑↑ モーダルの実行に失敗しました ↑↑↑`);
            return -1;
        }
    }

    return -1;
});

//ボイスチャンネル動作
client.on('voiceStateUpdate', async (old_state, new_state) => {
    try{
        observe.voiceChannel(old_state, new_state, map);
        return 0;
    }catch(e){
        console.log(`↓↓↓ ボイチャの操作に失敗しました ↓↓↓\n${e}\n↑↑↑ ボイチャの操作に失敗しました ↑↑↑`);
        return -1;
    }
});

//リアクション動作
client.on('messageReactionAdd', async (reaction) => {
    const message = reaction.partial ? await reaction.fetch().then(react => react.message) : reaction.message;

    //他人のメッセージを除外
    if(message.author.id != client.user.id){
        return 0;
    }

    try{
        await gui.reaction(message, reaction, map);
        return 0;
    }catch(e){
        console.log(`↓↓↓ リアクションの反応に失敗しました ↓↓↓\n${e}\n↑↑↑ リアクションの反応に失敗しました ↑↑↑`);
        return -1;
    }
});