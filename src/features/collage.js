/*****************
    collage.js
    スニャイヴ
    2025/10/21
*****************/

module.exports = {
    exe : execute,
    autoComplete : autoComplete
}

const {createCanvas, loadImage, registerFont} = require("canvas");
const twemoji = require("@twemoji/api");
const gui = require("../core/gui");
const helper = require("../core/helper");

registerFont("./assets/collage/NotoSansJP-Regular.ttf", {family: "Noto Sans JP"});

//文章記述
async function writeSentence(ctx, text, bubble){
    try{
        /*
            カスタム絵文字の形式
                <:custom_emoji_name:unique_number>      <= (png)
                <a:custom_emoji_name:unique_number>     <= animation(gif)
            正規表現
                /<a?:\w+:(\d+)>|(\p{Extended_Pictographic}\uFE0F?(?:\u200D\p{Extended_Pictographic}\uFE0F?)*)|([\s\S])/gu;
                カスタム絵文字 or Unicode絵文字 or 任意の1文字
            array[0] : <:xxx:000>   or Unicode絵文字    or x
            array[1] : 000          or undefind         or undefined
            array[2] : undefined    or Unicode絵文字    or undefined
            array[3] : undefined    or undefined        or x
        */
        const font_size = bubble.font_size;
        const emoji_regex = /<a?:\w+:(\d+)>|(\p{Extended_Pictographic}\uFE0F?(?:\u200D\p{Extended_Pictographic}\uFE0F?)*)|([\s\S])/gu;

        let lines_info = [];
        let current_line = [];
        let current_width = 0;
        let match = null;
        let omit_line = null;

        //各行の作成
        ctx.font = `${font_size}px "Noto Sans JP, sans-serif"`;
        while((match = emoji_regex.exec(text)) !== null){
            let char_width = font_size;

            //普通の文字なら幅計算
            if(match[3]){
                char_width = ctx.measureText(match[3]).width;
            }

            //範囲外
            if(current_width+char_width > bubble.width){
                lines_info.push({line: current_line, width: current_width});
                current_line = [];
                current_width = 0;
            }

            //文字の接続
            current_line.push(match);
            current_width += char_width;

            //改行コード
            if(match[3]==="\n"){
                lines_info.push({line: current_line, width: current_width});
                current_line = [];
                current_width = 0;
            }
        }

        //最後の行を追加
        if(current_line.length > 0){
            lines_info.push({line: current_line, width: current_width});
            current_line = [];
            current_width = 0;
        }

        //範囲外の行を削除
        if(lines_info.length*font_size > bubble.height){
            lines_info = lines_info.slice(0, Math.ceil(bubble.height/font_size-1));
        }

        let current_x = bubble.x;
        let current_y = bubble.y;
        ctx.font = `${font_size}px "Noto Sans JP, sans-serif"`;
        ctx.fillStyle = bubble.fill_style;
        ctx.strokeStyle = bubble.stroke_style;

        //揃え位置の決定 y軸
        if(bubble.alignment_y === "up"){
            current_y = bubble.y;
        }
        if(bubble.alignment_y === "center"){
            current_y = bubble.y + (bubble.height-lines_info.length*font_size)/2;
        }
        if(bubble.alignment_y === "down"){
            current_y = bubble.y + bubble.height - lines_info.length*font_size;
        }
        
        //各行の描画
        for(const line_info of lines_info){

            //省略行の判定
            if(line_info === omit_line){
                ctx.font = `${font_size/2}px "Noto Sans JP, sans-serif"`;
            }

            //揃え位置の決定 x軸
            if(bubble.alignment_x === "left"){
                current_x = bubble.x;
            }
            if(bubble.alignment_x === "center"){
                current_x = bubble.x + (bubble.width-line_info.width)/2;
            }
            if(bubble.alignment_x === "right"){
                current_x = bubble.x + bubble.width - line_info.width;
            }

            for(const match of line_info.line){

                //カスタム絵文字
                if(match[1]){
                    const custom_emoji = await loadImage(`https://cdn.discordapp.com/emojis/${match[1]}.png`);
                    ctx.drawImage(custom_emoji, current_x, current_y, font_size*3/2, font_size*3/2);
                    current_x += font_size;
                }

                //Unicode絵文字
                if(match[2]){
                    const unicode_emoji_url = `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/72x72/${twemoji.convert.toCodePoint(match[2])}.png`;
                    const exist_emoji = (await fetch(unicode_emoji_url, {method: "HEAD"})).ok;

                    if(exist_emoji){
                        const unicode_emoji = await loadImage(unicode_emoji_url);
                        ctx.drawImage(unicode_emoji, current_x, current_y, font_size, font_size);
                        current_x += font_size;
                    }

                    if(!exist_emoji){
                        match[3] = match[2];
                    }
                }

                //任意の1文字
                if(match[3]){
                    const char = match[3];
                    ctx.strokeText(char, current_x, current_y+font_size);
                    ctx.fillText(char, current_x, current_y+font_size);
                    current_x += ctx.measureText(char).width;
                }
            }

            current_y += font_size;
        }

        return;
    }catch(e){
        throw new Error(`collage.js => writeHorizontal() \n ${e}`);
    }
}

