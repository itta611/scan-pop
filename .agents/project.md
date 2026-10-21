# Scan Pop — エージェント向け参照メモ

Next.js App Routerで作る、スキャンに反応するQR表示アプリです。

## 画面

- `/`: URL、タイトル、メッセージ、背景、紙吹雪を編集します。URL欄の初期値は空文字列、placeholderは `https://scan.itta.dev` です。URLが空欄のときは保存時の転送先を `https://scan.itta.dev` にし、入力欄は空欄のまま維持します。URL欄が空または空白だけのときは、表示ページを開く・表示URLをコピーの両ボタンを無効にします。エディタの初期化時にプロジェクトID・編集用トークンをそれぞれUUID v4で発行し、即時にサーバーへ初期作成します。作成とSSEの `ready` 受信が完了したら、固定の `/go/:screenId` をQRに表示します。初回から読み取りで転送と紙吹雪が動作し、URLの編集や保存ではQRを変えません。転送先は保存成功時に更新します。編集内容と編集用トークンはメモリ内で保持し、リロードや別タブでは新しいUUIDで初期作成します。
- `/screen/:screenId`: QRを表示します。スマホでリンクを開くと、表示画面の左右下から紙吹雪が出ます。

すべての設定変更は直後にプレビューへ反映し、最後の変更から2秒間変更がなければ保存します。表示ページを開く操作では保存せず、固定のプロジェクトIDを使って表示ページを新しいタブで直接開きます。待機中の変更は通常の自動保存後に表示ページへ配信します。有効な設定は自動保存し、開いている表示ページにも配信します。保存可能な設定への変更直後から保存要求まで、表示ページを開くボタンのラベルを「保存しています...」にします。保存開始時にチェックアイコンと「保存しました」を1秒間表示します。アイコンと文字をひとまとまりでトランジションさせます。各状態を重ねて配置し、ボタンの幅を維持します。保存待ち・保存通知・コピー完了など通常以外のラベルはアイコンと文字をまとめてopacity-70で表示します。初期作成では表示しません。保存中もボタンは操作できます。タイトルが空など保存できない設定では、保存待ち表示をせず通常ラベルでボタンを無効にします。表示ページのURLには編集権限を含めません。

## 設定の状態管理

編集するプロジェクト設定など、複数箇所で共有する状態をJotai 3で管理します。atomはモジュールスコープで定義し、src/jotai/ にまとめます。コンポーネント専用の状態はローカルに置きます。

```text
src/
  jotai/atoms.ts                       # 下書き、設定ごとのatom、保存要求・保存済み設定
  hooks/use-save-screen.ts             # 保存の検証・通信・保存順序の制御
  hooks/use-autosave-screen.ts         # 最後の設定変更から2秒後に自動保存
  schemas/screen.ts                    # API・サーバー・画面で共有する設定の型と検証
  features/settings/link-setting.tsx   # リンク先の設定
  features/settings/text-setting.tsx   # 見出し・メッセージの設定
  features/settings/theme-setting.tsx  # 背景テーマの設定
  features/settings/confetti-setting.tsx # 紙吹雪の設定
  features/settings/setting-field.tsx  # 設定欄の共通レイアウト
  features/editor-header/index.tsx     # 編集画面の操作ボタン
  features/signage/index.tsx           # 編集プレビュー・表示ページ共通のQR表示と演出
  features/editor/index.tsx            # エディタ専用ストアとready・scanのSSE購読
  features/display/index.tsx           # 表示画面と設定同期を含むSSE購読
  features/signage/background.tsx      # 共通の曲線模様と5テーマの色
  app/                                # Next.jsのページとRoute Handler
```

