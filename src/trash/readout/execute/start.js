/*****************
    start.js
    スニャイヴ
    2024/12/16
*****************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, AttachmentBuilder} = require('discord.js');
const {joinVoiceChannel, createAudioPlayer} = require('@discordjs/voice');
const cui = require('../cui');

//状況の取得
function getStatus(textCh, voiceCh, map){

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
    if(voiceCh == (map.get(`text_${textCh.id}`))){
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

//VCに参加
function joinVC(interaction, textCh, voiceCh, map){
    const connectVC = interaction.guild.channels.cache.find((channel) => channel.type == 2 && channel.members.get(process.env.BOT_ID));
    
    //同じボイチャで読み上げをしている場合は追加
    if(connectVC && connectVC.id == voiceCh.id){
        map.set(`text_${textCh.id}`, voiceCh.id);
        return 0;
    }
    
    //他のボイチャで読み上げをしている場合は切断
    if(connectVC && connectVC.id != voiceCh.id){
        interaction.guild.channels.cache.forEach((channel) => {
            if((channel.type == 0 || channel.type == 2) && map.get(`text_${channel.id}`)){
                try{
                    map.get(`voice_${map.get(`text_${channel.id}`)}`).connection.destroy();
                }catch(e){}
                map.delete(`voice_${map.get(`text_${channel.id}`)}`);
                map.delete(`text_${channel.id}`);
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
        map.set(`text_${textCh.id}`, voiceCh.id);
        map.set(`voice_${voiceCh.id}`, connection.subscribe(createAudioPlayer()));
    }catch(e){}

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
            embed.setFooter({text: "テキストチャンネルにのみ対応してるのだ"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/normal.png");
            break;
        }
        case "notVoicech" : {
            embed.setTitle("ぼくはどこで読み上げをすればいいのだ？");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "ボイスチャンネルに入ってから呼ぶのだ"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/think.png");
            break;
        }
        case "cantJoin" : {
            embed.setTitle(`🔊${voiceCh.name}に参加できないのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "ボイスチャンネルのメンバーや許容人数を確認するのだ"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/cry.png");
            break;
        }
        case "cantSpeak" : {
            embed.setTitle(`ぼくは🔊${voiceCh.name}で喋れないのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "Snyivotに喋る権限を与えるのだ"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/cry.png");
            break;
        }
        case "isReading" : {
            embed.setTitle("これ以上ぼくに何を要求するのだ...");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "既に読み上げを行っているのだ"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/anger.png");
            break;
        }
        case "notMember" : {
            embed.setTitle(`ぼくは#${textCh.name}に入れてもらってないのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "Snyivotをメンバーに加えるのだ"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/cry.png");
            break;
        }
        default: embed.setTitle("undefined").setColor(0x000000);
    }

    return {content: "", files: [attachment], embeds: [embed], ephemeral: true};
}

//読み上げ開始
async function execute(interaction, map){
    const textCh = interaction.channel;
    const voiceCh = interaction.member.voice.channel;
    let progress = null;
    let status = null;

    //進捗の表示
    progress = await cui.createProgressbar(interaction, 2);

    //状況の取得
    status = getStatus(textCh, voiceCh, map);
    progress = await cui.stepProgressbar(progress);

    if(status){
        //失敗送信
        await interaction.editReply(createEmbed(textCh, voiceCh, status));
        return -1;
    }

    //VCに参加
    joinVC(interaction, textCh, voiceCh, map);
    progress = await cui.stepProgressbar(progress);

    //成功送信
    interaction.channel.send(createEmbed(textCh, voiceCh, status));

    return;
}