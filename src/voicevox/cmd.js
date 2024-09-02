/*****************
    cmd.js
    スニャイヴ
    2024/08/26    
*****************/

module.exports = {
    getCmd: getCmd,
    setUser: setUser,
    setServer: setServer,
    autocomplete: autocomplete,
    start: start,
    end: end,
    dictAdd: dictAdd,
    dictDel: dictDel,
}

require('dotenv').config();
const {SlashCommandBuilder} = require('discord.js');
const {joinVoiceChannel, createAudioPlayer} = require('@discordjs/voice');
const fs = require('fs');
const axios = require('axios').create({baseURL: process.env.VOICEVOX_SERVER, proxy: false});
const db = require('./db');
const embed = require('./embed');

//コマンドの取得
function getCmd(){
    const voicevox_start = new SlashCommandBuilder()
        .setName("voicevox_start")
        .setDescription("voicevoxの開始コマンド")
    ;

    const voicevox_end = new SlashCommandBuilder()
        .setName("voicevox_end")
        .setDescription("voicevoxの終了コマンド")
        .addBooleanOption(option => option
            .setName("all")
            .setDescription("サーバー全体の読み上げを終了する？")
        )
    ;

    const voicevox_setting_user = new SlashCommandBuilder()
        .setName("voicevox_setting_user")
        .setDescription("voicevoxのユーザー用設定コマンド")
        .addStringOption(option => option
            .setName("speaker")
            .setDescription("キャラ名を入力してください")
            .setAutocomplete(true)
        )
        .addStringOption(option => option
            .setName("style")
            .setDescription("キャラのスタイルを入力してください")
            .setAutocomplete(true)
        )
        .addNumberOption(option => option
            .setName("speed")
            .setDescription("読み上げの速度を入力してください[0.5~2.0]")
            .setMaxValue(2.0)
            .setMinValue(0.5)
        )
        .addNumberOption(option => option
            .setName("pitch")
            .setDescription("読み上げの高さを入力してください[-0.15~0.15]")
            .setMaxValue(0.15)
            .setMinValue(-0.15)
        )
        .addNumberOption(option => option
            .setName("intonation")
            .setDescription("読み上げの抑揚を入力してください[0.0~2.0]")
            .setMaxValue(2.0)
            .setMinValue(0.0)
        )
        .addNumberOption(option => option
            .setName("volume")
            .setDescription("読み上げの音量を入力してください[0.0~2.0]")
            .setMaxValue(2.0)
            .setMinValue(0.0)
        )
        .addStringOption(option => option
            .setName("username")
            .setDescription("読み上げに使うあなたの名前を入力してください")
        )
    ;

    const voicevox_setting_server = new SlashCommandBuilder()
        .setName("voicevox_setting_server")
        .setDescription("voicevoxのサーバー用設定コマンド")
        .addBooleanOption(option => option
            .setName("need_sudo")
            .setDescription("このコマンドの利用に管理者権限を必要とする？")
        )
        .addBooleanOption(option => option
            .setName("read_name")
            .setDescription("読み上げ時に名前を読み上げる？")
        )
        .addBooleanOption(option => option
            .setName("continue_name")
            .setDescription("発言者が連続しても名前を読み上げる？")
        )
        .addBooleanOption(option => option
            .setName("continue_line")
            .setDescription("複数行の文章も全て読み上げる？")
        )
        .addIntegerOption(option => option
            .setName("maxwords")
            .setDescription("読み上げる最大文字数を入力してください[10~50]")
            .setMaxValue(50)
            .setMinValue(10)
        )
        .addBooleanOption(option => option
            .setName("unif")
            .setDescription("全員の読み上げ音声をこのコマンド設定で統一する？")
        )
        .addStringOption(option => option
            .setName("speaker")
            .setDescription("キャラ名を入力してください")
            .setAutocomplete(true)
        )
        .addStringOption(option => option
            .setName("style")
            .setDescription("キャラのスタイルを入力してください")
            .setAutocomplete(true)
        )
        .addNumberOption(option => option
            .setName("speed")
            .setDescription("読み上げの速度を入力してください[0.5~2.0]")
            .setMaxValue(2.0)
            .setMinValue(0.5)
        )
        .addNumberOption(option => option
            .setName("pitch")
            .setDescription("読み上げの高さを入力してください[-0.15~0.15]")
            .setMaxValue(0.15)
            .setMinValue(-0.15)
        )
        .addNumberOption(option => option
            .setName("intonation")
            .setDescription("読み上げの抑揚を入力してください[0.0~2.0]")
            .setMaxValue(2.0)
            .setMinValue(0.0)
        )
        .addNumberOption(option => option
            .setName("volume")
            .setDescription("読み上げの音量を入力してください[0.0~2.0]")
            .setMaxValue(2.0)
            .setMinValue(0.0)
        )
    ;

    const voicevox_dictionary_add = new SlashCommandBuilder()
        .setName("voicevox_dictionary_add")
        .setDescription("voicevoxの辞書追加コマンド")
        .addStringOption(option => option
            .setName("surface")
            .setDescription("言葉を入力してください")
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName("pronunciation")
            .setDescription("発音をカタカナで入力してください")
            .setRequired(true)
        )
        .addIntegerOption(option => option
            .setName("accent")
            .setDescription("語調が下がるのが何文字目かを入力してください")
        )
        .addIntegerOption(option => option
            .setName("priority")
            .setDescription("読み替えを行う優先度を入力してください")
            .setMaxValue(9)
            .setMinValue(1)
        )
    ;

    const voicevox_dictionary_delete = new SlashCommandBuilder()
        .setName("voicevox_dictionary_delete")
        .setDescription("voicevoxの辞書削除コマンド")
        .addStringOption(option => option
            .setName("uuid")
            .setDescription("削除したい言葉のuuidを入力してください")
        )
    ;
    
    return [voicevox_start, voicevox_end, voicevox_setting_user, voicevox_setting_server, voicevox_dictionary_add, voicevox_dictionary_delete];
}

