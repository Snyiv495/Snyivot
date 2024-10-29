/*****************
    gui.js
    スニャイヴ
    2024/10/29
*****************/

module.exports = {
    createGui: createGui,
    sendGui: sendGui,
}

const {EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuOptionBuilder} = require("discord.js");
const cohere = require('./cohere/cohere');
const voicevox = require('./voicevox/voicevox');

//GUIの作成
async function createGui(id, scene){
    let files = [];
    let embeds = [];
    let components = [];
    let menus = null;
    let buttons = null;

    for(let i=0; i<scene.length; i++){
        if(scene[i].scene === id){

            //埋め込みの動的作成
            if(scene[i].embeds){
                const attachment = new AttachmentBuilder();
                const embed = new EmbedBuilder();

                attachment.setName("icon.png");
                attachment.setFile(`${scene[i].embeds[0].thumbnail}`);

                embed.setTitle(`${scene[i].embeds[0].title}`);
                scene[i].embeds[0].url ? embed.setURL(`${scene[i].embeds[0].url}`) : null;
                embed.setThumbnail("attachment://icon.png");
                scene[i].embeds[0].description ? embed.setDescription(`${scene[i].embeds[0].description}`) : null;
                for(let j=0; j<scene[i].embeds[0].fields.length; j++){
                    embed.addFields({name: `${scene[i].embeds[0].fields[j].name}`, value: `${scene[i].embeds[0].fields[j].value}`});
                }
                scene[i].embeds[0].image ? embed.setImage(`${scene[i].embeds[0].image}`): null;
                scene[i].embeds[0].footer ? embed.setFooter({text: `${scene[i].embeds[0].footer}`}) : null;
                embed.setColor(`${scene[i].embeds[0].color}`);

                embeds.push(embed);
                files.push(attachment);
            }

            //メニューの動的作成
            if(scene[i].menus){
                const menu = new StringSelectMenuBuilder();
                menus = new ActionRowBuilder();

                menu.setCustomId(`${scene[i].menus[0].id}`);
                menu.setPlaceholder(`${scene[i].menus[0].placeholder}`);
                for(let j=0; j<scene[i].menus[0].options.length; j++){
                    const option = new StringSelectMenuOptionBuilder();
                    option.setLabel(`${scene[i].menus[0].options[j].label}`);
                    option.setEmoji(`${scene[i].menus[0].options[j].emoji}`);
                    option.setValue(`${scene[i].menus[0].options[j].value}`);
                    option.setDescription(`${scene[i].menus[0].options[j].description}`);
                    menu.addOptions(option);
                }
                menus.addComponents(menu);
                components.push(menus);
            }

            //ボタンの動的作成
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
                components.push(buttons);
            }
            break;
        }
    }

    return {files: files, embeds: embeds, components: components, ephemeral: true};
}

//GUIの送信
async function sendGui(interaction, scene){
    const id = interaction.values ? interaction.values[0] : interaction.customId;
    if(id==="home"){
        await interaction.deferReply({ephemeral: true});
    }else{
        await interaction.deferUpdate();
        await interaction.editReply({components: []});
    }
    await interaction.editReply(await createGui(id, scene));
    return 0;
}


//終了
async function guiQuit(interaction){
    await interaction.deferUpdate();
    await interaction.editReply({content: "Loading...", files: [], embeds: [], components: [], ephemeral: true});
    await interaction.editReply(createQuitEmbed());
    return 0;
}