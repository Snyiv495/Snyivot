/*****************
    gui.js
    スニャイヴ
    2025/03/19
*****************/

module.exports = {
    menu: menu,
    button: button,
    modal: modal,
}

const chat = require('./execute/chat');
const draw = require('./execute/draw');

async function progressTimer(interaction, content){
    const interval = setInterval(async () => {

        switch(true){
            case /🕐/.test(content) : {
                content.replace("🕐", "🕑");
                break;
            }
            case /🕑/.test(content) : {
                content.replace("🕑", "🕒");
                break;
            }
            case /🕒/.test(content) : {
                content.replace("🕒", "🕓");
                break;
            }
            case /🕓/.test(content) : {
                content.replace("🕓", "🕔");
                break;
            }
            case /🕔/.test(content) : {
                content.replace("🕔", "🕕");
                break;
            }
            case /🕕/.test(content) : {
                content.replace("🕕", "🕖");
                break;
            }
            case /🕖/.test(content) : {
                content.replace("🕖", "🕗");
                break;
            }
            case /🕗/.test(content) : {
                content.replace("🕗", "🕘");
                break;
            }
            case /🕘/.test(content) : {
                content.replace("🕘", "🕙");
                break;
            }
            case /🕙/.test(content) : {
                content.replace("🕙", "🕚");
                break;
            }
            case /🕚/.test(content) : {
                content.replace("🕚", "🕛");
                break;
            }
            case /🕛/.test(content) : {
                content.replace("🕛", "🕐");
                break;
            }
            default : {
                content.concat("🕛");
                break;
            }
        }

        await interaction.editReply({content: content});
        
    }, 500);

    return interval;
}

//メニューの実行
async function menu(interaction, map){
    
    switch(true){
        case /ai_chat_exe/.test(interaction.values[0]) : {
            await chat.exe(interaction, map);
            return 0;
        }
        case /ai_draw_exe/.test(interaction.values[0]) : {
            await draw.exe(interaction, map);
            return 0;
        }
        default : break;
    }

    return -1;
}

//ボタンの実行
async function button(interaction, map){

    switch(true){
        case /ai_chat_exe/.test(interaction.customId) : {
            await chat.exe(interaction, map);
            return 0;
        }
        case /ai_draw_exe/.test(interaction.customId) : {
            await draw.exe(interaction, map);
            return 0;
        }
        default : break;
    }

    return -1;
}

//モーダルの実行
async function modal(interaction, map){
    const content = "生成中なのだ";

    try{
        await interaction.update({content: content, files: [], embeds: [], components: [], ephemeral: true});
        interaction.interval = await progressTimer(interaction, content);
    }catch(e){
        await interaction.reply({content: content, files: [], embeds: [], components: [], ephemeral: true});
        interaction.interval = await progressTimer(interaction, content);
    }

    switch(true){
        case /ai_chat_modal/.test(interaction.customId) : {
            await chat.exe(interaction, map);
            return 0;
        }
        case /ai_draw_modal/.test(interaction.customId) : {
            await draw.exe(interaction, map);
            return 0;
        }
        default : break;
    }

    return -1;
}