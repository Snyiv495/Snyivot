/******************
    progress.js
    スニャイヴ
    2024/10/17
******************/

module.exports = {
    createProgressbar: createProgressbar,
    stepProgress: stepProgress,
}

//進捗バーの作成
async function createProgressbar(interaction, stepNum){
    const progress = {current: 0, step: Math.floor(100/stepNum)};

    await interaction.deferReply({ephemeral: true});
    await interaction.editReply({content: "進捗[----------]0%"});

    return progress;
}

//進捗バーの進展
async function stepProgress(interaction, progress){
    let bar = "";

    progress.current = ((progress.current+(progress.step*2)-1)<100) ? progress.current+progress.step : 100;
    
    for(let i=0; i<10; i++){
        if(i < Math.floor(progress.current/10)){
            bar += "#";
        }else{
            bar += "-";
        }
    }
    await interaction.editReply({content: `進捗[${bar}]${progress.current}%`});

    return progress;
}