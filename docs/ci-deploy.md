# CIとデプロイ

Issue: https://github.com/UtakataKyosui/Netz/issues/12
OpenSpec: `openspec/changes/add-quality-and-deploy-ci/`

## 品質チェック

PRとmainへのpushで`.github/workflows/quality.yml`の共通ジョブを呼び出す。
ロックファイルで固定したBiome、fallow、TypeScript、OpenSpec、Wranglerを使う。

```bash
pnpm install --frozen-lockfile
pnpm check:biome
pnpm check:fallow
pnpm typecheck
pnpm test
OPENSPEC_TELEMETRY=0 pnpm check:spec
pnpm build
```

整形と安全なlint修正は`pnpm format`。CIは修正せず、違反で失敗する。
fallowはまずdead-codeを品質ゲートにし、未使用コード・依存を検出する。
`--fail-on-issues`を明示する。複雑度や重複の閾値は今回導入しない。

生成された`worker-configuration.d.ts`、Agent用資料・実例の`.agents/`と`.claude/`はアプリの品質解析から除外する。
実行入口は`src/index.ts`と`tests/**/*.test.ts`。現状の`src/notion.ts`はIssue #6で接続予定の未使用ファイルのため、
そのファイルに由来するdead-code指摘だけを`ignoreFindings`で一時除外する。解析グラフと依存解析には残し、接続時に例外を削除する。
Effect基盤はテストから参照されるが、これはHTTP/Queueとの接続や本番準備完了の証明ではない。

## デプロイ準備

現在のHTTP/Queueハンドラーは未認証のテンプレートで、全ヘッダーのQueue送信・本文ログが残る。
品質チェックが成功しただけで公開しない。以下を完了してからproductionの準備完了変数を設定する。

1. Issue #3/#5/#6/#7の必要な受入条件を満たし、Owner認証のfail-closed、秘密情報の非記録、永続予算・冪等性を確認する。
2. 対象CloudflareアカウントでFreeプランと、Worker・Queues・Workers AI等の採用サービスの無料枠と枠切れ時停止を確認する。有料への変更はしない。GitHub側も標準ubuntu runnerの無償利用対象・上限を確認する。
3. `wrangler.jsonc`のWorker名、`my-queue`等を実際のリソース名へ確定し、既存リソース・Bindingsの利用可否を確認する。このActionはインフラを自動作成しない。
4. GitHub Environment `production`を作り、可能ならデプロイブランチをmainへ制限する。
5. Environment secretsに`CLOUDFLARE_API_TOKEN`と`CLOUDFLARE_ACCOUNT_ID`を登録する。トークンは対象アカウントのみ、Workerのデプロイと設定済みBindingsに必要な権限へ絞る。秘密をコード・ログへ貼らない。
6. アプリ用のNotion/Owner/MCP等の秘密はCloudflare Worker secretsへ別途設定する。デプロイ認証のAPI tokenとは別物で、このActionから自動転送しない。
7. 上記を満たした時点でproduction Environment variable `DEPLOYMENT_READY`を文字列`true`にする。これは所有者の準備完了宣言であり、自動検証ではない。

## 実行

mainへマージ後、GitHub Actionsの「Deploy Worker」をmainから手動実行する。
準備完了判定、同じrevisionの品質チェック、資格情報の存在確認を経てロック済みWranglerでデプロイする。
PRやmain pushだけではデプロイしない。productionのデプロイは直列化し、実行中のデプロイは新しい実行で中断しない。
準備完了変数を外せば、それ以後のデプロイ実行を止められる。既に稼働中のWorkerの停止操作にはならない。

`pnpm build`はローカルのdry-runであり、Cloudflare認証、リソース存在、無料枠適合、実接続の検証は行わない。
実デプロイと接続確認は所有者が準備後に実施し、その結果をIssue #12/#7へ記録する。

## 公式資料

- https://biomejs.dev/recipes/continuous-integration/
- https://fallow.tools/docs/integrations/ci/
- https://fallow.tools/docs/configuration/overview/
- https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/
- https://developers.cloudflare.com/workers/platform/limits/

BiomeのnoBannedTypesはEffect公式パターンの空フィールドTaggedErrorと衝突するため、`src/errors.ts`だけで無効化する。ほかのファイルでは推奨ルールを維持し、警告もCIを失敗させる。
