/*****************
    gui.js
    スニャイヴ
    2024/10/21
*****************/

module.exports = {
    sendBell: sendBell,
    guiButton: guiButton,
    getQuitButton: createQuitButton,
}

const {EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const cohere = require('./cohere/cohere');
const voicevox = require('./voicevox/voicevox');

//ベルの作成
function createBell(){
    const buttons = new ActionRowBuilder();
    const bell = new ButtonBuilder();

    bell.setCustomId("gui_bell");
    bell.setStyle(ButtonStyle.Primary);
    bell.setLabel("呼ぶ🔔");
    bell.setDisabled(false);

    buttons.addComponents(bell);

    return {components: [buttons], ephemeral: false};
}

//終了ボタンの作成
function createQuitButton(){
    const quit = new ButtonBuilder();

    quit.setCustomId("gui_quit");
    quit.setStyle(ButtonStyle.Danger);
    quit.setLabel("終わる");
    quit.setDisabled(false);

    return quit;
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
    const quit = createQuitButton();
    
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
    await interaction.deferReply({ephemeral: true});
    await interaction.editReply(createMenu(interaction));
    return 0;
}

//ボタン動作
async function guiButton(interaction){
    switch(interaction.customId){
        case "gui_bell" : {
            await sendGui(interaction);
            break;
        }
        case "gui_quit" : {
            await guiQuit(interaction);
            break;
        }
        default : break;
    }

    return 0;
}

//終了埋め込みの作成
function createQuitEmbed(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();;
    
    embed.setTitle("またなのだ～");
    embed.setThumbnail("attachment://icon.png");
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/normal.png");

    return {content: "", files: [attachment], embeds: [embed], components: [], ephemeral: true};    
}

//終了
async function guiQuit(interaction){
    await interaction.deferUpdate();
    await interaction.editReply({content: "Loading...", files: [], embeds: [], components: [], ephemeral: true});
    await interaction.editReply(createQuitEmbed());
    return 0;
}