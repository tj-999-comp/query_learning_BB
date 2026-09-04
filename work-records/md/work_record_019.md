# 作業記録 019: Issue #41 問題画面の情報配置と操作性改善
作成日: 2026-09-04

## 背景

Issue #41「問題画面の情報配置と操作性を改善」に対応し、v0.2.1向けの学習画面を整えた。

## 変更内容

- 問題配列の表示順から`Q01`〜`Q1000`形式の問題番号を生成し、問題ヘッダーと問題一覧へ表示した。
- 問題名の右側へジャンル・難易度・使用テーブルを移動し、右端に星だけのお気に入りボタンを配置した。
- お気に入り状態をメイン画面と問題一覧の達成マーク直下へ星で表示した。ボタンと星には状態を示すARIAラベルとtitleを付与した。
- 前後の問題ボタンをコンパクト化し、問題カウント表示を削除した。
- 詳細モーダルのz-indexをドロワーより上位へ変更した。
- footerへ`version v0.2.1`を表示した。

## 検証

- `node --check Apps/app/app.js`
- `git diff --check`
- `bash Apps/scripts/build-pages.sh`
- `Apps/app`と`Apps/public`の`index.html`、`app.js`、`styles.css`の一致を確認
- Playwrightで`Apps/public`を1280x900、900x900、640x900、320x800でスモーク確認。横方向のはみ出し、console error、page error、failed requestはなかった。
- PlaywrightでQ01を選択し、問題番号、右寄せヘッダー情報、星だけのお気に入りボタン、一覧へのお気に入り反映、詳細モーダルの前面表示、SQL実行・正誤判定、footer version表示を確認した。
- Playwrightで問題選択後の640px / 320px表示を確認し、横方向のはみ出しと主要ヘッダー要素の欠落がないことを確認した。

検証証跡:

- `/private/tmp/playwright-browser-verify/2026-09-04T05-57-35-408Z/report.json`
- `/private/tmp/playwright-browser-verify/scenario-2026-09-04T05-57-35-409Z/scenario-report.json`
- `/private/tmp/playwright-browser-verify/scenario-2026-09-04T05-58-00-864Z/scenario-report.json`

## 関連ファイル

- [`Apps/app/index.html`](../../Apps/app/index.html)
- [`Apps/app/app.js`](../../Apps/app/app.js)
- [`Apps/app/styles.css`](../../Apps/app/styles.css)
- [#41](https://github.com/tj-999-comp/query_learning_BB/issues/41)
