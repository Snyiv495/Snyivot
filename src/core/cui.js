/*****************
    cui.js
    スニャイヴ
    2025/08/12
*****************/

module.exports = {
    getSlashCmds : getSlashCmds,
    slashCmd : slashCmd,
    autoComplete : autoComplete,
    msgCmd : msgCmd,
}

const {SlashCommandBuilder, SlashCommandStringOption, SlashCommandNumberOption, SlashCommandSubcommandBuilder, SlashCommandBooleanOption} = require("discord.js");

const gui = require("./gui");
const helper = require("./helper");

//コマンドの取得
function getSlashCmds(json){
    const cmds = [];

    try{
        //コマンドを作成
        for(let i=1; i<json.length; i++){
            const cmd = new SlashCommandBuilder();

            cmd.setName(json[i].name);
            cmd.setDescription(json[i].description);

            //サブコマンドを作成
            for(let j=0; j<json[i].subcommand.length; j++){
                const sub_cmd = new SlashCommandSubcommandBuilder();

                sub_cmd.setName(json[i].subcommand[j].name);
                sub_cmd.setDescription(json[i].subcommand[j].description);

                //オプションを作成
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
        throw new Error(`cui.js => getSlashCmds() \n ${e}`);
    }
}

//コマンドの実行
async function slashCmd(interaction, map){
    try{
        const system_id = helper.getSystemId(interaction);
        const feature_modules = helper.getFeatureModules();

        for(const prefix in feature_modules){
            if(system_id.startsWith(prefix)){
                feature_modules[prefix].exe(interaction, map);
                return;
            }
        }

    }catch(e){
        throw new Error(`cui.js => slashCmd() \n ${e}`);
    }

    throw new Error("cui.js => slashCmd() \n not define feature.exe()");
}

//コマンドの補助
async function autoComplete(interaction, map){
    try{
        const system_id = helper.getSystemId(interaction);
        const feature_modules = helper.getFeatureModules();

        for(const prefix in feature_modules){
            if(system_id.startsWith(prefix)){
                feature_modules[prefix].autoComplete(interaction, map);
                return;
            }
        }

    }catch(e){
        throw new Error(`cui.js => autoComplete() \n ${e}`);
    }

    throw new Error("cui.js => autoComplete() \n not define feature.autoComplete()");
}

//メッセージコマンド実行
async function msgCmd(message, map){
    try{
        const system_id = helper.getSystemId(message);
        const feature_modules = helper.getFeatureModules();

        //機能の実行
        for(const prefix in feature_modules){
            if(system_id.startsWith(prefix)){
                await feature_modules[prefix].exe(message, map);
                return;
            }
        }

        //GUIの送信
        await helper.sendGUI(message, gui.create(map, system_id, {"{{__REPLY__}}":message.args?.reply}));
        await message.delete().catch(() => null);
        return;
    }catch(e){
        throw new Error(`cui.js => msgCmd() \n ${e}`);
    }
}

/* todo
getSlashCmdsの改修
*/