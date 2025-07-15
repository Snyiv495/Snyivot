/*****************
    ai.js
    スニャイヴ
    2025/07/10
*****************/

module.exports = {
    call: call,
    exe: execute
}

const fs = require('fs');
// const canvas = require('canvas');
const db = require('../core/db');
const cui = require('../core/cui');
const gui = require('../core/gui');
const gemini = require('../integrations/gemini');

//サムネイルの作成
// async function createThumbnail(params){
//     const layer_names = [];
//     const psd = map.get("kasukabe_tsumugi_psd");
//     const layers_child = [];
//     const layers = psd.children?.filter(layer =>
//         {
//             if(layer.children){
//                 layers_child.push(layer.children.find(layer => !layer.hidden));
//             }else if(!layer.hidden){
//                 return layer;
//             }
//         }
//     );
    
//     const thumbnail = canvas.createCanvas(psd.width, psd.height);
//     const canvas_2d = thumbnail.getContext('2d');

//     for(const layer of layers.concat(layers_child)){
//         canvas_2d.drawImage(await canvas.loadImage(layer.canvas.toDataURL()), layer.left || 0, layer.top || 0);
//     }
//     return thumbnail.createPNGStream();
// }

//命令文の取得
function getPrompt(interaction, map, id, log){
    const readme_md = map.get("readme_md");
    const gemini_prompt_json = JSON.parse(fs.readFileSync("./src/json/gemini-prompt.json", "utf-8"));
    const pattern = {"<#{time}>": new Date().toLocaleString(), "<#{user_name}>": interaction.user?.displayName??interaction.author.displayName, "<#{chat_log}>": log, "<#{readme}>": readme_md}
    
    for(const element of gemini_prompt_json){
        if(element.id === id){
            const role = element.role.join("\n");
            const style = element.style.join("\n");
            const infomation = element.infomation.join("\n").replace(/<#{.*?}>/g, matched => pattern[matched]);
            const readme = element.readme.join("\n").replace(/<#{.*?}>/g, matched => pattern[matched]);
            return `${role}\n${style}\n${infomation}\n${readme}`;
        }
    }

    throw new Error("jsonファイル内に一致するidがありません");
}

//呼び出し対応
async function call(message, map){
    const request = message.content.replace(new RegExp(`^<@${process.env.BOT_ID}>`), "").replace(new RegExp(`^@${message.guild.members.me.displayName}`), "");

    try{
        //チャンネル内の会話を取得
        const messages = [...(await message.channel.messages.fetch({limit: 21})).values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp);
        const chat_log = JSON.stringify(messages.slice(0, -1).map(message => (
            {
                username: message.author.displayName,
                content: message.content,
                timestamp: message.createdAt.toISOString()
            }
        )));

        //レスポンスの取得
        const gemini_res = await gemini.genConFunc(request, getPrompt(message, map, "ai_chat_call", chat_log));
        const function_call_name = gemini_res.functionCalls[0].name;

        //チャットの返信
        if(function_call_name==="ai_chat_call"){
            message.reply(gemini_res.functionCalls[0].args.reply);
            return 0;
        }

        //メンション
        if(function_call_name==="mention"){
            message.customId = function_call_name;
            cui.callFunc(message, map);
            return 0;
        }

        //読み上げ開始
        if(function_call_name==="read_start"){
            message.customId = function_call_name;
            cui.callFunc(message, map);
            return 0;
        }

        //読み上げ終了
        if(function_call_name==="read_end"){
            message.customId = function_call_name;
            cui.callFunc(message, map);
            return 0;
        }
        
        //辞書追加
        if(function_call_name==="read_dict_add"){
            message.customId = function_call_name;
            message.args = {word:gemini_res.functionCalls[0].args.word, kana:gemini_res.functionCalls[0].args.kana}
            cui.callFunc(message, map);
            return 0;
        }

        //辞書削除
        if(function_call_name==="read_dict_del"){
            message.customId = function_call_name;
            message.args = {word:gemini_res.functionCalls[0].args.word}
            cui.callFunc(message, map);
            return 0;
        }

    }catch(e){
        throw new Error(e);
    }
}

//チャット対応
async function chat(interaction, map){
    const user_info = await db.getUserInfo(interaction.user.id);
    const request = interaction.options?.get("request")?.value ?? (interaction.fields?.getTextInputValue("request"));

    try{
        //レスポンスの取得
        const gemini_res = await gemini.genCon(request, getPrompt(interaction, map, "ai_chat", user_info.gemini_log.map(obj => JSON.stringify(obj)).join("\n")));

        //ログの保存
        user_info.gemini_log.push({username:interaction.user.displayName,content:request,timestamp:new Date().toLocaleString()});
        user_info.gemini_log.push({username:"system",content:gemini_res.text,timestamp:new Date().toLocaleString()});
        user_info.gemini_log = user_info.gemini_log.slice(-10);
        await db.setUserInfo(interaction.user.id, user_info);

        //返答の送信
        interaction.editReply(gui.create(map, "ai_chat", {"<#{chat_response}>": gemini_res.text}));
        
        return 0;

    }catch(e){
        throw new Error(e);
    }
}

//チャットログ出力
async function chatLog(interaction, map){
    const user_info = await db.getUserInfo(interaction.user.id);

    const chat_request_1 = user_info.gemini_log[0]?.content ? `================================\n👤💬\n${user_info.gemini_log[0]?.content}` : "⠀";
    const chat_response_1 = user_info.gemini_log[1]?.content ? `🗨️\n${user_info.gemini_log[1]?.content}` : "⠀";
    const chat_request_2 = user_info.gemini_log[2]?.content ? `================================\n👤💬\n${user_info.gemini_log[2]?.content}` : "⠀";
    const chat_response_2 = user_info.gemini_log[3]?.content ? `🗨️\n${user_info.gemini_log[3]?.content}` : "⠀";
    const chat_request_3 = user_info.gemini_log[4]?.content ? `================================\n👤💬\n${user_info.gemini_log[4]?.content}` : "⠀";
    const chat_response_3 = user_info.gemini_log[5]?.content ? `🗨️\n${user_info.gemini_log[5]?.content}` : "⠀";
    const chat_request_4 = user_info.gemini_log[6]?.content ? `================================\n👤💬\n${user_info.gemini_log[6]?.content}` : "⠀";
    const chat_response_4 = user_info.gemini_log[7]?.content ? `🗨️\n${user_info.gemini_log[7]?.content}` : "⠀";
    const chat_request_5 = user_info.gemini_log[8]?.content ? `================================\n👤💬\n${user_info.gemini_log[8]?.content}` : "⠀";
    const chat_response_5 = user_info.gemini_log[9]?.content ? `🗨️\n${user_info.gemini_log[9]?.content}` : "⠀";

    //チャットログの返信
    interaction.editReply(gui.create(map, "ai_chat_log", 
        {
            "<#{chat_request_1}>": chat_request_1,
            "<#{chat_response_1}>": chat_response_1,
            "<#{chat_request_2}>": chat_request_2,
            "<#{chat_response_2}>": chat_response_2,
            "<#{chat_request_3}>": chat_request_3,
            "<#{chat_response_3}>": chat_response_3,
            "<#{chat_request_4}>": chat_request_4,
            "<#{chat_response_4}>": chat_response_4,
            "<#{chat_request_5}>": chat_request_5,
            "<#{chat_response_5}>": chat_response_5
        }
    ));
    
    return 0;
}

//チャットログ消去
async function chatLogClear(interaction, map){
    const user_info = await db.getUserInfo(interaction.user.id);
    user_info.gemini_log = [];
    await db.setUserInfo(interaction.user.id, user_info);
    chatLog(interaction, map);
    return 0;
}

//AIコマンド実行
async function execute(interaction, map){
    const id = interaction?.commandName ? `${interaction.commandName}${interaction.options.getSubcommand()}` : interaction?.values?.[0] ?? interaction.customId;
    
    //ephemeralメッセージか確認
    if(!id.includes("modal")){
        interaction.message?.flags.bitfield ? await interaction.deferUpdate() : await interaction.deferReply?.({ephemeral:true});
    }
    
    //チャットコマンド
    if(id === "ai_chat"){
        try{
            await chat(interaction, map);
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }
    
    //チャットモーダル
    if(id === "ai_chat_modal"){
        try{
            await interaction.showModal(gui.create(map, "ai_chat_modal"));
            await interaction.editReply(gui.create(map, "ai"));
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }

    //チャットログコマンド
    if(id === "ai_chat_log"){
        try{
            await chatLog(interaction, map);
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }

    //チャットログ消去コマンド
    if(id === "ai_chat_log_clear"){
        try{
            await chatLogClear(interaction, map);
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