/*****************
    cui.js
    スニャイヴ
    2025/05/11
*****************/

module.exports = {
    cmd: cmd,
}

const qna = require('./execute/qna');

//コマンドの実行
async function cmd(interaction, map){
    
    await interaction.deferReply({ephemeral: true});
    await qna.exe(interaction, map);

    return 0;
}