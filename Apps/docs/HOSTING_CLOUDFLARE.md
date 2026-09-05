# Cloudflare Pages公開方針

## 採用構成

- ホスティング: Cloudflare Pages Free
- 公開方式: GitHub連携による`main`ブランチの自動デプロイ
- PagesのRoot directory: `Apps`
- Build command: `bash scripts/build-pages.sh`
- Build output directory: `public`
- Pages configuration: `Apps/wrangler.toml`にも出力先を固定
- 認証: Pages Functionsの全体middlewareによるHTTP Basic認証
- 学習情報: Pages Functionsの`/api/progress`とCloudflare KVによる端末間同期
- 公開URL: 初期はCloudflare提供の`*.pages.dev`。カスタムドメインは後続で検討する

## Secret

Cloudflare Pagesの本番環境に、次の2つをSecretとして登録する。値はリポジトリ、公開ファイル、ビルドログへ保存しない。

- `BASIC_AUTH_USERNAME`
- `BASIC_AUTH_PASSWORD`

## 進捗同期の設定

v0.6.0以降、学習情報は同じBasic認証ユーザーの端末間で同期する。Pages Functionsの`/api/progress`が、認証済みリクエストのユーザー名をハッシュ化したキーでCloudflare KVへ達成状況とお気に入りだけを保存する。パスワード、SQL本文、回答履歴は保存しない。

DashboardからBindingsを追加できない場合は、Wrangler設定を正本として運用する。`Apps`ディレクトリで `npx wrangler kv namespace create PROGRESS_KV` を一度実行し、表示されたNamespace IDを`Apps/wrangler.toml`へ次の形式で追加する。

```toml
[[kv_namespaces]]
binding = "PROGRESS_KV"
id = "取得したNamespace ID"
```

その変更をCommitして`main`へPushすると、Git連携のPagesがWrangler設定を含むProduction deploymentを作成する。`npx wrangler pages deployment list --project-name query-learning-bb`で、対象CommitのDeploymentが`Active`になったことを確認する。KV NamespaceのIDや認証情報はリポジトリへ保存しない。バインディング未設定時はアプリがlocalStorageへフォールバックするため、公開後に同期状態が「端末間で同期されます」と表示されることを確認する。

Preview環境をProductionと分離する場合は、Preview用Namespaceを別途作成し、Wranglerの`[[env.preview.kv_namespaces]]`で`PROGRESS_KV`を上書きする。環境設定を上書きする場合は、Cloudflare公式の非継承キーの注意事項を確認する。既存のWrangler設定を保持するため、`npx wrangler pages download config`は実行しない。

同じBasic認証情報で利用する端末が同じ進捗を共有する。初回同期時は既存localStorageとサーバー状態を統合し、その後はサーバー状態を正本とする。通信障害時はローカル変更を保持して復旧後に再送する。

Secretが未設定の場合は認証を通さず、500で停止する。認証済みレスポンスも`private, no-store`とし、Basic認証付きのコンテンツをキャッシュさせない。

## 公開対象

`build-pages.sh`は、公開用`public/`へ次だけをコピー・生成する。

- `index.html`
- `app.js`
- `styles.css`
- `data/problems.json`
- `data/bleague.sqlite` またはPagesの上限に合わせたSQLiteチャンク
- `data/db-manifest.json`
- `_headers`

CSV、CSV取り込みスクリプト、テーブル定義、要件書などは公開成果物に含めない。SQLiteが用意されていない場合は、8つのCSVからビルド時に生成する。

確定SQLiteが25MiBを超える場合、ビルドスクリプトは20MiB以下のチャンクへ分割し、ブラウザ側で結合してからsql.jsへ渡す。これによりR2などの追加サービスを使わず、Pages Freeの1ファイル上限内で配信する。

## 初回設定

1. Cloudflare DashboardでPagesプロジェクトを作成する。
2. GitHubリポジトリ`tj-999-comp/query_learning_BB`を接続する。
3. 上記のRoot directoryとBuild commandを設定する。Build output directoryが表示される場合は`public`を入力する（表示されない場合も`Apps/wrangler.toml`で固定される）。
4. Production環境へ2つのSecretを登録する。
5. `main`からデプロイする。
6. 認証なしで401、正しい認証情報で200になることを確認する。

Preview deploymentを利用する場合もSecretを個別に設定する。設定漏れのPreviewは500で停止するため、不要ならPreviewの自動デプロイを無効にする。

## 運用確認

公開後は、認証確認に加えて次を確認する。

- SQLiteと問題定義が読み込まれる
- SQL実行・正誤判定・進捗同期（または同期失敗時のlocalStorageフォールバック）が動く
- `/data/csv/`、`/scripts/`、`/docs/`などの内部パスが存在しない
- PCとiPadで主要フローが完了する
- `main`への変更が意図した公開物だけを更新する

Cloudflare公式ドキュメント:

- [PagesのGit連携](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Pages FunctionsのWrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
- [Pages Functionsのmiddleware](https://developers.cloudflare.com/pages/functions/middleware/)
- [Workers KVのNamespace作成](https://developers.cloudflare.com/kv/get-started/)
- [Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
