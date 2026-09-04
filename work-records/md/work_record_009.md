# 作業記録 009: #12 PC・iPad・ブラウザ保存のMVP受入確認

作成日: 2026-09-04

## 背景

Issue #12「PC・iPad・ブラウザ保存のMVP受入確認を行う」に対応し、#13までに確定した問題・SQLite・判定仕様を使って、主要な学習フロー、保存、キーボード操作、レスポンシブ表示を確認した。

## 実施内容

- ローカルHTTP環境のChromiumで、SQLite準備完了、問題一覧表示、問題選択、カテゴリ絞り込みを確認した。
- Q01でお気に入り登録、SQL実行、誤答表示、正解判定、参考SQL・解説表示を確認した。
- 誤答時に正解数が増えず、SQLを修正して再挑戦できることを確認した。
- 正解後に達成状況・正解数が更新され、ページ再読み込み後も達成状況とお気に入りが復元されることを確認した。
- 「お気に入り」フィルターと学習情報モーダルを確認した。
- 学習情報モーダルをキーボードのEnterで開き、閉じるボタンへフォーカスが移動し、Escapeで閉じた後に元のボタンへフォーカスが戻ることを確認した。
- 768x1024（iPad相当幅）および320x800で主要画面を確認し、横方向のはみ出しがないことを確認した。結果テーブルの横スクロール用領域も維持される構造である。
- localStorageの`getItem`・`setItem`が利用できない状態を再現し、ページエラーや失敗リクエストが発生しないことを確認した。保存不可の警告を学習情報に表示し、正解時にも保存不可を明示するよう実装した。

## 修正内容

localStorageへの保存で例外が発生した場合に、学習操作全体が失敗しないようにした。保存できない場合も現在のページ内ではメモリ上の進捗・お気に入りを維持し、ページを閉じると失われることを表示する。

変更ファイル:

- `Apps/app/app.js`
- `Apps/app/index.html`
- `Apps/app/styles.css`

## 検証結果

Playwrightのシナリオ検証結果は次のとおり。通常フローとlocalStorage無効化フローのいずれも、console error、page error、failed requestは0件だった。

| 検証 | 結果 |
|---|---|
| SQLite読み込み・問題一覧 | 成功 |
| 問題・カテゴリフィルター | 成功 |
| お気に入り登録と再読み込み後の復元 | 成功 |
| 誤答・再挑戦・正解・達成状況更新 | 成功 |
| 学習情報モーダル・キーボードフォーカス | 成功 |
| 768x1024および320x800の横overflow | 成功 |
| localStorage利用不可時の継続・警告表示 | 成功 |

## 判定

対応環境の記載、PC相当のブラウザでの主要シナリオ、iPad相当幅での表示、localStorageによる進捗・お気に入り保存、誤答後の再挑戦、キーボード操作を確認し、Issue #12の受入条件を満たした。

検証環境はPlaywright付属Chromium、通常幅1280x900、iPad相当幅768x1024、狭幅320x800。Firefoxの実ブラウザ検証はこの検証環境には含めず、要件書に記載した対応ブラウザの範囲を確認対象とした。実機iPadでの主要表示・SQL実行確認は、先行作業記録#004の確認結果も参照する。

Issue #12へ受入確認結果をコメントし、2026-09-04にクローズした。

## 検証コマンド・証跡

- `/Users/ryosuketajima/.codex/skills/playwright-browser-verify/scripts/verify-page.sh --url http://127.0.0.1:8000/Apps/app/`
- `/Users/ryosuketajima/.codex/skills/playwright-browser-verify/scripts/run-scenario.sh /private/tmp/query-learning-issue12.mjs`
- `/Users/ryosuketajima/.codex/skills/playwright-browser-verify/scripts/run-scenario.sh /private/tmp/query-learning-issue12-storage-blocked.mjs`
- `node --check Apps/app/app.js`
- `python3 -m json.tool Apps/data/problems.json`
- `git diff --check`
- `python3 scripts/dev/validate_work_records.py`

レスポンシブ検証のreportとスクリーンショットは、リポジトリ外の`/private/tmp/playwright-browser-verify/`に保存した。

## 関連ファイル・Issue

- [`Apps/docs/MVP_REQUIREMENTS.md`](../../Apps/docs/MVP_REQUIREMENTS.md)
- [`Apps/app/app.js`](../../Apps/app/app.js)
- [`Apps/app/index.html`](../../Apps/app/index.html)
- [`Apps/app/styles.css`](../../Apps/app/styles.css)
- [`Apps/docs/HOSTING_CLOUDFLARE.md`](../../Apps/docs/HOSTING_CLOUDFLARE.md)
- [#4 ホスティング先とBasic認証方式の決定・受入確認](./work_record_004.md)

## GitHub Issue状況

2026-09-04 12:40:32 JST に `tj-999-comp/query_learning_BB` のOpen IssueをPull Requestを除いて取得した（取得件数: 3件）。Issue #8のsub-issues APIを確認したが、返却は0件だった。取得時点では全Issueのstate reasonが未設定だった。#12は本作業でクローズ済みである。

| 順位 | 優先度 | GitHub Issue | 状態 | 関係・着手条件 |
|---:|---|---|---|---|
| 1 | 中 | [#11](https://github.com/tj-999-comp/query_learning_BB/issues/11) | OPEN（state reason未設定） | #6のホスティング方針と、#10・#13で確定したデータ・問題を前提に公開・スモークテストする。 |
| 2 | 高 | [#8](https://github.com/tj-999-comp/query_learning_BB/issues/8) | OPEN（state reason未設定） | #11の完了後にMVP全体を完了判定する。GitHub上のsub-issuesは未登録。 |
| 3 | 中 | [#12](https://github.com/tj-999-comp/query_learning_BB/issues/12) | CLOSED | 本作業。PC・iPad相当幅・保存・主要操作の受入確認が完了した。 |
