import { Data } from "effect";

export type Dependency = "queue" | "mcp" | "search" | "ai" | "notion";
export type BudgetOperation = "search" | "page" | "inference";

// 想定内の失敗を区別する。例外のmessageやHTTPステータスだけで回復を決めない。
export class ConfigurationError extends Data.TaggedError("ConfigurationError")<{}> {}
export class AuthenticationError extends Data.TaggedError("AuthenticationError")<{}> {}
export class InputValidationError extends Data.TaggedError("InputValidationError")<{}> {}
export class QuotaExhaustedError extends Data.TaggedError("QuotaExhaustedError")<{
	readonly dependency: Dependency;
}> {}
export class BudgetExceededError extends Data.TaggedError("BudgetExceededError")<{
	readonly operation: BudgetOperation;
}> {}
export class DependencyUnavailableError extends Data.TaggedError("DependencyUnavailableError")<{
	readonly dependency: Dependency;
	readonly retryAfterMs?: number;
}> {}
export class PageFetchError extends Data.TaggedError("PageFetchError")<{}> {}
export class SaveOutcomeUnknownError extends Data.TaggedError("SaveOutcomeUnknownError")<{}> {}

export type ResearchError =
	| ConfigurationError
	| AuthenticationError
	| InputValidationError
	| QuotaExhaustedError
	| BudgetExceededError
	| DependencyUnavailableError
	| PageFetchError
	| SaveOutcomeUnknownError;

export type RecoveryDecision =
	| { readonly action: "reject"; readonly reason: "configuration" | "authentication" | "invalid_input" }
	| { readonly action: "stop"; readonly reason: "quota_exhausted" | "budget_exceeded" | "retry_not_allowed" }
	| { readonly action: "retry"; readonly delayMs: number }
	| { readonly action: "skip"; readonly reason: "page_unavailable" }
	| { readonly action: "reconcile"; readonly reason: "save_unknown" };

export interface RecoveryContext {
	readonly operation: "read" | "write";
	readonly retriesRemaining: number;
	readonly budgetAvailable: boolean;
	// 書き込みは、上流で未反映と確認できた場合だけ再試行候補にできる。
	readonly confirmedNotCommitted?: boolean;
}

// 判断のみを返す。ack・再送・保存は永続状態の更新後に呼び出し側で行う。
export function decideRecovery(error: ResearchError, context: RecoveryContext): RecoveryDecision {
	switch (error._tag) {
		case "ConfigurationError":
			return { action: "reject", reason: "configuration" };
		case "AuthenticationError":
			return { action: "reject", reason: "authentication" };
		case "InputValidationError":
			return { action: "reject", reason: "invalid_input" };
		case "QuotaExhaustedError":
			return { action: "stop", reason: "quota_exhausted" };
		case "BudgetExceededError":
			return { action: "stop", reason: "budget_exceeded" };
		case "PageFetchError":
			return { action: "skip", reason: "page_unavailable" };
		case "SaveOutcomeUnknownError":
			return { action: "reconcile", reason: "save_unknown" };
		case "DependencyUnavailableError": {
			const safe = context.operation === "read" || context.confirmedNotCommitted === true;
			if (!safe || !Number.isSafeInteger(context.retriesRemaining) || context.retriesRemaining <= 0 || !context.budgetAvailable) {
				return { action: "stop", reason: "retry_not_allowed" };
			}
			const delayMs = error.retryAfterMs ?? 1_000;
			// 不正な待機値を即時再試行へ丸めない。指定されたRetry-Afterは短縮しない。
			if (!Number.isSafeInteger(delayMs) || delayMs < 0) {
				return { action: "stop", reason: "retry_not_allowed" };
			}
			return { action: "retry", delayMs };
		}
	}
}
