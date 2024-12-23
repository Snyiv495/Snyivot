/*******************
    setServer.js
    スニャイヴ
    2024/12/23
*******************/

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
async function createEmbed(server_info, name, need_sudo=false){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    if(need_sudo){
        embed.setTitle(`${name}さんに管理者権限がないのだ`);
        embed.setThumbnail("attachment://icon.png");
        embed.setFooter({text: "このコマンドの利用には管理者権限が必要なのだ"});
        embed.setColor(0xFF0000);
        attachment.setName("icon.png");
        attachment.setFile("assets/zundamon/icon/agitate.png");
        return {content: "", files: [attachment], embeds: [embed],  ephemeral: true};
    }

    if(server_info.speaker===undefined){
        embed.setTitle("そんなスピーカー知らないのだ");
        embed.setThumbnail("attachment://icon.png");
        embed.setFooter({text: "存在しないスピーカーが入力されたのだ"});
        embed.setColor(0xFF0000);
        attachment.setName("icon.png");
        attachment.setFile("assets/zundamon/icon/anger.png");
        return {content: "", files: [attachment], embeds: [embed],  ephemeral: true};
    }

    if(server_info.style===undefined){
        embed.setTitle("そんなスタイル知らないのだ");
        embed.setThumbnail("attachment://icon.png");
        embed.setFooter({text: "存在しないスタイルが入力されたのだ"});
        embed.setColor(0xFF0000);
        attachment.setName("icon.png");
        attachment.setFile("assets/zundamon/icon/anger.png");
        return {content: "", files: [attachment], embeds: [embed],  ephemeral: false};
    }

    let policy;
    let style_infos;
    let icon;

    await axios.get(`speaker_info?speaker_uuid=${server_info.uuid}`).then(
        function(res){
            policy = res.data.policy;
            style_infos = res.data.style_infos;
        }
    ).catch(function(e){});
    
    for(let i=0; i<style_infos.length; i++){
        if(style_infos[i].id === server_info.id){
            icon = style_infos[i].icon;
            break;
        }
    }

    embed.setTitle("利用規約");
    embed.setURL(policy.match(/(https?:\/\/[\w\-\.\/\?\,\#\:\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+)/)[0]);
    embed.setDescription(`${name}読み上げ音声を\n${server_info.speaker}(${server_info.style})に設定したのだ`)
    embed.addFields([
        {name : 'need_sudo', value : `${server_info.need_sudo}`, inline : true},
        {name : 'read_name', value : `${server_info.read_name}`, inline : true},
        {name : 'read_sameuser', value : `${server_info.read_sameuser}`, inline : true},
        {name : 'read_multiline', value : `${server_info.read_multiline}`, inline : true},
        {name : 'maxwords', value : `${server_info.maxwords}`, inline : true},
        {name : 'unif', value : `${server_info.unif}`, inline : true},
        {name : 'speed', value : `${server_info.speed}`, inline : true},
        {name : 'pitch', value : `${server_info.pitch}`, inline : true},
        {name : 'intonation', value : `${server_info.intonation}`, inline : true},
        {name : 'volume', value : `${server_info.volume}`, inline : true}
    ])
    embed.setImage("attachment://icon.jpg");
    embed.setFooter({text: `VOICEVOX:${server_info.speaker}`});
    embed.setColor(0x00FF00);        
    attachment.setName("icon.jpg");
    attachment.setFile(Buffer.from(icon, 'base64'));

    return {content: "", files: [attachment], embeds: [embed],  ephemeral: true};
}

//サーバー情報の設定
async function execute(interaction, speakers, options){
    let server_info = null;
    let progress = null;
    
    server_info = await db.getServerInfo(interaction.guild.id);
    progress = await cui.createProgressbar(interaction, 13);

    //権限の確認
    if(!interaction.memberPermissions.has("Administrator") && (server_info.need_sudo || options.need_sudo != null)){
        await interaction.editReply(await createEmbed(server_info, interaction.user.displayName, true));
        return -1;
    }

    //need_sudoオプション
    server_info.need_sudo = (options.need_sudo != null) ? options.need_sudo : server_info.need_sudo;
    progress = await cui.stepProgressbar(progress);

    //read_nameオプション
    server_info.read_name = (options.read_name != null) ? options.read_name : server_info.read_name;
    progress = await cui.stepProgressbar(progress);

    //read_sameuserオプション
    server_info.read_sameuser = (options.read_sameuser != null) ? options.read_sameuser : server_info.read_sameuser;
    progress = await cui.stepProgressbar(progress);

    //read_multilineオプション
    server_info.read_multiline = (options.read_multiline != null) ? options.read_multiline : server_info.read_multiline;
    progress = await cui.stepProgressbar(progress);

    //maxwordsオプション
    server_info.maxwords = (options.maxwords != null) ? options.maxwords : server_info.maxwords;
    progress = await cui.stepProgressbar(progress);

    //unifオプション
    server_info.unif = (options.unif != null) ? options.unif : server_info.unif;
    progress = await cui.stepProgressbar(progress);

    //speakerオプション
    server_info = (options.speaker != null) ? getSpeaker(options.speaker, speakers, server_info) : server_info;
    progress = await cui.stepProgressbar(progress);

    //styleオプション
    server_info = (options.style != null) ? getStyle(options.style, speakers, server_info) : server_info;
    progress = await cui.stepProgressbar(progress);

    //speedオプション
    server_info.speed = (options.speed != null) ? options.speed : server_info.speed;
    progress = await cui.stepProgressbar(progress);

    //pitchオプション
    server_info.pitch = (options.pitch != null) ? options.pitch : server_info.pitch;
    progress = await cui.stepProgressbar(progress);

    //intonationオプション
    server_info.intonation = (options.intonation != null) ? options.intonation : server_info.intonation;
    progress = await cui.stepProgressbar(progress);

    //volumeオプション
    server_info.volume = (options.volume != null) ? options.volume : server_info.volume;
    progress = await cui.stepProgressbar(progress);

    //未定義キャラクターの検出
    if(server_info.speaker === undefined || server_info.style === undefined){
        await interaction.editReply(await createEmbed(server_info, interaction.guild.name));
        return -1;
    }

    //サーバー情報の保存
    await db.setServerInfo(interaction.guild.id, server_info);
    progress = await cui.stepProgressbar(progress);

    //成功送信
    interaction.channel.send(await createEmbed(server_info, interaction.guild.name));

    return 0;
}