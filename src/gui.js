/*****************
    gui.js
    スニャイヴ
    2024/10/21
*****************/

module.exports = {
    createGui: createGui,
}

const {EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuOptionBuilder} = require("discord.js");
const cohere = require('./cohere/cohere');
const voicevox = require('./voicevox/voicevox');

async function createGui(id, scene){
    let attachment = [];
    let embed = [];
    let components = [];
    let menus = null;
    let buttons = null;

    for(let i=0; i<scene.length; i++){
        if(scene[i].scene === id){
            if(scene[i].embed){
                attachment = new AttachmentBuilder();
                embed = new EmbedBuilder();

                attachment.setName("icon.png");
                attachment.setFile(scene[i].embed[0].thumbnail);

                embed.setTitle(scene[i].embed[0].title);
                embed.setURL(scene[i].embed[0].url);
                embed.setThumbnail("attachment://icon.png");
                embed.setDescription(scene[i].embed[0].description);
                for(let j=0; j<scene[i].embed[0].fields.length; j++){
                    embed.addFields({name: scene[i].embed[0].fields[j].name, value: scene[i].embed[0].fields[j].value});
                }
                embed.setImage(scene[i].embed[0].image);
                embed.setFooter(scene[i].embed[0].footer);
                embed.setColor(scene[i].embed[0].color);
            }
            if(scene[i].menus){
                const menu = new StringSelectMenuBuilder();
                menus = new ActionRowBuilder();

                menu.setCustomId(scene[i].menus[0].id);
                menu.setPlaceholder(scene[i].menus[0].placeholder);
                for(let j=0; j<scene[i].menus[0].options.length; j++){
                    const option = new StringSelectMenuOptionBuilder();
                    option.setLabel(scene[i].menus[0].options[j].menu[0].label);
                    option.setEmoji(scene[i].menus[0].options[j].menu[0].emoji);
                    option.setValue(scene[i].menus[0].options[j].menu[0].value);
                    option.setDescription(scene[i].menus[0].options[j].menu[0].description);
                    menu.addOptions(option);
                    menus.addComponents(menu);
                }
            }
            if(scene[i].buttons){
                buttons = new ActionRowBuilder();

                for(let j=0; j<scene[i].buttons.length; j++){
                    const button = new ButtonBuilder();
                    button.setLabel(`${scene[i].buttons[j].label}`);
                    button.setEmoji(`${scene[i].buttons[j].emoji}`);
                    button.setCustomId(`${scene[i].buttons[j].id}`);
                    switch(scene[i].buttons[j].style){
                        case "Primary" : button.setStyle(ButtonStyle.Primary); break;
                        case "Secondary" : button.setStyle(ButtonStyle.Secondary); break;
                        case "Success" : button.setStyle(ButtonStyle.Success); break;
                        case "Danger" : button.setStyle(ButtonStyle.Danger); break;
                        case "Link" : button.setStyle(ButtonStyle.Link); break;
                        default : button.setStyle(ButtonStyle.Primary); break;
                    }
                    button.setDisabled((scene[i].buttons[j].disabled)==="true");
                    buttons.addComponents(button);
                }
            }
            break;
        }
    }

    components = menus ? components.concat(menus) : components;
    components = buttons ? components.concat(buttons) : components;
    
    return {content: "test", files: attachment, embeds: embed, components: components, ephemeral: true};
}

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