//ミーム作成
async function makeMemeImage(element, content){
    try{
        const collage_original_path = `./assets/collage/meme/${element.name}`;
        const collage_original_image = await loadImage(collage_original_path);
        const canvas = createCanvas(element.canvas.width, element.canvas.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(collage_original_image, 0, 0);

        await writeSentence(ctx, content, element.bubble);

        return canvas.toBuffer("image/png").toString("base64");
    }catch(e){
        throw new Error(`collage.js => makeMemeImage() \n ${e}`);
    }
}

//ミーム送信
async function sendMemeImage(trigger, map){
    try{
        /*
            triggerの内容
                リアクション　　：リアクションを付けられたメッセージ
                インタラクション：利用者のインタラクション
            システムIDの形式
                リアクション　　：collage_${type}_${message_id}_${user_id}_${emoji}
                インタラクション：collage_${type}
        */
        const system_id = helper.getSystemId(trigger);
        const message_id = system_id.split("_")[2] ?? helper.getArgValue(trigger, "id");
        const user_id = system_id.split("_")[3] ?? helper.getUserId(trigger);
        const emoji = system_id.split("_")[4] ?? helper.getArgValue(trigger, "emoji");
        const collage_original_json = map.get("collage_original_json");
        
        let user = null;
        let message = null;
        
        try{user = (await trigger.guild.members.fetch(user_id));}catch(e){await helper.sendGUI(trigger, gui.create(map, "collage_failure"));};
        try{message = (await trigger.channel.messages.fetch(message_id));}catch(e){await helper.sendGUI(trigger, gui.create(map, "collage_failure"));};

        for(const element of collage_original_json){
            if(element.emoji === emoji){
                await helper.sendGUI(message, gui.create(map, "collage_meme", {"{{__MEME_NAME__}}":element.name, "{{__MEME_BASE64__}}": await makeMemeImage(element, message.cleanContent??""), "{{__REACT_USER_NAME__}}":user.displayName, "{{__REACT_USER_ICON__}}":user.displayAvatarURL()}));
                if(helper.isInteraction(trigger)) await helper.sendGUI(trigger, gui.create(map, "home"));
                return;
            }
        }
    }catch(e){
        throw new Error(`collage.js => sendMemeImage() \n ${e}`);
    }

    throw new Error(`collage.js => sendMemeImage() \n not define id`);
}

//魚拓作成
async function makeGyotakuImage(element, content, user, time,){
    try{
        const canvas_info = element.canvas;
        const filter_info = element.filter;
        const content_info = element.content;
        const author_info = element.author;
        const date_info = element.date;

        const canvas_width = 1920;
        const canvas_height = 1080;
        const content_font_size = 96;
        const author_font_size = 72;
        const date_font_size = 48;
        
        //キャンバスの作成
        const canvas = createCanvas(canvas_width, canvas_height);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas_width, canvas_height);

        //アイコンを描画
        const icon_x = (canvas_width*2/5-canvas_height)/2;
        const icon_y = 0;
        const icon_size = canvas_height;
        const org_icon = await loadImage(user.displayAvatarURL({extension: "png", size: 256}));
        ctx.drawImage(org_icon, icon_x, icon_y, icon_size, icon_size);
        
        //フィルター
        const ctx_icon = ctx.getImageData(icon_x, icon_y, icon_size, icon_size);
        const ctx_icon_data = ctx_icon.data;
        for(let i=0; i<ctx_icon_data.length; i+=4){
            const r = ctx_icon_data[i];
            const g = ctx_icon_data[i+1];
            const b = ctx_icon_data[i+2];
            const rgb_average = (r+g+b)/3;
            ctx_icon_data[i] = Math.min(rgb_average*filter_info.r, 255);
            ctx_icon_data[i+1] = Math.min(rgb_average*filter_info.g, 255);
            ctx_icon_data[i+2] = Math.min(rgb_average*filter_info.b, 255);
        }
        ctx.putImageData(ctx_icon, icon_x, icon_y);

        //グラデーション背景を描画
        const gradient = ctx.createRadialGradient(0, canvas_height/2, 0, 0,  canvas_height/2,  canvas_width*2/5);
        gradient.addColorStop(0, canvas_info.gra_start);
        gradient.addColorStop(1, canvas_info.gra_end);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas_width, canvas_height);

        //文字入れ
        const content_bubble = {"x": canvas_width*2/5, "y": 0, "width": canvas_width*3/5, "height": canvas_height-(author_font_size*3/2+date_font_size*3/2), "font_size": content_font_size, "alignment_x": "center", "alignment_y": "center", "fill_style": content_info.main_color, "stroke_style": content_info.sub_color};
        const author_bubble = {"x": canvas_width*2/5, "y": canvas_height-(author_font_size*3/2+date_font_size*3/2), "width": canvas_width*3/5, "height": author_font_size*3/2, "font_size": author_font_size, "alignment_x": "center", "alignment_y": "center", "fill_style": author_info.main_color, "stroke_style": author_info.sub_color};
        const date_bubble = {"x": canvas_width*2/5, "y": canvas_height-date_font_size*3/2, "width": canvas_width*3/5, "height": date_font_size*3/2, "font_size": date_font_size, "alignment_x": "right", "alignment_y": "center", "fill_style": date_info.main_color, "stroke_style": date_info.sub_color};
        await writeSentence(ctx, content, content_bubble);
        await writeSentence(ctx, `- ${user.displayName}`, author_bubble);
        await writeSentence(ctx, `${time.year}-${time.month}-${time.date}`, date_bubble);

        return canvas.toBuffer("image/png").toString("base64");
    }catch(e){
        throw new Error(`collage.js => makeGyotakuImage() \n ${e}`)
    }
}

