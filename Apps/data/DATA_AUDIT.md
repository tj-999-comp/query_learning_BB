# #10 データ監査結果

監査日: 2026-09-03

## 判定

Driveフォルダの完全版CSV 8ファイルを正式入力として配置し、テーブル間の整合性検証を通過したSQLiteを生成しました。`db-manifest.json` は `available: true` です。

先に配置されていた100行版は完全版ではなかったため、Driveの完全版で置き換えました。取り込みスクリプトには同じ整合性検証を組み込んでおり、今後も未整合のCSVから利用可能なSQLiteを生成しません。データの出典・公開利用条件は未確認のため、公開可否の最終判定は保留です。

## 入力ファイル

| ファイル | データ行 | 列数 |
|---|---:|---:|
| `Supabase_game_team_stats.csv` | 12,518 | 115 |
| `Supabase_games.csv` | 6,264 | 45 |
| `Supabase_player_affiliations.csv` | 2,549 | 10 |
| `Supabase_player_game_stats.csv` | 150,270 | 41 |
| `Supabase_player_name_history.csv` | 1,506 | 8 |
| `Supabase_players.csv` | 1,101 | 12 |
| `Supabase_team_name_history.csv` | 61 | 10 |
| `Supabase_teams.csv` | 45 | 7 |

構造監査では、8ファイルの存在、UTF-8読み込み、スキーマ列名、列数、主キー重複なしを確認しました。取り込み後の外部キー検証もすべて0件でした。

## 整合性確認

- `games` と `game_team_stats` の試合IDは整合し、スタッツ未取得試合は既知の5件でした。
- `game_team_stats` は試合ごとに2チーム分の行が揃っています。
- `player_game_stats`、`player_affiliations`、`player_name_history` の選手ID・試合ID・チームID参照はすべて解決しました。
- 主キー重複はありません。
- `Apps/data/problems.json` の参考SQL 10問はすべて生成済みSQLite上で実行できました。
- `Apps/scripts/build-pages.sh` の公開成果物に同一のSQLiteが配置されることを確認しました。

## 既知の例外

`game_team_stats` では、次の28列が12,518行すべてNULLでした。これは既知の例外として記録します。

`dunks`, `ft_d_pct`, `perimeter_pts_pct`, `live_tov_pct`, `dead_tov_pct`, `live_tov_share`, `dead_tov_share`, `off_success_count`, `or_chances`, `dr_chances`, `tom`, `vps`, `home_efg_pct`, `away_efg_pct`, `home_ts_pct`, `away_ts_pct`, `home_off_rtg`, `away_off_rtg`, `pythagorean_win_pct`, `opp_success_count`, `opp_ft_d_pct`, `opp_ft_rate`, `opp_perimeter_pts_pct`, `opp_vps`, `home_opp_efg_pct`, `away_opp_efg_pct`, `home_opp_ts_pct`, `away_opp_ts_pct`

## #10の残条件

CSV配置、SQLite生成、データ整合性確認は完了しました。残る確認はBリーグデータの出典・公開利用条件です。

- Bリーグデータの出典・公開利用条件を確認すること
