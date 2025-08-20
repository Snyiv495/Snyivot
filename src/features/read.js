/*****************
    read.js
    スニャイヴ
    2025/08/20
*****************/

module.exports = {
    exe : execute,
    autoComplete : autoComplete,
    voiceState : voiceState
}

const {createAudioPlayer, createAudioResource, entersState, AudioPlayerStatus, StreamType} = require('@discordjs/voice');
const {Readable} = require("stream");
const db = require('../core/db');
const gui = require('../core/gui');
const vc = require('../core/vc');
const helper = require('../core/helper');
const voicevox = require('../integrations/voicevox');

const MENU_MAX = 25;

//読み上げ
async function readText(trigger, map){
    try{
        const user_id = helper.getUserId(trigger);
        const guild_id = helper.getGuildId(trigger);
        const user_info = await db.getUserInfo(user_id);
        const server_info = await db.getServerInfo(guild_id);
        const stream = new Readable();
        const player = map.get(`read_voice_${map.get(`read_text_${trigger.channel.id}`)}`).player;
        
        //整形
        let text = trigger.cleanContent;
        text = text.replace(/(https?|ftp)(:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+)/g, "URL省略");  //URL
        text = text.replace(/```([\s\S]+?)```/g, "");                                       //コートブロック
        text = text.replace(/~~([\s\S]+?)~~/g, "");                                         //打消し線
        text = text.replace(/\|\|([\s\S]+?)\|\|/g, "、");                                   //スポイラー
        text = text.replace(/:([\s\S]+?):/g, "$1");                                         //絵文字
        text = text.replace(/www+/g, "www");                                                //芝
        text = text.trim();

        //ユーザー名を結合
        if(server_info.read_username && (server_info.read_username_always || user_id != map.get(`read_text_pre_user_${guild_id}`))){
            text = `${user_info.username ?? helper.getUserName(trigger)}さん、${text}`;
        }

        //文字数制限
        if(text.length > server_info.read_max+5){
            text = `${text.substring(0, server_info.read_max)}以下略`;
        }

        //VOICEVOXの音声合成
        if(server_info.read_app === "VOICEVOX"){

            //オーバーライド
            if(server_info.read_set_override){
                user_info.vv_id = null;
                user_info.vv_pitch = null;
                user_info.vv_intonation = null;
            }

            //辞書の置き換え
            if(map.get("voicevox_dictionary") != guild_id){
                await voicevox.postImportUserDict(server_info.vv_dict);
                map.set("voicevox_dictionaty", guild_id);
            }

            //クエリの作成
            const res_query = await voicevox.postAudioQuery(text, user_info.vv_id??server_info.vv_id);
            res_query.data.pitchScale = user_info.vv_pitch ?? server_info.vv_pitch;
            res_query.data.intonationScale = user_info.vv_intonation ?? server_info.vv_intonation;
            res_query.data.speedScale = server_info.vv_speed;
            res_query.data.volumeScale = server_info.vv_volume;

            //合成音声の作成
            stream.push((await voicevox.postSynthesis(res_query, user_info.vv_id??server_info.vv_id)).data);
            stream.push(null);
        }

        //再生
        if(player.state.status != AudioPlayerStatus.Idle){
            await entersState(player, AudioPlayerStatus.Idle, 10000);
        }
        player.play(createAudioResource(stream, {inputType: StreamType.Arbitrary}));
        map.set(`read_text_pre_user_${guild_id}`, user_id);

        return;
    }catch(e){
        throw new Error(`read.js => readText() \n ${e}`);
    }
}

//読み上げ開始
async function start(trigger, map){
    try{
        const text_channel = trigger.channel;
        const voice_channel = trigger.member.voice.channel;
        const old_voice_channel = trigger.guild.channels.cache.find((channel) => channel.type == 2 && channel.members.get(process.env.BOT_ID));

        //読み上げ開始要件の確認
        if((!(text_channel.type === 0 || text_channel.type === 2)) || (text_channel.type === 2 && !text_channel.joinable) || (!voice_channel) || (!voice_channel.joinable) || (!voice_channel.speakable) || (text_channel.type === 0 && !text_channel.members.find((member) => member.id === process.env.BOT_ID)) || (voice_channel.id === map.get(`read_text_${text_channel.id}`)) || (old_voice_channel && old_voice_channel.id != voice_channel.id)){
            await helper.sendGUI(trigger, gui.create(map, helper.isInteraction(trigger)?"read_start_failure":"read_start_failure*", {"{{__TEXT_CHANNEL__}}":text_channel??"テキストチャンネル", "{{__VOICE_CHANNEL__}}":voice_channel??"ボイスチャンネル"}));
            return;
        }

        //VC接続
        if(old_voice_channel?.id != voice_channel.id){
            const new_voice_channel = await vc.connect(voice_channel);
            map.set(`read_voice_${voice_channel.id}`, new_voice_channel.subscribe(createAudioPlayer()));
        }

        //チャンネル追加
        map.set(`read_text_${text_channel.id}`, voice_channel.id);
        trigger.cleanContent = `${text_channel.name}の読み上げを始めるよ`;

        //開始の通知
        if(helper.isInteraction(trigger)){
            await helper.sendGUI(trigger, gui.create(map, "read"));
        }
        await helper.sendGUI(trigger.channel, gui.create(map, "read_start", {"{{__TEXT_CHANNEL__}}":text_channel,"{{__VOICE_CHANNEL__}}":voice_channel}));
        await readText(trigger, map);

        return;
    }catch(e){
        throw new Error(`read.js => start() \n ${e}`);
    }
}

