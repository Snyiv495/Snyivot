/*****************
    gui.js
    スニャイヴ
    2025/07/25
*****************/

module.exports = {
    create: create,
    nguild: nguild,
    menu: menu,
    button: button,
    modal: modal,
    reaction: reaction
}

const {EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require("discord.js");
const fs = require('fs');

const ai = require("../features/ai");
const faq = require("../features/faq");
const omikuji = require("../features/omikuji");
const read = require("../features/read");
const feature_modules = {
    "ai": ai,
    "faq": faq,
    "omikuji": omikuji,
    "read": read,
};

//GUIの作成
function create(map, id, pattern={}){
    const gui_json = map.get("gui_json");
    try{
        for(const gui of gui_json){
            if(gui.id === id){
                const content = gui.content?.replace(/<#{.*?}>/g, matched => pattern[matched]) ?? null;
                const files = [];
                const embeds = [];
                const components = [];

                const embed = new EmbedBuilder();
                const menu = new StringSelectMenuBuilder();
                const menus = new ActionRowBuilder();
                const buttons = new ActionRowBuilder();
                const modal = new ModalBuilder();

                if(gui.embeds.length){
                    const embed_0 = gui.embeds[0]
                    embed.setTitle(embed_0.title?.replace(/<#{.*?}>/g, matched => pattern[matched]) ?? null);
                    embed.setDescription(embed_0.description?.replace(/<#{.*?}>/g, matched => pattern[matched]) ?? null);
                    embed.setFooter({text: embed_0.footer?.replace(/<#{.*?}>/g, matched => pattern[matched]) ?? null});
                    embed.setURL(embed_0.url?.replace(/<#{.*?}>/g, matched => pattern[matched]) ?? null);
                    embed.setImage(embed_0.image?.replace(/<#{.*?}>/g, matched => pattern[matched]) ?? null);
                    embed.setColor(embed_0.color?.replace(/<#{.*?}>/g, matched => pattern[matched]) ?? null);

                    for(const field of Object.values(embed_0.fields??{})){
                        embed.addFields(
                            {
                                name: field.name.replace(/<#{.*?}>/g, matched => pattern[matched]),
                                value: field.value.replace(/<#{.*?}>/g, matched => pattern[matched]),
                                inline: field.inline ?? true
                            }
                        );
                    }
                    
                    const attachment = new AttachmentBuilder();
                    attachment.setFile(embed_0.thumbnail??fs.existsSync(`assets/sakamoto_ahiru/kasukabe_tsumugi/${id}.png`)?`assets/sakamoto_ahiru/kasukabe_tsumugi/${id}.png`:"assets/default.png");
                    attachment.setName("thumbnail.png");
                    embed.setThumbnail("attachment://thumbnail.png");
                    files.push(attachment);

                    embeds.push(embed);
                }

                if(gui.files.length){
                    for(const file of Object.values(gui.files)){
                        const attachment = new AttachmentBuilder();
                        attachment.setName(file.name.replace(/<#{.*?}>/g, matched => pattern[matched]));
                        attachment.setFile(Buffer.from(file.base64.replace(/<#{.*?}>/g, matched => pattern[matched]), 'base64'));
                        files.push(attachment);
                    }
                }

                if(gui.menus.length){
                    const menu_0 = gui.menus[0];
                    menu.setCustomId(menu_0.id.replace(/<#{.*?}>/g, matched => pattern[matched]));
                    menu.setPlaceholder(menu_0.placeholder.replace(/<#{.*?}>/g, matched => pattern[matched]));
                    menu.setDisabled(menu_0.disabled ?? false);

                    for(const opt of Object.values(menu_0.options)){
                        const option = new StringSelectMenuOptionBuilder();
                        option.setLabel(opt.label.replace(/<#{.*?}>/g, matched => pattern[matched]));
                        option.setValue(opt.value.replace(/<#{.*?}>/g, matched => pattern[matched]));
                        option.setEmoji(opt.emoji?.replace(/<#{.*?}>/g, matched => pattern[matched]) ?? "🈳");
                        option.setDescription(opt.description?.replace(/<#{.*?}>/g, matched => pattern[matched]) ?? "");
                        menu.addOptions(option);
                    }
                    menus.addComponents(menu);
                    components.push(menus);
                }

                if(gui.buttons.length){
                    for(const btn of Object.values(gui.buttons)){
                        const button = new ButtonBuilder();
                        button.setLabel(btn.label.replace(/<#{.*?}>/g, matched => pattern[matched]));
                        button.setCustomId(btn.id.replace(/<#{.*?}>/g, matched => pattern[matched]));
                        button.setEmoji(btn.emoji?.replace(/<#{.*?}>/g, matched => pattern[matched]) ?? "🈳");
                        button.setDisabled(btn.disabled ?? false);
                        switch(btn.style?.replace(/<#{.*?}>/g, matched => pattern[matched]) ?? "Primary"){
                            case "Primary" : button.setStyle(ButtonStyle.Primary); break;
                            case "Secondary" : button.setStyle(ButtonStyle.Secondary); break;
                            case "Success" : button.setStyle(ButtonStyle.Success); break;
                            case "Danger" : button.setStyle(ButtonStyle.Danger); break;
                            case "Link" : button.setStyle(ButtonStyle.Link); break;
                            default : button.setStyle(ButtonStyle.Primary); break;
                        }
                        buttons.addComponents(button);
                    }
                    components.push(buttons);
                }

                if(gui.modals.length){
                    const modal_0 = gui.modals[0];
                    modal.setTitle(modal_0.title.replace(/<#{.*?}>/g, matched => pattern[matched]));
                    modal.setCustomId(modal_0.id.replace(/<#{.*?}>/g, matched => pattern[matched]));
                    for(const input of Object.values(modal_0.inputs)){
                        const text_input = new TextInputBuilder();
                        text_input.setLabel(input.label.replace(/<#{.*?}>/g, matched => pattern[matched]));
                        text_input.setCustomId(input.id.replace(/<#{.*?}>/g, matched => pattern[matched]));
                        text_input.setPlaceholder(input.placeholder.replace(/<#{.*?}>/g, matched => pattern[matched]));
                        text_input.setMaxLength(input.max ?? 1);
                        text_input.setMinLength(input.min ?? 1);
                        text_input.setRequired(input.required);
                        switch(input.style?.replace(/<#{.*?}>/g, matched => pattern[matched]) ?? "Short"){
                            case "Short" : text_input.setStyle(TextInputStyle.Short); break;
                            case "Paragraph" : text_input.setStyle(TextInputStyle.Paragraph); break;
                            default : text_input.setStyle(TextInputStyle.Short); break;
                        }
                        modal.addComponents(new ActionRowBuilder().addComponents(text_input));
                    }
                    return modal;
                }

                return {content: content, files: files, embeds: embeds, components: components, ephemeral: true};
            }
        }
    }catch(e){
        throw new Error(e);
    }
}

//ギルド外の実行
function nguild(interaction, map){
    try{
        interaction.reply(create(map, "not_guild"));
        return 0;
    }catch(e){
        throw new Error(e);
    }
}

//メニューの実行
async function menu(interaction, map){
    const value = interaction.values[0];

    for(const prefix in feature_modules){
        if(value.startsWith(prefix)){
            try{
                await feature_modules[prefix].exe(interaction, map);
                return 0;
            }catch(e){
                throw new Error(e);
            }
        }
    }

    //ホームの実行
    try{
        //ephemeralメッセージか確認
        interaction.message?.flags.bitfield ? await interaction.deferUpdate() : await interaction.deferReply({ephemeral:true});
        interaction.editReply(create(map, interaction.values[0]));
        return 0;
    }catch(e){
        throw new Error(e);
    }
}

//ボタンの実行
async function button(interaction, map){
    const custom_id = interaction.customId;

    for(const prefix in feature_modules){
        if(custom_id.startsWith(prefix)){
            try{
                await feature_modules[prefix].exe(interaction, map);
                return 0;
            }catch(e){
                throw new Error(e);
            }
        }
    }

    //ホームの実行
    try{
        //ephemeralメッセージか確認
        interaction.message?.flags.bitfield ? await interaction.deferUpdate() : await interaction.deferReply({ephemeral:true});
        interaction.editReply(create(map, interaction.customId));
        return 0;
    }catch(e){
        throw new Error(e);
    }
}

//モーダルの実行
async function modal(interaction, map){
    const custom_id = interaction.customId;

    for(const prefix in feature_modules){
        if(custom_id.startsWith(prefix)){
            try{
                await feature_modules[prefix].exe(interaction, map);
                return 0;
            }catch(e){
                throw new Error(e);
            }
        }
    }
    
    return -1;
}

//リアクションの実行
async function reaction(message, reaction, map){

    //メッセージを削除する
    if(reaction.emoji.name === "✂️"){
        await message.delete().catch(() => null);
        return 0;
    }
}