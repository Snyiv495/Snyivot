/*****************
    faq.js
    スニャイヴ
    2025/07/215
*****************/

module.exports = {
    exe: execute,
}

const gui = require('../core/gui');

//FAQの実行
async function execute(interaction, map){
    const id = interaction?.commandName ? `${interaction.commandName}${interaction.options.getSubcommand()}` : interaction?.values?.[0] ?? interaction.customId;
    
    //ephemeralメッセージか確認
    if(!id.includes("modal")){
        interaction.message?.flags.bitfield ? await interaction.deferUpdate() : await interaction.deferReply?.({ephemeral:true});
    }

    interaction.editReply(gui.create(map, id, {"<#{BOT_ID}>":`<@${process.env.BOT_ID}>`}));
    
    return 0;
}