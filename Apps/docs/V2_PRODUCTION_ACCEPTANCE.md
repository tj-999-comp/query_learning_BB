# v2.0.0 Issue #70 本番受入確認

確認日: 2026-09-07

## 対象Deployment

- Cloudflare Pages project: `query-learning-bb`
- Environment: Production
- Branch: `main`
- Source commit: `2fb640f`
- Deployment URL: `https://7bdc57c9.query-learning-bb.pages.dev/`
- Canonical URL: `https://query-learning-bb.pages.dev/`

## 認証・HTTP確認

一時的に提供されたBasic認証情報を、読み取り確認とブラウザ受入テストの実行中だけ使用した。認証情報はリポジトリ、ファイル、作業記録へ保存していない。

| URL | 期待値 | 結果 |
|---|---:|---:|
| `/` | 200 | 200 |
| `/problems/mvp-001/` | 200 | 200 |
| `/data/problems.json` | 200 | 200 |
| `/api/progress` | 200 | 200 |
| `/problems/not-found/` | 404 | 404 |

認証情報なしでは、正規URL・問題URL・データURL・APIのいずれも401となり、Basic認証が有効であることを確認した。

## ブラウザ受入結果

認証付きChromiumで次の操作を確認した。

- ホームを直接開き、SQLite準備完了まで読み込める
- ホームの問題カードが`./problems/{problemId}/`を参照している
- `/problems/mvp-001/`を直接開き、問題IDと問題画面が表示される
- 問題ページからSQLiteを読み込み、進捗同期状態が「進捗とお気に入りは端末間で同期されます。」になる
- 問題ページをリロードしても問題画面が維持される
- 同一カテゴリの次問題へ移動できる
- 問題ページからホームへ戻れる
- ページエラー、リクエスト失敗、コンソールエラーが発生しない

ローカル環境では、Playwrightで1280px、900px、640px、320pxのレスポンシブ確認と、SQL実行・正誤判定・お気に入り・達成状態・SQL補完の回帰確認を実施済みである。

## 実行した確認

- `npx wrangler pages deployment list --project-name query-learning-bb`
- 認証付きHTTPステータス確認
- 認証付きProductionブラウザ受入シナリオ
- `bash Apps/scripts/build-pages.sh`
- `node --check Apps/app/app.js`
- `git diff --check`

## 判定

v2.0.0の問題別ページ化について、Cloudflare Pages本番環境での直接アクセス、リロード、問題間移動、ホーム復帰、SQLite読み込み、進捗同期表示を確認できたため、Issue #70の受入条件を満たした。

## 関連Issue

- 親Issue：[Issue #65](https://github.com/tj-999-comp/query_learning_BB/issues/65)
- 本Issue：[Issue #70](https://github.com/tj-999-comp/query_learning_BB/issues/70)
- URL方式：[Issue #66](https://github.com/tj-999-comp/query_learning_BB/issues/66)
- 全問題生成：[Issue #68](https://github.com/tj-999-comp/query_learning_BB/issues/68)
