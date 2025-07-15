/*****************
    read.js
    スニャイヴ
    2025/07/15
*****************/

module.exports = {
    exe: execute,
    autoComplete: autoComplete,
    observeTC : observeTC,
    observeVC : observeVC
}

const {joinVoiceChannel, createAudioPlayer, createAudioResource, entersState, AudioPlayerStatus, StreamType} = require('@discordjs/voice');
const {Readable} = require("stream");
const db = require('../core/db');
const gui = require('../core/gui');
const voicevox = require('../integrations/voicevox');

//読み上げ開始
async function start(interaction, map){
    const text_channel = interaction.channel;
    const voice_channel = interaction.member.voice.channel;
    const old_voice_channel = interaction.guild.channels.cache.find((channel) => channel.type == 2 && channel.members.get(process.env.BOT_ID));

    //読み上げ開始要件の確認
    if((!(text_channel.type === 0 || text_channel.type === 2)) || (text_channel.type === 2 && !text_channel.joinable) || (!voice_channel) || (!voice_channel.joinable) || (!voice_channel.speakable) || (text_channel.type === 0 && !text_channel.members.find((member) => member.id === process.env.BOT_ID)) || (voice_channel.id === map.get(`read_text_${text_channel.id}`)) || (old_voice_channel && old_voice_channel.id != voice_channel.id)){
        interaction.editReply?.(gui.create(map, "read_start_failure", {"<#{text_channel}>":text_channel??"テキストチャンネル", "<#{voice_channel}>":voice_channel??"ボイスチャンネル"})) ?? interaction.reply(gui.create(map, "read_start_failure*", {"<#{text_channel}>":text_channel??"テキストチャンネル", "<#{voice_channel}>":voice_channel??"ボイスチャンネル"}));
        return 0;
    }

    try{
        //VC接続
        if(old_voice_channel?.id != voice_channel.id){
            const new_voice_channel = joinVoiceChannel(
                {
                    channelId: voice_channel.id,
                    guildId: voice_channel.guild.id,
                    adapterCreator: voice_channel.guild.voiceAdapterCreator,
                    selfMute: false,
                    selfDeaf: true,
                }
            )          
            map.set(`read_voice_${voice_channel.id}`, new_voice_channel.subscribe(createAudioPlayer()));
        }
            
        map.set(`read_text_${text_channel.id}`, voice_channel.id);
        
        //テスト発言
        interaction.cleanContent = `${interaction.guild.members.me.displayName}に読み上げを開始させたよ`
        observeTC(interaction, map);
                
        //開始の通知
        interaction.editReply?.(gui.create(map, "read"));
        interaction.channel.send(gui.create(map, "read_start", {"<#{text_channel}>":text_channel,"<#{voice_channel}>":voice_channel}));

        return 0;
    }catch(e){throw new Error(e);}
}

//読み上げ終了
async function end(interaction, map){
    const text_channel = interaction.channel;
    const voice_channel = interaction.member.voice.channel;
    const old_voice_channel = interaction.guild.channels.cache.find((channel) => channel.type == 2 && channel.members.get(process.env.BOT_ID)); 

    //読み上げ終了要件の確認
    if(!voice_channel || (voice_channel != old_voice_channel) || (map.get(`read_text_${text_channel.id}`) != voice_channel.id)){
        interaction.editReply?.(gui.create(map, "read_end_failure", {"<#{text_channel}>":text_channel??"テキストチャンネル", "<#{voice_channel}>":voice_channel??"ボイスチャンネル"})) ?? interaction.reply(gui.create(map, "read_end_failure*", {"<#{text_channel}>":text_channel??"テキストチャンネル", "<#{voice_channel}>":voice_channel??"ボイスチャンネル"}));
        return 0;
    }

    try{
        //読み上げを行っているテキストチャンネルが複数あるか確認する
        const other_text_channels = await interaction.guild.channels.cache.filter((channel) => {
            if(map.get(`read_text_${channel.id}`) && channel.id != text_channel){
                try{
                    map.delete(`read_text_${text_channel.id}`);
                    return channel;
                }catch(e){
                    throw new Error(e);
                }
            }
        });

        //読み上げを行っているチャンネルがなくなったら切断
        if(!other_text_channels.size){
            map.get(`read_voice_${voice_channel.id}`)?.connection.destroy();
            map.delete(`read_voice_${voice_channel.id}`);
            map.delete(`read_text_${text_channel.id}`);
        }

        //終了の通知
        interaction.editReply?.(gui.create(map, "read"));
        interaction.channel.send(gui.create(map, "read_end", {"<#{text_channel}>":text_channel, "<#{voice_channel}>":voice_channel}));

        return 0;
    }catch(e){
        throw new Error(e);
    }
}

