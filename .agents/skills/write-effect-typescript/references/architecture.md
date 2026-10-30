# 構成と境界

以下は公式のサービス・Layer・Schema・Runtimeの説明を踏まえた推奨。絶対的なスタイル規則ではなく、既存設計に合わせて適用する。

## 処理の形

`Effect.gen`は依存する処理を読み下す場合に向く。`Effect.fn`は引数を取る処理の境界を作り、名前付き形式はspanを作る。すべての小関数へspanを増やさない。名前は固定し、入力本文やIDをspan名へ埋め込まない。

`Effect.succeed(f())`はfをその場で評価する。I/Oを遅延したい場合、例外が起きない同期処理に`sync`、起き得るものに`try`、Effectを毎回作り直す場合に`suspend`を使う。`async function`を`Effect.gen`へ渡さない。

## サービスとLayer

v4では`Context.Service`を使う。キーは名前空間付きの一意な文字列にする。巨大なEnvサービスや汎用的すぎるexecuteサービスを避け、利用者が必要とする操作を定義する。

- 業務処理はサービスのインターフェースへ依存する。
- 実装は構築時に他サービスを取得して閉じ込める。通常、サービス操作のRは`never`にし、内部依存を呼び出し側へ漏らさない。意図した呼出し時依存がある場合は理由を明示する。
- 既にある値は`Layer.succeed`、Effectによる構築は`Layer.effect`を使う。v4のScope付き構築は導入済みLayerのシグネチャを確認する。v3の`Layer.scoped`を無条件にコピーしない。
- `Layer.provide`で必要な入力を満たし、`Layer.merge`で出力を組み合わせる。供給した依存を出力にも残す必要がある場合だけ`provideMerge`等を確認する。
- 同じグラフで共有したいLayerは同じインスタンスを再利用する。毎回factoryを呼ぶと参照同一性によるメモ化が効かない。局所的なprovideを繰り返しても自動的な全体singletonにはならない。
- リクエストの認証情報、可変予算、利用者別状態をアプリ全体のLayerへ閉じ込めない。アプリ共有資源とリクエスト固有資源を分ける。

## データと設定

HTTP body、Queue payload、SDK/MCP応答、永続データを信用しない。`Schema.decodeUnknownEffect(schema)(input)`で検証し、`typeof schema.Type`から型を得る。SchemaErrorの全文には入力が含まれ得るので公開レスポンスへ転記しない。

存在確認、長さ・件数、範囲、URLの許可範囲、業務上の整合性も検証する。TypeScriptのブランドやcastは実行時検証の代わりにならない。decode/encodeの向きと保存する形式を明示する。

設定は起動・リクエスト入口で検証する。認証必須値へ便宜的なデフォルトを入れない。Configの`withDefault`と不正値まで回復する`orElse`を混同しない。Workers bindingsを扱う場合はNodeのprocess.envを前提にしない。

`Redacted`は表示上の漏えいを減らす仕組みであり、暗号化やアクセス制御ではない。元文字列をログ・causeに入れれば保護されない。明示的な取り出しは送信直前に限定する。

## 実行境界

依存を提供したEffectを入口で一度実行する。詳細な終了理由が必要なら`runPromiseExit`を選ぶ。全Causeを調べず最初のエラーだけを取り出すと、複合したdefect/中断を見落とす。境界の優先順位を定めてテストする。

Node CLIの`NodeRuntime.runMain`とHTTPハンドラーのPromise境界は用途が異なる。ManagedRuntimeを導入するなら寿命とdispose責任を定める。単発処理に必要以上のruntime管理を追加しない。
