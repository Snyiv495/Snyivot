/*****************
    command.js    
    スニャイヴ
    2023/12/08
*****************/

/*************
    export    
*************/
module.exports = {
    getCmd: getCmd,
    deletext: deletext,
    //help: help
}

/*************
    import    
*************/
const {SlashCommandBuilder} = require('discord.js');
const embed = require('./embed');

/***************
    function    
***************/

//コマンドのゲッター
function getCmd(){
    return new SlashCommandBuilder()
    .setName("snyivot-deletext")
    .setDescription("Snyivotの文章消去コマンド")
    .addStringOption(option => option
        .setName("userid")
        .setDescription("消去するユーザーのID")
    )
    .addIntegerOption(option => option
        .setName("num")
        .setDescription("消去する件数 (2~100)")
        .setMinValue(2)
        .setMaxValue(100)
    )
}

//テキストを消去するメソッド
function deletext(interaction){
    const num = interaction.options.get("num") ? interaction.options.get("num").value : 2;
    interaction.channel.bulkDelete(num);
}