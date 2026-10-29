# 公式資料とバージョンの確認

調査日: 2026-10-29。公式v4ガイドを横断し、Netzのeffect 4.1.0の公開ソース・型定義で実例を検証した。以下は読み直すための索引。公式のAPI仕様、そこから導いた設計上の推奨、Netz固有制約を分けて扱う。

## 読んだ公式ガイド

- [code-style/guidelines](https://effect.website/docs/v4/code-style/guidelines)
- [error-management/expected-errors](https://effect.website/docs/v4/error-management/expected-errors)
- [error-management/retrying](https://effect.website/docs/v4/error-management/retrying)
- [error-management/timing-out](https://effect.website/docs/v4/error-management/timing-out)
- [requirements-management/services](https://effect.website/docs/v4/requirements-management/services)
- [requirements-management/layers](https://effect.website/docs/v4/requirements-management/layers)
- [requirements-management/layer-memoization](https://effect.website/docs/v4/requirements-management/layer-memoization)
- [resource-management/scope](https://effect.website/docs/v4/resource-management/scope)
- [concurrency/basic-concurrency](https://effect.website/docs/v4/concurrency/basic-concurrency)
- [concurrency/fibers](https://effect.website/docs/v4/concurrency/fibers)
- [schema/basic-usage](https://effect.website/docs/v4/schema/basic-usage)
- [configuration](https://effect.website/docs/v4/configuration)
- [runtime](https://effect.website/docs/v4/runtime)
- [observability/logging](https://effect.website/docs/v4/observability/logging)
- [observability/tracing](https://effect.website/docs/v4/observability/tracing)
- [testing/testclock](https://effect.website/docs/v4/testing/testclock)
- [state-management/ref](https://effect.website/docs/v4/state-management/ref)
- [stream/introduction](https://effect.website/docs/v4/stream/introduction)
- [data-types/redacted](https://effect.website/docs/v4/data-types/redacted)

## API確認の順序

1. lockfileと実際に解決されたeffect/package.jsonを確認する。package.jsonの範囲指定だけでは確定しない。
2. [バージョン付きAPIリファレンス](https://effect.website/docs/v4/api)を参照する。
3. `node_modules/effect/src`があるなら`Effect.ts`, `Context.ts`, `Layer.ts`, `Schema.ts`, `testing/TestClock.ts`の公開API・例を明示的に検索する。node_modulesを通常のrgで探すと無視される点に注意する。
4. 必要なら[公式リポジトリ](https://github.com/Effect-TS/effect)の該当release/tagのソースとテストを読む。未確認のmainを導入済み版と同一視しない。ライブラリ全体のvendor化は必須でなく、ユーザーのリポジトリ方針に従う。
5. 型チェックと小さなbehavior testを実行し、未確認API名をスキルの記憶だけで補わない。

[公式のAgent向け記事](https://effect.website/blog/the-one-weird-git-trick-that-makes-coding-agents-more-effect-ive)は実ソース・利用例をAgentへ提供する方法を推奨している。本スキルでは必要な公開ソースを確認し、実例で検証する運用にする。

## v3の記憶が混ざりやすい箇所

| 用途 | このスキルで確認したv4 API |
|---|---|
| サービスキー | Context.Service |
| 全型付きエラーの捕捉 | Effect.catch |
| 成功/型付き失敗を値にする | Effect.result / Result |
| 子fiber | Effect.forkChild |
| unknownのdecode | Schema.decodeUnknownEffect |
| テスト時計 | effect/testing の TestClock.layer() |

これは移行対応表の完全版ではない。旧Context.Tag、catchAll、Either、forkなどを見つけても機械的な置換をせず、対象版と意味を確認する。

実例の再検証: assetsの2ファイルを対象プロジェクトでモジュール解決できる作業用ディレクトリへ置き、既存tsconfigに合うstrictな型チェックと `node --import tsx --test patterns.test.ts` を実行する。tsxがない環境では既存runnerを使う。テストのために本番APIを呼ばない。空フィールドのTaggedErrorコンストラクターも公開型で確認する（この4.1.0の例では引数なし）。
