/*****************
    gui.js
    スニャイヴ
    2024/10/21
*****************/

module.exports = {
    getQuitButton: getQuitButton,
    sendBell: sendBell,
    sendGui: sendGui,
}

const {EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const cohere = require('./cohere/cohere');
const voicevox = require('./voicevox/voicevox');

//終了ボタンの作成
function getQuitButton(){
    const quit = new ButtonBuilder();

    quit.setCustomId("quit");
    quit.setStyle(ButtonStyle.Danger);
    quit.setLabel("終わる");
    quit.setDisabled(false);

    return quit;
}

//ベルの作成
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

//ベルの送信
async function sendBell(message){
    await message.reply(createBell());
    return 0;
}

//GUIメニューの作成
function createMenu(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();;
    const menus = new ActionRowBuilder();
    const menu = new StringSelectMenuBuilder();
    const buttons = new ActionRowBuilder();
    const quit = getQuitButton();
    
    embed.setTitle("呼ばれたのだ！\n何かするのだ？");
    embed.setThumbnail("attachment://icon.png");
    embed.setFooter({text: "メニューから選択してください"});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/delight.png");

    menu.setCustomId("menu");
    menu.setPlaceholder("何も選択されてないのだ");
    menu.addOptions(voicevox.getMenu());

    menus.addComponents(menu);
    buttons.addComponents(quit);

    return {files: [attachment], embeds: [embed], components: [menus, buttons], ephemeral: true};
}

//GUIの送信
async function sendGui(interaction){
    await interaction.reply(createMenu(interaction));
    return 0;
}