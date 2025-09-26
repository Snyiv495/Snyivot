/*****************
    collage.js
    スニャイヴ
    2025/09/27
*****************/

module.exports = {
    exe : execute
}

const {createCanvas, loadImage, registerFont} = require("canvas");
const gui = require("../core/gui");
const helper = require("../core/helper");

registerFont("./assets/collage/NotoSansJP-Regular.ttf", {family: "Noto Sans JP"});

//縦書き
function writeVertical(ctx, font_family, bubble, text){
    const lines = text.split(/、\n|。\n|、|。|\n/);
    const widest_line = lines.reduce((wider_line, line) => {return (ctx.measureText(line).width > ctx.measureText(wider_line).width) ? line : wider_line;}, "");
    let font_size = 96;

    //x軸のフォントサイズを制限
    for(let i=font_size; i>0; i-=2){
        ctx.font = `${i}px "${font_family}"`;
        if((lines.length*i*1.2) < bubble.width){
            font_size = i;
            break;
        }
    }

    //y軸のフォントサイズを制限
    for(let i=font_size; i>0; i-=2){
        ctx.font = `${i}px "${font_family}"`;
        if(ctx.measureText(widest_line).width < bubble.height){
            font_size = i;
            break;
        }
    }

    //テキストの表示位置を決定
    let x = bubble.x - (bubble.width - lines.length*font_size*1.2)/2 - font_size;
    for(const line of lines){
        let y = bubble.y + (bubble.height - ctx.measureText(line).width)/2;
        for(let i=0; i<line.length; i++){
            const char = line[i];
            ctx.fillText(line[i], x, y);
            y += font_size;
        }
        x -= font_size*1.2;
    }

    return;
}

//横書き
function writeHorizontal(ctx, font_family, bubble, text){
    const lines = text.split(/、\n|。\n|、|。|\n/);
    const widest_line = lines.reduce((wider_line, line) => {return (ctx.measureText(line).width > ctx.measureText(wider_line).width) ? line : wider_line;}, "");
    let font_size = 96;

    //x軸のフォントサイズを制限
    for(let i=font_size; i>0; i-=2){
        ctx.font = `${i}px "${font_family}"`;
        if(ctx.measureText(widest_line).width < bubble.width){
            font_size = i;
            break;
        }
    }

    //y軸のフォントサイズを制限
    for(let i=font_size; i>0; i-=2){
        ctx.font = `${i}px "${font_family}"`;
        if((lines.length*i*1.2) < bubble.height){
            font_size = i;
            break;
        }
    }

    //テキストの表示位置を決定
    let y = bubble.y + (bubble.height - (lines.length*font_size*1.2))/2;
    for(const line of lines){
        const x = bubble.x + (bubble.width - ctx.measureText(line).width)/2;
        ctx.fillText(line, x, y);
        y += font_size * 1.2;
    }

    return;
}

//コラ作成
async function makeMemeImage(trigger, element){
    try{
        const collage_original_image = await loadImage(element.path);
        const canvas = createCanvas(collage_original_image.width, collage_original_image.height);
        const ctx = canvas.getContext("2d");
        const font_family = "Noto Sans JP, sans-serif";
        const text = trigger.cleanContent;

        ctx.drawImage(collage_original_image, 0, 0);
        ctx.font = `16px "${font_family}"`;
        ctx.fillStyle = "000000";
        ctx.textBaseline = "top";

        //縦書き
        if(element.bubble.vertical){
            writeVertical(ctx, font_family, element.bubble, text);
        }

        //横書き
        if(!element.bubble.vertical){
            writeHorizontal(ctx, font_family, element.bubble, text);
        }

        return canvas.toBuffer("image/png").toString("base64");
    }catch(e){
        throw new Error(`collage.js => makeMemeImage() \n ${e}`);
    }
}

async function makeQuoteImage(trigger, element){
    //白紙キャンバスの作成
    const width = element.canvas.width;
    const height = element.canvas.height;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);

    //アイコンを白黒で描画
    const icon_size = width*2/5;
    const org_icon = await loadImage(trigger.author.displayAvatarURL({extension: "png", size: 256}));
    ctx.drawImage(org_icon, 0, (height-icon_size)/2, icon_size, icon_size);
    const ctx_icon = ctx.getImageData(0, 0, icon_size, height);
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
    const gradient = ctx.createRadialGradient(0, height/2, 0, 0, height/2, width*2/5);
    gradient.addColorStop(0, "#FFFFFF00");
    gradient.addColorStop(1, "#1a1a1aFF");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    //内容
    ctx.font = "24px 'sans-serif'";
    ctx.fillStyle = "#111";
    const textX = width/2;
    const textY = height/2;
    const maxWidth = width;

    await drawTextWithEmojis(ctx, trigger.content, textX, textY, maxWidth);

    //付録
    const font_size = 24;
    const user_name = `- ${trigger.author.displayName}`;
    const create_time = helper.getCreatedAt(trigger);
    const timestamp  = `${create_time.year}-${create_time.month}-${create_time.date}`;
    ctx.font = `bold ${font_size}px "Noto Sans JP, sans-serif"`;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(user_name, width*7/10-(user_name.length/2)*font_size, height-font_size*3);
    ctx.fillText(timestamp, width*7/10-(timestamp.length/2)*font_size, height-font_size*2);


    return canvas.toBuffer("image/png").toString("base64");
}

async function drawTextWithEmojis(ctx, text, x, y, maxWidth) {
    let offsetX = x;
    const lineHeight = 32;

    const regex = /<a?:\w+:(\d+)>|([\s\S])/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        if (match[1]) {
        // カスタム絵文字
        const emojiId = match[1];
        const isAni = match[0].startsWith("<a:");
        const ext = isAni ? "gif" : "png";
        const url = `https://cdn.discordapp.com/emojis/${emojiId}.${ext}`;
        try {
            const img = await loadImage(url);
            const size = 28;
            ctx.drawImage(img, offsetX, y - size + 8, size, size);
            offsetX += size + 4;
        } catch (e) {
            console.error("カスタム絵文字描画エラー:", e);
        }
        } else if (match[2]) {
        const ch = match[2];
        ctx.fillText(ch, offsetX, y);
        offsetX += ctx.measureText(ch).width;
        }

        // 折り返し
        if (offsetX > x + maxWidth) {
        offsetX = x;
        y += lineHeight;
        }
    }
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

//コラ画像作成実行
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