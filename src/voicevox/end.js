/*****************
    end.js
    スニャイヴ
    2024/10/15
*****************/

module.exports = {
    getCmd: getCmd,
    end: end,
    endAll: endAll,
}

require('dotenv').config();
const {SlashCommandBuilder} = require('discord.js');

//コマンドの取得
function getCmd(){
    const voicevox_end = new SlashCommandBuilder();

    voicevox_end.setName("voicevox_end");
    voicevox_end.setDescription("voicevoxの終了コマンド");
    voicevox_end.addBooleanOption(option => {
        option.setName("all");
        option.setDescription("サーバー全体の読み上げを終了する？");
        return option;
    });
    
    return voicevox_end;
}

//接続状況の確認
function getStatus(interaction, textCh, voiceCh, channel_map){
    
    //ギルドチャンネルか確認
    if(!interaction.guild){
        return "notGuild";
    }

    const connectingCh = interaction.guild.channels.cache.find((channel) => channel.type == 2 && channel.members.get(process.env.BOT_ID)); 
        
    //ボイスチャンネルの確認
    if(!voiceCh || (voiceCh != connectingCh)){
        return "notVoicech";
    }

    //読み上げを行っているか確認
    if(channel_map.get(textCh.id) != voiceCh.id){
        return "notReading";
    }

    return 0;
}

//埋め込みの作成
function createEmbed(textCh, voiceCh, status){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    if(!status){
        embed.setTitle("お疲れ様なのだ");
        embed.setThumbnail("attachment://icon.png");
        embed.setFooter({text: `🔊${voiceCh.name}での読み上げを終了します`});
        embed.setColor(0x00FF00);
        attachment.setName("icon.png");
        attachment.setFile("assets/zundamon/icon/sleep.png");

        return {files: [attachment], embeds: [embed], ephemeral: false};
    }

    switch(status){
        case "notGuild" || "notReaing" : {
            embed.setTitle(`#${textCh.name}で読み上げをしてないのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "読み上げを行ってるチャンネルで使用してください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
            attachment.setFile("assets/zundamon/icon/anger.png");
            break;
        }
        case "notVoicech" : {
            embed.setTitle("君に権限がないのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "読み上げを行っているボイスチャンネルに接続してから使用してください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
            attachment.setFile("assets/zundamon/icon/agitate.png");
            break;
        }
        default : embed.setTitle("undefined").setColor(0x000000);
    }

    return {files: [attachment], embeds: [embed], ephemeral: true};
}

//任意のテキストチャンネルの読み上げを止める
function stopTextch(interaction, channel_map, subsc_map){

    interaction.guild.channels.cache.forEach((channel) => {
        if(channel_map.get(channel.id) && channel.id != textCh){
            channel_map.delete(textCh.id);
            return;
        }
    });

    destroyVC(interaction, channel_map, subsc_map);

    return;
}

//VCから切断
function destroyVC(interaction, channel_map, subsc_map){
    try{
        subsc_map.get(voiceCh.id).connection.destroy();
    }catch(e){}

    subsc_map.delete(voiceCh.id);

    interaction.guild.channels.cache.forEach((channel) => {
        if(channel_map.get(channel.id)){
            channel_map.delete(channel.id);
        }
    });

    return;
}

//読み上げ終了
async function end(interaction, channel_map, subsc_map){
    const textCh = interaction.guild ? interaction.channel : null;
    const voiceCh = interaction.guild ? interaction.member.voice.channel : null;
    const status = getStatus(interaction, textCh, voiceCh, channel_map);
    
    if(!status){
        stopTextch(interaction, channel_map, subsc_map);
    }

    await interaction.reply(createEmbed(textCh, voiceCh, status));

    return;
}

//読み上げ全体終了
async function endAll(interaction, channel_map, subsc_map){
    const textCh = interaction.guild ? interaction.channel : null;
    const voiceCh = interaction.guild ? interaction.member.voice.channel : null;
    const status = getStatus(interaction, textCh, voiceCh, channel_map);
    
    if(!status){
        destroyVC(interaction, channel_map, subsc_map);
    }

    await interaction.reply(createEmbed(textCh, voiceCh, status));

    return;
}