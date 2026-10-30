import assert from "node:assert/strict";
import test from "node:test";
import { Effect, Exit, Fiber, Layer, Option } from "effect";
import { TestClock } from "effect/testing";
import { InvalidRecord, loadRecord, makeRecordSource, ReadUnavailable, RecordSource } from "./patterns";

test("layer substitution and schema validation preserve domain failures", async () => {
  const live = makeRecordSource(async (id) => ({ id, title: "Example" }));
  assert.deepEqual(await Effect.runPromise(loadRecord("1").pipe(Effect.provide(live))), { id: "1", title: "Example" });
  const invalid = Layer.succeed(RecordSource, { read: () => Effect.succeed({ id: 1 }) });
  const exit = await Effect.runPromiseExit(loadRecord("1").pipe(Effect.provide(invalid)));
  const error = Exit.findErrorOption(exit);
  assert.ok(Option.isSome(error) && error.value instanceof InvalidRecord);
});

test("selective recovery does not erase a different error", async () => {
  const invalid = Layer.succeed(RecordSource, { read: () => Effect.succeed(null) });
  const exit = await Effect.runPromiseExit(loadRecord("1").pipe(
    Effect.catchTag("ReadUnavailable", () => Effect.succeed({ id: "cached", title: "Cache" })),
    Effect.provide(invalid),
  ));
  assert.ok(Exit.isFailure(exit));
});

test("scope releases on success, typed failure, and interruption", async () => {
  for (const use of [Effect.void, Effect.fail(new ReadUnavailable()), Effect.interrupt]) {
    let releases = 0;
    await Effect.runPromiseExit(Effect.scoped(Effect.gen(function* () {
      yield* Effect.acquireRelease(Effect.succeed("handle"), () => Effect.sync(() => { releases++; }));
      yield* use;
    })));
    assert.equal(releases, 1);
  }
});

test("retry limit counts retries in addition to the initial attempt", async () => {
  let attempts = 0;
  const read = Effect.suspend(() => { attempts++; return Effect.fail(new ReadUnavailable()); });
  await Effect.runPromiseExit(read.pipe(Effect.retry({ times: 2, while: (e) => e._tag === "ReadUnavailable" })));
  assert.equal(attempts, 3);
  let invalidAttempts = 0;
  const invalid = Effect.suspend((): Effect.Effect<never, ReadUnavailable | InvalidRecord> => {
    invalidAttempts++; return Effect.fail(new InvalidRecord());
  });
  await Effect.runPromiseExit(invalid.pipe(Effect.retry({ times: 2, while: (e) => e._tag === "ReadUnavailable" })));
  assert.equal(invalidAttempts, 1);
});

test("TestClock drives timeout without wall clock sleeps", async () => {
  const program = Effect.gen(function* () {
    const fiber = yield* Effect.sleep("5 minutes").pipe(Effect.timeout("1 minute"), Effect.forkChild);
    yield* TestClock.adjust("1 minute");
    const exit = yield* Fiber.await(fiber);
    assert.ok(Exit.isFailure(exit));
  });
  await Effect.runPromise(program.pipe(Effect.provide(TestClock.layer())));
});

test("interruption reaches the Promise adapter's signal", async () => {
  let aborted = false;
  let started!: () => void;
  const ready = new Promise<void>((resolve) => { started = resolve; });
  const controller = new AbortController();
  const source = makeRecordSource((_id, signal) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => { aborted = true; reject(new Error("cancelled")); }, { once: true });
    started();
  }));
  const running = Effect.runPromiseExit(loadRecord("1").pipe(Effect.provide(source)), { signal: controller.signal });
  await ready;
  controller.abort();
  const exit = await running;
  assert.ok(aborted);
  assert.ok(Exit.hasInterrupts(exit));
});
