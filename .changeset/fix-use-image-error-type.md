---
'@jbpark/use-hooks': major
---

`useImage`'s `error` is now a real `Error` instead of `string | Event | null` — the `string` branch was never actually set (a leftover from `OnErrorEventHandler`'s type, not real behavior), and a bare `Event` carries no useful failure reason. The original event is attached as `error.cause` if you need it.

Also exposes `attemptCount` (previously internal-only state) for building retry UI.

```ts
// before
const { loading, error, loaded, retry } = useImage(src, { retryCount: 1 });
// error: string | Event | null

// after
const { loading, error, loaded, retry, attemptCount } = useImage(src, {
  retryCount: 1,
});
// error: Error | null, error.message is a real description, error.cause is the original event
```
