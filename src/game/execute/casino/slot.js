/*****************
    slot.js
    スニャイヴ
    2024/12/26
*****************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder} = require('discord.js');
const db = require('../../db');

//スロット情報の取得
function getSlotInfo(interaction, map){
    /*
    state 0 : 初期状態　🗡️も💎も出ない　絵柄を揃えると10%でstate1へ
    state 1 : 🗡️が狙える状態　🗡️を揃えると10%でstate2へ　絵柄を外すと25%でstate0へ
    state 2 : 🗡️と💎が狙える状態　💎を揃えるとstate3へ　常に25%でstate0へ
    state 3~: ボーナス状態　🛡️🏹しか存在しないスロット　継続率(100-state^2)%　常にstate+1　終了時state0へ
    */
    const info = map.has(`casino_slot_${interaction.user.id}`) ? map.get(`casino_slot_${interaction.user.id}`) : {
        state: 0,
        bet: 0,
        left_line :   ["💎", "🗡️", "💊", "🏹", "🛡️", "🗡️", "🔁", "🛡️", "🏹", "🔁"],
        center_line : ["💊", "🔁", "💎", "🛡️", "💊", "🔁", "🗡️", "🏹", "🛡️", "🏹"],
        right_line :  ["🔁", "🛡️", "🏹", "🗡️", "🔁", "💊", "🛡️", "💎", "💊", "🗡️"],
        stop: null,
        left_stop: false,
        center_stop: false,
        right_stop: false,
        left_idx: 0,
        center_idx: 0,
        right_idx: 0,
        interval: null,
        count_interval: 0,
        again: false,
        hit: null,
        payout: 0
    }
    try{clearInterval(info.interval);}catch(e){};
    info.interval = null;
    info.count_interval = 0;
    info.again = false
    info.payout = 0;

    return info;
}

