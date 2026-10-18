# Scan Pop — エージェント向け参照メモ

Next.js App Routerで作る、スキャンに反応するQR表示アプリです。

## 画面

- `/`: URL、見出し、メッセージ、背景、紙吹雪を編集します。保存後のプレビューのQRは `/go/:screenId` を使い、スマホでリンクを開くとプレビューでも紙吹雪が出ます。転送先は保存時に更新します。編集内容と編集用トークンはメモリ内で保持し、リロードすると新規作成状態に戻ります。
- `/screen/:screenId`: QRを表示します。スマホでリンクを開くと、表示画面の左右下から紙吹雪が出ます。

テキスト入力は入力直後にプレビューへ反映し、フォーカスが外れた時点で保存します。背景・紙吹雪の選択はクリック時に反映します。有効な設定は自動保存し、開いている表示ページにも配信します。保存開始時に表示ページを開くボタンへチェックアイコンと「保存しました」を1秒間表示します。保存中もボタンは操作できます。表示ページのURLには編集権限を含めません。

## 設定の状態管理

編集するプロジェクト設定はJotai 3で管理します。atomはモジュールスコープで定義し、src/jotai/ にまとめます。

```text
src/
  jotai/atoms.ts                       # 下書き、設定ごとのatom、保存状態
  hooks/use-save-screen.ts             # 保存の検証・通信・保存順序の制御
  hooks/use-screen-setting.ts          # 設定の更新と自動保存
  schemas/screen.ts                    # API・サーバー・画面で共有する設定の型と検証
  features/settings/link-setting.tsx   # リンク先の設定
  features/settings/text-setting.tsx   # 見出し・メッセージの設定
  features/settings/theme-setting.tsx  # 背景テーマの設定
  features/settings/confetti-setting.tsx # 紙吹雪の設定
  features/settings/setting-field.tsx  # 設定欄の共通レイアウト
  features/editor-header/index.tsx     # 編集画面の操作ボタン
  features/signage/index.tsx           # 編集プレビュー・表示ページ共通のQR表示と演出
  features/editor/index.tsx            # 編集画面と読み取り通知のみのSSE購読
  features/display/index.tsx           # 表示画面と設定同期を含むSSE購読
  app/                                # Next.jsのページとRoute Handler
```

- ルートの`Provider`でストアを分離します。サーバーでリクエスト間にストアを共有しません。
- 編集設定と保存済み画面情報は通常のatomでメモリ内に保持します。localStorageやCookieには保存せず、リロードや新しいタブでは初期状態から始まります。
- 各設定項目は狭い読み書き可能な派生atomを使います。読み取り専用は`useAtomValue`、操作だけなら`useSetAtom`、両方必要なら`useAtom`を使います。
- 保存処理は`useSaveScreen`にまとめ、atomは状態だけを管理します。設定項目は`useScreenSetting`を通じて更新・保存します。テキストはonChangeで設定atomを更新し、onBlurで保存します。背景・紙吹雪はクリックで更新・保存します。保存中の保存要求は現在のリクエストが完了してから最新の要求内容を続けて保存し、入力中の未確定の編集は送信しません。入力途中の不正な設定は下書きに残し、有効になるまでAPIへ送りません。保存したテキストの前後の空白は除去しますが、入力中の下書きは書き換えません。
- ブラウザAPIを使う編集画面はNext.jsの`dynamic`で`ssr: false`を指定して描画します。コピー完了など、その場だけのUI状態はコンポーネントの`useState`に置きます。
- クラッカーの配色はクライアントの設定では数値IDで管理し、src/features/signage/confetti.tsx に4色ずつの配色を配列で定義します。IDは0から始まる配列のインデックスです。保存hookで4個のHEX値（#RRGGBB）の配列へ変換して送信します。API・Redis・SSEは配列を扱い、描画にもその配列を使います。
- 公開設定の保存先はRedisです。表示ページはSSEで届く公開設定を使い、編集用ストアには依存しません。

