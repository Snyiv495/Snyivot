/*****************
    end.js
    スニャイヴ
    2024/10/29
*****************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, AttachmentBuilder} = require('discord.js');
const cui = require('../cui');

//接続状況の確認
function getStatus(interaction, textCh, voiceCh, channel_map){
    const connectVC = interaction.guild.channels.cache.find((channel) => channel.type == 2 && channel.members.get(process.env.BOT_ID)); 
        
    //ボイスチャンネルの確認
    if(!voiceCh || (voiceCh != connectVC)){
        return "notVoicech";
    }

    //読み上げを行っているか確認
    if(channel_map.get(textCh.id) != voiceCh.id){
        return "notReading";
    }

    return 0;
}

//任意のテキストチャンネルの読み上げを終了する
function endAnyTC(interaction, textCh, voiceCh, channel_map, subsc_map){
    let only = true;

    //他に読み上げを行っているテキストチャンネルがあるか確認する
    interaction.guild.channels.cache.forEach((channel) => {
        if(channel_map.get(channel.id) && channel.id != textCh){
            channel_map.delete(textCh.id);
            only = false;
            return 0;
        }
    });

    //読み上げを行っているテキストチャンネルがなくなるならボイスチャンネルから切断
    if(only){
        destroyVC(interaction, voiceCh, channel_map, subsc_map);
    }

    return 0;
}

//ボイスチャンネルから切断
function destroyVC(interaction, voiceCh, channel_map, subsc_map){
    try{
        subsc_map.get(voiceCh.id).connection.destroy();
    }catch(e){}

    subsc_map.delete(voiceCh.id);

    interaction.guild.channels.cache.forEach((channel) => {
        if(channel_map.get(channel.id)){
            channel_map.delete(channel.id);
        }
    });

    return 0;
}

//埋め込みの作成
function createEmbed(textCh, voiceCh, status){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    if(!status){
        embed.setTitle("お疲れ様なのだ");
        embed.setThumbnail("attachment://icon.png");
        embed.setFooter({text: `🔊${voiceCh.name}での読み上げを終了するのだ`});
        embed.setColor(0x00FF00);
        attachment.setName("icon.png");
        attachment.setFile("assets/zundamon/icon/sleep.png");

        return {content: "", files: [attachment], embeds: [embed], ephemeral: false};
    }

    switch(status){
        case "notReading" : {
            embed.setTitle(`#${textCh.name}で読み上げをしてないのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "読み上げを行ってるチャンネルで使用するのだ"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
            attachment.setFile("assets/zundamon/icon/anger.png");
            break;
        }
        case "notVoicech" : {
            embed.setTitle("君に権限がないのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "読み上げを行っているボイスチャンネルに接続してから使用するのだ"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
            attachment.setFile("assets/zundamon/icon/agitate.png");
            break;
        }
        default : embed.setTitle("undefined").setColor(0x000000);
    }

    return {content: "", files: [attachment], embeds: [embed], ephemeral: true};
}

//読み上げ終了
async function execute(interaction, channel_map, subsc_map){
    const textCh = interaction.channel;
    const voiceCh = interaction.member.voice.channel;
    let progress = null;
    let status = null;

    //進捗の表示
    progress = await cui.createProgressbar(interaction, 2);

    //状況の取得
    status = getStatus(interaction, textCh, voiceCh, channel_map);
    progress = await cui.stepProgressbar(progress);

    //失敗
    if(status){
        await interaction.editReply(createEmbed(textCh, voiceCh, status));
        return -1;
    }
    
    //読み上げ終了
    endAnyTC(interaction, textCh, voiceCh, channel_map, subsc_map);
    progress = await cui.stepProgressbar(progress);

    //成功
    interaction.channel.send(createEmbed(textCh, voiceCh, status));

    return 0;
}