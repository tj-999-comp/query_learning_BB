# 作業記録 001: 公開側リポジトリへの作業記録連携導入準備
作成日: 2026-09-01

## 背景

このリポジトリでCodexが行った変更履歴などを作業記録として残し、公開リポジトリ `tj-999-comp/sandbox-pages` の受入Actionから共有できるようにする。

## 実施内容

- 導入全体を管理する親Issueと、source registry・生成元Workflow・作業記録・手動E2Eに分けた子Issueを作成した。
- 生成元の `project_id` を `query_learning_BB` として扱う契約を整理した。
- `Request publish` Workflowのproject ID placeholderを実値へ置き換えた。
- Markdownとmetadataを対にした最初の作業記録を追加した。
- 公開側A-03受入で不要となる空ディレクトリplaceholderを削除した。

## 確認結果

- `python3 scripts/dev/validate_work_records.py` は `Validated 1 work record(s).` となった。
- 生成元mainの `Validate source` runは成功した。
- 公開側のA所有受入ロジックを一時fixtureで再現し、`acceptance_files`、`metadata`、`renderer` の各validatorが成功した。`enabled: false` のためapplyは行っていない。
- 公開側source registryのPRとテスト修正を作成し、公開側CIの全109テスト、index、既存77件の作業記録検証が成功した。
- GitHub AppのKeychain診断は `valid_pem`。生成元Actions Variable `PUBLISH_APP_ID` とSecret `PUBLISH_APP_PRIVATE_KEY` は値を表示せず登録済み。

## 未完了

- 公開側registry PRのmerge、実GitHub上でのdisabled dry-run、初期provenance生成、固定SHAによる手動E2E、registryの `enabled: true` 化は未実施。
- PEM秘密鍵・tokenはリポジトリ、作業記録、Issue、ログへ保存していない。

## 関連Issue

- 親: https://github.com/tj-999-comp/query_learning_BB/issues/1
- registry: https://github.com/tj-999-comp/query_learning_BB/issues/2
- Workflow/App: https://github.com/tj-999-comp/query_learning_BB/issues/3
- 作業記録: https://github.com/tj-999-comp/query_learning_BB/issues/4
- dry-run/E2E: https://github.com/tj-999-comp/query_learning_BB/issues/5
