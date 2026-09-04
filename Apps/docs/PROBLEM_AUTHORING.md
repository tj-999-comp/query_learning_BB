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

入力には、主題、難易度、カテゴリ、問題文、利用テーブル、参考SQL、比較条件、解説を1件ずつ定義します。似た基礎問題を増やす場合は、`problemFamilies`に共通の難易度・カテゴリ・比較条件と複数の出題パターンをまとめて定義できます。生成時に各パターンへ一意なIDが付与され、具体的な問題として出力されます。`requiredSqlTerms`は問題文で意図した構文が参考SQLに含まれることを機械的に確認するための補助項目です。

## 追加手順

1. `problem-topics.json` の `problems` に一意なIDの問題を追加する。
2. `python3 Apps/scripts/generate_problems.py --write` を実行する。
3. `python3 Apps/scripts/generate_problems.py` を実行して、生成結果を再検証する。

検証では、IDと問題の重複、必須項目、難易度、読み取り専用SQL、存在するテーブル、SQLの列・構文、参考SQLの空結果、`sourceTables`と参考SQLの対応を確認します。問題文とSQLの意味が一致しているかは、機械検査に加えて作成者がレビューします。

INSERT・UPDATE・DELETE、DDL、トランザクションは、アプリの読み取り専用方針と今回の学習範囲により登録しません。
