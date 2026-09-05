# 作業記録 026: Issue #49 進捗・お気に入りの端末間同期

作成日: 2026-09-05

## 背景

Issue #49「v0.6.0 進捗・お気に入りの端末間同期」に対応した。従来は達成状況とお気に入りをlocalStorageにだけ保存していたため、Mac・iPad mini・業務用Windowsで保存状態を共有できなかった。

## 変更内容

- Cloudflare Pages Functionsに認証済みユーザー向け`/api/progress`を追加した。
- Basic認証のユーザー名をSHA-256でハッシュ化したKVキーを使い、達成状況とお気に入りだけをCloudflare KVへ保存するようにした。
- クライアント起動時にサーバー状態を読み込み、初回または未同期状態ではlocalStorageと統合して保存するようにした。
- 通常時はサーバー状態を正本とし、同期API障害時はlocalStorageへ保存して復旧後に再送するようにした。
- APIでJSON形式、保存サイズ、保存項目を検証し、パスワード・SQL本文・回答履歴を保存しないようにした。
- 同期状態を学習情報モーダルへ表示し、Cloudflare KV binding `PROGRESS_KV` の設定手順をドキュメント化した。
- アプリ表示をv0.6.0へ更新した。

## 検証

- `node --check Apps/app/app.js`
- `node --check Apps/functions/_middleware.js`
- `node --check Apps/functions/api/progress.js`
- `git diff --check`
- `bash Apps/scripts/build-pages.sh`
- Cloudflare KVを模したAPIスモークテストで、GET、PUT、認証、Content-Type検証を確認した。
- Playwrightのレスポンシブ検証（1280px、900px、640px、320px）でHTTP 200、横方向のはみ出しなし、page errorなしを確認した。静的サーバーではAPIがないためlocalStorageフォールバックとなる。
- PlaywrightでlocalStorageのお気に入り保存とリロード後の復元を確認した。
- PlaywrightのモックAPIで初回のローカル・サーバー状態統合、PUT、同期完了表示を確認した。

## 関連ファイル

- [`Apps/functions/api/progress.js`](../../Apps/functions/api/progress.js)
- [`Apps/app/app.js`](../../Apps/app/app.js)
- [`Apps/app/index.html`](../../Apps/app/index.html)
- [`Apps/docs/HOSTING_CLOUDFLARE.md`](../../Apps/docs/HOSTING_CLOUDFLARE.md)
- [`Apps/docs/MVP_REQUIREMENTS.md`](../../Apps/docs/MVP_REQUIREMENTS.md)
- [#49](https://github.com/tj-999-comp/query_learning_BB/issues/49)

## 未完了の運用作業

- Cloudflare DashboardでProduction（および利用するPreview）にKV Namespaceを`PROGRESS_KV`としてバインドする。
- 本番Basic認証下でMac・iPad mini・Windows間の同期を確認する。
