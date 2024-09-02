/*****************
    embed.js
    スニャイヴ
    2024/09/03
*****************/

module.exports = {
    menu_home: menu_home,
    menu_voicevox: menu_voicevox,
    menu_help: menu_help,
    readme: readme,
    cohere: cohere,
    menu_help_voicevox_1: menu_help_voicevox_1,
    menu_help_voicevox_2: menu_help_voicevox_2,
    help_voicevox_start: help_voicevox_start,
    help_voicevox_end: help_voicevox_end,
    help_voicevox_setting_user: help_voicevox_setting_user,
    help_voicevox_setting_server: help_voicevox_setting_server,
    help_voicevox_dictAdd: help_voicevox_dictAdd,
    help_voicevox_dictDel: help_voicevox_dictDel,
}

const {EmbedBuilder, AttachmentBuilder,  ButtonBuilder, ButtonStyle, ActionRowBuilder} = require('discord.js');

function menu_home(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const buttons = new ActionRowBuilder();
    const voicevox = new ButtonBuilder();
    const zundamocchi = new ButtonBuilder();
    const help = new ButtonBuilder();

    embed.setTitle("呼ばれたのだ！\n何がしたいのだ？")
    embed.setThumbnail("attachment://icon.png")
    embed.setFooter({text: "ボタンを押してください"})
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/dumb.png");
    
    voicevox.setCustomId("voicevox");
    voicevox.setStyle(ButtonStyle.Primary);
    voicevox.setLabel("読み上げ");
    voicevox.setDisabled(false);

    zundamocchi.setCustomId("zundamocchi");
    zundamocchi.setStyle(ButtonStyle.Primary);
    zundamocchi.setLabel("ずんだもっち");
    zundamocchi.setDisabled(true);

    help.setCustomId("help");
    help.setStyle(ButtonStyle.Secondary);
    help.setLabel("使い方");
    help.setDisabled(false);

    buttons.addComponents(voicevox);
    buttons.addComponents(zundamocchi);
    buttons.addComponents(help);

    return {files: [attachment], embeds: [embed], components: [buttons]};
}

function menu_voicevox(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const buttons = new ActionRowBuilder();
    const start = new ButtonBuilder();
    const end = new ButtonBuilder();
    const endAll = new ButtonBuilder();

    embed.setTitle("読み上げの開始か終了をするのだ？")
    embed.setThumbnail("attachment://icon.png")
    embed.setFooter({text: "ボタンを押してください"})
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/dumb.png");
    
    start.setCustomId("vv_start");
    start.setStyle(ButtonStyle.Primary);
    start.setLabel("開始");
    start.setDisabled(false);

    end.setCustomId("vv_end");
    end.setStyle(ButtonStyle.Danger);
    end.setLabel("終了");
    end.setDisabled(false);

    endAll.setCustomId("vv_end_all");
    endAll.setStyle(ButtonStyle.Danger);
    endAll.setLabel("全体終了");
    endAll.setDisabled(false);

    buttons.addComponents(start);
    buttons.addComponents(end);
    buttons.addComponents(endAll);

    return {files: [attachment], embeds: [embed], components: [buttons], ephemeral: true};
}

function menu_help(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const buttons = new ActionRowBuilder();
    const cohere = new ButtonBuilder();
    const voicevox = new ButtonBuilder();
    const readme = new ButtonBuilder();

    embed.setTitle("何について知りたいのだ？")
    embed.setThumbnail("attachment://icon.png")
    embed.setFooter({text: "ボタンを押してください"})
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/dumb.png");

    
    cohere.setCustomId("help_cohere");
    cohere.setStyle(ButtonStyle.Primary);
    cohere.setLabel("AI");
    cohere.setDisabled(false);

    voicevox.setCustomId("help_voicevox");
    voicevox.setStyle(ButtonStyle.Primary);
    voicevox.setLabel("読み上げ");
    voicevox.setDisabled(false);

    readme.setCustomId("readme");
    readme.setStyle(ButtonStyle.Secondary);
    readme.setLabel("Snyivot");
    readme.setDisabled(false);

    buttons.addComponents(cohere);
    buttons.addComponents(voicevox);
    buttons.addComponents(readme);

    return {files: [attachment], embeds: [embed], components: [buttons], ephemeral: true};
}

function readme(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    
    embed.setTitle("Snyivotの使い方は\nこれを読めばばっちりなのだ");
    embed.setURL("https://github.com/Snyiv495/Snyivot");
    embed.setThumbnail("attachment://icon.png");
    embed.setFooter({text: "プレビューでは読みにくいのでリンクから飛んでください"});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/happy.png");
    
    return {files: ["./README.md", attachment], embeds: [embed], ephemeral: true};
}

