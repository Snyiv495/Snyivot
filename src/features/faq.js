/*****************
    faq.js
    スニャイヴ
    2025/08/27
*****************/

module.exports = {
    exe: execute,
}

const gui = require("../core/gui");
const helper = require("../core/helper");

//FAQの実行
async function execute(trigger, map){
    try{
        const system_id = helper.getSystemId(trigger);
        
        //延期の送信
        if(helper.isInteraction(trigger) && !system_id.includes("modal")){
            await helper.sendDefer(trigger);
        }

        await helper.sendGUI(trigger, gui.create(map, system_id, {"{{__BOT_ID__}}":`<@${process.env.BOT_ID}>`}));
        return;
    }catch(e){
        throw new Error(`faq.js => execute() \n ${e}`);
    }
}