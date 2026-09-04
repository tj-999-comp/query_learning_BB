# 作業記録 014: Issue #28 前後の問題への移動

作成日: 2026-09-04

## 背景

Issue #28「次の問題・前の問題への移動を追加」に対応し、問題詳細画面から一覧の表示順に従って問題を切り替えられるようにした。

## 変更内容

- 問題詳細画面に「前の問題」「次の問題」ボタンと表示位置を追加した。
- 問題一覧とナビゲーションで共通のフィルター済み問題配列を使用し、一覧順と移動順を一致させた。
- フィルター適用中は、表示中の問題だけを移動対象にした。
- 先頭では前ボタン、末尾では次ボタンを`disabled`にした。
- 問題移動時は既存の問題選択処理を通し、問題文、SQL入力、実行結果、正誤表示、参考SQLを切り替え・リセットするようにした。
- ボタンをネイティブの`button`要素として実装し、Enterキーによるキーボード操作に対応した。
- 変更元の`Apps/app`から`Apps/public`を再生成した。

## 受入条件の確認

- 「前の問題」「次の問題」ボタンを表示: 成功
- 問題一覧の並び順に従って移動: 成功
- フィルター適用中は表示中の問題だけを対象に移動: 成功
- 先頭・末尾で該当ボタンを無効化: 成功
- 問題文、SQL、実行結果、正誤表示を切り替え: 成功
- キーボード操作: Enterキーで前後移動できることを確認

## 検証

- `node --check Apps/app/app.js`
- `node --check Apps/public/app.js`
- `python3 -m json.tool Apps/data/problems.json`
- `git diff --check`
- `python3 scripts/dev/validate_work_records.py`
- Playwrightで1280x900、900x900、640x900、320x800を確認。横方向のはみ出し、console error、page error、failed requestはなかった。
- Playwrightで先頭・中間・末尾の移動、フィルター中の移動、Enterキー操作、移動時の入力・結果・正誤表示リセットを確認した。

検証証跡:

- `/private/tmp/playwright-browser-verify/2026-09-04T05-01-18-226Z/report.json`
- `/private/tmp/playwright-browser-verify/scenario-2026-09-04T05-02-02-830Z/scenario-report.json`
- `/private/tmp/playwright-browser-verify/scenario-2026-09-04T05-02-02-830Z/issue28-navigation.png`

## 関連ファイル

- [`Apps/app/index.html`](../../Apps/app/index.html)
- [`Apps/app/app.js`](../../Apps/app/app.js)
- [`Apps/app/styles.css`](../../Apps/app/styles.css)
- [#28](https://github.com/tj-999-comp/query_learning_BB/issues/28)

## GitHub Issue状況

2026-09-04 14:02:18 JSTに、`tj-999-comp/query_learning_BB`のOpen IssueをPull Requestを除いて取得した（取得件数: 8件）。#26のsub-issues APIを確認したが、返却は0件だった。取得時点では全Issueのstate reasonが未設定だった。

| 順位 | 優先度 | GitHub Issue | 状態 | 関係・着手条件 |
|---:|---|---|---|---|
| 1 | 高 | [#28](https://github.com/tj-999-comp/query_learning_BB/issues/28) | OPEN（state reason未設定） | 本作業。前後の問題への移動を実装・検証した。 |
| 2 | 高 | [#29](https://github.com/tj-999-comp/query_learning_BB/issues/29) | OPEN（state reason未設定） | 問題一覧のドロワー化。 |
| 3 | 高 | [#30](https://github.com/tj-999-comp/query_learning_BB/issues/30) | OPEN（state reason未設定） | #29と同一フェーズで着手する。 |
| 4 | 高 | [#31](https://github.com/tj-999-comp/query_learning_BB/issues/31) | OPEN（state reason未設定） | #30を前提とする。 |
| 5 | 高 | [#32](https://github.com/tj-999-comp/query_learning_BB/issues/32) | OPEN（state reason未設定） | v0.2.0完了後に着手する。 |
| 6 | 中 | [#33](https://github.com/tj-999-comp/query_learning_BB/issues/33) | OPEN（state reason未設定） | #32を前提とする。 |
| 7 | 中 | [#34](https://github.com/tj-999-comp/query_learning_BB/issues/34) | OPEN（state reason未設定） | 主題一覧ドキュメントの所在確定後に着手する。 |
| 8 | 高 | [#26](https://github.com/tj-999-comp/query_learning_BB/issues/26) | OPEN（state reason未設定） | 次期フェーズ全体の管理Issue。 |
