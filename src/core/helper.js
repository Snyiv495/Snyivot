/*****************
    helper.js
    スニャイヴ
    2025/12/16
*****************/

module.exports = {
    isChannnel : isChannnel,
    isMessage : isMessage,
    isInteraction : isInteraction,
    isContainBotMention : isContainBotMention,
    isContainBotName : isContainBotName,

    getConfig : getConfig,
    getUserObj : getUserObj,
    getGuildObj : getGuildObj,
    getUserId : getUserId,
    getGuildId : getGuildId,
    getUserName : getUserName,
    getGuildName : getGuildName,
    getSystemId : getSystemId,
    getArgValue : getArgValue,
    getDate : getDate,
    getTime : getTime,

    sendDefer : sendDefer,
    sendModal : sendModal,
    sendProgress : sendProgress,
    sendGUI : sendGUI,

    replaceholder : replaceholder,
    removeBotMention : removeBotMention,
    removeBotName : removeBotName
}

const {MessageFlags, EmbedBuilder} = require('discord.js');

//チャンネルオブジェクトかの確認
function isChannnel(trigger){
    return typeof trigger?.isTextBased === "function";
}

//メッセージオブジェクトかの確認
function isMessage(trigger){
    return trigger?.author !== undefined;
}

//インタラクションオブジェクトかの確認
function isInteraction(trigger){
    return typeof trigger?.isCommand === "function";
}

//ボイスステートオブジェクトかの確認
function isVoiceState(trigger){
    return typeof trigger?.disconnect === "function";
}

//Botのメンションを含むか確認
function isContainBotMention(trigger){
    const bot_mention_regex = new RegExp(`^<@${process.env.BOT_ID}>.?|^@${trigger.guild.members.me.displayName}.?`);

    if(isMessage(trigger)){
        return bot_mention_regex.test(trigger.content);
    }

    if(isInteraction(trigger)){
        return bot_mention_regex.test(trigger.message);
    }

    throw new Error("helper.js => isContainMention() \n trigger is not message or interaction");
}

//Botの名前を含むか確認
function isContainBotName(trigger, map){
    const bot_name_config = getConfig("BOT_NAME", map);
    const bot_name_regex = new RegExp(`(${bot_name_config.keywords.join("|")})(${bot_name_config.suffixes.join("|")})`);

    if(isMessage(trigger)){
        return bot_name_regex.test(trigger.content);
    }

    if(isInteraction(trigger)){
        return bot_name_regex.test(trigger.message);
    }

    throw new Error("helper.js => isContainName() \n trigger is not message or interaction");
}

//コンフィグを取得する
function getConfig(config_name, map){
    const config_json = map.get("config_json");
    return config_json.find(config => config.name === config_name);
}

//ユーザーオブジェクトの取得
function getUserObj(trigger){
    if(isMessage(trigger)){
        return trigger.author;
    }

    if(isInteraction(trigger)){
        return trigger.user;
    }

    throw new Error("helper.js => getUserObj() \n trigger is not message or interaction");
}

//ギルドオブジェクトの取得
function getGuildObj(trigger){
    if(isChannnel(trigger)){
        return trigger.guild;
    }

    if(isMessage(trigger)){
        return trigger.guild;
    }

    if(isInteraction(trigger)){
        return trigger.guild;
    }

    throw new Error("helper.js => getGuildObj() \n trigger is not channel, message or interaction");
}

//ユーザーIDの取得
function getUserId(trigger){
    if(isMessage(trigger)){
        return trigger.author.id;
    }

    if(isInteraction(trigger)){
        return trigger.user.id;
    }

    throw new Error("helper.js => getUserId() \n trigger is not message or interaction");
}

//ギルドIDの取得
function getGuildId(trigger){
    if(isChannnel(trigger)){
        return trigger.guild.id;
    }

    if(isMessage(trigger)){
        return trigger.guild.id;
    }

    if(isInteraction(trigger)){
        return trigger.guild.id;
    }

    throw new Error("helper.js => getUserId() \n trigger is not channel, message or interaction");
}

