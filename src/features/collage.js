/*****************
    collage.js
    スニャイヴ
    2025/09/27
*****************/

module.exports = {
    exe : execute
}

const {createCanvas, loadImage, registerFont} = require("canvas");
const twemoji = require("twemoji");
const gui = require("../core/gui");
const helper = require("../core/helper");

registerFont("./assets/collage/NotoSansJP-Regular.ttf", {family: "Noto Sans JP"});

//縦書き
async function writeVertical(ctx, text, bubble){
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
        const custom_emoji_regex = /<a?:\w+:(\d+)>|(\p{Extended_Pictographic}\uFE0F?(?:\u200D\p{Extended_Pictographic}\uFE0F?)*)|([\s\S])/gu;

        let lines_info = [];
        let current_line = [];
        let current_height = 0;
        let match = null;
        let omit_line = null;

        //各行の作成
        ctx.font = `${font_size}px "Noto Sans JP, sans-serif"`;
        text = text.replace("ー", "｜").replace("～", "≀").replace("、", "﹅").replace("。", "°");
        while((match = custom_emoji_regex.exec(text)) !== null){
            let char_height = font_size;

            //普通の文字なら高さ計算
            if(match[3]){
                char_height = ctx.measureText(match[3]).actualBoundingBoxAscent + ctx.measureText(match[3]).actualBoundingBoxDescent;
            }

            //範囲外
            if(current_height+char_height > bubble.height){
                lines_info.push({line: current_line, height: current_height});
                current_line = [];
                current_height = 0;
            }

            //文字の接続
            current_line.push(match);
            current_height += char_height;

            //改行コード
            if(match[3]==="\n"){
                lines_info.push({line: current_line, height: current_height});
                current_line = [];
                current_height = 0;
            }
        }

        //最後の行を追加
        if(current_line.length > 0){
            lines_info.push({line: current_line, height: current_height});
            current_line = [];
            current_height = 0;
        }

        //範囲外の行を削除
        if(lines_info.length*font_size > bubble.width){
            lines_info = lines_info.slice(0, Math.ceil(bubble.width/font_size-2));
            ctx.font = `${bubble.font_size/2}px "Noto Sans JP, sans-serif"`;
            while((match = custom_emoji_regex.exec("以下略")) !== null){
                current_line.push(match);
                current_height += ctx.measureText(match[3]).actualBoundingBoxAscent + ctx.measureText(match[3]).actualBoundingBoxDescent;
            }
            omit_line = {line: current_line, height: current_height};
            lines_info.push(omit_line);
        }

        let current_x = bubble.x;
        let current_y = bubble.y;
        ctx.font = `${font_size}px "Noto Sans JP, sans-serif"`;

        //揃え位置の決定 x軸
        if(bubble.alignment_x === "left"){
            current_x = bubble.x + bubble.width - lines_info.length*font_size - font_size;
        }
        if(bubble.alignment_x === "center"){
            current_x = bubble.x + bubble.width - (bubble.width-lines_info.length*font_size)/2 - font_size;
        }
        if(bubble.alignment_x === "right"){
            current_x = bubble.x + bubble.width - font_size;
        }

        //各行の描画
        for(const line_info of lines_info){

            //省略行の判定
            if(line_info === omit_line){
                ctx.font = `${font_size/2}px "Noto Sans JP, sans-serif"`;
            }
            
            //揃え位置の決定 y軸
            if(bubble.alignment_y === "up"){
                current_y = bubble.y;
            }
            if(bubble.alignment_y === "center"){
                current_y = bubble.y + (bubble.height-line_info.height)/2;
            }
            if(bubble.alignment_y === "down"){
                current_y = bubble.y + bubble.height -line_info.height;
            }

            for(const match of line_info.line){

                //カスタム絵文字
                if(match[1]){
                    const custom_emoji = await loadImage(`https://cdn.discordapp.com/emojis/${match[1]}.png`);
                    ctx.drawImage(custom_emoji, current_x-font_size/4, current_y, font_size*3/2, font_size*3/2);
                    current_y += font_size;
                }

                //Unicode絵文字
                if(match[2]){
                    const unicode_emoji = await loadImage(twemoji.parse(match[2], {ext: ".png"}).match(/src="([^"]+)"/)[1]);
                    ctx.drawImage(unicode_emoji, current_x, current_y+font_size/4, font_size, font_size);
                    current_y += font_size;
                }

                //任意の1文字
                if(match[3]){
                    const char = match[3];
                    ctx.strokeText(char, current_x, current_y+font_size);
                    ctx.fillText(char, current_x, current_y+font_size);
                    current_y += ctx.measureText(char).actualBoundingBoxAscent + ctx.measureText(char).actualBoundingBoxDescent;
                }
            }

            current_x -= font_size;
        }

        return;
    }catch(e){
        throw new Error(`collage.js => writeVertical() \n ${e}`);
    }
}

