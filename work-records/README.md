# 作業記録

このディレクトリは、公開リポジトリへ受け渡す作業記録の入力です。

- Markdown: `md/work_record_###.md`
- metadata: `metadata/work_record_###.yml`
- HTMLは `a_rendered` rendererが生成するため、ここには置きません。

番号はプロジェクトごとに独立して採番し、欠番を詰めたり過去の番号を再利用したりしません。

## GitHub Issue状況

作業記録を作成する直前に、Pull Requestを除く `tj-999-comp/query_learning_BB` の全Open IssueをGitHub APIから再取得します。取得日時（JST）、取得範囲、取得件数を記録し、優先順位表のIssue行数を取得件数と一致させます。各Issueの番号、タイトル、URL、state、state reason、作業記録との関係・着手条件を個別に記載します。親子関係はGitHubのsub-issues APIで確認できたものだけを記載し、Issue本文から推測したツリーを作りません。外部リポジトリのIssueは一覧へ混在させず、必要な場合だけ対象と理由を補足します。API取得に失敗した場合は状態を推測せず、未確認範囲と再取得手順を記録します。

取得と親子関係確認の例:

```bash
gh issue list --repo tj-999-comp/query_learning_BB --state open --json number,title,state,stateReason,url --limit 1000
gh api repos/tj-999-comp/query_learning_BB/issues/<番号>/sub_issues
```

取得結果は各作業記録末尾の `## GitHub Issue状況` に、`順位`、`優先度`、`GitHub Issue`、`状態`、`関係・着手条件` の5列で記録します。件数と一覧行数が一致しない場合はcommitしません。

## 共通HTMLデザイン

公開HTMLの正本は、公開リポジトリの [`work-records/design.md`](https://github.com/tj-999-comp/sandbox-pages/blob/main/work-records/design.md) とA側の `a_rendered` renderer/CSSです。生成元ではHTML・CSS・designを管理せず、全生成元で `record-page`、`shell`、`topbar`、`record-header`、`record-meta`、番号付き`record-section`、共通footerを使う同一の詳細ページ形式を利用します。新規・更新時は1280px、900px、640px、320pxで横overflow、console/page error、failed requestがなく、生成元間の主要構造・スタイルが一致することを確認します。不一致が残る場合は公開導入を完了扱いにしません。

## 検証と公開要求

```bash
python3 scripts/dev/validate_work_records.py
```

Pull Requestまたはpush時の `Validate source` 成功を確認し、公開内容を人間が承認してから `publish: true` の固定commitを作成します。`Request publish` workflowには対象basenameだけを入力し、workflowが固定SHA、`project_id`、`publish: true`、命名を検証して公開側へ要求します。Actions Variable `PUBLISH_APP_ID` とSecret `PUBLISH_APP_PRIVATE_KEY` を使い、秘密鍵・tokenをファイル、ログ、metadata、Issue、作業記録へ保存しません。

公開要求の入力例:

```text
target_basename: work_record_001
source_commit_sha: <40桁の固定SHA（workflowがgithub.shaとして送信）>
project_id: query_learning_BB
```
