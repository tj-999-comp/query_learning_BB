# 作業記録 006: #10 データセット確定と利用条件確認

作成日: 2026-09-04

## 背景

Issue #10「確定CSVを配置しSQLiteデータセットを確定する」について、先行作業で完了していたCSV監査・SQLite生成に加え、データの出典・利用条件を確認済みとして記録し、MVPで利用するデータセットを確定した。

## 実施内容

- `Apps/data/csv/` に配置された完全版CSV 8ファイルを正式入力として確認した。
- `Apps/scripts/import_csv_to_sqlite.py` を再実行し、`Apps/data/bleague.sqlite` を再生成できることを確認した。
- 8通常テーブルのみをSQLiteへ取り込み、3ビューを取り込んでいないことを確認した。
- CSVとSQLiteの行数、主キー・外部キー整合性、UTF-8・ヘッダー付き形式を確認した。
- `game_team_stats` の既知の全行NULL列28列と、スタッツ未取得試合5件を例外として記録した。
- `db-manifest.json` の `available: true` と、公開成果物へのSQLite同梱を確認した。
- SQLiteのサイズが約34MBであることを確認した。
- データの出典および利用条件を確認した。作成者本人のSQL学習目的に限定して利用し、データの再配布および商用利用は行わない。

## 確認結果

- CSV 8ファイルの行数とSQLiteの各テーブル行数が一致した。
- SQLite内のテーブルは `game_team_stats`、`games`、`player_affiliations`、`player_game_stats`、`player_name_history`、`players`、`team_name_history`、`teams` の8テーブルで、ビューは存在しなかった。
- 再生成前後のSQLiteハッシュが一致し、同じ入力から再現可能であることを確認した。
- `Apps/data/problems.json` の参考SQL 10問を生成済みSQLite上で実行できることを確認した。
- `Apps/scripts/build-pages.sh` がSQLiteを公開成果物へ配置できることを確認した。

## 判定

CSV配置、SQLite生成、データ整合性確認、例外データの記録、公開成果物への同梱、およびデータ利用条件の確認が完了した。Issue #10へ受入確認結果をコメントし、2026-09-04にクローズした。

関連コミット: `9026b24 docs: confirm dataset usage conditions for issue 10`

## 検証コマンド

- `python3 Apps/scripts/import_csv_to_sqlite.py`
- CSVとSQLiteの行数比較、およびSQLite内のビュー有無確認
- `bash Apps/scripts/build-pages.sh`
- `git diff --check`

## GitHub Issue状況

2026-09-04 12:25:23 JST に `tj-999-comp/query_learning_BB` のOpen IssueをPull Requestを除いてGitHub APIから取得した（取得件数: 5件）。Issue #8のsub-issues APIを確認したが、返却は0件だった。#10は本作業でクローズ済みであり、以下の一覧には含めていない。

| 順位 | 優先度 | GitHub Issue | 状態 | 関係・着手条件 |
|---:|---|---|---|---|
| 1 | 高 | [#14](https://github.com/tj-999-comp/query_learning_BB/issues/14) | OPEN（state reason未設定） | MVP要件定義書の凍結。 |
| 2 | 高 | [#13](https://github.com/tj-999-comp/query_learning_BB/issues/13) | OPEN（state reason未設定） | 確定SQLiteを前提に仮問題10問を検証する。 |
| 3 | 中 | [#12](https://github.com/tj-999-comp/query_learning_BB/issues/12) | OPEN（state reason未設定） | 確定データと主要機能を前提にPC・iPad・ブラウザ保存を受入確認する。 |
| 4 | 中 | [#11](https://github.com/tj-999-comp/query_learning_BB/issues/11) | OPEN（state reason未設定） | #6のホスティング方針と確定データを前提に公開・スモークテストする。 |
| 5 | 高 | [#8](https://github.com/tj-999-comp/query_learning_BB/issues/8) | OPEN（state reason未設定） | #14、#13、#12、#11の完了後にMVP全体を完了判定する。 |
