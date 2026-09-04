# 作業記録 008: #13 仮問題10問のMVPコンテンツ検証

作成日: 2026-09-04

## 背景

Issue #13「仮問題10問をMVP確定コンテンツとして検証する」に対応し、#10で確定したSQLiteデータと、#14で凍結したMVP要件を前提に、問題定義・参考SQL・出力件数・表示方針を確認した。

## 検証対象

`Apps/data/problems.json` の次の10問を対象とした。

| ID | 内容 | 難易度 | カテゴリ | 参考SQLの結果 |
|---|---|---:|---|---:|
| mvp-001 | チーム一覧を表示する | 1 | 基本検索 | 45行 |
| mvp-002 | シーズンごとの試合数を数える | 1 | 集計 | 10行 |
| mvp-003 | 観客数の多い試合を探す | 1 | 基本検索 | 10行 |
| mvp-004 | 100得点以上のチームスタッツ | 1 | 基本検索 | 516行 |
| mvp-005 | ホームゲームの得点を見る | 2 | テーブル結合 | 10行 |
| mvp-006 | チームごとの平均得点 | 2 | 集計 | 41行 |
| mvp-007 | 選手ごとの通算得点 | 2 | 集計 | 10行 |
| mvp-008 | 出場試合数の多い選手 | 2 | 集計 | 10行 |
| mvp-009 | ホームとアウェーの平均得点を比べる | 2 | 条件分岐・サブクエリ | 2行 |
| mvp-010 | 20得点以上を記録した先発選手 | 2 | テーブル結合 | 8,063行 |

## 実施内容

- 問題数が10問で、IDが重複していないことを確認した。
- 全問に問い、難易度、カテゴリ、利用テーブル、参考SQL、比較条件、解説が設定されていることを確認した。
- 問いで指定された対象テーブル、抽出条件、集計、結合、表示列、上位件数が参考SQLと対応していることを確認した。
- 10問の参考SQLを確定SQLite上で実行し、すべてエラーなく、空でない結果が返ることを確認した。
- 参考SQLがすべて単一の`SELECT`文であり、データ変更・DDL・管理用SQLを含まないことを確認した。
- Q06・Q09の数値許容差、各問題の行順比較条件が、#9で確定した判定方針に従って設定されていることを確認した。
- Q10は8,063行の結果になるため、要件どおりアプリ画面では先頭1,000行までを表示し、行数表示と上限メッセージを出すことを確認した。正誤判定は表示前の全結果を対象とする。
- #10で記録したスタッツ未取得試合5件と、`game_team_stats`の全行NULL列28列を確認し、問題定義がこれらの例外を暗黙に0件・0点として扱っていないことを確認した。

## 確認結果

- 確定SQLiteの主要行数は`games` 6,264行、`game_team_stats` 12,518行、`player_game_stats` 150,270行で、#10の確定値と一致した。
- 10問すべてで参考SQLの結果列数・行数を取得できた。
- 問題の出力は空ではなく、Q10を除く9問は516行以下だった。
- Q10の大量結果は、表示上限と全件判定の方針で受入条件を満たす。

## 判定

問題文、参考SQL、メタデータ、確定SQLiteの対応を確認し、Issue #13の受入条件を満たした。MVPでは問題体系の本格設計は行わず、現行10問を仮問題の確定コンテンツとして採用する。

Q10の結果件数が多い点、スタッツ未取得試合5件、全行NULL列28列は既知のデータ・表示上の注意点として記録した。問題の出力や正誤判定を妨げる未解決事項はない。

Issue #13へ受入確認結果をコメントし、2026-09-04にクローズした。

## 検証コマンド

- 問題定義とSQLiteを使った10問の参考SQL実行・結果件数確認
- `git diff --check`
- `node --check Apps/app/app.js`
- `python3 -m json.tool Apps/data/problems.json`
- `python3 scripts/dev/validate_work_records.py`

## 関連ファイル

- [`Apps/data/problems.json`](../../Apps/data/problems.json)
- [`Apps/data/DATA_AUDIT.md`](../../Apps/data/DATA_AUDIT.md)
- [`Apps/app/app.js`](../../Apps/app/app.js)
- [`Apps/docs/MVP_REQUIREMENTS.md`](../../Apps/docs/MVP_REQUIREMENTS.md)

## GitHub Issue状況

2026-09-04 12:33:07 JST に `tj-999-comp/query_learning_BB` のOpen IssueをPull Requestを除いて取得した（取得件数: 4件）。Issue #8のsub-issues APIを確認したが、返却は0件だった。取得時点では全Issueのstate reasonが未設定だった。#13は本作業でクローズ済みである。

| 順位 | 優先度 | GitHub Issue | 状態 | 関係・着手条件 |
|---:|---|---|---|---|
| 1 | 中 | [#12](https://github.com/tj-999-comp/query_learning_BB/issues/12) | OPEN（state reason未設定） | 確定した問題・データ・主要機能を前提にPC・iPad・ブラウザ保存を受入確認する。 |
| 2 | 中 | [#11](https://github.com/tj-999-comp/query_learning_BB/issues/11) | OPEN（state reason未設定） | #6のホスティング方針と確定データを前提に公開・スモークテストする。 |
| 3 | 高 | [#8](https://github.com/tj-999-comp/query_learning_BB/issues/8) | OPEN（state reason未設定） | #11、#12、#13、#14の完了後にMVP全体を完了判定する。 |
| 4 | 高 | [#13](https://github.com/tj-999-comp/query_learning_BB/issues/13) | CLOSED | 本作業。仮問題10問の最終検証が完了した。 |
