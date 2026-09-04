# 作業記録 004: #6 MVPホスティング先とBasic認証方式の決定・受入確認
作成日: 2026-09-04

## 背景

Issue #6「MVPホスティング先とBasic認証方式の検討」に対応し、無料枠で運用できる公開先、認証方式、秘密情報の管理方法を決定して実環境で確認した。

## 決定内容

- ホスティング先: Cloudflare Pages Free
- 公開方式: GitHub連携による `main` ブランチの自動デプロイ
- PagesのRoot directory: `Apps`
- Build command: `bash scripts/build-pages.sh`
- Build output directory: `public`
- 認証方式: Pages Functionsの全体middlewareによるHTTP Basic認証
- 認証情報: Cloudflare PagesのProduction環境Secretで管理

## 実施内容

- Cloudflare Workers & Pagesから、GitHubリポジトリ `tj-999-comp/query_learning_BB` をPagesプロジェクトへ接続した。
- プロジェクト名、Production branch、Root directory、Build command、Build output directoryを設定した。
- SQLiteがPagesのファイルサイズ制限を超えないように、ビルド時に20MiB以下のチャンクへ分割し、ブラウザ側で結合する公開成果物を生成した。
- `BASIC_AUTH_USERNAME` と `BASIC_AUTH_PASSWORD` をProduction環境のSecretとして登録した。
- HTTPSの公開URLへデプロイし、正しい認証情報でアクセスできることを確認した。

## 受入確認

- Basic認証なしのアクセスが拒否され、正しいユーザー名・パスワードで利用できることを確認した。
- HTTPSの公開URLで問題一覧が表示され、SQLiteを読み込んでSQLを実行できることを確認した。
- 認証後のページで進捗が表示され、ページを再読み込みしても進捗が保持されることを確認した。
- PCブラウザとiPadブラウザで主要な表示・SQL実行・進捗確認ができることを確認した。
- 公開成果物の確認により、CSV、CSV取込スクリプト、テーブル定義、要件書などを静的公開物へ含めていないことを確認した。
- 認証情報はリポジトリ、公開静的ファイル、作業記録、ビルドログへ保存していない。

## 運用手順

公開・更新設定と認証情報の変更方法は [`Apps/docs/HOSTING_CLOUDFLARE.md`](../../Apps/docs/HOSTING_CLOUDFLARE.md) に記載した。

## 判定

Issue #6の受け入れ条件を満たした。Cloudflare Pages Free、GitHub連携、Production SecretによるBasic認証の構成でMVP公開基盤を確定する。

## 関連Issue

- [#6 MVPホスティング先とBasic認証方式の検討](https://github.com/tj-999-comp/query_learning_BB/issues/6)
- [#11 MVPをBasic認証付きで公開し最終スモークテストする](https://github.com/tj-999-comp/query_learning_BB/issues/11)
