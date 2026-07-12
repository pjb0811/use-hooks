import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

const registeredProperties = new Set<string>();

const registerCSSProperty = (
  name: string,
  syntax = '<length>',
  initialValue = '0px',
) => {
  if (
    registeredProperties.has(name) ||
    typeof CSS === 'undefined' ||
    !CSS.registerProperty
  ) {
    return;
  }

  try {
    CSS.registerProperty({
      name,
      syntax,
      inherits: false,
      initialValue,
    });
    registeredProperties.add(name);
  } catch {
    // 이미 등록된 경우 무시
  }
};

export interface TimelineStep {
  scale?: number;
  rotate?: { x?: number; y?: number; z?: number };
  position?: { x?: number; y?: number };
  top?: number;
  left?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  filter?: string;
  backgroundColor?: string;
  opacity?: number;
  selector: string;
  transition: Transition;
}

interface Transition {
  duration: number;
  ease?: string;
  delay?: number;
  easeX?: string;
  easeY?: string;
}

interface Options {
  steps?: TimelineStep[];
  loading?: boolean;
  immediate?: boolean;
  loop?: boolean;
}

const buildTimeline = (steps: TimelineStep[]): TimelineStep[][] => {
  const groups: TimelineStep[][] = [];

  for (const step of steps) {
    if (step.transition.delay === 0 && groups.length > 0) {
      groups[groups.length - 1]?.push(step);
    } else {
      groups.push([step]);
    }
  }

  return groups;
};

const buildTransform = (step: TimelineStep) => {
  const parts: string[] = [];

  if (step.position?.x != null || step.position?.y != null) {
    parts.push(
      `translate(${step.position.x ?? 0}px, ${step.position.y ?? 0}px)`,
    );
  }

  if (step.scale != null) {
    parts.push(`scale(${step.scale})`);
  }

  if (step.rotate?.x != null) {
    parts.push(`rotateX(${step.rotate.x}deg)`);
  }

  if (step.rotate?.y != null) {
    parts.push(`rotateY(${step.rotate.y}deg)`);
  }

  if (step.rotate?.z != null) {
    parts.push(`rotateZ(${step.rotate.z}deg)`);
  }

  return parts.join(' ') || undefined;
};

const applyStep = (
  container: HTMLElement,
  step: TimelineStep,
  skipTransition?: boolean,
) => {
  const elements = container.matches(step.selector)
    ? [container]
    : Array.from(container.querySelectorAll<HTMLElement>(step.selector));

  if (!elements.length) {
    return;
  }

  const dur = `${step.transition.duration}ms`;
  const eas = step.transition.ease ?? 'ease-out';
  const easX = step.transition.easeX;
  const easY = step.transition.easeY;
  const hasCurve = !!(easX || easY);
  const timers: ReturnType<typeof setTimeout>[] = [];

  elements.forEach(el => {
    if (skipTransition) {
      el.style.transition = 'none';
    } else if (hasCurve) {
      const xEase = easX ?? eas;
      const yEase = easY ?? eas;
      el.style.transition = [
        `--tx ${dur} ${xEase}`,
        `--ty ${dur} ${yEase}`,
        `--s ${dur} ${eas}`,
        `rotate ${dur} ${eas}`,
        `width ${dur} ${eas}`,
        `height ${dur} ${eas}`,
        `filter ${dur} ${eas}`,
        `opacity ${dur} ${eas}`,
      ].join(', ');
    } else {
      el.style.transition = `all ${dur} ${eas}`;
    }

    if (step.backgroundColor) {
      el.style.backgroundColor = step.backgroundColor;
    }

    if (step.opacity !== undefined) {
      el.style.opacity = String(step.opacity);
    }

    if (step.top !== undefined) {
      el.style.top = `${step.top}px`;
    }

    if (step.left !== undefined) {
      el.style.left = `${step.left}px`;
    }

    if (step.width !== undefined) {
      el.style.width = `${step.width}px`;
    }

    if (step.height !== undefined) {
      el.style.height = `${step.height}px`;
    }

    if (step.zIndex !== undefined) {
      if (skipTransition) {
        el.style.zIndex = String(step.zIndex);
      } else {
        const timerId = setTimeout(() => {
          el.style.zIndex = String(step.zIndex);
        }, step.transition.duration / 2);
        timers.push(timerId);
      }
    }

    if (step.filter !== undefined) {
      el.style.filter = step.filter;
    }

    if (step.rotate?.z !== undefined) {
      el.style.rotate = `${step.rotate.z}deg`;
    }

    if (hasCurve) {
      if (step.position?.x != null || step.position?.y != null) {
        el.style.setProperty('--tx', `${step.position.x ?? 0}px`);
        el.style.setProperty('--ty', `${step.position.y ?? 0}px`);
      }
      if (step.scale != null) {
        el.style.setProperty('--s', String(step.scale));
      }
      el.style.transform = `translate(var(--tx), var(--ty)) scale(var(--s, 1))`;
    } else {
      const transform = buildTransform(step);

      if (transform) {
        el.style.transform = transform;
      }
    }
  });

  return timers;
};

