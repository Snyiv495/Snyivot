/*****************
    dictDel.js
    スニャイヴ
    2024/10/29
*****************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, AttachmentBuilder} = require('discord.js');
const fs = require('fs');
const db = require('../db');
const cui = require('../cui');

//状況の取得
function getStatus(uuid, serverInfo){

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

//辞書の単語の削除
async function delWord(uuid, serverInfo, status){
    let surface = null;

    if(!status){
        surface = serverInfo.dict[uuid].surface;
        delete serverInfo.dict[uuid];
    }

    if(status === "delAll"){
        serverInfo.dict = {};
    }

    return [serverInfo, surface];

}

//辞書の作成
async function createDict(serverInfo, dictFile){
    const uuids = Object.keys(serverInfo.dict);
    let csvstr = "言葉,発音,uuid,低語調位置,優先度\n";

    for(let i=0; i<uuids.length; i++){
        csvstr = csvstr + `${serverInfo.dict[uuids[i]].surface},${serverInfo.dict[uuids[i]].pronunciation},${uuids[i]},${serverInfo.dict[uuids[i]].accent_type},${serverInfo.dict[uuids[i]].priority}\n`;
    }

    fs.writeFile(dictFile, csvstr, (e) => {});

    return 0;
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
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/anger.png");
            break;
        }
        default : embed.setTitle("undefined").setColor(0x000000);
    }

    return {content: "", files: [dictFile, attachment], embeds: [embed], ephemeral: true};
}

//辞書の削除
async function execute(interaction, options){
    const dictFile = `dict_${interaction.guild.id}.csv`;
    let serverInfo = null;
    let progress = null;
    let surface = null;
    let status = null;

    //進捗の表示
    progress = await cui.createProgressbar(interaction, 5);

    //サーバー情報の取得    
    serverInfo = await db.getServerInfo(interaction.guild.id);
    progress = await cui.stepProgressbar(progress);

    //状況の取得
    status = getStatus(options.uuid, serverInfo);
    progress = await cui.stepProgressbar(progress);

    //辞書の単語の削除
    [serverInfo, surface] = await delWord(options.uuid, serverInfo, status);
    progress = await cui.stepProgressbar(progress);

    //サーバー情報の保存
    await db.setServerInfo(interaction.guild.id, serverInfo);
    progress = await cui.stepProgressbar(progress);

    //辞書の作成
    await createDict(serverInfo, dictFile);
    progress = await cui.stepProgressbar(progress);

    if(status === "notuuid" || status == "notDict"){
        //失敗送信
        await interaction.editReply(createEmbed(dictFile, status, surface));
        return -1;
    }

    //成功送信
    await interaction.channel.send(createEmbed(dictFile, status, surface));

    //辞書の削除
    fs.unlink(dictFile, (e) => {});

    return 0;
}