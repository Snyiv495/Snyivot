/*****************
    help.js
    スニャイヴ
    2024/10/24
*****************/

module.exports = {
    sendHelp: sendHelp,
}

require('dotenv').config();
const {EmbedBuilder, AttachmentBuilder} = require('discord.js');
const cui = require('../cui');

//埋め込みの作成
function createEmbed(content){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    switch(content){
        case "start" : {
            embed.setTitle("読み上げの開始方法を教えるのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.addFields({name: "1️⃣ コマンドの送信で読み上げを開始できるのだ", value: "コマンド：/voicevox_start"});
            embed.addFields({name: "2️⃣ 複数のチャンネルを読み上げることもできるのだ", value: "読み上げをしてないチャンネルにコマンドを送信すると、読み上げるチャンネルを追加します。"});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
            attachment.setFile("assets/zundamon/icon/flaunt.png");
            break;
        }
        case "end" : {
            embed.setTitle("読み上げの終了方法を教えるのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.addFields({name: "1️⃣ コマンドの送信でそのチャンネルの読み上げを終了できるのだ", value: "コマンド：/voicevox_end"});
            embed.addFields({name: "2️⃣ オプションを追加することで読み上げを終了できるのだ", value: "コマンド：/voicevox_end all True"});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
            attachment.setFile("assets/zundamon/icon/flaunt.png");
            break;
        }
        case "setting_user" : {
            embed.setTitle("ユーザー設定の方法を教えるのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.addFields({name: "1️⃣ コマンドの送信で設定を確認できるのだ", value: "コマンド：/voicevox_setting_user"});
            embed.addFields({name: "2️⃣ オプションを追加することで設定の変更ができるのだ", value: "以下のオプションが存在します"});
            embed.addFields({name: "3️⃣ 読み上げるキャラクターを変更できるのだ", value: "コマンド例：/voicevox_setting_user speaker ずんだもん"});
            embed.addFields({name: "4️⃣ 読み上げるスタイルを変更できるのだ", value: "コマンド例：/voicevox_setting_user style ノーマル"});
            embed.addFields({name: "5️⃣ 読み上げる速度を変更できるのだ", value: "コマンド例：/voicevox_setting_user speed 1.5"});
            embed.addFields({name: "6️⃣ 読み上げる高さを変更できるのだ", value: "コマンド例：/voicevox_setting_user pitch 0.1"});
            embed.addFields({name: "7️⃣ 読み上げる抑揚を変更できるのだ", value: "コマンド例：/voicevox_setting_user intonation 0.0"});
            embed.addFields({name: "8️⃣読み上げる音量を変更できるのだ", value: "コマンド例：/voicevox_setting_user volume 1.25"});
            embed.addFields({name: "9️⃣読み上げる名前の読み方を変更できるのだ", value: "コマンド例：/voicevox_setting_user username ほげほげ"});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
            attachment.setFile("assets/zundamon/icon/flaunt.png");
            break;
        }
        case "setting_server" : {
            embed.setTitle("サーバー設定の方法を教えるのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.addFields({name: "1️⃣ コマンドの送信で設定を確認できるのだ", value: "コマンド：/voicevox_setting_server"});
            embed.addFields({name: "2️⃣ オプションを追加することで設定の変更ができるのだ", value: "以下のオプションが存在します"});
            embed.addFields({name: "3️⃣ このコマンドに対する要管理者権限の変更ができるのだ", value: "コマンド例：/voicevox_setting_server need_sudo True"});
            embed.addFields({name: "4️⃣ 読み上げる時にユーザー名も読み上げるかを変更できるのだ", value: "コマンド例：/voicevox_setting_server read_name True"});
            embed.addFields({name: "5️⃣ 同一人物が連続でチャットを送ったときも名前を読み上げるかを変更できるのだ", value: "コマンド例：/voicevox_setting_server read_sameuser True"});
            embed.addFields({name: "6️⃣ 読み上げるチャットが二行以上でもすべて読み上げるかを変更できるのだ", value: "コマンド例：/voicevox_setting_server read_multiline True"});
            embed.addFields({name: "7️⃣ 読み上げる最大文字数を変更できるのだ", value: "コマンド例：/voicevox_setting_server maxwords 30"});
            embed.addFields({name: "8️⃣ 読み上げ方の設定を統一するかを変更できるのだ", value: "コマンド例：/voicevox_setting_server unif True"});
            embed.addFields({name: "9️⃣ 他にも読み上げ方のオプションが存在するのだ", value: "詳しくはユーザー設定のヘルプを確認してください"});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
            attachment.setFile("assets/zundamon/icon/flaunt.png");
            break;
        }
        case "dictionary_add" : {
            embed.setTitle("辞書の追加方法を教えるのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.addFields({name: "1️⃣ コマンドの送信で辞書を追加できるのだ", value: "コマンド例：/voicevox_dictionary_add surface 摩訶不思議 pronuncication パルプンテ"});
            embed.addFields({name: "2️⃣ オプションを追加することで細かい設定ができるのだ", value: "以下のオプションが存在します"});
            embed.addFields({name: "3️⃣ 読み方を設定する文字を「surface」で指定できるのだ", value: "このオプションは必須です"});
            embed.addFields({name: "4️⃣ 文字の読み方を「pronuncication」で指定できるのだ", value: "このオプションは必須で、カタカナである必要があります"});
            embed.addFields({name: "5️⃣ 語調が下がる位置を指定できるのだ", value: "コマンド例：/voicevox_dictionary_add surface 摩訶不思議 pronuncication パルプンテ accent 4"});
            embed.addFields({name: "6️⃣ 追加する言葉の優先度が設定できるのだ", value: "コマンド例：/voicevox_dictionary_add surface 摩訶不思議 pronuncication パルプンテ priority 9"});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
            attachment.setFile("assets/zundamon/icon/flaunt.png");
            break;
        }
        case "dictionary_delete" : {
            embed.setTitle("辞書の削除方法を教えるのだ");
            embed.setThumbnail("attachment://icon.png");
            embed.addFields({name: "1️⃣ コマンドの送信で辞書の一覧が取得できるのだ", value: "コマンド：/voicevox_dictionary_delete"});
            embed.addFields({name: "2️⃣ オプションを追加することで辞書の削除ができるのだ", value: "コマンド例：/voicevox_dictionary_delete uuid 12345678-abcd-ijkl-wxyz-1234567890ab"});
            embed.addFields({name: "3️⃣ uuidの文字をすべて`x`か`*`にすると全削除ができるのだ", value: "コマンド：/voicevox_dictionary_delete uuid xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"});
            embed.setColor(0x00FF00);
            attachment.setName("icon.png");
            attachment.setFile("assets/zundamon/icon/flaunt.png");
            break;
        }default : break;
    }

    return {content: "", files: [attachment], embeds: [embed], ephemeral: true};
}

//ヘルプの送信
async function sendHelp(interaction, options){
    let progress = null;
    
    progress = await cui.createProgressbar(interaction, 1);
    progress = await cui.stepProgressbar(progress);
    
    await interaction.editReply(createEmbed(options.content));

    return 0;
}