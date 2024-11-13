/*****************
    setting.js
    スニャイヴ
    2024/10/29
*****************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, AttachmentBuilder} = require('discord.js');
const axios = require('axios').create({baseURL: process.env.VOICEVOX_SERVER, proxy: false});
const db = require('../db');
const cui = require('../cui');

//スピーカーの取得
function getSpeaker(speaker, speakers, info){
    if(speaker === "ランダム"){
        const rand = Math.floor(Math.random()*speakers.length);
        info.speaker = speakers[rand].name;
        info.uuid = speakers[rand].speaker_uuid;
        info.style = speakers[rand].styles[0].name;
        info.id = speakers[rand].styles[0].id;
        return info; 
    }

    for(let i=0; i<speakers.length; i++){
        if(speaker === speakers[i].name){
            info.speaker = speakers[i].name;
            info.uuid = speakers[i].speaker_uuid;
            info.style = speakers[i].styles[0].name;
            info.id = speakers[i].styles[0].id; 
            return info;
        }
    }

    info.speaker = null;
    return info;
}

//スタイルの取得
function getStyle(style, speakers, info){
    for(let i=0; i<speakers.length; i++){
        if(info.speaker === speakers[i].name){
            
            if(style === "ランダム"){
                const rand = Math.floor(Math.random()*speakers[i].styles.length);
                info.style = speakers[i].styles[rand].name;
                info.id = speakers[i].styles[rand].id;
                return info;
            }

            for(let j=0; j<speakers[i].styles.length; j++){
                if(style === speakers[i].styles[j].name){
                    info.style = speakers[i].styles[j].name;
                    info.id = speakers[i].styles[j].id;
                    return info;
                }
            }
        }
    }

    info.style = null;
    return info;
}

//埋め込みの作成
async function createEmbed(info, displayName){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    if(!info.speaker){
        embed.setTitle("そんなスピーカー知らないのだ");
        embed.setThumbnail("attachment://icon.png");
        embed.setFooter({text: "存在しないスピーカーが入力されたのだ"});
        embed.setColor(0xFF0000);
        attachment.setName("icon.png");
        attachment.setFile("assets/zundamon/icon/anger.png");
        return {content: "", files: [attachment], embeds: [embed],  ephemeral: true};
    }

    if(!info.style){
        embed.setTitle("そんなスタイル知らないのだ");
        embed.setThumbnail("attachment://icon.png");
        embed.setFooter({text: "存在しないスタイルが入力されたのだ"});
        embed.setColor(0xFF0000);
        attachment.setName("icon.png");
        attachment.setFile("assets/zundamon/icon/anger.png");
        return {content: "", files: [attachment], embeds: [embed],  ephemeral: true};
    }

    let policy;
    let style_infos;
    let icon;

    await axios.get(`speaker_info?speaker_uuid=${info.uuid}`).then(
        function(res){
            policy = res.data.policy;
            style_infos = res.data.style_infos;
        }
    ).catch(function(e){});
    
    for(let i=0; i<style_infos.length; i++){
        if(style_infos[i].id === info.id){
            icon = style_infos[i].icon;
            break;
        }
    }

    embed.setTitle("利用規約");
    embed.setURL(policy.match(/(https?:\/\/[\w\-\.\/\?\,\#\:\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+)/)[0]);
    embed.setDescription(`${displayName}さんの読み上げ音声を\n${info.speaker}(${info.style})に設定したのだ`)
    embed.addFields([
        {name : 'speed', value : `${info.speed}`, inline : true},
        {name : 'pitch', value : `${info.pitch}`, inline : true},
        {name : 'intonation', value : `${info.intonation}`, inline : true},
        {name : 'volume', value : `${info.volume}`, inline : true},
        {name : 'username', value : `${info.username}`, inline : true}
    ])
    embed.setImage("attachment://icon.jpg");
    embed.setFooter({text: `VOICEVOX:${info.speaker}`});
    embed.setColor(0x00FF00);        
    attachment.setName("icon.jpg");
    attachment.setFile(Buffer.from(icon, 'base64'));

    return {content: "", files: [attachment], embeds: [embed],  ephemeral: true};
}

//ユーザー情報の設定
async function execute(interaction, speakers, options){
    let userInfo = null;
    let progress = null;

    //進捗の表示
    progress = await cui.createProgressbar(interaction, 9);

    //ユーザー情報の取得
    userInfo = await db.getUserInfo(interaction.user.id);
    progress = await cui.stepProgressbar(progress);

    //speakerオプション
    userInfo = (options.speaker != null) ? getSpeaker(options.speaker, speakers, userInfo) : userInfo;
    progress = await cui.stepProgressbar(progress);

    //styleオプション
    userInfo = (options.style != null) ? getStyle(options.style, speakers, userInfo) : userInfo;
    progress = await cui.stepProgressbar(progress);

    //speedオプション
    userInfo.speed = (options.speed != null) ? options.speed : userInfo.speed;
    progress = await cui.stepProgressbar(progress);

    //pitchオプション
    userInfo.pitch = (options.pitch != null) ? options.pitch : userInfo.pitch;
    progress = await cui.stepProgressbar(progress);

    //intonationオプション
    userInfo.intonation = (options.intonation != null) ? options.intonation : userInfo.intonation;
    progress = await cui.stepProgressbar(progress);

    //volumeオプション
    userInfo.volume = (options.volume != null) ? options.volume : userInfo.volume;
    progress = await cui.stepProgressbar(progress);

    //usernameオプション
    userInfo.username = (options.username != null) ? (options.username === "null") ? null : options.username.substr(0, 10) : userInfo.username;
    progress = await cui.stepProgressbar(progress);

    //問題がなければ保存
    if(!(userInfo.speaker && userInfo.style)){
        //失敗送信
        await interaction.editReply(await createEmbed(userInfo, interaction.user.displayName));
        return -1;
    }

    //ユーザー情報の保存
    await db.setUserInfo(interaction.user.id, userInfo);
    progress = await cui.stepProgressbar(progress);

    //成功送信
    await interaction.editReply(await createEmbed(userInfo, interaction.user.displayName));

    return 0;
}