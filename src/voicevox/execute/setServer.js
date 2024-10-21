/*****************
    setting.js
    スニャイヴ
    2024/10/17
*****************/

module.exports = {
    setServer: setServer,
    setServer_autocomplete: setServer_autocomplete,
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
async function createEmbed(info, name, need_sudo=false){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    if(need_sudo){
        embed.setTitle(`${name}さんに管理者権限がないのだ`);
        embed.setThumbnail("attachment://icon.png");
        embed.setFooter({text: "このコマンドの利用には管理者権限が必要です"});
        embed.setColor(0xFF0000);
        attachment.setName("icon.png");
        attachment.setFile("assets/zundamon/icon/agitate.png");
        return {content: "", files: [attachment], embeds: [embed],  ephemeral: true};
    }

    if(!info.speaker){
        embed.setTitle("そんなスピーカー知らないのだ");
        embed.setThumbnail("attachment://icon.png");
        embed.setFooter({text: "存在しないスピーカーが入力されました"});
        embed.setColor(0xFF0000);
        attachment.setName("icon.png");
        attachment.setFile("assets/zundamon/icon/anger.png");
        return {content: "", files: [attachment], embeds: [embed],  ephemeral: true};
    }

    if(!info.style){
        embed.setTitle("そんなスタイル知らないのだ");
        embed.setThumbnail("attachment://icon.png");
        embed.setFooter({text: "存在しないスタイルが入力されました"});
        embed.setColor(0xFF0000);
        attachment.setName("icon.png");
        attachment.setFile("assets/zundamon/icon/anger.png");
        return {content: "", files: [attachment], embeds: [embed],  ephemeral: false};
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
    embed.setDescription(`${name}読み上げ音声を\n${info.speaker}(${info.style})に設定したのだ`)
    embed.addFields([
        {name : 'need_sudo', value : `${info.need_sudo}`, inline : true},
        {name : 'read_name', value : `${info.read_name}`, inline : true},
        {name : 'read_sameuser', value : `${info.read_sameuser}`, inline : true},
        {name : 'read_multiline', value : `${info.read_multiline}`, inline : true},
        {name : 'maxwords', value : `${info.maxwords}`, inline : true},
        {name : 'unif', value : `${info.unif}`, inline : true},
        {name : 'speed', value : `${info.speed}`, inline : true},
        {name : 'pitch', value : `${info.pitch}`, inline : true},
        {name : 'intonation', value : `${info.intonation}`, inline : true},
        {name : 'volume', value : `${info.volume}`, inline : true}
    ])
    embed.setImage("attachment://icon.jpg");
    embed.setFooter({text: `VOICEVOX:${info.speaker}`});
    embed.setColor(0x00FF00);        
    attachment.setName("icon.jpg");
    attachment.setFile(Buffer.from(icon, 'base64'));

    return {content: "", files: [attachment], embeds: [embed],  ephemeral: true};
}

//サーバー情報の設定
async function setServer(interaction, speakers){
    const speaker = interaction.options.get("speaker") ? interaction.options.get("speaker").value : null;
    const style = interaction.options.get("style") ? interaction.options.get("style").value : null;
    let serverInfo = null;
    let progress = null;
    
    serverInfo = await db.getServerInfo(interaction.guild.id);
    progress = await cui.createProgressbar(interaction, 13);

    if(!interaction.memberPermissions.has("Administrator") && (serverInfo.need_sudo || interaction.options.get("need_sudo"))){
        await interaction.editReply(await createEmbed(serverInfo, interaction.user.displayName, true));
        return;
    }

    //need_sudoオプション
    serverInfo.need_sudo = interaction.options.get("need_sudo") ? interaction.options.get("need_sudo").value : serverInfo.need_sudo;
    progress = await cui.stepProgressbar(progress);

    //read_nameオプション
    serverInfo.read_name = interaction.options.get("read_name") ? interaction.options.get("read_name").value : serverInfo.read_name;
    progress = await cui.stepProgressbar(progress);

    //read_sameuserオプション
    serverInfo.read_sameuser = interaction.options.get("read_sameuser") ? interaction.options.get("read_sameuser").value : serverInfo.read_sameuser;
    progress = await cui.stepProgressbar(progress);

    //read_multilineオプション
    serverInfo.read_multiline = interaction.options.get("read_multiline") ? interaction.options.get("read_multiline").value : serverInfo.read_multiline;
    progress = await cui.stepProgressbar(progress);

    //maxwordsオプション
    serverInfo.maxwords = interaction.options.get("maxwords") ? interaction.options.get("maxwords").value : serverInfo.maxwords;
    progress = await cui.stepProgressbar(progress);

    //unifオプション
    serverInfo.unif = interaction.options.get("unif") ? interaction.options.get("unif").value : serverInfo.unif;
    progress = await cui.stepProgressbar(progress);

    //speakerオプション
    serverInfo = speaker ? getSpeaker(speaker, speakers, serverInfo) : serverInfo;
    progress = await cui.stepProgressbar(progress);

    //styleオプション
    serverInfo = style ? getStyle(style, speakers, serverInfo) : serverInfo;
    progress = await cui.stepProgressbar(progress);

    //speedオプション
    serverInfo.speed = interaction.options.get("speed") ? interaction.options.get("speed").value : serverInfo.speed;
    progress = await cui.stepProgressbar(progress);

    //pitchオプション
    serverInfo.pitch = interaction.options.get("pitch") ? interaction.options.get("pitch").value : serverInfo.pitch;
    progress = await cui.stepProgressbar(progress);

    //intonationオプション
    serverInfo.intonation = interaction.options.get("intonation") ? interaction.options.get("intonation").value : serverInfo.intonation;
    progress = await cui.stepProgressbar(progress);

    //volumeオプション
    serverInfo.volume = interaction.options.get("volume") ? interaction.options.get("volume").value : serverInfo.volume;
    progress = await cui.stepProgressbar(progress);

    if(!(serverInfo.speaker && serverInfo.style)){
        //失敗送信
        await interaction.editReply(await createEmbed(serverInfo, interaction.guild.name));
        return -1;
    }

    //サーバー情報の保存
    await db.setServerInfo(interaction.guild.id, serverInfo);
    progress = await cui.stepProgressbar(progress);

    //成功送信
    interaction.channel.send(await createEmbed(serverInfo, interaction.guild.name));

    return 0;
}

//voicevox_setting_serverコマンドの補助
async function setServer_autocomplete(interaction, speakers){
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
        const speaker = interaction.options.getString("speaker") ? interaction.options.getString("speaker") : (await db.getServerInfo(interaction.guild.id)).speaker;

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

    return 0;
}
