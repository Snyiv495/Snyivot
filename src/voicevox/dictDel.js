/*****************
    dictDel.js
    スニャイヴ
    2024/10/17
*****************/

module.exports = {
    getCmd: getCmd,
    dictDel: dictDel,
}

require('dotenv').config();
const {SlashCommandBuilder, EmbedBuilder, AttachmentBuilder} = require('discord.js');
const fs = require('fs');
const db = require('./db');
const cui = require('../cui/cui');

//コマンドの取得
function getCmd(){
    const voicevox_dictionary_delete = new SlashCommandBuilder();

    voicevox_dictionary_delete.setName("voicevox_dictionary_delete")
    voicevox_dictionary_delete.setDescription("voicevoxの辞書削除コマンド")
    voicevox_dictionary_delete.addStringOption(option => {
        option.setName("uuid");
        option.setDescription("削除したい言葉のuuidを入力してください");
        return option;
    });
    
    return voicevox_dictionary_delete;
}

//状況の取得
function getStatus(interaction, serverInfo){
    const uuid = interaction.options.get("uuid") ? interaction.options.get("uuid").value : null

    //uuidの指定なし
    if(!uuid){
        return "notuuid";
    }

    //全削除uuid
    if(uuid === "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" || uuid === "********-****-****-****-************"){
        return "delAll";
    }
    
    //存在しないuuid
    if(!serverInfo.dict[uuid]){
        return "notDict";
    }

    return 0;
}

//文字列辞書の作成
function createStrDict(serverInfo){
    const uuids = Object.keys(serverInfo.dict);
    let csvstr = "言葉,発音,uuid,低語調位置,優先度\n";

    for(let i=0; i<uuids.length; i++){
        csvstr = csvstr + `${serverInfo.dict[uuids[i]].surface},${serverInfo.dict[uuids[i]].pronunciation},${uuids[i]},${serverInfo.dict[uuids[i]].accent_type},${serverInfo.dict[uuids[i]].priority}\n`;
    }

    return csvstr;
}

//埋め込みの作成
function createEmbed(dictFile, status, surface){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    if(!status){
        embed.setTitle(`${surface}の読み方を忘れたのだ`);
        embed.setThumbnail("attachment://icon.png");
        embed.setFooter({text: `${surface}を辞書から削除しました`});
        embed.setColor(0xFFFF00);
        attachment.setName("icon.png");
        attachment.setFile("assets/zundamon/icon/dream.png");
        return {content: "", files: [dictFile, attachment], embeds: [embed], ephemeral: false};
    }
    
    switch(status){
        case "notuuid" : {
            embed.setTitle("今覚えてる言葉とuuidはこんな感じなのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "辞書の削除にはuuidを利用してください"});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
            attachment.setFile("assets/zundamon/icon/flaunt.png");
            break;
        }
        case "delAll" : {
            embed.setTitle("なにもかも忘れたのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "辞書を削除しました"});
            embed.setColor(0xFFFF00);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/dream.png");
            break;
        }
        case "notDict" : {
            embed.setTitle("そのuuidに一致する言葉は覚えてないのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "uuidに間違いがないか確認してください"});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/anger.png");
            break;
        }
        default : embed.setTitle("undefined").setColor(0x000000);
    }

    return {content: "", files: [dictFile, attachment], embeds: [embed], ephemeral: true};
}

//辞書の削除
async function dictDel(interaction){
    const serverInfo = await db.getServerInfo(interaction.guild.id);
    const dictFile = `dict_${interaction.guild.id}.csv`;
    const status = getStatus(interaction, serverInfo);
    let progress = await cui.createProgressbar(interaction, 5);
    let surface = null;

    if(!status){
        const uuid = interaction.options.get("uuid").value;
        surface = serverInfo.dict[uuid].surface;
        delete serverInfo.dict[uuid];
    }

    progress = await cui.stepProgress(interaction, progress);

    if(status === "delAll"){
        serverInfo.dict = {};
    }

    progress = await cui.stepProgress(interaction, progress);

    await db.setServerInfo(interaction.guild.id, serverInfo);

    progress = await cui.stepProgress(interaction, progress);

    fs.writeFile(dictFile, createStrDict(serverInfo), (e) => {});

    progress = await cui.stepProgress(interaction, progress);

    if(status === "notuuid" || status == "notDict"){
        await interaction.editReply(createEmbed(dictFile, status, surface));
        return;
    }

    progress = await cui.stepProgress(interaction, progress);

    await interaction.channel.send(createEmbed(dictFile, status, surface));

    fs.unlink(dictFile, (e) => {});

    return;
}