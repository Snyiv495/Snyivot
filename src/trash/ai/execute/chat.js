/*****************
    chat.js
    スニャイヴ
    2025/03/19
*****************/

module.exports = {
    exe: execute,
}

const {AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle} = require('discord.js');
const cohere = require('../cohere');

//質問送信用モーダルの作成
function createQuesModal(){
    const modal = new ModalBuilder();
    const components = new ActionRowBuilder();
    const ques = new TextInputBuilder();
    
    modal.setCustomId("ai_chat_modal");
    modal.setTitle("聞きたいことを教えてほしいのだ！");

    ques.setCustomId("ques");
    ques.setLabel("質問内容");
    ques.setPlaceholder("読み上げの始め方を教えて");
    ques.setStyle(TextInputStyle.Short);
    ques.setRequired(true);

    components.addComponents(ques);
    modal.addComponents(components);

    return modal;
}

//回答埋め込みの作成
async function createAnsEmbed(ques, ans){
    const content = null;
    const files = [];
    const embeds = [];
    const components = [];

    const attachment = new AttachmentBuilder();
    const embed = new EmbedBuilder();
    const buttons = new ActionRowBuilder();

    const home = new ButtonBuilder();
    const ai_home = new ButtonBuilder();
    const ai_chat_exe = new ButtonBuilder();
    const quit_home = new ButtonBuilder();

    attachment.setName("icon.png");
    attachment.setFile("assets/zundamon/icon/flaunt.png");

    embed.setTitle("Q.");
    embed.setDescription(ques.substr(0, 2000));
    embed.addFields({name: "A.", value: ans.substr(0, 1000)});
    embed.setThumbnail("attachment://icon.png");
    embed.setFooter({text: "AIによる生成"});
    embed.setTimestamp();
    embed.setColor(0x00FF00);
    
    home.setLabel("ホーム");
    home.setEmoji("🏠");
    home.setCustomId("home");
    home.setStyle(ButtonStyle.Secondary);
    home.setDisabled(false);
    buttons.addComponents(home);

    ai_home.setLabel("戻る");
    ai_home.setEmoji("🤖");
    ai_home.setCustomId("ai_home");
    ai_home.setStyle(ButtonStyle.Secondary);
    ai_home.setDisabled(false);
    buttons.addComponents(ai_home);

    ai_chat_exe.setLabel("他の質問");
    ai_chat_exe.setEmoji("💬");
    ai_chat_exe.setCustomId("ai_chat_exe");
    ai_chat_exe.setStyle(ButtonStyle.Secondary);
    ai_chat_exe.setDisabled(false);
    buttons.addComponents(ai_chat_exe);

    quit_home.setLabel("終わる");
    quit_home.setEmoji("⚠️");
    quit_home.setCustomId("quit_home");
    quit_home.setStyle(ButtonStyle.Danger);
    quit_home.setDisabled(false);
    buttons.addComponents(quit_home);

    files.push(attachment);
    embeds.push(embed);
    components.push(buttons);

    return {content: content, files: files, embeds: embeds, components: components, ephemeral: true};
}

//チャットの実行
async function execute(interaction, map){
    const info = `
        ## Task and Context
            あなたは「Snyivot」という名前のDiscordのbotに搭載されているAI機能の一つであるチャットボットです。
            質問に対して、botの機能説明や利用方法が求められていると判断した場合は、## README に示す情報に沿って正確に回答してください。
            機能説明や利用方法に関係ない話題であると判断した場合は、## README に示す情報は考慮せずに回答してください。
            また回答は一問一答でできるだけ短く、最大でも1000文字以内で簡潔にお願いします。

        ## README
            ${map.get("readme")}
    `;

    //メンションに反応
    if(interaction.mentions){
        const ans = await cohere.exe(interaction.content.replace(`<@${process.env.BOT_ID}>`, ""), info);
        interaction.reply(ans);
        return 0;
    }

    //質問送信用モーダルの表示
    if(interaction.isCommand() || interaction.isAnySelectMenu() || interaction.isButton()){
        await interaction.showModal(createQuesModal());
        try{await interaction.editReply({components: []});}catch(e){};
        return 0;
    }

    //回答の表示
    if(interaction.isModalSubmit()){
        const ques = interaction.fields.getTextInputValue("ques");
        const ans = await cohere.exe(ques, info);
        clearInterval(interaction.interval);
        await interaction.editReply(await createAnsEmbed(ques, ans));
        return 0;
    }

    return -1;
}