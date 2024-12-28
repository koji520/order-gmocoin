# order-gmocoin

## 準備

1. [clasp](https://github.com/google/clasp)をインストール
```
npm install -g @google/clasp
```

2. Google Apps Script API を有効にする

https://script.google.com/home/usersettings にアクセスし、Google Apps Script API を有効にする。

3. ログイン
```
clasp login
```

4. クローン
```
clasp clone [scriptId]
```

## ソースコード更新

gas のスクリプトをアップデートする
```
clasp push
```
