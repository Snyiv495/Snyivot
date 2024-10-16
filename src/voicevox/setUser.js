/*****************
    setting.js
    スニャイヴ
    2024/10/16
*****************/

module.exports = {
    getCmd: getCmd,
    setUser: setUser,
    autocomplete: autocomplete,
}

require('dotenv').config();
const {SlashCommandBuilder, EmbedBuilder, AttachmentBuilder} = require('discord.js');
const axios = require('axios').create({baseURL: process.env.VOICEVOX_SERVER, proxy: false});
const db = require('./db');

//コマンドの取得
function getCmd(){
    const voicevox_setting_user = new SlashCommandBuilder();

    voicevox_setting_user.setName("voicevox_setting_user");
    voicevox_setting_user.setDescription("voicevoxのユーザー用設定コマンド");
    voicevox_setting_user.addStringOption(option => {
        option.setName("speaker");
        option.setDescription("キャラ名を入力してください");
        option.setAutocomplete(true);
        return option;
    });
    voicevox_setting_user.addStringOption(option => {
        option.setName("style");
        option.setDescription("キャラのスタイルを入力してください");
        option.setAutocomplete(true);
        return option;
    });
    voicevox_setting_user.addNumberOption(option => {
        option.setName("speed");
        option.setDescription("読み上げの速度を入力してください[0.5~2.0]");
        option.setMaxValue(2.0);
        option.setMinValue(0.5);
        return option;
    });
    voicevox_setting_user.addNumberOption(option => {
        option.setName("pitch");
        option.setDescription("読み上げの高さを入力してください[-0.15~0.15]");
        option.setMaxValue(0.15);
        option.setMinValue(-0.15);
        return option;
    });
    voicevox_setting_user.addNumberOption(option => {
        option.setName("intonation");
        option.setDescription("読み上げの抑揚を入力してください[0.0~2.0]");
        option.setMaxValue(2.0);
        option.setMinValue(0.0);
        return option;
    });
    voicevox_setting_user.addNumberOption(option => {
        option.setName("volume");
        option.setDescription("読み上げの音量を入力してください[0.0~2.0]");
        option.setMaxValue(2.0);
        option.setMinValue(0.0);
        return option;
    });
    voicevox_setting_user.addStringOption(option => {
        option.setName("username");
        option.setDescription("読み上げに使うあなたの名前を入力してください");
        return option;
    });
    
    return voicevox_setting_user;
}

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
        embed.setFooter({text: "存在しないスピーカーが入力されました"});
        embed.setColor(0xFF0000);
        attachment.setName("icon.png");
        attachment.setFile("assets/zundamon/icon/delight.png");
        return {files: [attachment], embeds: [embed],  ephemeral: true};
    }

    if(!info.style){
        embed.setTitle("そんなスタイル知らないのだ");
        embed.setThumbnail("attachment://icon.png");
        embed.setFooter({text: "存在しないスタイルが入力されました"});
        embed.setColor(0xFF0000);
        attachment.setName("icon.png");
        attachment.setFile("assets/zundamon/icon/delight.png");
        return {files: [attachment], embeds: [embed],  ephemeral: true};
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

    return {files: [attachment], embeds: [embed],  ephemeral: true};
}

//ユーザー情報の設定
async function setUser(interaction, speakers){
    let userInfo = await db.getUserInfo(interaction.user.id);
    const speaker = interaction.options.get("speaker") ? interaction.options.get("speaker").value : null;
    const style = interaction.option.get("style") ? interaction.options.get("style").vallue : null;

    //speakerオプション
    userInfo = speaker ? getSpeaker(speaker, speakers, userInfo) : userInfo;

    //styleオプション
    userInfo = style ? getStyle(style, speakers, userInfo) : userInfo;

    //speedオプション
    userInfo.speed = interaction.options.get("speed") ? interaction.options.get("speed").value : userInfo.speed;

    //pitchオプション
    userInfo.pitch = interaction.options.get("pitch") ? interaction.options.get("pitch").value : userInfo.pitch;

    //intonationオプション
    userInfo.intonation = interaction.options.get("intonation") ? interaction.options.get("intonation").value : userInfo.intonation;

    //volumeオプション
    userInfo.volume = interaction.options.get("volume") ? interaction.options.get("volume").value : userInfo.volume;
    
    //usernameオプション
    userInfo.username = interaction.options.get("username") ? (interaction.options.get("username").value === "null") ? null : (interaction.options.get("username").value).substr(0, 10) : userInfo.username;

    //問題がなければ保存
    if(userInfo.speaker && userInfo.style){
        await db.setUserInfo(interaction.user.id, userInfo);
    }

    await interaction.reply(await createEmbed(userInfo, interaction.user.displayName));

    return;
}

//voicevox_setting_*コマンドの補助
async function autocomplete(interaction, speakers){
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
