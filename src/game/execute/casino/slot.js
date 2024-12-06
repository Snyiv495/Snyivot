/*****************
    slot.js
    スニャイヴ
    2024/12/05
*****************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const db = require('../../db');

//埋め込みの作成
async function createEmbed(slot_info, coins, jackpot){
    const embeds = [];
    const components = [];

    const embed = new EmbedBuilder();
    const buttons = new ActionRowBuilder();

    embed.setTitle("スロットなのだ！");
    embed.setDescription(`|💎|💎|💎|:${jackpot}　|💊|🆓|🆓|:002　|🛡️|🛡️|🛡️|:010\n　\n|🗡️|🗡️|🗡️|:100　|🏹|🏹|🏹|:015　|🔁|🔁|🔁|:もう1回\n--------------------`);
    embed.addFields({name: `| ${slot_info.left_line[slot_info.left_idx]} | ${slot_info.center_line[slot_info.center_idx]} | ${slot_info.right_line[slot_info.right_idx]} |\n| ${slot_info.left_line[(slot_info.left_idx+1)%10]} | ${slot_info.center_line[(slot_info.center_idx+1)%10]} | ${slot_info.right_line[(slot_info.right_idx+1)%10]} |\n| ${slot_info.left_line[(slot_info.left_idx+2)%10]} | ${slot_info.center_line[(slot_info.center_idx+2)%10]} | ${slot_info.right_line[(slot_info.right_idx+2)%10]} |`, value: "--------------------", inline: false});
    embed.setFooter({text: `CREDIT:${coins}\tBET:${slot_info.bet}\tPAYOUT:${slot_info.payout}`});
    embed.setColor(0x00FF00);
    embeds.push(embed);

    if(!slot_info.bet){
        const bet_1 = new ButtonBuilder();
        const bet_2 = new ButtonBuilder();
        const bet_3 = new ButtonBuilder();
        const quit = new ButtonBuilder();

        bet_1.setLabel("1bet");
        bet_1.setEmoji("🪙");
        bet_1.setCustomId("game_casino_slot_1bet_exe");
        bet_1.setStyle(ButtonStyle.Primary);
        bet_1.setDisabled(false);
        buttons.addComponents(bet_1);

        bet_2.setLabel("2bet");
        bet_2.setEmoji("💰");
        bet_2.setCustomId("game_casino_slot_2bet_exe");
        bet_2.setStyle(ButtonStyle.Primary);
        bet_2.setDisabled(false);
        buttons.addComponents(bet_2);

        bet_3.setLabel("3bet");
        bet_3.setEmoji("💴");
        bet_3.setCustomId("game_casino_slot_3bet_exe");
        bet_3.setStyle(ButtonStyle.Primary);
        bet_3.setDisabled(false);
        buttons.addComponents(bet_3);

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
        }
    }
    
    components.push(buttons);

    return {content: "", files: [], embeds: embeds, components: components, ephemeral: true};
}

//スロット情報の取得
function getSlotInfo(interaction, map){
    const info = map.has(interaction.user.id) ? map.get(interaction.user.id) : {
        state: 0,
        bet: 0,
        left_line :   ["💎", "🗡️", "💊", "🏹", "🛡️", "🗡️", "🔁", "🛡️", "🏹", "🔁"],
        center_line : ["💊", "🔁", "💎", "🛡️", "💊", "🔁", "🗡️", "🏹", "🛡️", "🏹"],
        right_line :  ["🔁", "🛡️", "🏹", "🗡️", "🔁", "💊", "🛡️", "💎", "💊", "🗡️"],
        left_stop: false,
        center_stop: false,
        right_stop: false,
        left_idx: 0,
        center_idx: 0,
        right_idx: 0,
        interval: null,
        count_interval: 0,
        again: false,
        payout: 0
    }
    try{clearInterval(info.interval);}catch(e){};
    info.interval = null;
    info.count_interval = 0;
    info.again = false
    info.payout = 0;

    return info;
}

//スロットの回転
async function turnSlot(interaction, slot_info, map, coins, jackpot){
    slot_info.interval = setInterval(async () => {
        slot_info.left_idx = slot_info.left_stop ? slot_info.left_idx : (slot_info.left_idx+1)%10;
        slot_info.center_idx = slot_info.center_stop ? slot_info.center_idx : (slot_info.center_idx+9)%10;
        slot_info.right_idx = slot_info.right_stop ? slot_info.right_idx : (slot_info.right_idx+1)%10;
        slot_info.count_interval++;

        await interaction.editReply(await createEmbed(slot_info, coins, jackpot));

        if(slot_info.count_interval > 20){
            clearInterval(slot_info.interval);
            switch(true){
                case !slot_info.left_stop : slot_info.left_stop = true; break;
                case !slot_info.center_stop : slot_info.center_stop = true; break;
                case !slot_info.right_stop : slot_info.right_stop = true; break;
                default : break;
            }
            map.set(interaction.user.id, slot_info);
            await execute(interaction, map);
            return 0;
        }
    }, 500);

    return 0;
}

//柄の確認
async function checkPattern(interaction, slot_info, server_info){
    //斜めの絵柄判定
    if(slot_info.bet == 3){
        if(slot_info.left_line[slot_info.left_idx] == slot_info.center_line[(slot_info.center_idx+1)%10] && slot_info.left_line[slot_info.right_idx] == slot_info.right_line[(slot_info.right_idx+2)%10]){
            switch(slot_info.left_line[slot_info.left_idx]){
                case "💎" : {
                    slot_info.payout += server_info.slot_jackpot;
                    server_info.slot_jackpot = 100;
                    break;
                }
                case "🗡️" : slot_info.payout += 100; break;
                case "🏹" : slot_info.payout += 15; break;
                case "🛡️" : slot_info.payout += 10; break;
                case "🔁" : slot_info.again = true; break;
            }
        }
        if(slot_info.left_line[(slot_info.left_idx+2)%10] == slot_info.center_line[(slot_info.center_idx+1)%10] && slot_info.left_line[(slot_info.left_idx+2)%10] == slot_info.right_line[slot_info.right_idx]){
            switch(slot_info.left_line[(slot_info.left_idx+2)%10]){
                case "💎" : {
                    slot_info.payout += server_info.slot_jackpot;
                    server_info.slot_jackpot = 100;
                    break;
                }
                case "🗡️" : slot_info.payout += 100; break;
                case "🏹" : slot_info.payout += 15; break;
                case "🛡️" : slot_info.payout += 10; break;
                case "🔁" : slot_info.again = true; break;
            }
        }
    }

    //上下行の絵柄判定
    if(slot_info.bet == 3 || slot_info.bet == 2){
        if(slot_info.left_line[slot_info.left_idx] == slot_info.center_line[slot_info.center_idx] && slot_info.left_line[slot_info.left_idx] == slot_info.right_line[slot_info.right_idx]){
            switch(slot_info.left_line[slot_info.left_idx]){
                case "💎" : {
                    slot_info.payout += server_info.slot_jackpot;
                    server_info.slot_jackpot = 100;
                    break;
                }
                case "🗡️" : slot_info.payout += 100; break;
                case "🏹" : slot_info.payout += 15; break;
                case "🛡️" : slot_info.payout += 10; break;
                case "🔁" : slot_info.again = true; break;
            }
        }
        if(slot_info.left_line[(slot_info.left_idx+2)%10] == slot_info.center_line[(slot_info.center_idx+2)%10] && slot_info.left_line[(slot_info.left_idx+2)%10] == slot_info.right_line[(slot_info.right_idx+2)%10]){
            switch(slot_info.left_line[(slot_info.left_idx+2)%10]){
                case "💎" : {
                    slot_info.payout += server_info.slot_jackpot;
                    server_info.slot_jackpot = 100;
                    break;
                }
                case "🗡️" : slot_info.payout += 100; break;
                case "🏹" : slot_info.payout += 15; break;
                case "🛡️" : slot_info.payout += 10; break;
                case "🔁" : slot_info.again = true; break;
            }
        }
    }

    //中央行の絵柄判定
    if(slot_info.left_line[(slot_info.left_idx+1)%10] == slot_info.center_line[(slot_info.center_idx+1)%10] && slot_info.left_line[(slot_info.left_idx+1)%10] == slot_info.right_line[(slot_info.right_idx+1)%10]){
        switch(slot_info.left_line[(slot_info.left_idx+1)%10]){
            case "💎" : {
                slot_info.payout += server_info.slot_jackpot;
                server_info.slot_jackpot = 100;
                break;
            }
            case "🗡️" : slot_info.payout += 100; break;
            case "🏹" : slot_info.payout += 15; break;
            case "🛡️" : slot_info.payout += 10; break;
            case "🔁" : slot_info.again = true; break;
        }
    }

    //左列の絵柄判定
    if(slot_info.left_line[(slot_info.left_idx+1)%10]=="💊" || ((slot_info.left_line[slot_info.left_idx]=="💊" || (slot_info.left_line[(slot_info.left_idx+2)%10]=="💊")) && (slot_info.bet == 3 || slot_info.bet == 2))){
        slot_info.payout += 2;
    }

    server_info.slot_jackpot = Math.min(server_info.slot_jackpot+1, 999);
    await db.setServerInfo(interaction.guild.id, server_info);

    return slot_info;
}

//スロットの実行
async function execute(interaction, map){
    const user_info = await db.getUserInfo(interaction.user.id);
    const server_info = await db.getServerInfo(interaction.guild.id);

    let slot_info = getSlotInfo(interaction, map);
    let coins = user_info.coins;
    let jackpot = server_info.slot_jackpot;
        
    //スロットの送信
    if(!slot_info.bet){
        map.set(interaction.user.id, slot_info);
        await interaction.editReply(await createEmbed(slot_info, coins, jackpot));
        return 0;
    }

    //スロットの回転
    if(!slot_info.left_stop || !slot_info.center_stop || !slot_info.right_stop){
        await turnSlot(interaction, slot_info, map, coins, jackpot);
        return 0;
    }

    //結果送信
    if(slot_info.left_stop && slot_info.center_stop && slot_info.right_stop){
        slot_info = await checkPattern(interaction, slot_info, server_info);
        map.set(interaction.user.id, slot_info);

        user_info.coins = coins + slot_info.payout;
        await db.setUserInfo(interaction.user.id, user_info);

        await interaction.editReply(await createEmbed(slot_info, coins, jackpot));

        slot_info.state = slot_info.again ? slot_info.state : 0;
        slot_info.bet = slot_info.again ? slot_info.bet : 0;
        slot_info.left_stop = false;
        slot_info.center_stop = false;
        slot_info.right_stop = false;
        map.set(interaction.user.id, slot_info);

        return 0;
    }

    return 0;
}