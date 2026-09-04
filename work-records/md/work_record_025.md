# 作業記録 025: Issue #34 SQL問題バンクを100問へ拡充

作成日: 2026-09-04

## 背景

Issue #34「主題一覧ドキュメントをもとに問題を追加できる仕組みを作る」に対応した。共有された「SQL Quest 練習問題 660問 概要まとめ」を参考に、660問をそのまま移植せず、Bリーグの既存SQLiteで反復練習できる問題バンクを整備した。

## 参照資料

- [SQL Quest 練習問題 660問 概要まとめ（Google Drive）](https://drive.google.com/file/d/1_mf_D7Y99OXYMs6zsqS6oHz1O9IhJLfF/view?usp=drivesdk)

資料からは、基本検索・条件指定からJOIN・集計、CTE・サブクエリ・ウィンドウ関数へ進む学習段階と、題材違いで同じ構文を反復する構成を取り入れた。UPDATE・DELETEなどの更新系問題は今回の対象外とした。

## 変更内容

- 問題を既存10問から合計100問へ拡充した。
- 難易度を★1〜★4で設定し、★2〜★3を中心にした。
- 基本検索、テーブル結合、集計、条件分岐・サブクエリ、応用集計の5カテゴリを用意した。
- `Apps/data/problem-topics.json`を問題主題の入力資料として追加した。
- 似た基礎問題をまとめて定義できる`problemFamilies`を追加した。
- `Apps/scripts/generate_problems.py`で主題定義から`Apps/data/problems.json`を生成できるようにした。
- 生成・検証時に、ID重複、問題重複、難易度、読み取り専用SQL、存在しないテーブル・カラム、空結果、`sourceTables`との対応を確認するようにした。
- 100問用に進捗保存キーをv2へ切り替え、既存の正解状況をリセットするようにした。お気に入りは旧キーから引き継ぐ。
- 問題作成手順と入力・出力の関係を`Apps/docs/PROBLEM_AUTHORING.md`に記録した。

## 検証

- `python3 Apps/scripts/generate_problems.py`
- `node --check Apps/app/app.js`
- `python3 -m json.tool Apps/data/problem-topics.json`
- `python3 -m json.tool Apps/data/problems.json`
- `git diff --check`
- `bash Apps/scripts/build-pages.sh`
- 100問すべての参考SQLを確定SQLiteで実行し、空結果がないことを確認した。
- 公開用`Apps/public/data/problems.json`が入力から生成した問題データと一致することを確認した。
- ブラウザで問題一覧の100問表示、カテゴリ絞り込み、CTE＋RANK問題の正誤判定を確認した。

## 関連ファイル

- [`Apps/data/problem-topics.json`](../../Apps/data/problem-topics.json)
- [`Apps/data/problems.json`](../../Apps/data/problems.json)
- [`Apps/scripts/generate_problems.py`](../../Apps/scripts/generate_problems.py)
- [`Apps/docs/PROBLEM_AUTHORING.md`](../../Apps/docs/PROBLEM_AUTHORING.md)
- [`Apps/app/app.js`](../../Apps/app/app.js)
- [#34](https://github.com/tj-999-comp/query_learning_BB/issues/34)

## Git

- 問題拡充コミット: `b9efc0450c60a9784d99c5e81eef749b2ada02f1`
- 回答履歴リセットコミット: `9882aae`
- 作業記録ブランチ: `docs/record-issue-34-problem-bank`

## GitHub Issue状況

取得日時: 2026-09-04 17:30 JST  
取得範囲: `tj-999-comp/query_learning_BB`のPull Requestを除くOpen Issue、最大1000件  
取得件数: 2件  
取得方法: `gh issue list --repo tj-999-comp/query_learning_BB --state open --json number,title,state,stateReason,url --limit 1000`  
親子関係確認: `gh api repos/tj-999-comp/query_learning_BB/issues/26/sub_issues`

| 順位 | 優先度 | GitHub Issue | 状態 | 関係・着手条件 |
|---:|---:|---|---|---|
| 1 | v0.5.0 | [#34](https://github.com/tj-999-comp/query_learning_BB/issues/34) [主題一覧ドキュメントをもとに問題を追加できる仕組みを作る](https://github.com/tj-999-comp/query_learning_BB/issues/34) | OPEN / state reason未設定 | #26の子Issue。問題データ形式、スキーマ情報、参照資料の確認を着手条件とし、本作業で対応した。 |
| 2 | 次期フェーズ | [#26](https://github.com/tj-999-comp/query_learning_BB/issues/26) 次期フェーズ：SQL学習体験の改善と問題コンテンツ拡充 | OPEN / state reason未設定 | 親Issue。子Issueの完了後に全体の次の改善を判断する。 |
