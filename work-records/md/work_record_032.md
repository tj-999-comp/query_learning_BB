# 作業記録 032: Issue #57 問題文の論理整合性と必要カラム表示の全問修正
作成日: 2026-09-06

## 背景

Issue #57「[v1.1.1] 必要なカラムのテーブル表示と問題文の並び順を全問で明確化する」について、Q32で見つかった問題文の不明瞭な日本語と、必要なカラムの参照先表示の誤りを全100問へ展開して修正した。対象Issueは修正確認後、2026-09-06にクローズした。

## 完了内容

- 全100問の問題文を監査し、問題の主題を先頭に「〜について知りたいです。」という自然な導入で示す形式に統一した。
- 「次の条件を満たすSQLを書いてください。」の定型句を廃止し、SQLの作成を求める問題であることは画面の文脈に委ねた。
- 「表示します」「表示してください」など、出題側が結果を表示するように読める表現を見直し、学習者が取得する列と条件を明確に記述した。
- 取得件数、取得する列、絞り込み条件、集計単位、並び順を同じ問題文内で矛盾なく読めるように整理した。
- 日付を含む一覧では、主キーとなる並び順と同日内のタイブレークを明記した。Q32は次の表現に統一した。

  > 2024-25シーズンの試合について知りたいです。試合日、試合ID、試合種別を10件取得してください。試合日の新しい順に並べ、同じ試合日の試合は試合IDの大きい順にしてください。

- 同一日付の順序を一意にする必要がある問題では、内部の`ORDER BY`で`games.schedule_key`を日付の順序に合わせたタイブレークとして使用し、問題文では学習者に伝わる「試合ID」として表現した。
- 「必要なカラム」の参照先をカラム名の括弧内にテーブル名だけで表示するように修正した。たとえば`game_date（games）`、`schedule_key（games）`、`game_type（games）`と表示される。
- `requiredColumns.reference`の正本をテーブル名に限定し、生成処理がSQLのテーブル名・別名から参照先を補完するようにした。ドット付き参照やスキーマに存在しない参照先は生成時に検証エラーとする。
- `Apps/docs/PROBLEM_AUTHORING.md`へ、問題文の導入・並び順・必要なカラム参照先の作成方針を追記した。

## 検証

- `python3 Apps/scripts/generate_problems.py --write`
- `python3 Apps/scripts/generate_problems.py`
- 生成された全100問のSQLをSQLiteで検証した。
- 全100問について、主題の導入、禁止していた定型句の除去、問題文と参照SQLの並び順の整合性を監査した。
- `node --check Apps/app/app.js`
- `git diff --check`
- STGデプロイがActiveであることを確認した：`e5fb5fff-fa4c-4fef-b2c0-b35badd2c71`（`https://stg.query-learning-bb.pages.dev/`）。
- 本番デプロイがActiveであることを確認した：`3d9d621f-f46c-4a9e-ad25-558894000bc7`（`https://query-learning-bb.pages.dev/`）。
- `/design-review`関連の変更は本番反映対象へ混在させず、既存のSTG作業ツリーの未コミット変更を保持した。

## GitHub Issue状況

作業記録作成直前の2026-09-06 15:15:23 JSTに、Pull Requestを除く`tj-999-comp/query_learning_BB`のOpen IssueをAPIで取得した。取得範囲は`--state open --limit 1000`、取得件数は1件である。優先度ラベルがないIssueは「未設定」と記載した。

| 順位 | 優先度 | GitHub Issue | 状態 | 関係・着手条件 |
|---:|---|---|---|---|
| 1 | 未設定 | [#58 [v1.1.2] 達成済みマークのドロップシャドウとチェック枠を調整する](https://github.com/tj-999-comp/query_learning_BB/issues/58) | `OPEN`（state reason: 未設定） | 本記録の対象外。Issue #57の完了後も残るUI調整Issueであり、本記録の作業結果を着手条件としない。 |

## 関連ファイル

- [`Apps/data/problem-topics.json`](../../Apps/data/problem-topics.json)
- [`Apps/data/problems.json`](../../Apps/data/problems.json)
- [`Apps/docs/PROBLEM_AUTHORING.md`](../../Apps/docs/PROBLEM_AUTHORING.md)
- [Issue #57](https://github.com/tj-999-comp/query_learning_BB/issues/57)

## GitHub

- STG反映コミット：`10f31ad`
- 本番反映コミット：`4f52b80`、`19c2da5`、`f4dc73d`
- Issue #57：クローズ済み
- Issue #57の修正過程コメント：[Issue comment](https://github.com/tj-999-comp/query_learning_BB/issues/57#issuecomment-5557327036)
- 本記録のPRで、Issue #57の完了記録を`main`へマージする。
