# 作業記録 023: Issue #32 SQLエディタの高機能化と公開反映
作成日: 2026-09-04

## 背景

Issue #32「SQLエディタを高機能エディタへ置き換える」に対応し、textareaをSQL編集向けのエディタへ置き換えた。公開環境でCodeMirrorのCSSがCSPによりブロックされる問題も確認し、認証middlewareを含めて公開時の表示を修正した。

## 変更内容

- CodeMirror 5のSQLモードを導入し、SQL構文ハイライト、行番号、括弧対応を追加した。
- 問題画面が表示された後にエディタを初期化し、非表示要素の誤計測による行番号の重なりを防いだ。
- Tab / Shift + Tabによるインデント操作と、最低限の自動インデントを有効化した。
- MacのCmd + Enter、Windows/LinuxのCtrl + Enterを「実行する」動作へ割り当て、正誤判定とは分離した。
- CodeMirrorが利用できない場合はtextareaへフォールバックし、既存の読み取り専用SQL制限を維持した。
- 入力文字とカーソルが見えるようエディタの高さ、テーマ、トークン色、カーソル表示を調整した。
- `Apps/_headers`と`Apps/functions/_middleware.js`のCSPでCodeMirrorのCDN CSSを許可した。
- 公開URLのレスポンスヘッダーを確認し、Basic認証middlewareがCSPを上書きしていた問題を解消した。

## 検証

- `node --check Apps/app/app.js`
- `node --check Apps/functions/_middleware.js`
- `git diff --check`
- `bash Apps/scripts/build-pages.sh`
- 生成後の`Apps/public`へCodeMirrorのHTML、JavaScript、CSS、CSP設定が反映されることを確認した。
- Playwrightで問題画面を1280px、900px、640px、320pxで確認し、横方向のはみ出し、console error、page error、failed requestがないことを確認した。
- PlaywrightでSQL文字入力、行番号、カーソル表示、Tabインデント、Enter連打時のエディタ高さ固定を確認した。
- PlaywrightでCtrl + Enter / Cmd + EnterのSQL実行、正誤判定との分離、読み取り専用SQL制限を確認した。
- 公開URL `https://query-learning-bb.pages.dev/` のCSPを確認し、修正反映後に`style-src 'self' https://cdnjs.cloudflare.com`となることを確認した。

検証証跡:

- `/private/tmp/playwright-browser-verify/2026-09-04T07-20-16-001Z/report.json`
- `/private/tmp/playwright-browser-verify/scenario-2026-09-04T07-26-36-970Z/scenario-report.json`
- `/private/tmp/playwright-browser-verify/2026-09-04T07-39-40-579Z/scenario-report.json`

## 関連ファイル

- [`Apps/app/index.html`](../../Apps/app/index.html)
- [`Apps/app/app.js`](../../Apps/app/app.js)
- [`Apps/app/styles.css`](../../Apps/app/styles.css)
- [`Apps/_headers`](../../Apps/_headers)
- [`Apps/functions/_middleware.js`](../../Apps/functions/_middleware.js)
- [#32](https://github.com/tj-999-comp/query_learning_BB/issues/32)

## GitHub Issue状況

取得日時: 2026-09-04 16:46 JST  
取得範囲: `tj-999-comp/query_learning_BB` のPull Requestを除くOpen Issue、最大100件  
取得件数: 4件  
取得方法: `gh issue list --repo tj-999-comp/query_learning_BB --state open --limit 100 --json number,title,state,stateReason,url`  
親子関係確認: `gh api repos/tj-999-comp/query_learning_BB/issues/26/sub_issues`

| 順位 | 優先度 | GitHub Issue | 状態 | 関係・着手条件 |
|---:|---:|---|---|---|
| 1 | v0.5.0 | [#34](https://github.com/tj-999-comp/query_learning_BB/issues/34) [主題一覧ドキュメントをもとに問題を追加できる仕組みを作る](https://github.com/tj-999-comp/query_learning_BB/issues/34) | OPEN / state reason未設定 | #26の子Issue。#33のスキーマ情報との整合、問題データ形式の確認が着手条件。 |
| 2 | v0.4.0 | [#33](https://github.com/tj-999-comp/query_learning_BB/issues/33) [SQL構文・テーブル名・カラム名の補完を追加](https://github.com/tj-999-comp/query_learning_BB/issues/33) | OPEN / state reason未設定 | #26の子Issue。高機能エディタ導入（#32）の完了が着手条件。次に着手するIssue。 |
| 3 | v0.3.0 | [#32](https://github.com/tj-999-comp/query_learning_BB/issues/32) [SQLエディタを高機能エディタへ置き換える](https://github.com/tj-999-comp/query_learning_BB/issues/32) | OPEN / state reason未設定（取得時点） | #26の子Issue。v0.2.0の最終レイアウトを前提とし、本作業で対応した。 |
| 4 | 次期フェーズ | [#26](https://github.com/tj-999-comp/query_learning_BB/issues/26) [SQL学習体験の改善と問題コンテンツ拡充](https://github.com/tj-999-comp/query_learning_BB/issues/26) | OPEN / state reason未設定 | 親Issue。子Issueの優先順位と依存関係を管理する。 |
