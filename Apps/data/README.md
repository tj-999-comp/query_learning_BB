# 学習データ

## CSVの配置

`csv/` に次の8ファイルを配置します。現在のエクスポート名である `Supabase_` プレフィックス付きにも対応しています。

- `Supabase_game_team_stats.csv`
- `Supabase_games.csv`
- `Supabase_player_affiliations.csv`
- `Supabase_player_game_stats.csv`
- `Supabase_player_name_history.csv`
- `Supabase_players.csv`
- `Supabase_team_name_history.csv`
- `Supabase_teams.csv`

CSVはUTF-8、ヘッダー付きで保存してください。文字列 `null` と空欄はNULLとして取り込みます。ビュー（`v_player_transfer_events`、`v_players_current`、`v_teams_current`）は取り込みません。

## SQLiteの生成

リポジトリのルートで次を実行します。

```bash
python3 Apps/scripts/import_csv_to_sqlite.py
```

生成先は `Apps/data/bleague.sqlite` です。元CSVが未配置の場合は、スクリプトが不足ファイルを一覧表示して終了します。

生成に成功すると `db-manifest.json` も更新され、WebアプリがSQLiteを読み込める状態になります。