//魚拓送信
async function sendGyotakuImage(trigger, map){
    try{
        /*
            triggerの内容
                リアクション　　：リアクションを付けられたメッセージ
                インタラクション：利用者のインタラクション
            システムIDの形式
                リアクション　　：collage_${type}_${message_id}_${user_id}_${emoji}
                インタラクション：collage_${type}
        */
        const system_id = helper.getSystemId(trigger);
        const message_id = system_id.split("_")[2] ?? helper.getArgValue(trigger, "id");
        const user_id = system_id.split("_")[3] ?? helper.getUserId(trigger);
        const emoji = system_id.split("_")[4] ?? helper.getArgValue(trigger, "emoji");
        const collage_original_json = map.get("collage_original_json");
        
        let user = null;
        let message = null;
        
        try{user = (await trigger.guild.members.fetch(user_id));}catch(e){await helper.sendGUI(trigger, gui.create(map, "collage_failure"));};
        try{message = (await trigger.channel.messages.fetch(message_id));}catch(e){await helper.sendGUI(trigger, gui.create(map, "collage_failure"));};

        for(const element of collage_original_json){
            if(element.emoji === emoji){
                await helper.sendGUI(message, gui.create(map, "collage_meme", {"{{__MEME_NAME__}}":element.name, "{{__MEME_BASE64__}}": await makeGyotakuImage(element, message.cleanContent??"", helper.getUserObj(message), helper.getCreatedAt(message)), "{{__REACT_USER_NAME__}}":user.displayName, "{{__REACT_USER_ICON__}}":user.displayAvatarURL()}));
                if(helper.isInteraction(trigger)) await helper.sendGUI(trigger, gui.create(map, "home"));
                return;
            }
        }
    }catch(e){
        throw new Error(`collage.js => sendGyotakuImage() \n ${e}`);
    }

    throw new Error(`collage.js => sendGyotakuImage() \n not define id`);
}

//スパチャ作成
async function makeSuperChatImage(element, user, amount, content){
    try{
        const canvas_info = element.canvas;
        const font_info = element.font;
        const amount_info = element.amount;

        const canvas_width = 900;
        const canvas_height = 300;
        const font_size = 48;
        const icon_size = canvas_height*2/5;
        const margin = canvas_height/20;

        amount = amount ?? `￥${Math.floor(Math.random()*(amount_info.max-amount_info.min+1)) + amount_info.min}`;
        content = content ?? "";

        //キャンバスの作成
        const canvas = createCanvas(canvas_width, canvas_height);
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = canvas_info.main_color;
        ctx.fillRect(0, 0, canvas_width, canvas_height/2);
        ctx.fillStyle = canvas_info.sub_color;
        ctx.fillRect(0, canvas_height/2, canvas_width, canvas_height/2);
        ctx.fillStyle = "#FFFFFF";
        ctx.arc(icon_size/2+margin, icon_size/2+margin, icon_size/2, 0 ,2*Math.PI);
        ctx.fill();

        //アイコンを描画
        const org_icon = await loadImage(user.displayAvatarURL({extension: "png", size: 256}));
        ctx.drawImage(org_icon, margin, margin, icon_size, icon_size);

        //文字入れ
        const author_bubble = {"x": icon_size+margin*2, "y": 0, "width": canvas_width-(icon_size+margin*3), "height": canvas_height/4, "font_size": font_size, "alignment_x": "left", "alignment_y": "center", "fill_style": font_info.sub_color, "stroke_style": font_info.sub_color};
        const value_bubble = {"x": icon_size+margin*2, "y": canvas_height/4, "width": canvas_width-(icon_size+margin*3), "height": canvas_height/4, "font_size": font_size, "alignment_x": "left", "alignment_y": "center", "fill_style": font_info.main_color, "stroke_style": font_info.main_color};
        const content_bubble = {"x": margin, "y": canvas_height/2, "width": canvas_width-margin*2, "height": canvas_height/2, "font_size": font_size, "alignment_x": "left", "alignment_y": "center", "fill_style": font_info.main_color, "stroke_style": font_info.main_color};
        await writeSentence(ctx, user.displayName, author_bubble);
        await writeSentence(ctx, amount, value_bubble);
        await writeSentence(ctx, content, content_bubble);
        
        return canvas.toBuffer("image/png").toString("base64");
    }catch(e){
        throw new Error(`collage.js => makeSuperChatImage() \n ${e}`);
    }
}

