/*****************
    slot.js
    スニャイヴ
    2024/01/24
*****************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder} = require('discord.js');
const db = require('../../db');

//スロット情報の取得
function getSlotInfo(interaction, map){
    const info = map.has(`casino_slot_${interaction.user.id}`) ? map.get(`casino_slot_${interaction.user.id}`) : {
        state: 0,
        bet: 0,
        button: null,
        left_line :   ["☄️", "🦖", "🍒", "🍖", "🦴", "🦖", "💫", "🦴", "🍖", "💫"],
        center_line : ["🍒", "💫", "☄️", "🦴", "🍒", "💫", "🦖", "🍖", "🦴", "🍖"],
        right_line :  ["💫", "🦴", "🍖", "🦖", "💫", "🍒", "🦴", "☄️", "🍒", "🦖"],
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
    info.again = false
    info.payout = 0;

    if(interaction.isButton() && info.count_interval<=20){
        switch(true){
            case /1bet/.test(interaction.customId) : {
                info.button = "1bet";
                info.bet = 1;
                break;
            }
            case /2bet/.test(interaction.customId) : {
                info.button = "2bet";
                info.bet = 2;
                break;
            }
            case /3bet/.test(interaction.customId) : {
                info.button = "3bet";
                info.bet = 3;
                break;
            }
            case /left/.test(interaction.customId) : {
                info.button = "left";
                info.left_stop = true;
                break;
            }
            case /center/.test(interaction.customId) : {
                info.button = "center";
                info.center_stop = true;
                break;
            }
            case /right/.test(interaction.customId) : {
                info.button = "right";
                info.right_stop = true;
                break;
            }
            default : break;
        }
    }

    info.interval = null;
    info.count_interval = 0;

    map.set(`casino_slot_${interaction.user.id}`, info);

    return info;
}

//スロットの作成
async function createSlot(slot_info, user_coin, jackpot_coin){
    const files = [];
    const embeds = [];
    const components = [];

    const attachment = new AttachmentBuilder();
    const embed = new EmbedBuilder();
    const buttons = new ActionRowBuilder();

    embed.setDescription(`--------------------\n|☄️|☄️|☄️|:${jackpot_coin}　|🍖|🍖|🍖|:015　|🦴|🦴|🦴|:010\n　\n|🦖|🦖|🦖|:100　|🍒|🆓|🆓|:002　|💫|💫|💫|:もう1回\n--------------------`);
    embed.addFields({name: `| ${slot_info.left_line[slot_info.left_idx]} | ${slot_info.center_line[slot_info.center_idx]} | ${slot_info.right_line[slot_info.right_idx]} |\n| ${slot_info.left_line[(slot_info.left_idx+1)%10]} | ${slot_info.center_line[(slot_info.center_idx+1)%10]} | ${slot_info.right_line[(slot_info.right_idx+1)%10]} |\n| ${slot_info.left_line[(slot_info.left_idx+2)%10]} | ${slot_info.center_line[(slot_info.center_idx+2)%10]} | ${slot_info.right_line[(slot_info.right_idx+2)%10]} |`, value: "--------------------", inline: false});
    embed.setFooter({text: `CREDIT:${user_coin}, \tBET:${slot_info.bet}, \tPAYOUT:${slot_info.payout}`});

    //状態表示
    switch(slot_info.state){
        case -4: embed.setTitle("ブルーな気分なのだ...\n[🌚🌚🌚🌚🌚]:ずんだテンション"); embed.setColor(0x0000FF); break;
        case -3: embed.setTitle("不穏なのだ...\n[🌑🌑🌑🌑🌕]:ずんだテンション"); embed.setColor(0xFFFFFF); break;
        case -2: embed.setTitle("不穏なのだ...\n[🌑🌑🌑🌓🌕]:ずんだテンション"); embed.setColor(0xFFFFFF); break;
        case -1: embed.setTitle("回すのだ！\n[🌑🌑🌑🌕🌕]:ずんだテンション"); embed.setColor(0xFFFFFF); break;
        case 0: embed.setTitle("回すのだ！\n[🌑🌑🌓🌕🌕]:ずんだテンション"); embed.setColor(0xFFFFFF); break;
        case 1: embed.setTitle("回すのだ！\n[🌑🌑🌕🌕🌕]:ずんだテンション"); embed.setColor(0xFFFFFF); break;
        case 2: embed.setTitle("流れが来てるのだ！\n[🌑🌓🌕🌕🌕]:ずんだテンション"); embed.setColor(0xFFFFFF); break;
        case 3: embed.setTitle("流れが来てるのだ！\n[🌑🌕🌕🌕🌕]:ずんだテンション"); embed.setColor(0xFFFFFF); break;
        case 4: embed.setTitle("ハイテンションなのだ！\n[🌝🌝🌝🌝🌝]:ずんだテンション"); embed.setColor(0xFFFF00); break;
        default : {
            embed.setTitle(`ボーナスタイムなのだ！(残り${10-slot_info.state}回)\n[🌞🌞🌞🌞🌞]:ずんだテンション`);
            embed.setDescription(`--------------------\nfind🕷️:15\nonly🕸️:5\n--------------------`);
            embed.setColor(0x00FF00);
            break;
        }
    }
    
    //スロット停止中
    if(!slot_info.button || (slot_info.left_stop && slot_info.center_stop && slot_info.right_stop)){
        const bet_1 = new ButtonBuilder();
        const bet_2 = new ButtonBuilder();
        const bet_3 = new ButtonBuilder();
        const again = new ButtonBuilder();
        const game_home = new ButtonBuilder();
        const quit = new ButtonBuilder();

        embed.setThumbnail("attachment://icon.png");
        attachment.setName("icon.png");
        attachment.setFile("assets/zundamon/icon/bunny.png");
        files.push(attachment);

        if(!slot_info.again){
            bet_1.setLabel("1bet");
            bet_1.setEmoji("🪙");
            bet_1.setCustomId("game_casino_slot_1bet_exe");
            bet_1.setStyle(ButtonStyle.Primary);
            user_coin<1 ? bet_1.setDisabled(true) : bet_1.setDisabled(false);
            buttons.addComponents(bet_1);

            bet_2.setLabel("2bet");
            bet_2.setEmoji("💰");
            bet_2.setCustomId("game_casino_slot_2bet_exe");
            bet_2.setStyle(ButtonStyle.Primary);
            user_coin<2 ? bet_2.setDisabled(true) : bet_2.setDisabled(false);
            buttons.addComponents(bet_2);

            bet_3.setLabel("3bet");
            bet_3.setEmoji("💴");
            bet_3.setCustomId("game_casino_slot_3bet_exe");
            bet_3.setStyle(ButtonStyle.Primary);
            user_coin<3 ? bet_3.setDisabled(true) : bet_3.setDisabled(false);
            buttons.addComponents(bet_3);
        }else{
            again.setLabel("もう一度！");
            again.setEmoji("🔂");
            again.setCustomId("game_casino_slot_again_exe");
            again.setStyle(ButtonStyle.Success);
            buttons.addComponents(again);
        }

        game_home.setLabel("戻る");
        game_home.setEmoji("🎮");
        game_home.setCustomId("game_home");
        game_home.setStyle(ButtonStyle.Secondary);
        buttons.addComponents(game_home);

        quit.setLabel("終わる");
        quit.setEmoji("⚠️");
        quit.setCustomId("quit");
        quit.setStyle(ButtonStyle.Danger);
        quit.setDisabled(false);
        buttons.addComponents(quit);
    }

    //スロット稼働中
    else{
        const left = new ButtonBuilder();
        const center = new ButtonBuilder();
        const right = new ButtonBuilder();

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
    }

    embeds.push(embed);
    components.push(buttons);

    return {content: "", files: files, embeds: embeds, components: components, ephemeral: true};
}

//スロットのスライド
function slideSlot(slot_info){
    switch(slot_info.button){
        case "left" : {slot_info.left_idx = (slot_info.left_idx+1)%10; break;}
        case "center" : {slot_info.center_idx = (slot_info.center_idx+9)%10; break;}
        case "right" : {slot_info.right_idx = (slot_info.right_idx+1)%10; break;}
        default: break;
    }

    slot_info.left_idx = !slot_info.left_stop ? (slot_info.left_idx+1)%10 : slot_info.left_idx;
    slot_info.center_idx = !slot_info.center_stop ? (slot_info.center_idx+9)%10 : slot_info.center_idx;
    slot_info.right_idx = !slot_info.right_stop ? (slot_info.right_idx+1)%10 : slot_info.right_idx;

    return slot_info;
}

//1レーン停止時の確認
async function checkFirstLane(interaction, slot_info, user_coin, jackpot_coin){
    const rand = Math.floor(Math.random()*100);

    if(slot_info.button==="left"){
        //3行目
        if(slot_info.left_line[(slot_info.left_idx+2)%10]==="☄️" && slot_info.bet>1){
            if((slot_info.state===4&&rand<80) || slot_info.state<4&&rand<90){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }
    
        //2行目
        if(slot_info.left_line[(slot_info.left_idx+1)%10]==="☄️"){
            if((slot_info.state===4&&rand<80) || slot_info.state<4&&rand<90){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }
    
        //1行目
        if(slot_info.left_line[slot_info.left_idx]==="☄️" && slot_info.bet>1){
            if((slot_info.state===4&&rand<80) || slot_info.state<4&&rand<90){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }

        return slot_info;
    }

    if(slot_info.button==="center"){
        //1行目
        if(slot_info.center_line[slot_info.center_idx]==="☄️" && slot_info.bet>1){
            if((slot_info.state===4&&rand<80) || slot_info.state<4&&rand<90){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }
    
        //2行目
        if(slot_info.center_line[(slot_info.center_idx+1)%10]==="☄️"){
            if((slot_info.state===4&&rand<80) || slot_info.state<4&&rand<90){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }
    
        //3行目
        if(slot_info.center_line[(slot_info.center_idx+2)%10]==="☄️" && slot_info.bet>1){
            if((slot_info.state===4&&rand<80) || slot_info.state<4&&rand<90){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }

        return slot_info;
    }

    if(slot_info.button==="right"){
        //3行目
        if(slot_info.right_line[(slot_info.right_idx+2)%10]==="☄️" && slot_info.bet>1){
            if((slot_info.state===4&&rand<80) || slot_info.state<4&&rand<90){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }
    
        //2行目
        if(slot_info.right_line[(slot_info.right_idx+1)%10]==="☄️"){
            if((slot_info.state===4&&rand<80) || slot_info.state<4&&rand<90){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));  
            }
        }

        //1行目
        if(slot_info.right_line[slot_info.right_idx]==="☄️" && slot_info.bet>1){
            if((slot_info.state===4&&rand<80) || slot_info.state<4&&rand<90){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }

        return slot_info;
    }

    return -1;
}

//2レーン停止時の確認
async function checkSecondLane(interaction, slot_info, user_coin, jackpot_coin){
    const rand = Math.floor(Math.random()*100);

    if(slot_info.button==="left"){
        //3行目
        if(slot_info.left_line[(slot_info.left_idx+2)%10]==="🦖" && slot_info.bet>1){
            if((slot_info.state===4&&rand<50) || slot_info.state<4&&rand<80){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }

        //2行目
        if(slot_info.left_line[(slot_info.left_idx+1)%10]==="🦖"){
            if((slot_info.state===4&&rand<50) || slot_info.state<4&&rand<80){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }

        //1行目
        if(slot_info.left_line[slot_info.left_idx]==="🦖" && slot_info.bet>1){
            if((slot_info.state===4&&rand<50) || slot_info.state<4&&rand<80){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }

        return slot_info;
    }

    if(slot_info.button==="center"){
        //1行目
        if(slot_info.center_line[slot_info.center_idx]==="🦖" && slot_info.bet>1){
            if((slot_info.state===4&&rand<50) || slot_info.state<4&&rand<80){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }

        //2行目
        if(slot_info.center_line[(slot_info.center_idx+1)%10]==="🦖"){
            if((slot_info.state===4&&rand<50) || slot_info.state<4&&rand<80){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }
    
        //3行目
        if(slot_info.center_line[(slot_info.center_idx+2)%10]==="🦖" && slot_info.bet>1){
            if((slot_info.state===4&&rand<50) || slot_info.state<4&&rand<80){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }

        return slot_info;
    }

    if(slot_info.button==="right"){
        //3行目
        if(slot_info.right_line[(slot_info.right_idx+2)%10]==="🦖" && slot_info.bet>1){
            if((slot_info.state===4&&rand<50) || slot_info.state<4&&rand<80){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }

        //2行目
        if(slot_info.right_line[(slot_info.right_idx+1)%10]==="🦖"){
            if((slot_info.state===4&&rand<50) || slot_info.state<4&&rand<80){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }    

        //1行目
        if(slot_info.right_line[slot_info.right_idx]==="🦖" && slot_info.bet>1){
            if((slot_info.state===4&&rand<50) || slot_info.state<4&&rand<80){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }

        return slot_info;
    }

    return -1;
}

//3レーン停止時の確認
async function checkThirdLane(interaction, slot_info, user_coin, jackpot_coin){
    const rand = Math.floor(Math.random()*100);

    if(slot_info.button==="left"){
        //1行目
        if((slot_info.left_line[slot_info.left_idx]===slot_info.center_line[(slot_info.center_idx+1)%10]&&slot_info.left_line[slot_info.left_idx]===slot_info.right_line[(slot_info.right_idx+2)%10]&&slot_info.bet===3) || (slot_info.left_line[slot_info.left_idx]===slot_info.center_line[slot_info.center_idx]&&slot_info.left_line[slot_info.left_idx]===slot_info.right_line[slot_info.right_idx]&&slot_info.bet>1)){
            if(slot_info.left_line[slot_info.left_idx]==="☄️" || slot_info.left_line[slot_info.left_idx]==="🦖"){
                if((slot_info.state===4&&rand<50) || slot_info.state<4&&rand<80){
                    slot_info = slideSlot(slot_info);
                    await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
                }
            }
        }
        if(slot_info.state===-4 && rand<50 && slot_info.left_line[(slot_info.left_idx+1)%10]!="☄️" && slot_info.left_line[(slot_info.left_idx+1)%10]!="🦖"){
            if((slot_info.left_line[(slot_info.left_idx+1)%10]===slot_info.center_line[(slot_info.center_idx+1)%10]&&slot_info.left_line[(slot_info.left_idx+1)%10]===slot_info.right_line[(slot_info.right_idx+2)%10]&&slot_info.bet===3) || slot_info.left_line[(slot_info.left_idx+1)%10]===(slot_info.center_line[slot_info.center_idx]&&slot_info.left_line[(slot_info.left_idx+1)%10]===slot_info.right_line[slot_info.right_idx]&&slot_info.bet>1)){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }
    
        //2行目
        if((slot_info.left_line[(slot_info.left_idx+1)%10]===slot_info.center_line[(slot_info.center_idx+1)%10]&&slot_info.left_line[(slot_info.left_idx+1)%10]===slot_info.right_line[(slot_info.right_idx+1)%10])){
            if(slot_info.left_line[(slot_info.left_idx+1)%10]==="☄️" || slot_info.left_line[(slot_info.left_idx+1)%10]==="🦖"){
                if((slot_info.state===4&&rand<50) || slot_info.state<4&&rand<80){
                    slot_info = slideSlot(slot_info);
                    await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
                }
            }
        }
        if(slot_info.state===-4 && rand<50 && slot_info.left_line[(slot_info.left_idx+2)%10]!="☄️" && slot_info.left_line[(slot_info.left_idx+2)%10]!="🦖"){
            if(slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.center_line[(slot_info.center_idx+1)%10]&&slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.right_line[(slot_info.right_idx+1)%10]){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }
    
        //3行目
        if((slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.center_line[(slot_info.center_idx+1)%10]&&slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.right_line[slot_info.right_idx]&&slot_info.bet===3) || (slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.center_line[(slot_info.center_idx+2)%10]&&slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.right_line[(slot_info.right_idx+2)%10]&&slot_info.bet>1)){
            if(slot_info.left_line[slot_info.left_idx]==="☄️" || slot_info.left_line[slot_info.left_idx]==="🦖"){
                if((slot_info.state===4&&rand<50) || slot_info.state<4&&rand<80){
                    slot_info = slideSlot(slot_info);
                    await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
                }
            }
        }
        if(slot_info.state===-4 && rand<50 && slot_info.left_line[(slot_info.left_idx+3)%10]!="☄️" && slot_info.left_line[(slot_info.left_idx+3)%10]!="🦖"){
            if((slot_info.left_line[(slot_info.left_idx+3)%10]===slot_info.center_line[(slot_info.center_idx+1)%10]&&slot_info.left_line[(slot_info.left_idx+3)%10]===slot_info.right_line[slot_info.right_idx]&&slot_info.bet===3) || slot_info.left_line[(slot_info.left_idx+3)%10]===(slot_info.center_line[(slot_info.center_idx+2)%10]&&slot_info.left_line[(slot_info.left_idx+3)%10]===slot_info.right_line[(slot_info.right_idx+2)%10]&&slot_info.bet>1)){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }

        return slot_info;
    }

    if(slot_info.button==="center"){
        //3行目
        if((slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.center_line[(slot_info.center_idx+2)%10]&&slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.right_line[(slot_info.right_idx+2)%10]&&slot_info.bet>1)){
            if(slot_info.left_line[(slot_info.left_idx+2)%10]==="☄️" || slot_info.left_line[(slot_info.left_idx+2)%10]==="🦖"){
                if((slot_info.state===4&&rand<50) || slot_info.state<4&&rand<80){
                    slot_info = slideSlot(slot_info);
                    await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
                }
            }
        }
        if(slot_info.state===-4 && rand<50 && slot_info.center_line[(slot_info.center_idx+9)%10]!="☄️" && slot_info.center_line[(slot_info.center_idx+9)%10]!="🦖"){
            if(slot_info.left_line[slot_info.left_idx]===slot_info.center_line[(slot_info.center_idx+9)%10]&&slot_info.left_line[slot_info.left_idx]===slot_info.right_line[slot_info.right_idx]&&slot_info.bet>1){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }

        //2行目
        if((slot_info.left_line[slot_info.left_idx]===slot_info.center_line[(slot_info.center_idx+1)%10]&&slot_info.left_line[slot_info.left_idx]===slot_info.right_line[(slot_info.right_idx+2)%10]&&slot_info.bet===3) || (slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.center_line[(slot_info.center_idx+1)%10]&&slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.right_line[slot_info.right_idx]&&slot_info.bet===3) || (slot_info.left_line[(slot_info.left_idx+1)%10]===slot_info.center_line[(slot_info.center_idx+1)%10]&&slot_info.left_line[(slot_info.left_idx+1)%10]===slot_info.right_line[(slot_info.right_idx+1)%10])){
            if(slot_info.left_line[(slot_info.left_idx+1)%10]==="☄️" || slot_info.left_line[(slot_info.left_idx+1)%10]==="🦖"){
                if((slot_info.state===4&&rand<50) || slot_info.state<4&&rand<80){
                    slot_info = slideSlot(slot_info);
                    await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
                }
            }
        }
        if(slot_info.state===-4 && rand<50 && slot_info.center_line[(slot_info.center_idx+8)%10]!="☄️" && slot_info.center_line[(slot_info.center_idx+8)%10]!="🦖"){
            if((slot_info.left_line[slot_info.left_idx]===slot_info.center_line[(slot_info.center_idx+8)%10]&&slot_info.left_line[slot_info.left_idx]===slot_info.right_line[(slot_info.right_idx+2)%10]&&slot_info.bet===3) || (slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.center_line[(slot_info.center_idx+8)%10]&&slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.right_line[slot_info.right_idx]&&slot_info.bet===3) || (slot_info.left_line[(slot_info.left_idx+1)%10]===slot_info.center_line[(slot_info.center_idx+8)%10]&&slot_info.left_line[(slot_info.left_idx+1)%10]===slot_info.right_line[(slot_info.right_idx+1)%10])){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }

        //3行目
        if((slot_info.left_line[slot_info.left_idx]===slot_info.center_line[slot_info.center_idx]&&slot_info.left_line[slot_info.left_idx]===slot_info.right_line[slot_info.right_idx+2]&&slot_info.bet>1)){
            if(slot_info.left_line[slot_info.left_idx]==="☄️" || slot_info.left_line[slot_info.left_idx]==="🦖"){
                if((slot_info.state===4&&rand<50) || slot_info.state<4&&rand<80){
                    slot_info = slideSlot(slot_info);
                    await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
                }
            }
        }
        if(slot_info.state===-4 && rand<50 && slot_info.center_line[(slot_info.center_idx+7)%10]!="☄️" && slot_info.center_line[(slot_info.center_idx+7)%10]!="🦖"){
            if(slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.center_line[(slot_info.center_idx+7)%10]&&slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.right_line[(slot_info.right_idx+2)%10]&&slot_info.bet>1){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }

        return slot_info;
    }

    if(slot_info.button==="right"){
        //1行目
        if((slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.center_line[(slot_info.center_idx+1)%10]&&slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.right_line[slot_info.right_idx]&&slot_info.bet===3) || (slot_info.left_line[slot_info.left_idx]===slot_info.center_line[slot_info.center_idx]&&slot_info.left_line[slot_info.left_idx]===slot_info.right_line[slot_info.right_idx]&&slot_info.bet>1)){
            if(slot_info.left_line[slot_info.left_idx]==="☄️" || slot_info.left_line[slot_info.left_idx]==="🦖"){
                if((slot_info.state===4&&rand<50) || slot_info.state<4&&rand<80){
                    slot_info = slideSlot(slot_info);
                    await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
                }
            }
        }
        if(slot_info.state===-4 && rand<50 && slot_info.right_line[(slot_info.right_idx+1)%10]!="☄️" && slot_info.right_line[(slot_info.right_idx+1)%10]!="🦖"){
            if((slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.center_line[(slot_info.center_idx+1)%10]&&slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.right_line[(slot_info.right_idx+1)%10]&&slot_info.bet===3) || slot_info.left_line[slot_info.left_idx]===(slot_info.center_line[slot_info.center_idx]&&slot_info.left_line[slot_info.left_idx]===slot_info.right_line[(slot_info.right_idx+1)%10]&&slot_info.bet>1)){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }

        //2行目
        if((slot_info.left_line[(slot_info.left_idx+1)%10]===slot_info.center_line[(slot_info.center_idx+1)%10]&&slot_info.left_line[(slot_info.left_idx+1)%10]===slot_info.right_line[(slot_info.right_idx+1)%10])){
            if(slot_info.left_line[(slot_info.left_idx+1)%10]==="☄️" || slot_info.left_line[(slot_info.left_idx+1)%10]==="🦖"){
                if((slot_info.state===4&&rand<50) || slot_info.state<4&&rand<80){
                    slot_info = slideSlot(slot_info);
                    await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
                }
            }
        }
        if(slot_info.state===-4 && rand<50 && slot_info.right_line[(slot_info.right_idx+2)%10]!="☄️" && slot_info.right_line[(slot_info.right_idx+2)%10]!="🦖"){
            if(slot_info.left_line[(slot_info.left_idx+1)%10]===slot_info.center_line[(slot_info.center_idx+1)%10]&&slot_info.left_line[(slot_info.left_idx+1)%10]===slot_info.right_line[(slot_info.right_idx+2)%10]){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }
    
        //3行目
        if((slot_info.left_line[slot_info.left_idx]===slot_info.center_line[(slot_info.center_idx+1)%10]&&slot_info.left_line[slot_info.left_idx]===slot_info.right_line[(slot_info.right_idx+2)%10]&&slot_info.bet===3) || (slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.center_line[(slot_info.center_idx+2)%10]&&slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.right_line[(slot_info.right_idx+2)%10]&&slot_info.bet>1)){
            if(slot_info.left_line[slot_info.left_idx]==="☄️" || slot_info.left_line[slot_info.left_idx]==="🦖"){
                if((slot_info.state===4&&rand<50) || slot_info.state<4&&rand<80){
                    slot_info = slideSlot(slot_info);
                    await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
                }
            }
        }
        if(slot_info.state===-4 && rand<50 && slot_info.right_line[(slot_info.right_idx+3)%10]!="☄️" && slot_info.right_line[(slot_info.right_idx+3)%10]!="🦖"){
            if((slot_info.left_line[slot_info.left_idx]===slot_info.center_line[(slot_info.center_idx+1)%10]&&slot_info.left_line[slot_info.left_idx]===slot_info.right_line[(slot_info.right_idx+3)%10]&&slot_info.bet===3) || slot_info.left_line[(slot_info.left_idx+2)%10]===(slot_info.center_line[(slot_info.center_idx+2)%10]&&slot_info.left_line[(slot_info.left_idx+2)%10]===slot_info.right_line[(slot_info.right_idx+3)%10]&&slot_info.bet>1)){
                slot_info = slideSlot(slot_info);
                await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));
            }
        }

        return slot_info;
    }

    return -1;
}

//スロットの回転
async function turnSlot(interaction, slot_info, map, user_coin, jackpot_coin){
    slot_info.interval = setInterval(async () => {
        slot_info.left_idx = slot_info.left_stop ? slot_info.left_idx : (slot_info.left_idx+1)%10;
        slot_info.center_idx = slot_info.center_stop ? slot_info.center_idx : (slot_info.center_idx+9)%10;
        slot_info.right_idx = slot_info.right_stop ? slot_info.right_idx : (slot_info.right_idx+1)%10;
        slot_info.count_interval++;

        map.set(`casino_slot_${interaction.user.id}`, slot_info);
        await interaction.editReply(await createSlot(slot_info, user_coin, jackpot_coin));

        if(slot_info.count_interval > 20){
            clearInterval(slot_info.interval);
            switch(true){
                case !slot_info.left_stop : {
                    slot_info.button = "left"
                    slot_info.left_stop = true;
                    break;
                }
                case !slot_info.center_stop : {
                    slot_info.button = "center"
                    slot_info.center_stop = true;
                    break;
                }
                case !slot_info.right_stop : {
                    slot_info.button = "right"
                    slot_info.right_stop = true;
                    break;
                }
                default : break;
            }
            map.set(`casino_slot_${interaction.user.id}`, slot_info);
            await execute(interaction, map);
            return 0;
        }
    }, 500);

    return 0;
}

//払い戻し計算
function calcPayout(slot_info, jackpot_coin, pattern){
    switch(pattern){
        case "☄️" : {
            slot_info.payout += jackpot_coin;
            slot_info.hit = pattern;
            break;
        }
        case "🦖" : {
            slot_info.payout += 100;
            slot_info.hit = (slot_info.hit!="☄️") ? pattern : slot_info.hit;
            break;
        }
        case "🍖" : {
            slot_info.payout += 15;
            slot_info.hit = ((slot_info.hit!="☄️")&&(slot_info.hit!="🦖")) ? pattern : slot_info.hit;
            break;
        }
        case "🦴" : {
            slot_info.payout += 10;
            slot_info.hit = ((slot_info.hit!="☄️")&&(slot_info.hit!="🦖")) ? pattern : slot_info.hit;
            break;
        }
        case "🍒" : {
            slot_info.payout += (slot_info.hit!="🍒") ? 2 : 0;
            slot_info.hit = ((slot_info.hit!="☄️")&&(slot_info.hit!="🦖")) ? pattern : slot_info.hit;
            break;
        }
        case "💫" : {
            slot_info.again = true;
            slot_info.hit = ((slot_info.hit!="☄️")&&(slot_info.hit!="🦖")) ? pattern : slot_info.hit;
            break;
        }
        case "🕷️" : {
            slot_info.payout += 15;
            slot_info.hit =  pattern;
            break;
        }
        case "🕸️" : {
            slot_info.payout += 5;
            slot_info.hit =  pattern;
            break;
        }
        default : break;
    }

    return slot_info;
}

//結果の確認
function checkResult(slot_info, jackpot_coin){
    //ボーナス時の判定
    if(slot_info.state>4){
        if(slot_info.center_line[slot_info.center_idx] === slot_info.center_line[(slot_info.center_idx+1)%10] && slot_info.center_line[slot_info.center_idx] === slot_info.center_line[(slot_info.center_idx+2)%10]){
            slot_info = calcPayout(slot_info, jackpot_coin, slot_info.center_line[slot_info.center_idx]);
        }else{
            slot_info = calcPayout(slot_info, jackpot_coin, "🕷️");
        }
        return slot_info;
    }

    //斜めの絵柄判定
    if(slot_info.bet === 3){
        if(slot_info.left_line[slot_info.left_idx] === slot_info.center_line[(slot_info.center_idx+1)%10] && slot_info.left_line[slot_info.left_idx] === slot_info.right_line[(slot_info.right_idx+2)%10]){
            slot_info = calcPayout(slot_info, jackpot_coin, slot_info.left_line[slot_info.left_idx]);
        }
        if(slot_info.left_line[(slot_info.left_idx+2)%10] === slot_info.center_line[(slot_info.center_idx+1)%10] && slot_info.left_line[(slot_info.left_idx+2)%10] === slot_info.right_line[slot_info.right_idx]){
            slot_info = calcPayout(slot_info, jackpot_coin, slot_info.left_line[(slot_info.left_idx+2)%10]);
        }
    }

    //上下行の絵柄判定
    if(slot_info.bet === 3 || slot_info.bet === 2){
        if(slot_info.left_line[slot_info.left_idx] === slot_info.center_line[slot_info.center_idx] && slot_info.left_line[slot_info.left_idx] === slot_info.right_line[slot_info.right_idx]){
            slot_info = calcPayout(slot_info, jackpot_coin, slot_info.left_line[(slot_info.left_idx)]);
        }
        if(slot_info.left_line[(slot_info.left_idx+2)%10] === slot_info.center_line[(slot_info.center_idx+2)%10] && slot_info.left_line[(slot_info.left_idx+2)%10] === slot_info.right_line[(slot_info.right_idx+2)%10]){
            slot_info = calcPayout(slot_info, jackpot_coin, slot_info.left_line[(slot_info.left_idx+2)%10]);
        }
        if(slot_info.left_line[slot_info.left_idx]==="🍒"){
            slot_info = calcPayout(slot_info, jackpot_coin, slot_info.left_line[(slot_info.left_idx)]);
        }
        if(slot_info.left_line[(slot_info.left_idx+2)%10]==="🍒"){
            slot_info = calcPayout(slot_info, jackpot_coin, slot_info.left_line[(slot_info.left_idx+2)%10]);
        }
    }

    //中央行の絵柄判定
    if(slot_info.left_line[(slot_info.left_idx+1)%10] === slot_info.center_line[(slot_info.center_idx+1)%10] && slot_info.left_line[(slot_info.left_idx+1)%10] === slot_info.right_line[(slot_info.right_idx+1)%10]){
        slot_info = calcPayout(slot_info, jackpot_coin, slot_info.left_line[(slot_info.left_idx+1)%10]);
    }
    if(slot_info.left_line[(slot_info.left_idx+1)%10]==="🍒"){
        slot_info = calcPayout(slot_info, jackpot_coin, slot_info.left_line[(slot_info.left_idx+1)%10]);
    }

    return slot_info;
}

//Jackpot当選報告
async function reportJackpot(winner, jackpot){
    const embeds = [];
    const files = [];
    const components = [];

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

    return {content: "", files: files, embeds: embeds, components: components, ephemeral: false};
}

//状態遷移
function transState(slot_info){
    /*
    state * : 基本設定
        ☄️が揃うと5回のボーナスに突入
        🦖が揃うと3回のボーナスに突入

    state -4 : 小当たりが狙いやすい状態
        1レーン目は90%の確率で☄️が滑って消える
        2レーン目は80%の確率で🦖が滑って消える
        3レーン目は☄️🦖以外のパターンが1滑りで揃うなら1滑る
        ☄️🦖以外が揃った場合33%の確率でstate 0へ

    state -3~3 :　通常の状態
        1レーン目は90%の確率で☄️が滑って消える
        2レーン目は80%の確率で🦖が滑って消える
        3レーン目は☄️🦖が揃う場合80%で滑る
        ☄️🦖以外が揃った場合33%の確率でstate +1
        何も揃わなかった場合33%の確率でstate -1

    state 4 : 大当たりが狙いやすい状態
        1レーン目は80%の確率で☄️が滑って消える
        2レーン目は50%の確率で🦖が滑って消える
        3レーン目は☄️🦖が揃う場合50%で滑る
        ☄️🦖以外が揃った場合33%の確率でstate 0へ

    state 5~ : ボーナスタイム
        回すたびにstate +1
        state 10になったらstate 0へ
    */
    const rand = Math.floor(Math.random()*100);

    if(slot_info.hit==="☄️"){
        slot_info.state = 5;
        return slot_info;
    }
    
    if(slot_info.hit==="🦖"){
        slot_info.state = 7;
        return slot_info;
    }

    if(slot_info.state===-4){
        if(slot_info.hit && slot_info.hit!="💫" && rand<33){
            slot_info.state = 0;
        }
        return slot_info;
    }

    if(-4<slot_info.state && slot_info.state<4){
        if(slot_info.hit && rand<33){
            slot_info.state++;
        }
        if(!slot_info.hit && rand<33){
            slot_info.state--;
        }
        return slot_info;
    }

    if(slot_info.state===4){
        if(slot_info.hit && slot_info.hit!="💫" && rand<33){
            slot_info.state = 0;
        }
        return slot_info;
    }
    
    slot_info.state = (slot_info.state+1)%10;

    return slot_info;
}

