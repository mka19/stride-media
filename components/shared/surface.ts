/**
 * Which surface is currently under the nav bar.
 *
 * The nav has to flip between its dark and light treatments, and it can't
 * work that out by looking at the DOM: the Problem section is a single
 * element that is dark for its first half and light for its second, and the
 * crossfade happens mid-scroll. So sections declare their own tone here and
 * update it when it changes, and the nav reads whichever declared zone sits
 * under the bar.
 *
 * Sections that are dark the whole way through don't need to register at
 * all — dark is the default.
 */
export type Tone = "light" | "dark";

const zones = new Map<HTMLElement, Tone>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export type SurfaceHandle = {
  /** Call when the section's own surface changes mid-scroll. */
  setTone: (tone: Tone) => void;
  release: () => void;
};

export function registerSurface(el: HTMLElement, tone: Tone): SurfaceHandle {
  zones.set(el, tone);
  notify();
  return {
    setTone(next) {
      if (zones.get(el) !== next) {
        zones.set(el, next);
        notify();
      }
    },
    release() {
      zones.delete(el);
      notify();
    },
  };
}

/** The tone of the declared zone crossing `viewportY`, or dark if none does. */
export function toneAt(viewportY: number): Tone {
  let tone: Tone = "dark";
  zones.forEach((zoneTone, el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top <= viewportY && rect.bottom > viewportY) tone = zoneTone;
  });
  return tone;
}

export function subscribeSurface(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
