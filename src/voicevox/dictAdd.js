/*****************
    dictAdd.js
    スニャイヴ
    2024/10/16
******************```**/

module.exports = {
    getCmd: getCmd,
    dictAdd: dictAdd,
}

require('dotenv').config();
const {SlashCommandBuilder, EmbedBuilder, AttachmentBuilder} = require('discord.js');
const fs = require('fs');
const axios = require('axios').create({baseURL: process.env.VOICEVOX_SERVER, proxy: false});
const db = require('./db');

//コマンドの取得
function getCmd(){
    const voicevox_dictionary_add = new SlashCommandBuilder();

    voicevox_dictionary_add.setName("voicevox_dictionary_add")
    voicevox_dictionary_add.setDescription("voicevoxの辞書追加コマンド")
    voicevox_dictionary_add.addStringOption(option => {
        option.setName("surface");
        option.setDescription("言葉を入力してください");
        option.setRequired(true);
        return option;
    });
    voicevox_dictionary_add.addStringOption(option => {
        option.setName("pronunciation");
        option.setDescription("発音をカタカナで入力してください");
        option.setRequired(true);
        return option;
    });
    voicevox_dictionary_add.addIntegerOption(option => {
        option.setName("accent");
        option.setDescription("語調が下がる文字の番目を入力してください");
        return option;
    });
    voicevox_dictionary_add.addIntegerOption(option => {
        option.setName("priority");
        option.setDescription("読み替えを行う優先度を入力してください");
        option.setMaxValue(9);
        option.setMinValue(1);
        return option;
    });
    
    return voicevox_dictionary_add;
}

//状況の取得
async function getStatus(pronunciation){

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
        return {files: [attachment], embeds: [embed], ephemeral: false};
    }

    switch(status){
        case "notKana" : {
            embed.setTitle("知らないカタカナが含まれているのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "有効なカタカナを入力してください"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
 	        attachment.setFile("assets/zundamon/icon/delight.png");
            break;
        }
        case "cantKana" : {
            embed.setTitle("その「ヮ」はどう読むのだ...");
            embed.setThumbnail("attachment://icon.png");
            embed.setFooter({text: "クヮ, グヮ以外のヮは指定できません"});
            embed.setColor(0xFF0000);
            attachment.setName("icon.png");
            attachment.setFile("assets/zundamon/icon/delight.png");
            break;
        }
        case "failAccent" : {
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

    return {files: [attachment], embeds: [embed], ephemeral: true};
}

async function dictAdd(interaction){
    const serverInfo = await db.getServerInfo(interaction.guild.id);
    const surface = interaction.options.get("surface").value;
    const pronunciation = interaction.options.get("pronunciation").value;
    const accent = interaction.options.get("accent") ? interaction.options.get("accent").value : 1;
    const priority = interaction.options.get("priority") ? interaction.options.get("priority").value : 5;
    let status = await getStatus(pronunciation);
    let uuid = null;

    if(!status){
        //辞書ファイルの削除
        fs.unlink(`${process.env.VOICEVOX_DICTIONARY}`, (e) => {});
        await interaction.editReply({content:"[##--------]20%"});

        //既存の辞書のインポート
        await axios.post("import_user_dict?override=true", JSON.stringify(serverInfo.dict), {headers:{"Content-Type": "application/json"}})
            .then(async function(){
                await interaction.editReply({content:"[####------]40%"});
                //新規ワードの追加
                await axios.post(`user_dict_word?surface=${encodeURI(surface)}&pronunciation=${encodeURI(pronunciation)}&accent_type=${accent}&priority=${priority}`, {headers:{"accept" : "application/json"}})
                    .then(async function(res){
                        await interaction.editReply({content:"[######----]60%"});
                        uuid = res.data;
                        //追加後の辞書を取得
                        await axios.get("user_dict", {headers:{"accept" : "application/json"}})
                            .then(async function(res){
                                await interaction.editReply({content:"[########--]80%"});
                                serverInfo.dict = res.data;
                            }).catch(function(e){})
                    })
                    .catch(function(e){
                        status = "failAccent";
                    })
            })
            .catch(function(e){})
        ;
    }

    if(status){
        await interaction.editReply(createEmbed(surface, pronunciation, accent, priority, uuid, status));
    }else{
        await interaction.editReply({content:"[##########]100%"});
        interaction.channel.send(createEmbed(surface, pronunciation, accent, priority, uuid, status));
    }

    return;
}