//読み上げ終了
async function end(trigger, map){
    try{
        const text_channel = trigger.channel;
        const voice_channel = trigger.member.voice.channel;
        const old_voice_channel = trigger.guild.channels.cache.find((channel) => channel.type == 2 && channel.members.get(process.env.BOT_ID)); 

        //読み上げ終了要件の確認
        if(!voice_channel || (voice_channel != old_voice_channel) || (map.get(`read_text_${text_channel.id}`) != voice_channel.id)){
            await helper.sendGUI(trigger, gui.create(map, helper.isInteraction(trigger)?"read_end_failure":"read_end_failure*", {"{{__TEXT_CHANNEL__}}":text_channel??"テキストチャンネル", "{{__VOICE_CHANNEL__}}":voice_channel??"ボイスチャンネル"}));
            return;
        }

        //読み上げチャンネルの削除
        trigger.cleanContent = `${text_channel.name}の読み上げを終わるよ`;
        await readText(trigger, map);
        map.delete(`read_text_${text_channel.id}`);
        

        //他に読み上げをしているチャンネルの確認
        const other_text_channel = await trigger.guild.channels.cache.find((channel) => map.get(`read_text_${channel.id}`));

        //読み上げを行っているチャンネルがなくなったら切断
        if(!other_text_channel){
            map.get(`read_voice_${voice_channel.id}`)?.connection.destroy();
            map.delete(`read_voice_${voice_channel.id}`);
        }
        
        //終了の通知
        if(helper.isInteraction(trigger)){
            await helper.sendGUI(trigger, gui.create(map, "read"));
        }
        await helper.sendGUI(trigger.channel, gui.create(map, "read_end", {"{{__TEXT_CHANNEL__}}":text_channel, "{{__VOICE_CHANNEL__}}":voice_channel}));
        
        return;
    }catch(e){
        throw new Error(`read.js => end() \n ${e}`);
    }
}