function cohere(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    embed.setTitle("cohere AIの使い方を教えるのだ");
    embed.setURL("https://cohere.com/");
    embed.setThumbnail("attachment://icon.png");
    embed.addFields({name: "ぼくにメンションしながら質問をしてくれたら答えるのだ", value: "例：@Snyivot 読み上げの始め方を教えて"});
    embed.addFields({name: "使い方以外の質問も大歓迎なのだ", value: "例：@Snyivot 今日の夜ご飯を考えて"});
    embed.setFooter({text: "出力は最大でも200文字程度です"});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/normal.png");

    return {files: [attachment], embeds: [embed], ephemeral: true};
}

function menu_help_voicevox_1(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const buttons = new ActionRowBuilder();
    const start = new ButtonBuilder();
    const end = new ButtonBuilder();
    const setting_user = new ButtonBuilder();
    const setting_server = new ButtonBuilder();
    const to_menu_help_voicevox_2 = new ButtonBuilder();

    embed.setTitle("何について知りたいのだ？")
    embed.setThumbnail("attachment://icon.png")
    embed.setFooter({text: "ボタンを押してください"})
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/dumb.png");

    start.setCustomId("help_voicevox_start");
    start.setStyle(ButtonStyle.Primary);
    start.setLabel("開始");
    start.setDisabled(false);

    end.setCustomId("help_voicevox_end");
    end.setStyle(ButtonStyle.Primary);
    end.setLabel("終了");
    end.setDisabled(false);

    setting_user.setCustomId("help_voicevox_setting_user");
    setting_user.setStyle(ButtonStyle.Success);
    setting_user.setLabel("ユーザー設定");
    setting_user.setDisabled(false);

    setting_server.setCustomId("help_voicevox_setting_server");
    setting_server.setStyle(ButtonStyle.Success);
    setting_server.setLabel("サーバー設定");
    setting_server.setDisabled(false);

    to_menu_help_voicevox_2.setCustomId("to_menu_help_voicevox_2");
    to_menu_help_voicevox_2.setStyle(ButtonStyle.Secondary);
    to_menu_help_voicevox_2.setLabel("次へ");
    to_menu_help_voicevox_2.setDisabled(false);


    buttons.addComponents(start);
    buttons.addComponents(end);
    buttons.addComponents(setting_user);
    buttons.addComponents(setting_server);
    buttons.addComponents(to_menu_help_voicevox_2);

    return {files: [attachment], embeds: [embed], components: [buttons], ephemeral: true};
}

function menu_help_voicevox_2(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const buttons = new ActionRowBuilder();
    const to_menu_help_voicevox_1 = new ButtonBuilder();
    const dictAdd = new ButtonBuilder();
    const dictDel = new ButtonBuilder();

    embed.setTitle("何について知りたいのだ？")
    embed.setThumbnail("attachment://icon.png")
    embed.setFooter({text: "ボタンを押してください"})
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/dumb.png");

    to_menu_help_voicevox_1.setCustomId("to_menu_help_voicevox_1");
    to_menu_help_voicevox_1.setStyle(ButtonStyle.Secondary);
    to_menu_help_voicevox_1.setLabel("前へ");
    to_menu_help_voicevox_1.setDisabled(false);

    dictAdd.setCustomId("help_voicevox_dictAdd");
    dictAdd.setStyle(ButtonStyle.Success);
    dictAdd.setLabel("辞書追加");
    dictAdd.setDisabled(false);

    dictDel.setCustomId("help_voicevox_dictDel");
    dictDel.setStyle(ButtonStyle.Success);
    dictDel.setLabel("辞書削除");
    dictDel.setDisabled(false);

    buttons.addComponents(to_menu_help_voicevox_1);
    buttons.addComponents(dictAdd);
    buttons.addComponents(dictDel);

    return {files: [attachment], embeds: [embed], components: [buttons], ephemeral: true};
}

function help_voicevox_start(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    embed.setTitle("読み上げの開始方法を教えるのだ");
    embed.setThumbnail("attachment://icon.png");
    embed.addFields({name: "スラッシュコマンドで読み上げを開始できるのだ", value: "/voicevox_start"});
    embed.addFields({name: "複数のチャットを読み上げることもできるのだ", value: "読み上げを行っていないチャットにコマンドを送信すると、そのチャットも追加で読み上げます。"});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/normal.png");

    return {files: [attachment], embeds: [embed], ephemeral: true};
}

function help_voicevox_end(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    embed.setTitle("読み上げの終了方法を教えるのだ");
    embed.setThumbnail("attachment://icon.png");
    embed.addFields({name: "スラッシュコマンドで読み上げを終了できるのだ", value: "/voicevox_end"});
    embed.addFields({name: "オプションを追加することでサーバー全体での読み上げも終了できるのだ", value: "/voicevox_end all True"});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/normal.png");

    return {files: [attachment], embeds: [embed], ephemeral: true};
}

