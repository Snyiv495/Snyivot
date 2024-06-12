/*****************
    embed.js
    スニャイヴ
    2023/12/08    
*****************/

/*************
    export    
*************/
module.exports = {
    readVoice: readVoice,
    readLimit: readLimit,
    readName: readName,
    apiKey: apiKey,
    //help: help,
}

/*************
    import    
*************/
require('dotenv').config();
const {EmbedBuilder} = require('discord.js');

/***************
    function    
***************/
function readVoice(speakers, voiceId, opt=1){
    const embed = new EmbedBuilder();
    const speakerName = speakers[voiceId].replace("VOICEVOX:", "");
    const credit = speakerName.substr(0, speakerName.indexOf("（"));
    const iconUrl = `${process.env.ICON}${voiceId}.png`;

    switch(opt){
        case 1:{
            embed.setTitle(`声の設定を\n「${speakerName}」\nに変更したよ～😊`);
            embed.setThumbnail(iconUrl)
            embed.setFooter({text: `VOICEVOX:${credit}`});
            embed.setColor(0x00FF00);
            break;
        }
        case 0:{
            embed.setTitle(`声の設定はもともと\n「${speakerName}」\nやったで～🤨`);
            embed.setThumbnail(iconUrl)
            embed.setFooter({text: `VOICEVOX:${credit}`});
            embed.setColor(0xFFFF00);
            break;
        }
        default: embed.setTitle("undefined").setColor(0x000000);
    }

    return embed;
}

function readLimit(limit, opt=1){
    const embed = new EmbedBuilder();

    switch(opt){
        case 1:{
            embed.setTitle(`読み上げる限界の文字数を変更したよ～😊`);
            embed.setFooter({text: `最大${limit}文字`});
            embed.setColor(0x00FF00);
            break;
        }
        case 0:{
            embed.setTitle(`読み上げる限界の文字数は変わってないやで～🤨`);
            embed.setFooter({text: `最大${limit}文字`});
            embed.setColor(0xFFFF00);
            break;
        }
        default: embed.setTitle("undefined").setColor(0x000000);
    }

    return embed;
}

function readName(bool, opt=1){
    const embed = new EmbedBuilder();

    switch(opt){
        case 1:{
            embed.setTitle(`名前読み上げの要否を変更したよ～😊`);
            embed.setFooter({text: `名前を読み上げる: ${bool}`});
            embed.setColor(0x00FF00);
            break;
        }
        case 0:{
            embed.setTitle(`名前読み上げの要否は変わってないやで～🤨`);
            embed.setFooter({text: `名前を読み上げる: ${bool}`});
            embed.setColor(0xFFFF00);
            break;
        }
        default: embed.setTitle("undefined").setColor(0x000000);
    }

    return embed;
}

function apiKey(opt=1){
    const embed = new EmbedBuilder();

    switch(opt){
        case 1:{
            embed.setTitle("APIKeyを設定したよ～😊");
            embed.setFooter({text: "有効なAPIKeyです"});
            embed.setColor(0x00FF00);
            break;
        }
        case 0:{
            embed.setTitle("もともと設定されてたAPIKeyと変わってないやで～🤨");
            embed.setFooter({text: "有効なAPIKeyです"});
            embed.setColor(0xFFFF00);
            break;
        }
        case -1:{
            embed.setTitle("入力ミスとかしてないか？😓");
            embed.setFooter({text: "無効なAPIKeyです"});
            embed.setColor(0xFF0000);
            break;
        }
        default: embed.setTitle("undefined").setColor(0x000000);
    }

    return embed;
}