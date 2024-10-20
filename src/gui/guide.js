/*****************
    guide.js
    スニャイヴ
    2024/10/20
*****************/

module.exports = {
    sendGui: sendGui,
}

const {EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle, StringSelectMenuOptionBuilder} = require("discord.js");

//埋め込みの作成
function createEmbed(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const menus = new ActionRowBuilder();
    const buttons = new ActionRowBuilder();
    const menu = new StringSelectMenuBuilder();
    const cohere = new StringSelectMenuOptionBuilder();
    const voicevox = new StringSelectMenuOptionBuilder();
    const game = new StringSelectMenuOptionBuilder();
    const quit = new ButtonBuilder();
    
    embed.setTitle("呼ばれたのだ！\n何かするのだ？");
    embed.setThumbnail("attachment://icon.png");
    embed.setFooter({text: "メニューから選択してください"});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/delight.png");

    cohere.setLabel("cohere");
    cohere.setDescription("AIに質問できるよ!");
    cohere.setEmoji("🤖");
    cohere.setValue("cohere");

    voicevox.setLabel("voicevox");
    voicevox.setDescription("読み上げができるよ!");
    voicevox.setEmoji("🎙️");
    voicevox.setValue("voicevox");

    game.setLabel("game");
    game.setDescription("ミニゲームができるよ!");
    game.setEmoji("🎮");
    game.setValue("game");

    menu.setCustomId("menu");
    menu.setPlaceholder("何も選択されてないのだ");
    menu.addOptions(cohere);
    menu.addOptions(voicevox);
    menu.addOptions(game);

    quit.setCustomId("quit");
    quit.setStyle(ButtonStyle.Danger);
    quit.setLabel("終わる");
    quit.setDisabled(false);

    menus.addComponents(menu);
    buttons.addComponents(quit);

    return {files: [attachment], embeds: [embed], components: [menus, buttons], ephemeral: true};
}

//GUIの送信
async function sendGui(interaction){

    await interaction.reply(createEmbed(interaction));

    return;
}