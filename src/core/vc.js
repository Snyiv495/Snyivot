/*****************
    vc.js
    スニャイヴ
    2025/12/16
*****************/

module.exports = {
    connect : connect,
    voiceStateCmd : voiceStateCmd
}

const {joinVoiceChannel} = require('@discordjs/voice');

const helper = require("./helper");

async function connect(voice_channel){
    try{
        const connect_voice_channel = joinVoiceChannel({
            channelId: voice_channel.id,
            guildId: voice_channel.guild.id,
            adapterCreator: voice_channel.guild.voiceAdapterCreator,
            selfMute: false,
            selfDeaf: true,
        });

        connect_voice_channel.on('error', (e) => {
            //クリーンアップ処理を検討する
            console.error(`vc.js => connect() : 接続オブジェクトエラーが発生しました。\n ${e}`);
            if(connect_voice_channel && connect_voice_channel.state.status !== 'destroyed') connect_voice_channel.destroy();
        });

        return connect_voice_channel;
    }catch(e){
        throw new Error(`vc.js => connect() \n ${e}`);
    }
}

async function voiceStateCmd(old_state, new_state, map){
    try{
        const system_id = helper.getSystemId(old_state);
        const feature_modules = map.get("feature_modules");

        for(const prefix in feature_modules){
            if(system_id.startsWith(prefix)){
                await feature_modules[prefix].voiceState(old_state, new_state, map);
                return;
            }
        }
    }catch(e){
        throw new Error(`vc.js => voiceStateCmd() \n ${e}`);
    }

    throw new Error(`vc.js => voiceStateCmd() \n not define system id : ${system_id}`);
}