/*****************
    gui.js
    スニャイヴ
    2025/08/12
*****************/

module.exports = {
    create : create,
    nguild : nguild,
    menu : menu,
    button : button,
    modal : modal,
    reaction : reaction
}

const {EmbedBuilder, AttachmentBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} = require("discord.js");
const fs = require('fs');

const helper = require("./helper");

//埋め込みの取得
function getEmbeds(gui, replacement){
    const embeds = [];

    if(gui.embeds.length){
        const embed = new EmbedBuilder();
        const gui_embed = gui.embeds[0];

        embed.setTitle(helper.replaceholder(gui_embed.title, replacement));
        embed.setURL(helper.replaceholder(gui_embed.url, replacement));
        embed.setDescription(helper.replaceholder(gui_embed.description, replacement));
        embed.setImage(helper.replaceholder(gui_embed.image, replacement));
        embed.setColor(helper.replaceholder(gui_embed.color, replacement));
        embed.setFooter({text: helper.replaceholder(gui_embed.footer, replacement)});
        embed.setThumbnail(`attachment://${helper.replaceholder(gui_embed.thumbnail?.name, replacement) ?? "thumbnail.png"}`);

        for(const field of Object.values(gui_embed.fields??{})){
            embed.addFields(
                {
                    name: helper.replaceholder(field.name, replacement),
                    value: helper.replaceholder(field.value, replacement),
                    inline: field.inline ?? false
                }
            );
        }

        embeds.push(embed);
    }

    return embeds;
}

//ファイルの取得
function getFiles(gui, replacement){
    const files = [];

    if(gui.embeds.length){
        const attachment = new AttachmentBuilder();
        const file_name = helper.replaceholder(gui.embeds[0].thumbnail?.name, replacement);
        const file_path = helper.replaceholder(gui.embeds[0].thumbnail?.path, replacement);
        const file_base64 = helper.replaceholder(gui.embeds[0].thumbnail?.base64, replacement);

        attachment.setName(file_name??"thumbnail.png");
        attachment.setFile((file_path&&fs.existsSync(file_path))?file_path:file_base64?Buffer.from(file_base64, "base64"):"assets/default.png");

        files.push(attachment);
    }

    if(gui.files.length){
        for(const file of Object.values(gui.files)){
            const attachment = new AttachmentBuilder();
            const file_name = helper.replaceholder(file?.name, replacement);
            const file_path = helper.replaceholder(file?.path, replacement);
            const file_base64 = helper.replaceholder(file?.base64, replacement);

            attachment.setName(file_name??"image.png");
            attachment.setFile((file_path&&fs.existsSync(file_path))?file_path:file_base64?Buffer.from(file_base64, "base64"):"assets/default.png");

            files.push(attachment);
        }
    }
    
    return files;
}

//メニューの取得
function getMenus(gui, replacement){
    const component = [];

    if(gui.menus.length){
        const menus = new ActionRowBuilder();
        const menu = new StringSelectMenuBuilder();
        const gui_menu = gui.menus[0];

        menu.setCustomId(helper.replaceholder(gui_menu.id, replacement)??"null");
        menu.setPlaceholder(helper.replaceholder(gui_menu.placeholder, replacement)??"null");
        menu.setDisabled(gui_menu.disabled ?? false);

        if(!gui_menu.options.length){
            const option = new StringSelectMenuOptionBuilder();
            option.setLabel("null");
            option.setValue("null");
            option.setDescription("null");
            option.setEmoji("🆖");
            menu.addOptions(option);
        }

        for(const opt of Object.values(gui_menu.options)){
            const option = new StringSelectMenuOptionBuilder();
            option.setLabel(helper.replaceholder(opt.label, replacement)??"null");
            option.setValue(helper.replaceholder(opt.value, replacement)??"null");
            option.setDescription(helper.replaceholder(opt.description, replacement)??"null");
            option.setEmoji(helper.replaceholder(opt.emoji, replacement)??"🆖");
            menu.addOptions(option);
        }

        menus.addComponents(menu);
        component.push(menus);
    }

    return component;
}

//ボタンの取得
function getButtons(gui, replacement){
    const component = [];

    if(gui.buttons.length){
        const buttons = new ActionRowBuilder();

        for(const gui_button of Object.values(gui.buttons)){
            const button = new ButtonBuilder();
            button.setLabel(helper.replaceholder(gui_button.label, replacement)??"null");
            button.setCustomId(helper.replaceholder(gui_button.id, replacement)??"null");
            button.setEmoji(helper.replaceholder(gui_button.emoji, replacement)??"🆖");
            button.setDisabled(gui_button.disabled ?? false);
            switch(helper.replaceholder(gui_button.style, replacement) ?? "Primary"){
                case "Primary" : button.setStyle(ButtonStyle.Primary); break;
                case "Secondary" : button.setStyle(ButtonStyle.Secondary); break;
                case "Success" : button.setStyle(ButtonStyle.Success); break;
                case "Danger" : button.setStyle(ButtonStyle.Danger); break;
                case "Link" : button.setStyle(ButtonStyle.Link); break;
                default : button.setStyle(ButtonStyle.Primary); break;
            }

            buttons.addComponents(button);
        }

        component.push(buttons)
    }

    return component;
}