//辞書追加
async function dictAdd(trigger, map){
    try{
        const server_info = await db.getServerInfo(trigger.guild.id);
        const input_word = helper.getArgValue(trigger, "word");
        const input_kana = helper.getArgValue(trigger, "kana");
        const input_accent = helper.getArgValue(trigger, "accent");
        const input_priority = helper.getArgValue(trigger, "priority");

        let word = input_word.substring(0, 10).trim();
        let kana = input_kana.substring(0, 10).trim();
        let accent = input_accent ? parseInt(input_accent) : NaN;
        let priority = input_priority ? parseInt(input_priority) : NaN;

        //VOICEVOXの辞書追加
        if(server_info.read_app === "VOICEVOX"){

            //入力の整形
            const audio_query = await voicevox.postAudioQuery(kana, 0);
            word = word.replace(/[A-Za-z0-9]/g, function(str){return String.fromCharCode(str.charCodeAt(0) + 0xFEE0);});
            kana = audio_query.data.kana.replace(/\/|、|_|'|？/g, "");
            accent = !Number.isNaN(accent) ? Math.min(Math.max(accent, 1), audio_query.data.accent_phrases.moras.length-1) : 1;
            priority = !Number.isNaN(priority) ? Math.min(Math.max(priority, 0), 10) : 9;

            //辞書の置き換え
            if(map.get("voicevox_dictionary") != trigger.guild.id){
                await voicevox.postImportUserDict(server_info.vv_dict);
                map.set("voicevox_dictionaty", trigger.guild.id);
            }

            //単語の登録
            const word_index = server_info.read_dict.findIndex(entry => entry.word === word);
            if(word_index < 0){
                await voicevox.postUserDictWord(word, kana, accent, priority);
                server_info.read_dict.push({"word" : word, "kana" : kana});
            }else{
                const uuids = Object.keys(server_info.vv_dict);
                for(let i=0; i<uuids.length; i++){
                    if(server_info.vv_dict[uuids[i]].surface === word){
                        await voicevox.putUserDictWord(uuids[i], word, kana, accent, priority);
                        break;
                    }
                }
                server_info.read_dict[word_index].kana = kana;
            }
            
            //更新された辞書の取得
            server_info.vv_dict = (await voicevox.getUserDict()).data;

            //辞書の整合性の確認
            const read_dict_set = new Set(server_info.read_dict.map(entry => entry.word));
            for(const entry of Object.values(server_info.vv_dict)) {
                if(!read_dict_set.has(entry.surface)){
                    await helper.sendGUI(trigger, gui.create(map, helper.isInteraction(trigger)?"read_dict_add_interrupt_error":"read_dict_add_interrupt_error*"))
                    return;
                }
            }
        }

        //サーバー情報の保存
        await db.setServerInfo(trigger.guild.id, server_info);

        //辞書追加の通知
        if(helper.isInteraction(trigger)){
            await helper.sendGUI(trigger, gui.create(map, "read"));
        }
        await helper.sendGUI(trigger.channel, gui.create(map, "read_dict_add", {"{{__WORD__}}":word, "{{__KANA__}}":kana}))
        
        return;
    }catch(e){
        throw new Error(`read.js => dictAdd() \n ${e}`);
    }
}

//辞書削除
async function dictDel(trigger, map){
    try{
        const server_info = await db.getServerInfo(trigger.guild.id);
        const input_word = helper.getArgValue(trigger, "word") ?? "";
        const word = input_word.substring(0, 10).replace(/[A-Za-z0-9]/g, function(str){return String.fromCharCode(str.charCodeAt(0) + 0xFEE0);});
        const word_index = server_info.read_dict.findIndex(entry => entry.word === word);

        //辞書の送信
        if(word_index < 0){
            let str_csv = "語句,カナ\n";
            for(const word_kana of server_info.read_dict){
                str_csv += `${word_kana.word},${word_kana.kana}\n`;
            }
            await helper.sendGUI(trigger, gui.create(map, helper.isInteraction(trigger) ? "read_dict_del_send_csv" : "read_dict_del_send_csv*", {"{{__CSV_NAME__}}": "dictionary.csv", "{{__CSV_BASE64__}}":Buffer.from(str_csv, "utf-8").toString("base64")}));
            return;
        }

        //VOICEVOXの辞書削除
        if(server_info.read_app === "VOICEVOX"){

            //辞書の置き換え
            if(map.get("voicevox_dictionary") != trigger.guild.id){
                await voicevox.postImportUserDict(server_info.vv_dict);
                map.set("voicevox_dictionaty", trigger.guild.id);
            }
            
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
                    await helper.sendGUI(trigger, gui.create(map, helper.isInteraction(trigger) ? "read_dict_del_interrupt_error" : "read_dict_del_interrupt_error*"));
                    return;
                }
            }
        }

        //単語の削除
        server_info.read_dict.splice(word_index, 1);

        //サーバー情報の保存
        await db.setServerInfo(trigger.guild.id, server_info);

        //辞書削除の通知
        if(helper.isInteraction(trigger)){
            await helper.sendGUI(trigger, gui.create(map, "read"));
        }
        await helper.sendGUI(trigger.channel, gui.create(map, "read_dict_del", {"{{__WORD__}}":word}));

        return;
    }catch(e){
        throw new Error(`read.js => dictDel() \n ${e}`);
    }
}