function help_voicevox_setting_user(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    embed.setTitle("ユーザー設定の変更方法を教えるのだ");
    embed.setThumbnail("attachment://icon.png");
    embed.addFields({name: "スラッシュコマンドで設定を確認できるのだ", value: "/voicevox_setting_user"});
    embed.addFields({name: "オプションを追加することで設定の変更ができるのだ", value: "以下のオプションが存在します"});
    embed.addFields({name: "読み上げるキャラクターを変更できるのだ", value: "例：/voicevox_setting_user speaker ずんだもん"});
    embed.addFields({name: "読み上げるスタイルを変更できるのだ", value: "例：/voicevox_setting_user style ノーマル"});
    embed.addFields({name: "読み上げる速度を変更できるのだ", value: "例：/voicevox_setting_user speed 1.5"});
    embed.addFields({name: "読み上げる高さを変更できるのだ", value: "例：/voicevox_setting_user pitch 0.1"});
    embed.addFields({name: "読み上げる抑揚を変更できるのだ", value: "例：/voicevox_setting_user intonation 0.0"});
    embed.addFields({name: "読み上げる音量を変更できるのだ", value: "例：/voicevox_setting_user volume 1.25"});
    embed.addFields({name: "読み上げる名前の読み方を変更できるのだ", value: "例：/voicevox_setting_user username ほげほげ"});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/normal.png");

    return {files: [attachment], embeds: [embed], ephemeral: true};
}

function help_voicevox_setting_server(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    embed.setTitle("サーバー設定の変更方法を教えるのだ");
    embed.setThumbnail("attachment://icon.png");
    embed.addFields({name: "スラッシュコマンドで設定を確認できるのだ", value: "/voicevox_setting_server"});
    embed.addFields({name: "オプションを追加することで設定の変更ができるのだ", value: "以下のオプションが存在します"});
    embed.addFields({name: "このコマンドに対する要管理者権限の変更ができるのだ", value: "例：/voicevox_setting_server need_sudo True"});
    embed.addFields({name: "読み上げる時に名前も読み上げるかを変更できるのだ", value: "例：/voicevox_setting_server read_name True"});
    embed.addFields({name: "同一人物が連続でチャットを送ったときも名前を読み上げるかを変更できるのだ", value: "例：/voicevox_setting_server continue_name True"});
    embed.addFields({name: "読み上げるチャットが二行以上でもすべて読み上げるかを変更できるのだ", value: "例：/voicevox_setting_server continue_line True"});
    embed.addFields({name: "読み上げる最大文字数を変更できるのだ", value: "例：/voicevox_setting_server maxwords 30"});
    embed.addFields({name: "読み上げ方の設定を統一するかを変更できるのだ", value: "例：/voicevox_setting_server unif True"});
    embed.addFields({name: "他にも読み上げ方のオプションが存在するのだ", value: "詳しくはユーザー設定のヘルプを確認してください"});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/normal.png");

    return {files: [attachment], embeds: [embed], ephemeral: true};
}

function help_voicevox_dictAdd(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    embed.setTitle("辞書の追加方法を教えるのだ");
    embed.setThumbnail("attachment://icon.png");
    embed.addFields({name: "スラッシュコマンドで辞書を追加できるのだ", value: "例：/voicevox_dictionary_add surface 摩訶不思議 pronuncication パルプンテ"});
    embed.addFields({name: "オプションを追加することで細かい設定ができるのだ", value: "以下のオプションが存在します"});
    embed.addFields({name: "読み方を変更する文字を「surface」で指定できるのだ", value: "このオプションは必須です"});
    embed.addFields({name: "文字の読み方を「pronuncication」で指定できるのだ", value: "このオプションは必須です"});
    embed.addFields({name: "語調が下がる位置を指定できるのだ", value: "例：/voicevox_dictionary_add surface 摩訶不思議 pronuncication パルプンテ accent 4"});
    embed.addFields({name: "追加する言葉の優先度が設定できるのだ", value: "例：/voicevox_dictionary_add surface 摩訶不思議 pronuncication パルプンテ priority 9"});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/normal.png");

    return {files: [attachment], embeds: [embed], ephemeral: true};
}

function help_voicevox_dictDel(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    embed.setTitle("辞書の削除方法を教えるのだ");
    embed.setThumbnail("attachment://icon.png");
    embed.addFields({name: "スラッシュコマンドで辞書の一覧が取得できるのだ", value: "/voicevox_dictionary_delete"});
    embed.addFields({name: "オプションを追加することで辞書の削除ができるのだ", value: "例：/voicevox_dictionary_delete uuid 12345678-abcd-ijkl-wxyz-1234567890ab"});
    embed.addFields({name: "uuidの文字をすべて`x`か`*`にすると全削除ができるのだ", value: "例：/voicevox_dictionary_delete uuid xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"});

    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/normal.png");

    return {files: [attachment], embeds: [embed], ephemeral: true};
}