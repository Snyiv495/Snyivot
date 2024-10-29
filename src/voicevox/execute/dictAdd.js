/*****************
    dictAdd.js
    スニャイヴ
    2024/10/29
*****************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, AttachmentBuilder} = require('discord.js');
const fs = require('fs');
const axios = require('axios').create({baseURL: process.env.VOICEVOX_SERVER, proxy: false});
const db = require('../db');
const cui = require('../cui');

//状況の取得
function getStatus(pronunciation){

    //カタカナ以外を検出
    if(pronunciation.match(/[^ァ-ヴー]/)){
        return "notKana";
    }

    //クヮ, グヮ以外のヮを検出
    if(pronunciation.match(/(?<!(ク|グ))ヮ/)){
        return "cantKana";
    }

    return 0;
}

//辞書の削除
async function deleteDict(){
    fs.unlink(`${process.env.VOICEVOX_DICTIONARY}`, (e) => {});

    return 0;
}

//既存の辞書のインポート
async function importDict(serverInfo){
    await axios.post("import_user_dict?override=true", JSON.stringify(serverInfo.dict), {headers:{"Content-Type": "application/json"}}).then(async function(){
    }).catch(function(e){});

    return 0;
}

//辞書に単語の追加
async function addWord(surface, pronunciation, accent, priority){
    let uuid = null;
    let status = null;

    await axios.post(`user_dict_word?surface=${encodeURI(surface)}&pronunciation=${encodeURI(pronunciation)}&accent_type=${accent}&priority=${priority}`, {headers:{"accept" : "application/json"}}).then(async function(res){
        uuid = res.data;
    }).catch(function(e){
        status = "failAccent";
    });
    

    return [uuid, status];
}

//埋め込みの作成
function createEmbed(surface, pronunciation, accent, priority, uuid, status){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    if(!status){
        embed.setTitle("新しい言葉を覚えたのだ");
        embed.setThumbnail("attachment://icon.png");
        embed.addFields(
            {name : "言葉", value : `${surface}`, inline : true},
            {name : "発音", value : `${pronunciation}`, inline : true},
            {name : "uuid", value : `${uuid}`, inline : true},
            {name : "低語調位置", value : `${accent}文字目`, inline : true},
            {name : "優先度", value : `${priority}`, inline : true}
        )
        embed.setFooter({text: "読み方が変わらない場合は優先度を上げてください"});
        embed.setColor(0x00FF00);
        attachment.setName("icon.png");
        attachment.setFile("assets/zundamon/icon/delight.png");
        return {content: "", files: [attachment], embeds: [embed], ephemeral: false};
    }

    switch(status){
        case "notKana" : {
            embed.setTitle("知らないカタカナが含まれているのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "有効なカタカナを入力してください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/anger.png");
            break;
        }
        case "cantKana" : {
            embed.setTitle("その「ヮ」はどう読むのだ...");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "クヮ, グヮ以外のヮは指定できません"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
            attachment.setFile("assets/zundamon/icon/think.png");
            break;
        }
        case "failAccent" : {
            embed.setTitle("語調低下の位置がおかしいのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "文字数を確認してください(拗音は直前の文字と合わせて1文字と判断される場合があります)"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/anger.png");
            break;
        }
        default : embed.setTitle("undefined").setColor(0x000000);
    }

    return {content: "", files: [attachment], embeds: [embed], ephemeral: true};
}

//新規辞書の取得
async function getDict(serverInfo){
    await axios.get("user_dict", {headers:{"accept" : "application/json"}}).then(async function(res){
        serverInfo.dict = res.data;
    }).catch(function(e){});

    return serverInfo;
}

//辞書の追加
async function execute(interaction, options){
    let serverInfo = null;
    let progress = null
    let status = null;
    let uuid = null;

    //進捗の表示
    progress = await cui.createProgressbar(interaction, 7);

    //サーバー情報の取得
    serverInfo = await db.getServerInfo(interaction.guild.id);
    progress = await cui.stepProgressbar(progress);

    //状況の取得
    status = getStatus(options.pronunciation);
    progress = await cui.stepProgressbar(progress);

    if(!status){
        //辞書の削除
        await deleteDict(options.progress);
        progress = await cui.stepProgressbar(progress);

        //既存の辞書のインポート
        await importDict(serverInfo);
        progress = await cui.stepProgressbar(progress);

        //辞書に単語の追加
        [uuid, status] = await addWord(options.surface, options.pronunciation, options.accent, options.priority);
        progress = await cui.stepProgressbar(progress);
    }

    if(status){
        //失敗送信
        await interaction.editReply(createEmbed(options.surface, options.pronunciation, options.accent, options.priority, uuid, status));
        return -1;
    }

    //新規辞書の取得
    serverInfo = await getDict(serverInfo);
    progress = await cui.stepProgressbar(progress);

    //サーバー情報の保存
    await db.setServerInfo(interaction.guild.id, serverInfo);
    progress = await cui.stepProgressbar(progress);

    //成功送信
    interaction.channel.send(createEmbed(options.surface, options.pronunciation, options.accent, options.priority, uuid, status));

    return 0;
}