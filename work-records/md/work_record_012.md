# 作業記録 012: バージョン方針の策定と次期改善Issue #26〜#34の起票

作成日: 2026-09-04

## 背景

MVP完了後の改善要望を段階的に進めるため、リリースバージョンの定義を決め、各課題をバージョン別のGitHub Issueとして起票した。

## 決定事項

標準的な `MAJOR.MINOR.PATCH` 形式を採用する。

- `MAJOR`: 大きな仕様変更、互換性を壊す変更
- `MINOR`: 利用者向けの新機能・機能群の追加
- `PATCH`: バグ修正、文言修正、軽微な見た目修正

現在のMVPは `v0.1.0` と定義する。MVPには、10問の問題一覧、SQL入力・実行、実行結果表示、結果ベースの正誤判定、参考SQL・解説、達成状況・お気に入り・正解数の保存、読み取り専用SQL制限、Basic認証付き公開を含める。

次期バージョンは以下のとおり定義する。

| バージョン | 定義 |
|---|---|
| v0.1.0 | SQL学習サイトMVP。現在の確定済みMVPを対象とする |
| v0.2.0 | 学習画面UX改善。達成表示、前後移動、問題一覧ドロワー、左右2ペイン、結果ペイン内スクロール |
| v0.3.0 | SQLエディタ強化。構文ハイライト、Tabインデント、Cmd/Ctrl+Enter実行 |
| v0.4.0 | SQL入力補完。SQLキーワード、テーブル名、カラム名の補完 |
| v0.5.0 | 問題コンテンツ拡充。主題一覧ドキュメントから問題を追加できる仕組み |
| v1.0.0 | 上記機能を安定版として提供できる状態 |

各バージョンは、対象Issueの受入条件、回帰確認、作業記録、Gitタグを揃えた時点で完了とする。

## 起票したIssue

親Issueとして、次期フェーズ全体を管理する #26 を起票した。子Issueは本文に親Issue URLを記載して関連付けた。

### v0.2.0 学習画面UX改善

| Issue | 内容 | 優先度 |
|---:|---|---|
| [#27](https://github.com/tj-999-comp/query_learning_BB/issues/27) | 達成済み表示をコンパクトなチェックアイコンに変更 | P1 |
| [#28](https://github.com/tj-999-comp/query_learning_BB/issues/28) | 次の問題・前の問題への移動を追加 | P1 |
| [#29](https://github.com/tj-999-comp/query_learning_BB/issues/29) | 問題一覧をハンバーガーメニュー内のドロワーへ移動 | P0 |
| [#30](https://github.com/tj-999-comp/query_learning_BB/issues/30) | エディタと実行結果を左右2ペインで表示 | P0 |
| [#31](https://github.com/tj-999-comp/query_learning_BB/issues/31) | 実行結果を結果ペイン内でスクロール可能にする | P0 |

### v0.3.0 SQLエディタ強化

| Issue | 内容 | 優先度 |
|---:|---|---|
| [#32](https://github.com/tj-999-comp/query_learning_BB/issues/32) | SQLエディタを高機能エディタへ置き換える | P0 |

### v0.4.0 SQL入力補完

| Issue | 内容 | 優先度 |
|---:|---|---|
| [#33](https://github.com/tj-999-comp/query_learning_BB/issues/33) | SQL構文・テーブル名・カラム名の補完を追加 | P1 |

### v0.5.0 問題コンテンツ拡充

| Issue | 内容 | 優先度 |
|---:|---|---|
| [#34](https://github.com/tj-999-comp/query_learning_BB/issues/34) | 主題一覧ドキュメントをもとに問題を追加できる仕組みを作る | P1 |

親Issue:

- [#26 次期フェーズ：SQL学習体験の改善と問題コンテンツ拡充](https://github.com/tj-999-comp/query_learning_BB/issues/26)

## 推奨着手順

1. #27 達成済み表示の改善
2. #28 前後の問題への移動
3. #29〜#31 問題画面のレイアウト再設計
4. #32 SQLエディタ強化
5. #33 SQL入力補完
6. #34 問題コンテンツ拡充

## Sub-issue登録について

GitHubの `repos/tj-999-comp/query_learning_BB/issues/26/sub_issues` への登録を試みたが、各リクエストがHTTP 404となった。GitHub上の正式なSub-issue階層は確認できていないため、本記録では本文リンクによる関連付けのみを記載する。親Issue本文への子Issueリンク追記はAPI接続不安定により反映確認できていない。

## 確認結果

- `gh issue create` の返却URLにより、#26〜#34の9件を起票したことを確認した。
- 起票済みIssueはすべてOpenとして取得できた時点があったが、作業記録作成直前の再取得はAPI接続エラーとなったため、最新のstateとstate reasonは再確認できていない。
- コード変更は行っていない。
- 本作業ではGitタグを作成していない。MVP `v0.1.0` はバージョン定義上の基準として扱う。

## GitHub Issue状況

2026-09-04 13:27:21、13:27:27、13:27:36〜13:27:37 JSTに、Pull Requestを除く `tj-999-comp/query_learning_BB` のOpen Issue再取得を試みたが、すべて `error connecting to api.github.com` で失敗した。したがって、下表の状態は推測せず「未確認」とする。Issueのタイトル・URLは起票コマンドの返却結果に基づく。

取得件数: 未確認（API接続失敗）。次回、以下を再実行して状態を更新する。

```bash
gh issue list --repo tj-999-comp/query_learning_BB --state open --json number,title,state,stateReason,url --limit 1000
gh api repos/tj-999-comp/query_learning_BB/issues/26/sub_issues
```

| 順位 | 優先度 | GitHub Issue | 状態 | 関係・着手条件 |
|---:|---|---|---|---|
| 1 | 高 | [#27](https://github.com/tj-999-comp/query_learning_BB/issues/27) | 未確認（API取得失敗） | v0.2.0。最初に着手する。 |
| 2 | 高 | [#28](https://github.com/tj-999-comp/query_learning_BB/issues/28) | 未確認（API取得失敗） | v0.2.0。#27後に着手する。 |
| 3 | 高 | [#29](https://github.com/tj-999-comp/query_learning_BB/issues/29) | 未確認（API取得失敗） | v0.2.0。#28後、#30・#31と同一フェーズで着手する。 |
| 4 | 高 | [#30](https://github.com/tj-999-comp/query_learning_BB/issues/30) | 未確認（API取得失敗） | v0.2.0。#29と同一フェーズで着手する。 |
| 5 | 高 | [#31](https://github.com/tj-999-comp/query_learning_BB/issues/31) | 未確認（API取得失敗） | v0.2.0。#30を前提とする。 |
| 6 | 高 | [#32](https://github.com/tj-999-comp/query_learning_BB/issues/32) | 未確認（API取得失敗） | v0.3.0。v0.2.0完了後に着手する。 |
| 7 | 中 | [#33](https://github.com/tj-999-comp/query_learning_BB/issues/33) | 未確認（API取得失敗） | v0.4.0。#32を前提とする。 |
| 8 | 中 | [#34](https://github.com/tj-999-comp/query_learning_BB/issues/34) | 未確認（API取得失敗） | v0.5.0。主題一覧ドキュメントの所在確定後に着手する。 |
| 9 | 高 | [#26](https://github.com/tj-999-comp/query_learning_BB/issues/26) | 未確認（API取得失敗） | 次期フェーズ全体の管理Issue。#27〜#34と本文リンクで関連付ける。 |
