/*****************
    command.js    
    スニャイヴ
    2024/06/12
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
        .setDescription("チャットの読み上げに関するコマンド")
        .addStringOption(option => option
            .setName("read")
            .setDescription("読み上げを <開始/終了> します")
            .setAutocomplete(true)
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

    return voicevox;
}

//voicevoxコマンド
async function voicevox(interaction, channel_map, subsc_map, speakers){
    //オプションがない場合help
    //if(interaction.options.get())

    if(interaction.options.get("speaker") || interaction.options.get("style")){
        const userInfo = await db.getInfo(interaction.user.id);

        //speakerオプション
        if(interaction.options.get("speaker")){
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
        
        //styleオプション
        if(interaction.options.get("style")){
            for(let i=0; i<speakers.length; i++){
                if(userInfo.speaker_name === speakers[i].name){
                    for(let j=0; j<speakers[i].styles.length; j++){
                        if(speakers[i].styles[j].name === interaction.options.get("style").value){
                            userInfo.style_name = speakers[i].styles[j].name;
                            userInfo.style_id = speakers[i].styles[j].id;
                            break;
                        }
                    }
                    break;
                }
            }
        }

        await db.setInfo(interaction.user.id, userInfo);
        interaction.reply(await embed.speaker(interaction.user.displayName, userInfo.speaker_name, userInfo.speaker_uuid, userInfo.style_name, userInfo.style_id));
    }

    if(interaction.options.get("read")){
        const textCh = interaction.channel;
        const voiceCh = interaction.member.voice.channel;

        //startコマンド
        if(interaction.options.get("read").value === "start"){
            //テキストチャンネルの確認
            if(!(textCh.type == 0 || textCh.type == 2)){
                interaction.reply(embed.read(textCh.name, null, 2));
                return;
            }else if(textCh.type != 2 && !textCh.members.find((member) => member.id === process.env.SNYIVOT_ID)){
                interaction.reply(embed.read(textCh.name, null, 3));
                return;
            }

            //ボイスチャンネルの確認
            if(!voiceCh){
                interaction.reply(embed.read(null, null, 4));
                return;
            }else if(!voiceCh.joinable){
                interaction.reply(embed.read(null, voiceCh.name, 5));
                return;
            }else if(!voiceCh.speakable){
                interaction.reply(embed.read(null, voiceCh.name, 6));
                return;
            }

            //接続済みチャンネルの確認
            if(channel_map.get(textCh.id) == voiceCh.id){
                interaction.reply(embed.read(textCh.name, null, 1));
                return;
            }

            //現在読み上げを行ってるチャンネルを取得
            const connecting = interaction.guild.channels.cache.find((channel) => channel.type == 2 && channel.members.get(process.env.SNYIVOT_ID)); 
            if(connecting){
                //呼ばれたチャンネルで読み上げをしている場合
                if(connecting.id == voiceCh.id){
                    channel_map.set(textCh.id, voiceCh.id);
                    interaction.reply(embed.read(textCh.name, voiceCh.name, 0));
                    return;
                }

                //呼ばれたチャンネル以外で読み上げをしている場合
                else{
                    interaction.guild.channels.cache.forEach((channel) => {
                        if((channel.type == 0 || channel.type == 2) && channel_map.get(channel.id)){
                            try{
                                subsc_map.get(channel_map.get(channel.id)).connection.destroy();
                            }catch(e){
                                console.log("### voicevox startコマンドエラー ###");
                            }
                            subsc_map.delete(channel_map.get(channel.id));
                            channel_map.delete(channel.id);
                            channel.send(embed.read(textCh.name, null, 7));
                        }
                    });
                }
            }

            //botのvc接続処理
            try{
                const connection = joinVoiceChannel({
                    channelId: voiceCh.id,
                    guildId: voiceCh.guild.id,
                    adapterCreator: voiceCh.guild.voiceAdapterCreator,
                    selfMute: false,
                    selfDeaf: true,
                })

                //読み上げるチャンネルの識別Map
                channel_map.set(textCh.id, voiceCh.id);
                subsc_map.set(voiceCh.id, connection.subscribe(createAudioPlayer()));
                interaction.reply(embed.read(textCh.name, voiceCh.name, 0));
            }catch{
                console.log("### voicevox startコマンドエラー ###");
            }

            return;
        }

        //stop, stop*コマンド
        if(interaction.options.get("read").value === "stop" || interaction.options.get("read").value === "stop*"){
            //テキストチャンネルの確認
            if(!channel_map.get(textCh.id)){
                interaction.reply(embed.read(null, null, 8));
                return;
            }

            //ボイスチャンネルの確認
            if(!voiceCh || channel_map.get(textCh.id) != voiceCh.id){
                interaction.reply(embed.read(null, null, 9));
                return;
            }

            //他に読み上げてるチャンネルを取得
            const otherCh = interaction.guild.channels.cache.find((channel) => (channel.type == 0 || channel.type == 2) && channel_map.get(channel.id) && channel.id != textCh.id);
            if(otherCh && interaction.options.get("read").value === "stop"){
                channel_map.delete(textCh.id);
                interaction.reply(embed.read(textCh.name, null, 7));
                return;
            }

            //ボイスチャンネルから切断する
            try{
                subsc_map.get(voiceCh.id).connection.destroy();
            }catch(e){
                console.log("### voicevox stopコマンドエラー ###");
            }
            subsc_map.delete(voiceCh.id);
            interaction.guild.channels.cache.forEach((channel) => {
                if(channel_map.get(channel.id)){
                    channel_map.delete(channel.id);
                }
            });
            interaction.reply(embed.read(null, voiceCh.name, 10));
            return;
        }
    }

}

//voicevoxコマンドの補助
async function voicevox_autocomplete(interaction, channel_map, speakers){
    const focusedOpt = interaction.options.getFocused(true);
    const choices = new Array();

    //readオプションの補助
    if(focusedOpt.name === "read"){
        const textCh = interaction.channel;
        const voiceCh = interaction.member.voice.channel;

        if((textCh.type == 0 || textCh.type == 2) && !(textCh.type != 2 && !textCh.members.find((member) => member.id === process.env.SNYIVOT_ID)) && voiceCh && voiceCh.joinable && voiceCh.speakable && channel_map.get(textCh.id) != voiceCh.id){
            choices.push("start");
        }

        if(channel_map.get(textCh.id) && voiceCh && channel_map.get(textCh.id) == voiceCh.id){
            choices.push("stop");
            if(interaction.guild.channels.cache.find((channel) => (channel.type == 0 || channel.type == 2) && channel_map.get(channel.id) && channel.id != textCh.id)){
                choices.push("stop*");
            }
        }
    }
    
    //speakerオプションの補助
    if(focusedOpt.name === "speaker"){
        if(focusedOpt.value === ""){
            const randlog = new Array();
            while(randlog.length<5){
                const rand = Math.floor(Math.random()*speakers.length);
                if(!randlog.includes(rand)){
                    choices.push(speakers[rand].name);
                    randlog.push(rand);
                }
            }
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
  
        for(let i=0; i<speakers.length; i++){
            if(speaker === speakers[i].name){
                for(let j=0; j<speakers[i].styles.length; j++){
                    choices.push(speakers[i].styles[j].name);
                }
                break;
            }
        }
    }

    await interaction.respond(choices.map(choices => ({name: choices, value: choices})));
    return;
}