const useTimeline = ({ steps = [], loading, immediate, loop }: Options) => {
  const [slotIndex, setSlotIndex] = useState(-1);
  const [completed, setCompleted] = useState(() => !!immediate);

  const ref = useRef<HTMLDivElement>(null);
  const timeline = useMemo(() => buildTimeline(steps), [steps]);
  const hasCurveSteps = useMemo(
    () => steps.some(s => s.transition.easeX || s.transition.easeY),
    [steps],
  );

  useLayoutEffect(() => {
    if (hasCurveSteps) {
      registerCSSProperty('--tx');
      registerCSSProperty('--ty');
      registerCSSProperty('--s', '<number>', '1');
    }
  }, [hasCurveSteps]);

  useLayoutEffect(() => {
    if (!immediate || !ref.current || !steps.length) {
      return;
    }

    const container = ref.current;
    steps.forEach(step => applyStep(container, step, true));
  }, [immediate, steps]);

  useEffect(() => {
    if (immediate || loading || !timeline.length) {
      return;
    }

    const firstDelay = timeline[0]?.[0]?.transition.delay ?? 0;
    const timerId = window.setTimeout(() => {
      requestAnimationFrame(() => setSlotIndex(0));
    }, firstDelay);

    return () => clearTimeout(timerId);
  }, [loading, timeline, immediate]);

  useEffect(() => {
    if (immediate || loading || slotIndex < 0) {
      return;
    }

    const isLast = slotIndex >= timeline.length - 1;

    if (isLast && !loop) {
      return;
    }

    const currentSlot = timeline[slotIndex];
    const maxDuration = Math.max(
      ...(currentSlot?.map(s => s.transition.duration) ?? [0]),
    );

    const nextIndex = isLast ? 0 : slotIndex + 1;
    const nextDelay = timeline[nextIndex]?.[0]?.transition.delay ?? 0;

    const timerId = window.setTimeout(() => {
      setSlotIndex(nextIndex);
    }, maxDuration + nextDelay);

    return () => clearTimeout(timerId);
  }, [loading, slotIndex, timeline, immediate, loop]);

  useEffect(() => {
    if (immediate || slotIndex < 0 || !ref.current) {
      return;
    }

    const container = ref.current;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const rafId = requestAnimationFrame(() => {
      timeline[slotIndex]?.forEach(step => {
        const stepTimers = applyStep(container, step);

        if (stepTimers) {
          timers.push(...stepTimers);
        }
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      timers.forEach(clearTimeout);
    };
  }, [immediate, slotIndex, timeline]);

  useEffect(() => {
    if (
      immediate ||
      loop ||
      slotIndex < 0 ||
      slotIndex < timeline.length - 1 ||
      !timeline.length
    ) {
      return;
    }

    const lastSlot = timeline[slotIndex];
    const maxDuration = Math.max(
      ...(lastSlot?.map(s => s.transition.duration) ?? [0]),
    );

    const timerId = window.setTimeout(() => {
      setCompleted(true);
    }, maxDuration);

    return () => clearTimeout(timerId);
  }, [slotIndex, timeline, immediate, loop]);

  return { ref, completed };
};

export default useTimeline;
