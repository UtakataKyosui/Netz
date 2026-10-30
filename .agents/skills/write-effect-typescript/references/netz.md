# Netzへの適用

これは2026-10-29に確認したNetz用の運用方針であり、Effect一般の仕様ではない。実作業では最新のAGENTS.md、OpenSpec、docs/error-handling.md、src/errors.ts、src/http-error-boundary.tsを読み直す。

- 追加費用ゼロ、owner-only認証を維持する。無料枠を超える有料fallbackを追加しない。
- QuotaExhaustedError/BudgetExceededErrorは停止。429だけで枠切れと一時レート制限を決めない。
- DependencyUnavailableErrorは安全性・残り回数・共有予算を満たす場合だけ再試行候補。decideRecoveryは純粋な判断であり、送信や永続予算確保を実行しない。
- Notionの応答喪失はSaveOutcomeUnknownErrorとして照合へ進める。タイムアウトだけで未保存と決めて再作成しない。
- plan承認前に収集しない。実行中のスコープ・必須の充足基準を暗黙に変更しない。partialをcompleteへ回復しない。
- resultStatus、stopReason、saveStatusを分ける。保存済みの確認がないページURLを成功として返さない。
- 複数MCP、SDK、Queue再配信、推論、計画修正にまたがる予算を永続化する。RefやScheduleは代替にならない。
- Workersの現行公式ドキュメント・limitsを確認する。Node runtimeを追加せず、Bindingsを注入する。型チェックだけでFree枠適合を主張しない。
- 仕様変更はOpenSpecのdelta specs/scenarios、実装詳細の変更はdesign/tasksにも反映する。生成済みOpenSpec skillを手編集しない。
- 既存HTTP境界を再利用する前に接続状況を確認する。共通部品の存在を認証やMVP全体の実装完了と取り違えない。

追加時点でEffect導入は[PR #9](https://github.com/UtakataKyosui/Netz/pull/9)が未マージ。上記のdocs/error-handling.md、src/errors.ts、src/http-error-boundary.tsはそのPRで追加予定。存在しない場合は導入済みと扱わず、PRの最新状態を確認する。スキル単体の追加はEffect依存や実行基盤を導入しない。
