/*****************
    start.js
    スニャイヴ
    2024/10/17
*****************/

module.exports = {
    getCmd: getCmd,
    start: start,
}

require('dotenv').config();
const {SlashCommandBuilder, EmbedBuilder, AttachmentBuilder} = require('discord.js');
const {joinVoiceChannel, createAudioPlayer} = require('@discordjs/voice');
const cui = require('../cui/cui');

//コマンドの取得
function getCmd(){
    const voicevox_start = new SlashCommandBuilder();

    voicevox_start.setName("voicevox_start");
    voicevox_start.setDescription("voicevoxの読み上げ開始コマンド");

    return voicevox_start;
}

//状況の取得
function getStatus(textCh, voiceCh, channel_map){

    //テキストチャンネルか確認
    if(!(textCh.type == 0 || textCh.type == 2)){
        return "notTextch";
    }

    //コマンド使用者がボイチャに接続しているか確認
    if(!voiceCh){
        return "notVoicech";
    }
    
    //botがボイスチャンネルに接続できるか確認
    if(!voiceCh.joinable){
        return "cantJoin";
    }

    //botがボイスチャンネルで喋れるか確認
    if(!voiceCh.speakable){
        return "cantSpeak";
    }

    //既に読み上げを行っていないか確認
    if(voiceCh == channel_map.get(textCh.id)){
        return "isReading";
    }

    //テキストチャンネルのメンバーにbotがいるか確認
    if(textCh.type == 0 && !textCh.members.find((member) => member.id === process.env.BOT_ID)){
        return "notMember";
    }

    //読み上げるボイスチャンネルがプライベートか確認
    if(textCh.type == 2 && !textCh.joinable){
        return "notMember";
    }

    return 0;
}

//埋め込みの作成
function createEmbed(textCh, voiceCh, status){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    
    if(!status){
        embed.setTitle(`# ${textCh.name}の文章を\n🔊${voiceCh.name}で読み上げるのだ`);
        embed.setThumbnail("attachment://icon.png");
        embed.setFooter({text: "VOICEVOX:ずんだもん"});
        embed.setColor(0x00FF00);
        attachment.setName("icon.png");
        attachment.setFile("assets/zundamon/icon/delight.png");

        return {content: "", files: [attachment], embeds: [embed], ephemeral: false};
    }

    switch(status){
         case ("notTextch") : {
            embed.setTitle(`#${textCh.name}での読み上げは専門外なのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "テキストチャンネルにのみ対応してます"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/normal.png");
            break;
        }
        case "notVoicech" : {
            embed.setTitle("ぼくはどこで読み上げをすればいいのだ？");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "ボイスチャンネルに入ってから呼んでください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/think.png");
            break;
        }
        case "cantJoin" : {
            embed.setTitle(`🔊${voiceCh.name}に参加できないのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "ボイスチャンネルのメンバーや許容人数を確認してください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/cry.png");
            break;
        }
        case "cantSpeak" : {
            embed.setTitle(`ぼくは🔊${voiceCh.name}で喋れないのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "Snyivotに喋る権限を与えてください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/cry.png");
            break;
        }
        case "isReading" : {
            embed.setTitle("これ以上ぼくに何を要求するのだ...");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "既に読み上げを行っています"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/anger.png");
            break;
        }
        case "notMember" : {
            embed.setTitle(`ぼくは#${textCh.name}に入れてもらってないのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "Snyivotをメンバーに加えてください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/cry.png");
            break;
        }
        default: embed.setTitle("undefined").setColor(0x000000);
    }

    return {content: "", files: [attachment], embeds: [embed], ephemeral: true};
}

//VCに参加
function joinVC(interaction, textCh, voiceCh, channel_map, subsc_map){
    const connectingCh = interaction.guild.channels.cache.find((channel) => channel.type == 2 && channel.members.get(process.env.BOT_ID));
    
    //同じボイチャで読み上げをしている場合は追加
    if(connectingCh && connectingCh.id == voiceCh.id){
        channel_map.set(textCh.id, voiceCh.id);
        return;
    }
    
    //他のボイチャで読み上げをしている場合は切断
    if(connectingCh && connectingCh.id != voiceCh.id){
        interaction.guild.channels.cache.forEach((channel) => {
            if((channel.type == 0 || channel.type == 2) && channel_map.get(channel.id)){
                try{
                    subsc_map.get(channel_map.get(channel.id)).connection.destroy();
                }catch(e){}
                subsc_map.delete(channel_map.get(channel.id));
                channel_map.delete(channel.id);
            }
        });
    }
                
    //VC接続
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
    }catch(e){}

    return;
}

//読み上げ開始
async function start(interaction, channel_map, subsc_map){
    const textCh = interaction.channel;
    const voiceCh = interaction.member.voice.channel;
    const status = getStatus(textCh, voiceCh, channel_map);
    let progress = await cui.createProgressbar(interaction, 1);

    if(!status){
        joinVC(interaction, textCh, voiceCh, channel_map, subsc_map);
        progress = await cui.stepProgress(interaction, progress);
        interaction.channel.send(createEmbed(textCh, voiceCh, status));
        return;
    }

    await interaction.editReply(createEmbed(textCh, voiceCh, status));

    return;
}