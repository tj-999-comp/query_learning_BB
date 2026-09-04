# 作業記録 007: #14 MVP要件定義書の確定と凍結

作成日: 2026-09-04

## 背景

Issue #14「MVP要件定義書の未決事項を確定して凍結する」に対応し、`Apps/docs/MVP_REQUIREMENTS.md` に残っていた未定・未確認項目を整理した。作成者から回答を得た内容を要件として反映し、以後の実装・受入判定の基準を確定した。

## 確定した内容

- サービス名を「SQL問題集 Bリーグスタッツ」とした。
- 興味のあるBリーグスタッツを題材にSQLを学ぶ個人向けサービスとして、背景と目的を明記した。
- 利用者は作成者本人に限定し、PCまたはiPadから利用する。スマートフォンは対象外とした。
- 問題形式はSQL入力のみとし、選択式・穴埋め式・その他は実装しない。
- ランキング・共有機能は実装しない。
- データは作成者本人のSQL学習目的に限定し、再配布・商用利用は行わない。
- スキーマはテーブル名・カラム名・型に加えてER図を提供する要件とした。
- SQLは単一のSELECTまたはWITHに限定し、実行時間制限は設けず、結果表示は最大1000行とした。正誤判定は全結果を対象とする。
- 対応ブラウザはFirefoxとChromeの最新版とし、Safariは対象外とした。
- 基本的なキーボード操作、ラベル、文字による状態表示、色に依存しない表示、320px以上での横スクロール防止をアクセシビリティ要件とした。
- 性能・可用性・保守性・コストなどの最低限の非機能要件、リスク、MVP後の指標を明記した。

## 判定

文書ステータスを「MVP確定」に変更し、MVP必須要件・対象外・受入条件に未定項目が残っていないことを確認した。親Issue #8のMVP完了条件とも整合している。Issue #14へ受入確認結果をコメントし、2026-09-04にクローズした。

関連コミット: `ac62664 docs: freeze MVP requirements for issue 14`

## 検証

- `rg`で要件書内の「未定」「未確認」「詳細未定」が残っていないことを確認した。
- `git diff --check` が成功した。
- `Apps/docs/MVP_REQUIREMENTS.md` の文書ステータス、必須要件、対象外、受入条件を確認した。

なお、ER図は要件として確定したが、現在のWebアプリ画面には未実装である。ER図の実装は後続作業として扱う。

## GitHub Issue状況

2026-09-04 12:27:52 JST に `tj-999-comp/query_learning_BB` のOpen IssueをPull Requestを除いてGitHub APIから取得した（取得件数: 4件）。Issue #8のsub-issues APIを確認したが、返却は0件だった。#14は本作業でクローズ済みであり、以下の一覧には含めていない。

| 順位 | 優先度 | GitHub Issue | 状態 | 関係・着手条件 |
|---:|---|---|---|---|
| 1 | 高 | [#13](https://github.com/tj-999-comp/query_learning_BB/issues/13) | OPEN（state reason未設定） | 確定したMVP要件とSQLiteを前提に仮問題10問を検証する。 |
| 2 | 中 | [#12](https://github.com/tj-999-comp/query_learning_BB/issues/12) | OPEN（state reason未設定） | 確定した対応環境と主要機能を前提にPC・iPad・ブラウザ保存を受入確認する。 |
| 3 | 中 | [#11](https://github.com/tj-999-comp/query_learning_BB/issues/11) | OPEN（state reason未設定） | #6のホスティング方針と確定データを前提に公開・スモークテストする。 |
| 4 | 高 | [#8](https://github.com/tj-999-comp/query_learning_BB/issues/8) | OPEN（state reason未設定） | #13、#12、#11の完了後にMVP全体を完了判定する。 |
