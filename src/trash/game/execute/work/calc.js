/*****************
    calc.js
    スニャイヴ
    2025/01/24
*****************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, ModalBuilder, TextInputStyle, AttachmentBuilder} = require('discord.js');
const db = require('../../db');

//問題の作成
function createProbrem(interaction, map){
    const calc_info = {probrem_add: null, probrem_sub: null, probrem_mul: null, probrem_div: null, anser_add: 0, anser_sub: 0, anser_mul: 0, anser_div: 0, correct_add: false, correct_sub: false, correct_mul: false, correct_div: false, correct_all: false};

    //足し算
    const sum_A = Math.floor(Math.random()*900)+100;
    const sum_B = Math.floor(Math.random()*900)+100;
    calc_info.probrem_add = `問1. ${sum_A} + ${sum_B}`;
    calc_info.anser_add = sum_A + sum_B;

    //引き算
    const sub_A = Math.floor(Math.random()*900)+100;
    const sub_B = Math.floor(Math.random()*900)+100;
    calc_info.probrem_sub = `問2. ${sub_A} - ${sub_B}`;
    calc_info.anser_sub = sub_A - sub_B;

    //掛け算
    const mul_A = Math.floor(Math.random()*900)+100;
    const mul_B = Math.floor(Math.random()*900)+100;
    calc_info.probrem_mul = `問3. ${mul_A} × ${mul_B}`;
    calc_info.anser_mul = mul_A * mul_B;

    //割り算
    const div_A = Math.floor(Math.random()*900)+100;
    const div_B = Math.floor(Math.random()*900)+100;
    calc_info.probrem_div = `問4. ${div_A}.00 ÷ ${div_B}.00 (有効数字2桁)`;
    calc_info.anser_div = Math.round(((div_A / div_B) * 100))/100;

    map.set(`work_calc_${interaction.user.id}`, calc_info);

    return calc_info;
}

//モーダルの作成
function createModal(calc_info){
    const modal = new ModalBuilder();
    const res_add = new TextInputBuilder();
    const res_sub = new TextInputBuilder();
    const res_mul = new TextInputBuilder();
    const res_div = new TextInputBuilder();
    
    modal.setCustomId("game_work_calc_modal");
	modal.setTitle("この問題の答えを教えてほしいのだ！");

    res_add.setCustomId("res_add")
    res_add.setLabel(`${calc_info.probrem_add}`)
    res_add.setPlaceholder("123");
    res_add.setStyle(TextInputStyle.Short);
    res_add.setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(res_add));

    res_sub.setCustomId("res_sub")
    res_sub.setLabel(`${calc_info.probrem_sub}`)
    res_sub.setPlaceholder("123");
    res_sub.setStyle(TextInputStyle.Short);
    res_sub.setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(res_sub));

    res_mul.setCustomId("res_mul")
    res_mul.setLabel(`${calc_info.probrem_mul}`)
    res_mul.setPlaceholder("123");
    res_mul.setStyle(TextInputStyle.Short);
    res_mul.setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(res_mul));

    res_div.setCustomId("res_div")
    res_div.setLabel(`${calc_info.probrem_div}`)
    res_div.setPlaceholder("1.23");
    res_div.setStyle(TextInputStyle.Short);
    res_div.setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(res_div));

    return modal;
}

//正誤判定
function isCorrect(anser, res){
    if(!isNaN(res) && parseFloat(res)==anser){
        return true;
    }

    return false;
}

//埋め込みの作成
function createEmbed(calc_info, money){
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

    const salary = (calc_info.correct_add ? 5 : 0) + (calc_info.correct_sub ? 5 : 0) + (calc_info.correct_mul ? 10 : 0) + (calc_info.correct_div ? 10 : 0);

    embed.setTitle("結果はこんな感じなのだ！");
    embed.setThumbnail("attachment://icon.png");
    embed.addFields({name: `問1. ${calc_info.correct_add ? "⭕" : "❌"}`, value: `給料+${calc_info.correct_add ? "5" : "0"}円`});
    embed.addFields({name: `問2. ${calc_info.correct_sub ? "⭕" : "❌"}`, value: `給料+${calc_info.correct_sub ? "5" : "0"}円`});
    embed.addFields({name: `問3. ${calc_info.correct_mul ? "⭕" : "❌"}`, value: `給料+${calc_info.correct_mul ? "10" : "0"}円`});
    embed.addFields({name: `問4. ${calc_info.correct_div ? "⭕" : "❌"}`, value: `給料+${calc_info.correct_div ? "10" : "0"}円`});
    embed.addFields({name: `完答ボーナス ${calc_info.correct_all ? "✅" : "❎"}`, value: `給料+${calc_info.correct_all ? "20" : "0"}円`});
    embed.setFooter({text: `所持金：${money}\t給料：${salary}+${(calc_info.correct_all ? 20 : 0)}円`});

    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/flaunt.png");

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

    again.setLabel("もう一度！");
    again.setEmoji("🔂");
    again.setCustomId("game_work_calc_again_exe");
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

//演算士の実行
async function execute(interaction, map){

    //出題
    if(!interaction.isModalSubmit()){
        await interaction.showModal(createModal(createProbrem(interaction, map)));

        try{await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: [], ephemeral: true});}catch(e){};

        return 0;
    }

    //正誤判定
    const user_info = await db.getUserInfo(interaction.user.id);
    const calc_info = map.get(`work_calc_${interaction.user.id}`);

    if(isCorrect(calc_info.anser_add, interaction.fields.getTextInputValue("res_add"))){
        calc_info.correct_add = true;
        user_info.money += 5;
    }

    if(isCorrect(calc_info.anser_sub, interaction.fields.getTextInputValue("res_sub"))){
        calc_info.correct_sub = true;
        user_info.money += 5;
    }

    if(isCorrect(calc_info.anser_mul, interaction.fields.getTextInputValue("res_mul"))){
        calc_info.correct_mul = true;
        user_info.money += 10;
    }

    if(isCorrect(calc_info.anser_div, interaction.fields.getTextInputValue("res_div"))){
        calc_info.correct_div = true;
        user_info.money += 10;
    }

    if(calc_info.correct_add && calc_info.correct_sub && calc_info.correct_mul && calc_info.correct_div){
        calc_info.correct_all = true;
        user_info.money += 20;
    }

    await db.setUserInfo(interaction.user.id, user_info);

    map.delete(`work_calc_${interaction.user.id}`);

    await interaction.editReply(createEmbed(calc_info, user_info.money));
    
    return 0;
}