- エディタ専用の`Provider`でストアを分離し、`atomWithLazy`でID・編集用トークンをストアごとに一度だけ初期化します。UUID生成にはHTTPのローカル開発環境でも使える`crypto.getRandomValues`を使います。サーバーでリクエスト間にストアを共有しません。
- 編集設定と保存済み画面情報は通常のatomでメモリ内に保持します。localStorageやCookieには保存せず、リロードや新しいタブでは初期状態から始まります。
- 各設定項目は狭い読み書き可能な派生atomを使います。読み取り専用は`useAtomValue`、操作だけなら`useSetAtom`、両方必要なら`useAtom`を使います。
- 保存処理は`useSaveScreen`にまとめ、`useAutosaveScreen`内で一度だけ保存hookを呼び出します。通信中のPromiseはhook内の`useRef`で保持し、Atomには置きません。保存要求の設定と保存済み設定はヘッダーも参照するため共有Atomに残します。設定項目は`useAtom`で即時更新し、編集画面の`useAutosaveScreen`で設定全体の変更を購読します。初期化時は待ち時間なしで初期作成し、以降は変更のたびに2秒の保存タイマーをリセットします。保存済みと同じ内容は送信しません。保存中の保存要求は現在のリクエストが完了してから最新の要求内容を続けて保存し、2秒経過前の編集は送信しません。入力途中の不正な設定は下書きに残し、有効になるまでAPIへ送りません。保存したテキストの前後の空白は除去しますが、入力中の下書きは書き換えません。
- ブラウザAPIを使う編集画面はNext.jsの`dynamic`で`ssr: false`を指定して描画します。コピー完了・保存通知は各ボタンの`useState`に置き、URL入力の有無と保存待ちの判定はヘッダー内で計算します。設定全体の有効性は自動保存とヘッダーで共有する派生Atomに置きます。
- クラッカーの配色はクライアントの設定では数値IDで管理し、src/features/signage/confetti.tsx に4色ずつの配色を配列で定義します。IDは0から始まる配列のインデックスです。保存hookで4個のHEX値（#RRGGBB）の配列へ変換して送信します。API・Redis・SSEは配列を扱い、描画にもその配列を使います。
- 保存APIは `PUT /api/screens/:screenId` に統一し、UUIDと `X-Edit-Token` を検証します。初回作成にはRedisの `SET NX` を使い、既存IDの更新は編集用トークンの一致を必須にします。公開設定の保存先はRedisです。`getRedis` は接続済みクライアントと接続中のPromiseを別々に管理し、切断済みなら次の取得時に再接続します。同時リクエストは接続処理を共有します。表示ページはSSEで届く公開設定を使い、編集用ストアには依存しません。

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
2. スマホのGETアクセスで、転送先の取得とRedis Streamsへのスキャン記録を1回のLuaスクリプトで処理し、指定URLへ302で転送します。転送先が存在しなければ404を返し、スキャン記録は作成しません。プリフェッチ用の分岐は設けません。
3. 編集画面と表示画面は `/api/events/:screenId` をSSEで購読します。購読処理は共通化せず、編集画面は `ready` でQR表示を開始し、`scan` で紙吹雪を出します。表示画面は `ready`・`scan`・`config` を扱います。
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

## 表示デザイン

背景の3つの模様は独立したSVGとして右上・左下・右下に固定します。サイネージ本体とエディタのプレビューでは表示枠の短辺（cqmin）、背景テーマ選択のサンプルでは長辺（cqmax）を基準に拡縮し、各コーナーを起点に高さ方向だけ1.2倍に伸ばします。背景はSVGの静かな曲線模様で、ペーパー・ミント・ミスト・ローズ・ナイトの5色から選びます。テーマはcvaのvariantで定義し、色にはTailwind標準のstone・emerald・sky・rose・zincのカラートークンを使います。表示ページと設定サンプルは同じBackgroundコンポーネントを使います。見出し・QR・案内文のサイズは表示枠の幅と高さに合わせ、縦長・横長の両方に対応します。

エディタのレイアウト切り替えはTailwind標準の `md`（768px）に統一します。PC表示ではmainをヘッダー・フッターを除く残りの高さに収め、右の編集ペインは内容が収まらない場合にペイン内で縦スクロールします。`md`未満ではプレビューと設定欄を縦並びにし、開くボタンの通常表示は「開く」と右矢印だけにします。保存時の「保存しました」は維持します。
