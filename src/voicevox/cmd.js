/*****************
    cmd.js
    スニャイヴ
    2024/06/29    
*****************/

module.exports = {
    getCmd: getCmd,
    voicevox: voicevox,
    voicevox_autocomplete: voicevox_autocomplete
}

require('dotenv').config();
const {SlashCommandBuilder} = require('discord.js');
const {joinVoiceChannel, createAudioPlayer} = require('@discordjs/voice');
const db = require('./db');
const embed = require('./embed');

//コマンドの取得
function getCmd(){
    const voicevox = new SlashCommandBuilder()
        .setName("voicevox")
        .setDescription("チャットの読み上げコマンド")
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

    return voicevox;
}

//voicevoxコマンド
async function voicevox(interaction, channel_map, subsc_map, speakers){

    //voicevoxコマンド
    if(!interaction.options.get("speaker") && !interaction.options.get("style")){
        const textCh = interaction.channel;
        const voiceCh = interaction.member.voice.channel;
        const connectingCh = interaction.guild.channels.cache.find((channel) => channel.type == 2 && channel.members.get(process.env.SNYIVOT_ID)); 
        let sel=0;
        let pass=false;

        if(!channel_map.get(textCh.id)){
            //チャンネルがテキストチャンネルであることを確認
            if(!pass && !(textCh.type == 0 || textCh.type == 2)){sel=1;pass=true;}

            //テキストチャンネルのメンバーにbotがいるか確認
            if(!pass && textCh.type == 0 && !textCh.members.find((member) => member.id === process.env.SNYIVOT_ID)){sel=2;pass=true;}

            //コマンド使用者がボイチャに接続しているか確認
            if(!pass && !voiceCh){sel=3;pass=true;}

            //botがボイスチャンネルに接続できるか確認
            if(!pass && !voiceCh.joinable){sel=4;pass=true;}

            //botがボイスチャンネルで喋れるか確認
            if(!pass && !voiceCh.speakable){sel=5;pass=true;}

            //読み上げるチャンネルを追加
            if(!pass && connectingCh && connectingCh.id == voiceCh.id){
                channel_map.set(textCh.id, voiceCh.id);
                pass=true;
            }
            
            //呼ばれたチャンネル以外で読み上げをしている場合
            if(!pass && connectingCh){
                interaction.guild.channels.cache.forEach((channel) => {
                    if((channel.type == 0 || channel.type == 2) && channel_map.get(channel.id)){
                        try{
                            subsc_map.get(channel_map.get(channel.id)).connection.destroy();
                        }catch(e){
                            console.log("### src/voicevox/command.js ボイチャ切断エラー ###");
                        }
                        subsc_map.delete(channel_map.get(channel.id));
                        channel_map.delete(channel.id);
                    }
                });
            }

            //読み上げ開始
            if(!pass){                
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
                    console.log("### src/voicevox/command.js ボイチャ接続エラー ###");
                }
            }
        
        }else{

            //ボイスチャンネルの確認
            if(!pass && (!voiceCh || channel_map.get(textCh.id) != voiceCh.id)){sel=6;pass=true;}

            //読み上げ終了
            if(!pass){
                try{
                    subsc_map.get(voiceCh.id).connection.destroy();
                }catch(e){
                    console.log("### src/voicevox/command.js ボイチャ切断エラー ###");
                }
                subsc_map.delete(voiceCh.id);
                interaction.guild.channels.cache.forEach((channel) => {
                    if(channel_map.get(channel.id)){
                        channel_map.delete(channel.id);
                    }
                });
                sel=7;
            }
        }

        await interaction.reply(embed.read(textCh, voiceCh, sel));
    }

    if(interaction.options.get("speaker") || interaction.options.get("style")){
        const userInfo = await db.getInfo(interaction.user.id);

        //speakerオプション
        if(interaction.options.get("speaker")){
            if(interaction.options.get("speaker").value === "ランダム"){
                const rand = Math.floor(Math.random()*speakers.length);
                userInfo.speaker_name = speakers[rand].name;
                userInfo.speaker_uuid = speakers[rand].speaker_uuid;
                userInfo.style_name = speakers[rand].styles[0].name;
                userInfo.style_id = speakers[rand].styles[0].id; 
            }else{
                for(let i=0; i<speakers.length; i++){
                    if(speakers[i].name === interaction.options.get("speaker").value){
                        userInfo.speaker_name = speakers[i].name;
                        userInfo.speaker_uuid = speakers[i].speaker_uuid;
                        userInfo.style_name = speakers[i].styles[0].name;
                        userInfo.style_id = speakers[i].styles[0].id; 
                        break;
                    }
                }
            }
        }
        
        //styleオプション
        if(interaction.options.get("style")){
            for(let i=0; i<speakers.length; i++){
                if(userInfo.speaker_name === speakers[i].name){
                    if(interaction.options.get("style").value === "ランダム"){
                        const rand = Math.floor(Math.random()*speakers[i].styles.length);
                        userInfo.style_name = speakers[i].styles[rand].name;
                        userInfo.style_id = speakers[i].styles[rand].id;
                    }else{
                        for(let j=0; j<speakers[i].styles.length; j++){
                            if(speakers[i].styles[j].name === interaction.options.get("style").value){
                                userInfo.style_name = speakers[i].styles[j].name;
                                userInfo.style_id = speakers[i].styles[j].id;
                                break;
                            }
                        }
                    }
                    break;
                }
            }
        }

        await db.setInfo(interaction.user.id, userInfo);
        await interaction.reply(await embed.speaker(interaction.user.displayName, userInfo.speaker_name, userInfo.speaker_uuid, userInfo.style_name, userInfo.style_id));
    }

    return;
}

//voicevoxコマンドの補助
async function voicevox_autocomplete(interaction, channel_map, speakers){
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

    await interaction.respond(choices.map(choices => ({name: choices, value: choices})));

    return;
}