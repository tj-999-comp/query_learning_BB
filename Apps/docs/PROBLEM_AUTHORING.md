# 問題主題の管理と追加方法

## 方針

共有された「SQL Quest 練習問題 660問 概要まとめ」の学習段階を参考にし、Bリーグの既存SQLiteで成立する問題だけを選んで管理します。660問を移植するのではなく、100問程度の反復しやすい学習コースにします。

推奨順は、基本検索・条件指定 → 2テーブル結合 → GROUP BYと集計 → LEFT JOINと条件分岐 → CTE・サブクエリ・ウィンドウ関数です。難易度は初級を1〜2、中級を3、応用を4〜5として設定します。

出典資料:

- [Google Drive: SQL Quest 練習問題 660問 概要まとめ](https://drive.google.com/file/d/1_mf_D7Y99OXYMs6zsqS6oHz1O9IhJLfF/view?usp=drivesdk)

## 入力と出力

- 入力: [`Apps/data/problem-topics.json`](../data/problem-topics.json)
- 出力: [`Apps/data/problems.json`](../data/problems.json)
- 変換・検証: [`Apps/scripts/generate_problems.py`](../scripts/generate_problems.py)
- 検証対象DB: `Apps/data/bleague.sqlite`

入力には、主題、難易度、カテゴリ、問題文、利用テーブル、解答例SQL、判定SQL、期待出力仕様、学習目標、解説を1件ずつ定義します。似た基礎問題を増やす場合は、`problemFamilies`に共通の難易度・カテゴリ・期待出力仕様と複数の出題パターンをまとめて定義できます。生成時に各パターンへ一意なIDが付与され、具体的な問題として出力されます。

問題の基本形は次のとおりです。

```json
{
  "prompt": "選手名と国籍を表示してください。",
  "answerSql": "SELECT player_name_j, league_registered_nationality FROM players ...",
  "judgeSql": "SELECT player_name_j, league_registered_nationality FROM players ...",
  "resultSpec": {
    "columns": ["player_name_j", "league_registered_nationality"],
    "rowOrder": "sensitive",
    "numericTolerance": 0
  },
  "requiredColumns": [
    {"label": "選手名", "reference": "players.player_name_j"},
    {"label": "国籍", "reference": "players.league_registered_nationality"}
  ],
  "learningObjectives": ["INによる複数条件の検索"]
}
```

`answerSql`は解答例として表示し、`judgeSql`は正解結果の生成に使います。2つは別のSQLにできますが、生成時に実行結果が一致することを検証します。`resultSpec.columns`には学習者に返させる列だけを登録し、内部的な結合キーや並び順用の列をSELECTへ追加しません。`rowOrder`、`numericTolerance`もここで管理します。

`requiredColumns`は問題文の直下に表示する補助情報です。`label`が画面表示名、`reference`がテーブル名を含むカラム参照です。省略した場合は`resultSpec.columns`から技術名をそのまま表示します。

既存の`referenceSql`、`comparison`、`requiredSqlTerms`も移行期間中は読み込めますが、新しい問題では使用しません。`learningObjectives`はヒントや解説用であり、SQL文の文字列一致による正誤判定には使いません。

## 追加手順

1. `problem-topics.json` の `problems` に一意なIDの問題を追加する。
2. `python3 Apps/scripts/generate_problems.py --write` を実行する。
3. `python3 Apps/scripts/generate_problems.py` を実行して、生成結果を再検証する。

検証では、IDと問題の重複、必須項目、難易度、読み取り専用SQL、存在するテーブル、SQLの列・構文、`answerSql`と`judgeSql`の空結果・結果一致、`resultSpec.columns`との出力列一致、`sourceTables`と`judgeSql`の対応を確認します。問題文とSQLの意味が一致しているかは、機械検査に加えて作成者がレビューします。

INSERT・UPDATE・DELETE、DDL、トランザクションは、アプリの読み取り専用方針と今回の学習範囲により登録しません。
