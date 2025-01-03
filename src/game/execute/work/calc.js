/*****************
    calc.js
    スニャイヴ
    2025/01/04
*****************/

module.exports = {
    exe: execute,
}

require('dotenv').config();
const {EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextInputBuilder, ModalBuilder, TextInputStyle} = require('discord.js');
const db = require('../../db');

//問題の作成
function createProbrem(interaction, map){
    const calc_info = {probrem: null, anser: 0, correct: false};
    const difficult = Math.floor(Math.random()*10)===0 ? true : false;
    const sel = Math.floor(Math.random()*4);

    if(!difficult){
        switch(sel){
            case 0 : {
                const length = Math.floor(Math.random()*89)+11;
                const width = Math.floor(Math.random()*89)+11;
                calc_info.probrem = `縦${length}㍉ 横${width}㍉ の四角形の面積は何平方ミリメートルかな？`;
                calc_info.anser = length*width;
                break;
            }
            case 1 : {
                const price = Math.floor(Math.random()*899)+101;
                const discount = (Math.floor(Math.random()*9)+1)*10;
                calc_info.probrem = `${price}円の商品が${discount}%引きで売られてるよ！何円かな？`
                calc_info.anser = Math.floor((price-(price*discount/100))*10)/10;
                break;
            }
            case 2 : {
                const A = Math.floor(Math.random()*9)+1;
                const B = Math.floor(Math.random()*9)+1;
                const C = Math.floor(Math.random()*9)+1;
                const D = Math.floor(Math.random()*9)+1;
                const E = Math.floor(Math.random()*9)+1;
                calc_info.probrem = `点数[${A}, ${B}, ${C}, ${D}, ${E}]の平均はいくらかな？`
                calc_info.anser = Math.floor(((A+B+C+D+E)/5)*10)/10;
                break;
            }
            case 3 : {
                const A = Math.floor(Math.random()*10)+11;
                const B = Math.floor(Math.random()*10)+11;
                calc_info.probrem = `2種類の同じサイズのピザをそれぞれ${A-3}/${A}枚と${B-5}/${B}枚食べたよ！合計何枚食べたかな？`
                calc_info.anser = Math.floor(((2*A*B-5*A-3*B)/(A*B))*10)/10;
                break;
            }
            default : break;
        }
    }else{
        switch(sel){
            case 0 : {
                const A = Math.floor(Math.random()*8)+2;
                const B = Math.floor(Math.random()*8)+2;
                const A_B = Math.floor(Math.random()*8)+2;
                
                calc_info.probrem = `[難]確率P(A)=1/${A},P(B)=1/${B},P(A|B)=1/${A_B}のときのP(B|A)`
                calc_info.anser = Math.floor((A/(B*A_B))*10)/10;
                break;
            }
            case 1 : {
                const A11 = Math.floor(Math.random()*11);
                const A12 = Math.floor(Math.random()*11);
                const A21 = Math.floor(Math.random()*11);
                const A22 = Math.floor(Math.random()*11);
                calc_info.probrem = `[難]2*2の行列((${A11},${A12}),(${A21},${A22}))について行列式を求めよ`
                calc_info.anser = A11*A22-A12*A21;
                break;
            }
            case 2 : {
                const first_term = Math.floor(Math.random()*11);
                const term_ratio = Math.floor(Math.random()*4)+2;
                calc_info.probrem = `[難]初項${first_term}, 公比1/${term_ratio}の無限等比数列の和を求めよ`
                calc_info.anser = Math.floor((first_term/(1-term_ratio))*10)/10;
            }
            case 3 : {
                const n = Math.floor(Math.random()*90000)+10000;
                calc_info.probrem = `[難]整数n=${n}のデジタル根を求めよ`
                calc_info.anser = 1+((n-1)%9);
            }
            default : break;
        }
    }

    map.set(`work_calc_${interaction.user.id}`, calc_info);

    return calc_info;
}

//モーダルの作成
function createModal(calc_info){
    const anser = new TextInputBuilder();
    const modal = new ModalBuilder();
    
    anser.setCustomId("anser")
    anser.setLabel(`${calc_info.probrem}`)
    anser.setPlaceholder("小数点以下は切り捨て, 数値のみで回答");
    anser.setStyle(TextInputStyle.Short);
    anser.setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(anser));

	modal.setCustomId("game_work_calc_modal");
	modal.setTitle("この問題の答えを教えてほしいのだ！");

    return modal;
}

//埋め込みの作成
function createEmbed(calc_info, money){
    const embeds = [];
    const components = [];

    const embed = new EmbedBuilder();
    const buttons = new ActionRowBuilder();

    const again = new ButtonBuilder();
    const home = new ButtonBuilder();
    const quit = new ButtonBuilder();

    if(calc_info.correct){
        embed.setTitle("合ってたのだ！");
        embed.setDescription("助かったのだ！");
        embed.setColor(0x00FF00);
    }else{
        embed.setTitle("違ったみたいなのだ...");
        embed.setDescription("次こそ助けてほしいのだ！");
        embed.setColor(0xFF0000);
    }
    
    embed.setFooter({text: `所持金：${money}`});
    embeds.push(embed);

    again.setLabel("もう一問！");
    again.setEmoji("🔂");
    again.setCustomId("game_work_calc_again_exe");
    again.setStyle(ButtonStyle.Success);
    buttons.addComponents(again);

    home.setLabel("ゲーム選択");
    home.setEmoji("🎮");
    home.setCustomId("game_home");
    home.setStyle(ButtonStyle.Secondary);
    buttons.addComponents(home);

    quit.setLabel("終わる");
    quit.setEmoji("⚠️");
    quit.setCustomId("quit");
    quit.setStyle(ButtonStyle.Danger);
    quit.setDisabled(false);
    buttons.addComponents(quit);

    components.push(buttons);

    return {content: "", files: [], embeds: embeds, components: components, ephemeral: true};
}

//演算士の実行
async function execute(interaction, map){

    //出題
    if(!interaction.isModalSubmit()){
        await interaction.showModal(createModal(createProbrem(interaction, map)));

        try{await interaction.editReply({content: "Snyivot が考え中...", files: [], embeds: [], components: [], ephemeral: true});}catch(e){};

        return 0;
    }

    //正誤判定
    const user_info = await db.getUserInfo(interaction.user.id);
    const calc_info = map.get(`work_calc_${interaction.user.id}`);
    const anser = interaction.fields.getTextInputValue("anser");

    if(!isNaN(anser) && parseFloat(anser)==calc_info.anser){
        calc_info.correct = true;
        user_info.money += 10;
        await db.setUserInfo(interaction.user.id, user_info);
    }

    map.delete(`work_calc_${interaction.user.id}`);
    await interaction.editReply(createEmbed(calc_info, user_info.money));
    
    return 0;
}