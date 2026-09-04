# 作業記録 005: #9 SQL正誤判定・読み取り専用制限の受入確認と基準確定
作成日: 2026-09-04

## 背景

Issue #9「SQL正誤判定・読み取り専用制限の受入テストを整備する」に対応し、SQLの書き方ではなく実行結果を基準に正誤判定するMVP方針を確認した。問題文に指定のない数値丸めや同数時の細かな並び順で、正しい別解が不正解にならないよう、問題ごとの比較条件も確定した。

## 確定した判定基準

- SQL文の文字列ではなく、実行結果の列数・行数・列位置ごとの値を比較する。
- 列名や別名は比較対象にせず、複数の正しいSQLによる同一結果を許容する。
- `rowOrder: "insensitive"` の問題は行順を比較しない。`sensitive` の問題は問題文で順序が条件になるため行順を比較する。
- 問題文に指定のない丸めや表示形式は必須にしない。
- `numericTolerance` が設定された問題は、指定値以内の数値差を同値として扱う。Q06・Q09は `0.01` を設定した。
- SQLは`SELECT`または`WITH`から始まる単一の読み取り文に限定し、データ変更・DDL・管理用SQLは拒否する。

## 問題ごとの比較条件

- 行順を無視: Q01、Q04、Q06、Q07、Q08、Q09、Q10
- 数値差0.01を許容: Q06、Q09
- 行順を比較: Q02、Q03、Q05

## 受入確認

- 10問の参考SQLを生成済みSQLite上で実行し、すべて正解判定になることを確認した。
- Q06で`ROUND`を使わない平均値のSQLを入力し、数値許容差により正解判定になることを確認した。
- Q07・Q08・Q10で同数時の補助順を参考SQLと変えたSQLを入力し、行順を問わず正解判定になることを確認した。
- Q09で`ROUND`を使わず、ホーム／アウェーの表示順も変えたSQLを入力し、正解判定になることを確認した。
- 問題一覧、SQL実行、正誤判定、参考SQL・解説表示、進捗更新の主要フローを確認した。
- `SELECT`／`WITH`の単一文制限、禁止SQLの拒否、SQLエラー、空結果、不正解時の進捗未更新と再挑戦を実装上確認した。
- 1280px、900px、640px、320px幅で、コンソールエラー、ページエラー、失敗リクエスト、横方向のはみ出しがないことを確認した。
- `bash Apps/scripts/build-pages.sh`、`git diff --check`、`node --check Apps/app/app.js`、`python3 -m json.tool Apps/data/problems.json` が成功した。

## 判定

問題文の意図に沿った別解を許容しつつ、問題ごとに必要な抽出・集計・件数条件を比較できる状態になった。Q06・Q09の数値丸め、Q07・Q08・Q10の同数時順序については、問題文にない条件を正解必須としない方針で確定した。

Issue #9へ受入確認結果をコメントし、2026-09-04にクローズした。

## 関連Issue

- [#9 SQL正誤判定・読み取り専用制限の受入テストを整備する](https://github.com/tj-999-comp/query_learning_BB/issues/9)
- [#8 MVP完了に向けた残作業の整理・完了管理](https://github.com/tj-999-comp/query_learning_BB/issues/8)

## GitHub Issue状況

2026-09-04 12:07:52 JST に `tj-999-comp/query_learning_BB` のOpen IssueをPull Requestを除いて取得した（取得件数: 6件）。Issue #8のsub-issues APIを確認したが、返却は0件だった。そのため、以下ではAPIで確認できた親子関係は記載せず、Issue本文に基づく関係・着手条件のみを補足する。state reasonは全件未設定だった。

| 順位 | 優先度 | GitHub Issue | 状態 | 関係・着手条件 |
|---:|---|---|---|---|
| 1 | 高 | [#14](https://github.com/tj-999-comp/query_learning_BB/issues/14) | OPEN（state reason未設定） | MVP要件の未決事項を確定し、要件定義書を凍結する。 |
| 2 | 高 | [#13](https://github.com/tj-999-comp/query_learning_BB/issues/13) | OPEN（state reason未設定） | 仮問題10問の最終検証。確定SQLiteと問題定義の確認が前提。 |
| 3 | 中 | [#12](https://github.com/tj-999-comp/query_learning_BB/issues/12) | OPEN（state reason未設定） | PC・iPad・ブラウザ保存の受入確認。主要機能が揃った状態で実施する。 |
| 4 | 中 | [#11](https://github.com/tj-999-comp/query_learning_BB/issues/11) | OPEN（state reason未設定） | Basic認証付き公開と最終スモークテスト。#6の決定内容を前提とする。 |
| 5 | 高 | [#10](https://github.com/tj-999-comp/query_learning_BB/issues/10) | OPEN（state reason未設定） | 確定CSVとSQLiteデータセットの確定。データ監査と利用条件の確認が必要。 |
| 6 | 高 | [#8](https://github.com/tj-999-comp/query_learning_BB/issues/8) | OPEN（state reason未設定） | MVP残作業の完了管理。sub-issues APIでは子Issue未登録。 |