//辞書追加
async function dictAdd(interaction, map){
    const server_info = await db.getServerInfo(interaction.guild.id);
    
    const input_word = interaction.options?.get("word")?.value ?? interaction.fields?.getTextInputValue("word").trim() ?? interaction.args.word;
    const input_kana = interaction.options?.get("kana")?.value ?? interaction.fields?.getTextInputValue("kana").trim() ?? interaction.args.kana;
    const input_accent = interaction.options?.get("accent")?.value ?? (interaction.fields?.fields?.get("accent") ? parseInt(interaction.fields.getTextInputValue("accent")) : NaN);
    const input_priority = interaction.options?.get("priority")?.value ?? (interaction.fields?.fields?.get("priority") ? parseInt(interaction.fields.getTextInputValue("priority")) : NaN);

    let word = input_word.substring(0, 10);
    let kana = input_kana.substring(0, 10);

    try{
        //VOICEVOXの辞書追加
        if(server_info.read_app === "VOICEVOX"){

            //情報の取得
            const audio_query = await voicevox.postAudioQuery(kana, 0);
            const accent = !Number.isNaN(input_accent) ? Math.min(Math.max(input_accent, 1), audio_query.data.accent_phrases.moras.length-1) : 1;
            const priority = !Number.isNaN(input_priority) ? Math.min(Math.max(input_priority, 0), 10) : 9;

            word = word.replace(/[A-Za-z0-9]/g, function(str){return String.fromCharCode(str.charCodeAt(0) + 0xFEE0);});
            kana = audio_query.data.kana.replace(/\/|、|_|'|？/g, "");

            //辞書の登録
            await voicevox.postImportUserDict(server_info.vv_dict);

            //単語の登録
            const word_index = server_info.read_dict.findIndex(entry => entry.word === word);
            if(word_index < 0){
                server_info.read_dict.push({"word" : word, "kana" : kana});
                await voicevox.postUserDictWord(word, kana, accent, priority);
            }else{
                server_info.read_dict[word_index].kana = kana;
                const uuids = Object.keys(server_info.vv_dict);
                for(let i=0; i<uuids.length; i++){
                    if(server_info.vv_dict[uuids[i]].surface === word){
                        await voicevox.putUserDictWord(uuids[i], word, kana, accent, priority);
                        break;
                    }
                }
            }
            
            //更新された辞書の取得
            server_info.vv_dict = (await voicevox.getUserDict()).data;

            //辞書の整合性の確認
            const read_dict_set = new Set(server_info.read_dict.map(entry => entry.word));
            for(const entry of Object.values(server_info.vv_dict)) {
                if(!read_dict_set.has(entry.surface)){
                    interaction.editReply?.(gui.create(map, "read_dict_add_interrupt_error")) ?? interaction.reply(gui.create(map, "read_dict_add_interrupt_error*"));
                    return 0;
                }
            }
        }

        //サーバー情報の保存
        await db.setServerInfo(interaction.guild.id, server_info);

        //辞書追加の通知
        interaction.editReply?.(gui.create(map, "read"));
        interaction.channel.send(gui.create(map, "read_dict_add", {"<#{word}>":word, "<#{kana}>":kana}));
        
        return 0;
    }catch(e){
        throw new Error(e);
    }
}

//辞書削除
async function dictDel(interaction, map){
    const server_info = await db.getServerInfo(interaction.guild.id);

    const input_word = interaction.options?.get("word")?.value ?? interaction.fields?.getTextInputValue("word") ?? interaction.args?.word ?? "";
    const word = input_word.substring(0, 10).replace(/[A-Za-z0-9]/g, function(str){return String.fromCharCode(str.charCodeAt(0) + 0xFEE0);});
    const word_index = server_info.read_dict.findIndex(entry => entry.word === word);

    //辞書の送信
    if(word_index < 0){
        let str_csv = "語句,カナ\n";
        for(const word_kana of server_info.read_dict){
            str_csv += `${word_kana.word},${word_kana.kana}\n`;
        }

        interaction.editReply?.(gui.create(map, "read_dict_del_send_csv", {"<#{base64_csv}>":Buffer.from(str_csv, "utf-8").toString("base64")})) ?? interaction.reply(gui.create(map, "read_dict_del_send_csv*", {"<#{base64_csv}>":Buffer.from(str_csv, "utf-8").toString("base64")}));
        return 0;
    }

    try{
        //VOICEVOXの辞書削除
        if(server_info.read_app === "VOICEVOX"){

            //辞書の登録
            await voicevox.postImportUserDict(server_info.vv_dict);
            
            //単語の削除
            const uuids = Object.keys(server_info.vv_dict);
            for(let i=0; i<uuids.length; i++){
                if(server_info.vv_dict[uuids[i]].surface === word){
                    await voicevox.deleteUserDictWord(uuids[i]);
                    break;
                }
            }

            //更新された辞書の取得
            server_info.vv_dict = (await voicevox.getUserDict()).data;

            //辞書の整合性の確認
            const read_dict_set = new Set(server_info.read_dict.map(entry => entry.word));
            for(const entry of Object.values(server_info.vv_dict)){
                if(!read_dict_set.has(entry.surface)){
                    interaction.editReply?.(gui.create(map, "read_dict_del_interrupt_error")) ?? interaction.reply(gui.create(map, "read_dict_del_interrupt_error*"));
                    return 0;
                }
            }
        }

        //単語の削除
        server_info.read_dict.splice(word_index, 1);

        //サーバー情報の保存
        await db.setServerInfo(interaction.guild.id, server_info);

        //辞書削除の通知
        interaction.editReply?.(gui.create(map, "read"));
        interaction.channel.send(gui.create(map, "read_dict_del", {"<#{word}>":word}));

        return 0;
    }catch(e){
        throw new Error(e);
    }
}

//ユーザー設定
async function setUser(interaction, map){
    const user_info = await db.getUserInfo(interaction.user.id);
    const server_info = await db.getServerInfo(interaction.guild.id);

    const input_speaker = interaction.options?.get("speaker")?.value ?? (interaction.customId?.includes("speaker") ? interaction.customId.split("@")[1] : null);
    const input_style = interaction.options?.get("style")?.value ?? (interaction.customId?.includes("style") ? interaction.customId.split("@")[1] : null);
    const input_pitch = interaction.options?.get("pitch")?.value ?? (interaction.fields?.fields?.get("pitch") ? parseFloat(interaction.fields.getTextInputValue("pitch")) : NaN);
    const input_intonation = interaction.options?.get("intonation")?.value ?? (interaction.fields?.fields?.get("intonation") ? parseFloat(interaction.fields.getTextInputValue("intonation")) : NaN);
    const input_username = interaction.options?.get("username")?.value ?? (interaction.fields?.fields?.get("username") ? interaction.fields.getTextInputValue("username").trim() : null);

    let speaker = null;
    let style = null;
    let pitch = null;
    let intonation = null;
    let username = null;
    let credit = null;

    //VOICEVOXの設定
    if(server_info.read_app === "VOICEVOX"){
        const vv_speakers = map.get("voicevox_speakers");
        const vv_speaker = input_speaker ?? user_info.vv_uuid ?? server_info.vv_uuid;
        const vv_style = input_style ?? user_info.vv_id ?? server_info.vv_id;
        let vv_speaker_info = null;
        let vv_style_info = null;

        //スピーカー設定
        if(vv_speaker === "ランダム"){
            const rand = Math.floor(Math.random()*vv_speakers.length);
            vv_speaker_info = vv_speakers[rand];
            user_info.vv_uuid = vv_speaker_info.speaker_uuid;
            speaker = vv_speaker_info.name;
        }else{
            vv_speaker_info = vv_speakers.find(speaker => speaker.name===vv_speaker || speaker.speaker_uuid===vv_speaker);
            if(vv_speaker_info){
                user_info.vv_uuid = vv_speaker_info.speaker_uuid;
                speaker = vv_speaker_info.name;
            }
        }

        //スタイル設定
        if(vv_speaker === "ランダム" || vv_style === "ランダム"){
            const rand = Math.floor(Math.random()*vv_speaker_info.styles.length);
            vv_style_info = vv_speaker_info.styles[rand];
            user_info.vv_id = vv_style_info.id;
            style = vv_style_info.name;
        }else{
            vv_style_info = vv_speaker_info.styles.find(style => style.name===vv_style || style.id===parseInt(vv_style));            
            if(vv_style_info){
                user_info.vv_id = vv_style_info.id;
                style = vv_style_info.name;
            }
            if(!input_style && !vv_style_info){
                user_info.vv_id = vv_speaker_info.styles[0].id;
                style = vv_speaker_info.styles[0].name;
            }
        }

        //その他パラメータ設定
        user_info.vv_pitch = !Number.isNaN(input_pitch) ? Math.min(Math.max(input_pitch, -0.15), 0.15) : user_info.vv_pitch ?? server_info.vv_pitch;
        user_info.vv_intonation = !Number.isNaN(input_intonation) ? Math.min(Math.max(input_intonation, 0.00), 2.00) : user_info.vv_intonation ?? server_info.vv_intonation;
        pitch = user_info.vv_pitch;
        intonation = user_info.vv_intonation;
        credit = `VOICEVOX:${speaker}`;
    }

    //キャラクター設定失敗
    if((input_speaker && !speaker) || (input_style && !style)){
        interaction.editReply(gui.create(map, "read_set_user_failure", {"<#{read_app}>":server_info.read_app}));
        return 0;
    }
    
    //その他パラメータ設定
    user_info.username = (input_username && input_username!="") ? input_username : (user_info.username ?? interaction.user.displayName);
    username = user_info.username;

    //設定の保存
    await db.setUserInfo(interaction.user.id, user_info);

    //ユーザー設定の通知
    interaction.editReply(gui.create(map, "read_set_user", {"<#{speaker}>":speaker, "<#{style}>":style, "<#{username}>":username, "<#{pitch}>":pitch, "<#{intonation}>":intonation, "<#{credit}>":credit}));
    
    return 0;
}

//ユーザー設定＠スピーカー
async function setUserSpeaker(interaction, map){
    const user_info = await db.getUserInfo(interaction.user.id);
    const server_info = await db.getServerInfo(interaction.guild.id);
    const MENU_MAX = 25;

    //VOICEVOXのスピーカー設定
    if(server_info.read_app === "VOICEVOX"){
        const vv_speakers = map.get("voicevox_speakers");

        //現在のスピーカー
        const vv_speaker_uuid = interaction.values[0].split("@")[1] ?? user_info.vv_uuid ?? server_info.vv_uuid;
        const vv_speaker_idx = vv_speakers.findIndex(speaker => speaker.speaker_uuid===vv_speaker_uuid);
        const vv_speaker_name = vv_speakers[vv_speaker_idx].name;
        const vv_style_name = vv_speakers[vv_speaker_idx].styles[0].name;

        //ページ
        const max_page = Math.ceil(vv_speakers.length/(MENU_MAX-2));
        const now_page = Math.ceil((vv_speaker_idx+1)/(MENU_MAX-2));
        const pre_page = now_page>1 ? now_page-1 : max_page;
        const next_page = now_page<max_page ? now_page+1 : 1;
        
        //ページの先頭スピーカー
        const pre_vv_speaker_idx = (pre_page-1)*(MENU_MAX-2);
        const next_vv_speaker_idx = (next_page-1)*(MENU_MAX-2);
        const pre_vv_speaker_uuid = vv_speakers.at(pre_vv_speaker_idx).speaker_uuid
        const next_vv_speaker_uuid = vv_speakers.at(next_vv_speaker_idx).speaker_uuid

        //情報の取得
        let vv_speaker_info = null;
        let vv_style_info = null;
        try{
            vv_speaker_info = (await voicevox.getSpeakerInfo(vv_speaker_uuid)).data;
            vv_style_info = vv_speaker_info.style_infos[0];
        }catch(e){
            throw new Error(e);
        }

        //メニューの更新
        const tmp_map = new Map([["gui_json", [JSON.parse(JSON.stringify(map.get("gui_json").find(gui => gui.id==="read_set_user_speaker")))]]]);
        if(pre_page < now_page){
            tmp_map.get("gui_json")[0].menus[0].options.push(
                {
                    "label" : "前のページへ",
                    "value" : `read_set_user_speaker@${pre_vv_speaker_uuid}`,
                    "description" : `${pre_page}/${max_page}`,
                    "emoji" : "🔼"
                }
            );
        }
        for(let i=((now_page-1)*(MENU_MAX-2)); i<vv_speakers.length && i<((now_page-1)*(MENU_MAX-2)+(MENU_MAX-2)); i++){
            if(i === vv_speaker_idx){
                tmp_map.get("gui_json")[0].menus[0].options.push(
                    {
                        "label" : `${vv_speaker_name}(${vv_style_name})`,
                        "value" : `read_set_user`,
                        "description" : "決定する",
                        "emoji" : "✅"
                    },
                )
            }else{
                tmp_map.get("gui_json")[0].menus[0].options.push(
                    {
                        "label" : vv_speakers[i].name,
                        "value" : `read_set_user_speaker@${vv_speakers[i].speaker_uuid}`,
                        "description" : vv_speakers[i].styles[0].name,
                        "emoji" : "🔘"
                    }
                )
            }
        }
        if(next_page > now_page){
            tmp_map.get("gui_json")[0].menus[0].options.push(
                {
                    "label" : "次のページへ",
                    "value" : `read_set_user_speaker@${next_vv_speaker_uuid}`,
                    "description" : `${next_page}/${max_page}`,
                    "emoji" : "🔽"
                }
            );
        }

        interaction.editReply(gui.create(tmp_map, "read_set_user_speaker", {
            "<#{speaker_name}>":vv_speaker_name,
            "<#{style_name}>":vv_style_name,
            "<#{policy_url}>":vv_speaker_info.policy.match(/(https?:\/\/[\w\-\.\/\?\,\#\:\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+)/)[0],
            "<#{icon_name}>":`icon.jpg`,
            "<#{icon_base64}>":vv_style_info.icon,
            "<#{voice_sample_name}>":`${vv_speaker_name}(${vv_style_name})のサンプル音声.mp3`,
            "<#{voice_sample_base64}>":vv_style_info.voice_samples[0],
            "<#{speaker_uuid}>":vv_speaker_uuid
        }));
        tmp_map.clear();
    }
    
    return 0;
}

//ユーザー設定＠スタイル
async function setUserStyle(interaction, map){
    const user_info = await db.getUserInfo(interaction.user.id);
    const server_info = await db.getServerInfo(interaction.guild.id);
    const MENU_MAX = 25;

    //VOICEVOXのスタイル設定
    if(server_info.read_app === "VOICEVOX"){
        const vv_speakers = map.get("voicevox_speakers");

        //現在のスピーカー
        const vv_speaker_uuid = user_info.vv_uuid ?? server_info.vv_uuid;
        const vv_speaker_idx = vv_speakers.findIndex(speaker => speaker.speaker_uuid===vv_speaker_uuid);
        const vv_speaker_name = vv_speakers[vv_speaker_idx].name;
        const vv_styles = vv_speakers[vv_speaker_idx].styles;
        const vv_style_id = interaction.values[0].split("@")[1] ?? vv_styles[0].id;
        const vv_style_idx = vv_styles.findIndex(style => style.id===parseInt(vv_style_id));
        const vv_style_name = vv_styles[vv_style_idx].name;

        //ページ
        const max_page = Math.ceil(vv_styles.length/(MENU_MAX-2));
        const now_page = Math.ceil((vv_style_idx+1)/(MENU_MAX-2));
        const pre_page = now_page>1 ? now_page-1 : max_page;
        const next_page = now_page<max_page ? now_page+1 : 1;
        
        //ページの先頭スタイル
        const pre_vv_style_idx = (pre_page-1)*(MENU_MAX-2);
        const next_vv_style_idx = (next_page-1)*(MENU_MAX-2);
        const pre_vv_style_id = vv_styles.at(pre_vv_style_idx).id
        const next_vv_style_id = vv_styles.at(next_vv_style_idx).id

        //情報の取得
        let vv_speaker_info = null;
        let vv_style_info = null;
        try{
            vv_speaker_info = (await voicevox.getSpeakerInfo(vv_speaker_uuid)).data;
            vv_style_info = vv_speaker_info.style_infos.find(info => info.id === parseInt(vv_style_id));
        }catch(e){
            throw new Error(e);
        }

        //メニューの更新
        const tmp_map = new Map([["gui_json", [JSON.parse(JSON.stringify(map.get("gui_json").find(gui => gui.id==="read_set_user_style")))]]]);
        if(pre_page < now_page){
            tmp_map.get("gui_json")[0].menus[0].options.push(
                {
                    "label" : "前のページへ",
                    "value" : `read_set_user_style@${pre_vv_style_id}`,
                    "description" : `${pre_page}/${max_page}`,
                    "emoji" : "🔼"
                }
            );
        }
        for(let i=((now_page-1)*(MENU_MAX-2)); i<vv_styles.length && i<((now_page-1)*(MENU_MAX-2)+(MENU_MAX-2)); i++){
            if(i === vv_style_idx){
                tmp_map.get("gui_json")[0].menus[0].options.push(
                    {
                        "label" : `${vv_speaker_name}(${vv_style_name})`,
                        "value" : `read_set_user`,
                        "description" : "決定する",
                        "emoji" : "✅"
                    },
                )
            }else{
                tmp_map.get("gui_json")[0].menus[0].options.push(
                    {
                        "label" : vv_styles[i].name,
                        "value" : `read_set_user_style@${vv_styles[i].id}`,
                        "description" : vv_speaker_name,
                        "emoji" : "🔘"
                    }
                )
            }
        }
        if(next_page > now_page){
            tmp_map.get("gui_json")[0].menus[0].options.push(
                {
                    "label" : "次のページへ",
                    "value" : `read_set_user_style@${next_vv_style_id}`,
                    "description" : `${next_page}/${max_page}`,
                    "emoji" : "🔽"
                }
            );
        }

        interaction.editReply(gui.create(tmp_map, "read_set_user_style", {
            "<#{speaker_name}>":vv_speaker_name,
            "<#{style_name}>":vv_style_name,
            "<#{policy_url}>":vv_speaker_info.policy.match(/(https?:\/\/[\w\-\.\/\?\,\#\:\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+)/)[0],
            "<#{icon_name}>":`icon.jpg`,
            "<#{icon_base64}>":vv_style_info.icon,
            "<#{voice_sample_name}>":`${vv_speaker_name}(${vv_style_name})のサンプル音声.mp3`,
            "<#{voice_sample_base64}>":vv_style_info.voice_samples[0],
            "<#{style_id}>":vv_style_id
        }));
        tmp_map.clear();
    }
    
    return 0;
}

//サーバー設定
async function setServer(interaction, map){
    const server_info = await db.getServerInfo(interaction.guild.id);
    
    const input_read_username = interaction.options?.get("read_username")?.value ?? /(y|Y|yes|Yes|YES)/.test(interaction.fields?.fields?.get("read_username")?.value);
    const input_read_username_always = interaction.options?.get("read_username_always")?.value ?? /(y|Y|yes|Yes|YES)/.test(interaction.fields?.fields?.get("read_username_always")?.value);
    const input_read_max = interaction.options?.get("read_max")?.value ?? (interaction.fields?.fields?.get("read_max") ? parseInt(interaction.fields.getTextInputValue("read_max")) : NaN);
    const input_read_app = interaction.options?.get("read_app")?.value ?? interaction.fields?.fields?.get("read_app")?.value.match(/VOICEVOX/);
    const input_read_set_override = interaction.options?.get("read_set_override")?.value ?? /(y|Y|yes|Yes|YES)/.test(interaction.fields?.fields?.get("read_set_override")?.value);

    const input_speaker = interaction.options?.get("speaker")?.value ?? (interaction.customId?.includes("speaker") ? interaction.customId.split("@")[1] : null);
    const input_style = interaction.options?.get("style")?.value ?? (interaction.customId?.includes("style") ? interaction.customId.split("@")[1] : null);
    const input_speed = interaction.options?.get("speed")?.value ?? (interaction.fields?.fields?.get("speed") ? parseFloat(interaction.fields.getTextInputValue("speed")) : NaN);
    const input_pitch = interaction.options?.get("pitch")?.value ?? (interaction.fields?.fields?.get("pitch") ? parseFloat(interaction.fields.getTextInputValue("pitch")) : NaN);
    const input_intonation = interaction.options?.get("intonation")?.value ?? (interaction.fields?.fields?.get("intonation") ? parseFloat(interaction.fields.getTextInputValue("intonation")) : NaN);
    const input_volume = interaction.options?.get("volume")?.value ?? (interaction.fields?.fields?.get("volume") ? parseFloat(interaction.fields.getTextInputValue("volume")) : NaN);

    let read_username = null;
    let read_username_always = null;
    let read_max = null;
    let read_app = null;
    let read_set_override = null;

    let speaker = null;
    let style = null;
    let speed = null;
    let pitch = null;
    let intonation = null;
    let volume = null;
    let credit = null;

    //VOICEVOXの設定
    if(server_info.read_app === "VOICEVOX"){
        const vv_speakers = map.get("voicevox_speakers");
        const vv_speaker = input_speaker ?? server_info.vv_uuid;
        const vv_style = input_style ?? server_info.vv_id;
        let vv_speaker_info = null;
        let vv_style_info = null;
        
        //スピーカー設定
        if(vv_speaker === "ランダム"){
            const rand = Math.floor(Math.random()*vv_speakers.length);
            vv_speaker_info = vv_speakers[rand];
            server_info.vv_uuid = vv_speaker_info.speaker_uuid;
            speaker = vv_speaker_info.name;
        }else{
            vv_speaker_info = vv_speakers.find(speaker => speaker.name===vv_speaker || speaker.speaker_uuid===vv_speaker);
            if(vv_speaker_info){
                server_info.vv_uuid = vv_speaker_info.speaker_uuid;
                speaker = vv_speaker_info.name;
            }
        }

        //スタイル設定
        if(vv_speaker === "ランダム" || vv_style === "ランダム"){
            const rand = Math.floor(Math.random()*vv_speaker_info.styles.length);
            vv_style_info = vv_speaker_info.styles[rand];
            server_info.vv_id = vv_style_info.id;
            style = vv_style_info.name;
        }else{
            vv_style_info = vv_speaker_info.styles.find(style => style.name===vv_style || style.id===parseInt(vv_style));            
            if(vv_style_info){
                server_info.vv_id = vv_style_info.id;
                style = vv_style_info.name;
            }
            if(!input_style && !vv_style_info){
                server_info.vv_id = vv_speaker_info.styles[0].id;
                style = vv_speaker_info.styles[0].name;
            }
        }

        //その他パラメータ設定
        server_info.vv_speed = !Number.isNaN(input_speed) ? Math.min(Math.max(input_speed, 0.50), 2.00) : server_info.vv_speed;
        server_info.vv_pitch = !Number.isNaN(input_pitch) ? Math.min(Math.max(input_pitch, -0.15), 0.15) : server_info.vv_pitch;
        server_info.vv_intonation = !Number.isNaN(input_intonation) ? Math.min(Math.max(input_intonation, 0.00), 2.00) : server_info.vv_intonation;
        server_info.vv_volume = !Number.isNaN(input_volume) ? Math.min(Math.max(input_volume, 0.00), 2.00) : server_info.vv_volume;
        speed = server_info.vv_speed;
        pitch = server_info.vv_pitch;
        intonation = server_info.vv_intonation;
        volume = server_info.vv_volume;
        credit = `VOICEVOX:${speaker}`;
    }

    //キャラクター設定失敗
    if((input_speaker && !speaker) || (input_style && !style)){
        interaction.editReply(gui.create(map, "read_set_server_failure", {"<#{read_app}>":server_info.read_app}));
        return 0;
    }

    //その他パラメータ設定
    server_info.read_username = input_read_username ?? server_info.read_username;
    server_info.read_username_always = input_read_username_always ?? server_info.read_username_always;
    server_info.read_max = !Number.isNaN(input_read_max) ? Math.min(Math.max(input_read_max, 10), 80) : server_info.read_max;
    server_info.read_app = input_read_app ?? server_info.read_app;
    server_info.read_set_override = input_read_set_override ?? server_info.read_set_override;
    read_username = server_info.read_username;
    read_username_always = server_info.read_username_always;
    read_max = server_info.read_max;
    read_app = server_info.read_app;
    read_set_override = server_info.read_set_override;

    //設定の保存
    await db.setServerInfo(interaction.guild.id, server_info);

    //サーバー設定の通知
    interaction.editReply(gui.create(map, "read_set_server_select"));
    interaction.channel.send(gui.create(map, "read_set_server", {"<#{speaker}>":speaker, "<#{style}>":style, "<#{read_username}>":read_username, "<#{read_username_always}>":read_username_always, "<#{read_max}>":read_max, "<#{read_app}>":read_app, "<#{read_set_override}>":read_set_override, "<#{speed}>":speed, "<#{pitch}>":pitch, "<#{intonation}>":intonation, "<#{volume}>":volume, "<#{credit}>":credit}));
    
    return 0;
}

//サーバー設定＠スピーカー
async function setServerSpeaker(interaction, map){
    const server_info = await db.getServerInfo(interaction.guild.id);
    const MENU_MAX = 25;

    //VOICEVOXのスピーカー設定
    if(server_info.read_app === "VOICEVOX"){
        const vv_speakers = map.get("voicevox_speakers");

        //現在のスピーカー
        const vv_speaker_uuid = interaction.values[0].split("@")[1] ?? server_info.vv_uuid;
        const vv_speaker_idx = vv_speakers.findIndex(speaker => speaker.speaker_uuid===vv_speaker_uuid);
        const vv_speaker_name = vv_speakers[vv_speaker_idx].name;
        const vv_style_name = vv_speakers[vv_speaker_idx].styles[0].name;

        //ページ
        const max_page = Math.ceil(vv_speakers.length/(MENU_MAX-2));
        const now_page = Math.ceil((vv_speaker_idx+1)/(MENU_MAX-2));
        const pre_page = now_page>1 ? now_page-1 : max_page;
        const next_page = now_page<max_page ? now_page+1 : 1;
        
        //ページの先頭スピーカー
        const pre_vv_speaker_idx = (pre_page-1)*(MENU_MAX-2);
        const next_vv_speaker_idx = (next_page-1)*(MENU_MAX-2);
        const pre_vv_speaker_uuid = vv_speakers.at(pre_vv_speaker_idx).speaker_uuid
        const next_vv_speaker_uuid = vv_speakers.at(next_vv_speaker_idx).speaker_uuid

        //情報の取得
        let vv_speaker_info = null;
        let vv_style_info = null;
        try{
            vv_speaker_info = (await voicevox.getSpeakerInfo(vv_speaker_uuid)).data;
            vv_style_info = vv_speaker_info.style_infos[0];
        }catch(e){
            throw new Error(e);
        }

        //メニューの更新
        const tmp_map = new Map([["gui_json", [JSON.parse(JSON.stringify(map.get("gui_json").find(gui => gui.id==="read_set_server_speaker")))]]]);
        if(pre_page < now_page){
            tmp_map.get("gui_json")[0].menus[0].options.push(
                {
                    "label" : "前のページへ",
                    "value" : `read_set_server_speaker@${pre_vv_speaker_uuid}`,
                    "description" : `${pre_page}/${max_page}`,
                    "emoji" : "🔼"
                }
            );
        }
        for(let i=((now_page-1)*(MENU_MAX-2)); i<vv_speakers.length && i<((now_page-1)*(MENU_MAX-2)+(MENU_MAX-2)); i++){
            if(i === vv_speaker_idx){
                tmp_map.get("gui_json")[0].menus[0].options.push(
                    {
                        "label" : `${vv_speaker_name}(${vv_style_name})`,
                        "value" : `read_set_server`,
                        "description" : "決定する",
                        "emoji" : "✅"
                    },
                )
            }else{
                tmp_map.get("gui_json")[0].menus[0].options.push(
                    {
                        "label" : vv_speakers[i].name,
                        "value" : `read_set_server_speaker@${vv_speakers[i].speaker_uuid}`,
                        "description" : vv_speakers[i].styles[0].name,
                        "emoji" : "🔘"
                    }
                )
            }
        }
        if(next_page > now_page){
            tmp_map.get("gui_json")[0].menus[0].options.push(
                {
                    "label" : "次のページへ",
                    "value" : `read_set_server_speaker@${next_vv_speaker_uuid}`,
                    "description" : `${next_page}/${max_page}`,
                    "emoji" : "🔽"
                }
            );
        }

        interaction.editReply(gui.create(tmp_map, "read_set_server_speaker", {
            "<#{speaker_name}>":vv_speaker_name,
            "<#{style_name}>":vv_style_name,
            "<#{policy_url}>":vv_speaker_info.policy.match(/(https?:\/\/[\w\-\.\/\?\,\#\:\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+)/)[0],
            "<#{icon_name}>":`icon.jpg`,
            "<#{icon_base64}>":vv_style_info.icon,
            "<#{voice_sample_name}>":`${vv_speaker_name}(${vv_style_name})のサンプル音声.mp3`,
            "<#{voice_sample_base64}>":vv_style_info.voice_samples[0],
            "<#{speaker_uuid}>":vv_speaker_uuid
        }));
        tmp_map.clear();
    }
    
    return 0;
}

//サーバー設定＠スタイル
async function setServerStyle(interaction, map){
    const server_info = await db.getServerInfo(interaction.guild.id);
    const MENU_MAX = 25;

    //VOICEVOXのスタイル設定
    if(server_info.read_app === "VOICEVOX"){
        const vv_speakers = map.get("voicevox_speakers");

        //現在のスピーカー
        const vv_speaker_uuid = server_info.vv_uuid;
        const vv_speaker_idx = vv_speakers.findIndex(speaker => speaker.speaker_uuid===vv_speaker_uuid);
        const vv_speaker_name = vv_speakers[vv_speaker_idx].name;
        const vv_styles = vv_speakers[vv_speaker_idx].styles;
        const vv_style_id = interaction.values[0].split("@")[1] ?? vv_styles[0].id;
        const vv_style_idx = vv_styles.findIndex(style => style.id===parseInt(vv_style_id));
        const vv_style_name = vv_styles[vv_style_idx].name;

        //ページ
        const max_page = Math.ceil(vv_styles.length/(MENU_MAX-2));
        const now_page = Math.ceil((vv_style_idx+1)/(MENU_MAX-2));
        const pre_page = now_page>1 ? now_page-1 : max_page;
        const next_page = now_page<max_page ? now_page+1 : 1;
        
        //ページの先頭スタイル
        const pre_vv_style_idx = (pre_page-1)*(MENU_MAX-2);
        const next_vv_style_idx = (next_page-1)*(MENU_MAX-2);
        const pre_vv_style_id = vv_styles.at(pre_vv_style_idx).id
        const next_vv_style_id = vv_styles.at(next_vv_style_idx).id

        //情報の取得
        let vv_speaker_info = null;
        let vv_style_info = null;
        try{
            vv_speaker_info = (await voicevox.getSpeakerInfo(vv_speaker_uuid)).data;
            vv_style_info = vv_speaker_info.style_infos.find(info => info.id === parseInt(vv_style_id));
        }catch(e){
            throw new Error(e);
        }

        //メニューの更新
        const tmp_map = new Map([["gui_json", [JSON.parse(JSON.stringify(map.get("gui_json").find(gui => gui.id==="read_set_server_style")))]]]);
        if(pre_page < now_page){
            tmp_map.get("gui_json")[0].menus[0].options.push(
                {
                    "label" : "前のページへ",
                    "value" : `read_set_server_style@${pre_vv_style_id}`,
                    "description" : `${pre_page}/${max_page}`,
                    "emoji" : "🔼"
                }
            );
        }
        for(let i=((now_page-1)*(MENU_MAX-2)); i<vv_styles.length && i<((now_page-1)*(MENU_MAX-2)+(MENU_MAX-2)); i++){
            if(i === vv_style_idx){
                tmp_map.get("gui_json")[0].menus[0].options.push(
                    {
                        "label" : `${vv_speaker_name}(${vv_style_name})`,
                        "value" : `read_set_server`,
                        "description" : "決定する",
                        "emoji" : "✅"
                    },
                )
            }else{
                tmp_map.get("gui_json")[0].menus[0].options.push(
                    {
                        "label" : vv_styles[i].name,
                        "value" : `read_set_server_style@${vv_styles[i].id}`,
                        "description" : vv_speaker_name,
                        "emoji" : "🔘"
                    }
                )
            }
        }
        if(next_page > now_page){
            tmp_map.get("gui_json")[0].menus[0].options.push(
                {
                    "label" : "次のページへ",
                    "value" : `read_set_server_style@${next_vv_style_id}`,
                    "description" : `${next_page}/${max_page}`,
                    "emoji" : "🔽"
                }
            );
        }

        interaction.editReply(gui.create(tmp_map, "read_set_server_style", {
            "<#{speaker_name}>":vv_speaker_name,
            "<#{style_name}>":vv_style_name,
            "<#{policy_url}>":vv_speaker_info.policy.match(/(https?:\/\/[\w\-\.\/\?\,\#\:\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+)/)[0],
            "<#{icon_name}>":`icon.jpg`,
            "<#{icon_base64}>":vv_style_info.icon,
            "<#{voice_sample_name}>":`${vv_speaker_name}(${vv_style_name})のサンプル音声.mp3`,
            "<#{voice_sample_base64}>":vv_style_info.voice_samples[0],
            "<#{style_id}>":vv_style_id
        }));
        tmp_map.clear();
    }
    
    return 0;
}

//読み上げコマンド実行
async function execute(interaction, map){
    const id = interaction?.commandName ? `${interaction.commandName}${interaction.options.getSubcommand()}` : interaction?.values?.[0] ?? interaction.customId;

    //ephemeralメッセージか確認
    if(!id.includes("modal")){
        interaction.message?.flags.bitfield ? await interaction.deferUpdate() : await interaction.deferReply?.({ephemeral:true});
    }

    //開始コマンド
    if(id === "read_start"){
        try{
            await start(interaction, map);
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }

    //終了コマンド
    if(id === "read_end"){
        try{
            await end(interaction, map);
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }

    //辞書追加コマンド
    if(id === "read_dict_add"){
        try{
            await dictAdd(interaction, map);
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }

    //辞書追加モーダル
    if(id === "read_dict_add_modal"){
        try{
            await interaction.showModal(gui.create(map, "read_dict_add_modal"));
            await interaction.editReply(gui.create(map, "read"));
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }

    //辞書削除コマンド
    if(id === "read_dict_del"){
        try{
            await dictDel(interaction, map);
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }

    //辞書削除モーダル
    if(id === "read_dict_del_modal"){
        try{
            await interaction.showModal(gui.create(map, "read_dict_del_modal"));
            await interaction.editReply(gui.create(map, "read"));
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }

    //ユーザー設定コマンド
    if(id === "read_set_user"){
        try{
            await setUser(interaction, map);
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }

    //ユーザースピーカー設定ページ
    if(id.startsWith("read_set_user_speaker")){
        try{
            await setUserSpeaker(interaction, map);
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }

    //ユーザースタイル設定ページ
    if(id.startsWith("read_set_user_style")){
        try{
            await setUserStyle(interaction, map);
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }

    //ユーザー設定パラメーターモーダル
    if(id === "read_set_user_parameters_modal"){
        try{
            await interaction.showModal(gui.create(map, "read_set_user_parameters_modal"));
            await interaction.editReply(gui.create(map, "read"));
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }

    //サーバー設定コマンド
    if(id === "read_set_server"){
        try{
            await setServer(interaction, map);
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }

    //サーバースピーカー設定ページ
    if(id.startsWith("read_set_server_speaker")){
        try{
            await setServerSpeaker(interaction, map);
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }

    //サーバースピーカー設定ページ
    if(id.startsWith("read_set_server_style")){
        try{
            await setServerStyle(interaction, map);
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }

    //サーバー設定パラメーターモーダル
    if(id === "read_set_server_parameters_modal"){
        try{
            await interaction.showModal(gui.create(map, "read_set_server_parameters_modal"));
            await interaction.editReply(gui.create(map, "read"));
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }
    
    //サーバー設定詳細モーダル
    if(id === "read_set_server_detail_modal"){
        try{
            await interaction.showModal(gui.create(map, "read_set_server_detail_modal"));
            await interaction.editReply(gui.create(map, "read"));
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }

    //GUI送信
    try{
        await interaction.editReply(gui.create(map, id));
        return 0;
    }catch(e){
        throw new Error(e);
    }
}

//コマンドの補助
async function autoComplete(interaction, map){
    const id = `${interaction.commandName}${interaction.options.getSubcommand()}`;
    const user_info = await  db.getUserInfo(interaction.user.id);
    const server_info = await db.getServerInfo(interaction.guild.id);
    const focus_opt = interaction.options.getFocused(true);
    const choices = new Array();

    //voicevoxのコマンド補助
    if(server_info.read_app === "VOICEVOX"){
        const vv_speakers = map.get("voicevox_speakers");

        //speakerオプションの補助
        if(focus_opt.name === "speaker"){
            vv_speakers.find(speaker => {
                if(speaker.name.includes(focus_opt.value)){
                    choices.push(speaker.name);
                }
            });
        }

        //styleオプションの補助
        if(focus_opt.name === "style"){
            const vv_speaker = interaction.options.getString("speaker") ?? (id.includes("user") ? user_info.vv_uuid : null) ?? server_info.vv_uuid;
            const vv_speaker_info = vv_speakers.find(speaker => speaker.name===vv_speaker || speaker.speaker_uuid===vv_speaker);
            vv_speaker_info?.styles?.find(style => {
                if(style.name.includes(focus_opt.value)){
                    choices.push(style.name);
                }
            });
        }

    }

    //何もなければランダム
    if(!choices.length){
        choices.push("ランダム");
    }

    //補助送信
    await interaction.respond(choices.slice(0,25).map(choices => ({name: choices, value: choices})));

    return 0;
}

//テキストチャンネルの監視
async function observeTC(message, map){
    const user_info = await db.getUserInfo(message.member.id);
    const server_info = await db.getServerInfo(message.guild.id);
    const player = map.get(`read_voice_${map.get(`read_text_${message.channelId}`)}`).player;

    let text = "";
    let res_query = null;
    let res_synthesis = null;

    //ユーザー名を結合
    if(server_info.read_username && (server_info.read_username_always || message.member.id != map.get(`read_last_user_${message.guild.id}`))){
        map.set(`read_last_user_${message.guild.id}`, message.author?.id);
        text = user_info.username ?? message.member.displayName;
        text += "さん、";
    }

    //メッセージ内容を結合
    text += message.cleanContent;

    //マークダウンなどの検出
    text = text
        .replace(/^(#{1,3}\s|>>>\s|>\s)/gm, "")
        .replace(/^(#{1,3}\s|>>>\s|>\s)/gm, "")
        .replace(/```([\s\S]+?)```/g, '$1')
        .replace(/(`|:)([\s\S]+?)\1/g, '$2')
        .replace(/(\*{1,3}|_{1,3}|~{2})([\s\S]+?)\1/g, '$2') 
        .replace(/(\*{1,3}|_{1,3}|~{2})([\s\S]+?)\1/g, '$2') 
        .replace(/(\*{1,3}|_{1,3}|~{2})([\s\S]+?)\1/g, '$2')
        .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
        .replace(/(https?|ftp)(:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+)/g, "URL省略")
        .replace(/:([\s\S]+?):/g, "$1")
        .replace(/www+/g, "www")
        .replace(/#/g, "シャープ")
    .trim();

    //文字数制限
    if(text.length > server_info.read_max+5){
        text = text.substring(0, server_info.read_max);
        text += "以下略";
    }

    //VOICEVOXの音声合成
    if(server_info.read_app === "VOICEVOX"){

        //辞書の置き換え
        if(map.get("voicevox_dictionary") != message.guild.id){
            try{
                await voicevox.postImportUserDict(server_info.vv_dict);
                map.set("voicevox_dictionaty", message.guild.id);
            }catch(e){
                console.log(`↓↓↓ 辞書の置き換えに失敗しました ↓↓↓\n${e}\n↑↑↑ 辞書の置き換えに失敗しました ↑↑↑`);
            }
        }

        //クエリの作成
        try{
            if(server_info.read_set_override){
                user_info.vv_id = null;
                user_info.vv_pitch = null;
                user_info.vv_intonation = null;
            }
            res_query = await voicevox.postAudioQuery(text, user_info.vv_id??server_info.vv_id);
            res_query.data.speedScale = server_info.vv_speed;
            res_query.data.pitchScale = user_info.vv_pitch ?? server_info.vv_pitch;
            res_query.data.intonationScale = user_info.vv_intonation ?? server_info.vv_intonation;
            res_query.data.volumeScale = server_info.vv_volume;
        }catch(e){
            throw new Error(e);
        }

        //合成音声の作成
        try{
            res_synthesis = await voicevox.postSynthesis(res_query, user_info.vv_id??server_info.vv_id);
        }catch(e){
            throw new Error(e);
        }
    }

    //再生
    try{
        const stream = new Readable();
        stream.push(res_synthesis.data);
        stream.push(null);
        const audio = createAudioResource(stream, {inputType: StreamType.Arbitrary});
        if(player.state.status != AudioPlayerStatus.Idle){
            await entersState(player, AudioPlayerStatus.Idle, 10000);
        }
        player.play(audio);
        return 0;
    }catch(e){
        throw new Error(e);
    }
}

//ボイスチャンネルの監視
function observeVC(old_state, new_state, map){

    //読み上げを行っていたテキストチャンネルを取得
    const text_channels = old_state.guild.channels.cache.filter((channel) => map.get(`read_text_${channel.id}`));

    //ボイチャ退出
    if(map.get(`read_voice_${old_state.channelId}`) && old_state.channel.members.filter((member)=>!member.user.bot).size < 1){
        
        //テキストチャンネルの紐づけを削除
        text_channels.forEach((channel) => map.delete(`read_text_${channel.id}`));
        
        //ボイチャ切断
        try{
            map.get(`read_voice_${old_state.channelId}`).connection.destroy();
            map.delete(`read_voice_${old_state.channelId}`);
            text_channels.at(0).send(gui.create(map, "read_observe_exit", {"<#{old_voice_channel}>":old_state.channel}));
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }

    //ボイチャキック
    if(map.get(`read_voice_${old_state.channelId}`) && !old_state.channel.members.has(process.env.BOT_ID) && !new_state.channel){
        
        //テキストチャンネルの紐づけを削除
        text_channels.forEach((channel) => map.delete(`read_text_${channel.id}`));
        
        //ボイチャ切断
        map.delete(`read_voice_${old_state.channelId}`);

        text_channels.at(0).send(gui.create(map, "read_observe_kick", {"<#{old_voice_channel}>":old_state.channel}));
        
        return 0;
    }

    //ボイチャ移動
    if(map.get(`read_voice_${old_state.channelId}`) && !old_state.channel.members.has(process.env.BOT_ID) && new_state.channel){
        
        //ボイチャ接続
        try{
            const new_voice_channel = joinVoiceChannel({
                channelId: new_state.channelId,
                guildId: new_state.channel.guild.id,
                adapterCreator: new_state.channel.guild.voiceAdapterCreator,
                selfMute: false,
                selfDeaf: true,
            })
            map.set(`read_voice_${new_state.channelId}`, new_voice_channel.subscribe(createAudioPlayer()));
            map.delete(`read_voice_${old_state.channelId}`);
            text_channels.forEach((channel) => map.set(`read_text_${channel.id}`, new_state.channelId));
            text_channels.at(0).send(gui.create(map, "read_observe_move", {"<#{old_voice_channel}>":old_state.channel, "<#{new_voice_channel}>":new_state.channel}));
            return 0;
        }catch(e){
            throw new Error(e);
        }
    }
    
    return -1;
}