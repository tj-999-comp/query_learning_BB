# 作業記録 029: Issue #52 v1.1.1問題仕様と必要カラム表示の本番反映

作成日: 2026-09-06

## 背景

問題文の要求列と解答例・正誤判定の期待列が一致しない問題があり、Q18では問題文が求める「選手名と国籍」に対して`player_id`が解答例と判定結果へ混入していた。あわせて、問題文だけでは回答に必要なカラムが把握しづらかったため、v1.1.1として問題定義と画面表示を整理した。

## 完了内容

- `answerSql`、`judgeSql`、`resultSpec`、`learningObjectives`を導入し、解答例・判定仕様・学習目標を分離した。
- 問題生成時に、解答例と判定SQLの実行結果、期待列、利用テーブルを検証するようにした。
- Q18の解答例では`player_id`を表示せず、判定SQLでは同名時の並び順用にのみ使用した。
- 問題文の直下に、`requiredColumns`で定義した必要カラムを小さく表示するようにした。
- Q18では「選手名（players.player_name_j）」「国籍（players.league_registered_nationality）」を表示し、既存100問にも表示用データを生成した。
- 問題作成手順と判定仕様のドキュメントを更新した。

## 検証

- `python3 Apps/scripts/generate_problems.py`で100問をSQLiteに対して検証した。
- `node --check Apps/app/app.js`を通過した。
- Pages用ビルドを実行した。
- PlaywrightでQ18の2列SQLが正解になること、解答例に`player_id`のSELECT表示がないことを確認した。
- 問題文直下の必要カラム表示を確認した。
- 320px幅で横方向のオーバーフローがないことを確認した。
- 本番URLのBasic認証401応答を確認した。

## 関連ファイル

- [`Apps/data/problem-topics.json`](../../Apps/data/problem-topics.json)
- [`Apps/data/problems.json`](../../Apps/data/problems.json)
- [`Apps/scripts/generate_problems.py`](../../Apps/scripts/generate_problems.py)
- [`Apps/app/app.js`](../../Apps/app/app.js)
- [`Apps/app/index.html`](../../Apps/app/index.html)
- [`Apps/app/styles.css`](../../Apps/app/styles.css)
- [`Apps/docs/PROBLEM_AUTHORING.md`](../../Apps/docs/PROBLEM_AUTHORING.md)
- [#52](https://github.com/tj-999-comp/query_learning_BB/issues/52)

## GitHub

- 実装Commit: `db3c155`, `7f76409`
- 本番反映Commit: `7f76409`
- Production: https://query-learning-bb.pages.dev/
- 本記録のPRでIssue #52をクローズする。
