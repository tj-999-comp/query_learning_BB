# 作業記録 036: Issue #65 v2.0.0親Issueと子Issueの作成
作成日: 2026-09-07

## 背景

現在のSQL学習サイトは、問題一覧・問題詳細・SQL実行・結果表示を1ページ内で切り替える構成になっている。問題ごとにページを分けられる可能性を検討し、v2.0.0としてURL、ビルド、ナビゲーション、公開環境の受入までを計画化することにした。

## 完了内容

- [v2.0.0] 問題別ページ化と学習導線の再構成を管理する親Issue [#65](https://github.com/tj-999-comp/query_learning_BB/issues/65)を作成した。
- 問題ごとの固有URL、直接アクセス、リロード、戻る／進む、ブックマーク、既存の進捗・お気に入り・正解数維持を目的として定義した。
- v2.0.0-alpha、v2.0.0-beta、v2.0.0の予定と、要件・共通基盤・問題ページ化・全問題生成・受入の工程を親Issueに記載した。
- 親Issueの子Issueとして、URL設計から公開環境の受入までを5件に分解した。

## 作成した子Issue

1. [#66 問題ページのURL設計と静的ビルド方式を決める](https://github.com/tj-999-comp/query_learning_BB/issues/66)
2. [#67 問題別ページの共通レイアウトとナビゲーションを実装する](https://github.com/tj-999-comp/query_learning_BB/issues/67)
3. [#68 全問題ページの生成と直接アクセス対応を実装する](https://github.com/tj-999-comp/query_learning_BB/issues/68)
4. [#69 問題ページ化後の進捗・お気に入り・正誤判定を回帰確認する](https://github.com/tj-999-comp/query_learning_BB/issues/69)
5. [#70 Cloudflare Pages公開環境で受入テストを行う](https://github.com/tj-999-comp/query_learning_BB/issues/70)

GitHubのsub-issues APIで、5件すべてが親Issue #65に紐づいていることを確認した。次の着手対象は、方式決定を行うIssue #66とした。

## v2.0.0の計画

- **alpha**：問題ページURL、静的ビルド方式、Cloudflare Pagesでの直接アクセス対応を調査・決定する。
- **beta**：問題別ページ、共通レイアウト、問題間ナビゲーションを実装し、主要ブラウザで回帰確認する。
- **正式版**：全問題ページを生成・公開し、Cloudflare Pages本番環境で直接アクセス、リロード、SQL学習フローを受入確認する。

## 今後の着手条件

- 本作業記録のPRをmainへマージする。
- マージ完了を確認した後、Issue #66のURL設計・静的ビルド方式の比較と技術検証に着手する。
- Cloudflare Pagesの直接アクセス仕様やURL方式で判断が必要になった場合は、実装を進める前に確認する。

## 検証

- 作業記録作成直前の2026-09-07 16:57:21 JSTにOpen Issue一覧をGitHub APIから取得した。
- 取得範囲は`--state open --limit 1000`、取得件数は6件である。
- #65のsub-issues APIを確認し、#66〜#70の5件が登録されていることを確認した。
- 作業記録のMarkdownとmetadataを作成後、`python3 scripts/dev/validate_work_records.py`で全件検証する。

## GitHub Issue状況

作業記録作成直前の2026-09-07 16:57:21 JSTに、Pull Requestを除く `tj-999-comp/query_learning_BB` のOpen IssueをGitHub APIから取得した。取得範囲は`--state open --limit 1000`、取得件数は6件である。親子関係は#65のsub-issues APIで確認した。外部リポジトリのIssueは一覧へ含めていない。

| 順位 | 優先度 | GitHub Issue | 状態 | 関係・着手条件 |
|---:|---|---|---|---|
| 1 | 未設定 | [#66 [v2.0.0] 問題ページのURL設計と静的ビルド方式を決める](https://github.com/tj-999-comp/query_learning_BB/issues/66) | Open（state reason未設定） | #65の子Issue。方式決定のため、作業記録PRのmainマージ後に着手する。 |
| 2 | 未設定 | [#67 [v2.0.0] 問題別ページの共通レイアウトとナビゲーションを実装する](https://github.com/tj-999-comp/query_learning_BB/issues/67) | Open（state reason未設定） | #65の子Issue。#66の方式決定後に着手する。 |
| 3 | 未設定 | [#68 [v2.0.0] 全問題ページの生成と直接アクセス対応を実装する](https://github.com/tj-999-comp/query_learning_BB/issues/68) | Open（state reason未設定） | #65の子Issue。#66の方式決定と#67の共通基盤実装後に着手する。 |
| 4 | 未設定 | [#69 [v2.0.0] 問題ページ化後の進捗・お気に入り・正誤判定を回帰確認する](https://github.com/tj-999-comp/query_learning_BB/issues/69) | Open（state reason未設定） | #65の子Issue。#67・#68の実装後に着手する。 |
| 5 | 未設定 | [#70 [v2.0.0] Cloudflare Pages公開環境で受入テストを行う](https://github.com/tj-999-comp/query_learning_BB/issues/70) | Open（state reason未設定） | #65の子Issue。#68・#69の完了後に着手する。 |
| 6 | 未設定 | [#65 [v2.0.0] 問題別ページ化と学習導線の再構成](https://github.com/tj-999-comp/query_learning_BB/issues/65) | Open（state reason未設定） | v2.0.0の親Issue。#66〜#70の進行を管理する。 |

## 関連ファイル

- [`work-records/README.md`](https://github.com/tj-999-comp/query_learning_BB/blob/main/work-records/README.md)
- [`Apps/scripts/build-pages.sh`](https://github.com/tj-999-comp/query_learning_BB/blob/main/Apps/scripts/build-pages.sh)
- [`Apps/app/index.html`](https://github.com/tj-999-comp/query_learning_BB/blob/main/Apps/app/index.html)
- [`Apps/app/app.js`](https://github.com/tj-999-comp/query_learning_BB/blob/main/Apps/app/app.js)
