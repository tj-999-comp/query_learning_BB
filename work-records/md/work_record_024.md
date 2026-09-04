# 作業記録 024: Issue #33 SQLiteスキーマ連動SQL補完
作成日: 2026-09-04

## 背景

Issue #33「SQL構文・テーブル名・カラム名の補完を追加」に対応し、#32で導入したCodeMirror SQLエディタへ、実際に読み込んだSQLiteのスキーマに基づく補完候補を追加した。

## 変更内容

- CodeMirror 5のshow-hint拡張を追加し、SQL入力中または`Ctrl`/`Cmd` + `Space`で候補を表示できるようにした。
- SELECT、FROM、WHERE、JOIN、GROUP BY、ORDER BY、集約関数などのSQLキーワード候補を追加した。
- `sqlite_master`からテーブル・ビューを取得し、各対象へ`PRAGMA table_info`を実行してカラム候補を生成するようにした。
- FROM / JOIN句では、読み込んだSQLiteに存在するテーブル・ビューだけを候補に表示するようにした。
- SQL中のテーブル名とエイリアスを解析し、`alias.column`形式を含む関連カラム候補を表示するようにした。
- 補完候補の確定をTab、候補の終了をEscに割り当て、候補が閉じている場合のTabインデントは既存どおり維持した。
- スキーマはSQLiteデータベースの読み込み完了時に再取得する。固定のテーブル・カラム一覧は持たないため、SQLiteを再生成して公開するたびに候補も更新される。
- アプリREADMEに補完の操作方法、スキーマ取得元、更新方針を記録した。

## 検証

- `node --check Apps/app/app.js`
- `git diff --check`
- `bash Apps/scripts/build-pages.sh`
- Playwrightのレスポンシブスモーク検証（1280px、900px、640px、320px）で、HTTP 200、横方向のはみ出しなし、console errorなし、page errorなし、failed requestなしを確認した。
- PlaywrightでSQL入力中のキーワード候補表示を確認した。
- Playwrightで実SQLite由来の`teams`テーブル候補表示とTab確定を確認した。
- Playwrightで`teams t`のエイリアスに対する` t.team_name_e`カラム候補表示とTab確定を確認した。
- PlaywrightでEscによる候補終了を確認した。
- 候補確定後の画面キャプチャで、SQL文字、行番号、カーソルが表示されることを確認した。

検証証跡:

- `/private/tmp/playwright-browser-verify/2026-09-04T07-51-35-017Z/report.json`
- `/private/tmp/playwright-browser-verify/scenario-2026-09-04T07-54-36-400Z/scenario-report.json`
- `/private/tmp/playwright-browser-verify/scenario-2026-09-04T07-54-36-400Z/issue-33-completion.png`

## 関連ファイル

- [`Apps/app/index.html`](../../Apps/app/index.html)
- [`Apps/app/app.js`](../../Apps/app/app.js)
- [`Apps/app/styles.css`](../../Apps/app/styles.css)
- [`Apps/app/README.md`](../../Apps/app/README.md)
- [#33](https://github.com/tj-999-comp/query_learning_BB/issues/33)

## GitHub Issue状況

取得日時: 2026-09-04 16:55 JST  
取得範囲: `tj-999-comp/query_learning_BB` のPull Requestを除くOpen Issue、最大100件  
取得件数: 3件  
取得方法: `gh issue list --repo tj-999-comp/query_learning_BB --state open --limit 100 --json number,title,state,createdAt,updatedAt,url`  
親子関係確認: `gh api repos/tj-999-comp/query_learning_BB/issues/26/sub_issues`

| 順位 | 優先度 | GitHub Issue | 状態 | 関係・着手条件 |
|---:|---:|---|---|---|
| 1 | v0.5.0 | [#34](https://github.com/tj-999-comp/query_learning_BB/issues/34) [主題一覧ドキュメントをもとに問題を追加できる仕組みを作る](https://github.com/tj-999-comp/query_learning_BB/issues/34) | OPEN | #26の子Issue。#33のスキーマ連動補完と問題データ形式の確認が着手条件。 |
| 2 | v0.4.0 | [#33](https://github.com/tj-999-comp/query_learning_BB/issues/33) [SQL構文・テーブル名・カラム名の補完を追加](https://github.com/tj-999-comp/query_learning_BB/issues/33) | OPEN | #26の子Issue。#32の高機能エディタ導入完了後に着手した。本作業で対応した。 |
| 3 | 次期フェーズ | [#26](https://github.com/tj-999-comp/query_learning_BB/issues/26) [SQL学習体験の改善と問題コンテンツ拡充](https://github.com/tj-999-comp/query_learning_BB/issues/26) | OPEN | 親Issue。子Issueの優先順位と依存関係を管理する。 |

## Git

- 実装コミット: `3d7a809317059f93cd9fcf3692da81d26c489288` (`feat: add schema-aware SQL completion`)
- 作業ブランチ: `codex/issue-33-sql-completion`