設計の参照元: [Composing atoms](https://jotai.org/docs/guides/composing-atoms)、[Performance](https://jotai.org/docs/guides/performance)、[Provider](https://jotai.org/docs/core/provider)、[Storage](https://jotai.org/docs/utilities/storage)。

## 開発

Node.js 22.12以上、npm、Redisが必要です。

```sh
npm ci
cp .env.example .env.local
mkdir -p work/redis
redis-server --bind 127.0.0.1 --port 6387 --appendonly yes --dir work/redis
```

別のターミナルで起動します。

```sh
npm run dev -- --hostname 0.0.0.0
```

ローカル開発のRedisは127.0.0.1:6387を使い、永続化ファイルは `work/redis/` に保存します。起動状態は実行前に確認します。

スマホで試す場合は、PCとスマホを同じネットワークにつなぎ、Next.jsが出力する **Network URL** をPC側で開いてからQRを表示してください。localhostで表示したQRはスマホからアクセスできません。

## 通知の仕様

1. QRには `/go/:screenId` を埋め込みます。
2. スマホのGETアクセスでRedis Streamsへイベントを追加し、指定URLへ302で転送します。
3. 編集画面と表示画面は `/api/events/:screenId` をSSEで購読します。購読処理は共通化せず、編集画面は `scan` のみ、表示画面は `ready`・`scan`・`config` を扱います。
4. サーバーが `XREAD BLOCK` でイベントの追加を待ち、そのままSSEへ流します。
5. 接続は30秒で終了します。`retry: 0` によりEventSourceが再接続します。
6. 再接続時はLast-Event-IDより新しく、復帰時点から2秒以内のイベントだけを再送します。初回接続は接続時点以降のイベントを受信します。
7. 紙吹雪の動きを減らすOS設定を尊重します。

Redisのサーバー時刻を基準に再送範囲を計算します。表示画面ごとに独立したStreamを使い、専用のRedis接続で待ち受けます。購読にConsumer Groupは使わないため、同じQRを複数画面で表示しても各画面へ通知されます。

検知対象はカメラの認識ではなく、転送用URLへのアクセスです。再読み込みや一部のプレビューによるアクセスでも演出が発生します。

## 検証

Redisを起動した状態で実行します。テストは作成した専用データだけを削除し、DB全体の初期化は行いません。

```sh
npm test
npx tsc --noEmit
npm run build
```

テストには、即時配信、2秒以内の未受信分の再送、古い通知と受信済み通知の除外、設定配信、30秒後の接続終了を含みます。最後のテストのため約30秒かかります。

## 本番ビルドと公開

create-next-appの空テンプレートを土台に既存画面と機能をコピーしています。`npm run build` はNext.jsのstandalone出力（`.next/standalone`）を生成します。`npm start` で本番サーバーを起動できます。

公開用RedisはUpstashへTCP＋TLSで接続します。`REDIS_URL` は公開先の機密環境変数で管理し、REST API用のURL・トークンは使いません。ローカルの `.env.local` も現在Upstashに接続しています。ローカルRedisを使う場合は `.env.example` の接続先へ変更してください。

公開先はロリポップ！デプロイナウ、プロジェクト名は `qr-pop`、IDは `01M577HPCGBGSH19NTKG6G9WC5` です。公開URLは https://qr-pop.lolipop-now.app 。`REDIS_URL` は機密環境変数として設定済みです。

フレームワーク設定は `next`、インストールは `npm ci --ignore-scripts`、ビルドは `npm run build`、出力は `.next/standalone` を指定します。

`lolipop deploy --project 01M577HPCGBGSH19NTKG6G9WC5` で公開し、完了後に保存、`/go/:screenId` のリダイレクト、SSEの即時配信を確認します。GitHubリポジトリは https://github.com/itta611/scan-pop です。CLIでの公開とGitHubの自動デプロイ連携は別です。