//横書き
async function writeHorizontal(ctx, text, bubble){
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
        const custom_emoji_regex = /<a?:\w+:(\d+)>|(\p{Extended_Pictographic}\uFE0F?(?:\u200D\p{Extended_Pictographic}\uFE0F?)*)|([\s\S])/gu;

        let lines_info = [];
        let current_line = [];
        let current_width = 0;
        let match = null;
        let omit_line = null;

        //各行の作成
        ctx.font = `${font_size}px "Noto Sans JP, sans-serif"`;
        while((match = custom_emoji_regex.exec(text)) !== null){
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
            lines_info = lines_info.slice(0, Math.ceil(bubble.height/font_size-2));
            ctx.font = `${bubble.font_size/2}px "Noto Sans JP, sans-serif"`;
            while((match = custom_emoji_regex.exec("（以下略）")) !== null){
                current_line.push(match);
                current_width += ctx.measureText(match[3]).width;
            }
            omit_line = {line: current_line, width: current_width};
            lines_info.push(omit_line);
        }

        let current_x = bubble.x;
        let current_y = bubble.y;
        ctx.font = `${font_size}px "Noto Sans JP, sans-serif"`;

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
                    const unicode_emoji = await loadImage(twemoji.parse(match[2], {ext: ".png"}).match(/src="([^"]+)"/)[1]);
                    ctx.drawImage(unicode_emoji, current_x, current_y+font_size/4, font_size, font_size);
                    current_x += font_size;
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
        ctx.font = `${element.bubble.font_size}px "Noto Sans JP, sans-serif"`;
        ctx.fillStyle = "#000000";
        ctx.strokeStyle = "#FFFFFF";

        //縦書き
        if(element.bubble.vertical){
            await writeVertical(ctx, trigger.content, element.bubble);
        }

        //横書き
        if(!element.bubble.vertical){
            await writeHorizontal(ctx, trigger.content, element.bubble);
        }

        return canvas.toBuffer("image/png").toString("base64");
    }catch(e){
        throw new Error(`collage.js => makeMemeImage() \n ${e}`);
    }
}

//引用作成
async function makeQuoteImage(trigger, element){
    //白紙キャンバスの作成
    const canvas_width = element.canvas.width;
    const canvas_height = element.canvas.height;
    const canvas = createCanvas(canvas_width, canvas_height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas_width, canvas_height);

    //アイコンを描画
    const buble_icon_width = element.bubble.icon.width;
    const buble_icon_height = element.bubble.icon.height;
    const icon_size = (element.bubble.icon.width<element.bubble.icon.height) ? element.bubble.icon.width : element.bubble.icon.height;
    const org_icon = await loadImage(helper.getUserObj(trigger).displayAvatarURL({extension: "png", size: 256}));
    ctx.drawImage(org_icon, 0, (buble_icon_height-icon_size)/2, icon_size, icon_size);

    //アイコンをグレースケール化
    const ctx_icon = ctx.getImageData(0, 0, buble_icon_width, buble_icon_height);
    const ctx_icon_data = ctx_icon.data;
    for(let i=0; i<ctx_icon_data.length; i+=4){
        const r = ctx_icon_data[i];
        const g = ctx_icon_data[i+1];
        const b = ctx_icon_data[i+2];
        const rgb_average = (r+g+b)/3;
        ctx_icon_data[i] = ctx_icon_data[i+1] = ctx_icon_data[i+2] = (rgb_average-50)<0 ? 0 : (rgb_average-50);
    }
    ctx.putImageData(ctx_icon, 0, 0);

    //グラデーション背景を描画
    const gradient = ctx.createRadialGradient(0, buble_icon_height/2, 0, 0, buble_icon_height/2, buble_icon_width);
    gradient.addColorStop(0, "#FFFFFF00");
    gradient.addColorStop(1, "#1a1a1aFF");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas_width, canvas_height);

    //内容
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#000000";
    await writeHorizontal(ctx, trigger.content, element.bubble.content);

    //著者
    ctx.font = `${element.bubble.author.font_size}px "Noto Sans JP, sans-serif"`;
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#000000";
    await writeHorizontal(ctx, `- ${trigger.author.displayName}`, element.bubble.author);

    //公開日
    const create_time = helper.getCreatedAt(trigger);
    ctx.font = `${element.bubble.date.font_size}px "Noto Sans JP, sans-serif"`;
    ctx.fillStyle = "#FFFFFF90";
    ctx.strokeStyle = "#000000";
    await writeHorizontal(ctx, `${create_time.year}-${create_time.month}-${create_time.date}`, element.bubble.date);

    return canvas.toBuffer("image/png").toString("base64");
}

//コラ送信
async function sendCollage(trigger, map){
    try{
        const system_id = helper.getSystemId(trigger);
        const collage_original_json = map.get("collage_original_json");
        const emoji_name = system_id.split("_")[2];
        const react_user = (await trigger.guild.members.fetch(system_id.split("_")[3])).user;

        if(!trigger.cleanContent){
            return;
        }
        
        for(const element of collage_original_json){
            if(element.emoji === emoji_name){
                const collage_base64 = element.path.includes("/") ? await makeMemeImage(trigger, element) : await makeQuoteImage(trigger, element);
                await helper.sendGUI(trigger, gui.create(map, "collage_view", {"{{__COLLAGE_NAME__}}":element.path.split("/").slice(-1)[0], "{{__COLLAGE_BASE64__}}":collage_base64, "{{__REACT_USER_NAME__}}":react_user.displayName, "{{__REACT_USER_ICON__}}":react_user.displayAvatarURL()}));
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
        if(system_id.startsWith("collage_emoji")){
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