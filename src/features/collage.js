/*****************
    collage.js
    スニャイヴ
    2025/10/17
*****************/

module.exports = {
    exe : execute
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
async function makeMemeImage(trigger, element){
    try{
        const collage_original_image = await loadImage(element.path);
        const canvas = createCanvas(collage_original_image.width, collage_original_image.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(collage_original_image, 0, 0);

        await writeSentence(ctx, trigger.cleanContent, element.bubble);

        return canvas.toBuffer("image/png").toString("base64");
    }catch(e){
        throw new Error(`collage.js => makeMemeImage() \n ${e}`);
    }
}

//魚拓作成
async function makeGyotakuImage(trigger, element){
    try{
        const canvas_info = element.canvas;
        const filter_info = element.filter;
        const create_time = helper.getCreatedAt(trigger);
        
        //キャンバスの作成
        const canvas = createCanvas(canvas_info.width, canvas_info.height);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas_info.width, canvas_info.height);

        //アイコンを描画
        const icon_x = (canvas_info.width*2/5-canvas_info.height)/2;
        const icon_y = 0;
        const icon_size = canvas_info.height;
        const org_icon = await loadImage(helper.getUserObj(trigger).displayAvatarURL({extension: "png", size: 256}));
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
        const gradient = ctx.createRadialGradient(0, canvas_info.height/2, 0, 0,  canvas_info.height/2,  canvas_info.width*2/5);
        gradient.addColorStop(0, canvas_info.gra_start);
        gradient.addColorStop(1, canvas_info.gra_end);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas_info.width, canvas_info.height);

        //文字入れ
        const content_bubble = {"x": canvas_info.width*2/5, "y": 0, "width": canvas_info.width*3/5, "height": canvas_info.height-(element.author.height+element.date.height), "font_size": element.content.font_size, "alignment_x": "center", "alignment_y": "center", "fill_style": element.content.fill_style, "stroke_style": element.content.stroke_style};
        const author_bubble = {"x": canvas_info.width*2/5, "y": canvas_info.height-(element.author.height+element.date.height), "width": canvas_info.width*3/5, "height": element.author.height, "font_size": element.author.font_size, "alignment_x": "center", "alignment_y": "center", "fill_style": element.author.fill_style, "stroke_style": element.author.stroke_style};
        const date_bubble = {"x": canvas_info.width*2/5, "y": canvas_info.height-element.date.height, "width": canvas_info.width*3/5, "height": element.date.height, "font_size": element.date.font_size, "alignment_x": "right", "alignment_y": "center", "fill_style": element.date.fill_style, "stroke_style": element.date.stroke_style};
        await writeSentence(ctx, trigger.cleanContent, content_bubble);
        await writeSentence(ctx, `- ${helper.getUserName(trigger)}`, author_bubble);
        await writeSentence(ctx, `${create_time.year}-${create_time.month}-${create_time.date}`, date_bubble);

        return canvas.toBuffer("image/png").toString("base64");
    }catch(e){
        throw new Error(`collage.js => makeGyotakuImage() \n ${e}`)
    }
}

