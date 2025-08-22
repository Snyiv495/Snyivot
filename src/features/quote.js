/*****************
    quote.js
    スニャイヴ
    2025/08/22
*****************/

module.exports = {
    exe : execute
}
const path = require("node:path");
const {AttachmentBuilder} = require("discord.js");
const {createCanvas, loadImage, registerFont} = require("canvas");
const helper = require('../core/helper');

// 日本語フォントを使う場合（任意）
registerFont(path.resolve(__dirname, "../../assets/fonts/NotoSansJP-Regular.ttf"), {
  family: "Noto Sans JP",
});

async function renderTextOnImage(baseImagePath, text, opts = {}) {
    baseImagePath = require("node:path").resolve(__dirname, "../../assets/quote/shark.png");
    opts = {
        fontSize: 44,
        lineHeight: 62,
        padding: 50,
    }
    const {
        fontFamily = "Noto Sans JP, sans-serif",
        fontSize = 42,         // px
        lineHeight = 56,       // px
        padding = 40,          // px
        maxLines = 10,         // 安全のため上限
        textColor = "#111",
        strokeColor = "rgba(255,255,255,0.75)", // 文字の縁取りで視認性UP
        strokeWidth = 4,
        shadow = true,
    } = opts;

    const img = await loadImage(baseImagePath);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");

    // 背景描画
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // テキスト設定
    ctx.font = `${fontSize}px "${fontFamily}"`;
    ctx.fillStyle = textColor;
    ctx.textBaseline = "top";

    // 影（任意）
    if (shadow) {
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
    }

    // 折り返し
    const maxWidth = img.width - padding * 2;
    const lines = wrapText(ctx, text, maxWidth, maxLines);

    // 影はストロークだけにしたいので fill の前に影を消す場合はここで調整
    // 縁取り → 本文の順に描く
    if (strokeWidth > 0) {
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
    }

    let y = padding;
    for (const line of lines) {
        if (strokeWidth > 0) ctx.strokeText(line, padding, y);
        ctx.fillText(line, padding, y);
        y += lineHeight;
    }

    const buffer = canvas.toBuffer("image/png");
    const file = new AttachmentBuilder(buffer, { name: "quote.png" });
    return file;
}

/**
 * Canvas で簡易改行（単語ベース＋日本語の連結対応）
 */
function wrapText(ctx, text, maxWidth, maxLines) {
    const result = [];
    const tokens = tokenizeForWrap(text);

    let line = "";
    for (const token of tokens) {
        const next = line + token;
        if (ctx.measureText(next).width <= maxWidth) {
        line = next;
        continue;
        }

        if (line) {
        result.push(line);
        if (result.length >= maxLines) {
            result[result.length - 1] = appendEllipsis(ctx, result[result.length - 1], maxWidth);
            return result;
        }
        line = token.trimStart(); // 行頭スペース対策
        } else {
        // 1トークンが長すぎる場合は強制分割
        line = forceBreak(ctx, token, maxWidth);
        result.push(line);
        if (result.length >= maxLines) {
            result[result.length - 1] = appendEllipsis(ctx, result[result.length - 1], maxWidth);
            return result;
        }
        line = "";
        }
    }
    if (line) result.push(line);
    return result.slice(0, maxLines);
}

function tokenizeForWrap(str) {
    // 英単語・数字は塊に、日本語は1文字ずつ扱う簡易トークナイザ
    // 改行も尊重
    const out = [];
    const re = /(\r?\n)|([A-Za-z0-9_]+)|([^\sA-Za-z0-9_])/g;
    let m;
    while ((m = re.exec(str))) {
        if (m[1]) out.push("\n");
        else if (m[2]) out.push(m[2] + " ");
        else if (m[3]) out.push(m[3]);
    }
    return out;
}

function forceBreak(ctx, token, maxWidth) {
    // 1トークンがmaxWidthを超える場合に文字単位で切る
    let line = "";
    for (const ch of token) {
        const next = line + ch;
        if (ctx.measureText(next).width <= maxWidth) {
        line = next;
        } else {
        break;
        }
    }
    return line || token[0] || "";
}

function appendEllipsis(ctx, line, maxWidth) {
    const ell = "…";
    if (ctx.measureText(line + ell).width <= maxWidth) return line + ell;
    // 省略記号を収まるまで削る
    while (line.length && ctx.measureText(line + ell).width > maxWidth) {
        line = line.slice(0, -1);
    }
    return line + ell;
}

async function robot(trigger, map){
    const file = await renderTextOnImage(null, trigger.cleanContent, null);
    await helper.sendGUI(trigger, {files: [file]});
    return;
}

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