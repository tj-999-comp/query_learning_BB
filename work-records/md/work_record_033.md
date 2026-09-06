# 作業記録 033: Issue #58 v1.1.2 達成済みマークの枠調整と本番反映
作成日: 2026-09-06

## 背景

Issue #58「[v1.1.2] 達成済みマークのドロップシャドウとチェック枠を調整する」について、達成済みマークの見やすさを見直した。レビュー画面で枠色と囲い方を確認し、最終的にシアンの外枠を採用してSTGと本番へ反映した。

## 完了内容

- 達成済みマークからイエローのドロップシャドウを削除した。
- 黄色のチェックを二重レイヤーで描画し、黄色のチェック線を太くした。
- 黄色のチェックの外側にシアンの枠を重ね、レビュー表示では12px、本体の通常表示でも12pxの太さに揃えた。
- 問題一覧内のコンパクトな達成済みマークは、表示領域に合わせてシアン6px・黄色1.5pxへ調整した。
- レビューページの提案No.07としてシアン枠の採用案を先頭に掲載した。
- 過去の提案No.01〜06を閉じたトグル内へまとめ、タイトルと説明文を簡潔化した。
- Issue #58へ受入結果をコメントし、2026-09-06にcompletedとしてクローズした。

## 検証

- `bash Apps/scripts/build-pages.sh`
- `node --check Apps/app/app.js`
- `git diff --check`
- Playwrightでレビューページを1280px、900px、640px、320pxで確認した。
- 各表示幅で横overflow、console error、page error、failed requestがないことを確認した。
- STGデプロイがActiveであることを確認した：`21a50338-c833-4c1b-825d-f1312ab4de9c`（`https://stg.query-learning-bb.pages.dev/`）。
- 本番デプロイがActiveであることを確認した：`85941d41-7898-489c-85bd-74ecb394d42d`（`https://query-learning-bb.pages.dev/`）。

## 関連ファイル

- [`Apps/app/styles.css`](../../Apps/app/styles.css)
- [`Apps/app/index.html`](../../Apps/app/index.html)
- [`Apps/app/design-review.html`](../../Apps/app/design-review.html)
- [`Apps/app/design-review.css`](../../Apps/app/design-review.css)
- [`Apps/scripts/build-pages.sh`](../../Apps/scripts/build-pages.sh)
- [Issue #58](https://github.com/tj-999-comp/query_learning_BB/issues/58)

## GitHub Issue状況

作業記録作成直前の2026-09-06 16:05:01 JSTに、Pull Requestを除く `tj-999-comp/query_learning_BB` のOpen IssueをGitHub APIから取得した。取得範囲は`--state open --limit 1000`、取得件数は1件である。Issue #58はこの取得前に本作業でクローズしたため一覧には含めていない。優先度ラベルがないIssueは「未設定」と記載した。

| 順位 | 優先度 | GitHub Issue | 状態 | 関係・着手条件 |
|---:|---|---|---|---|
| 1 | 未設定 | [#60 [v1.2.0] ホーム画面の問題導線と表示フィルターを改善する](https://github.com/tj-999-comp/query_learning_BB/issues/60) | `OPEN`（state reason: 未設定） | Issue #58とは独立した次期改善Issue。v1.2.0のホーム画面改善を着手する際の対象とする。 |

## GitHub

- STG反映コミット：`ab5a5f9`
- 本番反映コミット：`ec6a57e`
- 本番URL：https://query-learning-bb.pages.dev/
- 本番レビューページ：https://query-learning-bb.pages.dev/design-review
- Issue #58：クローズ済み（[受入結果コメント](https://github.com/tj-999-comp/query_learning_BB/issues/58#issuecomment-5557628271)）
- 本記録のPRで作業記録を`main`へマージする。
