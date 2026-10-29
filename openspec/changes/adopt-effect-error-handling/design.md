# Design

## Decisions

- effect 4.1.0のData.TaggedErrorでResearchErrorを判別可能なunionにする。Effect.catchTagsで選択的に回復する。
- 回復方針はdecideRecoveryへ集約する。これはScheduleでも予算管理でもなく、実行・永続化・配送から独立した判断である。
- HTTPではrunPromiseExitを1回実行する。成功、defect、中断、型付き失敗の順で評価し、固定コードのみを返す。
- 外部SDK/Promiseの変換はアダプターで明示的に行う。Notionの応答喪失を一般的な一時障害へ分類しない。
- SDK自動再試行を含む予算・永続状態管理、HTTP/Queue/Workflowへの実接続は既存MVPの未完了タスクに残す。
- effectのexportsを解決するためmoduleResolutionをbundlerへ変更する。Notion生成関数は必要なtoken設定だけを引数型にする。
- tsxは開発時のNodeテスト用。CLIのIPCを必要としないnode --import tsx --testで実行する。

## Risks / Trade-offs

- 型付きエラーでも分類を間違えると安全な再試行にはならない → プロバイダ別アダプターで枠切れと一時制限・未反映と結果不明を検証する。
- Effectのインメモリ状態は再起動を越えない → 永続予算・排他・冪等性は既存設計を維持する。
- Workers Free適合はNodeテストで証明できない → 実際のハンドラー接続後にバンドル・CPU・キャンセル・資源解放を確認する。
- rawエラーのログは秘密値を含みうる → 応答は固定コード。今後のログもrequestIdと許可した分類値だけを記録する。

## Verification

pnpm typecheck、pnpm test、OpenSpec厳格検証、CIを実施する。現行fetch/queueは今回の基盤へ未接続であり、認証等を含む本番利用条件はまだ満たしていない。

## Migration Plan

この基盤を先に追加し、今後のMVP実装で受付・ツールアダプター・推論・Notion保存・Queue境界へ順に適用する。差異が見つかったらdesign/tasks、外部挙動も変わる場合は差分仕様も更新する。
