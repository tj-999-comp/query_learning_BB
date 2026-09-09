# 作業記録 040: Issue #95 v2.0.2問題文と正解判定基準の並び順整合

作成日: 2026-09-09
- 対象リポジトリ: `tj-999-comp/query_learning_BB`
- 対象Issue: [#95](https://github.com/tj-999-comp/query_learning_BB/issues/95)

## 背景

Q.61は問題文に出力の並び順指定がないにもかかわらず、解答・判定基準側のSQLに並び順が含まれている状態だった。難易度2の問題では並び順を指定しない場合、並び順に依存せず正解とする。一方、難易度3以上では問題文に並び順を明記し、指定した並び順を正解判定基準に含める方針とした。

## 完了内容

1. 全100問を走査し、問題文の並び順指定と `resultSpec.rowOrder`、解答SQL・判定SQLの整合を確認した。
2. 改修前の該当数をIssue #95へコメントした。
   - 問題文に並び順指定がない問題: 39問
   - 内訳: 難易度2が26問、難易度3が13問
   - そのうち並び順を正解判定に含めていた問題: 6問（Q.16、Q.91、Q.92、Q.93、Q.96、Q.99）
3. Q.61の問題文と正解判定基準を改修した。
   - 並び順を正解判定に含めない設定を明示
   - 基準となるSQLから不要な `ORDER BY` を除去
4. 難易度3の該当13問について、問題文に並び順を明記し、指定順を正解判定基準に反映した。
5. 改修後の走査で、問題文に並び順指定がない問題は難易度2の26問のみとなり、該当問題に並び順依存の判定基準がないことを確認した。

## Issue・ブランチ・本番反映

- Issue #95を作成し、走査結果コメントと改修結果コメントを追加した。
- `stg`へコミット・push: `e091b66789622a79cbf3a5cfc56d1c3b2c569f27`
- `main`へ反映・push: `77c5b5211e464d7232479c506b4fe4602badefd1`
- 本番反映後のGitHub Actions検証: [Validate source / run 34300485231](https://github.com/tj-999-comp/query_learning_BB/actions/runs/34300485231)（成功）

## 検証

- `python3 Apps/scripts/generate_problems.py --write`
  - 100問を生成し、全100問のSQLite検証に成功
- 改修後の並び順ポリシー走査に成功
- `git diff --check` に成功
- `origin/stg` が `e091b66789622a79cbf3a5cfc56d1c3b2c569f27` を指すことを確認
- `origin/main` が `77c5b5211e464d7232479c506b4fe4602badefd1` を指すことを確認
- `https://stg.query-learning-bb.pages.dev/` と `https://query-learning-bb.pages.dev/` は、未認証のHTTPアクセスに対してHTTP 401 Basic認証を返すことを確認
- 接続中のIn-app Browserでは両URLの画面確認時に `ERR_BLOCKED_BY_CLIENT` が発生したため、認証後の画面表示までは確認できていない

## GitHub Issue状況

2026-09-09 10:58:52 JST時点で、Pull Requestを除くオープンIssueは1件だった。GitHub APIの取得結果と以下の一覧件数は一致している。

| 番号 | 状態 | タイトル | URL |
| --- | --- | --- | --- |
| #95 | OPEN | [v2.0.2] 問題文に指定のない並び順を正解判定から除外する | [Issue #95](https://github.com/tj-999-comp/query_learning_BB/issues/95) |

Issue #95は今回の改修内容を記録するため、クローズせずOPENのままとした。

## 関連Issue・コメント

- [Issue #95](https://github.com/tj-999-comp/query_learning_BB/issues/95)
- [走査結果コメント](https://github.com/tj-999-comp/query_learning_BB/issues/95#issuecomment-5594349799)
- [改修結果コメント](https://github.com/tj-999-comp/query_learning_BB/issues/95#issuecomment-5594389991)
