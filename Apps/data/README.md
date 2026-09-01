# 学習データ

## CSVの配置

`csv/` に次の8ファイルを配置します。

- `game_team_stats.csv`
- `games.csv`
- `player_affiliations.csv`
- `player_game_stats.csv`
- `player_name_history.csv`
- `players.csv`
- `team_name_history.csv`
- `teams.csv`

CSVはUTF-8、ヘッダー付きで保存してください。ビュー（`v_player_transfer_events`、`v_players_current`、`v_teams_current`）は取り込みません。

## SQLiteの生成

リポジトリのルートで次を実行します。

```bash
python3 Apps/scripts/import_csv_to_sqlite.py
```

生成先は `Apps/data/bleague.sqlite` です。元CSVが未配置の場合は、スクリプトが不足ファイルを一覧表示して終了します。

生成に成功すると `db-manifest.json` も更新され、WebアプリがSQLiteを読み込める状態になります。
