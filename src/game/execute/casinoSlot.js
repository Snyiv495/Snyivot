/*****************
    casinoSlot.js
    スニャイヴ
    2024/11/22
*****************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');
const db = require('../db');
const cui = require('../cui');

//埋め込みの作成
async function createEmbed(user_info){
    const embeds = [];
    const components = [];

    const embed = new EmbedBuilder();
    const buttons = new ActionRowBuilder();

    const left_line =   ["💎", "🗡️", "💊", "🏹", "🛡️", "🗡️", "🔁", "🛡️", "🏹", "🔁"];
    const center_line = ["💊", "🔁", "💎", "🛡️", "💊", "🔁", "🗡️", "🏹", "🛡️", "🏹"];
    const right_line =  ["🔁", "🛡️", "🏹", "🗡️", "🔁", "💊", "🛡️", "💎", "💊", "🗡️"];

    embed.setTitle("スロットなのだ！");
    embed.setDescription("|💎|💎|💎|:100　|💊|🆓|🆓|:002　|🛡️|🛡️|🛡️|:010\n　\n|🗡️|🗡️|🗡️|:100　|🏹|🏹|🏹|:015　|🔁|🔁|🔁|:もう1回\n--------------------");
    embed.addFields({name: `| ${left_line[user_info.slot_left_line]} | ${center_line[user_info.slot_center_line]} | ${right_line[user_info.slot_right_line]} |\n| ${left_line[(user_info.slot_left_line+1)%10]} | ${center_line[(user_info.slot_center_line+1)%10]} | ${right_line[(user_info.slot_right_line+1)%10]} |\n| ${left_line[(user_info.slot_left_line+2)%10]} | ${center_line[(user_info.slot_center_line+2)%10]} | ${right_line[(user_info.slot_right_line+2)%10]} |`, value: "--------------------", inline: false});
    embed.setFooter({text: `CREDIT:${user_info.coins}\tPAYOUT:${user_info.payout}`});
    embed.setColor(0x00FF00);
    embeds.push(embed);

    if(!user_info.slot_state){
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
        user_info.slot_left_stop ? left.setDisabled(true) : left.setDisabled(false);
        buttons.addComponents(left);

        center.setLabel(" ");
        center.setEmoji("🛑");
        center.setCustomId("game_casino_slot_center_exe");
        center.setStyle(ButtonStyle.Primary);
        user_info.slot_center_stop ? center.setDisabled(true) : center.setDisabled(false);
        buttons.addComponents(center);

        right.setLabel(" ");
        right.setEmoji("🛑");
        right.setCustomId("game_casino_slot_right_exe");
        right.setStyle(ButtonStyle.Primary);
        user_info.slot_right_stop ? right.setDisabled(true) : right.setDisabled(false);
        buttons.addComponents(right);

        if(user_info.slot_left_stop && user_info.slot_center_stop && user_info.slot_right_stop){
            again.setLabel("続ける");
            again.setEmoji("🔂");
            again.setCustomId("game_casino_slot_again_exe");
            again.setStyle(ButtonStyle.Success);
            buttons.addComponents(again);
        }
    }
    
    components.push(buttons);

    return {content: "", files: [], embeds: embeds, components: components, ephemeral: true};
}

//スロットの実行
async function execute(interaction){
    const left_line =   ["💎", "🗡️", "💊", "🏹", "🛡️", "🗡️", "🔁", "🛡️", "🏹", "🔁"];
    const center_line = ["💊", "🔁", "💎", "🛡️", "💊", "🔁", "🗡️", "🏹", "🛡️", "🏹"];
    const right_line =  ["🔁", "🛡️", "🏹", "🗡️", "🔁", "💊", "🛡️", "💎", "💊", "🗡️"];
    let user_info = await db.getUserInfo(interaction.user.id);
    let count_interval = 0;

    //成功送信
    if(!user_info.slot_state){
        await interaction.editReply(await createEmbed(user_info));
        return 0;
    }

    if(user_info.slot_left_stop && user_info.slot_center_stop && user_info.slot_right_stop){
        clearInterval(interaction.client.user.slot_interval);
        let user_info = await db.getUserInfo(interaction.user.id);
        let payout = 0;

        if(user_info.slot_bet > 2){
            if(left_line[user_info.slot_left_line] == center_line[(user_info.slot_center_line+1)%10] && left_line[user_info.slot_left_line] == right_line[(user_info.slot_right_line+2)%10]){
                switch(left_line[user_info.slot_left_line]){
                    case "💎" : payout += 100; break;
                    case "🗡️" : payout += 100; break;
                    case "🏹" : payout += 15; break;
                    case "🛡️" : payout += 10; break;
                    case "🔁" : payout += 10000; break;
                }
            }
            if(left_line[(user_info.slot_left_line+2)%10] == center_line[(user_info.slot_center_line+1)%10] && left_line[(user_info.slot_left_line+2)%10] == right_line[user_info.slot_right_line]){
                switch(left_line[(user_info.slot_left_line+2)%10]){
                    case "💎" : payout += 100; break;
                    case "🗡️" : payout += 100; break;
                    case "🏹" : payout += 15; break;
                    case "🛡️" : payout += 10; break;
                    case "🔁" : payout += 10000; break;
                }
            }
        }
        if(user_info.slot_bet > 1){
            if(left_line[user_info.slot_left_line] == center_line[user_info.slot_center_line] && left_line[user_info.slot_left_line] == right_line[user_info.slot_right_line]){
                switch(left_line[user_info.slot_left_line]){
                    case "💎" : payout += 100; break;
                    case "🗡️" : payout += 100; break;
                    case "🏹" : payout += 15; break;
                    case "🛡️" : payout += 10; break;
                    case "🔁" : payout += 10000; break;
                }
            }
            if(left_line[(user_info.slot_left_line+2)%10] == center_line[(user_info.slot_center_line+2)%10] && left_line[(user_info.slot_left_line+2)%10] == right_line[(user_info.slot_right_line+2)%10]){
                switch(left_line[(user_info.slot_left_line+2)%10]){
                    case "💎" : payout += 100; break;
                    case "🗡️" : payout += 100; break;
                    case "🏹" : payout += 15; break;
                    case "🛡️" : payout += 10; break;
                    case "🔁" : payout += 10000; break;
                }
            }
        }
        if(left_line[(user_info.slot_left_line+1)%10] == center_line[(user_info.slot_center_line+1)%10] && left_line[(user_info.slot_left_line+1)%10] == right_line[(user_info.slot_right_line+1)%10]){
            switch(left_line[(user_info.slot_left_line+1)%10]){
                case "💎" : payout += 100; break;
                case "🗡️" : payout += 100; break;
                case "🏹" : payout += 15; break;
                case "🛡️" : payout += 10; break;
                case "🔁" : payout += 10000; break;
            }
        }
        if(!payout && ((left_line[user_info.slot_left_line]=="💊" && user_info.slot_bet>1) || left_line[(user_info.slot_left_line+1)%10]=="💊" || (left_line[(user_info.slot_left_line+2)%10]=="💊" && user_info.slot_bet>1))){
            payout = 2;
        }
        if(payout > 9999){
            payout = payout % 10000;
        }
        user_info.payout = payout;
        await interaction.editReply(await createEmbed(user_info));
        user_info.coins += payout;
        user_info.slot_state = 0;
        user_info.slot_bet = 0;
        user_info.slot_interval = null;
        user_info.slot_left_stop = false;
        user_info.slot_center_stop = false;
        user_info.slot_right_stop = false;
        user_info.payout = 0;
        await db.setUserInfo(interaction.user.id, user_info);
        return 0;
    }
    
    try{
        clearInterval(interaction.client.user.slot_interval);
    }catch(e){}

    interaction.client.user.slot_interval = setInterval(async () => {
        if(count_interval > 60){
            clearInterval(interaction.client.user.slot_interval);
        }
        user_info.slot_left_line = (user_info.slot_left_stop) ? user_info.slot_left_line : (user_info.slot_left_line+1)%10;
        user_info.slot_center_line = (user_info.slot_center_stop) ? user_info.slot_center_line : (user_info.slot_center_line+9)%10;
        user_info.slot_right_line = (user_info.slot_right_stop) ? user_info.slot_right_line : (user_info.slot_right_line+1)%10;
        await db.setUserInfo(interaction.user.id, user_info);
        await interaction.editReply(await createEmbed(user_info));
        count_interval++;
    }, 500);

    return 0;
}