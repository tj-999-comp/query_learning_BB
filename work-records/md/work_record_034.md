# 作業記録 034: 作業記録の全件自動連携とSlack通知制御の設定
作成日: 2026-09-06

## 背景

作業記録を生成元リポジトリから公開リポジトリへ連携する仕組みが、個別の手動要求に依存しており、全件のHTML生成とSlack通知の条件が明確になっていなかった。生成元の作業記録を全件公開対象に揃え、通常運用では`main`への反映を起点に公開側のHTML生成とSlack通知まで自動化した。

## 完了内容

- 既存の作業記録33件のmetadataをすべて`publish: true`に統一した。
- 生成元の`Request publish` workflowを、`main`への作業記録md/metadataのpushで起動するように変更した。
- 同一pushで変更された複数の作業記録を番号ごとに重複なく検出し、公開側へ順番に連携するようにした。
- 連携前に、固定コミットSHA、md/metadataの存在、命名、`publish: true`を検証するようにした。
- 公開側の`accept-source` workflowに`notify`入力を追加し、通常はSlack通知を有効、今回の一括公開だけは無効にした。
- 今回の一括公開で、公開側に`work_record_001.html`〜`work_record_033.html`を生成した。
- 今回の一括公開では、生成元の修正コミットを含めてSlack通知が発生していないことを確認した。

## 運用仕様

- `work-records/md/work_record_###.md`または`work-records/metadata/work_record_###.yml`を`main`へpushすると、変更された作業記録が自動検出される。
- 自動検出された作業記録は、公開側で受け入れ検証、Markdown配置、HTML生成、GitHub Pagesデプロイの順に処理される。
- 公開処理が成功した場合、通常の`main` pushではSlack通知が送信される。
- 手動実行時は`notify`入力で通知を制御できる。今回の一括公開では`notify=false`を指定した。
- metadataの`publish`が`true`以外の場合は、生成元のvalidatorで公開要求を失敗させる。

## 検証

- `/usr/bin/python3 scripts/dev/validate_work_records.py`：`Validated 33 work record(s).`
- `git diff --check`を実行した。
- 公開側のテスト：109件成功。
- 公開側の受け入れ検証、適用、HTML生成、GitHub Pagesデプロイが成功した。
- 公開側のディレクトリにHTML33件、`index.html`、`md`ディレクトリが存在することを確認した。
- Pagesの一覧から作業記録HTMLへのリンク数が33件であることを確認した。
- 今回の再実行で`Notify Slack after successful publish`が`skipped`であることを確認した。

## 関連ファイル

- [`.github/workflows/request-publish.yml`](https://github.com/tj-999-comp/query_learning_BB/blob/main/.github/workflows/request-publish.yml)
- [`work-records/README.md`](https://github.com/tj-999-comp/query_learning_BB/blob/main/work-records/README.md)
- [`sandbox-pagesのaccept-source.yml`](https://github.com/tj-999-comp/sandbox-pages/blob/main/.github/workflows/accept-source.yml)
- [`sandbox-pagesのquery_learning_BB公開ページ`](https://tj-999-comp.github.io/sandbox-pages/projects/query_learning_BB/)

## GitHub Issue状況

作業記録作成直前の2026-09-06 19:57:34 JSTに、Pull Requestを除く `tj-999-comp/query_learning_BB` のOpen IssueをGitHub APIから取得した。取得範囲は`--state open --limit 1000`、取得件数は0件である。したがって、優先順位表に記載するIssueはない。外部リポジトリのIssueは一覧へ含めていない。

| 順位 | 優先度 | GitHub Issue | 状態 | 関係・着手条件 |
|---:|---|---|---|---|
| - | - | なし | Open Issueなし | 本作業に紐づく未完了Issueなし。 |

## GitHub

- 生成元の全件公開設定コミット：`3eee74e`
- 自動連携workflowコミット：`4ae96dc`
- 今回の末尾空行修正コミット：`3e31613`
- 公開側の通知制御設定コミット：`79aece8`
- 公開URL：https://tj-999-comp.github.io/sandbox-pages/projects/query_learning_BB/
- 今回の一括公開：Slack通知なし
