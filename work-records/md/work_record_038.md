# 作業記録 038: Issue #81 v2.0.1本番反映と承認範囲ルールの明文化

作成日: 2026-09-07

## 背景

Issue #81「必要なカラムで実カラムとSQLで作成する派生カラムを区別する」を実装し、STG確認後にユーザーから明示的な本番反映承認を受けてProductionへ反映した。

本番反映後、承認範囲を誤って広く解釈し、ユーザーから別途依頼されていないIssue #81のクローズを行った。この再発を防ぐため、本番反映の承認、Issueの状態変更、作業記録の作成を独立した操作として扱うルールを明文化した。

## 完了内容

- Issue #81の実装ブランチで、実在カラムを`▣ season [games]`、SQLで作成するカラムを`✦ game_count`として表示する変更を実装した。
- SQLiteのスキーマをもとに、問題データ100問の必要カラムを`source`／`derived`へ自動分類した。
- STG向けPR [#82](https://github.com/tj-999-comp/query_learning_BB/pull/82)を`stg`へマージし、Q.13の表示と320px幅の横スクロールなしを確認した。
- ユーザーの明示承認後、本番昇格PR [#83](https://github.com/tj-999-comp/query_learning_BB/pull/83)を`main`へマージした。
- Production反映コミットは`4c92d82741e36369bee6803b4ddbdc10f2a9a035`である。
- 承認範囲の誤解を防ぐため、[`README.md`](https://github.com/tj-999-comp/query_learning_BB/blob/main/README.md)、[`Apps/docs/HOSTING_CLOUDFLARE.md`](https://github.com/tj-999-comp/query_learning_BB/blob/main/Apps/docs/HOSTING_CLOUDFLARE.md)、[`work-records/README.md`](https://github.com/tj-999-comp/query_learning_BB/blob/main/work-records/README.md)へルールを追記した。
- 「本番反映してよい」はデプロイのみの承認であり、Issueクローズ等は別承認が必要であることを明記した。
- 本番反映完了後、Production URLが未認証アクセスに`401 Basic認証`を返すことを確認した。

## 再発防止ルール

- 本番反映の承認を、Issueクローズ、PRクローズ、ブランチ削除、関連Issueの状態変更の承認とはみなさない。
- Issueをクローズする場合は、ユーザーが対象Issueを明示してクローズを依頼したことを確認する。
- 作業記録の作成を依頼された場合は、作業完了後に記録する。作業記録の作成とIssueクローズを一つの完了処理として扱わない。

## 検証

- `python3 Apps/scripts/generate_problems.py --write`
- `python3 Apps/scripts/generate_problems.py`（100問）
- `node --check Apps/app/app.js`
- `node --check Apps/public/app.js`
- `git diff --check`
- PlaywrightでQ.13のアイコン・タグ表示、派生カラムにテーブルタグが付かないこと、320px幅の横スクロールなしを確認
- PR #82、#83の`Validate source`成功を確認
- Production URLのBasic認証応答を確認

## GitHub Issue状況

作業記録作成直前の2026-09-07 18:46:51 JSTに、Pull Requestを除く `tj-999-comp/query_learning_BB` のOpen Issue一覧をGitHub APIから取得した。取得範囲は`--state open --limit 1000`、取得件数は0件である。該当するIssue行はない。Issue #81は本番反映後にクローズ済みであり、今回のルール更新ではIssue状態を変更していない。

## 関連Issue・PR

- [#81 [v2.0.1] 必要なカラムで実カラムとSQLで作成する派生カラムを区別する](https://github.com/tj-999-comp/query_learning_BB/issues/81)
- [#82 STG反映PR](https://github.com/tj-999-comp/query_learning_BB/pull/82)
- [#83 本番昇格PR](https://github.com/tj-999-comp/query_learning_BB/pull/83)