//ユーザー情報の設定
async function setUser(interaction, speakers){
    const userInfo = await db.getUserInfo(interaction.user.id);
    let selEmb = 0;

    //speakerオプション
    if(interaction.options.get("speaker")){
        if(interaction.options.get("speaker").value === "ランダム"){
            const rand = Math.floor(Math.random()*speakers.length);
            userInfo.speaker = speakers[rand].name;
            userInfo.uuid = speakers[rand].speaker_uuid;
            userInfo.style = speakers[rand].styles[0].name;
            userInfo.id = speakers[rand].styles[0].id; 
        }else{
            for(let i=0; i<speakers.length; i++){
                if(speakers[i].name === interaction.options.get("speaker").value){
                    userInfo.speaker = speakers[i].name;
                    userInfo.uuid = speakers[i].speaker_uuid;
                    userInfo.style = speakers[i].styles[0].name;
                    userInfo.id = speakers[i].styles[0].id; 
                    break;
                }

                if(i == speakers.length-1){
                    selEmb = 1;
                }
            }
        }
    }

    //styleオプション
    if(!selEmb && interaction.options.get("style")){
        for(let i=0; i<speakers.length; i++){
            if(userInfo.speaker === speakers[i].name){
                if(interaction.options.get("style").value === "ランダム"){
                    const rand = Math.floor(Math.random()*speakers[i].styles.length);
                    userInfo.style = speakers[i].styles[rand].name;
                    userInfo.id = speakers[i].styles[rand].id;
                }else{
                    for(let j=0; j<speakers[i].styles.length; j++){
                        if(speakers[i].styles[j].name === interaction.options.get("style").value){
                            userInfo.style = speakers[i].styles[j].name;
                            userInfo.id = speakers[i].styles[j].id;
                            break;
                        }

                        if(j == speakers[i].styles.length-1){
                            selEmb = 2;
                        }
                    }
                }
                break;
            }
        }
    }

    //speedオプション
    if(interaction.options.get("speed")){
        userInfo.speed = interaction.options.get("speed").value;
    }

    //pitchオプション
    if(interaction.options.get("pitch")){
        userInfo.pitch = interaction.options.get("pitch").value;
    }

    //intonationオプション
    if(interaction.options.get("intonation")){
        userInfo.intonation = interaction.options.get("intonation").value;
    }

    //volumeオプション
    if(interaction.options.get("volume")){
        userInfo.volume = interaction.options.get("volume").value;
    }
    
    //usernameオプション
    if(interaction.options.get("username")){
        userInfo.username = (interaction.options.get("username").value === "null") ? null : (interaction.options.get("username").value).substr(0, 10);
    }

    //問題がなければ保存
    if(!selEmb){
        await db.setUserInfo(interaction.user.id, userInfo);
    }

    interaction.editReply(await embed.setUser(userInfo, interaction.user.displayName, selEmb));
}

