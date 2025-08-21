/*****************
    ai.js
    スニャイヴ
    2025/08/21
*****************/

module.exports = {
    exe : execute
}

const fs = require('fs');
const db = require('../core/db');
const cui = require('../core/cui');
const gui = require('../core/gui');
const helper = require('../core/helper');
const gemini = require('../integrations/gemini');

//命令文の取得
function getPrompt(trigger, log, map, system_id){
    const gemini_prompt_json = JSON.parse(fs.readFileSync("./src/json/gemini-prompt.json", "utf-8"));
    const replacement = {"{{__TIME__}}": new Date().toLocaleString(), "{{__USER_NAME__}}": helper.getUserName(trigger), "{{__CHAT_LOG__}}": log, "{{__README__}}": map.get("readme_md")}

    for(const element of gemini_prompt_json){
        if(element.id === system_id){
            const role = element.role.join("\n");
            const style = element.style.join("\n");
            const infomation = helper.replaceholder(element.infomation.join("\n"), replacement);
            const readme = helper.replaceholder(element.readme.join("\n"), replacement);
            return `${role}\n${style}\n${infomation}\n${readme}`;
        }
    }

    throw new Error(`ai.js => getPrompt() \n not found system id`);
}

//公開チャット
async function publicChat(message, map){
    try{
        const system_id = helper.getSystemId(message);
        const messages = [...(await message.channel.messages.fetch({limit: 21})).values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp);
        const chat_log = JSON.stringify(messages.slice(0, -1).map(message => ({username: message.author.displayName, content: message.content, timestamp: message.createdAt.toISOString()})));
        const gemini_res_function_call = (await gemini.genConFunc(message.content, getPrompt(message, chat_log, map, system_id))).functionCalls?.[0];

        message.system_id = gemini_res_function_call?.name ?? "reply";
        message.args = gemini_res_function_call?.args ?? {"reply":"Error"}; 

        await cui.msgCmd(message, map);
        return;
    }catch(e){
        throw new Error(`ai.js => publicChat() \n ${e}`);
    }
}

//非公開チャット
async function privateChat(interaction, map){
    const user_info = await db.getUserInfo(helper.getUserId(interaction));
    const gemini_log = user_info.gemini_log.map(obj => JSON.stringify(obj)).join("\n");
    const request = helper.getArgValue(interaction, "request");
    const system_id = helper.getSystemId(interaction);

    try{
        //レスポンスの取得
        const gemini_res_text = (await gemini.genCon(request, getPrompt(interaction, gemini_log, map, system_id))).text ?? "Error";

        //ログの保存
        user_info.gemini_log.push({username:interaction.user.displayName,content:request,timestamp:new Date().toLocaleString()});
        user_info.gemini_log.push({username:"すにゃbot",content:gemini_res_text,timestamp:new Date().toLocaleString()});
        user_info.gemini_log = user_info.gemini_log.slice(-20);
        await db.setUserInfo(helper.getUserId(interaction), user_info);

        //返答の送信
        await helper.sendGUI(interaction, gui.create(map, system_id, {"{{__CHAT_RESPONSE__}}": gemini_res_text}))
        return;

    }catch(e){
        throw new Error(`ai.js => privateChat() \n ${e}`);
    }
}

//チャットログ出力
async function chatLog(interaction, map){
    const user_info = await db.getUserInfo(helper.getUserId(interaction));    
    const replacement = {};

    for(let i=0; i<10; i++){
        replacement[`{{__CHAT_REQUEST_${i+1}__}}`] = user_info.gemini_log[i*2]?.content ? `================================\n👤💬\n${user_info.gemini_log[i*2]?.content}` : "⠀";
    }
    for(let i=0; i<10; i++){
        replacement[`{{__CHAT_RESPONSE_${i+1}__}}`] = user_info.gemini_log[(i*2)+1]?.content ? `🗨️\n${user_info.gemini_log[(i*2)+1]?.content}` : "⠀";
    }
    await helper.sendGUI(interaction, gui.create(map, "ai_chat_log", replacement));
    return;
}

//チャットログ消去
async function chatLogClear(interaction, map){
    const user_info = await db.getUserInfo(helper.getUserId(interaction));
    user_info.gemini_log = [];
    await db.setUserInfo(helper.getUserId(interaction), user_info);
    await chatLog(interaction, map);
    return;
}

//AIコマンド実行
async function execute(trigger, map){
    const system_id = helper.getSystemId(trigger);

    try{
        //延期の送信
        if(helper.isInteraction(trigger) && !system_id.includes("modal")){
            await helper.sendDefer(trigger);
        }

        //公開チャットコマンド
        if(system_id === "ai_chat_public"){
            await publicChat(trigger, map);
            return;
        }

        //非公開チャットコマンド
        if(system_id === "ai_chat_private"){
            await privateChat(trigger, map);
            return;
        }

        //チャットログコマンド
        if(system_id === "ai_chat_log"){
            await chatLog(trigger, map);
            return;
        }

        //チャットログ消去コマンド
        if(system_id === "ai_chat_log_clear"){
            await chatLogClear(trigger, map);
            return;
        }

        //モーダルの送信
        if(system_id.includes("modal")){
            await helper.sendModal(trigger, gui.create(map, system_id));
            await helper.sendGUI(trigger, gui.create(map, "ai"));
            return;
        }

        //GUI送信
        await helper.sendGUI(trigger, gui.create(map, system_id));
        return;

    }catch(e){
        throw new Error(`ai.js => execute() \n ${e}`);
    }
}