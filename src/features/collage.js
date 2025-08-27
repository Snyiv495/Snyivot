/*****************
    collage.js
    スニャイヴ
    2025/08/27
*****************/

module.exports = {
    exe : execute
}

const {AttachmentBuilder} = require("discord.js");
const {createCanvas, loadImage, registerFont} = require("canvas");
const helper = require('../core/helper');

registerFont("./assets/collage/NotoSansJP-Regular.ttf", {family: "Noto Sans JP"});

//縦書き
function writeVertical(ctx, font_family, bubble, text){
    const lines = text.split(/、|\n/);
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
    const lines = text.split(/、|\n/);
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
async function makeCollage(text, collage_original_path, bubble){
    try{
        const collage_original_image = await loadImage(collage_original_path);
        const canvas = createCanvas(collage_original_image.width, collage_original_image.height);
        const ctx = canvas.getContext("2d");
        const font_family = "Noto Sans JP, sans-serif";

        ctx.drawImage(collage_original_image, 0, 0);
        ctx.font = `16px "${font_family}"`;
        ctx.fillStyle = "000000";
        ctx.textBaseline = "top";

        //縦書き
        if(bubble.vertical){
            writeVertical(ctx, font_family, bubble, text);
        }

        //横書き
        if(!bubble.vertical){
            writeHorizontal(ctx, font_family, bubble, text);
        }

        return new AttachmentBuilder(canvas.toBuffer("image/png"), {name: "collage.png"});
    }catch(e){
        throw new Error(`collage.js => makeCollage() \n ${e}`);
    }
}

//コラ送信
async function sendCollage(trigger, map){
    try{
        const system_id = helper.getSystemId(trigger);
        const collage_original_json = map.get("collage_original_json");
        const emoji_name = system_id.split("_")[2];
        
        for(const element of collage_original_json){
            if(element.emoji === emoji_name){
                const file = await makeCollage(trigger.cleanContent, element.path, element.bubble);
                await helper.sendGUI(trigger, {files: [file]});
                return;
            }
        }
    }catch(e){
        throw new Error(`collage.js => sendCollage() \n ${e}`);
    }

    throw new Error(`collage.js => sendCollage() \n not define emoji : ${emoji_name}`);
}

//コラージュ実行
async function execute(trigger, map){
    try{
        const system_id = helper.getSystemId(trigger);

        //延期の送信
        if(helper.isInteraction(trigger) && !system_id.includes("modal")){
            await helper.sendDefer(trigger);
        }

        //引用送信
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