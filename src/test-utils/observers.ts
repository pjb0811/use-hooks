import { vi } from 'vitest';

// jsdom has no `ResizeObserver` or `IntersectionObserver`. These fakes record
// what each instance observes and let a test deliver entries by hand.
class FakeObserver<Options> {
  observed = new Set<Element>();
  lastOptions: Options | undefined;
  disconnected = false;

  observe(element: Element, options?: Options) {
    this.observed.add(element);
    this.lastOptions = options;
  }

  unobserve(element: Element) {
    this.observed.delete(element);
  }

  disconnect() {
    this.observed.clear();
    this.disconnected = true;
  }
}

export class FakeResizeObserver extends FakeObserver<ResizeObserverOptions> {
  static instances: FakeResizeObserver[] = [];

  private callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    super();
    this.callback = callback;
    FakeResizeObserver.instances.push(this);
  }

  trigger(entries: Partial<ResizeObserverEntry>[] = [{}]) {
    this.callback(entries as ResizeObserverEntry[], this as never);
  }
}

export class FakeIntersectionObserver extends FakeObserver<never> {
  static instances: FakeIntersectionObserver[] = [];

  private callback: IntersectionObserverCallback;
  init?: IntersectionObserverInit;

  constructor(
    callback: IntersectionObserverCallback,
    init?: IntersectionObserverInit,
  ) {
    super();
    this.callback = callback;
    this.init = init;
    FakeIntersectionObserver.instances.push(this);
  }

  trigger(entries: Partial<IntersectionObserverEntry>[]) {
    this.callback(entries as IntersectionObserverEntry[], this as never);
  }
}

export const installResizeObserver = () => {
  FakeResizeObserver.instances = [];
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);

  return FakeResizeObserver;
};

export const installIntersectionObserver = () => {
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);

  return FakeIntersectionObserver;
};

export const lastOf = <T>(items: T[]): T => items[items.length - 1] as T;
