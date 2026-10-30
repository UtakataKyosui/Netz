---
name: write-effect-typescript
description: Effectを使うTypeScriptの実装・レビュー・リファクタリングを行う。Effect.gen/fn、型付きエラー、Promise境界、Context/Layer、Schema、Scope、並行処理、retry/timeout、テストの設計時に使う。Netzでは無料枠・共有予算・Notionの重複防止も適用する。対象プロジェクトの導入済みバージョンを確認し、v3とv4を混同しない。
---

# Effect TypeScript

## 最初に確認する

1. 対象リポジトリのAGENTS.md、仕様、package.json、lockfile、実際のeffectパッケージを読む。依存の更新を勝手に行わない。
2. バージョン、実行環境、外部入出力、許される失敗と副作用を特定する。このスキルの例は **effect 4.1.0** で検証したもの。v3や後続版では該当版の公式資料・公開型定義を確認する。
3. [資料とバージョン確認](references/sources.md)から関係する公式章を読む。ガイドと導入済みAPIが違う場合は、公開型定義・公式の同版ソース／テストで確認して小さくコンパイルする。旧版の記憶でAPIを補わない。
4. `UtakataKyosui/Netz`の作業なら[Netzの制約](references/netz.md)とリポジトリの最新仕様も読む。他のプロジェクトへNetz固有ルールを持ち込まない。

## 実装する

- 公開する処理を `Effect.Effect<A, E, R>` として設計する。公開サービス境界は型を明示し、内部は推論を活用する。`any`、二重キャスト、偽の`never`でエラーや依存を隠さない。
- 複数の依存する処理は `Effect.gen` と `yield*` で順に書く。再利用する業務操作には `Effect.fn("Service.operation")` を検討する。単純な変換は `map`、副作用の観測は `tap`、ポリシーの付加は `pipe` に置く。純粋関数まで無理にEffect化しない。
- 明示的な引数付きコールバックを優先し、過度なネストやpoint-freeな式を避ける。短さより型推論と処理順の読みやすさを選ぶ。
- 外部のPromise・同期例外を最小のアダプターで取り込む。処理を遅延し、キャンセルを伝搬する。[エラーと再試行](references/errors.md)を読む。
- 外部データを`unknown`で受け、Schemaで検証してから業務型へ進める。必要な仕様の検証は構造チェックだけで済ませない。
- 依存を小さなContextサービスとして定義し、Layerで構築する。[構成と境界](references/architecture.md)を読む。
- リソースと子タスクの所有者・寿命・並列数を明示する。[実行寿命と検証](references/lifecycle-testing.md)を読む。
- `runPromise`等はHTTP、Queue、CLI、テストなどの外側で呼ぶ。内部で実行→Promise化→再Effect化を繰り返さない。Node用`runMain`をWorkersへ持ち込まない。

## レビューする

次を仕様に照らして確認し、問題のある箇所と具体的な修正を示す。

| 観点 | 確認すること |
|---|---|
| 型 | A/E/Rが実態を表し、期待する失敗がタグで識別できるか |
| 境界 | I/Oは遅延され、拒否・不正応答・中断が区別されるか |
| 回復 | 捕捉するエラーに回復根拠があり、defectを成功にしていないか |
| 再試行 | 冪等性、回数、時間、予算、SDK側再試行を一体で制限したか |
| 寿命 | acquire/release、子fiber、AbortSignalの所有者が明確か |
| データ | 入力と外部応答を検証し、秘密をログ・trace・公開エラーへ出していないか |
| 依存 | テスト用Layerへ交換でき、リクエスト情報を共有しないか |
| 検証 | 型チェックに加えて失敗・中断・解放・試行数を確認したか |

[検証済みの短い実例](assets/patterns.ts)を出発点にする。これは完全なHTTPクライアントや本番実装ではない。付随する[実例テスト](assets/patterns.test.ts)はネットワークを使わず、依存注入・Schema・解放・中断・retry・TestClockを確かめる。

## 完了を報告する

採用したパターンと理由、対象Effectバージョン、実施したチェック、未検証の実環境を短く報告する。スキル・型チェックの成功をデプロイや外部サービスの動作証明として扱わない。
