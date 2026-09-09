# 作業記録 041: Issue #96 v2.0.3問題文とSQL基準の並び順整合

作成日: 2026-09-09

- 対象リポジトリ: `tj-999-comp/query_learning_BB`
- 対象Issue: [#96](https://github.com/tj-999-comp/query_learning_BB/issues/96)

## 背景

Q.63は問題文に出力の並び順指定がないにもかかわらず、解答SQL・判定SQLに`ORDER BY`が含まれていた。難易度2で問題文に並び順指定がない場合は、SQL基準にも順序を持たせず、並び順を前提にしない方針へ整合した。

## 完了内容

1. 全100問を走査した。
   - 難易度2かつ問題文に並び順指定がない問題: 26件
   - そのうち解答SQL・判定SQLに`ORDER BY`が残っていた問題: 25件
   - 25件はいずれも`resultSpec.rowOrder: insensitive`
   - 難易度3以上で問題文に並び順指定がない問題: 0件
2. 走査結果をIssue #96へコメントした。
3. Q.63を含む対象25件について、解答SQL・判定SQLから不要な`ORDER BY`を除去した。
4. `requiredSqlTerms`に残っていた`ORDER BY`関連の学習必須語も除去した。
5. Q.63（`bball-063`）には`resultSpec.rowOrder: insensitive`を問題単位で明示した。
6. `Apps/data/problems.json`を再生成した。

## STG・本番反映

- `stg`へコミット・push: `dbb09660f389a43877b27eb7795110a764a452a0`
- `main`へ反映・push: `c6e1b5d9eee4171f7273b2640e772dad6a3c2262`
- 本番反映後のGitHub Actions検証: [Validate source / run 34308848709](https://github.com/tj-999-comp/query_learning_BB/actions/runs/34308848709)（成功）

## 検証

- `python3 Apps/scripts/generate_problems.py --write`
  - 100問を生成し、全100問のSQLite検証に成功
- 改修後の並び順ポリシー走査に成功
  - 難易度2かつ問題文に並び順指定がなく、SQLに`ORDER BY`が残る問題: 0件
  - 難易度3以上で問題文に並び順指定がない問題: 0件
- `git diff --check`に成功
- `origin/stg`が`dbb09660f389a43877b27eb7795110a764a452a0`を指すことを確認
- `origin/main`が`c6e1b5d9eee4171f7273b2640e772dad6a3c2262`を指すことを確認
- `https://stg.query-learning-bb.pages.dev/`と`https://query-learning-bb.pages.dev/`は、未認証のHTTPアクセスに対してHTTP 401 Basic認証を返すことを確認

## GitHub Issue状況

2026-09-09 13:05:53 JST時点で、Pull Requestを除くオープンIssueは2件だった。GitHub APIの取得結果と以下の一覧件数は一致している。

| 番号 | 状態 | タイトル | URL |
| --- | --- | --- | --- |
| #96 | OPEN | [v2.0.3] 問題文に指定のない並び順をSQL基準から除外する | [Issue #96](https://github.com/tj-999-comp/query_learning_BB/issues/96) |
| #95 | OPEN | [v2.0.2] 問題文に指定のない並び順を正解判定から除外する | [Issue #95](https://github.com/tj-999-comp/query_learning_BB/issues/95) |

Issue #95・#96は、今回の改修内容を記録するためクローズせずOPENのままとした。

## 関連Issue・コメント

- [Issue #96](https://github.com/tj-999-comp/query_learning_BB/issues/96)
- [改修前の走査結果コメント](https://github.com/tj-999-comp/query_learning_BB/issues/96#issuecomment-5594986502)
- [改修結果コメント](https://github.com/tj-999-comp/query_learning_BB/issues/96#issuecomment-5595022433)
- [stg反映コメント](https://github.com/tj-999-comp/query_learning_BB/issues/96#issuecomment-5595032763)
- [関連Issue #95](https://github.com/tj-999-comp/query_learning_BB/issues/95)
