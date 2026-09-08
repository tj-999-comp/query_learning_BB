# 作業記録 039: Issue #87 v2.0.1丸め条件と解答基準の整合

作成日: 2026-09-08

## 背景

Q.17（`bball-017`）で、問題文に平均得点の丸め条件がないにもかかわらず、小数点以下1桁の出力が実質的に必須になっていた。問題文に書かれていない丸めを正誤条件にしない方針に合わせ、同様の問題を全体走査した。

## 完了内容

- 平均値と`ROUND`を含む14問を全体走査した。
- 星3以下の問題は、問題文に丸め条件を明記せず、丸めない平均値を基準にした。Q.17と同じ小数点以下1桁の問題は`numericTolerance: 0.05`とし、丸めた解答も許容する。
- 星3以下の小数点以下2桁系は、丸めない基準値と既存の`numericTolerance: 0.01`で、丸めた解答を許容する形に整理した。`bball-099`は既存の許容差で条件を満たしていることを確認した。
- 星4の`bball-026`、`bball-029`、`bball-030`には小数点以下2桁の丸め条件を問題文へ明記し、`numericTolerance: 0`で厳密判定するようにした。
- 問題生成スクリプトに、難易度・問題文・`ROUND`・`numericTolerance`の整合性検証を追加した。
- 問題作成ガイドへ丸め条件の運用ルールを追記し、表示バージョンをv2.0.1へ更新した。
- [Issue #87](https://github.com/tj-999-comp/query_learning_BB/issues/87)をクローズした。

## STG・本番反映

- STG反映PR [#88](https://github.com/tj-999-comp/query_learning_BB/pull/88)を`stg`へマージした。
- STG確認済みコミットは`660ef8d0418534b69916bce20bc629d99f75c756`、Preview deploymentは`f2b6b766-3be0-4201-9246-54ddcd495cb9`である。
- ユーザーの明示承認後、本番昇格PR [#89](https://github.com/tj-999-comp/query_learning_BB/pull/89)を`main`へマージした。
- Production反映コミットは`803b539a4c394b6516731099cf3dce610ef0c4dc`、Production deploymentは`10c34af9-05cd-4d11-9a7b-d305ada01bec`で、`Active`を確認した。
- [Production URL](https://query-learning-bb.pages.dev/)が未認証アクセスに`401 Basic認証`を返すことを確認した。

## 検証

- `python3 Apps/scripts/generate_problems.py --write`
- `python3 Apps/scripts/generate_problems.py`（100問をSQLiteで検証）
- `bash Apps/scripts/build-pages.sh`（100問題ページを生成）
- Q.17と同型の丸めた解答が許容差内で受理されることを確認
- PR #88、#89の`Validate source`成功を確認
- STG・ProductionのCloudflare Pages deployment状態を確認

## 関連Issue・PR

- [#87 v2.0.1: 問題文と解答基準の丸め条件を整合させる](https://github.com/tj-999-comp/query_learning_BB/issues/87)
- [#88 v2.0.1: 丸め条件と解答基準を整合](https://github.com/tj-999-comp/query_learning_BB/pull/88)
- [#89 v2.0.1: STG確認済み問題修正を本番へ反映](https://github.com/tj-999-comp/query_learning_BB/pull/89)
