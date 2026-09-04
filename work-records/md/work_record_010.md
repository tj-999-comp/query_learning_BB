# 作業記録 010: #11 Basic認証付き公開環境の最終スモークテスト

作成日: 2026-09-04

## 背景

Issue #11「MVPをBasic認証付きで公開し最終スモークテストする」に対応し、#6で決定したCloudflare Pages構成へ、#10・#13・#12までの確定内容を反映して公開環境を確認した。

## 公開構成

- 公開URL: https://query-learning-bb.pages.dev/
- ホスティング: Cloudflare Pages Free
- Root directory: `Apps`
- Build output: `public`
- 認証: Pages Functionsの全体middlewareによるHTTP Basic認証
- 認証情報: Production Secretで管理し、リポジトリ・公開ファイル・作業記録には保存しない

検証済みの`main`をGitHubへpushし、PagesのGit連携による更新を反映した。公開URLで最新のlocalStorage保存不可時の処理も読み込まれることを確認した。

## 受入確認

- 認証なしのトップページは`401 Unauthorized`となり、`WWW-Authenticate: Basic`が返ることを確認した。
- 認証なしでトップ、問題JSON、SQLite経路、CSV経路、スクリプト経路、ドキュメント経路を確認し、すべて認証で保護されていることを確認した。
- 認証後は`200`となり、`Cache-Control: private, no-store`、Content-Security-Policy、`X-Content-Type-Options`などのセキュリティヘッダーを確認した。
- 認証後のページでSQLiteの準備完了、問題10問の表示、SQLiteチャンクの読み込みを確認した。
- Q01で誤答が不正解になること、正解SQLで正解・参考SQL・解説が表示されることを確認した。
- 正解後の達成状況とお気に入りがページ再読み込み後も復元されることを確認した。
- 768x1024のiPad相当幅で横方向のはみ出しがないことを確認した。
- `/data/csv/Supabase_games.csv`、`/scripts/build-pages.sh`、`/docs/MVP_REQUIREMENTS.md`は、認証後も実ファイルではなくアプリHTMLのフォールバックまたは未配置として扱われ、CSV・スクリプト・要件書本文が公開されていないことを確認した。
- Playwrightの認証後スモークテストでconsole error、page error、failed requestはすべて0件だった。

## 判定

Basic認証なしのアクセス拒否、認証後のHTTPSアクセス、SQLite・問題データの配信、主要なSQL学習フロー、進捗保存、iPad相当幅の表示、内部ファイル非公開を確認し、Issue #11の受入条件を満たした。

Issue #11へ受入確認結果をコメントし、2026-09-04にクローズした。

## 検証証跡

- 認証なしHTTP確認: `https://query-learning-bb.pages.dev/`および内部パスへの401応答
- 認証後Playwrightシナリオ: `/private/tmp/playwright-browser-verify/scenario-2026-09-04T03-51-31-252Z/scenario-report.json`
- 認証後iPad相当幅スクリーンショット: `/private/tmp/playwright-browser-verify/scenario-2026-09-04T03-51-31-252Z/issue11-public-ipad.png`
- `python3 scripts/dev/validate_work_records.py`
- `git diff --check`

認証情報およびCloudflare API tokenは、ファイルやログへ保存していない。Wranglerによるデプロイ履歴照会はAPI token未設定のため実施せず、公開URLの認証後レスポンスとブラウザ動作を最終確認とした。

## 関連ファイル・Issue

- [`Apps/docs/HOSTING_CLOUDFLARE.md`](../../Apps/docs/HOSTING_CLOUDFLARE.md)
- [`Apps/functions/_middleware.js`](../../Apps/functions/_middleware.js)
- [`Apps/scripts/build-pages.sh`](../../Apps/scripts/build-pages.sh)
- [#6 ホスティング先とBasic認証方式の決定・受入確認](./work_record_004.md)
- [#8 MVP完了に向けた残作業の整理・完了管理](https://github.com/tj-999-comp/query_learning_BB/issues/8)

## GitHub Issue状況

2026-09-04 12:51:55 JST に `tj-999-comp/query_learning_BB` のOpen IssueをPull Requestを除いて取得した（取得件数: 2件）。Issue #8のsub-issues APIを確認したが、返却は0件だった。取得時点では全Issueのstate reasonが未設定だった。#11は本作業でクローズ済みである。

| 順位 | 優先度 | GitHub Issue | 状態 | 関係・着手条件 |
|---:|---|---|---|---|
| 1 | 高 | [#8](https://github.com/tj-999-comp/query_learning_BB/issues/8) | OPEN（state reason未設定） | #11、#12、#13、#14、#10、#9の完了結果を確認し、MVP全体を完了判定する。GitHub上のsub-issuesは未登録。 |
| 2 | 中 | [#11](https://github.com/tj-999-comp/query_learning_BB/issues/11) | CLOSED | 本作業。Basic認証付き公開環境の最終スモークテストが完了した。 |
