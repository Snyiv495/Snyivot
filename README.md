# Snyivot
スニャイヴがjavascriptで遊ぶために生み出されたDiscordのBotです。

## 目次
実装機能の一覧になります。

- [help](#help) : 使い方を知りたい方向け
- [AIの回答生成](#aiの回答生成) : 質問をしたい方向け
- [読み上げ](#読み上げ) : チャットに送信された文章の読み上げをさせたい方向け
- [誘導機能](#誘導機能) : 直感的に利用したい方向け

## help
ヘルプ機能が搭載されています。
~~このREADMEを読んでいる方には不要だとは思いますが~~

コマンドをチャットに送信するとREADME(今読んでいるこれ)が送信されます。
コマンド：`/help`

またcontentオプションが存在します。
上記コマンドを入力した後に、contentオプションを選択すると、機能の選択肢が表示されます。
知りたい機能を選択し、メッセージを送信するとその機能の使い方が表示されます。

例：`/help content voicevox`

## AIの回答生成
[cohere AI](https://cohere.com/)によるチャット機能が搭載されています。

Snyivotにメンションしながら質問をすると、その質問に対する回答を生成して出力します。
Snyivotの使い方に関する内容以外の質問にも回答します。
ただし、出力される文字数には制限があります。

例1：
`@Snyivot 読み上げの始め方を教えて`

例2：
`@Snyivot 今日の夜ご飯を考えて`

## 読み上げ
[voicevox](https://voicevox.hiroshiba.jp/)によるチャット読み上げ機能が搭載されています。

### 読み上げの開始
ボイスチャンネルに接続しているユーザーが、コマンドをチャットに送信することで、コマンドを送信したチャットでの読み上げを開始します。\
読み上げを行っているボイスチャンネルに接続している状態で、読み上げを行っていないチャットにコマンドを送信すると、そのチャットも追加で読み上げます。\
読み上げを行っているボイスチャンネル以外のボイスチャンネルに接続している状態で、チャットにコマンドを送信すると、既存のボイスチャンネルでの読み上げを終了し、新しいボイスチャンネルでコマンドが送信されたチャットの読み上げを開始します。

コマンド：
`/voicevox_start`

### 読み上げの終了
読み上げを行っているボイスチャンネルに接続している状態で、読み上げを行っているチャットにコマンドを送信することで、送信したチャットでの読み上げを終了します。\
これによって読み上げるチャットがなくなった場合は、ボイスチャンネルから切断されます。

コマンド：
`/voicevox_end`

またallオプションが存在します。\
上記コマンドを入力した後に、allオプションを選択すると、全体終了の選択肢が表示されます。\
サーバーすべてのチャットの読み上げを終了したい場合は`True`を選択してください。

コマンド：
`/voicevox_end all True`


### ユーザー設定
読み上げに関して、ユーザーごとに設定することができます。\
チャットにコマンドを送信することで、送信した設定に応じて読み上げ方を変更できます。\
オプションを指定しなかった場合は何も変更されず、現在の設定が表示されます。

コマンド：
`/voicevox_setting_user`

また以下のオプションが存在します。

- speaker
このオプションを選択すると、「ランダム」の選択肢が出てきます。「ランダム」を選択し、コマンドを送信すると、読み上げ音声のキャラクターがランダムで決定されます。
また、直接名前を入力してコマンドを送信すると、そのキャラクターで読み上げを行います。キャラクターは[公式サイト](https://voicevox.hiroshiba.jp/)から確認できます。
例1：
`/voicevox_setting_user speaker ランダム`
例2：
`/voicevox_setting_user speaker ずんだもん`

- style
このオプションを選択すると、現在の読み上げ音声のキャラクターに応じたスタイルの選択肢が出てきます。すでにspeakerオプションで新しいキャラクターを選択している場合は、そのキャラクターのスタイルの選択肢が出てきます。
スタイルを入力してコマンドを送信すると、そのスタイルでの読み上げを行います。スタイルは[公式サイト](https://voicevox.hiroshiba.jp/)から確認できます。
例1：
`/voicevox_setting_user style ノーマル`
例2：
`/voicevox_setting_user speaker ずんだもん style あまあま`
- speed
このオプションを選択して数字を入力すると、読み上げの速度を変更できます。数字の範囲は0.5~2.0で、デフォルトの速度は1.0です。
例：
`/voicevox_setting_user speed 1.5`
- pitch
このオプションを選択して数字を入力すると、読み上げの高さを変更できます。数字の範囲は-0.15~0.15で、デフォルトの高さは0.0です。
例：
`/voicevox_setting_user pitch 0.1`
- intonation
このオプションを選択して数字を入力すると、読み上げの抑揚を変更できます。数字の範囲は0.0~2.0で、デフォルトの抑揚は1.0です。
例：
`/voicevox_setting_user intonation 0.0`
- volume
このオプションを選択して数字を入力すると、読み上げの音量を変更できます。数字の範囲は0.0~2.0で、デフォルトの音量は1.0です。
例：
`/voicevox_setting_user volume 1.25`
- username
このオプションを選択して文字を入力すると、名前の読み方を変更できます。名前に飾り文字が入っているなど、正しく読み上げてくれないときに利用してください。
例：
`/voicevox_setting_user username ほげほげ`

### サーバー設定
読み上げに関して、サーバーの設定をすることができます。\
チャットにコマンドを送信することで、送信した設定に応じて読み上げ方を変更できます。\
オプションを指定しなかった場合は何も変更されず、現在の設定が表示されます。

コマンド：
`/voicevox_setting_server`

また以下のオプションが存在します。

- need_sudo
このオプションを選択すると要管理者権限の選択肢が出てきます。このサーバー設定コマンドをサーバー管理者以外が利用できないようにしたい場合は`True`を選択してください。
例：
`/voicevox_setting_server need_sudo True`
- read_name
このオプションを選択すると名前読み上げの選択肢が出てきます。読み上げを行う際に、チャット送信者の名前も読み上げるようにしたい場合は`True`を選択してください。
例：
`/voicevox_setting_server read_name True`
- continue_name
このオプションを選択すると同一ユーザー名読み上げの選択肢が出てきます。同じユーザーが連続でチャットを送信した場合、二回目以降もチャット送信者の名前を読み上げるようにしたい場合は`True`を選択してください。
例：
`/voicevox_setting_server continue_name True`
- continue_line
このオプションを選択すると複数行読み上げの選択肢が出てきます。チャットが二行以上あってもすべて読み上げるようにしたい場合は`True`を選択してください。
例：
`/voicevox_setting_server continue_line True`
- maxwords
このオプションを選択して数字を入力すると、読み上げの最大文字数を変更できます。数字の範囲は10~50で、デフォルトの最大文字数は50です。
例：
`/voicevox_setting_server maxwords 30`
- unif
このオプションを選択すると読み上げ方統一の選択肢が出てきます。サーバー設定で決めた読み上げ方で全員の読み上げ方を統一したい場合は`True`を選択してください。
例：
`/voicevox_setting_server unif True`

他にも読み上げ方のオプションが存在します。詳しくは[ユーザー設定](#ユーザー設定)のオプションを参照してください。

### 辞書追加
読み上げに関して、辞書の設定をすることができます。\
チャットにコマンドを送信することで、辞書を追加して読み方を設定できます。

コマンド：
`/voicevox_dictionary_add`

また以下のオプションが存在します。

- surface
このオプションを選択して文字を入力すると、読み方を変更する文字を指定できます。このオプションは必須です。
- pronunciation
このオプションを選択してカタカナを入力すると、文字の読み方を指定できます。このオプションは必須です。
例：
`/voicevox_dictionary_add surface 摩訶不思議 pronuncication パルプンテ`

- accent
このオプションを選択して数字を入力すると、pronunciationオプションで入力したカタカナの[入力した数字]番目の語調が下がります。数字の範囲は1~[カタカナの文字数]で、デフォルトの位置は1文字目です。ただし、拗音は前の文字と合わせて一文字と判断される場合があります。(「きゃ」など)
例：
`/voicevox_dictionary_add surface 摩訶不思議 pronuncication パルプンテ accent 4`

- priority
このオプションを選択して数字を入力すると、追加する言葉の優先度が設定できます。設定しても読み方が変わらない場合や、すでに設定した文字と一部被る文字がある場合に優先度を高く設定してください。数字の範囲は1~9で、デフォルトの優先度は5です。
例：
`/voicevox_dictionary_add surface 摩訶不思議 pronuncication パルプンテ priority 9`


### 辞書削除
読み上げに関して、辞書の設定をすることができます。\
チャットにコマンドを送信することで、辞書を追加して読み方を設定できます。
オプションを指定しなかった場合は、現在の辞書一覧がcsvファイルで送信されます。

コマンド：
`/voicevox_dictionary_delete`

また以下のオプションが存在します。

- uuid
このオプションを選択してuuidを入力すると、そのuuidに紐づいた言葉が辞書から削除されます。\
uuidは辞書を登録したときや、辞書一覧のcsvファイルから確認することができ、
`〇〇〇〇〇〇〇〇-〇〇〇〇-〇〇〇〇-〇〇〇〇-〇〇〇〇〇〇〇〇〇〇〇〇`の形をしたランダムな文字列です。

例：
`/voicevox_dictionary_delete uuid 12345678-abcd-ijkl-wxyz-1234567890ab`

また、uuidの文字をすべて`x`あるいは`*`にすると、辞書の全削除が行えます。

例：
`/voicevox_dictionary_delete uuid ********-****-****-****-************`

## 誘導機能
コマンドではなく直感的に利用したい方向けに、ボタン選択式の誘導機能が搭載されています。\
Snyivotをメンションすると誘導が始まります。

コマンド：
`@Snyivot`

目的に合わせてボタンをクリックしてください。\
ただし簡易的に利用できる反面、複雑な機能を利用することはできません。(読み上げの設定や辞書など)
