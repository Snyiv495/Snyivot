/*******************
    observe.js    
    スニャイヴ
    2024/08/19
*******************/

module.exports = {
    autoEnd: autoEnd,
    compulsionEnd: compulsionEnd,
    compulsionMove: compulsionMove,
}

require('dotenv').config();
const {joinVoiceChannel, createAudioPlayer} = require('@discordjs/voice');
const embed = require('./embed');

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
    }catch(e){
        console.log("### 自動停止エラー ###");
    }
    subsc_map.delete(oldState.channelId);

    textCh.send(embed.autoEnd(oldState.channel.name));

    return;
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

    textCh.send(embed.compulsionEnd(oldState.channel.name));

    return;
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

        textCh.send(embed.compulsionMove(oldState.channel.name, newState.channel.name));
    }catch(e){
        console.log("### 強制移動エラー ###");
    }

    return;
}