/*****************
    helper.js
    スニャイヴ
    2025/08/20
*****************/

module.exports = {
    isChannnel : isChannnel,
    isMessage : isMessage,
    isInteraction : isInteraction,
    isContainBotMention : isContainBotMention,
    isContainBotName : isContainBotName,
    getFeatureModules : getFeatureModules,
    getUserId : getUserId,
    getGuildId : getGuildId,
    getUserName : getUserName,
    getSystemId : getSystemId,
    getArgValue : getArgValue,
    replaceholder : replaceholder,
    sendDefer : sendDefer,
    sendModal : sendModal,
    sendGUI : sendGUI,
    removeBotMention : removeBotMention,
    removeBotName : removeBotName
}

const ai = require("../features/ai");
const faq = require("../features/faq");
const omikuji = require("../features/omikuji");
const read = require("../features/read");

const bot_name = new RegExp(/(すにゃ|スニャ|すな|スナ|すに|スニ)(ぼっと|ボット|ぼ|ボ|bot|Bot|BOT)/);

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
    const bot_mention = new RegExp(`^<@${process.env.BOT_ID}>.?|^@${trigger.guild.members.me.displayName}.?`);

    if(isMessage(trigger)){
        return bot_mention.test(trigger.content);
    }

    if(isInteraction(trigger)){
        return bot_mention.test(trigger.message);
    }

    throw new Error("helper.js => isContainMention() \n message is not message");
}

//Botの名前を含むか確認
function isContainBotName(trigger){
    if(isMessage(trigger)){
        return bot_name.test(trigger.content);
    }

    if(isInteraction(trigger)){
        return bot_name.test(trigger.message);
    }

    throw new Error("helper.js => isContainName() \n message is not message");
}

//実装機能モジュールの取得
function getFeatureModules(){
    return {
        "ai": ai,
        "faq": faq,
        "omikuji": omikuji,
        "read": read
    }
}

//ユーザーIDの取得
function getUserId(trigger){
    if(isMessage(trigger)){
        return trigger.author.id;
    }

    if(isInteraction(trigger)){
        return trigger.user.id;
    }

    throw new Error("helper.js => getUserId() \n trigger is not message or interaction")
}

//ギルドIDの取得
function getGuildId(trigger){
    if(isMessage(trigger)){
        return trigger.guild.id;
    }

    if(isInteraction(trigger)){
        return trigger.guild.id;
    }

    throw new Error("helper.js => getUserId() \n trigger is not message or interaction")
}

//ユーザーネームの取得
function getUserName(trigger){
     if(isMessage(trigger)){
        return trigger.author.displayName ?? trigger.author.username;
    }

    if(isInteraction(trigger)){
        return trigger.user.displayName ?? trigger.user.username;
    }

    throw new Error("helper.js => getUserId() \n trigger is not message or interaction")
}

//システムIDの取得
function getSystemId(trigger){
    if(isMessage(trigger) || isVoiceState(trigger)){
        return trigger.system_id ?? null;
    }

    if(isInteraction(trigger)){
        return trigger.commandName ? `${trigger.commandName}${trigger.options.getSubcommand()}` : trigger.values?.[0] ?? trigger.customId ?? null;
    }

    throw new Error("helper.js => getSystemId() \n trigger is not message or interaction")
}

//引数の取得
function getArgValue(trigger, arg){
    if(isMessage(trigger)){
        return trigger.args?.[arg] ?? null;
    }

    if(isInteraction(trigger)){
        return trigger.options?.get(`${arg}`)?.value ?? trigger.fields?.fields?.get(`${arg}`)?.value ?? null;
    }

    throw new Error("helper.js => getArgValue() \n trigger is not message or interaction")
}

//プレースホルダーの置換
function replaceholder(string, replacement){
    if(typeof string === "string"){
        return string.replace(/{{__.*?__}}/g, match => replacement[match]);
    }

    return null;
}

//延期の送信
async function sendDefer(interaction){
    try{
        if(isInteraction(interaction)){
            if(!interaction.deferred && interaction.message?.flags?.bitfield){
                await interaction.deferUpdate();
            }
            if(!interaction.deferred && !interaction.message?.flags?.bitfield){
                await interaction.deferReply({ephemeral:true});
            }
            return;
        }
    }catch(e){
        throw new Error(`helper.js => sendDefer() \n ${e}`);
    }
    
    throw new Error("helper.js => sendDefer() \n interaction is not interaction");
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

    throw new Error("helper.js => sendModal() \n interaction is not interaction");
}

//GUIの送信
async function sendGUI(trigger, gui){
    try{
        if(isChannnel(trigger)){
            await trigger.send(gui);
            return;
        }

        if(isMessage(trigger)){
            await trigger.reply(gui);
            return;
        }

        if(isInteraction(trigger)){
            try{
                if(!trigger.deferred && trigger.message?.flags?.bitfield){
                    await trigger.deferUpdate();
                }

                if(!trigger.deferred && !trigger.message?.flags?.bitfield){
                    await trigger.deferReply({ephemeral:true});
                }
            }catch(e){}//showModalの後だと補足される

            await trigger.editReply(gui);
            return;
        }
    }catch(e){
        throw new Error(`helper.js => sendGUI() \n ${e}`);
    }

    throw new Error("helper.js => sendGUI() \n trigger is not message or interaction");
}

//Botのメンションを除去
function removeBotMention(message){
    if(isMessage(message)){
        const bot_mention = new RegExp(`^<@${process.env.BOT_ID}>.?|^@${message.guild.members.me.displayName}.?`);
        return message.content.replace(bot_mention, "");
    }

    throw new Error("helper.js => removeBotMention() \n message is not message");
}

//Botの名前を除去
function removeBotName(message){
    if(isMessage(message)){
        return message.content.replace(bot_name, "");
    }

    throw new Error("helper.js => removeBotName() \n message is not message");
}