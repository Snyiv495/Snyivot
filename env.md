# Snyivotの環境構築 on Android
1. [**Termux**](#1-termux)
2. [**Ubuntu**](#2-ubuntu)
3. [**python**](#3-python)
4. [**voicevox**](#4-voicevox)
5. [**nodejs**](#5-nodejs)
6. [**Snyivot**](#6-Snyivot)

## 1. Termux
androidとストレージの共有
```
termux-setup-storage
termux-wake-lock
```
アップデートとインストール
```
pkg update
pkg install git proot wget vim pulseaudio -y
```
起動設定
```
echo "pulseaudio --start --exit-idle-time=-1" >> .bashrc && echo "pacmd load-module module-native-protocol-tcp auth-ip-acl=127.0.0.2 auth-anonymous=1" >> .bashrc && echo "bash ./ubuntu-in-termux/startubuntu.sh" >> .bashrc
```
ubuntuのインストールと設定
```
git clone https://github.com/MFDGaming/ubuntu-in-termux.git
cd ./ubuntu-in-termux
bash ./ubuntu.sh
bash ./startubuntu.sh
```

## 2. ubuntu
アップデートとインストール
```
apt update && apt install vim sox sudo pulseaudio wget git cmake curl python3-pip p7zip-full build-essential libbz2-dev libdb-dev libreadline-dev libffi-dev libgdbm-dev liblzma-dev libncursesw5-dev libsqlite3-dev libssl-dev zlib1g-dev uuid-dev tk-dev vlc -y
```
ホスト設定
```
sh -c 'echo 127.0.0.1 $(hostname) >> /etc/hosts'
```
ユーザーの追加
```
useradd -D -s /bin/bash
useradd snyiv -m
passwd  snyiv
echo "snyiv ALL=(ALL) ALL">> /etc/sudoers
echo "cd /home/snyiv && su snyiv" >> .bashrc
```
ユーザーの設定
```
su snyiv && cd
echo "export PULSE_SERVER=127.0.0.2 \n alias cvlc='cvlc --play-and-exit'" >> .bashrc
```
termuxの再起動を行う
```
exit
```

## 3. python
[python](https://www.python.org/ftp/python/)のダウンロードとビルド
```
wget https://www.python.org/ftp/python/3.11.1/Python-3.11.1.tar.xz
xz -dc Python-3.11.1.tar.xz | tar xfv -
cd Python-3.11.1
./configure
make -j8
sudo make altinstall
pip update
```

## 4. voicevox
[voicevox_engine](https://github.com/VOICEVOX/voicevox_engine)のクローン
```
cd && git clone https://github.com/VOICEVOX/voicevox_engine
cd voicevox_engine && python3.11 -m pip install -r requirements.txt
```
完全版[voicevox_engine](https://github.com/VOICEVOX/voicevox_engine/releases), [voicevox_core](https://github.com/VOICEVOX/voicevox_core/releases/)の作成

```
cd && wget https://github.com/VOICEVOX/voicevox_engine/releases/download/0.20.0/voicevox_engine-linux-cpu-0.20.0.7z.001
7z x voicevox_engine-linux-cpu-0.20.0.7z.001
cp -r voicevox_engine/voicevox_engine linux-cpu/
cp voicevox_engine/run.py linux-cpu/
sudo rm -r voicevox_engine
mv linux-cpu voicevox
cd voicevox
wget https://github.com/VOICEVOX/voicevox_core/releases/download/0.15.4/download-linux-arm64
chmod +x ./download-linux-arm64 && ./download-linux-arm64
```
voicevox起動スクリプトの作成
```
echo "python3.11 ~/voicevox/run.py --voicelib_dir=~/voicevox/voicevox_core --port 50000" > startvoicevox.sh
```
[kanayomi-dict](https://github.com/WariHima/KanaYomi-dict-GPL2/releases)をダウンロードしてvoicevox/resources/にdefault.csvの名前で配置する

## 5. nodejs
nvmを利用して[nodejs](https://nodejs.org/en/download/package-manager)をインストールする
`nvm install`の前に再起動する
```
cd
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
```

## 6. Snyivot
[Snyivot](https://github.com/Snyiv495/Snyivot.git)をクローンして環境構築を行う
```
git clone https://github.com/Snyiv495/Snyivot.git
cd Snyivot
npm install
```