//スロットの作成
async function createSlot(slot_info, coins, jackpot){
    const embeds = [];
    const components = [];

    const embed = new EmbedBuilder();
    const buttons = new ActionRowBuilder();

    switch(slot_info.state){
        case 0: embed.setTitle("スロットなのだ！"); embed.setColor(0x000000); break;
        case 1: embed.setTitle("流れが来てる気がするのだ！"); embed.setColor(0x0000FF); break;
        case 2: embed.setTitle("大当たりの予感...！"); embed.setColor(0xFFFF00); break;
        default: embed.setTitle(`JACKPOTおめでとうなのだ！\nボーナスタイムなのだ！\n(継続率：${100-(slot_info.state**2)}%)`); embed.setColor(0xFFFFFF); break;
    }

    embed.setDescription(`|💎|💎|💎|:${jackpot}　|💊|🆓|🆓|:002　|🛡️|🛡️|🛡️|:010\n　\n|🗡️|🗡️|🗡️|:100　|🏹|🏹|🏹|:015　|🔁|🔁|🔁|:もう1回\n--------------------`);
    embed.addFields({name: `| ${slot_info.left_line[slot_info.left_idx]} | ${slot_info.center_line[slot_info.center_idx]} | ${slot_info.right_line[slot_info.right_idx]} |\n| ${slot_info.left_line[(slot_info.left_idx+1)%10]} | ${slot_info.center_line[(slot_info.center_idx+1)%10]} | ${slot_info.right_line[(slot_info.right_idx+1)%10]} |\n| ${slot_info.left_line[(slot_info.left_idx+2)%10]} | ${slot_info.center_line[(slot_info.center_idx+2)%10]} | ${slot_info.right_line[(slot_info.right_idx+2)%10]} |`, value: "--------------------", inline: false});
    embed.setFooter({text: `CREDIT:${coins}, \tBET:${slot_info.bet}, \tPAYOUT:${slot_info.payout}`});
    embeds.push(embed);

    if(!slot_info.bet){
        const bet_1 = new ButtonBuilder();
        const bet_2 = new ButtonBuilder();
        const bet_3 = new ButtonBuilder();
        const home = new ButtonBuilder();
        const quit = new ButtonBuilder();

        bet_1.setLabel("1bet");
        bet_1.setEmoji("🪙");
        bet_1.setCustomId("game_casino_slot_1bet_exe");
        bet_1.setStyle(ButtonStyle.Primary);
        coins<1 ? bet_1.setDisabled(true) : bet_1.setDisabled(false);
        buttons.addComponents(bet_1);

        bet_2.setLabel("2bet");
        bet_2.setEmoji("💰");
        bet_2.setCustomId("game_casino_slot_2bet_exe");
        bet_2.setStyle(ButtonStyle.Primary);
        coins<2 ? bet_2.setDisabled(true) : bet_2.setDisabled(false);
        buttons.addComponents(bet_2);

        bet_3.setLabel("3bet");
        bet_3.setEmoji("💴");
        bet_3.setCustomId("game_casino_slot_3bet_exe");
        bet_3.setStyle(ButtonStyle.Primary);
        coins<3 ? bet_3.setDisabled(true) : bet_3.setDisabled(false);
        buttons.addComponents(bet_3);

        home.setLabel("ゲーム選択");
        home.setEmoji("🎮");
        home.setCustomId("game_home");
        home.setStyle(ButtonStyle.Secondary);
        buttons.addComponents(home);

        quit.setLabel("終わる");
        quit.setEmoji("⚠️");
        quit.setCustomId("quit");
        quit.setStyle(ButtonStyle.Danger);
        quit.setDisabled(false);
        buttons.addComponents(quit);
    }else{
        const left = new ButtonBuilder();
        const center = new ButtonBuilder();
        const right = new ButtonBuilder();
        const again = new ButtonBuilder();
        const quit = new ButtonBuilder();

        left.setLabel(" ");
        left.setEmoji("🛑");
        left.setCustomId("game_casino_slot_left_exe");
        left.setStyle(ButtonStyle.Primary);
        slot_info.left_stop ? left.setDisabled(true) : left.setDisabled(false);
        buttons.addComponents(left);

        center.setLabel(" ");
        center.setEmoji("🛑");
        center.setCustomId("game_casino_slot_center_exe");
        center.setStyle(ButtonStyle.Primary);
        slot_info.center_stop ? center.setDisabled(true) : center.setDisabled(false);
        buttons.addComponents(center);

        right.setLabel(" ");
        right.setEmoji("🛑");
        right.setCustomId("game_casino_slot_right_exe");
        right.setStyle(ButtonStyle.Primary);
        slot_info.right_stop ? right.setDisabled(true) : right.setDisabled(false);
        buttons.addComponents(right);

        if(slot_info.left_stop && slot_info.center_stop && slot_info.right_stop){
            slot_info.again ? again.setLabel("もう一回！") : again.setLabel("続ける");
            again.setEmoji("🔂");
            again.setCustomId("game_casino_slot_again_exe");
            again.setStyle(ButtonStyle.Success);
            buttons.addComponents(again);

            quit.setLabel("終わる");
            quit.setEmoji("⚠️");
            quit.setCustomId("quit");
            quit.setStyle(ButtonStyle.Danger);
            quit.setDisabled(false);
            buttons.addComponents(quit);
        }
    }
    
    components.push(buttons);

    return {content: "", files: [], embeds: embeds, components: components, ephemeral: true};
}