//サーバー情報の設定
async function setServer(interaction, speakers){
    const serverInfo = await db.getServerInfo(interaction.guild.id);
    let selEmb = 0;

    if(serverInfo.need_sudo && !interaction.memberPermissions.has("Administrator")){
        selEmb = 1;
    }else{
        //need_sudoオプション
        if(interaction.options.get("need_sudo")){
            if(interaction.memberPermissions.has("Administrator")){
                serverInfo.need_sudo = interaction.options.get("need_sudo").value;
            }else{
                selEmb = 2;
            }
        }

        //nameオプション
        if(interaction.options.get("read_name")){
            serverInfo.read_name = interaction.options.get("read_name").value;
        }

        //continue_nameオプション
        if(interaction.options.get("continue_name")){
            serverInfo.continue_name = interaction.options.get("continue_name").value;
        }

        //continue_lineオプション
        if(interaction.options.get("continue_line")){
            serverInfo.continue_line = interaction.options.get("continue_line").value;
        }

        //maxwordsオプション
        if(interaction.options.get("maxwords")){
            serverInfo.maxwords = interaction.options.get("maxwords").value;
        }

        //unifオプション
        if(interaction.options.get("unif")){
            serverInfo.unif = interaction.options.get("unif").value;
        }

        //speakerオプション
        if(interaction.options.get("speaker")){
            if(interaction.options.get("speaker").value === "ランダム"){
                const rand = Math.floor(Math.random()*speakers.length);
                serverInfo.speaker = speakers[rand].name;
                serverInfo.uuid = speakers[rand].speaker_uuid;
                serverInfo.style = speakers[rand].styles[0].name;
                serverInfo.id = speakers[rand].styles[0].id; 
            }else{
                for(let i=0; i<speakers.length; i++){
                    if(speakers[i].name === interaction.options.get("speaker").value){
                        serverInfo.speaker = speakers[i].name;
                        serverInfo.uuid = speakers[i].speaker_uuid;
                        serverInfo.style = speakers[i].styles[0].name;
                        serverInfo.id = speakers[i].styles[0].id; 
                        break;
                    }

                    if(i == speakers.length-1){
                        selEmb = 3;
                    }
                }
            }
        }

        //styleオプション
        if(!selEmb && interaction.options.get("style")){
            for(let i=0; i<speakers.length; i++){
                if(serverInfo.speaker === speakers[i].name){
                    if(interaction.options.get("style").value === "ランダム"){
                        const rand = Math.floor(Math.random()*speakers[i].styles.length);
                        serverInfo.style = speakers[i].styles[rand].name;
                        serverInfo.id = speakers[i].styles[rand].id;
                    }else{
                        for(let j=0; j<speakers[i].styles.length; j++){
                            if(speakers[i].styles[j].name === interaction.options.get("style").value){
                                serverInfo.style = speakers[i].styles[j].name;
                                serverInfo.id = speakers[i].styles[j].id;
                                break;
                            }

                            if(j == speakers[i].styles.length-1){
                                selEmb = 4;
                            }
                        }
                    }
                    break;
                }
            }
        }

        //speedオプション
        if(interaction.options.get("speed")){
            serverInfo.speed = interaction.options.get("speed").value;
        }

        //pitchオプション
        if(interaction.options.get("pitch")){
            serverInfo.pitch = interaction.options.get("pitch").value;
        }

        //intonationオプション
        if(interaction.options.get("intonation")){
            serverInfo.intonation = interaction.options.get("intonation").value;
        }

        //volumeオプション
        if(interaction.options.get("volume")){
            serverInfo.volume = interaction.options.get("volume").value;
        }

    }
    
    //問題がなければ保存
    if(!selEmb){
        await db.setServerInfo(interaction.guild.id, serverInfo);
    }
    
    interaction.editReply(await embed.setServer(serverInfo, interaction.guild.name, selEmb));
}

//voicevox_setting_*コマンドの補助
async function autocomplete(interaction, speakers){
    const focusedOpt = interaction.options.getFocused(true);
    const choices = new Array();
    
    //speakerオプションの補助
    if(focusedOpt.name === "speaker"){
        if(focusedOpt.value === ""){
            choices.push("ランダム");
        }else{
            for(let i=0; i<speakers.length; i++){
                if((speakers[i].name).includes(focusedOpt.value)){
                    choices.push(speakers[i].name);
                }
            }
        }
    }

    //styleオプションの補助
    if(focusedOpt.name === "style"){
        const speaker = interaction.options.getString("speaker") ? interaction.options.getString("speaker") : (await db.getInfo(interaction.user.id)).speaker_name;

        if(speaker === "ランダム"){
            choices.push("ランダム");
        }else{
            for(let i=0; i<speakers.length; i++){
                if(speaker === speakers[i].name){
                    for(let j=0; j<speakers[i].styles.length; j++){
                        choices.push(speakers[i].styles[j].name);
                    }
                    break;
                }
            }
        }
    }

    interaction.respond(choices.map(choices => ({name: choices, value: choices})));

    return;
}