//ユーザー設定
async function setUser(interaction, map){
    try{
        const user_info = await db.getUserInfo(interaction.user.id);
        const server_info = await db.getServerInfo(interaction.guild.id);

        const input_speaker = helper.getArgValue(interaction, "speaker");
        const input_style = helper.getArgValue(interaction, "style");
        const input_pitch = helper.getArgValue(interaction, "pitch");
        const input_intonation = helper.getArgValue(interaction, "intonation");
        const input_username = helper.getArgValue(interaction, "username");

        let speaker = input_speaker ?? interaction.customId?.split("speaker@")[1] ?? null;
        let style = input_style ?? interaction.customId?.split("style@")[1] ?? null;
        let pitch = input_pitch ? parseFloat(input_pitch) : NaN;
        let intonation = input_intonation ? parseFloat(input_intonation) : NaN;
        let username = input_username ? input_username.trim() : null;
        let credit = null;

        //VOICEVOXの設定
        if(server_info.read_app === "VOICEVOX"){
            const vv_speakers = map.get("voicevox_speakers");
            const vv_speaker = speaker ?? user_info.vv_uuid ?? server_info.vv_uuid;
            const vv_style = style ?? user_info.vv_id ?? server_info.vv_id;
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
                user_info.vv_uuid = vv_speaker_info?.speaker_uuid ?? user_info.vv_uuid;
                speaker = vv_speaker_info?.name ?? null;
            }

            //存在しないスピーカー
            if(input_speaker && !speaker){
                await helper.sendGUI(interaction, gui.create(map, "read_set_user_failure", {"{{__CHARACTER__}}":input_speaker}));
                return;
            }

            //スタイル設定
            if(vv_speaker === "ランダム" || vv_style === "ランダム"){
                const rand = Math.floor(Math.random()*vv_speaker_info.styles.length);
                vv_style_info = vv_speaker_info.styles[rand];
                user_info.vv_id = vv_style_info.id;
                style = vv_style_info.name;
            }else{
                vv_style_info = vv_speaker_info.styles.find(style => style.name===vv_style || style.id===parseInt(vv_style));            
                user_info.vv_id = vv_style_info?.id ?? (!input_style ? vv_speaker_info.styles[0].id : user_info.vv_id);
                style = vv_style_info?.name ?? (!input_style ? vv_speaker_info.styles[0].name : null);
            }

            //存在しないスタイル
            if(input_style && !style){
                await helper.sendGUI(interaction, gui.create(map, "read_set_user_failure", {"{{__CHARACTER__}}":`${input_speaker}(${input_style})`}));
                return;
            }

            //その他パラメータ設定
            user_info.vv_pitch = !Number.isNaN(pitch) ? Math.min(Math.max(pitch, -0.15), 0.15) : user_info.vv_pitch ?? server_info.vv_pitch;
            user_info.vv_intonation = !Number.isNaN(intonation) ? Math.min(Math.max(intonation, 0.00), 2.00) : user_info.vv_intonation ?? server_info.vv_intonation;
            pitch = user_info.vv_pitch;
            intonation = user_info.vv_intonation;
            credit = `VOICEVOX:${speaker}`;
        }
        
        //その他パラメータ設定
        user_info.username = (username && username!="") ? username : (user_info.username ?? interaction.user.displayName);
        username = user_info.username;

        //設定の保存
        await db.setUserInfo(interaction.user.id, user_info);

        //ユーザー設定の通知
        await helper.sendGUI(interaction, gui.create(map, "read_set_user", {"{{__SPEAKER__}}":speaker, "{{__STYLE__}}":style, "{{__USERNAME__}}":username, "{{__PITCH__}}":pitch, "{{__INTONATION__}}":intonation, "{{__CREDIT__}}":credit}));
        
        return;
    }catch(e){
        throw new Error(`read.js => setUser() \n ${e}`);
    }
}

