/*****************
    embed.js
    スニャイヴ
    2024/06/12
*****************/

module.exports = {
    read: read,
    speaker: speaker,
    observeVC: observeVC
}

const {EmbedBuilder, AttachmentBuilder} = require('discord.js');
const axios = require('axios').create({baseURL: process.env.VOICEVOX_SERVER, proxy: false});

function read(textChName, voiceChName, opt){
    const embed = new EmbedBuilder();
    
    switch(opt){
        case 0:{
            embed.setTitle(`#${textChName}の文章を\n🔊${voiceChName}で読み上げるよ～😎`);
            embed.setFooter({text: "VOICEVOX:ずんだもん"});
            embed.setColor(0x00FF00);
            break;
        }
        case 1:{
            embed.setTitle("これ以上私に何を求めるんや...🥵");
            embed.setFooter({text: `すでに#${textChName}の読み上げを行っています`});
            embed.setColor(0x00FFFF);
            break;
        }
        case 2:{
            embed.setTitle(`#${textChName}で読み上げすることはできないんや😣`);
            embed.setFooter({text: "テキストチャンネルにのみ対応してます"});
            embed.setColor(0xFF0000);
            break;
        }
        case 3:{
            embed.setTitle(`#${textChName}のメンバーに私おらんやん🫥`);
            embed.setFooter({text: "Snyivotをメンバーに加えてください"});
            embed.setColor(0xFF0000);
            break;
        }
        case 4:{
            embed.setTitle("......私はどこで読み上げをすればええんや？🤔");
            embed.setFooter({text: "ボイスチャンネルに入ってから召喚してください"});
            embed.setColor(0xFF0000);
            break;
        }
        case 5:{
            embed.setTitle(`🔊${voiceChName}に参加できへんやん😬`);
            embed.setFooter({text: "ボイスチャンネルのメンバーや許容人数を確認してください"});
            embed.setColor(0xFF0000);
            break;
        }
        case 6:{
            embed.setTitle(`私🔊${voiceChName}で喋れへんやん🤐`);
            embed.setFooter({text: "Snyivotに喋る権限を与えてください"});
            embed.setColor(0xFF0000);
            break;
        }
        case 7:{
            embed.setTitle("このチャンネルの読み上げを辞めるで～🤫");
            embed.setFooter({text: `#${textChName}の読み上げを終了します`});
            embed.setColor(0x00FF00);
            break;
        }
        case 8:{
            embed.setTitle("......勝手に私をここで働いてることにせんといて😫");
            embed.setFooter({text: "読み上げを行ってるテキストチャンネルで使用してください"});
            embed.setColor(0xFF0000);
            break;
        }
        case 9:{
            embed.setTitle("......部外者は黙っとれ😑");
            embed.setFooter({text: "同じボイスチャンネルに入ってから使用してください"});
            embed.setColor(0xFF0000);
            break;
        }
        case 10:{
            embed.setTitle("ほなまた～👋");
            embed.setFooter({text: `🔊${voiceChName}での読み上げを終了します`});
            embed.setColor(0x00FF00);
            break;
        }
        default: embed.setTitle("undefined").setColor(0x000000);
    }

    return {embeds: [embed]};
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
    embed.setDescription(`${display_name}さんの読み上げ音声を\n${speaker_name}(${style_name})に設定したよ～🤩`)
    embed.setImage("attachment://icon.jpg");
    embed.setFooter({text: `VOICEVOX:${speaker_name}`});
    embed.setColor(0x00FF00);        
 	attachment.setName("icon.jpg");
 	attachment.setFile(Buffer.from(icon, 'base64'));

    return {files: [attachment], embeds: [embed],  ephemeral: true};
}

function observeVC(oldVoiceChName, newVoiceChName, opt){
    const embed = new EmbedBuilder();
    
    switch(opt){
        case 0:{
            embed.setTitle("誰も居なくなったっぽいし私も帰るで～😁");
            embed.setFooter({text: `🔊${oldVoiceChName}での読み上げを終了します`});
            embed.setColor(0x00FF00);
            break;
        }
        case 1:{
            embed.setTitle("強制停止を食らったで😞");
            embed.setFooter({text: `🔊${oldVoiceChName}での読み上げを終了します`});
            embed.setColor(0x00FF00);
            break;
        }
        case 2:{
            embed.setTitle("ボイスチャンネルを移動させられたで🫨");
            embed.setFooter({text: `🔊${oldVoiceChName}から🔊${newVoiceChName}に移動しました`});
            embed.setColor(0x00FF00);
            break;
        }
        default: embed.setTitle("undefined").setColor(0x000000);
    }

    return {embeds: [embed]};
}