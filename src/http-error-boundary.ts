import { Effect, Exit, Option } from "effect";
import type { ResearchError } from "./errors";

// 内部の例外・cause・プロバイダのレスポンスを公開しない固定のエラーコード。
function publicError(error: ResearchError): { status: number; code: string } {
	switch (error._tag) {
		case "ConfigurationError": return { status: 503, code: "configuration_error" };
		case "AuthenticationError": return { status: 401, code: "unauthorized" };
		case "InputValidationError": return { status: 400, code: "invalid_input" };
		case "QuotaExhaustedError": return { status: 503, code: "quota_exhausted" };
		case "BudgetExceededError": return { status: 409, code: "budget_exceeded" };
		case "DependencyUnavailableError": return { status: 503, code: "dependency_unavailable" };
		case "PageFetchError": return { status: 502, code: "page_unavailable" };
		case "SaveOutcomeUnknownError": return { status: 503, code: "save_unknown" };
	}
}

function failureResponse(status: number, code: string): Response {
	return Response.json({ error: { code } }, {
		status,
		headers: { "Cache-Control": "no-store" },
	});
}

// fetch境界用。内部EffectではrunPromise等を呼ばず、ここで一度だけ実行する。
// Queueでは使わず、runPromiseExitの結果を永続状態と配送判断へ接続する。
export async function runHttpEffect(
	program: Effect.Effect<Response, ResearchError>,
	options?: { readonly signal?: AbortSignal },
): Promise<Response> {
	const exit = await Effect.runPromiseExit(program, options);
	if (Exit.isSuccess(exit)) return exit.value;
	// 型付き失敗とdefectが混在しても、defectを成功・通常の業務エラーへ隠さない。
	if (Exit.hasDies(exit)) return failureResponse(500, "internal_error");
	if (Exit.hasInterrupts(exit)) return failureResponse(503, "interrupted");
	const error = Exit.findErrorOption(exit);
	if (Option.isSome(error)) {
		const { status, code } = publicError(error.value);
		return failureResponse(status, code);
	}
	return failureResponse(500, "internal_error");
}