//スパチャ作成
async function makeSuperChatImage(trigger, element){
    try{
        const canvas_info = element.canvas;
        const icon_size = canvas_info.height*2/5;
        const margin = canvas_info.height/20;
        
        //キャンバスの作成
        const canvas = createCanvas(canvas_info.width, canvas_info.height);
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = canvas_info.main_color;
        ctx.fillRect(0, 0, canvas_info.width, canvas_info.height/2);
        ctx.fillStyle = canvas_info.sub_color;
        ctx.fillRect(0, canvas_info.height/2, canvas_info.width, canvas_info.height/2);
        ctx.fillStyle = "#FFFFFF";
        ctx.arc(icon_size/2+margin, icon_size/2+margin, icon_size/2, 0 ,2*Math.PI);
        ctx.fill();

        //アイコンを描画
        const org_icon = await loadImage(helper.getUserObj(trigger).displayAvatarURL({extension: "png", size: 256}));
        ctx.drawImage(org_icon, margin, margin, icon_size, icon_size);

        //文字入れ
        const author_bubble = {"x": icon_size+margin*2, "y": 0, "width": canvas_info.width-(icon_size+margin*3), "height": canvas_info.height/4, "font_size": canvas_info.author_font_size, "alignment_x": "left", "alignment_y": "center", "fill_style": "#FFFFFF80", "stroke_style": "#FFFFFF80"};
        const value_bubble = {"x": icon_size+margin*2, "y": canvas_info.height/4, "width": canvas_info.width-(icon_size+margin*3), "height": canvas_info.height/4, "font_size": canvas_info.value_font_size, "alignment_x": "left", "alignment_y": "center", "fill_style": "#FFFFFFFF", "stroke_style": "#FFFFFFFF"};
        const content_bubble = {"x": margin, "y": canvas_info.height/2, "width": canvas_info.width-margin*2, "height": canvas_info.height/2, "font_size": canvas_info.value_font_size, "alignment_x": "left", "alignment_y": "center", "fill_style": "#FFFFFFFF", "stroke_style": "#FFFFFFFF"};
        await writeSentence(ctx, helper.getUserName(trigger), author_bubble);
        await writeSentence(ctx, canvas_info.value, value_bubble);
        await writeSentence(ctx, canvas_info.content, content_bubble);
        
        return canvas.toBuffer("image/png").toString("base64");
    }catch(e){
        throw new Error(`collage.js => makeGyotakuImage() \n ${e}`)
    }
}

//コラ送信
async function sendCollage(trigger, map){
    try{
        /*
            システムIDの形式
                collage_${emoji_name}_${user_id}
        */
        const system_id = helper.getSystemId(trigger);
        const collage_original_json = map.get("collage_original_json");
        const emoji_name = system_id.split("_")[1];
        const react_user = (await trigger.guild.members.fetch(system_id.split("_")[2])).user;

        if(!trigger.cleanContent){
            return;
        }
        
        for(const element of collage_original_json){
            if(element.emoji === emoji_name){

                //ミーム画像
                if(element.path.includes("meme")){
                    await helper.sendGUI(trigger, gui.create(map, "collage_meme", {"{{__MEME_NAME__}}":element.path.split("/").slice(-1)[0], "{{__MEME_BASE64__}}": await makeMemeImage(trigger, element), "{{__REACT_USER_NAME__}}":react_user.displayName, "{{__REACT_USER_ICON__}}":react_user.displayAvatarURL()}));
                    return;
                }

                //魚拓画像
                if(element.path.includes("gyotaku")){
                    await helper.sendGUI(trigger, gui.create(map, "collage_gyotaku", {"{{__GYOTAKU_NAME__}}":element.path, "{{__GYOTAKU_BASE64__}}": await makeGyotakuImage(trigger, element), "{{__REACT_USER_NAME__}}":react_user.displayName, "{{__REACT_USER_ICON__}}":react_user.displayAvatarURL()}));
                    return;
                }

                //スパチャ画像
                if(element.path.includes("superchat")){
                    await helper.sendGUI(trigger, gui.create(map, "collage_superchat", {"{{__SUPERCHAT_NAME__}}":element.path, "{{__SUPERCHAT_BASE64__}}": await makeSuperChatImage(trigger, element)}));
                    return;
                }

                return;
            }
        }
    }catch(e){
        throw new Error(`collage.js => sendCollage() \n ${e}`);
    }

    throw new Error(`collage.js => sendCollage() \n not define emoji : ${emoji_name}`);
}

//コラ作成実行
async function execute(trigger, map){
    try{
        const system_id = helper.getSystemId(trigger);

        //延期の送信
        if(helper.isInteraction(trigger) && !system_id.includes("modal")){
            await helper.sendDefer(trigger);
        }

        //コラ画像送信
        if(system_id.startsWith("collage")){
            await sendCollage(trigger, map);
            return;
        }

        //GUI送信
        await helper.sendGUI(trigger, gui.create(map, system_id));
        return;

    }catch(e){
        throw new Error(`collage.js => execute() \n ${e}`);
    }
}