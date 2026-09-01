# Work Record Source Template

作業記録を生成・管理するリポジトリ用のテンプレートです。

このリポジトリは、公開サイト `tj-999-comp/sandbox-pages` の生成元として使うことを想定しています。新しいプロジェクトはGitHubの「Use this template」から作成してください。

## 最初に変更するもの

1. このREADMEのプロジェクト名と説明
2. `work-records/metadata/` の `project_id`
3. 必要なら `app/` などにプロジェクト本体
4. `request-publish.yml` の `PROJECT_ID`

`project_id`、公開先ディレクトリ、容量制限、受入可否の正本は公開リポジトリ側のsource registryです。生成元側で公開先パスを自由に指定しないでください。

## ディレクトリ

```text
work-records/
├── md/                    # work_record_###.md
└── metadata/              # work_record_###.yml
```

`a_rendered`方式では、HTML・共通CSS・project indexは生成元で管理しません。公開時に公開リポジトリ側のrendererがMarkdownとmetadataから生成します。

## 作業記録の追加

Markdownとmetadataは同じベース名で作成します。

```text
work-records/md/work_record_001.md
work-records/metadata/work_record_001.yml
```

Markdownの先頭は次の形式にします。

```md
# 作業記録 001: 内容
作成日: 2026-09-01
```

metadataの最小形式は次のとおりです。

```yaml
schema_version: 1
title: '内容'
date: "2026-09-01"
project_id: my_project
tags: []
publish: true
```

番号はプロジェクトごとに `001` から始め、いったん使用した番号は再利用しません。

## 検証と公開

Pull Requestまたはpush時に、`validate.yml` が命名、Markdown、metadataの対応を確認します。

公開要求は、内容をcommitした後にActionsの `Request publish` workflowを手動実行します。入力には対象recordのbasenameだけを指定し、workflowは固定commit SHAとともに公開リポジトリの受入workflowを起動します。

公開前に、公開リポジトリ側でsource registry登録、disabled dry-run、固定commitによる手動E2Eを完了させてください。Actions Variableに `PUBLISH_APP_ID`、Actions Secretに `PUBLISH_APP_PRIVATE_KEY` を登録します。秘密鍵をファイルやmetadataへ保存しないでください。

GitHub Appには、公開リポジトリ `tj-999-comp/sandbox-pages` のActions workflow dispatchに必要な最小権限だけを付与します。`request-publish.yml` はGitHub Appから短期Installation tokenを発行し、`project_id`、固定commit SHA、対象basenameだけを送ります。

## 正本

- Markdownとmetadataの内容: この生成元リポジトリ
- HTML renderer、公開先、受入validator、provenance、index: `sandbox-pages`
- 共通運用: [`docs/PORTFOLIO_STANDARD.md`](https://github.com/tj-999-comp/sandbox-pages/blob/main/docs/PORTFOLIO_STANDARD.md)
- 公開契約: [`projects/README.md`](https://github.com/tj-999-comp/sandbox-pages/blob/main/projects/README.md)
