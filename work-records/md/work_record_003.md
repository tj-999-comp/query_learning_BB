# 作業記録 003: #10 CSVデータ監査とSQLiteデータセット確定
作成日: 2026-09-03

## 背景

Issue #10「確定CSVを配置しSQLiteデータセットを確定する」に対応し、作業ツリーに配置されたSupabase CSV 8ファイルを監査した。サイトで利用するSQLiteを確定できる状態か、再現可能な取り込み手順を含めて確認した。

## 実施内容

- Driveフォルダの完全版CSV 8ファイルを取得し、`Apps/data/csv/` の100行版を置き換えた。
- 完全版CSVについて、UTF-8読み込み、ヘッダー、列数、データ行数、主キー重複を確認した。
- `Apps/scripts/import_csv_to_sqlite.py` に主キー、外部キー、試合とチームスタッツの対応、CSVの列数不一致を検証する処理を追加した。
- `Apps/data/DATA_AUDIT.md` に監査値、整合性エラー、既知の全行NULL列28列、再取得条件を記録した。
- 完全版CSVから `Apps/data/bleague.sqlite` を生成し、`Apps/data/db-manifest.json` を `available: true` に更新した。

## 確認結果

- 完全版CSVは8ファイルとも読み込め、`games` と `game_team_stats` の試合IDが整合する。
- `player_game_stats`、`player_affiliations`、`player_name_history` の `players`・`games` 参照も整合する。
- 主キー重複およびチームID参照には問題がない。
- `Apps/data/problems.json` の参考SQL 10問がすべて生成済みSQLite上で実行できる。
- `Apps/scripts/build-pages.sh` の公開成果物に同一SQLiteが配置される。
- 整合データのインメモリ最小fixtureは検証を通過した。
- `PYTHONPYCACHEPREFIX=/tmp/query-learning-bb-pycache python3 -m py_compile Apps/scripts/import_csv_to_sqlite.py`、`git diff --check` は成功した。

## 判定

#10のCSV配置・SQLite生成・整合性確認は完了。`game_team_stats` の既知の全行NULL列28列と、スタッツ未取得試合5件は例外として記録した。Bリーグデータの出典・公開利用条件は未確認のため、公開可否の最終判定は保留する。

## GitHub Issue状況

2026-09-03 22:29:42 JST に `tj-999-comp/query_learning_BB` のOpen IssueをPull Requestを除いて取得した（取得件数: 8件）。Issueのsub-issues APIを #8 について確認したが、返却は0件だった。

| 順位 | 優先度 | GitHub Issue | 状態 | 関係・着手条件 |
|---:|---|---|---|---|
| 1 | 高 | [#14](https://github.com/tj-999-comp/query_learning_BB/issues/14) | OPEN | 要件凍結。#10の利用条件・確定方針と関連 |
| 2 | 高 | [#13](https://github.com/tj-999-comp/query_learning_BB/issues/13) | OPEN | 問題検証。#10の確定SQLiteが前提 |
| 3 | 中 | [#12](https://github.com/tj-999-comp/query_learning_BB/issues/12) | OPEN | 端末・保存受入。データ確定後に実施 |
| 4 | 中 | [#11](https://github.com/tj-999-comp/query_learning_BB/issues/11) | OPEN | 公開・スモークテスト。SQLite確定後に実施 |
| 5 | 高 | [#10](https://github.com/tj-999-comp/query_learning_BB/issues/10) | OPEN | 本作業。整合する8 CSVの再取得待ち |
| 6 | 高 | [#9](https://github.com/tj-999-comp/query_learning_BB/issues/9) | OPEN | 判定テスト。確定SQLiteが前提 |
| 7 | 高 | [#8](https://github.com/tj-999-comp/query_learning_BB/issues/8) | OPEN | 残作業の親Issue。sub-issues APIでは子Issue未登録 |
| 8 | 中 | [#6](https://github.com/tj-999-comp/query_learning_BB/issues/6) | OPEN | ホスティング・Basic認証の検討 |