//ユーザー設定＠スピーカー
async function setUserSpeaker(interaction, map){
    try{
        const user_info = await db.getUserInfo(interaction.user.id);
        const server_info = await db.getServerInfo(interaction.guild.id);

        //VOICEVOXのスピーカー設定
        if(server_info.read_app === "VOICEVOX"){
            const vv_speakers = map.get("voicevox_speakers");

            //現在のスピーカー
            const vv_speaker_uuid = interaction.values[0].split("speaker@")[1] ?? user_info.vv_uuid ?? server_info.vv_uuid;
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
            vv_speaker_info = (await voicevox.getSpeakerInfo(vv_speaker_uuid)).data;
            vv_style_info = vv_speaker_info.style_infos[0];

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

            //スピーカーページの送信
            await helper.sendGUI(interaction, gui.create(tmp_map, "read_set_user_speaker", {"{{__SPEAKER_NAME__}}":vv_speaker_name, "{{__STYLE_NAME__}}":vv_style_name, "{{__POLICY_URL__}}":vv_speaker_info.policy.match(/(https?:\/\/[\w\-\.\/\?\,\#\:\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+)/)[0], "{{__ICON_NAME__}}":`icon.jpg`, "{{__ICON_BASE64__}}":vv_style_info.icon, "{{__VOICE_SAMPLE_NAME__}}":`${vv_speaker_name}(${vv_style_name})のサンプル音声.mp3`, "{{__VOICE_SAMPLE_BESE64__}}":vv_style_info.voice_samples[0], "{{__SPEAKER_UUID__}}":vv_speaker_uuid}));
            tmp_map.clear();
        }
        
        return;
    }catch(e){
        throw new Error(`read.js => setUserSpeaker() \n ${e}`);
    }
}

//ユーザー設定＠スタイル
async function setUserStyle(interaction, map){
    try{
        const user_info = await db.getUserInfo(interaction.user.id);
        const server_info = await db.getServerInfo(interaction.guild.id);

        //VOICEVOXのスタイル設定
        if(server_info.read_app === "VOICEVOX"){
            const vv_speakers = map.get("voicevox_speakers");

            //現在のスピーカー
            const vv_speaker_uuid = user_info.vv_uuid ?? server_info.vv_uuid;
            const vv_speaker_idx = vv_speakers.findIndex(speaker => speaker.speaker_uuid===vv_speaker_uuid);
            const vv_speaker_name = vv_speakers[vv_speaker_idx].name;
            const vv_styles = vv_speakers[vv_speaker_idx].styles;
            const vv_style_id = interaction.values[0].split("style@")[1] ?? vv_styles[0].id;
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
            vv_speaker_info = (await voicevox.getSpeakerInfo(vv_speaker_uuid)).data;
            vv_style_info = vv_speaker_info.style_infos.find(info => info.id === parseInt(vv_style_id));

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

            //スタイルページの送信
            await helper.sendGUI(interaction, gui.create(tmp_map, "read_set_user_style", {"{{__SPEAKER_NAME__}}":vv_speaker_name, "{{__STYLE_NAME__}}":vv_style_name, "{{__POLICY_URL__}}":vv_speaker_info.policy.match(/(https?:\/\/[\w\-\.\/\?\,\#\:\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+)/)[0], "{{__ICON_NAME__}}":`icon.jpg`, "{{__ICON_BASE64__}}":vv_style_info.icon, "{{__VOICE_SAMPLE_NAME__}}":`${vv_speaker_name}(${vv_style_name})のサンプル音声.mp3`, "{{__VOICE_SAMPLE_BESE64__}}":vv_style_info.voice_samples[0], "{{__STYLE_ID__}}":vv_style_id}));
            tmp_map.clear();
        }
        
        return;
    }catch(e){
        throw new Error(`read.js => setUserStyle() \n ${e}`);
    }
}

//サーバー設定
async function setServer(interaction, map){
    try{
        const server_info = await db.getServerInfo(interaction.guild.id);
        
        const input_read_username = helper.getArgValue(interaction, "read_username");
        const input_read_username_always = helper.getArgValue(interaction, "read_username_always");
        const input_read_set_override = helper.getArgValue(interaction, "read_set_override");
        const input_read_max = helper.getArgValue(interaction, "read_max");
        const input_read_app = helper.getArgValue(interaction, "read_app");

        const input_speaker = helper.getArgValue(interaction, "speaker");
        const input_style = helper.getArgValue(interaction, "style");
        const input_speed = helper.getArgValue(interaction, "speed");
        const input_pitch = helper.getArgValue(interaction, "pitch");
        const input_intonation = helper.getArgValue(interaction, "intonation");
        const input_volume = helper.getArgValue(interaction, "volume");

        const regex = new RegExp(/(t|T|y|Y)/);
        let read_username = regex.test(input_read_username);
        let read_username_always = regex.test(input_read_username_always);
        let read_set_override = regex.test(input_read_set_override);
        let read_max = input_read_max ? parseInt(input_read_max) : NaN;
        let read_app = input_read_app?.match(/VOICEVOX/) ?? null;

        let speaker = input_speaker ?? interaction.customId?.split("speaker@")[1] ?? null;
        let style = input_style ?? interaction.customId?.split("style@")[1] ?? null;
        let speed = input_speed ? parseFloat(input_speed) : NaN;
        let pitch = input_pitch ? parseFloat(input_pitch) : NaN;
        let intonation = input_intonation ? parseFloat(input_intonation) : NaN;
        let volume = input_volume ? parseFloat(input_volume) : NaN;
        let credit = null;

        //VOICEVOXの設定
        if(server_info.read_app === "VOICEVOX"){
            const vv_speakers = map.get("voicevox_speakers");
            const vv_speaker = speaker ?? server_info.vv_uuid;
            const vv_style = style ?? server_info.vv_id;
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
                server_info.vv_uuid = vv_speaker_info?.speaker_uuid ?? server_info.vv_uuid;
                speaker = vv_speaker_info?.name ?? null;
            }

            //存在しないスピーカー
            if(input_speaker && !speaker){
                await helper.sendGUI(interaction, gui.create(map, "read_set_server_failure", {"{{__SPEAKER__}}":input_speaker}));
                return;
            }

            //スタイル設定
            if(vv_speaker === "ランダム" || vv_style === "ランダム"){
                const rand = Math.floor(Math.random()*vv_speaker_info.styles.length);
                vv_style_info = vv_speaker_info.styles[rand];
                server_info.vv_id = vv_style_info.id;
                style = vv_style_info.name;
            }else{
                vv_style_info = vv_speaker_info.styles.find(style => style.name===vv_style || style.id===parseInt(vv_style));            
                server_info.vv_id = vv_style_info?.id ?? (!input_style ? vv_speaker_info.styles[0].id : server_info.vv_id);
                style = vv_style_info?.name ?? (!input_style ? vv_speaker_info.styles[0].name : null);
            }

            //存在しないスタイル
            if(input_style && !style){
                await helper.sendGUI(interaction, gui.create(map, "read_set_server_failure", {"{{__STYLE__}}":input_style}));
                return;
            }

            //その他パラメータ設定
            server_info.vv_speed = !Number.isNaN(speed) ? Math.min(Math.max(speed, 0.50), 2.00) : server_info.vv_speed;
            server_info.vv_pitch = !Number.isNaN(pitch) ? Math.min(Math.max(pitch, -0.15), 0.15) : server_info.vv_pitch;
            server_info.vv_intonation = !Number.isNaN(intonation) ? Math.min(Math.max(intonation, 0.00), 2.00) : server_info.vv_intonation;
            server_info.vv_volume = !Number.isNaN(volume) ? Math.min(Math.max(volume, 0.00), 2.00) : server_info.vv_volume;
            speed = server_info.vv_speed;
            pitch = server_info.vv_pitch;
            intonation = server_info.vv_intonation;
            volume = server_info.vv_volume;
            credit = `VOICEVOX:${speaker}`;
        }

        //その他パラメータ設定
        server_info.read_username = read_username ?? server_info.read_username;
        server_info.read_username_always = read_username_always ?? server_info.read_username_always;
        server_info.read_set_override = read_set_override ?? server_info.read_set_override;
        server_info.read_max = !Number.isNaN(read_max) ? Math.min(Math.max(read_max, 10), 80) : server_info.read_max;
        server_info.read_app = read_app ?? server_info.read_app;
        read_username = server_info.read_username;
        read_username_always = server_info.read_username_always;
        read_set_override = server_info.read_set_override;
        read_max = server_info.read_max;
        read_app = server_info.read_app;

        //設定の保存
        await db.setServerInfo(interaction.guild.id, server_info);

        //サーバー設定の通知
        await helper.sendGUI(interaction, gui.create(map, "read_set_server_select"));
        await helper.sendGUI(interaction.channel, gui.create(map, "read_set_server", {"{{__SPEAKER__}}":speaker, "{{__STYLE__}}":style, "{{__READ_USERNAME__}}":read_username, "{{__READ_USERNAME_ALWAYS__}}":read_username_always, "{{__READ_MAX__}}":read_max, "{{__READ_APP__}}":read_app, "{{__READ_SET_OVERRIDE__}}":read_set_override, "{{__SPEED__}}":speed, "{{__PITCH__}}":pitch, "{{__INTONATION__}}":intonation, "{{__VOLUME__}}":volume, "{{__CREDIT__}}":credit}));
        
        return;
    }catch(e){
        throw new Error(`read.js => setServer() \n ${e}`);
    }
}

//サーバー設定＠スピーカー
async function setServerSpeaker(interaction, map){
    try{
        const server_info = await db.getServerInfo(interaction.guild.id);

        //VOICEVOXのスピーカー設定
        if(server_info.read_app === "VOICEVOX"){
            const vv_speakers = map.get("voicevox_speakers");

            //現在のスピーカー
            const vv_speaker_uuid = interaction.values[0].split("speaker@")[1] ?? server_info.vv_uuid;
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
            vv_speaker_info = (await voicevox.getSpeakerInfo(vv_speaker_uuid)).data;
            vv_style_info = vv_speaker_info.style_infos[0];

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

            //スピーカーページの送信
            await helper.sendGUI(interaction, gui.create(tmp_map, "read_set_server_speaker", {"{{__SPEAKER_NAME__}}":vv_speaker_name, "{{__STYLE_NAME__}}":vv_style_name, "{{__POLICY_URL__}}":vv_speaker_info.policy.match(/(https?:\/\/[\w\-\.\/\?\,\#\:\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+)/)[0], "{{__ICON_NAME__}}":`icon.jpg`, "{{__ICON_BASE64__}}":vv_style_info.icon, "{{__VOICE_SAMPLE_NAME__}}":`${vv_speaker_name}(${vv_style_name})のサンプル音声.mp3`, "{{__VOICE_SAMPLE_BESE64__}}":vv_style_info.voice_samples[0], "{{__SPEAKER_UUID__}}":vv_speaker_uuid}));
            tmp_map.clear();
        }
        
        return;
    }catch(e){
        throw new Error(`read.js => setUserSpeaker() \n ${e}`);
    }
}

//サーバー設定＠スタイル
async function setServerStyle(interaction, map){
    try{
        const server_info = await db.getServerInfo(interaction.guild.id);

        //VOICEVOXのスタイル設定
        if(server_info.read_app === "VOICEVOX"){
            const vv_speakers = map.get("voicevox_speakers");

            //現在のスピーカー
            const vv_speaker_uuid = server_info.vv_uuid;
            const vv_speaker_idx = vv_speakers.findIndex(speaker => speaker.speaker_uuid===vv_speaker_uuid);
            const vv_speaker_name = vv_speakers[vv_speaker_idx].name;
            const vv_styles = vv_speakers[vv_speaker_idx].styles;
            const vv_style_id = interaction.values[0].split("style@")[1] ?? vv_styles[0].id;
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
            vv_speaker_info = (await voicevox.getSpeakerInfo(vv_speaker_uuid)).data;
            vv_style_info = vv_speaker_info.style_infos.find(info => info.id === parseInt(vv_style_id));

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

            //スタイルページの送信
            await helper.sendGUI(interaction, gui.create(tmp_map, "read_set_server_style", {"{{__SPEAKER_NAME__}}":vv_speaker_name, "{{__STYLE_NAME__}}":vv_style_name, "{{__POLICY_URL__}}":vv_speaker_info.policy.match(/(https?:\/\/[\w\-\.\/\?\,\#\:\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+)/)[0], "{{__ICON_NAME__}}":`icon.jpg`, "{{__ICON_BASE64__}}":vv_style_info.icon, "{{__VOICE_SAMPLE_NAME__}}":`${vv_speaker_name}(${vv_style_name})のサンプル音声.mp3`, "{{__VOICE_SAMPLE_BESE64__}}":vv_style_info.voice_samples[0], "{{__STYLE_ID__}}":vv_style_id}));
            tmp_map.clear();
        }
        
        return;
    }catch(e){
        throw new Error(`read.js => setServerStyle() \n ${e}`);
    }
}

//スピーカー選択肢の取得
async function getSpeakerChoices(interaction, map){
    try{
        const vv_speakers = map.get("voicevox_speakers");
        const choices = new Array();

        vv_speakers.find(speaker => {
            if(speaker.name.includes(focus_opt.value)){
                choices.push(speaker.name);
            }
        });

        if(!choices.length){
            choices.push("ランダム");
        }

        return choices.slice(0, 25);
    }catch(e){
        throw new Error(`read.js => getSpeakerChoices() \n ${e}`);
    }
}

//スタイル選択肢の取得
async function getStyleChoices(interaction, map){
    try{
        const user_info = await db.getUserInfo(helper.getUserId(interaction));
        const server_info = await db.getServerInfo(helper.getGuildId(interaction));
        const system_id = helper.getSystemId(interaction);
        const vv_speakers = map.get("voicevox_speakers");
        const vv_speaker = interaction.options.getString("speaker") ?? (system_id.includes("user") ? user_info.vv_uuid : null) ?? server_info.vv_uuid;
        const vv_speaker_info = vv_speakers.find(speaker => speaker.name===vv_speaker || speaker.speaker_uuid===vv_speaker);
        const choices = new Array();
        
        vv_speaker_info.styles?.find(style => {
            if(style.name.includes(focus_opt.value)){
                choices.push(style.name);
            }
        });

        if(!choices.length){
            choices.push("ランダム");
        }

        return choices.slice(0, 25);
    }catch(e){
        throw new Error(`read.js => getStyleChoices() \n ${e}`);
    }
}

//読み上げ自動終了
async function autoEnd(old_state, new_state, map){
    try{
        const text_channels = old_state.guild.channels.cache.filter((channel) => map.get(`read_text_${channel.id}`));

        text_channels.forEach((channel) => map.delete(`read_text_${channel.id}`));
        map.get(`read_voice_${old_state.channel.id}`).connection.destroy();
        map.delete(`read_voice_${old_state.channel.id}`);

        await helper.sendGUI(text_channels.at(0), gui.create(map, helper.getSystemId(old_state), {"{{__OLD_VOICE_CHANNEL__}}":old_state.channel}));
        
        return;
    }catch(e){
        throw new Error(`read.js => autoEnd() \n ${e}`);
    }
}

//読み上げキック終了
async function manualKick(old_state, new_state, map){
    try{
        const text_channels = old_state.guild.channels.cache.filter((channel) => map.get(`read_text_${channel.id}`));

        text_channels.forEach((channel) => map.delete(`read_text_${channel.id}`));
        map.delete(`read_voice_${old_state.channel.id}`);

        await helper.sendGUI(text_channels.at(0), gui.create(map, helper.getSystemId(old_state), {"{{__OLD_VOICE_CHANNEL__}}":old_state.channel}));
        
        return;
    }catch(e){
        throw new Error(`read.js => manualKick() \n ${e}`);
    }
}

//読み上げ移動変更
async function manualMove(old_state, new_state, map){
    try{
        const text_channels = old_state.guild.channels.cache.filter((channel) => map.get(`read_text_${channel.id}`));
        const new_voice_channel = await vc.connect(new_state.channel);

        text_channels.forEach((channel) => map.set(`read_text_${channel.id}`, new_state.channel.id));
        map.set(`read_voice_${new_state.channel.id}`, new_voice_channel.subscribe(createAudioPlayer()));
        map.delete(`read_voice_${old_state.channelId}`);

        await helper.sendGUI(text_channels.at(0), gui.create(map, helper.getSystemId(old_state), {"{{__OLD_VOICE_CHANNEL__}}":old_state.channel, "{{__NEW_VOICE_CHANNEL__}}":new_state.channel}));
        
        return;
    }catch(e){
        throw new Error(`read.js => manualKick() \n ${e}`);
    }
}

//読み上げコマンド実行
async function execute(trigger, map){
    try{
        const system_id = helper.getSystemId(trigger);

        //延期の送信
        if(helper.isInteraction(trigger) && !system_id.includes("modal")){
            await helper.sendDefer(trigger);
        }

        //読み上げ
        if(system_id === "read_text"){
            await readText(trigger, map);
            return;
        }

        //開始コマンド
        if(system_id === "read_start"){
            await start(trigger, map);
            return;
        }

        //終了コマンド
        if(system_id === "read_end"){
            await end(trigger, map);
            return;
        }

        //辞書追加コマンド
        if(system_id === "read_dict_add"){
            await dictAdd(trigger, map);
            return;
        }
        
        //辞書削除コマンド
        if(system_id === "read_dict_del"){
            await dictDel(trigger, map);
            return;
        }
        
        //ユーザー設定コマンド
        if(system_id === "read_set_user"){
            await setUser(trigger, map);
            return;
        }

        //サーバー設定コマンド
        if(system_id === "read_set_server"){
            await setServer(trigger, map);
            return;
        }

        //ユーザースピーカー設定ページ
        if(system_id.startsWith("read_set_user_speaker")){
            await setUserSpeaker(trigger, map);
            return;
        }

        //ユーザースタイル設定ページ
        if(system_id.startsWith("read_set_user_style")){
            await setUserStyle(trigger, map);
            return;
        }

        //サーバースピーカー設定ページ
        if(system_id.startsWith("read_set_server_speaker")){
            await setServerSpeaker(trigger, map);
            return;
        }

        //サーバースピーカー設定ページ
        if(system_id.startsWith("read_set_server_style")){
            await setServerStyle(trigger, map);
            return;
        }

        //モーダルの送信
        if(system_id.includes("modal")){
            await helper.sendModal(trigger, gui.create(map, system_id));
            await helper.sendGUI(trigger, gui.create(map, "read"));
            return;
        }

        //GUI送信
        await helper.sendGUI(trigger, gui.create(map, system_id));
        return;

    }catch(e){
        throw new Error(`read.js => execute() \n ${e}`);
    }
}

//コマンドの補助
async function autoComplete(interaction, map){
    try{
        const focus_opt = interaction.options.getFocused(true);

        //speakerオプションの補助
        if(focus_opt.name === "speaker"){
            const choices = await getSpeakerChoices(interaction, map);
            await interaction.respond(choices.map(choice => ({name: choice, value: choice})));
            return;
        }

        //styleオプションの補助
        if(focus_opt.name === "style"){
            const choices = await getStyleChoices(interaction, map);
            await interaction.respond(choices.map(choice => ({name: choice, value: choice})));
            return;
        }
    }catch(e){
        throw new Error(`read.js => autoComplete() \n ${e}`);
    }

    throw new Error(`read.js => autoComplete() \n not define option`);
}

//ボイスチャンネルの監視
async function voiceState(old_state, new_state, map){
    try{
        const system_id = helper.getSystemId(old_state);

        //読み上げ自動終了
        if(system_id === "read_voice_auto_end"){
            await autoEnd(old_state, new_state, map);
            return;
        }

        //読み上げキック終了
        if(system_id === "read_voice_manual_kick"){
            await manualKick(old_state, new_state, map);
            return;
        }

        //読み上げ移動変更
        if(system_id === "read_voice_manual_move"){
            await manualMove(old_state, new_state, map);
            return;
        }
    }catch(e){
        throw new Error(`read.js => voiceState() \n ${e}`);
    }
    
    throw new Error(`read.js => voiceState() \n not define system id`);
}

/*  todo
マニュアル移動だとプライベートチャンネルに接続できちゃうのを何とかする
*/