//モーダルの取得
function getModal(gui, replacement){
    if(gui.modals.length){
        const modal = new ModalBuilder();
        const gui_modal = gui.modals[0];

        modal.setTitle(helper.replaceholder(gui_modal.title, replacement)??"null");
        modal.setCustomId(helper.replaceholder(gui_modal.id, replacement)??"null");

        if(!gui_modal.inputs.length){
            const text_input = new TextInputBuilder();

            text_input.setLabel("null");
            text_input.setCustomId("null");
            text_input.setPlaceholder("null");
            text_input.setMaxLength(2);
            text_input.setMinLength(1);
            text_input.setRequired(false);
            text_input.setStyle(TextInputStyle.Short)
            modal.addComponents(new ActionRowBuilder().addComponents(text_input));
        }

        for(const input of Object.values(gui_modal.inputs)){
            const text_input = new TextInputBuilder();

            text_input.setLabel(helper.replaceholder(input.label, replacement)??"null");
            text_input.setCustomId(helper.replaceholder(input.id, replacement)??"null");
            text_input.setPlaceholder(helper.replaceholder(input.placeholder, replacement)??"null");
            text_input.setMaxLength(input.max ?? 5);
            text_input.setMinLength(input.min ?? 1);
            text_input.setRequired(input.required ?? false);
            switch(helper.replaceholder(input.style, replacement) ?? "Short"){
                case "Short" : text_input.setStyle(TextInputStyle.Short); break;
                case "Paragraph" : text_input.setStyle(TextInputStyle.Paragraph); break;
                default : text_input.setStyle(TextInputStyle.Short); break;
            }
            modal.addComponents(new ActionRowBuilder().addComponents(text_input));
        }

        return modal;
    }

    return null;
}

//GUIの作成
function create(map, system_id, replacement={}){
    try{
        const gui_json = map.get("gui_json");
        const match_gui = gui_json.find(gui => gui.id === system_id);
        const content = helper.replaceholder(match_gui.content, replacement);
        const files = getFiles(match_gui, replacement);
        const embeds = getEmbeds(match_gui, replacement);
        const menus = getMenus(match_gui, replacement);
        const buttons = getButtons(match_gui, replacement);
        const components = menus.concat(buttons);
        const modal = getModal(match_gui, replacement);

        return modal ?? {content: content, files: files, embeds: embeds, components: components, ephemeral: true};
    }catch(e){
        throw new Error(`gui.js => create() \n not define system id : ${system_id}`);
    }
}

//ギルド外の実行
async function nguild(trigger, map){
    try{
        await helper.sendGUI(trigger, create(map, "not_guild"));
        return;
    }catch(e){
        throw new Error(`gui.js => nguild() \n ${e}`);
    }
}

//メニューの実行
async function menu(interaction, map){
    try{
        const system_id = helper.getSystemId(interaction);
        const feature_modules = helper.getFeatureModules();

        //機能の実行
        for(const prefix in feature_modules){
            if(system_id.startsWith(prefix)){
                await feature_modules[prefix].exe(interaction, map);
                return;
            }
        }

        //GUIの送信
        await helper.sendGUI(interaction, create(map, system_id));
        return;
    }catch(e){
        throw new Error(`gui.js => menu() \n ${e}`);
    }
}

//ボタンの実行
async function button(interaction, map){
    try{
        const system_id = helper.getSystemId(interaction);
        const feature_modules = helper.getFeatureModules();

        //機能の実行
        for(const prefix in feature_modules){
            if(system_id.startsWith(prefix)){
                await feature_modules[prefix].exe(interaction, map);
                return;
            }
        }

        //GUIの送信
        await helper.sendGUI(interaction, create(map, system_id));
        return;
    }catch(e){
        throw new Error(`gui.js => button() \n ${e}`);
    }
}

//モーダルの実行
async function modal(interaction, map){
    try{
        const system_id = helper.getSystemId(interaction);
        const feature_modules = helper.getFeatureModules();

        for(const prefix in feature_modules){
            if(system_id.startsWith(prefix)){
                await feature_modules[prefix].exe(interaction, map);
                return;
            }
        }
    }catch(e){
        throw new Error(`gui.js => modal() \n ${e}`);
    }
    
    throw new Error("gui.js => modal() \n not define feature.exe()");
}

//リアクションの実行
async function reaction(message, reaction, map){

    //メッセージを削除する
    if(reaction.emoji.name === "✂️"){
        message.delete().catch(() => null);
        return;
    }
}

/* todo
リアクションの実行の改修
*/