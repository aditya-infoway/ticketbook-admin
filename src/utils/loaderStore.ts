import { useSyncExternalStore } from "react";

const NAV_WINDOW_MS = 2000; // a Get within this time of a navigation = page load
const SHOW_DELAY_MS = 300; // don't flash the loader on fast responses


let count = 0;
let visible = false;
let lastNavAt = Date.now(); // a browser refresh counts as a page load
let showTimer: ReturnType<typeof setTimeout> | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
const IDLE_GRACE_MS = 150; // gap between sequential calls that still counts as one load

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const loaderStore = {
  markNavigation() {
    lastNavAt = Date.now();
  },

  // returns true only if this call is tracked (page-load fetch)
  startIfPageLoad(): boolean {
    if (Date.now() - lastNavAt > NAV_WINDOW_MS) return false;
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    count++;
    if (!showTimer && !visible) {
      showTimer = setTimeout(() => {
        showTimer = null;
        if (count > 0 || idleTimer) {
          visible = true;
          emit();
        }
      }, SHOW_DELAY_MS);
    }
    return true;
  },

  stop() {
    count = Math.max(0, count - 1);
    if (count === 0 && !idleTimer) {
      idleTimer = setTimeout(() => {
        idleTimer = null;
        if (count > 0) return;
        if (showTimer) {
          clearTimeout(showTimer);
          showTimer = null;
        }
        if (visible) {
          visible = false;
          emit();
        }
      }, IDLE_GRACE_MS);
    }
  },
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const useLoaderVisible = () =>
  useSyncExternalStore(subscribe, () => visible);
