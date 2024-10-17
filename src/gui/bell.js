/*****************
    bell.js
    スニャイヴ
    2024/10/11
*****************/

const {ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");

module.exports = {
    sendBell: sendBell,
}

function createBell(){
    const buttons = new ActionRowBuilder();
    const bell = new ButtonBuilder();

    bell.setCustomId("bell");
    bell.setStyle(ButtonStyle.Primary);
    bell.setLabel("呼ぶ🔔");
    bell.setDisabled(false);

    buttons.addComponents(bell);

    return {components: [buttons], ephemeral: false};
}

function sendBell(message){
    message.reply(createBell());
    return;
}