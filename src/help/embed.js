/*****************
    embed.js
    スニャイヴ
    2024/09/04
*****************/

module.exports = {
    menu_mention: menu_mention,
    menu_vv: menu_vv,
    menu_help: menu_help,
    menu_help_vv01: menu_help_vv01,
    menu_help_vv02: menu_help_vv02,
    help_readme: help_readme,
    help_cohere: help_cohere,
    help_vv_start: help_vv_start,
    help_vv_end: help_vv_end,
    help_vv_setUser: help_vv_setUser,
    help_vv_setServer: help_vv_setServer,
    help_vv_dictAdd: help_vv_dictAdd,
    help_vv_dictDel: help_vv_dictDel,
}

const {EmbedBuilder, AttachmentBuilder,  ButtonBuilder, ButtonStyle, ActionRowBuilder} = require('discord.js');

function menu_mention(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const buttons = new ActionRowBuilder();
    const menu_vv = new ButtonBuilder();
    const menu_zundamocchi = new ButtonBuilder();
    const menu_help = new ButtonBuilder();

    embed.setTitle("呼ばれたのだ！\n何がしたいのだ？")
    embed.setThumbnail("attachment://icon.png")
    embed.addFields({name: "ボクは忙しいから何もないならすぐに帰るのだ", value: "10秒後にこのメッセージは削除されます"})
    embed.setFooter({text: "ボタンを押してください"})
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/dumb.png");
    
    menu_vv.setCustomId("menu_vv");
    menu_vv.setStyle(ButtonStyle.Primary);
    menu_vv.setLabel("読み上げ");
    menu_vv.setDisabled(false);

    menu_zundamocchi.setCustomId("menu_zundamocchi");
    menu_zundamocchi.setStyle(ButtonStyle.Primary);
    menu_zundamocchi.setLabel("ずんだもっち");
    menu_zundamocchi.setDisabled(true);

    menu_help.setCustomId("menu_help");
    menu_help.setStyle(ButtonStyle.Secondary);
    menu_help.setLabel("使い方");
    menu_help.setDisabled(false);

    buttons.addComponents(menu_vv);
    buttons.addComponents(menu_zundamocchi);
    buttons.addComponents(menu_help);

    return {files: [attachment], embeds: [embed], components: [buttons]};
}

function menu_vv(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const buttons = new ActionRowBuilder();
    const start_vv = new ButtonBuilder();
    const end_vv = new ButtonBuilder();
    const endAll_vv = new ButtonBuilder();

    embed.setTitle("読み上げの開始か終了をするのだ？")
    embed.setThumbnail("attachment://icon.png")
    embed.setFooter({text: "ボタンを押してください"})
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/dumb.png");
    
    start_vv.setCustomId("start_vv");
    start_vv.setStyle(ButtonStyle.Primary);
    start_vv.setLabel("開始");
    start_vv.setDisabled(false);

    end_vv.setCustomId("end_vv");
    end_vv.setStyle(ButtonStyle.Danger);
    end_vv.setLabel("終了");
    end_vv.setDisabled(false);

    endAll_vv.setCustomId("endAll_vv");
    endAll_vv.setStyle(ButtonStyle.Danger);
    endAll_vv.setLabel("全体終了");
    endAll_vv.setDisabled(false);

    buttons.addComponents(start_vv);
    buttons.addComponents(end_vv);
    buttons.addComponents(endAll_vv);

    return {files: [attachment], embeds: [embed], components: [buttons], ephemeral: true};
}

function menu_help(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const buttons = new ActionRowBuilder();
    const help_cohere = new ButtonBuilder();
    const menu_help_vv01 = new ButtonBuilder();
    const help_readme = new ButtonBuilder();

    embed.setTitle("何について知りたいのだ？")
    embed.setThumbnail("attachment://icon.png")
    embed.setFooter({text: "ボタンを押してください"})
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/dumb.png");

    
    help_cohere.setCustomId("help_cohere");
    help_cohere.setStyle(ButtonStyle.Primary);
    help_cohere.setLabel("AI");
    help_cohere.setDisabled(false);

    menu_help_vv01.setCustomId("menu_help_vv01");
    menu_help_vv01.setStyle(ButtonStyle.Primary);
    menu_help_vv01.setLabel("読み上げ");
    menu_help_vv01.setDisabled(false);

    help_readme.setCustomId("help_readme");
    help_readme.setStyle(ButtonStyle.Secondary);
    help_readme.setLabel("Snyivot");
    help_readme.setDisabled(false);

    buttons.addComponents(help_cohere);
    buttons.addComponents(menu_help_vv01);
    buttons.addComponents(help_readme);

    return {files: [attachment], embeds: [embed], components: [buttons], ephemeral: true};
}

