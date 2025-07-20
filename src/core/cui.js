/*****************
    cui.js
    スニャイヴ
    2025/07/20
*****************/

module.exports = {
    getSlashCmds: getSlashCmds,
    slashCmd: slashCmd,
    autoComplete: autoComplete,
    call: call,
    callFunc: callFunc
}

const {SlashCommandBuilder, SlashCommandStringOption, SlashCommandNumberOption, SlashCommandSubcommandBuilder, SlashCommandBooleanOption} = require("discord.js");
const gui = require("./gui");

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

//コマンドの取得
function getSlashCmds(json){
    try{
        const cmds = [];

        //コマンドを順に作成
        for(let i=1; i<json.length; i++){
            const cmd = new SlashCommandBuilder();

            cmd.setName(json[i].name);
            cmd.setDescription(json[i].description);

            //サブコマンドを順に作成
            for(let j=0; j<json[i].subcommand.length; j++){
                const sub_cmd = new SlashCommandSubcommandBuilder();

                sub_cmd.setName(json[i].subcommand[j].name);
                sub_cmd.setDescription(json[i].subcommand[j].description);

                //オプションを順に作成
                for(let k=0; k<json[i].subcommand[j].option.length; k++){

                    //stringオプション
                    if(json[i].subcommand[j].option[k].type === "string"){
                        const str_opt = new SlashCommandStringOption();
            
                        str_opt.setName(json[i].subcommand[j].option[k].name);
                        str_opt.setDescription(json[i].subcommand[j].option[k].description);
                        str_opt.setAutocomplete(json[i].subcommand[j].option[k].autocomplete);
                        str_opt.setRequired(json[i].subcommand[j].option[k].required);
                        for(let l=0; l<json[i].subcommand[j].option[k].choices.length; l++){
                            str_opt.addChoices({name : json[i].subcommand[j].option[k].choices[l].name, value : json[i].subcommand[j].option[k].choices[l].value});
                        }
            
                        sub_cmd.addStringOption(str_opt);
                    }

                    //numberオプション
                    if(json[i].subcommand[j].option[k].type === "number"){
                        const num_opt = new SlashCommandNumberOption();
            
                        num_opt.setName(json[i].subcommand[j].option[k].name);
                        num_opt.setDescription(json[i].subcommand[j].option[k].description);
                        num_opt.setAutocomplete(json[i].subcommand[j].option[k].autocomplete);
                        num_opt.setRequired(json[i].subcommand[j].option[k].required);
                        num_opt.setMaxValue(json[i].subcommand[j].option[k].maxvalue ?? 1);
                        num_opt.setMinValue(json[i].subcommand[j].option[k].minvalue ?? 0);
            
                        sub_cmd.addNumberOption(num_opt);
                    }

                    //boolオプション
                    if(json[i].subcommand[j].option[k].type === "bool"){
                        const bool_opt = new SlashCommandBooleanOption();
            
                        bool_opt.setName(json[i].subcommand[j].option[k].name);
                        bool_opt.setDescription(json[i].subcommand[j].option[k].description);
                        bool_opt.setRequired(json[i].subcommand[j].option[k].required);
            
                        sub_cmd.addBooleanOption(bool_opt);
                    }
                }
            
                cmd.addSubcommand(sub_cmd);
            }
            
            cmds.push(cmd);
        }

        return cmds;
    }catch(e){
        throw new Error(e);
    }
}

//コマンドの実行
async function slashCmd(interaction, map){
    const command_name = interaction.commandName;

    for(const prefix in feature_modules){
        if(command_name.startsWith(prefix)){
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

//コマンドの補助
async function autoComplete(interaction, map){
    const command_name = interaction.commandName;

    for(const prefix in feature_modules){
        if(command_name.startsWith(prefix)){
            try{
                await feature_modules[prefix].autoComplete(interaction, map);
                return 0;
            }catch(e){
                throw new Error(e);
            }
        }
    }

    return -1;
}

//呼び出しの実行
async function call(message, map){
    
    //GUIの送信
    if(message.content.match(new RegExp(`^<@${process.env.BOT_ID}>$`)) || message.content.match(new RegExp(`^@${message.guild.members.me.displayName}$`))){
        try{
            await message.reply(gui.create(map, "mention"));
            await message.delete().catch(() => null);
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }

    //メンション呼び出し
    if(message.content.match(new RegExp(`^<@${process.env.BOT_ID}>.+`)) || message.content.match(new RegExp(`^@${message.guild.members.me.displayName}.+`))){
        try{
            await ai.call(message, map);
            return 0
        }catch(e){
            throw new Error(e);
        }
    }

    //名指し呼び出し    (メンションと名指しでわける意味が発生した時用)
    if(message.content.match(new RegExp(/(すにゃ|スニャ|すな|スナ|すに|スニ)(ぼっと|ボット|ぼ|ボ|bot|Bot|BOT)/))){
        try{
            await ai.call(message, map);
            return 0
        }catch(e){
            throw new Error(e);
        }
    }

}

//関数呼び出しの実行
async function callFunc(message, map){
    const command_name = interaction.commandName;

    for(const prefix in feature_modules){
        if(command_name.startsWith(prefix)){
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
        message.reply(gui.create(map, message.customId));
        return 0;
    }catch(e){
        throw new Error(e);
    }
}