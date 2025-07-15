/*****************
    chat.js
    スニャイヴ
    2025/03/14
*****************/

module.exports = {
    exe: execute,
}

const {AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');

//プロンプト送信用モーダルの作成
function createPromptModal(){
    const modal = new ModalBuilder();
    const action_row = new ActionRowBuilder();
    const text_input = new TextInputBuilder();
    
    modal.setCustomId("ai_draw_modal");
    modal.setTitle("どんな絵を描くかを教えてほしいのだ！");

    text_input.setCustomId("prompt");
    text_input.setLabel("イラスト内容");
    text_input.setPlaceholder("ずんだもちを食べるずんだもん");
    text_input.setStyle(TextInputStyle.Short);
    text_input.setRequired(true);

    action_row.addComponents(text_input);
    modal.addComponents(action_row);

    return modal;
}

//イラスト埋め込みの作成
async function createIllustEmbed(prompt, url){
    const content = null;
    const files = [];
    const embeds = [];
    const components = [];

    const attachment = new AttachmentBuilder();
    const embed = new EmbedBuilder();
    const action_row = new ActionRowBuilder();

    const home_button = new ButtonBuilder();
    const ai_home_button = new ButtonBuilder();
    const ai_draw_exe_button = new ButtonBuilder();
    const quit_home_button = new ButtonBuilder();

    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/flaunt.png");

    embed.setTitle("こんな絵が描けたのだ！");
    embed.setDescription(`内容：${prompt.substr(0, 2000)}`);
    embed.setThumbnail("attachment://icon.png");
    embed.setImage(url);
    embed.setFooter({text: "AIによる生成"});
    embed.setTimestamp();
    embed.setColor(0x00FF00);
    
    home_button.setLabel("ホーム");
    home_button.setEmoji("🏠");
    home_button.setCustomId("home");
    home_button.setStyle(ButtonStyle.Secondary);
    home_button.setDisabled(false);
    action_row.addComponents(home_button);

    ai_home_button.setLabel("戻る");
    ai_home_button.setEmoji("🤖");
    ai_home_button.setCustomId("ai_home");
    ai_home_button.setStyle(ButtonStyle.Secondary);
    ai_home_button.setDisabled(false);
    action_row.addComponents(ai_home_button);

    ai_draw_exe_button.setLabel("他の絵");
    ai_draw_exe_button.setEmoji("🖼️");
    ai_draw_exe_button.setCustomId("ai_draw_exe");
    ai_draw_exe_button.setStyle(ButtonStyle.Secondary);
    ai_draw_exe_button.setDisabled(false);
    action_row.addComponents(ai_draw_exe_button);

    quit_home_button.setLabel("終わる");
    quit_home_button.setEmoji("⚠️");
    quit_home_button.setCustomId("quit_home");
    quit_home_button.setStyle(ButtonStyle.Danger);
    quit_home_button.setDisabled(false);
    action_row.addComponents(quit_home_button);

    files.push(attachment);
    embeds.push(embed);
    components.push(action_row);

    return {content: content, files: files, embeds: embeds, components: components, ephemeral: true};
}

//未実装
async function unimplemented(){
    const content = null;
    const files = [];
    const embeds = [];
    const components = [];

    const attachment = new AttachmentBuilder();
    const embed = new EmbedBuilder();
    const action_row = new ActionRowBuilder();

    const home_button = new ButtonBuilder();
    const ai_home_button = new ButtonBuilder();
    const ai_draw_exe_button = new ButtonBuilder();
    const quit_home_button = new ButtonBuilder();

    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/cry.png");

    embed.setTitle("まだお絵描きはできないのだ...");
    embed.setThumbnail("attachment://icon.png");
    embed.setColor(0x00FF00);
    
    home_button.setLabel("ホーム");
    home_button.setEmoji("🏠");
    home_button.setCustomId("home");
    home_button.setStyle(ButtonStyle.Secondary);
    home_button.setDisabled(false);
    action_row.addComponents(home_button);

    ai_home_button.setLabel("戻る");
    ai_home_button.setEmoji("🤖");
    ai_home_button.setCustomId("ai_home");
    ai_home_button.setStyle(ButtonStyle.Secondary);
    ai_home_button.setDisabled(false);
    action_row.addComponents(ai_home_button);

    ai_draw_exe_button.setLabel("他の絵");
    ai_draw_exe_button.setEmoji("🖼️");
    ai_draw_exe_button.setCustomId("ai_draw_exe");
    ai_draw_exe_button.setStyle(ButtonStyle.Secondary);
    ai_draw_exe_button.setDisabled(true);
    action_row.addComponents(ai_draw_exe_button);

    quit_home_button.setLabel("終わる");
    quit_home_button.setEmoji("⚠️");
    quit_home_button.setCustomId("quit_home");
    quit_home_button.setStyle(ButtonStyle.Danger);
    quit_home_button.setDisabled(false);
    action_row.addComponents(quit_home_button);

    files.push(attachment);
    embeds.push(embed);
    components.push(action_row);

    return {content: content, files: files, embeds: embeds, components: components, ephemeral: true};
}

//お絵描きの実行
async function execute(interaction, map){
    const info = ``;

    try{
        await interaction.update({components: [], ephemeral: true});
    }catch(e){
        await interaction.reply({content: "回答を生成中", components: [], ephemeral: true});
    }
    await interaction.editReply(await unimplemented());
    return 0;

    //プロンプト送信用モーダルの表示
    if(interaction.isCommand() || interaction.isAnySelectMenu() || interaction.isButton()){
        await interaction.showModal(createPromptModal());
        try{await interaction.editReply({components: []});}catch(e){};
        return 0;
    }

    //イラストの表示
    if(interaction.isModalSubmit()){
        const prompt = interaction.fields.getTextInputValue("prompt");
        await interaction.editReply(await createIllustEmbed(prompt, url));
        return 0;
    }

    return -1;
}