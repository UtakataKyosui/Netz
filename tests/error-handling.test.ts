import assert from "node:assert/strict";
import { test } from "node:test";
import { Effect, Exit, Option } from "effect";
import {
	AuthenticationError,
	BudgetExceededError,
	ConfigurationError,
	DependencyUnavailableError,
	decideRecovery,
	InputValidationError,
	PageFetchError,
	QuotaExhaustedError,
	SaveOutcomeUnknownError,
} from "../src/errors";
import { runHttpEffect } from "../src/http-error-boundary";

const retryContext = {
	operation: "read",
	retriesRemaining: 2,
	budgetAvailable: true,
} as const;

test("無料枠・処理予算は余裕があっても再試行しない", () => {
	assert.deepEqual(
		decideRecovery(new QuotaExhaustedError({ dependency: "ai" }), retryContext),
		{ action: "stop", reason: "quota_exhausted" },
	);
	assert.deepEqual(
		decideRecovery(
			new BudgetExceededError({ operation: "search" }),
			retryContext,
		),
		{ action: "stop", reason: "budget_exceeded" },
	);
});

test("一時障害でも回数・予算・書き込み結果を確認する", () => {
	const error = new DependencyUnavailableError({
		dependency: "notion",
		retryAfterMs: 90_000,
	});
	assert.deepEqual(decideRecovery(error, retryContext), {
		action: "retry",
		delayMs: 90_000,
	});
	for (const context of [
		{ ...retryContext, retriesRemaining: 0 },
		{ ...retryContext, retriesRemaining: Number.NaN },
		{ ...retryContext, budgetAvailable: false },
		{ ...retryContext, operation: "write" as const },
	])
		assert.equal(decideRecovery(error, context).action, "stop");
	assert.equal(
		decideRecovery(error, {
			...retryContext,
			operation: "write",
			confirmedNotCommitted: true,
		}).action,
		"retry",
	);
	assert.equal(
		decideRecovery(
			new DependencyUnavailableError({ dependency: "mcp", retryAfterMs: -1 }),
			retryContext,
		).action,
		"stop",
	);
});

test("Notion結果不明は未反映フラグがあっても照合へ進む", () => {
	assert.deepEqual(
		decideRecovery(new SaveOutcomeUnknownError(), {
			...retryContext,
			operation: "write",
			confirmedNotCommitted: true,
		}),
		{ action: "reconcile", reason: "save_unknown" },
	);
	assert.equal(
		decideRecovery(new PageFetchError(), retryContext).action,
		"skip",
	);
});

test("型付きエラーをタグで限定して回復し、他の失敗を隠さない", async () => {
	const program = Effect.fail(
		new QuotaExhaustedError({ dependency: "search" }),
	).pipe(
		Effect.catchTags({ QuotaExhaustedError: () => Effect.succeed("partial") }),
	);
	assert.equal(await Effect.runPromise(program), "partial");
	const exit = await Effect.runPromiseExit(
		Effect.fail(new SaveOutcomeUnknownError()),
	);
	const failure = Exit.findErrorOption(exit);
	assert.ok(Option.isSome(failure));
	assert.equal(failure.value._tag, "SaveOutcomeUnknownError");
});

test("Promise拒否を明示的に型付き失敗へ変換できる", async () => {
	const program = Effect.tryPromise({
		try: () => Promise.reject(new Error("provider-secret")),
		catch: () => new DependencyUnavailableError({ dependency: "mcp" }),
	});
	const response = await runHttpEffect(program);
	assert.equal(response.status, 503);
	assert.equal(
		await response.text(),
		'{"error":{"code":"dependency_unavailable"}}',
	);
});

test("HTTP境界はエラーを成功に変えず、内部情報を公開しない", async () => {
	for (const [error, status, code] of [
		[new AuthenticationError(), 401, "unauthorized"],
		[new ConfigurationError(), 503, "configuration_error"],
		[new InputValidationError(), 400, "invalid_input"],
		[new QuotaExhaustedError({ dependency: "ai" }), 503, "quota_exhausted"],
		[
			new BudgetExceededError({ operation: "inference" }),
			409,
			"budget_exceeded",
		],
		[new SaveOutcomeUnknownError(), 503, "save_unknown"],
	] as const) {
		const response = await runHttpEffect(Effect.fail(error));
		assert.equal(response.status, status);
		assert.equal(response.headers.get("Cache-Control"), "no-store");
		assert.deepEqual(await response.json(), { error: { code } });
	}
	const defect = await runHttpEffect(
		Effect.die(new Error("Bearer secret-provider-response")),
	);
	assert.equal(defect.status, 500);
	assert.equal(await defect.text(), '{"error":{"code":"internal_error"}}');
});

test("成功レスポンスは保持し、中断をdefectや成功と扱わない", async () => {
	const success = new Response("ok", { status: 202 });
	assert.equal(await runHttpEffect(Effect.succeed(success)), success);
	const response = await runHttpEffect(Effect.interrupt);
	assert.equal(response.status, 503);
	assert.deepEqual(await response.json(), { error: { code: "interrupted" } });
});
