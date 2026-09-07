# v2.0.0 Issue #69 回帰確認

確認日: 2026-09-07

## 対象

- 生成済み問題ページ: `/problems/mvp-001/`
- 生成ページ数: 100
- 確認環境: Playwright bundled Chromium、ローカル静的HTTPサーバー
- 確認ビューポート: 1280x900、900x900、640x900、320x800

## 確認結果

| 確認項目 | 結果 |
|---|---|
| 問題URLへの直接アクセス | 成功。`mvp-001`の問題ページが表示された |
| 問題IDの解決 | 成功。`data-problem-id="mvp-001"`と問題タイトルが一致した |
| SQLite読み込み | 成功。画面に「SQLite準備完了」と表示された |
| SQL実行 | 成功。`SELECT 1`の1行1列の結果が表示された |
| 正誤判定 | 成功。`mvp-001`の正解SQLで「正解！」が表示された |
| お気に入り | 成功。登録後に`aria-pressed="true"`となり、リロード後も維持された |
| 達成状況 | 成功。正解後の達成状態がリロード後も維持された |
| 問題一覧ドロワー | 成功。問題ページから開閉でき、問題カードが表示された |
| 前後の問題移動 | 成功。同一カテゴリの次問題URLへ遷移した |
| ホーム復帰 | 成功。問題ページのホームリンクから`/`へ戻れた |
| SQL補完 | 成功。入力時にCodeMirrorの候補リストが表示された |
| 横方向の意図しないoverflow | 成功。1280、900、640、320pxで検出されなかった |

## 実行した検証

- `node --check Apps/app/app.js`
- `python3 -B -c 'import ast, pathlib; ast.parse(...)'`
- `bash Apps/scripts/build-pages.sh`
- 問題ページ生成数が100件であることを確認
- Playwrightのレスポンシブスモーク確認
- Playwrightの問題ページ直接アクセス・SQLite・遷移・学習状態確認
- `git diff --check`

## ローカル検証環境の制約

- Pythonの静的HTTPサーバーは`/api/progress`を実装していないため、進捗同期のPUTが501になる。アプリはこの失敗を検知してlocalStorageへフォールバックするため、ローカル回帰確認では想定内とした。
- faviconを配置していないため、ブラウザがfaviconの404を記録する。アプリ本体のリクエスト失敗・ページエラーは発生していない。
- Cloudflare Pages本番環境でのBasic認証、`/api/progress`、直接アクセス、リロードの確認はIssue #70で行う。

## 関連Issue

- 親Issue：[Issue #65](https://github.com/tj-999-comp/query_learning_BB/issues/65)
- 本Issue：[Issue #69](https://github.com/tj-999-comp/query_learning_BB/issues/69)
- 公開環境受入：[Issue #70](https://github.com/tj-999-comp/query_learning_BB/issues/70)
