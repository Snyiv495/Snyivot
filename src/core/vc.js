/*****************
    vc.js
    スニャイヴ
    2025/11/12
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
            throw new Error(e);
        });

        return connect_voice_channel;
    }catch(e){
        throw new Error(`vc.js => connect() \n ${e}`);
    }
}

async function voiceStateCmd(old_state, new_state, map){
    try{
        const system_id = helper.getSystemId(old_state);
        const feature_modules = helper.getFeatureModules();

        for(const prefix in feature_modules){
            if(system_id.startsWith(prefix)){
                await feature_modules[prefix].voiceState(old_state, new_state, map);
                return;
            }
        }
    }catch(e){
        throw new Error(`vc.js => stateCmd() \n ${e}`);
    }

    throw new Error("vc.js => stateCmd() \n not define system id");
}