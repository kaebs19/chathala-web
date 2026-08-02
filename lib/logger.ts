/**
 * Central place for swallowed-error reporting.
 *
 * The codebase had 32 bare `catch {}` blocks; one of them hid a production
 * outage where the homepage user showcase silently vanished for days. Failures
 * that a user can't act on still need to be visible to us.
 *
 * Swap the console calls for a real sink (Sentry et al.) in one edit here.
 */

function serialise(err: unknown): unknown {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  return err;
}

/** Unexpected failure. Something is broken and we want to know. */
export function logError(scope: string, err: unknown): void {
  console.error(`[${scope}]`, serialise(err));
}

/** Expected-but-notable failure, e.g. a retry path picked up the slack. */
export function logWarn(scope: string, err: unknown): void {
  console.warn(`[${scope}]`, serialise(err));
}