function menu_help_vv01(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const buttons = new ActionRowBuilder();
    const help_vv_start = new ButtonBuilder();
    const help_vv_end = new ButtonBuilder();
    const help_vv_setUser = new ButtonBuilder();
    const help_vv_setServer = new ButtonBuilder();
    const menu_help_vv02 = new ButtonBuilder();

    embed.setTitle("何について知りたいのだ？")
    embed.setThumbnail("attachment://icon.png")
    embed.setFooter({text: "ボタンを押してください"})
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/dumb.png");

    help_vv_start.setCustomId("help_vv_start");
    help_vv_start.setStyle(ButtonStyle.Primary);
    help_vv_start.setLabel("開始");
    help_vv_start.setDisabled(false);

    help_vv_end.setCustomId("help_vv_end");
    help_vv_end.setStyle(ButtonStyle.Primary);
    help_vv_end.setLabel("終了");
    help_vv_end.setDisabled(false);

    help_vv_setUser.setCustomId("help_vv_setUser");
    help_vv_setUser.setStyle(ButtonStyle.Success);
    help_vv_setUser.setLabel("ユーザー設定");
    help_vv_setUser.setDisabled(false);

    help_vv_setServer.setCustomId("help_vv_setServer");
    help_vv_setServer.setStyle(ButtonStyle.Success);
    help_vv_setServer.setLabel("サーバー設定");
    help_vv_setServer.setDisabled(false);

    menu_help_vv02.setCustomId("menu_help_vv02");
    menu_help_vv02.setStyle(ButtonStyle.Secondary);
    menu_help_vv02.setLabel("次へ");
    menu_help_vv02.setDisabled(false);


    buttons.addComponents(help_vv_start);
    buttons.addComponents(help_vv_end);
    buttons.addComponents(help_vv_setUser);
    buttons.addComponents(help_vv_setServer);
    buttons.addComponents(menu_help_vv02);

    return {files: [attachment], embeds: [embed], components: [buttons], ephemeral: true};
}

function menu_help_vv02(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();
    const buttons = new ActionRowBuilder();
    const menu_help_vv01 = new ButtonBuilder();
    const help_vv_dictAdd = new ButtonBuilder();
    const help_vv_dictDel = new ButtonBuilder();

    embed.setTitle("何について知りたいのだ？")
    embed.setThumbnail("attachment://icon.png")
    embed.setFooter({text: "ボタンを押してください"})
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/dumb.png");

    menu_help_vv01.setCustomId("menu_help_vv01");
    menu_help_vv01.setStyle(ButtonStyle.Secondary);
    menu_help_vv01.setLabel("前へ");
    menu_help_vv01.setDisabled(false);

    help_vv_dictAdd.setCustomId("help_vv_dictAdd");
    help_vv_dictAdd.setStyle(ButtonStyle.Success);
    help_vv_dictAdd.setLabel("辞書追加");
    help_vv_dictAdd.setDisabled(false);

    help_vv_dictDel.setCustomId("help_vv_dictDel");
    help_vv_dictDel.setStyle(ButtonStyle.Success);
    help_vv_dictDel.setLabel("辞書削除");
    help_vv_dictDel.setDisabled(false);

    buttons.addComponents(menu_help_vv01);
    buttons.addComponents(help_vv_dictAdd);
    buttons.addComponents(help_vv_dictDel);

    return {files: [attachment], embeds: [embed], components: [buttons], ephemeral: true};
}

function help_readme(){
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

function help_cohere(){
    const embed = new EmbedBuilder();
    const attachment = new AttachmentBuilder();

    embed.setTitle("cohere AIの使い方を教えるのだ");
    embed.setURL("https://cohere.com/");
    embed.setThumbnail("attachment://icon.png");
    embed.addFields({name: "ぼくにメンションしながら質問をしてくれたら答えるのだ", value: "例：@Snyivot 読み上げの始め方を教えて"});
    embed.addFields({name: "使い方以外の質問も大歓迎なのだ", value: "例：@Snyivot 今日の夜ご飯を考えて"});
    embed.setFooter({text: "出力は最大でも1000文字程度です"});
    embed.setColor(0x00FF00);
    attachment.setName("icon.png");
    attachment.setFile("zundamon/face/normal.png");

    return {files: [attachment], embeds: [embed], ephemeral: true};
}

function help_vv_start(){
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

function help_vv_end(){
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

function help_vv_setUser(){
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

function help_vv_setServer(){
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

function help_vv_dictAdd(){
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

function help_vv_dictDel(){
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