//スロットの回転
async function turnSlot(interaction, slot_info, map, coins, jackpot){
    slot_info.interval = setInterval(async () => {
        slot_info.left_idx = slot_info.left_stop ? slot_info.left_idx : (slot_info.left_idx+1)%10;
        slot_info.center_idx = slot_info.center_stop ? slot_info.center_idx : (slot_info.center_idx+9)%10;
        slot_info.right_idx = slot_info.right_stop ? slot_info.right_idx : (slot_info.right_idx+1)%10;
        slot_info.count_interval++;

        await interaction.editReply(await createSlot(slot_info, coins, jackpot));

        if(slot_info.count_interval > 20){
            clearInterval(slot_info.interval);
            switch(true){
                case !slot_info.left_stop : slot_info.left_stop = true; break;
                case !slot_info.center_stop : slot_info.center_stop = true; break;
                case !slot_info.right_stop : slot_info.right_stop = true; break;
                default : break;
            }
            map.set(`casino_slot_${interaction.user.id}`, slot_info);
            await execute(interaction, map);
            return 0;
        }
    }, 500);

    return 0;
}

//スロットの操作
async function controlSlot(slot_info){
    //斜めの絵柄操作
    if(slot_info.bet===3){
        if(slot_info.left_line[slot_info.left_idx] === slot_info.center_line[(slot_info.center_idx+1)%10] && slot_info.left_line[slot_info.right_idx] === slot_info.right_line[(slot_info.right_idx+2)%10]){
            if(slot_info.state<2 && slot_info.left_line[slot_info.left_idx]==="💎"){
                switch(slot_info.stop){
                    case "left" : {slot_info.left_idx = (slot_info.left_idx+1)%10; break;}
                    case "center" : {slot_info.center_idx = (slot_info.center_idx+9)%10; break;}
                    case "right" : {slot_info.right_idx = (slot_info.right_idx+1)%10; break;}
                    default: break;
                }
            }else if(slot_info.state<1 && slot_info.left_line[slot_info.left_idx]==="🗡️"){
                switch(slot_info.stop){
                    case "left" : {slot_info.left_idx = (slot_info.left_idx+1)%10; break;}
                    case "center" : {slot_info.center_idx = (slot_info.center_idx+9)%10; break;}
                    case "right" : {slot_info.right_idx = (slot_info.right_idx+1)%10; break;}
                    default: break;
                }
            }
        }
        if(slot_info.left_line[(slot_info.left_idx+2)%10] === slot_info.center_line[(slot_info.center_idx+1)%10] && slot_info.left_line[(slot_info.left_idx+2)%10] === slot_info.right_line[slot_info.right_idx]){
            if(slot_info.state<2 && slot_info.left_line[(slot_info.left_idx+2)%10]==="💎"){
                switch(slot_info.stop){
                    case "left" : {slot_info.left_idx = (slot_info.left_idx+1)%10; break;}
                    case "center" : {slot_info.center_idx = (slot_info.center_idx+9)%10; break;}
                    case "right" : {slot_info.right_idx = (slot_info.right_idx+1)%10; break;}
                    default: break;
                }
            }else if(slot_info.state<1 && slot_info.left_line[(slot_info.left_idx+2)%10]==="🗡️"){
                switch(slot_info.stop){
                    case "left" : {slot_info.left_idx = (slot_info.left_idx+1)%10; break;}
                    case "center" : {slot_info.center_idx = (slot_info.center_idx+9)%10; break;}
                    case "right" : {slot_info.right_idx = (slot_info.right_idx+1)%10; break;}
                    default: break;
                }
            }
        }
    }

    //上下行の絵柄操作
    if(slot_info.bet===3 || slot_info.bet===2){
        if(slot_info.left_line[slot_info.left_idx] == slot_info.center_line[slot_info.center_idx] && slot_info.left_line[slot_info.left_idx] == slot_info.right_line[slot_info.right_idx]){
            if(slot_info.state<2 && slot_info.left_line[slot_info.left_idx]==="💎"){
                switch(slot_info.stop){
                    case "left" : {slot_info.left_idx = (slot_info.left_idx+1)%10; break;}
                    case "center" : {slot_info.center_idx = (slot_info.center_idx+9)%10; break;}
                    case "right" : {slot_info.right_idx = (slot_info.right_idx+1)%10; break;}
                    default: break;
                }
            }else if(slot_info.state<1 && slot_info.left_line[slot_info.left_idx]==="🗡️"){
                switch(slot_info.stop){
                    case "left" : {slot_info.left_idx = (slot_info.left_idx+1)%10; break;}
                    case "center" : {slot_info.center_idx = (slot_info.center_idx+9)%10; break;}
                    case "right" : {slot_info.right_idx = (slot_info.right_idx+1)%10; break;}
                    default: break;
                }
            }
        }
        if(slot_info.left_line[(slot_info.left_idx+2)%10] == slot_info.center_line[(slot_info.center_idx+2)%10] && slot_info.left_line[(slot_info.left_idx+2)%10] == slot_info.right_line[(slot_info.right_idx+2)%10]){
            if(slot_info.state<2 && slot_info.left_line[(slot_info.left_idx+2)%10]==="💎"){
                switch(slot_info.stop){
                    case "left" : {slot_info.left_idx = (slot_info.left_idx+1)%10; break;}
                    case "center" : {slot_info.center_idx = (slot_info.center_idx+9)%10; break;}
                    case "right" : {slot_info.right_idx = (slot_info.right_idx+1)%10; break;}
                    default: break;
                }
            }else if(slot_info.state<1 && slot_info.left_line[(slot_info.left_idx+2)%10]==="🗡️"){
                switch(slot_info.stop){
                    case "left" : {slot_info.left_idx = (slot_info.left_idx+1)%10; break;}
                    case "center" : {slot_info.center_idx = (slot_info.center_idx+9)%10; break;}
                    case "right" : {slot_info.right_idx = (slot_info.right_idx+1)%10; break;}
                    default: break;
                }
            }
        }
    }

    //中央行の絵柄判定
    if(slot_info.left_line[(slot_info.left_idx+1)%10] == slot_info.center_line[(slot_info.center_idx+1)%10] && slot_info.left_line[(slot_info.left_idx+1)%10] == slot_info.right_line[(slot_info.right_idx+1)%10]){
        if(slot_info.state<2 && slot_info.left_line[(slot_info.left_idx+1)%10]==="💎"){
            switch(slot_info.stop){
                case "left" : {slot_info.left_idx = (slot_info.left_idx+1)%10; break;}
                case "center" : {slot_info.center_idx = (slot_info.center_idx+9)%10; break;}
                case "right" : {slot_info.right_idx = (slot_info.right_idx+1)%10; break;}
                default: break;
            }
        }else if(slot_info.state<1 && slot_info.left_line[(slot_info.left_idx+1)%10]=="🗡️"){
            switch(slot_info.stop){
                case "left" : {slot_info.left_idx = (slot_info.left_idx+1)%10; break;}
                case "center" : {slot_info.center_idx = (slot_info.center_idx+9)%10; break;}
                case "right" : {slot_info.right_idx = (slot_info.right_idx+1)%10; break;}
                default: break;
            }
        }
    }

    return slot_info;    
}

