# 寿命・並行処理・テスト

## リソース

`acquireRelease`で取得と解放を結び、`Effect.scoped`で利用全体を囲む。取得直後にscopeを閉じて生の資源だけ返さない。成功・失敗・中断で解放を確認する。finalizerは短く、終了方針を明確にする。

Scopeは実行中の解放を管理するが、プロセス強制終了後の補償や分散トランザクションを保証しない。外部書込みの照合・永続状態は別に設計する。全処理をuninterruptibleにせず、必要な短い整合性区間へ限定する。

## 並行処理と状態

通常は`Effect.forEach`/`Effect.all`の有限な`concurrency`を明示する。無制限のfan-outや`Promise.all`でEffectの管理外へ逃がさない。並列数はレート制限でも共有予算でもないので、それぞれ別に制限する。

失敗時に全体を止めるのか、期待する失敗だけ結果として収集するのかを選ぶ。後者は各要素をResult化してから集め、defect/中断は伝搬する。全体停止すべきquotaやbudgetを局所的失敗として握りつぶさない。

子fiberは親・scopeへ結び付ける。v4の`forkChild`等を確認する。detachedな実行をタイムアウトの抜け道にしない。ホストのリクエスト終了後も継続する保証はEffectだけでは得られない。

プロセス内の共有状態にはRef、複数段階の非同期更新には適切な同期を使う。`get`と`set`を別に行うread-modify-writeは競合し得る。RefやSemaphoreは別インスタンス・別マシン間の排他や永続予算にはならない。

大きな結果、連続データ、ページングにはStreamのbackpressureを検討する。有限小配列に不要なStreamを導入しない。入力件数、buffer、body sizeを制限し、無制限runCollectを避ける。

## 観測

固定operation名のspan、request ID、tag、回数、所要時間、終了理由を必要最小限で記録する。トークン・全ヘッダー・検索本文・Notion本文・生のCauseを無条件に出さない。trace引数やSDKの自動ログも確認する。外部の有料観測基盤は前提にしない。

## 検証する

- パッケージの公開型と実装例を対象バージョンでコンパイルする。既存typecheck/testを優先し、不要なtest runnerを増やさない。
- 小さなサービスをLayer.succeed等で差し替えて、成功、不正応答、選択的回復、未処理エラーを確認する。
- `runPromiseExit`で型付き失敗、defect、中断を個別に確認する。
- acquisition/release数、失敗・中断時のfinalizerを確認する。
- retryの初回を含む呼出し数、上限、対象外タグで0回の再試行、予算不足で送信しないことを確認する。
- 時間依存はv4の`effect/testing`のTestClock.layerを供給する。対象処理をforkし、時計を進め、join/awaitする。時計だけ進める前に実行を開始する。native setTimeoutやSDK独自時計は自動的に仮想化されない。
- 既存Vitestなら互換版の@effect/vitestを検討するが、node:testでも実行できる。
- 外部APIの課金・実行副作用を生じないfakeを標準とし、live検証は別の証拠として報告する。
