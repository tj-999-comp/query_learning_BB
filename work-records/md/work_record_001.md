# 作業記録 001: 公開側リポジトリへの作業記録連携導入準備
作成日: 2026-09-01

## 背景

このリポジトリでCodexが行った変更履歴などを作業記録として残し、公開リポジトリ `tj-999-comp/sandbox-pages` の受入Actionから共有できるようにする。

## 実施内容

- 導入全体を管理する親Issueと、source registry・生成元Workflow・作業記録・手動E2Eに分けた子Issueを作成した。
- 生成元の `project_id` を `query_learning_BB` として扱う契約を整理した。
- `Request publish` Workflowのproject ID placeholderを実値へ置き換えた。
- Markdownとmetadataを対にした最初の作業記録を追加した。

## 確認結果

- `python3 scripts/dev/validate_work_records.py` を実行し、Markdownとmetadataの対応、番号、日付、metadata必須項目を確認する。
- 公開側source registry登録、GitHub AppのActions Secret/Variable、disabled dry-run、固定SHAによる手動E2Eは後続タスクで実施する。

## 関連Issue

- 親: https://github.com/tj-999-comp/query_learning_BB/issues/1
- registry: https://github.com/tj-999-comp/query_learning_BB/issues/2
- Workflow/App: https://github.com/tj-999-comp/query_learning_BB/issues/3
- 作業記録: https://github.com/tj-999-comp/query_learning_BB/issues/4
- dry-run/E2E: https://github.com/tj-999-comp/query_learning_BB/issues/5