//Jackpot当選報告
async function reportJackpot(winner, jackpot){
    const embeds = [];
    const files = [];

    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    embed.setTitle("JACKPOT当選なのだ！");
    embed.setThumbnail("attachment://icon.png");
    embed.setDescription(`${winner}さんがJackpotを引き当てたのだ！\nおめでとうなのだ！`);
    embed.setColor(0x00FF00);
    embed.setFooter({text: `当選額：${jackpot}`});
    embeds.push(embed);
    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/bunny.png");
    files.push(attachment);

    return {content: "", files: [], embeds: embeds, components: [], ephemeral: false};
}

//払い戻し計算
async function calcPayout(slot_info, jackpot, pattern){
    switch(pattern){
        case "💎" : {
            slot_info.payout += jackpot;
            slot_info.hit = pattern;
            break;
        }
        case "🗡️" : {
            slot_info.payout += 100;
            slot_info.hit = (slot_info.hit!="💎") ? pattern : slot_info.hit;
            break;
        }
        case "🏹" : {
            slot_info.payout += 15;
            slot_info.hit = ((slot_info.hit!="💎")&&(slot_info.hit!="🗡️")) ? pattern : slot_info.hit;
            break;
        }
        case "🛡️" : {
            slot_info.payout += 10;
            slot_info.hit = ((slot_info.hit!="💎")&&(slot_info.hit!="🗡️")) ? pattern : slot_info.hit;
            break;
        }
        case "💊" : {
            slot_info.payout += 2;
            slot_info.hit = ((slot_info.hit!="💎")&&(slot_info.hit!="🗡️")) ? pattern : slot_info.hit;
            break;
        }
        case "🔁" : {
            slot_info.again = true;
            slot_info.hit = ((slot_info.hit!="💎")&&(slot_info.hit!="🗡️")) ? pattern : slot_info.hit;
            break;
        }
    }

    return slot_info;
}

