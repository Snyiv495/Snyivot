/*****************
    embed.js
    スニャイヴ
    2024/06/29
*****************/

module.exports = {
    read: read,
    speaker: speaker,
    observeVC: observeVC
}

const {EmbedBuilder, AttachmentBuilder} = require('discord.js');
const axios = require('axios').create({baseURL: process.env.VOICEVOX_SERVER, proxy: false});

function read(textCh, voiceCh, sel){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    
    switch(sel){
        case 0:{
            embed.setTitle(`# ${textCh.name}の文章を\n🔊${voiceCh.name}で読み上げるのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "VOICEVOX:ずんだもん"});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
 	        attachment.setFile("img/face/zunmon001.png");
            break;
        }
        case 1:{
            embed.setTitle(`#${textCh.name}での読み上げは専門外なのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "テキストチャンネルにのみ対応してます"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("img/face/zunmon_3003.png");
            break;
        }
        case 2:{
            embed.setTitle(`ぼくは#${textCh.name}に入れてもらってないのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "Snyivotをメンバーに加えてください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("img/face/zunmon_3003.png");
            break;
        }
        case 3:{
            embed.setTitle("ぼくはどこで読み上げをすればいいのだ？");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "ボイスチャンネルに入ってから呼んでください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("img/face/zunmon_3004.png");
            break;
        }
        case 4:{
            embed.setTitle(`🔊${voiceCh.name}に参加できないのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "ボイスチャンネルのメンバーや許容人数を確認してください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("img/face/zunmon_3003.png");
            break;
        }
        case 5:{
            embed.setTitle(`ぼくは🔊${voiceCh.name}で喋れないのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "Snyivotに喋る権限を与えてください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("img/face/zunmon_3003.png");
            break;
        }
        case 6:{
            embed.setTitle("君にそんな権限はないのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "読み上げを行っているボイスチャンネルに接続してから使用してください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("img/face/zunmon_3002.png");
            break;
        }
        case 7:{
            embed.setTitle("お疲れ様なのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: `🔊${voiceCh.name}での読み上げを終了します`});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
 	        attachment.setFile("img/face/zunmon_3001.png");
            break;
        }
        default: embed.setTitle("undefined").setColor(0x000000);
    }

    return {files: [attachment], embeds: [embed]};
}

async function speaker(display_name, speaker_name, speaker_uuid, style_name, style_id){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    let policy;
    let style_infos;
    let icon;

    await axios.get(`speaker_info?speaker_uuid=${speaker_uuid}`).then(
        function(res){
            policy = res.data.policy;
            style_infos = res.data.style_infos;
        }
    ).catch(function(){
        console.log("### VOICEVOXサーバとの接続が不安定です ###");}
    );
    
    for(let i=0; i<style_infos.length; i++){
        if(style_infos[i].id === style_id){
            icon = style_infos[i].icon;
            break;
        }
    }

    embed.setTitle("利用規約");
    embed.setURL(policy.match(/https?:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+/)[0]);
    embed.setDescription(`${display_name}さんの読み上げ音声を\n${speaker_name}(${style_name})に設定したのだ`)
    embed.setImage("attachment://icon.jpg");
    embed.setFooter({text: `VOICEVOX:${speaker_name}`});
    embed.setColor(0x00FF00);        
 	attachment.setName("icon.jpg");
 	attachment.setFile(Buffer.from(icon, 'base64'));

    return {files: [attachment], embeds: [embed],  ephemeral: true};
}

function observeVC(oldVoiceChName, newVoiceChName, opt){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    
    switch(opt){
        case 0:{
            embed.setTitle("誰もいないしぼくも帰るのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: `🔊${oldVoiceChName}での読み上げを終了します`});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
 	        attachment.setFile("img/face/zunmon001.png");
            break;
        }
        case 1:{
            embed.setTitle("追い出されたのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: `🔊${oldVoiceChName}での読み上げを終了します`});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
 	        attachment.setFile("img/face/zunmon_3003.png");
            break;
        }
        case 2:{
            embed.setTitle("ボイスチャンネルを移動させられたのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: `🔊${oldVoiceChName}から🔊${newVoiceChName}に移動しました`});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
 	        attachment.setFile("img/face/zunmon_3003.png");
            break;
        }
        default: embed.setTitle("undefined").setColor(0x000000);
    }

    return {files: [attachment], embeds: [embed]};
}