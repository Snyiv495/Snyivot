/*******************
    prot.js
    スニャイヴ
    2024/01/22
*******************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder} = require('discord.js');
const {Jimp} = require('jimp');
const fs = require('fs');
const db = require('../../db');

//保護情報の取得
function getProtInfo(interaction, map){
    const info = map.has(`work_prot_${interaction.user.id}`) ? map.get(`work_prot_${interaction.user.id}`) : {
        num_times : 0,
        num_correct : 0,
        is_wild : false,
        button : null
    }

    if(interaction.isButton()){
        switch(interaction.customId){
            case "game_work_prot_wild_exe" : {
                info.button = "wild";
                break;
            }
            case "game_work_prot_stray_exe" : {
                info.button = "stray";
                break;
            }
            default : break;
        }
    }

    map.set(`work_prot_${interaction.user.id}`, info);

    return info;
}

//埋め込みの作成
async function createEmbed(interaction, user_info, prot_info){
    const files = [];
    const embeds = [];
    const components = [];

    const attachment = new AttachmentBuilder();
    const embed = new EmbedBuilder();
    const buttons = new ActionRowBuilder();

    const salary = prot_info.num_correct*5;

    if(prot_info.num_times<=10){
        embed.setTitle("この子は野良なのだ？それとも迷子なのだ？👉");
        embed.setDescription(`${prot_info.num_times}/10 匹目`);
    }else{
        embed.setTitle("お疲れ様なのだ！");
        embed.setDescription(`${prot_info.num_correct}匹のずんだもんを保護したのだ！`);
        embed.addFields({name: "完答ボーナス", value: `+${(prot_info.num_correct===10 ? 30 : 0)}円`});
        attachment.setName("icon.png");
        attachment.setFile(`assets/zundamon/icon/flaunt.png`);
    }

    embed.setThumbnail("attachment://icon.png");
    embed.setFooter({text: `所持金：${user_info.money}円 \t給料：${salary}+${(prot_info.num_correct===10 ? 20 : 0)}円`});
    embed.setColor(0x00FF00);
    
    if(prot_info.num_times<=10){
        const wild = new ButtonBuilder();
        const stray = new ButtonBuilder();

        attachment.setName("icon.png");
        attachment.setFile(`game_work_prot_${interaction.user.id}.png`);

        wild.setLabel("野良");
        wild.setEmoji("🏞️");
        wild.setCustomId("game_work_prot_wild_exe");
        wild.setStyle(ButtonStyle.Primary);
        buttons.addComponents(wild);

        stray.setLabel("迷子");
        stray.setEmoji("🏠");
        stray.setCustomId("game_work_prot_stray_exe");
        stray.setStyle(ButtonStyle.Primary);
        buttons.addComponents(stray);
        
    }else{
        const home = new ButtonBuilder();
        const quit = new ButtonBuilder();
        const again = new ButtonBuilder();

        again.setLabel("もう一度！");
        again.setEmoji("🔂");
        again.setCustomId("game_work_prot_again_exe");
        again.setStyle(ButtonStyle.Success);
        buttons.addComponents(again);

        home.setLabel("ゲーム選択");
        home.setEmoji("🎮");
        home.setCustomId("game_home");
        home.setStyle(ButtonStyle.Secondary);
        buttons.addComponents(home);

        quit.setLabel("終わる");
        quit.setEmoji("⚠️");
        quit.setCustomId("quit");
        quit.setStyle(ButtonStyle.Danger);
        quit.setDisabled(false);
        buttons.addComponents(quit);
    }

    files.push(attachment);
    embeds.push(embed);
    components.push(buttons);

    return {content: "", files: files, embeds: embeds, components: components, ephemeral: true};
}

//保護士の実行
async function execute(interaction, map){
    const user_info = await db.getUserInfo(interaction.user.id);
    const rand = Math.floor(Math.random()*100);
    const prot_info = getProtInfo(interaction, map);
    const img_zundamon = await Jimp.read(`assets/zundamon/fairy/0${prot_info.num_times%10}.png`);

    prot_info.num_times++; 

    //答え合わせ
    if((prot_info.is_wild && prot_info.button==="wild") || (!prot_info.is_wild && prot_info.button==="stray")){
        prot_info.num_correct++;
    }

    if(rand<50){
        prot_info.is_wild = false;
    }else{
        img_zundamon.brightness(rand/100);
        prot_info.is_wild = true;
    }

    //10回挑戦
    if(prot_info.num_times<=10){
        await img_zundamon.write(`game_work_prot_${interaction.user.id}.png`);
        await interaction.editReply(await createEmbed(interaction, user_info, prot_info));
        map.set(`work_prot_${interaction.user.id}`, prot_info);

        return 0;
    }

    //最終結果
    if(prot_info.num_times>10){
        user_info.money += prot_info.num_correct*5+(prot_info.num_correct===10 ? 20 : 0);
        await interaction.editReply(await createEmbed(interaction, user_info, prot_info));
        await db.setUserInfo(interaction.user.id, user_info);
        map.delete(`work_prot_${interaction.user.id}`);
        try{
            fs.unlinkSync(`game_work_prot_${interaction.user.id}.png`);
        }catch(e){};

        return 0;
    }

    return -1;
}