//初期化
function initialize(slot_info){

    slot_info.bet = slot_info.again ? slot_info.bet : 0;
    slot_info.button = slot_info.again ? "again" : null;
    slot_info.left_stop = slot_info.state>4 ? true : false;
    slot_info.right_stop = slot_info.state>4 ? true : false;
    slot_info.center_stop = false;
    slot_info.left_line = slot_info.state>4 ? ["🕸️", "🕸️", "🕸️", "🕸️", "🕸️", "🕸️", "🕸️", "🕸️", "🕸️", "🕸️"] :  ["☄️", "🦖", "🍒", "🍖", "🦴", "🦖", "💫", "🦴", "🍖", "💫"];
    slot_info.right_line = slot_info.state>4 ?  ["🕸️", "🕸️", "🕸️", "🕸️", "🕸️", "🕸️", "🕸️", "🕸️", "🕸️", "🕸️"] : ["💫", "🦴", "🍖", "🦖", "💫", "🍒", "🦴", "☄️", "🍒", "🦖"];
    slot_info.center_line = slot_info.state>4 ? ["🕷️", "🕸️", "🕸️", "🕸️", "🕸️", "🕷️", "🕸️", "🕸️", "🕸️", "🕸️"] : ["🍒", "💫", "☄️", "🦴", "🍒", "💫", "🦖", "🍖", "🦴", "🍖"];
    slot_info.hit = null;

    return slot_info;
}

