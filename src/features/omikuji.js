/*****************
    omikuji.js
    スニャイヴ
    2025/08/20
*****************/

module.exports = {
    exe: execute
}

const fs = require('fs');
const db = require('../core/db');
const gui = require('../core/gui');
const helper = require('../core/helper');
const gemini = require('../integrations/gemini');

//ドロー
async function draw(trigger, map){
    try{
        const user_info = await db.getUserInfo(helper.getUserId(trigger));
        const user_info_uranai = user_info.uranai;
        const vv_speakers = map.get("voicevox_speakers");
        const gemini_prompt_json = JSON.parse(fs.readFileSync("./src/json/gemini-prompt.json", "utf-8"));
        const today = (new Date()).toLocaleDateString();

        let date = user_info_uranai.date;
        let fortune = user_info_uranai.fortune;
        let speaker_name = user_info_uranai.speaker_name;
        let speaker_uuid = user_info_uranai.speaker_uuid;
        let color = user_info_uranai.color;
        let item = user_info_uranai.item;
        let dinner = user_info_uranai.dinner;
        let quest = user_info_uranai.quest;
        let advice = user_info_uranai.advice;

        let prompt;
        let content;

        //今日すでに実行していたら再送信
        if(date === today){
            if(helper.isInteraction(trigger)){
                await helper.sendGUI(trigger, gui.create(map, "omikuji_luck", {"{{__SPEAKER_UUID__}}":speaker_uuid}));
            }
            await helper.sendGUI(trigger.channel, gui.create(map, "omikuji_draw", {"{{__DATE__}}":today, "{{__USERNAME__}}":helper.getUserName(trigger), "{{__FORTUNE__}}" : fortune, "{{__SPEAKER__}}" : speaker_name, "{{__COLOR__}}" : color, "{{__ITEM__}}" : item, "{{__DINNER__}}" : dinner, "{{__QUEST__}}" : quest, "{{__ADVICE__}}" : advice}));
            return;
        }

        //運勢
        const fortune_random = Math.floor(Math.random() * 100);
        switch(true){
            case fortune_random===0: fortune = "超大吉"; break;
            case (0<fortune_random&&fortune_random<=4): fortune = "大吉"; break;
            case (4<fortune_random&&fortune_random<=19): fortune = "中吉"; break;
            case (19<fortune_random&&fortune_random<=39): fortune = "小吉"; break;
            case (39<fortune_random&&fortune_random<=59): fortune = "末吉"; break;
            case (59<fortune_random&&fortune_random<=79): fortune = "吉"; break;
            case (79<fortune_random&&fortune_random<=94): fortune = "凶"; break;
            case (94<fortune_random&&fortune_random<=98): fortune = "大凶"; break;
            case fortune_random===99: fortune = "超大凶"; break;
            default : fortune = "シークレット"; break;
        }

        //スピーカー
        const speaker_random = Math.floor(Math.random() * vv_speakers.length);
        speaker_name = vv_speakers[speaker_random].name;
        speaker_uuid = vv_speakers[speaker_random].speaker_uuid;

        //カラー
        color = Math.random().toString(16).slice(-6);

        //プロンプトの取得
        for(const element of gemini_prompt_json){
            if(element.id === "omikuji"){
                prompt = element;
                content = helper.replaceholder(element.content, {"{{__FORTUNE__}}":fortune});
            }
        }

        //レスポンスの取得
        const gemini_res = await gemini.genConJson(content, prompt);
        const gemini_res_json = JSON.parse(gemini_res.candidates[0].content.parts[0].text);
        item = gemini_res_json.item;
        dinner = gemini_res_json.dinner;
        quest = gemini_res_json.quest;
        advice = gemini_res_json.advice;

        user_info.uranai = {date: today, fortune: fortune, speaker_name: speaker_name, speaker_uuid: speaker_uuid, color: color, item: item, dinner: dinner, quest: quest, advice: advice};
        await db.setUserInfo(helper.getUserId(trigger), user_info);

        //おみくじ送信
        if(helper.isInteraction(trigger)){
            await helper.sendGUI(trigger, gui.create(map, "omikuji_luck", {"{{__SPEAKER_UUID__}}":speaker_uuid}));
        }
        await helper.sendGUI(trigger.channel, gui.create(map, "omikuji_draw", {"{{__DATE__}}":today, "{{__USERNAME__}}":helper.getUserName(trigger), "{{__FORTUNE__}}" : fortune, "{{__SPEAKER__}}" : speaker_name, "{{__COLOR__}}" : color, "{{__ITEM__}}" : item, "{{__DINNER__}}" : dinner, "{{__QUEST__}}" : quest, "{{__ADVICE__}}" : advice}));

        return;
    }catch(e){
        throw new Error(`omikuji.js => draw() \n ${e}`);
    }
}

//おみくじコマンド実行
async function execute(trigger, map){
    try{
        const system_id = helper.getSystemId(trigger);

        //延期の送信
        if(helper.isInteraction(trigger) && !system_id.includes("modal")){
            await helper.sendDefer(trigger);
        }

        //ドロー
        if(system_id === "omikuji_draw"){
            await draw(trigger, map);
            return;
        }

        //GUI送信
        await helper.sendGUI(trigger, gui.create(map, system_id));
        return;

    }catch(e){
        throw new Error(`omikuji.js => execute() \n ${e}`);
    }
}