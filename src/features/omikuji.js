/*****************
    omikuji.js
    スニャイヴ
    2025/07/20
*****************/

module.exports = {
    exe: execute
}

const fs = require('fs');
const db = require('../core/db');
const gui = require('../core/gui');
const gemini = require('../integrations/gemini');

//ドロー
async function draw(interaction, map){
    const user_info = await db.getUserInfo(interaction.user.id);
    const user_info_uranai = user_info.uranai;
    const gemini_prompt_json = JSON.parse(fs.readFileSync("./src/json/gemini-prompt.json", "utf-8"));
    const today = (new Date()).toLocaleDateString();

    let date = user_info_uranai.date;
    let fortune = user_info_uranai.fortune;
    let wiki = user_info_uranai.wiki;
    let speaker = user_info_uranai.speaker;
    let color = user_info_uranai.color;
    let item = user_info_uranai.item;
    let dinner = user_info_uranai.dinner;
    let advice = user_info_uranai.advice;

    let prompt;
    let content;

    //すでに今日実行していたら再送信
    if(date === today){
        //おみくじ送信
        interaction.editReply(gui.create(map, "omikuji_draw", 
            {
                "<#{fortune}>" : fortune,
                "<#{wiki}>" : wiki,
                "<#{speaker}>" : speaker,
                "<#{color}>" : color,
                "<#{item}>" : item,
                "<#{dinner}>" : dinner,
                "<#{advice}>" : advice,
                "<#{date}>" : date
            }
        ));

        return 0;
    }

    //運勢


    //プロンプトの取得
    for(const element of gemini_prompt_json){
        if(element.id === "omikuji"){
            prompt = element;
            content = element.content;
        }
    }

    try{
        //レスポンスの取得
        const gemini_res = await gemini.genConJson(content, prompt);
        const gemini_res_json = JSON.parse(gemini_res.candidates[0].content.parts[0].text);
        item = gemini_res_json.item;
        dinner = gemini_res_json.dinner;
        advice = gemini_res_json.advice;
    }catch(e){
        throw new Error(e);
    }

    user_info.uranai = {date: date, fortune: fortune, wiki: wiki, speaker: speaker, color: color, item: item, dinner: dinner, advice: advice};
    await db.setUserInfo(interaction.user.id, user_info);

    //おみくじ送信
    interaction.editReply(gui.create(map, "omikuji_draw", 
        {
            "<#{fortune}>" : fortune,
            "<#{wiki}>" : wiki,
            "<#{speaker}>" : speaker,
            "<#{color}>" : color,
            "<#{item}>" : item,
            "<#{dinner}>" : dinner,
            "<#{advice}>" : advice,
            "<#{date}>" : date
        }
    ));

    return 0;
}

//おみくじコマンド実行
async function execute(interaction, map){
    const id = interaction?.commandName ? `${interaction.commandName}${interaction.options.getSubcommand()}` : interaction?.values?.[0] ?? interaction.customId;
    
    //ephemeralメッセージか確認
    if(!id.includes("modal")){
        interaction.message?.flags.bitfield ? await interaction.deferUpdate() : await interaction.deferReply?.({ephemeral:true});
    }
    
    //チャットコマンド
    if(id === "omikuji_draw"){
        try{
            await draw(interaction, map);
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }

    //GUI送信
    try{
        interaction.editReply(gui.create(map, id));
        return 0;
    }catch(e){
        throw new Error(e);
    }
}