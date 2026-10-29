import { Context, Data, Effect, Layer, Schema } from "effect";

export class ReadUnavailable extends Data.TaggedError("ReadUnavailable")<{}> {}
export class InvalidRecord extends Data.TaggedError("InvalidRecord")<{}> {}

const RecordSchema = Schema.Struct({ id: Schema.String, title: Schema.String });
export type Record = typeof RecordSchema.Type;

// Already-authorized reads only. The adapter owns transport/status classification.
export class RecordSource extends Context.Service<RecordSource, {
  readonly read: (id: string) => Effect.Effect<unknown, ReadUnavailable>;
}>()("example/RecordSource") {}

export const loadRecord = Effect.fn("Record.load")(function* (id: string) {
  const source = yield* RecordSource;
  const raw = yield* source.read(id);
  return yield* Schema.decodeUnknownEffect(RecordSchema)(raw).pipe(
    Effect.mapError(() => new InvalidRecord()),
  );
});

// No real network calls: inject a trusted SDK adapter with AbortSignal support.
// A rejected adapter call here means unavailable; provider-specific classifiers
// must distinguish quota, auth, and other failures in production.
export const makeRecordSource = (
  read: (id: string, signal: AbortSignal) => Promise<unknown>,
) => Layer.succeed(RecordSource, {
  read: (id) => Effect.tryPromise({
    try: (signal) => read(id, signal),
    catch: () => new ReadUnavailable(),
  }),
});
