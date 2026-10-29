# Proposal: Netzのテーマ調査Agent Workflow

## Why

Issue #1〜#7で定義した要件を、実装中にも更新できる仕様・設計・検証タスクへ対応づける。
テーマごとに十分条件を先に定義し、証拠を集めてNotionへレポートを保存するMVPを実装するための変更として管理する。

## What Changes

- 本人専用HTTP API、計画確認、設定済みMCPを使う調査、十分条件の評価、Notionレポートを仕様化する。
- 追加費用ゼロ・全経路共通の予算・状態再開・重複防止を横断契約にする。
- 実装中の発見はdesign、要件変更はdelta specsとシナリオ、進捗はtasksへ反映する。
- 本導入PRは仕様と開発環境のみ。ランタイムのMVP実装・外部サービス設定・デプロイを完了扱いにしない。

## Capabilities

### New Capabilities

- `private-research-api`: 本人専用の依頼・計画確認・状態参照。
- `research-planning`: 目的・範囲・問い・十分条件・承認。
- `research-tools`: MCP/直接経路の採用・選択・取得・追跡。
- `evidence-research`: 根拠付き判定・追加調査・停止・部分結果。
- `cost-and-budget`: 無料枠・共通予算・永続状態・再試行。
- `notion-reporting`: レポート保存・重複防止・応答喪失の回復。

### Modified Capabilities

なし。既存のmain specsはまだない。これらは実装予定のADDED差分であり、完了までarchiveしない。

## Impact

- Issue #1〜#7: https://github.com/UtakataKyosui/Netz/issues
- 今後の実装対象: src/index.ts、src/notion.ts、実行状態管理、ツールアダプター、wrangler設定、README。
- 採用前の外部検証: MCP Portal、Tavily Free、推論モデル、無料枠内の実行・永続化方式。
- 新たな有料契約・マルチユーザー・ボット入口・任意の書き込みツールは対象外。