//ユーザーネームの取得
function getUserName(trigger){
     if(isMessage(trigger)){
        return trigger.author.displayName ?? trigger.author.username;
    }

    if(isInteraction(trigger)){
        return trigger.user.displayName ?? trigger.user.username;
    }

    throw new Error("helper.js => getUserName() \n trigger is not message or interaction");
}

//ギルドネームの取得
function getGuildName(trigger){
    if(isChannnel(trigger)){
        return trigger.guild.name;
    }

    if(isMessage(trigger)){
        return trigger.guild.name;
    }

    if(isInteraction(trigger)){
        return trigger.guild.name;
    }

    throw new Error("helper.js => getGuildName() \n trigger is not channel, message or interaction");
}

//システムIDの取得
function getSystemId(trigger){
    if(isMessage(trigger) || isVoiceState(trigger)){
        return trigger.system_id ?? null;
    }

    if(isInteraction(trigger)){
        return trigger.commandName ? `${trigger.commandName}${trigger.options.getSubcommand()}` : trigger.values?.[0] ?? trigger.customId ?? null;
    }

    throw new Error("helper.js => getSystemId() \n trigger is not message or interaction");
}

//引数の取得
function getArgValue(trigger, arg){
    if(isMessage(trigger)){
        return trigger.args?.[arg] ?? null;
    }

    if(isInteraction(trigger)){
        return trigger.options?.get(`${arg}`)?.value ?? trigger.fields?.fields?.get(`${arg}`)?.value ?? null;
    }

    throw new Error("helper.js => getArgValue() \n trigger is not message or interaction");
}

//作成日の取得
function getDate(trigger){
    if(isMessage(trigger)){
        const time = trigger.createdAt;
        const days = ["日", "月", "火", "水", "木", "金", "土"];
        const year = time.getFullYear();
        const month = String(time.getMonth()+1).padStart(2, "0");
        const date =  String(time.getDate()).padStart(2, "0");
        const day = days[time.getDay()];
        return {year: year, month: month, date: date, day: day};
    }

    if(isInteraction(trigger)){
        const time = trigger.createdAt;
        const days = ["日", "月", "火", "水", "木", "金", "土"];
        const year = time.getFullYear();
        const month = String(time.getMonth()+1).padStart(2, "0");
        const date =  String(time.getDate()).padStart(2, "0");
        const day = days[time.getDay()];
        return {year: year, month: month, date: date, day: day};
    }

    throw new Error("helper.js => getCreatedAt() \n trigger is not message or interaction");
}

//作成時間の取得
function getTime(trigger){
    if(isMessage(trigger)){
        const time = trigger.createdAt;
        const hours = String(time.getHours()).padStart(2, "0");
        const minutes = String(time.getMinutes()).padStart(2, "0");
        const seconds = String(time.getSeconds()).padStart(2, "0");
        const milliseconds = String(time.getMilliseconds()).padStart(3, "0");
        return {hours: hours, minutes: minutes, seconds: seconds, milliseconds: milliseconds};
    }

    if(isInteraction(trigger)){
        const time = trigger.createdAt;
        const hours = String(time.getHours()).padStart(2, "0");
        const minutes = String(time.getMinutes()).padStart(2, "0");
        const seconds = String(time.getSeconds()).padStart(2, "0");
        const milliseconds = String(time.getMilliseconds()).padStart(3, "0");
        return {hours: hours, minutes: minutes, seconds: seconds, milliseconds: milliseconds};
    }

    throw new Error("helper.js => getCreatedAt() \n trigger is not message or interaction");
}

//延期の送信
async function sendDefer(interaction){
    try{
        if(isInteraction(interaction)){
            if(!interaction.deferred && interaction.message?.flags?.bitfield){
                await interaction.deferUpdate();
            }
            if(!interaction.deferred && !interaction.message?.flags?.bitfield){
                await interaction.deferReply({flags: MessageFlags.Ephemeral});
            }
            return;
        }
    }catch(e){
        throw new Error(`helper.js => sendDefer() \n ${e}`);
    }
    
    throw new Error("helper.js => sendDefer() \n argment is not interaction");
}

