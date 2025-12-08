/*****************
    cui.js
    スニャイヴ
    2025/10/21
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
    try{
        const cmds = [];

        //コマンド
        for(const element of json){
            //フォーマット定義のスキップ
            if(element.name === "string") continue;

            const cmd = new SlashCommandBuilder();
            cmd.setName(element.name);
            cmd.setDescription(element.description);

            //サブコマンド
            for(const sub_element of element.subcommand){
                const sub_cmd = new SlashCommandSubcommandBuilder();
                sub_cmd.setName(sub_element.name);
                sub_cmd.setDescription(sub_element.description);

                //オプション
                for(const opt of sub_element.option){

                    //stringオプション
                    if(opt.type === "string"){
                        const str_opt = new SlashCommandStringOption();
                        str_opt.setName(opt.name);
                        str_opt.setDescription(opt.description);
                        str_opt.setAutocomplete(opt.autocomplete);
                        str_opt.setRequired(opt.required);
                        if(opt.max) str_opt.setMaxLength(opt.max);
                        if(opt.min) str_opt.setMinLength(opt.min);
                        for(const choice of opt.choices){
                            str_opt.addChoices({name: choice.name, value: choice.value});
                        }
                        sub_cmd.addStringOption(str_opt);
                    }

                    //numberオプション
                    if(opt.type === "number"){
                        const num_opt = new SlashCommandNumberOption();
                        num_opt.setName(opt.name);
                        num_opt.setDescription(opt.description);
                        num_opt.setAutocomplete(opt.autocomplete);
                        num_opt.setRequired(opt.required);
                        if(opt.max) num_opt.setMaxValue(opt.max);
                        if(opt.min) num_opt.setMinValue(opt.min);
                        sub_cmd.addNumberOption(num_opt);
                    }

                    //booleanオプション
                    if(opt.type === "boolean"){
                        const bool_opt = new SlashCommandBooleanOption();
                        bool_opt.setName(opt.name);
                        bool_opt.setDescription(opt.description);
                        bool_opt.setRequired(opt.required);
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

        //機能選択
        for(const prefix in feature_modules){
            if(system_id.startsWith(prefix)){
                await feature_modules[prefix].exe(interaction, map);
                return;
            }
        }

    }catch(e){
        throw new Error(`cui.js => slashCmd() \n ${e}`);
    }

    await helper.sendGUI(interaction, gui.create(map, "null"));
    throw new Error("cui.js => slashCmd() \n not define feature.exe()");
}

//コマンドの補助
async function autoComplete(interaction, map){
    try{
        const system_id = helper.getSystemId(interaction);
        const feature_modules = helper.getFeatureModules();

        //機能選択
        for(const prefix in feature_modules){
            if(system_id.startsWith(prefix)){
                await feature_modules[prefix].autoComplete(interaction, map);
                return;
            }
        }

    }catch(e){
        throw new Error(`cui.js => autoComplete() \n ${e}`);
    }

    await helper.sendGUI(interaction, gui.create(map, "null"));
    throw new Error("cui.js => autoComplete() \n not define feature.autoComplete()");
}

//メッセージコマンド実行
async function msgCmd(message, map){
    try{
        const system_id = helper.getSystemId(message);
        const feature_modules = helper.getFeatureModules();

        //機能選択
        for(const prefix in feature_modules){
            if(system_id.startsWith(prefix)){
                await feature_modules[prefix].exe(message, map);
                return;
            }
        }

        //GUIの送信
        await helper.sendGUI(message, gui.create(map, system_id, {"{{__REPLY__}}":message.args?.reply}));
        return;
    }catch(e){
        throw new Error(`cui.js => msgCmd() \n ${e}`);
    }
}