//スパチャ送信
async function sendSuperChatImage(trigger, map){
    try{
        /*
            triggerの内容
                リアクション　　：リアクションを付けられたメッセージ
                インタラクション：利用者のインタラクション
            システムIDの形式
                リアクション　　：collage_${type}_${message_id}_${user_id}_${emoji}
                インタラクション：collage_${type}
        */
        const system_id = helper.getSystemId(trigger);
        const message_id = system_id.split("_")[2] ?? helper.getArgValue(trigger, "id");
        const user_id = system_id.split("_")[3] ?? helper.getUserId(trigger);
        const emoji = system_id.split("_")[4] ?? helper.getArgValue(trigger, "emoji");
        const amount = helper.isInteraction(trigger) ? helper.getArgValue(trigger, "amount") : null;
        const content = helper.isInteraction(trigger) ? helper.getArgValue(trigger, "content") : null;
        const collage_original_json = map.get("collage_original_json");

        let user = null;
        let message = null;
        
        try{user = (await trigger.guild.members.fetch(user_id));}catch(e){await helper.sendGUI(trigger, gui.create(map, "collage_failure"));};
        try{message = (await trigger.channel.messages.fetch(message_id));}catch(e){await helper.sendGUI(trigger, gui.create(map, "collage_failure"));};

        for(const element of collage_original_json){
            if(element.emoji === emoji){
                await helper.sendGUI(message, gui.create(map, "collage_superchat", {"{{__SUPERCHAT_NAME__}}":element.name, "{{__SUPERCHAT_BASE64__}}": await makeSuperChatImage(element, user, amount, content)}));
                if(helper.isInteraction(trigger)) await helper.sendGUI(trigger, gui.create(map, "home"));
                return;
            }
        }
    }catch(e){
        throw new Error(`collage.js => sendSuperChatImage() \n ${e}`);
    }

    throw new Error(`collage.js => sendSuperChatImage() \n not define id`);
}

//絵文字選択肢の取得
async function getEmojiChoices(interaction, map){
    try{
        const system_id = helper.getSystemId(interaction);
        const focus_opt = interaction.options.getFocused(true);
        const collage_original_json = map.get("collage_original_json");
        const choices = new Array();

        collage_original_json.find(element => {
            if(system_id.includes(element.type) && element.emoji.includes(focus_opt.value) && !element.custom){
                choices.push(element.emoji);
            }
        });

        return choices.slice(0, 25);
    }catch(e){
        throw new Error(`read.js => getEmojiChoices() \n ${e}`);
    }
}

//コラ作成実行
async function execute(trigger, map){
    try{
        const system_id = helper.getSystemId(trigger);

        //延期の送信
        if(helper.isInteraction(trigger) && !system_id.includes("modal")){
            await helper.sendDefer(trigger);
        }

        //ミーム画像送信
        if(system_id.startsWith("collage_meme")){
            await sendMemeImage(trigger, map);
            return;
        }

        //魚拓画像送信
        if(system_id.startsWith("collage_gyotaku")){
            await sendGyotakuImage(trigger, map);
            return;
        }

        //スパチャ画像送信
        if(system_id.startsWith("collage_superchat")){
            await sendSuperChatImage(trigger, map);
            return;
        }

        //GUI送信
        await helper.sendGUI(trigger, gui.create(map, system_id));
        return;

    }catch(e){
        throw new Error(`collage.js => execute() \n ${e}`);
    }
}

//コマンドの補助
async function autoComplete(interaction, map){
    try{
        const focus_opt = interaction.options.getFocused(true);

        //emojiオプションの補助
        if(focus_opt.name === "emoji"){
            await interaction.respond((await getEmojiChoices(interaction, map)).map(choice => ({name: choice, value: choice})));
            return;
        }

    }catch(e){
        throw new Error(`collage.js => autoComplete() \n ${e}`);
    }

    throw new Error(`collage.js => autoComplete() \n not define option`);
}