# 作業記録 044: Issue #109 v2.1.0問題ページ遷移ローディングの本番反映

作成日: 2026-09-18

- 対象リポジトリ: `tj-999-comp/query_learning_BB`
- 対象Issue: [#109](https://github.com/tj-999-comp/query_learning_BB/issues/109)

## 背景

トップページの問題カードから問題ページへ遷移する際、遷移先の初期HTMLがホーム画面用のDOMを表示していた。そのため、JavaScriptが問題データとSQLiteを読み込むまでの間、トップページが一瞬表示される状態だった。

Issue #109では、問題への遷移中にローディング表示を挟むための5案をデザインレビューし、04「問題画面スケルトン」を採用した。

## 完了内容

1. デザインレビューに問題ページ遷移用のローディング案を5案追加した。
   - 全面オーバーレイ
   - トップライン
   - 遷移カード
   - 問題画面スケルトン
   - ヘッダーステータス
2. 04「問題画面スケルトン」を実装した。
   - 通常クリック時にクリックした問題の番号とタイトルを表示
   - Cmd/Ctrl/Shift/Altクリックや中クリックは通常のリンク動作を維持
   - ローディング表示時間を約500msに調整
3. 遷移先の初期表示を修正した。
   - 問題ページ生成時からローディングスケルトンを表示
   - ホーム用`empty-state`を問題ページ生成時から非表示
   - 問題データとSQLiteの準備完了後にスケルトンを閉じ、問題画面を表示
4. ローディング画面のレイアウトを問題ページに合わせた。
   - ヘッダー、メニュー、ブランド、ステータス表示
   - 問題タイトル、メタ情報、お気に入り位置
   - 問題文、必要カラム、問題間ナビゲーション
   - SQLエディタと実行結果の2ペイン

## 検証

- `bash Apps/scripts/build-pages.sh`
  - ホームページと問題ページ100件を生成
  - SQLiteをPages向け2チャンクへ分割
- `git diff --check`
- Playwright操作検証
  - デスクトップ幅とモバイル幅で、トップページが表示されず初期描画からスケルトンになることを確認
  - スケルトン表示後に問題ページへ切り替わることを確認
  - ホーム用`empty-state`が初期状態で`display: none`になることを確認
  - コンソールエラー、ページエラー、失敗リクエストなし
- STG実画面検証
  - [STG](https://stg.query-learning-bb.pages.dev/)
  - 認証付きブラウザでモバイル幅・デスクトップ幅を確認
  - SQLite準備完了、問題ページ表示、問題遷移ローディングを確認
- Productionスモークテスト
  - [Production](https://query-learning-bb.pages.dev/)
  - Basic認証後にSQLite準備完了とQ.01問題ページ表示を確認
  - `SELECT team_id, team_name_j FROM teams ORDER BY team_name_j;`を実行し、結果テーブル表示を確認
  - コンソールエラーなし

## STG・本番反映

- デザインレビュー反映PR: [#111](https://github.com/tj-999-comp/query_learning_BB/pull/111)
- 初回実装PR: [#112](https://github.com/tj-999-comp/query_learning_BB/pull/112)
- 500ms調整PR: [#113](https://github.com/tj-999-comp/query_learning_BB/pull/113)
- 初期表示修正PR: [#114](https://github.com/tj-999-comp/query_learning_BB/pull/114)
- レイアウト調整PR: [#115](https://github.com/tj-999-comp/query_learning_BB/pull/115)
- ホーム領域初期非表示PR: [#116](https://github.com/tj-999-comp/query_learning_BB/pull/116)
- Production昇格PR: [#117](https://github.com/tj-999-comp/query_learning_BB/pull/117)
- Productionマージコミット: `c2be6e4b617ee850982abee83283f94d9389e081`
- Cloudflare Pages Production deployment: `62b724bf-3735-4196-9957-649728f95a09`
- Issue #109へ完了結果をコメントし、2026-09-18にcompletedとしてクローズした。

## GitHub Issue状況

2026-09-18 10:44:02 JST時点で、Pull Requestを除くオープンIssueは5件だった。GitHub APIの取得範囲は`--state open --limit 1000`、取得件数は5件であり、以下の一覧件数と一致している。各Issueのsub-issues APIを確認し、いずれも返却は0件だった。優先度ラベルがないIssueは「未設定」と記載した。Issue #109は本一覧取得前にクローズ済みである。

| 順位 | 優先度 | GitHub Issue | 状態 | 関係・着手条件 |
| --- | --- | --- | --- | --- |
| 1 | 未設定 | [#102 SQLite準備ステータスの色分け](https://github.com/tj-999-comp/query_learning_BB/issues/102) | OPEN（state reason未設定） | 本作業の対象外。別途対応する。 |
| 2 | 未設定 | [#100 [v2.0.5] SQL補完でテーブル別名を保持してカラムを確定する](https://github.com/tj-999-comp/query_learning_BB/issues/100) | OPEN（state reason未設定） | 本作業の対象外。SQL補完改善として別途扱う。 |
| 3 | 未設定 | [#97 [v2.0.4] Q.66〜Q.68の問題文と使用テーブルを整合する](https://github.com/tj-999-comp/query_learning_BB/issues/97) | OPEN（state reason未設定） | 本作業の対象外。問題仕様改善として別途扱う。 |
| 4 | 未設定 | [#96 [v2.0.3] 問題文に指定のない並び順をSQL基準から除外する](https://github.com/tj-999-comp/query_learning_BB/issues/96) | OPEN（state reason未設定） | 本作業の対象外。判定基準改善として別途扱う。 |
| 5 | 未設定 | [#95 [v2.0.2] 問題文に指定のない並び順を正解判定から除外する](https://github.com/tj-999-comp/query_learning_BB/issues/95) | OPEN（state reason未設定） | 本作業の対象外。判定基準改善として別途扱う。 |

作業記録作成時点で、対象Issue #109は本番反映と受入確認が完了したためクローズ済みである。残る5件は本作業の対象外であり、状態を変更していない。

## 関連Issue・PR

- [Issue #109](https://github.com/tj-999-comp/query_learning_BB/issues/109)
- [Issue #109完了結果コメント](https://github.com/tj-999-comp/query_learning_BB/issues/109#issuecomment-5723768166)
- [Production昇格PR #117](https://github.com/tj-999-comp/query_learning_BB/pull/117)
