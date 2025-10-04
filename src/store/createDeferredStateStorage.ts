import type { StateStorage } from "zustand/middleware";

type DeferredStorageOptions = {
  /**
   * Maximum time in milliseconds to wait before forcing a flush.
   * Defaults to 250ms to stay responsive while removing synchronous
   * writes from the keyboard input path.
   */
  flushDelayMs?: number;
};

type IdleHandle = number;

const DEFAULT_FLUSH_DELAY = 250;

/**
 * Creates a StateStorage wrapper that batches localStorage writes so that
 * large payloads (like long markdown documents) do not block the main thread
 * on every keystroke. Reads still stay synchronous to keep hydration logic
 * simple, but writes are deferred to the next idle period (or the end of the
 * delay window, whichever happens first).
 */
export function createDeferredStateStorage(
  options: DeferredStorageOptions = {},
): StateStorage<Promise<void>> {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    } satisfies StateStorage<Promise<void>>;
  }

  const flushDelay = Math.max(options.flushDelayMs ?? DEFAULT_FLUSH_DELAY, 0);

  const pendingWrites = new Map<string, string>();
  let idleHandle: IdleHandle | null = null;
  let timeoutHandle: number | null = null;
  const pendingResolvers = new Set<() => void>();

  const cancelIdleCallback = () => {
    if (
      idleHandle !== null &&
      typeof window.cancelIdleCallback === "function"
    ) {
      window.cancelIdleCallback(idleHandle);
    }
    idleHandle = null;
  };

  const cancelTimeout = () => {
    if (timeoutHandle !== null) {
      window.clearTimeout(timeoutHandle);
    }
    timeoutHandle = null;
  };

  const resolvePending = () => {
    pendingResolvers.forEach((resolve) => {
      resolve();
    });
    pendingResolvers.clear();
  };

  const flush = () => {
    cancelIdleCallback();
    cancelTimeout();

    if (!pendingWrites.size) {
      resolvePending();
      return;
    }

    for (const [name, value] of pendingWrites.entries()) {
      try {
        window.localStorage.setItem(name, value);
      } catch (error) {
        console.error("Persisted storage flush failed", error);
      }
    }

    pendingWrites.clear();
    resolvePending();
  };

  const scheduleFlush = () => {
    if (!pendingWrites.size) {
      cancelIdleCallback();
      cancelTimeout();
      return;
    }

    if (
      idleHandle === null &&
      typeof window.requestIdleCallback === "function"
    ) {
      idleHandle = window.requestIdleCallback(
        () => {
          idleHandle = null;
          flush();
        },
        { timeout: flushDelay },
      );
    }

    if (timeoutHandle === null) {
      timeoutHandle = window.setTimeout(() => {
        cancelIdleCallback();
        flush();
      }, flushDelay);
    }
  };

  const optionsWithFallback = {
    beforeUnloadEvent: typeof window.addEventListener === "function",
  } as const;

  if (optionsWithFallback.beforeUnloadEvent) {
    const handlePageHide = () => flush();
    window.addEventListener("beforeunload", handlePageHide);
    window.addEventListener("pagehide", handlePageHide);

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          flush();
        }
      });
    }
  }

  return {
    getItem: (name) => {
      const pending = pendingWrites.get(name);
      if (pending !== undefined) {
        return pending;
      }
      return window.localStorage.getItem(name);
    },
    setItem: (name, value) => {
      pendingWrites.set(name, value);
      scheduleFlush();
      return new Promise<void>((resolve) => {
        pendingResolvers.add(resolve);
      });
    },
    removeItem: (name) => {
      pendingWrites.delete(name);
      window.localStorage.removeItem(name);
      return Promise.resolve();
    },
  } satisfies StateStorage<Promise<void>>;
}
