# v2.0.0 問題別ページ化のURL・配信方式

作成日: 2026-09-07

## 結論

問題ごとに静的HTMLを生成し、次のURLを正規URLとして採用する。

```text
/problems/{problemId}/
```

ビルド成果物では、各URLに対応する次のファイルを生成する。

```text
public/problems/{problemId}/index.html
```

`{problemId}`には、`Apps/data/problems.json`に登録された一意な問題IDをそのまま使用する。現在のIDは`mvp-001`や`bball-011`のように小文字英数字とハイフンで構成されており、URLセグメントとして利用できる。

## 採用理由

- 問題ごとに固有のURLを持てる
- Cloudflare Pagesの静的ファイル探索に任せられるため、問題数分のリダイレクト設定が不要
- `/problems/{problemId}/`への直接アクセスとリロードを、問題ページの`index.html`で受けられる
- 問題ページをブックマークしたり、URLを共有したりできる
- 問題ページ生成時に問題IDをHTMLへ埋め込めるため、JavaScriptがURLのクエリやハッシュに依存しない
- 100問程度ではHTMLの複製コストが小さく、Pagesの静的アセット制約内で扱いやすい

Cloudflare Pagesは、要求されたパスに対応するHTMLファイルを提供し、`/about/index.html`のようなファイルを`/about/`として扱う。したがって、問題ページのディレクトリに`index.html`を置く方式が、Pagesの標準的なルーティングと一致する。

## 比較した方式

| 方式 | 評価 | 採否 | 理由 |
|---|---|---|---|
| 問題ごとの`index.html`を生成 | 固有URL、直接アクセス、静的ホスティングとの相性がよい | 採用 | 生成処理は必要だが、Pagesの標準ルーティングで完結する |
| 1つの`index.html`＋クエリ／ハッシュ | 実装変更が少ない | 不採用 | URLは分かれてもドキュメントは1つで、今回のページ分割の目的を十分に満たさない |
| `_redirects`の200プロキシで1ページへ集約 | ページ複製を避けられる | 不採用 | ルール依存となり、静的ファイルの存在とURLの対応が分かりにくい。Pages側の制限にも依存する |
| Pages Functionsで動的に問題ページを返す | 動的なURL解決が可能 | 不採用 | 個人向け静的サイトとしては実装・運用の複雑さが増え、SQL学習画面に必要ない |

## ページ構成

### 公開成果物

```text
public/
├── index.html                         # ホーム
├── app.js                             # 共通アプリケーションロジック
├── styles.css                         # 共通スタイル
├── 404.html                           # 不正な問題IDなどのエラー表示
├── data/
│   ├── problems.json
│   ├── db-manifest.json
│   └── bleague.sqlite またはチャンク
└── problems/
    ├── mvp-001/
    │   └── index.html
    ├── mvp-002/
    │   └── index.html
    └── ...
```

問題ページのHTMLは問題ごとに生成するが、問題データ・SQLite・JavaScript・CSSは共通のルート配下を参照する。問題ページには問題IDを`data-problem-id`などの形で埋め込み、アプリ起動時に対象問題を選択する。

### アセット基準

現在のソース画面は`Apps/app/`から`../data`を参照するが、公開ビルドでは`public/index.html`と`public/data/`が同じ階層にある。問題ページはさらに`public/problems/{problemId}/`に配置されるため、ページ階層ごとの相対パスを暗黙に持たせない。

後続Issueでは、次のいずれかの方法で公開ルートを明示する。

- HTMLへページごとのアプリルートを埋め込み、`dataRoot`と共通アセットURLをそこから解決する
- 問題ページでは`../../data`、`../../app.js`、`../../styles.css`を生成時に指定し、ホームでは`./data`などを指定する

採用する実装方法は、共通レイアウト実装時に決める。ただし、公開ビルドで`public/index.html`から`../data`を参照し続けないことを必須とする。

## 404と直接アクセス

- `public/404.html`を生成し、存在しない問題IDや未定義のパスに対してホーム／問題一覧へ戻れる導線を表示する
- 問題IDが存在する場合は、Cloudflare Pagesが`public/problems/{problemId}/index.html`を返す
- 問題IDが存在しない場合は、アプリ側の問題ID検証とPagesの404表示を組み合わせる
- `_redirects`で全問題を1つのHTMLへ書き換える方式は採用しない

Cloudflare Pagesでは、トップレベルの`404.html`がない場合にSPAとして扱われる既定挙動があるため、問題ID不正時の扱いを明確にするためにも`404.html`を公開成果物へ含める。

## ビルド方針

後続のビルド実装では、次の順序で公開成果物を作る。

1. `public/`を再生成する。
2. 共通アセット、`data/`、`_headers`を配置する。
3. ホームの`index.html`を配置する。
4. 問題定義を読み込み、問題IDの形式・一意性を検証する。
5. 問題テンプレートから`problems/{problemId}/index.html`を全件生成する。
6. `404.html`を配置する。
7. 生成された問題数、問題ID、URL、参照アセットの欠落・重複を検証する。

問題IDは少なくとも次の条件を満たさない場合、ビルドを失敗させる。

```text
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

## 既存状態との互換性

- `localStorage`の進捗・お気に入りキーは変更しない
- `/api/progress`のパス、Cloudflare KVの保存形式、Basic認証は変更しない
- 問題IDを進捗・お気に入りのキーとして引き続き使用する
- ホームと問題ページで同じ`app.js`の学習処理を利用する
- 問題ページを直接開いた場合も、問題一覧・前後移動・SQL実行・正誤判定を利用できるようにする

## 検証結果と残作業

- `Apps/data/problems.json`は100問で、問題IDは100件すべて一意だった
- 現行ビルドは`public/index.html`へ`Apps/app/app.js`をコピーするが、`app.js`の`DATA_ROOT`は`../data`を参照している。問題ページ化に先立ち、公開ルートからのデータ参照を修正する必要がある
- Cloudflare Pagesの公開環境での直接アクセス、リロード、404表示は、問題ページ生成後にIssue #70の受入テストで確認する

## 関連Issue

- 親Issue：[Issue #65](https://github.com/tj-999-comp/query_learning_BB/issues/65)
- 本Issue：[Issue #66](https://github.com/tj-999-comp/query_learning_BB/issues/66)
- 次工程：[Issue #67](https://github.com/tj-999-comp/query_learning_BB/issues/67)
- 全問題生成：[Issue #68](https://github.com/tj-999-comp/query_learning_BB/issues/68)

## 参照した公式仕様

- [Cloudflare Pages: Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- [Cloudflare Pages: Redirects](https://developers.cloudflare.com/pages/configuration/redirects/)
- [Cloudflare Pages: Limits](https://developers.cloudflare.com/pages/platform/limits/)
