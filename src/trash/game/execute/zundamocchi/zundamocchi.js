/*********************
    zundamocchi.js
    スニャイヴ
    2025/01/28
*********************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, ModalBuilder, TextInputStyle, AttachmentBuilder, StringSelectMenuBuilder} = require('discord.js');
const db = require('../../db');


//埋め込みの作成
function createEmbed(interaction, user_info){
    const files = [];
    const embeds = [];
    const components = [];

    const attachment = new AttachmentBuilder();
    const embed = new EmbedBuilder();
    const buttons = new ActionRowBuilder();

    const home = new ButtonBuilder();
    const game_home = new ButtonBuilder();
    const again = new ButtonBuilder();
    const quit = new ButtonBuilder();

    let hp_bar="", mp_bar="", pp_bar="";
    for(let i=0; i<5; i++){
        (user_info.zundamocchi_hp-i)>0 ? hp_bar+="🍰" : hp_bar+="🕳️";
        (user_info.zundamocchi_mp-i)>0 ? mp_bar+="🍪" : mp_bar+="🕳️";
        (user_info.zundamocchi_pp-i)>0 ? pp_bar+="🧸" : pp_bar+="🕳️";
    }

    switch(interaction.value){
        case "game_zundamocchi_talk_exe" : {
            embed.setTitle("hogehoge");
            break;
        }
        case "game_zundamocchi_cake_exe" : {
            embed.setTitle("ずんだもんにケーキを与えた！");
            embed.setDescription("ずんだもんのHPが1回復した！");
            break;
        }
        case "game_zundamocchi_cookie_exe" : {
            embed.setTitle("ずんだもんにクッキーを与えた！");
            embed.setDescription("ずんだもんのMPが1回復した！");
            break;
        }
        case "game_zundamocchi_toy_exe" : {
            embed.setTitle("ずんだもんにおもちゃを与えた！");
            embed.setDescription("ずんだもんのPPが1回復した！");
            break;
        }
        default : break;
    }

    if(user_info.zundamocchi_hp <= 0){
        embed.setTitle("ずんだもんは力尽きてしまったようだ...");
        embed.setDescription("");
    }

    embed.setThumbnail("attachment://icon.png");
    embed.addFields({name: "HP", value: `${hp_bar}`});
    embed.addFields({name: "MP", value: `${mp_bar}`});
    embed.addFields({name: "PP", value: `${pp_bar}`});
    embed.setColor(0x00FF00);

    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/bunny.png");

    home.setLabel("ホーム");
    home.setEmoji("🏠");
    home.setCustomId("home");
    home.setStyle(ButtonStyle.Secondary);
    buttons.addComponents(home);

    game_home.setLabel("戻る");
    game_home.setEmoji("🎮");
    game_home.setCustomId("game_home");
    game_home.setStyle(ButtonStyle.Secondary);
    buttons.addComponents(game_home);

    again.setLabel("続ける");
    again.setEmoji("🔂");
    again.setCustomId("game_zundamocchi_home");
    again.setStyle(ButtonStyle.Success);
    buttons.addComponents(again);

    quit.setLabel("終わる");
    quit.setEmoji("⚠️");
    quit.setCustomId("quit");
    quit.setStyle(ButtonStyle.Danger);
    quit.setDisabled(false);
    buttons.addComponents(quit);

    files.push(attachment);
    embeds.push(embed);
    components.push(buttons);

    return {content: "", files: files, embeds: embeds, components: components, ephemeral: true};
}

//ずんだもっちの実行
async function execute(interaction){
    const user_info = await db.getUserInfo(interaction.user.id);
    const date = new Date();
    
    let title = "";
    let description = "";

    //生誕
    if(user_info.zundamocchi_hp_update === null){
        user_info.zundamocchi_hp = 5;
        user_info.zundamocchi_mp = 4;
        user_info.zundamocchi_pp = 4;
        user_info.zundamocchi_hp_update = date.toLocaleString();
        user_info.zundamocchi_mp_update = date.toLocaleString();
        user_info.zundamocchi_pp_update = date.toLocaleString();
    }

    //MPの計算
    while(true){
        let mp_update_plus12hours = new Date(user_info.zundamocchi_mp_update).setHours(new Date(user_info.zundamocchi_mp_update).getHours()+12);
        if(mp_update_plus12hours < date){
            if(user_info.zundamocchi_mp > 0){
                user_info.zundamocchi_mp -= 1;
            }else{
                user_info.zundamocchi_hp -= 1;
            }
            user_info.zundamocchi_mp_update = mp_update_plus12hours.toLocaleString();
            continue;
        }
        break;
    }

    //PPの計算
    while(true){
        let pp_update_plus12hours = new Date(user_info.zundamocchi_pp_update).setHours(new Date(user_info.zundamocchi_pp_update).getHours()+12);
        if(pp_update_plus12hours < date){
            if(user_info.zundamocchi_pp > 0){
                user_info.zundamocchi_pp -= 1;
            }else{
                user_info.zundamocchi_hp -= 1;
            }
            user_info.zundamocchi_pp_update = pp_update_plus12hours.toLocaleString();
            continue;
        }
        break;
    }

    //HPの確認
    if(user_info.zundamocchi_hp <= 0){
        user_info.zundamocchi_hp_update = null;
        await db.setUserInfo(interaction.user.id, user_info);
        await interaction.editReply(createEmbed(interaction, user_info));
        return 0;
    }
    
    if(interaction.isModalSubmit()){
        //cohere
        await db.setUserInfo(interaction.user.id, user_info);
        await interaction.editReply(createEmbed(interaction, user_info));
        return 0;
    }

    switch(interaction.value){
        case "game_zundamocchi_talk_exe" : {
            await interaction.showModal(createModal(user_info));
            try{await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: [], ephemeral: true});}catch(e){};
            return 0;
        }
        case "game_zundamocchi_cake_exe" : {
            user_info.zundamocchi_hp = Math.min(user_info.zundamocchi_hp+1, 5);
            user_info.zundamocchi_hp_update = date.toLocaleString();
            break;
        }
        case "game_zundamocchi_cookie_exe" : {
            user_info.zundamocchi_mp = Math.min(user_info.zundamocchi_mp+1, 5);
            user_info.zundamocchi_mp_update = date.toLocaleString();
            break;
        }
        case "game_zundamocchi_toy_exe" : {
            user_info.zundamocchi_pp = Math.min(user_info.zundamocchi_pp+1, 5);
            user_info.zundamocchi_pp_update = date.toLocaleString();
            break;
        }
        default : break;
    }
    
    await db.setUserInfo(interaction.user.id, user_info);
    await interaction.editReply(createEmbed(interaction, user_info));
    
    return 0;
}