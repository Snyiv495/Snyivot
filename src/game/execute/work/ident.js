/*****************
    ident.js
    スニャイヴ
    2024/01/17
*****************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder} = require('discord.js');
const db = require('../../db');

//識別情報の取得
function getIdentInfo(interaction, map){
    const info = map.has(`work_ident_${interaction.user.id}`) ? map.get(`work_ident_${interaction.user.id}`) : {
        times : 0,
        correct : 0,
        gender : null
    }

    if(interaction.isButton()){
        switch(interaction.customId){
            case "game_work_ident_boy_exe" : {
                info.gender = "boy";
                break;
            }
            case "game_work_ident_girl_exe" : {
                info.gender = "girl";
                break;
            }
            default : break;
        }
    }

    map.set(`work_ident_${interaction.user.id}`, info);

    return info;
}

//埋め込みの作成
async function createEmbed(user_info, ident_info){
    const files = [];
    const embeds = [];
    const components = [];

    const attachment = new AttachmentBuilder();
    const embed = new EmbedBuilder();
    const buttons = new ActionRowBuilder();

    let salary = "???"

    if(ident_info.times<10){
        embed.setTitle("この子は男の子なのだ？女の子なのだ？👉");
        embed.setDescription(`${ident_info.times+1}/10 匹目`);
    }else{
        embed.setTitle("お疲れ様なのだ！");
        if(ident_info.correct<6){
            embed.setDescription(`ちょっと間違いが多いのだ...\n(正解数：${ident_info.correct}/10)`);
            attachment.setName("icon.png");
            attachment.setFile(`assets/zundamon/icon/cry.png`);
            salary = 1;
        }else{
            embed.setDescription(`よく頑張ったのだ！\n(正解数：${ident_info.correct}/10)`);
            attachment.setName("icon.png");
            attachment.setFile(`assets/zundamon/icon/flaunt.png`);
            salary = Math.pow((ident_info.correct-5), 3)+4;
        }
    }

    embed.setThumbnail("attachment://icon.png");
    embed.setFooter({text: `所持金：${user_info.money}円 \t給料：${salary}円`});
    embed.setColor(0x00FF00);
    
    if(ident_info.times<10){
        const boy = new ButtonBuilder();
        const girl = new ButtonBuilder();
        const rand = Math.floor(Math.random()*9); 

        attachment.setName("icon.png");
        attachment.setFile(`assets/zundamon/fairy/0${rand}.png`);

        boy.setLabel("男の子");
        boy.setEmoji("♂️");
        boy.setCustomId("game_work_ident_boy_exe");
        boy.setStyle(ButtonStyle.Primary);
        buttons.addComponents(boy);

        girl.setLabel("女の子");
        girl.setEmoji("♀️");
        girl.setCustomId("game_work_ident_girl_exe");
        girl.setStyle(ButtonStyle.Primary);
        buttons.addComponents(girl);
        
    }else{
        const home = new ButtonBuilder();
        const quit = new ButtonBuilder();
        const again = new ButtonBuilder();

        again.setLabel("もう一度！");
        again.setEmoji("🔂");
        again.setCustomId("game_work_ident_again_exe");
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

//識別士の実行
async function execute(interaction, map){
    const user_info = await db.getUserInfo(interaction.user.id);
    const rand = Math.floor(Math.random()*100);

    let ident_info = getIdentInfo(interaction, map);

    //識別の開始
    if(!ident_info.gender){
        await interaction.editReply(await createEmbed(user_info, ident_info));
        return 0;
    }

    ident_info.times++;

    //答え合わせ
    if((ident_info.gender==="boy" && rand<50) || (ident_info.gender==="girl" && rand>=50)){
        ident_info.correct++;
    }

    //10回挑戦
    if(ident_info.times<10){
        map.set(`work_ident_${interaction.user.id}`, ident_info);
        await interaction.editReply(await createEmbed(user_info, ident_info));
        return 0;
    }    

    //最終結果
    if(ident_info.times===10){
        user_info.money += (ident_info.correct-5)>0 ? Math.pow((ident_info.correct-5), 3)+4 : 1;
        await interaction.editReply(await createEmbed(user_info, ident_info));
        await db.setUserInfo(interaction.user.id, user_info);
        map.delete(`work_ident_${interaction.user.id}`);
        return 0;
    }

    return -1;
}