---
name: write-effect-typescript
description: Effectを使うTypeScriptの実装・レビュー・リファクタリングを行う。Effect.gen/fn、型付きエラー、Promise境界、Context/Layer、Schema、Scope、並行処理、retry/timeout、テストの設計時に使う。Netzでは無料枠・共有予算・Notionの重複防止も適用する。対象プロジェクトの導入済みバージョンを確認し、v3とv4を混同しない。
---

# Effect TypeScript for Claude Code

最初に、この入口からの相対パスで [共通スキル](../../../.agents/skills/write-effect-typescript/SKILL.md) を全文読み、その手順を実行する。共通スキルを読めない場合は、その旨を報告し、記憶だけで代替しない。

共通スキル内の `references/` と `assets/` の相対パスは、`.agents/skills/write-effect-typescript/` を基準に解決する。この入口のディレクトリを基準にしない。必要な参考資料だけを追加で読む。

ユーザーの依頼・引数を共通スキルに従って扱う。ライブラリの導入や更新を呼び出しだけで自動実行しない。
