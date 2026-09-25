export {};

declare global {
  interface ViewTransition {
    finished: Promise<void>;
    ready: Promise<void>;
    updateCallbackDone: Promise<void>;
    skipTransition: () => void;
    abort: () => void;
  }

  interface Document {
    startViewTransition?: (callback?: () => void | Promise<void>) => ViewTransition;
  }

  interface Window {
    webkitAudioContext?: typeof AudioContext;
    MSStream?: unknown;
  }

  interface Navigator {
    standalone?: boolean;
  }
}
