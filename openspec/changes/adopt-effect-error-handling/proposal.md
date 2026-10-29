# Proposal: Effectのエラー処理基盤

## Why

無料枠切れ・一時障害・書き込み結果不明を同じ例外として再試行すると、予算超過や重複保存につながる。
MVP実装に先立ち、型付きエラーと安全な境界・回復方針を用意する。

## What Changes

- effect 4.1.0、型付きエラー、回復判断、HTTP用の安全な境界を追加する。
- 型チェック・焦点を絞ったテスト・CIを追加する。
- 未実装MVPの設計とタスクにEffectの適用方針を記録する。
- 今回は現行fetch/queueの全面移行、MVP実装、永続化、外部実接続、デプロイを行わない。

## Capabilities

### New Capabilities

- `error-handling-foundation`: エラー分類・回復判断・安全なHTTP境界。

### Modified Capabilities

なし。既存MVPの外部契約は変更せず、作業中のdesign/tasksに実装方針を追加する。

## Impact

関連Issueは #2 #3 #4 #5 #6 #7。package/lock、TypeScript設定、共通エラー部品、テスト、CI、OpenSpec設計へ影響する。
既存Notionクライアントの引数型を必要な設定に限定し、既存の型エラーを修正する。
