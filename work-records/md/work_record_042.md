# 作業記録 042: Issue #97 v2.0.4問題文・判定基準の実務要件整合と本番反映

作成日: 2026-09-09

- 対象リポジトリ: `tj-999-comp/query_learning_BB`
- 対象Issue: [#97](https://github.com/tj-999-comp/query_learning_BB/issues/97)

## 背景

Q.66〜Q.68で、問題文の要求とSQLの使用テーブル・取得対象が一致していない状態があった。また、問題文の出力項目指定に使う表現を全体で統一する追加修正を行った。

さらにQ.68は、先発フラグが1の記録を任意に10件取得する要件だった。しかし実データでは各試合・各チームに先発選手が必ず5人いるため、実際に必要なデータを取得する要求として不自然だった。実データと先発条件を含む類似問題を精査し、Q.68を実務的な要件へ再設計した。

## 完了内容

1. 全100問を走査し、Q.66〜Q.68でSQL参照テーブルと`sourceTables`の不一致を確認した。
   - 対象: Q.66（`bball-066`）、Q.67（`bball-067`）、Q.68（`bball-068`）
   - 走査結果をIssue #97へ記録した。
2. Q.66〜Q.68の問題文、`sourceTables`、正解SQL・判定SQLの結合条件を整合させた。
3. 問題文全体へ表現修正を波及させた。
   - テーブル名・テーブル識別子が残っていた10問を修正
   - 「選手ID〜を取得してください。」型の出力項目指定98件を「必要な情報は〜です。」へ統一
   - 「10件取得してください」など取得件数を表す文言は維持
4. Q.68を次の要件へ再設計した。
   - 2025-26シーズンの各試合・各チームの先発5人を確認する
   - 必要な情報は試合日、チーム名、選手ID、得点
   - `g.season = '2025-26'`と`s.is_starter = 1`を条件にする
   - 任意の`LIMIT 10`を削除
   - 難易度2のため並び順は不問
5. 先発条件を含む類似問題を確認した。
   - `mvp-010`は20得点以上という抽出条件があり、実務上の目的が明確なため対象外
   - `bball-056`は先発かつ出場した選手の別問題であり、今回の対象外
   - `bball-068`のみ、先発記録を任意の10件取得する要件として修正対象とした

## 検証

- `python3 Apps/scripts/generate_problems.py --write`（100問生成、全100問SQLite検証に成功）
- Q.68の結果: 7,980行、798試合、1,596試合チーム組み合わせ
- Q.68の各試合・チームの先発人数: 最小5人、最大5人
- `git diff --check`に成功
- STG反映前後のコミットを確認

## STG・本番反映

- STG反映コミット: `2fc7819edab4af784e3b2e64555199db9c471f3`
- 本番昇格PR [#98](https://github.com/tj-999-comp/query_learning_BB/pull/98)を作成し、マージした
- Production反映コミット: `599454aae51b0d6b2a90f77638cb7d742dbdd49d`
- 本番反映後の[Validate source](https://github.com/tj-999-comp/query_learning_BB/actions/runs/34311773575)は成功した
- [Production URL](https://query-learning-bb.pages.dev/)が未認証アクセスにHTTP 401 Basic認証を返すことを確認した
- Issue #97へ調査結果、修正結果、STG反映、本番反映のコメントを追加した

## GitHub Issue状況

2026-09-09 13:55:28 JST時点で、Pull Requestを除くオープンIssueは3件だった。GitHub APIの取得結果と以下の一覧件数は一致している。各Issueについてsub-issues APIを確認し、親子関係は確認できなかった。

| 順位 | 優先度 | GitHub Issue | 状態 | 関係・着手条件 |
| --- | --- | --- | --- | --- |
| 1 | 未設定 | [#97 [v2.0.4] Q.66〜Q.68の問題文と使用テーブルを整合する](https://github.com/tj-999-comp/query_learning_BB/issues/97) | OPEN | 本作業の対象Issue。v2.0.4の本番反映まで完了。クローズは別承認が必要 |
| 2 | 未設定 | [#96 [v2.0.3] 問題文に指定のない並び順をSQL基準から除外する](https://github.com/tj-999-comp/query_learning_BB/issues/96) | OPEN | v2.0.3の本番反映済み。クローズは別承認が必要 |
| 3 | 未設定 | [#95 [v2.0.2] 問題文に指定のない並び順を正解判定から除外する](https://github.com/tj-999-comp/query_learning_BB/issues/95) | OPEN | v2.0.2の本番反映済み。クローズは別承認が必要 |

Issue #95〜#97は、本番反映後もユーザーからクローズの明示依頼がないためOPENのままとした。

## 関連Issue・PR・コメント

- [Issue #97](https://github.com/tj-999-comp/query_learning_BB/issues/97)
- [改修前の走査結果コメント](https://github.com/tj-999-comp/query_learning_BB/issues/97#issuecomment-5595654274)
- [全体波及の追加修正コメント](https://github.com/tj-999-comp/query_learning_BB/issues/97#issuecomment-5595774729)
- [Q68再設計の走査コメント](https://github.com/tj-999-comp/query_learning_BB/issues/97#issuecomment-5595809568)
- [Q68再設計・検証結果コメント](https://github.com/tj-999-comp/query_learning_BB/issues/97#issuecomment-5595818139)
- [STG反映コメント](https://github.com/tj-999-comp/query_learning_BB/issues/97#issuecomment-5595821843)
- [本番反映コメント](https://github.com/tj-999-comp/query_learning_BB/issues/97#issuecomment-5595885173)
- [本番昇格PR #98](https://github.com/tj-999-comp/query_learning_BB/pull/98)
