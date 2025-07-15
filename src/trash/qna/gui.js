/*****************
    gui.js
    スニャイヴ
    2025/02/25
*****************/

module.exports = {
    menu: menu,
    button: button,
    modal: modal,
}

const qna = require('./execute/qna');

//メニューの実行
async function menu(interaction, map){
    await interaction.deferUpdate();
    
    switch(true){
        case /qna_ai_exe/.test(interaction.values[0]) : {
            await ai.exe(interaction, map);
            return 0;
        }
        case /qna_game_exe/.test(interaction.values[0]) : {
            await game.exe(interaction, map);
            return 0;
        }
        case /qna_readout_exe/.test(interaction.values[0]) : {
            await readout.exe(interaction, map);
            return 0;
        }
        default : break;
    }

    return -1;
}

//ボタンの実行
async function button(interaction, map){
    await interaction.deferUpdate();

    switch(true){
        case /qna_ai_exe/.test(interaction.customId) : {
            await ai.exe(interaction, map);
            return 0;
        }
        case /qna_game_exe/.test(interaction.customId) : {
            await game.exe(interaction, map);
            return 0;
        }
        case /qna_readout_exe/.test(interaction.customId) : {
            await readout.exe(interaction, map);
            return 0;
        }
        default : break;
    }

    return -1;
}

//モーダルの実行
async function modal(interaction, map){
    console.log(interaction);
    return -1;
}