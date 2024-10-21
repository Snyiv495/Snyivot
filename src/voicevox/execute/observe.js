/*******************
    observe.js    
    スニャイヴ
    2024/10/21
*******************/

module.exports = {
    autoEnd: autoEnd,
    compulsionEnd: compulsionEnd,
    compulsionMove: compulsionMove,
}

require('dotenv').config();
const {EmbedBuilder, AttachmentBuilder} = require('discord.js');
const {joinVoiceChannel, createAudioPlayer} = require('@discordjs/voice');

//埋め込みの作成
function createEmbed(status, oldVoiceChName, newVoiceChName=null){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    switch(status){
        case "autoEnd" : {
            embed.setTitle("誰もいないしぼくも帰るのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: `🔊${oldVoiceChName}での読み上げを終了します`});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
            attachment.setFile("assets/zundamon/icon/sleep.png");
            break;
        }
        case "compulsionEnd" : {
            embed.setTitle("追い出されたのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: `🔊${oldVoiceChName}での読み上げを終了します`});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
            attachment.setFile("assets/zundamon/icon/cry.png");
            break;
        }
        case "compulsionMove" : {
            embed.setTitle("ボイスチャンネルを移動させられたのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: `🔊${oldVoiceChName}から🔊${newVoiceChName}に移動しました`});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
            attachment.setFile("assets/zundamon/icon/guide.png");
            break;
        }
        default : embed.setTitle("undefined").setColor(0x000000);
    }

    return {content: "", files: [attachment], embeds: [embed]};
}

//自動終了
function autoEnd(oldState, channel_map, subsc_map){
    let textCh = null;

    oldState.guild.channels.cache.forEach((channel) => {
        if((channel.type == 0 || channel.type == 2) && channel_map.get(channel.id)){
            channel_map.delete(channel.id);
            textCh = channel;
        }
    });

    try{
        subsc_map.get(oldState.channelId).connection.destroy();
    }catch(e){}

    subsc_map.delete(oldState.channelId);

    textCh.send(createEmbed("autoEnd", oldState.channel.name));

    return 0;
}

//強制終了
function compulsionEnd(oldState, channel_map, subsc_map){
    let textCh = null;

    oldState.guild.channels.cache.forEach((channel) => {
        if((channel.type == 0 || channel.type == 2) && channel_map.get(channel.id)){
            channel_map.delete(channel.id);
            textCh = channel;
        }
    });

    subsc_map.delete(oldState.channelId);

    textCh.send(createEmbed("compulsionEnd", oldState.channel.name));

    return 0;
}

//強制移動
function compulsionMove(oldState, newState, channel_map, subsc_map){
    let textCh = null;

    oldState.guild.channels.cache.forEach((channel) => {
        if((channel.type == 0 || channel.type == 2) && channel_map.get(channel.id)){
            channel_map.set(channel.id, newState.channelId);
            textCh = channel;
        }
    });

    try{
        const connection = joinVoiceChannel({
            channelId: newState.channelId,
            guildId: newState.channel.guild.id,
            adapterCreator: newState.channel.guild.voiceAdapterCreator,
            selfMute: false,
            selfDeaf: true,
        })

        subsc_map.set(newState.channelId, connection.subscribe(createAudioPlayer()));
        subsc_map.delete(oldState.channelId);

        textCh.send(createEmbed("compulsionMove", oldState.channel.name, newState.channel.name));
    }catch(e){}

    return 0;
}