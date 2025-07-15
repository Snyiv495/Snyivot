/*****************
    setUser.js
    スニャイヴ
    2024/12/23
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

    info.speaker = undefined;
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

    info.style = undefined;
    return info;
}

//埋め込みの作成
async function createEmbed(user_info, display_name){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    if(user_info.speaker===undefined){
        embed.setTitle("そんなスピーカー知らないのだ");
        embed.setThumbnail("attachment://icon.png");
        embed.setFooter({text: "存在しないスピーカーが入力されたのだ"});
        embed.setColor(0xFF0000);
        attachment.setName("icon.png");
        attachment.setFile("assets/zundamon/icon/anger.png");
        return {content: "", files: [attachment], embeds: [embed],  ephemeral: true};
    }

    if(user_info.style===undefined){
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
    
    await axios.get(`speaker_info?speaker_uuid=${user_info.uuid}`).then(
        function(res){
            policy = res.data.policy;
            style_infos = res.data.style_infos;
        }
    ).catch(function(e){});

    for(let i=0; i<style_infos.length; i++){
        if(style_infos[i].id === user_info.id){
            icon = style_infos[i].icon;
            break;
        }
    }

    embed.setTitle("利用規約");
    embed.setURL(policy.match(/(https?:\/\/[\w\-\.\/\?\,\#\:\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+)/)[0]);
    embed.setDescription(`${display_name}さんの読み上げ音声を\n${user_info.speaker}(${user_info.style})に設定したのだ`)
    embed.addFields([
        {name : 'speed', value : `${user_info.speed}`, inline : true},
        {name : 'pitch', value : `${user_info.pitch}`, inline : true},
        {name : 'intonation', value : `${user_info.intonation}`, inline : true},
        {name : 'volume', value : `${user_info.volume}`, inline : true},
        {name : 'username', value : `${user_info.username}`, inline : true}
    ])
    embed.setImage("attachment://icon.jpg");
    embed.setFooter({text: `VOICEVOX:${user_info.speaker}`});
    embed.setColor(0x00FF00);        
    attachment.setName("icon.jpg");
    attachment.setFile(Buffer.from(icon, 'base64'));

    return {content: "", files: [attachment], embeds: [embed],  ephemeral: true};
}

//ユーザー情報の設定
async function execute(interaction, speakers, options){
    let user_info = null;
    let server_info = null;
    let progress = null;

    //進捗の表示
    progress = await cui.createProgressbar(interaction, 10);

    //ユーザー情報の取得
    user_info = await db.getUserInfo(interaction.user.id);
    progress = await cui.stepProgressbar(progress);

    //サーバー情報の取得
    server_info = await db.getServerInfo(interaction.guild.id);
    progress = await cui.stepProgressbar(progress);

    //speakerオプション
    user_info = (options.speaker != null) ? getSpeaker(options.speaker, speakers, user_info) : user_info;
    progress = await cui.stepProgressbar(progress);

    //styleオプション
    user_info = (options.style != null) ? getStyle(options.style, speakers, user_info) : user_info;
    progress = await cui.stepProgressbar(progress);

    //speedオプション
    user_info.speed = (options.speed != null) ? options.speed : user_info.speed;
    progress = await cui.stepProgressbar(progress);

    //pitchオプション
    user_info.pitch = (options.pitch != null) ? options.pitch : user_info.pitch;
    progress = await cui.stepProgressbar(progress);

    //intonationオプション
    user_info.intonation = (options.intonation != null) ? options.intonation : user_info.intonation;
    progress = await cui.stepProgressbar(progress);

    //volumeオプション
    user_info.volume = (options.volume != null) ? options.volume : user_info.volume;
    progress = await cui.stepProgressbar(progress);

    //usernameオプション
    user_info.username = (options.username != null) ? (options.username === "null") ? null : options.username.substr(0, 10) : user_info.username;
    progress = await cui.stepProgressbar(progress);

    //未定義キャラクターの検出
    if(user_info.speaker === undefined || user_info.style === undefined){
        await interaction.editReply(await createEmbed(user_info, interaction.user.displayName));
        return -1;
    }

    //ユーザー情報の保存
    user_info.speaker = (user_info.speaker===null) ? server_info.speaker : user_info.speaker;
    user_info.style = (user_info.style===null) ? server_info.style : user_info.style;
    user_info.uuid = (user_info.uuid===null) ? server_info.uuid : user_info.uuid;
    user_info.id = (user_info.id===null) ? server_info.id : user_info.id;
    user_info.speed = (user_info.speed===null) ? server_info.speed : user_info.speed;
    user_info.pitch = (user_info.pitch===null) ? server_info.pitch : user_info.pitch;
    user_info.intonation = (user_info.intonation===null) ? server_info.intonation : user_info.intonation;
    user_info.volume = (user_info.volume===null) ? server_info.volume : user_info.volume;
    user_info.username = (user_info.username===null) ? interaction.user.displayName : user_info.username;

    await db.setUserInfo(interaction.user.id, user_info);
    progress = await cui.stepProgressbar(progress);

    //成功送信
    await interaction.editReply(await createEmbed(user_info, interaction.user.displayName));

    return 0;
}