//モーダルの送信
async function sendModal(interaction, gui){
    try{
        if(isInteraction(interaction)){
            await interaction.showModal(gui);
            return;
        }
    }catch(e){
        throw new Error(`helper.js => sendModal() \n ${e}`);
    }

    throw new Error("helper.js => sendModal() \n argment is not interaction");
}

//プログレスの送信
async function sendProgress(trigger, gui){
    try{
        const embed = EmbedBuilder.from(gui.embeds[0]);
        const progress = ["🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗", "🕘", "🕙", "🕚", "🕛"];

        let i=0;
        let progress_embed = new EmbedBuilder(embed.data);
        gui.embeds[0] = progress_embed.setFooter({text: replaceholder(embed.data.footer.text, {"{{__PROGRESS__}}": progress.at(-1)})});

        if(isChannnel(trigger)){
            const message = await trigger.send(gui);
            const interval = setInterval(() => {
                gui.embeds[0] = progress_embed.setFooter({text: replaceholder(embed.data.footer.text, {"{{__PROGRESS__}}": progress.at(i%progress.length)})});
                message.edit(gui);
                i++;
            }, 1000);
            message.interval = interval;
            return message;
        }

        if(isMessage(trigger)){
            const message = await trigger.reply(gui);
            const interval = setInterval(() => {
                gui.embeds[0] = progress_embed.setFooter({text: replaceholder(embed.data.footer.text, {"{{__PROGRESS__}}": progress.at(i%progress.length)})});
                message.edit(gui);
                i++;
            }, 1000);
            message.interval = interval;
            return message;
        }

    }catch(e){
        throw new Error(`helper.js => sendProgress() \n ${e}`);
    }
    
    throw new Error("helper.js => sendProgress() \n trigger is not channel or message");
}

//GUIの送信
async function sendGUI(trigger, gui){
    try{
        if(isChannnel(trigger)){
            return await trigger.send(gui);
        }

        if(isMessage(trigger)){
            return (trigger.author.id!=trigger.client.user.id) ? await trigger.reply(gui) : await trigger.edit(gui);
        }

        if(isInteraction(trigger)){
            try{
                if(!trigger.deferred && trigger.message?.flags?.bitfield){
                    await trigger.deferUpdate();
                }

                if(!trigger.deferred && !trigger.message?.flags?.bitfield){
                    await trigger.deferReply({flags: MessageFlags.Ephemeral});
                }
            }catch(e){}//showModalの後だと補足される

            return await trigger.editReply(gui);
        }
    }catch(e){
        throw new Error(`helper.js => sendGUI() \n ${e}`);
    }

    throw new Error("helper.js => sendGUI() \n trigger is not channel, message or interaction");
}

//プレースホルダーの置換
function replaceholder(string, replacement){
    if(typeof string === "string"){
        return string.replace(/{{__.*?__}}/g, match => replacement[match]);
    }

    return null;
}

//Botのメンションを除去
function removeBotMention(message){
    if(isMessage(message)){
        const bot_mention_regex = new RegExp(`^<@${process.env.BOT_ID}>.?|^@${message.guild.members.me.displayName}.?`);
        return message.content.replace(bot_mention_regex, "");
    }

    throw new Error("helper.js => removeBotMention() \n argment is not message");
}

//Botの名前を除去
function removeBotName(message, map){
    if(isMessage(message)){
        const bot_name_config = getConfig("BOT_NAME", map);
        const bot_name_regex = new RegExp(`(${bot_name_config.keywords.join("|")})(${bot_name_config.suffixes.join("|")})`);
        return message.content.replace(bot_name_regex, "");
    }

    throw new Error("helper.js => removeBotName() \n argment is not message");
}