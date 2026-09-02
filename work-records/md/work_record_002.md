# 作業記録 002: SQL学習WebサイトMVPの要件整理と残作業Issue作成
作成日: 2026-09-02

## 背景

SQL学習WebサイトのMVPについて、作成者本人がブラウザでSQLを書き、実行結果を確認し、正誤と学習状況を確認できる範囲を定義した。既存のMVP実装を前提に、要件定義後に残る作業を明確化し、GitHub Issueで管理できる状態にする。

## 実施内容

- `Apps/docs/MVP_REQUIREMENTS.md` に、個人利用、PC/iPad対応、ブラウザ内SQLite、localStorageによる学習情報保存、読み取り専用SQL、10問の仮問題、星1〜5の難易度、暫定カテゴリ、お気に入り登録、結果ベースの正誤判定などのMVP要件を整理した。
- SQLite取り込み対象を8つの通常テーブルに限定し、3つのビューを対象外とした。
- 正誤判定について、SQL文字列ではなく結果を比較し、別解を許容する方針を定義した。行順、列名、NULL、数値誤差、読み取り専用SQLの扱いも記録した。
- Google Drive上の新しいCSV 8ファイルを監査した。合計は `games` 6,264行、`game_team_stats` 12,518行、`player_game_stats` 150,270行などで、10シーズン（2016-17〜2025-26）を含むことを確認した。
- CSVの文字コード、列数不一致、壊れた行、主キー重複、外部キー欠損を確認し、問題がないことを確認した。監査対象CSVから一時SQLiteを生成し、仮問題10問の参考SQLがすべて実行できることも確認した。
- 例外として、スタッツが存在しない試合が5件、`game_team_stats` に全行NULLの列が28列あることを確認し、データ確定・問題検証Issueで扱うことにした。
- 残作業を束ねる親Issue #8 と、要件凍結、データ確定、問題検証、判定テスト、端末受入、公開を扱う子Issue #9〜#14を作成した。既存のホスティング検討Issue #6も親Issueに関連付けた。

## 確認結果

- `python3 scripts/dev/validate_work_records.py` は、作業記録追加後に成功することを確認する。
- 既存のMVP実装を含むブランチ上で、作業記録とIssueの対応を追跡できる状態にした。
- ユーザー提供のCSVおよび `Apps/table_definition.md` は、今回の作業記録変更とは分離して未追跡のまま保持した。

## 未完了

- MVP要件定義書に残る未決事項の確定と文書の凍結（#14）。
- 確定CSVの正式配置とSQLite成果物の確定（#10）。
- 仮問題10問の確定データ上での最終確認（#13）。
- SQL正誤判定・読み取り専用制限の受入テスト整備（#9）。
- PC/iPad、ブラウザ保存、アクセシビリティの受入確認（#12）。
- ホスティング先・Basic認証方式の決定（#6）と公開・最終スモークテスト（#11）。

## 関連Issue

- 親: https://github.com/tj-999-comp/query_learning_BB/issues/8
- 判定テスト: https://github.com/tj-999-comp/query_learning_BB/issues/9
- データ確定: https://github.com/tj-999-comp/query_learning_BB/issues/10
- 公開: https://github.com/tj-999-comp/query_learning_BB/issues/11
- 端末・保存受入: https://github.com/tj-999-comp/query_learning_BB/issues/12
- 問題検証: https://github.com/tj-999-comp/query_learning_BB/issues/13
- 要件凍結: https://github.com/tj-999-comp/query_learning_BB/issues/14
- ホスティング検討: https://github.com/tj-999-comp/query_learning_BB/issues/6