//スロットの実行
async function execute(interaction, map){
    const user_info = await db.getUserInfo(interaction.user.id);
    const server_info = await db.getServerInfo(interaction.guild.id);

    let slot_info = getSlotInfo(interaction, map);

    //スロットの送信
    if(!slot_info.bet){
        await interaction.editReply(await createSlot(slot_info, user_info.coin, server_info.casino_slot_jackpot_coin));
        return 0;
    }

    //0レーン停止
    if(!slot_info.left_stop && !slot_info.center_stop && !slot_info.right_stop){
        user_info.coin = user_info.coin - slot_info.bet;
        await db.setUserInfo(interaction.user.id, user_info);
        await turnSlot(interaction, slot_info, map, user_info.coin, server_info.casino_slot_jackpot_coin);
        return 0;
    }

    //1レーン停止
    if((slot_info.left_stop&&!slot_info.center_stop&&!slot_info.right_stop) || (!slot_info.left_stop&&slot_info.center_stop&&!slot_info.right_stop) || (!slot_info.left_stop&&!slot_info.center_stop&&slot_info.right_stop)){
        await turnSlot(interaction, await checkFirstLane(interaction, slot_info, user_info.coin, server_info.casino_slot_jackpot_coin), map, user_info.coin, server_info.casino_slot_jackpot_coin);
        return 0;
    }

    //2レーン停止
    if((slot_info.left_stop&&slot_info.center_stop&&!slot_info.right_stop) || (slot_info.left_stop&&!slot_info.center_stop&&slot_info.right_stop) || (!slot_info.left_stop&&slot_info.center_stop&&slot_info.right_stop)){
        await turnSlot(interaction, await checkSecondLane(interaction, slot_info, user_info.coin, server_info.casino_slot_jackpot_coin), map, user_info.coin, server_info.casino_slot_jackpot_coin);
        return 0;
    }

    //3レーン停止
    if(slot_info.left_stop && slot_info.center_stop && slot_info.right_stop){
        slot_info = await checkThirdLane(interaction, slot_info, user_info.coin, server_info.casino_slot_jackpot_coin);
        slot_info = transState(checkResult(slot_info, server_info.casino_slot_jackpot_coin));
        
        if(slot_info.hit==="☄️"){
            interaction.channel.send(await reportJackpot(interaction.user.displayName, server_info.casino_slot_jackpot_coin));
            server_info.casino_slot_jackpot_coin = 100-slot_info.bet;
        }

        user_info.coin = user_info.coin + slot_info.payout;
        server_info.casino_slot_jackpot_coin = Math.min(server_info.casino_slot_jackpot_coin+slot_info.bet, 999);
        
        await db.setUserInfo(interaction.user.id, user_info);
        await db.setServerInfo(interaction.guild.id, server_info);
        await interaction.editReply(await createSlot(slot_info, user_info.coin, server_info.casino_slot_jackpot_coin));

        map.set(`casino_slot_${interaction.user.id}`, initialize(slot_info));

        return 0;
    }

    return -1;
}