//読み上げ開始
function start(interaction, channel_map, subsc_map){
    let textCh = null;
    let voiceCh = null;
    let connectingCh = null;
    let selEmb = 0;

    //ギルドチャンネルか確認
    if(!interaction.guild){
        textCh = {name : "DM"}
        selEmb = 1;
    }else{
        textCh = interaction.channel;
        voiceCh = interaction.member.voice.channel;
        connectingCh = interaction.guild.channels.cache.find((channel) => channel.type == 2 && channel.members.get(process.env.BOT_ID)); 

        //既に読み上げを行っていないか確認
        if(channel_map.get(textCh.id)){
            selEmb = 2;
        }

        //チャンネルがテキストチャンネルであることを確認
        else if(!(textCh.type == 0 || textCh.type == 2)){
            selEmb = 1;
        }

        //テキストチャンネルのメンバーにbotがいるか確認
        else if(textCh.type == 0 && !textCh.members.find((member) => member.id === process.env.BOT_ID)){
            selEmb = 3;
        }

        //コマンド使用者がボイチャに接続しているか確認
        else if(!voiceCh){
            selEmb = 4;
        }

        //botがボイスチャンネルに接続できるか確認
        else if(!voiceCh.joinable){
            selEmb = 5;
        }

        //botがボイスチャンネルで喋れるか確認
        else if(!voiceCh.speakable){
            selEmb = 6;
        }

        //読み上げるチャンネルを追加
        else if(connectingCh && connectingCh.id == voiceCh.id){
            channel_map.set(textCh.id, voiceCh.id);
        }
        
        //呼ばれたチャンネル以外で読み上げをしている場合
        else if(connectingCh && connectingCh.id != voiceCh.id){
            interaction.guild.channels.cache.forEach((channel) => {
                if((channel.type == 0 || channel.type == 2) && channel_map.get(channel.id)){
                    try{
                        subsc_map.get(channel_map.get(channel.id)).connection.destroy();
                    }catch(e){
                        console.log("### ボイチャ切断エラー ###");
                    }
                    subsc_map.delete(channel_map.get(channel.id));
                    channel_map.delete(channel.id);
                }
            });
        }
    }

    //読み上げ開始
    if(!selEmb){                
        //botのvc接続処理
        try{
            const connection = joinVoiceChannel({
                channelId: voiceCh.id,
                guildId: voiceCh.guild.id,
                adapterCreator: voiceCh.guild.voiceAdapterCreator,
                selfMute: false,
                selfDeaf: true,
            })

            channel_map.set(textCh.id, voiceCh.id);
            subsc_map.set(voiceCh.id, connection.subscribe(createAudioPlayer()));
        }catch{
            console.log("### ボイチャ接続エラー ###");
        }
    }

    interaction.editReply(embed.start(textCh, voiceCh, selEmb));
}

//読み上げ終了
function end(interaction, channel_map, subsc_map){
    let textCh = null;
    let voiceCh = null;
    let connectingCh = null;
    let selEmb = 0;

    //ギルドチャンネルか確認
    if(!interaction.guild){
        textCh = {name : "DM"}
        selEmb = 1;
    }else{
        textCh = interaction.channel;
        voiceCh = interaction.member.voice.channel;
        connectingCh = interaction.guild.channels.cache.find((channel) => channel.type == 2 && channel.members.get(process.env.BOT_ID)); 
        
        //ボイスチャンネルの確認
        if(!voiceCh || (voiceCh != connectingCh)){
            selEmb = 2;
        }

        //読み上げを行っているか確認
        else if(channel_map.get(textCh.id) != voiceCh.id){
            selEmb = 1;
        }

        //読み上げ終了
        else{
            if((interaction.isButton() && interaction.customId === "vv_end") || (interaction.isCommand() && (!interaction.options.get("all") || !interaction.options.get("all").value))){
                interaction.guild.channels.cache.forEach((channel) => {
                    if(channel_map.get(channel.id) && channel.id != textCh){
                        channel_map.delete(textCh.id);
                        selEmb = 3;
                        return;
                    }
                });
            }

            //allオプション
            if(!selEmb || (interaction.isButton() && interaction.customId === "vv_end_all") || (interaction.isCommand() && interaction.options.get("all").value)){
                try{
                    subsc_map.get(voiceCh.id).connection.destroy();
                }catch(e){
                    console.log("### ボイチャ切断エラー ###");
                }
                subsc_map.delete(voiceCh.id);
                interaction.guild.channels.cache.forEach((channel) => {
                    if(channel_map.get(channel.id)){
                        channel_map.delete(channel.id);
                    }
                });
            }
        }
    }

    interaction.editReply(embed.end(textCh, voiceCh, selEmb));
}

