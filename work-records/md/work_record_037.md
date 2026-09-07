# 作業記録 037: Issue #65 v2.0.0のSTG反映と本番承認ルールの確定
作成日: 2026-09-07

## 背景

v2.0.0の問題別ページ化をmainへ反映済みだったが、STG環境はv1.2.1のままだった。公開手順を整理し、STGで確認した後にユーザーの明示的なOKを受けてから本番へ反映する運用ルールを確定したうえで、v2.0.0をSTGへ反映した。

## 完了内容

- mainのv2.0.0をSTGへ反映するPR [#79](https://github.com/tj-999-comp/query_learning_BB/pull/79)を作成し、`stg`へマージした。
- STGコミット`3b2fd35`で、ホームと問題別ページに`v2.0.0`が表示されることを確認した。
- STGで問題別URL `/problems/mvp-001/` がHTTP 200、不正な問題URLがHTTP 404になることを確認した。
- 本番反映の手順を [`Apps/docs/HOSTING_CLOUDFLARE.md`](https://github.com/tj-999-comp/query_learning_BB/blob/main/Apps/docs/HOSTING_CLOUDFLARE.md) に追加した。
- READMEにも、STG確認とユーザーの明示的なOKを本番反映の必須条件とすることを追記した。
- 公開ルール変更PR [#78](https://github.com/tj-999-comp/query_learning_BB/pull/78)をマージした。
- Issue #65と子Issue #66〜#70の完了状態を確認した。作業記録作成時点でOpen Issueは0件だった。

## 本番反映ルール

今後のリリースは、次の順序で進める。

1. 実装用ブランチから`stg`へ反映するPRを作成する。
2. `stg`へのマージ後、STG Preview deploymentを確認する。
3. STG URLで主要フローと必要な回帰確認を行う。
4. 確認結果、対象コミット、STG URLを記録する。
5. ユーザーから「本番反映してよい」という明示的なOKを受ける。
6. 明示承認後に、承認済みの同一コミットを`main`へ反映する。
7. Production deploymentと本番スモークテスト結果を記録する。

CI成功、STG deploymentのActive、Issueクローズ、作業者自身の受入判断だけでは本番承認とみなさない。明示承認がない場合はSTG確認で停止する。

## 確認結果

- STG URL: `https://stg.query-learning-bb.pages.dev/`
- ホーム: HTTP 200、`v2.0.0`
- 問題別URL: HTTP 200、`data-problem-id="mvp-001"`
- 不正な問題URL: HTTP 404、404画面を表示
- Basic認証情報は読み取り確認の実行中だけ使用し、リポジトリ・ファイル・作業記録へ保存していない。
- 今回のSTG反映操作では、アプリ本体を本番へ追加反映していない。既存の本番v2.0.0は維持した。

## GitHub Issue状況

作業記録作成直前の2026-09-07 18:11:27 JSTに、Pull Requestを除く `tj-999-comp/query_learning_BB` のOpen Issue一覧をGitHub APIから取得した。取得範囲は`--state open --limit 1000`、取得件数は0件である。該当するIssue行はない。

## 関連PR・ファイル

- [#78 公開ルール変更](https://github.com/tj-999-comp/query_learning_BB/pull/78)
- [#79 v2.0.0のSTG反映](https://github.com/tj-999-comp/query_learning_BB/pull/79)
- [`Apps/docs/HOSTING_CLOUDFLARE.md`](https://github.com/tj-999-comp/query_learning_BB/blob/main/Apps/docs/HOSTING_CLOUDFLARE.md)
- [`README.md`](https://github.com/tj-999-comp/query_learning_BB/blob/main/README.md)

## 検証

- `python3 scripts/dev/validate_work_records.py`
- `git diff --check`
- STGへの認証付きHTTP確認
