# 作業記録 015: Issue #29 問題一覧ドロワー化

作成日: 2026-09-04

## 背景

Issue #29「問題一覧をハンバーガーメニュー内のドロワーへ移動」に対応し、問題一覧とフィルターをメイン画面から分離して、必要なときだけ開けるドロワーへ移動した。

## 変更内容

- ヘッダー左上にハンバーガーメニューボタンを追加した。
- 問題一覧、進捗フィルター、カテゴリフィルター、学習情報の詳細ボタンをドロワー内へ移動した。
- ドロワーの開閉状態をメニューボタンの`aria-expanded`とドロワーの`aria-hidden`で提供した。
- ドロワーを開いたときは閉じるボタンへフォーカスし、閉じると開く前の要素へフォーカスを戻すようにした。
- Escキー、メニュー外のオーバーレイクリック、閉じるボタンでドロワーを閉じられるようにした。
- 問題カード選択時はドロワーを自動で閉じ、選択中の問題を維持したままSQLエディタへフォーカスを移すようにした。
- ドロワーを閉じた状態では問題画面を1ペインで広く表示するようにした。

## 受入条件の確認

- 左上にハンバーガーメニューボタンを表示: 成功
- 問題一覧、カテゴリフィルター、進捗フィルターをドロワー内に配置: 成功
- `aria-expanded`等で開閉状態を確認: 成功
- Esc、メニュー外クリック、閉じる操作で閉じる: 成功
- メニューを閉じても選択中の問題を維持: 成功
- PCとiPadで操作: 成功
- 閉じた状態で問題画面を広く表示: 成功

## 検証

- `node --check Apps/app/app.js`
- `node --check Apps/public/app.js`
- `python3 -m json.tool Apps/data/problems.json`
- `git diff --check`
- `python3 scripts/dev/validate_work_records.py`
- Playwrightで1280x900、900x900、640x900、320x800を確認。横方向のはみ出し、console error、page error、failed requestはなかった。
- Playwrightで開閉ARIA状態、ドロワー内の一覧・フィルター、問題選択後の自動クローズ、選択状態の維持、Esc、外側クリック、閉じるボタン、フォーカス復帰、768x1024相当幅を確認した。

検証証跡:

- `/private/tmp/playwright-browser-verify/2026-09-04T05-10-36-871Z/report.json`
- `/private/tmp/playwright-browser-verify/scenario-2026-09-04T05-12-22-855Z/scenario-report.json`
- `/private/tmp/playwright-browser-verify/scenario-2026-09-04T05-12-22-855Z/issue29-drawer-ipad.png`

## 関連ファイル

- [`Apps/app/index.html`](../../Apps/app/index.html)
- [`Apps/app/app.js`](../../Apps/app/app.js)
- [`Apps/app/styles.css`](../../Apps/app/styles.css)
- [#29](https://github.com/tj-999-comp/query_learning_BB/issues/29)

## GitHub Issue状況

2026-09-04 14:12:43 JSTに、`tj-999-comp/query_learning_BB`のOpen IssueをPull Requestを除いて取得した（取得件数: 7件）。#26のsub-issues APIを確認し、#27〜#34の8件が返却された。#27・#28はclosed/completed、#29〜#34はopenだった。Open Issue取得時点では全Issueのstate reasonが未設定だった。

| 順位 | 優先度 | GitHub Issue | 状態 | 関係・着手条件 |
|---:|---|---|---|---|
| 1 | 高 | [#29](https://github.com/tj-999-comp/query_learning_BB/issues/29) | OPEN（state reason未設定） | 本作業。問題一覧をドロワーへ移動し、開閉操作を検証した。 |
| 2 | 高 | [#30](https://github.com/tj-999-comp/query_learning_BB/issues/30) | OPEN（state reason未設定） | #29と同一フェーズの画面構造変更として着手する。 |
| 3 | 高 | [#31](https://github.com/tj-999-comp/query_learning_BB/issues/31) | OPEN（state reason未設定） | #30を前提とする。 |
| 4 | 高 | [#32](https://github.com/tj-999-comp/query_learning_BB/issues/32) | OPEN（state reason未設定） | v0.2.0完了後に着手する。 |
| 5 | 中 | [#33](https://github.com/tj-999-comp/query_learning_BB/issues/33) | OPEN（state reason未設定） | #32を前提とする。 |
| 6 | 中 | [#34](https://github.com/tj-999-comp/query_learning_BB/issues/34) | OPEN（state reason未設定） | 主題一覧ドキュメントの所在確定後に着手する。 |
| 7 | 高 | [#26](https://github.com/tj-999-comp/query_learning_BB/issues/26) | OPEN（state reason未設定） | 次期フェーズ全体の管理Issue。#29はsub-issues APIで確認済み。 |
