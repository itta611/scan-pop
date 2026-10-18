# QR Pop — エージェント向け参照メモ

TanStack Startで作る、スキャンに反応するQR表示アプリです。

## 画面

- `/`: URL、見出し、メッセージ、背景、紙吹雪を編集します。下書きと編集用トークンはブラウザに保存します。
- `/screen/:screenId`: QRを表示します。スマホでリンクを開くと、表示画面の左右下から紙吹雪が出ます。

テキスト入力はフォーカスが外れた時点で反映し、背景・紙吹雪の選択はクリック時に反映します。有効な設定は自動保存し、開いている表示ページにも配信します。保存中は表示ページを開くボタンに「保存しています」とローダーを表示します。表示ページのURLには編集権限を含めません。

## 設定の状態管理

編集するプロジェクト設定はJotai 3で管理します。atomはモジュールスコープで定義し、機能に関係するファイルの近くへまとめます。この配置はプロジェクトに合わせた選択で、Jotaiが固定のディレクトリ構成を指定しているわけではありません。

```text
src/features/screens/
  atoms.ts            # 下書き、設定ごとのatom、派生値、保存アクション
  schema.ts           # サーバーと共有する設定の型・検証
  screen-settings.tsx  # 必要なatomを直接購読する設定項目
  setting-field.tsx    # 状態を持たない共通フィールド
  qr-stage.tsx         # propsを受け取るQR表示・演出
```

- ルートの`Provider`でストアを分離します。サーバーでリクエスト間にストアを共有しません。
- 非公開の`atomWithStorage`が、従来と同じ`qrpop.editor`キーと`{ config, saved }`形式で下書きを保存します。既存の下書きと編集用トークンを引き継ぎ、別タブの変更にも同期します。
- 各設定項目は狭い読み書き可能な派生atomを使います。読み取り専用は`useAtomValue`、操作だけなら`useSetAtom`、両方必要なら`useAtom`を使います。
- 保存は`saveScreenAtom`にまとめます。テキストはonBlur、背景・紙吹雪はクリックで設定atomを更新して保存を開始し、保存中の編集は現在のリクエストが完了してから最新の内容を続けて保存します。入力途中の不正な設定は下書きに残し、有効になるまでAPIへ送りません。保存したテキストの前後の空白は除去しますが、入力中の下書きは書き換えません。
- ブラウザ保存値を使う編集画面は`ClientOnly`内で描画します。コピー完了など、その場だけのUI状態はコンポーネントの`useState`に置きます。
- 公開設定の保存先はRedisです。表示ページはSSEで届く公開設定を使い、編集用ストアには依存しません。

設計の参照元: [Composing atoms](https://jotai.org/docs/guides/composing-atoms)、[Performance](https://jotai.org/docs/guides/performance)、[Provider](https://jotai.org/docs/core/provider)、[Storage](https://jotai.org/docs/utilities/storage)。

## 開発

Node.js 22.12以上、pnpm 12.3.4、Redisが必要です。

```sh
pnpm install
cp .env.example .env.local
mkdir -p work/redis
redis-server --bind 127.0.0.1 --port 6387 --appendonly yes --dir work/redis
```

別のターミナルで起動します。

```sh
pnpm dev --host 0.0.0.0
```

ローカル開発のRedisは127.0.0.1:6387を使い、永続化ファイルは `work/redis/` に保存します。起動状態は実行前に確認します。

スマホで試す場合は、PCとスマホを同じネットワークにつなぎ、Viteが出力する **Network URL** をPC側で開いてからQRを表示してください。localhostで表示したQRはスマホからアクセスできません。

## 通知の仕様

1. QRには `/go/:screenId` を埋め込みます。
2. スマホのGETアクセスでRedis Streamsへイベントを追加し、指定URLへ302で転送します。
3. 表示画面は `/api/events/:screenId` をSSEで購読します。
4. サーバーが `XREAD BLOCK` でイベントの追加を待ち、そのままSSEへ流します。
5. 接続は30秒で終了します。`retry: 0` によりEventSourceが再接続します。
6. 再接続時はLast-Event-IDより新しく、復帰時点から2秒以内のイベントだけを再送します。初回接続は接続時点以降のイベントを受信します。
7. 紙吹雪の動きを減らすOS設定を尊重します。

Redisのサーバー時刻を基準に再送範囲を計算します。表示画面ごとに独立したStreamを使い、専用のRedis接続で待ち受けます。購読にConsumer Groupは使わないため、同じQRを複数画面で表示しても各画面へ通知されます。

検知対象はカメラの認識ではなく、転送用URLへのアクセスです。再読み込みや一部のプレビューによるアクセスでも演出が発生します。

## 検証

Redisを起動した状態で実行します。テストは作成した専用データだけを削除し、DB全体の初期化は行いません。

```sh
pnpm test
pnpm exec tsc --noEmit
pnpm build
```

テストには、即時配信、2秒以内の未受信分の再送、古い通知と受信済み通知の除外、設定配信、30秒後の接続終了を含みます。最後のテストのため約30秒かかります。

## デプロイナウへの公開

ローカルのRedisは公開先から接続できません。公開時は、TLS接続と `XREAD BLOCK` に対応する外部Redisを用意し、デプロイナウの環境変数 `REDIS_URL` に接続URLを設定します。接続情報はクライアントへ配信しません。

公開先の対応状況、ビルド・起動方式、SSEの即時配信は、デプロイ時に確認します。