//状態遷移
function transState(slot_info){
    const rand = Math.floor(Math.random()*100);

    if(slot_info.state===0 && slot_info.hit && rand<10){
        slot_info.state = 1;
    }else if(slot_info.state===1 && slot_info.hit===null && rand<25){
        slot_info.state = 0;
    }else if(slot_info.state===1 && slot_info.hit==="🗡️" && rand<10){
        slot_info.state = 2;
    }else if(slot_info.state===2 && slot_info.hit!="💎" && rand<25){
        slot_info.state = 0;
    }else if(slot_info.state===2 && slot_info.hit!="💎"){
        slot_info.state = 3;
    }else if(slot_info.state>2){
        slot_info.state = (rand>slot_info.state**2) ? slot_info.state+1 : 0;
    }

    return slot_info;
}

//結果の確認
async function checkResult(slot_info, jackpot){
    //斜めの絵柄判定
    if(slot_info.bet == 3){
        if(slot_info.left_line[slot_info.left_idx] == slot_info.center_line[(slot_info.center_idx+1)%10] && slot_info.left_line[slot_info.left_idx] == slot_info.right_line[(slot_info.right_idx+2)%10]){
            slot_info = await calcPayout(slot_info, jackpot, slot_info.left_line[slot_info.left_idx]);
        }
        if(slot_info.left_line[(slot_info.left_idx+2)%10] == slot_info.center_line[(slot_info.center_idx+1)%10] && slot_info.left_line[(slot_info.left_idx+2)%10] == slot_info.right_line[slot_info.right_idx]){
            slot_info = await calcPayout(slot_info, jackpot, slot_info.left_line[(slot_info.left_idx+2)%10]);
        }
    }

    //上下行の絵柄判定
    if(slot_info.bet == 3 || slot_info.bet == 2){
        if(slot_info.left_line[slot_info.left_idx] == slot_info.center_line[slot_info.center_idx] && slot_info.left_line[slot_info.left_idx] == slot_info.right_line[slot_info.right_idx]){
            slot_info = await calcPayout(slot_info, jackpot, slot_info.left_line[(slot_info.left_idx)]);
        }
        if(slot_info.left_line[(slot_info.left_idx+2)%10] == slot_info.center_line[(slot_info.center_idx+2)%10] && slot_info.left_line[(slot_info.left_idx+2)%10] == slot_info.right_line[(slot_info.right_idx+2)%10]){
            slot_info = await calcPayout(slot_info, jackpot, slot_info.left_line[(slot_info.left_idx+2)%10]);
        }
        if(slot_info.left_line[slot_info.left_idx]=="💊"){
            slot_info = await calcPayout(slot_info, jackpot, slot_info.left_line[(slot_info.left_idx)]);
        }
        if(slot_info.left_line[(slot_info.left_idx+2)%10]=="💊"){
            slot_info = await calcPayout(slot_info, jackpot, slot_info.left_line[(slot_info.left_idx+2)%10]);
        }
    }

    //中央行の絵柄判定
    if(slot_info.left_line[(slot_info.left_idx+1)%10] == slot_info.center_line[(slot_info.center_idx+1)%10] && slot_info.left_line[(slot_info.left_idx+1)%10] == slot_info.right_line[(slot_info.right_idx+1)%10]){
        slot_info = await calcPayout(slot_info, jackpot, slot_info.left_line[(slot_info.left_idx+1)%10]);
    }
    if(slot_info.left_line[(slot_info.left_idx+1)%10]=="💊"){
        slot_info = await calcPayout(slot_info, jackpot, slot_info.left_line[(slot_info.left_idx+1)%10]);
    }

    return slot_info;
}

