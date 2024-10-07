/*****************
    embed.js
    スニャイヴ
    2024/10/07
*****************/

module.exports = {
    setUser: setUser,
    setServer: setServer,
    start: start,
    end: end,
    autoEnd: autoEnd,
    compulsionEnd: compulsionEnd,
    compulsionMove: compulsionMove,
    dictAdd: dictAdd,
    dictDel: dictDel,
}

const {EmbedBuilder, AttachmentBuilder} = require('discord.js');
const axios = require('axios').create({baseURL: process.env.VOICEVOX_SERVER, proxy: false});

async function setUser(userInfo, displayName, selEmb){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    if(selEmb){
        switch(selEmb){
            case 1 : {
                embed.setTitle("そんなスピーカー知らないのだ");
                embed.setThumbnail("attachment://icon.png");
                embed.setFooter({text: "存在しないスピーカーが入力されました"});
                embed.setColor(0xFF0000);
                attachment.setName("icon.png");
                attachment.setFile("assets/zundamon/icon/delight.png");
                break;
            }
            case 2 : {
                embed.setTitle("そんなスタイル知らないのだ");
                embed.setThumbnail("attachment://icon.png");
                embed.setFooter({text: "存在しないスタイルが入力されました"});
                embed.setColor(0xFF0000);
                attachment.setName("icon.png");
                attachment.setFile("assets/zundamon/icon/delight.png");
                break;
            }
            default : embed.setTitle("undefined").setColor(0x000000);
        }
    }else{
        let policy;
        let style_infos;
        let icon;

        await axios.get(`speaker_info?speaker_uuid=${userInfo.uuid}`).then(
            function(res){
                policy = res.data.policy;
                style_infos = res.data.style_infos;
            }
        ).catch(function(){
            console.log("### VOICEVOXサーバとの接続が不安定です ###");}
        );
        
        for(let i=0; i<style_infos.length; i++){
            if(style_infos[i].id === userInfo.id){
                icon = style_infos[i].icon;
                break;
            }
        }

        embed.setTitle("利用規約");
        embed.setURL(policy.match(/(https?:\/\/[\w\-\.\/\?\,\#\:\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+)/)[0]);
        embed.setDescription(`${displayName}さんの読み上げ音声を\n${userInfo.speaker}(${userInfo.style})に設定したのだ`)
        embed.addFields([
            {name : 'speed', value : `${userInfo.speed}`, inline : true},
            {name : 'pitch', value : `${userInfo.pitch}`, inline : true},
            {name : 'intonation', value : `${userInfo.intonation}`, inline : true},
            {name : 'volume', value : `${userInfo.volume}`, inline : true},
            {name : 'username', value : `${userInfo.username}`, inline : true}
        ])
        embed.setImage("attachment://icon.jpg");
        embed.setFooter({text: `VOICEVOX:${userInfo.speaker}`});
        embed.setColor(0x00FF00);        
        attachment.setName("icon.jpg");
        attachment.setFile(Buffer.from(icon, 'base64'));
    }

    return {files: [attachment], embeds: [embed],  ephemeral: true};
}

async function setServer(serverInfo, serverName, selEmb){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    let ephe = false;

    if(selEmb){
        ephe = true;
        switch(selEmb){
            case 1 : {
                embed.setTitle("君に管理者権限がないのだ");
                embed.setThumbnail("attachment://icon.png");
                embed.setFooter({text: "管理者権限が必要な設定にされています"});
                embed.setColor(0xFF0000);
                attachment.setName("icon.png");
                attachment.setFile("assets/zundamon/icon/delight.png");
                break;
            }
            case 2 : {
                embed.setTitle("管理者権限がないのだ");
                embed.setThumbnail("attachment://icon.png");
                embed.setFooter({text: "sudoオプションの利用には管理者権限が必要です"});
                embed.setColor(0xFF0000);
                attachment.setName("icon.png");
                attachment.setFile("assets/zundamon/icon/delight.png");
                break;
            }
            case 3 : {
                embed.setTitle("そんなスピーカー知らないのだ");
                embed.setThumbnail("attachment://icon.png");
                embed.setFooter({text: "存在しないスピーカーが入力されました"});
                embed.setColor(0xFF0000);
                attachment.setName("icon.png");
                attachment.setFile("assets/zundamon/icon/delight.png");
                break;
            }
            case 4 : {
                embed.setTitle("そんなスタイル知らないのだ");
                embed.setThumbnail("attachment://icon.png");
                embed.setFooter({text: "存在しないスタイルが入力されました"});
                embed.setColor(0xFF0000);
                attachment.setName("icon.png");
                attachment.setFile("assets/zundamon/icon/delight.png");
                break;
            }
            default : embed.setTitle("undefined").setColor(0x000000);
        }
    }else{
        let policy;
        let style_infos;
        let icon;

        await axios.get(`speaker_info?speaker_uuid=${serverInfo.uuid}`).then(
            function(res){
                policy = res.data.policy;
                style_infos = res.data.style_infos;
            }
        ).catch(function(){
            console.log("### VOICEVOXサーバとの接続が不安定です ###");}
        );
        
        for(let i=0; i<style_infos.length; i++){
            if(style_infos[i].id === serverInfo.id){
                icon = style_infos[i].icon;
                break;
            }
        }

        embed.setTitle("利用規約");
        embed.setURL(policy.match(/(https?:\/\/[\w\-\.\/\?\,\#\:\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+)/)[0]);
        embed.setDescription(`${serverName}の読み上げ音声を\n${serverInfo.speaker}(${serverInfo.style})に設定したのだ`)
        embed.addFields([
            {name : 'need_sudo', value : `${serverInfo.need_sudo}`, inline : true},
            {name : 'read_name', value : `${serverInfo.read_name}`, inline : true},
            {name : 'continue_name', value : `${serverInfo.continue_name}`, inline : true},
            {name : 'continue_line', value : `${serverInfo.continue_line}`, inline : true},
            {name : 'maxwords', value : `${serverInfo.maxwords}`, inline : true},
            {name : 'unif', value : `${serverInfo.unif}`, inline : true},
            {name : 'speed', value : `${serverInfo.speed}`, inline : true},
            {name : 'pitch', value : `${serverInfo.pitch}`, inline : true},
            {name : 'intonation', value : `${serverInfo.intonation}`, inline : true},
            {name : 'volume', value : `${serverInfo.volume}`, inline : true}
        ])
        embed.setImage("attachment://icon.jpg");
        embed.setFooter({text: `VOICEVOX:${serverInfo.speaker}`});
        embed.setColor(0x00FF00);        
        attachment.setName("icon.jpg");
        attachment.setFile(Buffer.from(icon, 'base64'));
    }

    return {files: [attachment], embeds: [embed],  ephemeral: ephe};
}

function start(textCh, voiceCh, selEmb){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    let ephe = true;
    
    switch(selEmb){
        case 0 : {
            embed.setTitle(`# ${textCh.name}の文章を\n🔊${voiceCh.name}で読み上げるのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "VOICEVOX:ずんだもん"});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/delight.png");
            ephe = false;
            break;
        }
        case 1 : {
            embed.setTitle(`#${textCh.name}での読み上げは専門外なのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "テキストチャンネルにのみ対応してます"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/delight.png");
            break;
        }
        case 2 : {
            embed.setTitle("これ以上ぼくに何を要求するのだ...");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "既に読み上げを行っています"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/delight.png");
            break;
        }
        case 3 : {
            embed.setTitle(`ぼくは#${textCh.name}に入れてもらってないのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "Snyivotをメンバーに加えてください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/delight.png");
            break;
        }
        case 4 : {
            embed.setTitle("ぼくはどこで読み上げをすればいいのだ？");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "ボイスチャンネルに入ってから呼んでください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/delight.png");
            break;
        }
        case 5 : {
            embed.setTitle(`🔊${voiceCh.name}に参加できないのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "ボイスチャンネルのメンバーや許容人数を確認してください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/delight.png");
            break;
        }
        case 6 : {
            embed.setTitle(`ぼくは🔊${voiceCh.name}で喋れないのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "Snyivotに喋る権限を与えてください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/delight.png");
            break;
        }
        default: embed.setTitle("undefined").setColor(0x000000);
    }

    return {files: [attachment], embeds: [embed], ephemeral: ephe};
}

function end(textCh, voiceCh, selEmb){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    let ephe = true;
    
    switch(selEmb){
        case 0 : {
            embed.setTitle("お疲れ様なのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "読み上げを終了します"});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/delight.png");
            ephe = false;
            break;
        }
        case 1 : {
            embed.setTitle(`#${textCh.name}で読み上げをしてないのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "読み上げを行ってるチャンネルで使用してください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/delight.png");
            break;
        }
        case 2 : {
            embed.setTitle("君にそんな権限はないのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "読み上げを行っているボイスチャンネルに接続してから使用してください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
            attachment.setFile("assets/zundamon/icon/delight.png");
            break;
        }
        case 3 : {
            embed.setTitle("お疲れ様なのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: `🔊${voiceCh.name}での読み上げを終了します`});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/delight.png");
            ephe = false;
            break;
        }
        default : embed.setTitle("undefined").setColor(0x000000);
    }

    return {files: [attachment], embeds: [embed], ephemeral: ephe};
}

function autoEnd(oldVoiceChName){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    embed.setTitle("誰もいないしぼくも帰るのだ");
    embed.setThumbnail("attachment://icon.png");
    embed.setFooter({text: `🔊${oldVoiceChName}での読み上げを終了します`});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/delight.png");

    return {files: [attachment], embeds: [embed]};
}

function compulsionEnd(oldVoiceChName){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    embed.setTitle("追い出されたのだ");
    embed.setThumbnail("attachment://icon.png");
    embed.setFooter({text: `🔊${oldVoiceChName}での読み上げを終了します`});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/delight.png");

    return {files: [attachment], embeds: [embed]};
}

function compulsionMove(oldVoiceChName, newVoiceChName){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    embed.setTitle("ボイスチャンネルを移動させられたのだ");
    embed.setThumbnail("attachment://icon.png");
    embed.setFooter({text: `🔊${oldVoiceChName}から🔊${newVoiceChName}に移動しました`});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/delight.png");

    return {files: [attachment], embeds: [embed]};
}

function dictAdd(surface, pronunciation, accent, priority, uuid, selEmb){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    let ephe = true;
    
    switch(selEmb){
        case 0 : {
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
            ephe = false;
            break;
        }
        case 1 : {
            embed.setTitle("知らないカタカナが含まれているのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "有効なカタカナを入力してください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/delight.png");
            break;
        }
        case 2 : {
            embed.setTitle("その「ヮ」はどう読むのだ...");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "クヮ, グヮ以外のヮは指定できません"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
            attachment.setFile("assets/zundamon/icon/delight.png");
            break;
        }
        case 3 : {
            embed.setTitle("語調低下の位置がおかしいのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "文字数を確認してください(拗音は直前の文字と合わせて1文字と判断される場合があります)"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/delight.png");
            break;
        }
        default : embed.setTitle("undefined").setColor(0x000000);
    }

    return {files: [attachment], embeds: [embed], ephemeral: ephe};
}

function dictDel(dictCsv, surface, selEmb){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    let ephe = true;

    //辞書の送信
    if(!selEmb){
        embed.setTitle("今覚えてる言葉とuuidはこんな感じなのだ");
        embed.setThumbnail("attachment://icon.png");
        embed.setFooter({text: "辞書の削除にはuuidを利用してください"});
        embed.setColor(0x00FF00);
        attachment.setName("icon.png");
        attachment.setFile("assets/zundamon/icon/delight.png");
        
        return {files: [dictCsv, attachment], embeds: [embed]};
    }
    
    switch(selEmb){
        case 1 : {
            embed.setTitle("なにもかも忘れたのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "辞書を削除しました"});
            embed.setColor(0xFFFF00);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/delight.png");
            ephe = false;
            break;
        }
        case 2 : {
            embed.setTitle(`${surface}の読み方を忘れたのだ`);
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: `${surface}を辞書から削除しました`});
            embed.setColor(0xFFFF00);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/delight.png");
            ephe = false;
            break;
        }
        case 3 : {
            embed.setTitle("そのuuidに一致する言葉は覚えてないのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "uuidに間違いがないか確認してください"});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/delight.png");
            break;
        }
        default : embed.setTitle("undefined").setColor(0x000000);
    }

    return {files: [attachment], embeds: [embed], ephemeral: ephe};
}