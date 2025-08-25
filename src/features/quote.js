/*****************
    quote.js
    スニャイヴ
    2025/08/25
*****************/

module.exports = {
    exe : execute
}

const {AttachmentBuilder} = require("discord.js");
const {createCanvas, loadImage, registerFont} = require("canvas");
const helper = require('../core/helper');

registerFont("./assets/quote/NotoSansJP-Regular.ttf", {family: "Noto Sans JP"});

async function makeQuote(text, quote_path, bubble){
    const quote_image = await loadImage(quote_path);
    const canvas = createCanvas(quote_image.width, quote_image.height);
    const ctx = canvas.getContext("2d");
    const font_family = "Noto Sans JP, sans-serif";
    let font_size = 96;

    ctx.drawImage(quote_image, 0, 0);
    ctx.font = `${font_size}px "${font_family}"`;
    ctx.fillStyle = "000000";
    ctx.textBaseline = "top";

    const lines = text.split(/、|\n/);
    const widest_line = lines.reduce((wider_line, line) => {return (ctx.measureText(line).width > ctx.measureText(wider_line).width) ? line : wider_line;}, "");

    //x軸の最大幅を制限
    for(let i=font_size; i>0; i-=2){
        ctx.font = `${i}px "${font_family}"`;
        if(ctx.measureText(widest_line).width < bubble.width){
            font_size = i;
            break;
        }
    }

    //y軸の最大幅を制限
    for(let i=font_size; i>0; i-=2){
        ctx.font = `${i}px "${font_family}"`;
        if((lines.length*i*1.2) < bubble.height){
            font_size = i;
            break;
        }
    }

    //テキストの表示位置を決定
    let y = bubble.y + (bubble.height - (lines.length*font_size*1.2)) / 2;
    for(const line of lines) {
        const x = bubble.x + (bubble.width - ctx.measureText(line).width) / 2;
        ctx.fillText(line, x, y);
        y += font_size * 1.2;
    }

    return new AttachmentBuilder(canvas.toBuffer("image/png"), {name: "quote.png"});
}

//感想ロボット
async function robot(trigger, map){
    const bubble = {
        x: 950,
        y: 250,
        width: 530,
        height: 300
    };
    const file = await makeQuote(trigger.cleanContent, "./assets/quote/robot.png", bubble);
    await helper.sendGUI(trigger, {files: [file]});
    return;
}

//怖がらせるサメ
async function shark(trigger, map){
    const bubble = {
        x: 50,
        y: 50,
        width: 260,
        height: 115
    };
    const file = await makeQuote(trigger.cleanContent, "./assets/quote/shark.png", bubble);
    await helper.sendGUI(trigger, {files: [file]});
    return;
}

//引用実行
async function execute(trigger, map, emoji_name=null){
    try{
        const system_id = helper.getSystemId(trigger);

        //延期の送信
        if(helper.isInteraction(trigger) && !system_id.includes("modal")){
            await helper.sendDefer(trigger);
        }

        //感想ロボット
        if(emoji_name === "🤖"){
            await robot(trigger, map);
            return;
        }

        //怖がらせるサメ
        if(emoji_name === "🦈"){
            await shark(trigger, map);
            return;
        }

        //GUI送信
        await helper.sendGUI(trigger, gui.create(map, system_id));
        return;

    }catch(e){
        throw new Error(`quote.js => execute() \n ${e}`);
    }
}