//初期化
function initialize(slot_info){
    const rand = Math.floor(Math.random()*100);

    slot_info.bet = slot_info.again ? slot_info.bet : 0;
    slot_info.left_stop = slot_info.state>2 ? true : false;
    slot_info.right_stop = slot_info.state>2 ? true : false;
    slot_info.center_stop = false;
    slot_info.left_line = slot_info.state>2 ? rand<50 ? ["🛡️", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁"] : ["🏹", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁"] : ["💎", "🗡️", "💊", "🏹", "🛡️", "🗡️", "🔁", "🛡️", "🏹", "🔁"];
    slot_info.right_line = slot_info.state>2 ? rand<50 ? ["🛡️", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁"] : ["🏹", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁", "🔁"] : ["🔁", "🛡️", "🏹", "🗡️", "🔁", "💊", "🛡️", "💎", "💊", "🗡️"];
    slot_info.center_line = slot_info.state>2 ? ["🛡️", "🏹", "🛡️", "🏹", "🛡️", "🏹", "🛡️", "🏹", "🛡️", "🏹"] : ["💊", "🔁", "💎", "🛡️", "💊", "🔁", "🗡️", "🏹", "🛡️", "🏹"];
    slot_info.left_idx = slot_info.state>2 ? 9 : slot_info.left_idx;
    slot_info.right_idx = slot_info.state>2 ? 9 : slot_info.right_idx;
    slot_info.stop = null;
    slot_info.hit = null;

    return slot_info;
}

//スロットの実行
async function execute(interaction, map){
    const user_info = await db.getUserInfo(interaction.user.id);
    const server_info = await db.getServerInfo(interaction.guild.id);

    let slot_info = getSlotInfo(interaction, map);
    let coins = user_info.coins;
    let jackpot = server_info.casino_slot_jackpot;
        
    //スロットの送信
    if(!slot_info.bet){
        map.set(`casino_slot_${interaction.user.id}`, slot_info);
        await interaction.editReply(await createSlot(slot_info, coins, jackpot));
        return 0;
    }

    //スロットの回転
    if(!slot_info.left_stop || !slot_info.center_stop || !slot_info.right_stop){
        await turnSlot(interaction, slot_info, map, coins, jackpot);
        return 0;
    }

    //結果送信
    if(slot_info.left_stop && slot_info.center_stop && slot_info.right_stop){
        slot_info = await controlSlot(slot_info);
        slot_info = await checkResult(slot_info, jackpot);
        slot_info = transState(slot_info);

        if(slot_info.hit==="💎"){
            server_info.casino_slot_jackpot = 100-slot_info.payout;
            interaction.channel.send(await reportJackpot(interaction.user.displayName, jackpot));
        }

        user_info.coins = coins + slot_info.payout;
        server_info.casino_slot_jackpot = Math.min(server_info.casino_slot_jackpot+slot_info.payout, 9999);
        
        await db.setUserInfo(interaction.user.id, user_info);
        await db.setServerInfo(interaction.guild.id, server_info);
        await interaction.editReply(await createSlot(slot_info, coins, jackpot));

        map.set(`casino_slot_${interaction.user.id}`, initialize(slot_info));

        return 0;
    }

    return 0;
}