//辞書の追加
async function dictAdd(interaction){
    const serverInfo = await db.getServerInfo(interaction.guild.id);
    let surface = interaction.options.get("surface").value;
    let pronunciation = interaction.options.get("pronunciation").value;
    let accent = 1;
    let priority = 5;
    let uuid = null;
    let selEmb = 0;

    //カタカナ以外を検出
    if(pronunciation.match(/[^ァ-ヴー]/)){
        selEmb = 1;
    }

    //クヮ, グヮ以外のヮを検出
    if(pronunciation.match(/(?<!(ク|グ))ヮ/)){
        selEmb = 2;
    }


    //アクセントの確認
    if(interaction.options.get("accent")){
        accent = interaction.options.get("accent").value;
    }

    //優先度の確認
    if(interaction.options.get("priority")){
        priority = interaction.options.get("priority").value;
    }

    //問題がなければ保存
    if(!selEmb){
        //辞書ファイルの削除
        fs.unlink(`${process.env.VOICEVOX_DICTIONARY}`, (e) => {});

        //既存の辞書のインポート
        await axios.post("import_user_dict?override=true", JSON.stringify(serverInfo.dict), {headers:{"Content-Type": "application/json"}})
            .then(async function(){
                //新規ワードの追加
                await axios.post(`user_dict_word?surface=${encodeURI(surface)}&pronunciation=${encodeURI(pronunciation)}&accent_type=${accent}&priority=${priority}`, {headers:{"accept" : "application/json"}})
                    .then(async function(res){
                        uuid = res.data;

                        //追加後の辞書を取得
                        await axios.get("user_dict", {headers:{"accept" : "application/json"}})
                            .then(function(res){
                                serverInfo.dict = res.data;
                            })
                            .catch(function(){
                                console.log("### VOICEVOXサーバとの接続が不安定です ###");
                            })
                    })
                    .catch(function(){
                        selEmb = 3;
                    })
            })
            .catch(function(){
                console.log("### VOICEVOXサーバとの接続が不安定です ###");
            })
        ;
            
        await db.setServerInfo(interaction.guild.id, serverInfo);
    }

    interaction.editReply(embed.dictAdd(surface, pronunciation, accent, priority, uuid, selEmb));
}

//辞書の削除
async function dictDel(interaction){
    const serverInfo = await db.getServerInfo(interaction.guild.id);
    let dictCsv = `dict_${interaction.guild.id}.csv`;
    let uuid = interaction.options.get("uuid") ? interaction.options.get("uuid").value : null
    let surface = null;
    let selEmb = 0;

    //全削除uuid
    if(uuid === "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" || uuid === "********-****-****-****-************"){
        serverInfo.dict = {};
        selEmb = 1; 
    }

    //任意のuuidの言葉を削除する
    else if(uuid && serverInfo.dict[uuid]){
        surface = serverInfo.dict[uuid].surface
        delete serverInfo.dict[uuid];
        selEmb = 2;
    }
    
    //存在しないuuid
    else if(uuid && !serverInfo.dict[uuid]){
        selEmb = 3;
    }

    //問題がなければ保存
    if(selEmb == 1 || selEmb == 2){
        await db.setServerInfo(interaction.guild.id, serverInfo);
    }

    //辞書ファイルの作成
    if(!selEmb){
        const uuids = Object.keys(serverInfo.dict);
        let csvStr = "言葉,発音,uuid,低語調位置,優先度\n";

        for(let i=0; i<uuids.length; i++){
            csvStr = csvStr + `${serverInfo.dict[uuids[i]].surface},${serverInfo.dict[uuids[i]].pronunciation},${uuids[i]},${serverInfo.dict[uuids[i]].accent_type},${serverInfo.dict[uuids[i]].priority}\n`;
        }

        fs.writeFile(dictCsv, csvStr, (e) => {});
        
    }

    await interaction.editReply(embed.dictDel(dictCsv, surface, selEmb));

    fs.unlink(dictCsv, (e) => {});
}