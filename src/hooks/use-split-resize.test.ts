import type { KeyboardEvent, PointerEvent } from 'react';

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import useSplitResize from './use-split-resize';

type Props = Parameters<typeof useSplitResize>[0];

// jsdom has no layout, so the container reports a fixed rect.
const container = (direction = 'ltr') => {
  const element = document.createElement('div');

  element.style.direction = direction;
  element.getBoundingClientRect = () =>
    ({
      left: 100,
      right: 1100,
      width: 1000,
      top: 50,
      height: 500,
    }) as DOMRect;

  return element;
};

const separator = () => {
  let captured: number | undefined;

  return {
    setPointerCapture: vi.fn((id: number) => {
      captured = id;
    }),
    hasPointerCapture: (id: number) => captured === id,
    releasePointerCapture: vi.fn(() => {
      captured = undefined;
    }),
  } as unknown as HTMLElement;
};

const pointer = (
  target: HTMLElement,
  init: Partial<PointerEvent<HTMLElement>> = {},
) =>
  ({
    button: 0,
    pointerId: 1,
    clientX: 0,
    clientY: 0,
    currentTarget: target,
    preventDefault: vi.fn(),
    ...init,
  }) as unknown as PointerEvent<HTMLElement>;

const key = (name: string) =>
  ({
    key: name,
    preventDefault: vi.fn(),
  }) as unknown as KeyboardEvent<HTMLElement>;

const setup = (props: Props = {}, direction?: string) => {
  const hook = renderHook<ReturnType<typeof useSplitResize>, Props>(
    current => useSplitResize(current),
    {
      initialProps: { defaultSize: 20, minSize: 15, maxSize: 50, ...props },
    },
  );

  act(() => hook.result.current.containerRef(container(direction)));

  const target = separator();
  const handlers = () => hook.result.current.separatorProps;
  const drag = (...moves: Partial<PointerEvent<HTMLElement>>[]) => {
    act(() => handlers().onPointerDown(pointer(target)));

    for (const move of moves) {
      act(() => handlers().onPointerMove(pointer(target, move)));
    }

    act(() => handlers().onPointerUp(pointer(target)));
  };
  const press = (name: string) => {
    act(() => handlers().onKeyDown(key(name)));
  };

  return { ...hook, target, handlers, drag, press };
};

describe('useSplitResize', () => {
  it('starts at the default size and exposes separator semantics', () => {
    const { result } = setup();

    expect(result.current.size).toBe(20);
    expect(result.current.isResizing).toBe(false);
    expect(result.current.separatorProps).toMatchObject({
      role: 'separator',
      tabIndex: 0,
      'aria-orientation': 'vertical',
      'aria-valuenow': 20,
      'aria-valuemin': 15,
      'aria-valuemax': 50,
    });
  });

  it('follows the pointer as a percentage of the container while dragging', () => {
    const { result, target, handlers } = setup();

    act(() => handlers().onPointerMove(pointer(target, { clientX: 400 })));
    expect(result.current.size).toBe(20);

    act(() => handlers().onPointerDown(pointer(target)));
    expect(result.current.isResizing).toBe(true);
    expect(target.setPointerCapture).toHaveBeenCalledWith(1);

    act(() => handlers().onPointerMove(pointer(target, { clientX: 400 })));
    expect(result.current.size).toBe(30);

    act(() => handlers().onPointerUp(pointer(target)));
    act(() => handlers().onPointerMove(pointer(target, { clientX: 500 })));

    expect(result.current.size).toBe(30);
    expect(result.current.isResizing).toBe(false);
    expect(target.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it('clamps to the limits and rounds to 0.1', () => {
    const { result, target, handlers } = setup();

    act(() => handlers().onPointerDown(pointer(target)));
    act(() => handlers().onPointerMove(pointer(target, { clientX: 120 })));
    expect(result.current.size).toBe(15);

    act(() => handlers().onPointerMove(pointer(target, { clientX: 1050 })));
    expect(result.current.size).toBe(50);

    act(() => handlers().onPointerMove(pointer(target, { clientX: 333.33 })));
    expect(result.current.size).toBe(23.3);
  });

  it('ignores buttons other than the primary one and stops on cancel', () => {
    const { result, target, handlers } = setup();

    act(() => handlers().onPointerDown(pointer(target, { button: 2 })));
    act(() => handlers().onPointerMove(pointer(target, { clientX: 400 })));
    expect(result.current.size).toBe(20);
    expect(result.current.isResizing).toBe(false);

    act(() => handlers().onPointerDown(pointer(target)));
    act(() => handlers().onPointerCancel(pointer(target)));
    act(() => handlers().onPointerMove(pointer(target, { clientX: 400 })));
    expect(result.current.size).toBe(20);
    expect(result.current.isResizing).toBe(false);
  });

  it('resizes with arrow keys, Home and End', () => {
    const { result, press } = setup({ keyboardStep: 5 });

    press('ArrowRight');
    expect(result.current.size).toBe(25);

    press('ArrowLeft');
    press('ArrowLeft');
    expect(result.current.size).toBe(15);

    press('End');
    expect(result.current.size).toBe(50);

    press('Home');
    expect(result.current.size).toBe(15);

    press('ArrowUp');
    press('a');
    expect(result.current.size).toBe(15);
  });

  it('measures height and uses Up and Down when stacked', () => {
    const { result, drag, press } = setup({ orientation: 'vertical' });

    expect(result.current.separatorProps['aria-orientation']).toBe(
      'horizontal',
    );

    drag({ clientY: 200, clientX: 900 });
    expect(result.current.size).toBe(30);

    press('ArrowDown');
    expect(result.current.size).toBe(31);

    press('ArrowUp');
    press('ArrowRight');
    expect(result.current.size).toBe(30);
  });

  it('measures from the right edge and swaps Left and Right in a right-to-left container', () => {
    const { result, drag, press } = setup({}, 'rtl');

    drag({ clientX: 800 });
    expect(result.current.size).toBe(30);

    press('ArrowLeft');
    expect(result.current.size).toBe(31);

    press('ArrowRight');
    expect(result.current.size).toBe(30);
  });

  it('only reports changes while controlled', () => {
    const onSizeChange = vi.fn();
    const { result, rerender, drag, press } = setup({
      size: 40,
      onSizeChange,
    });

    expect(result.current.size).toBe(40);

    drag({ clientX: 400 });
    expect(onSizeChange).toHaveBeenLastCalledWith(30);
    expect(result.current.size).toBe(40);

    rerender({ minSize: 15, maxSize: 50, size: 30, onSizeChange });
    press('ArrowRight');
    expect(onSizeChange).toHaveBeenLastCalledWith(31);
    expect(result.current.size).toBe(30);
  });

  it('calls onResizeEnd once per drag or key press that changed the size', () => {
    const onSizeChange = vi.fn();
    const onResizeEnd = vi.fn();
    const { drag, press } = setup({ onSizeChange, onResizeEnd });

    drag(
      { clientX: 300 },
      { clientX: 350 },
      { clientX: 380 },
      { clientX: 400 },
    );
    // The move to 300 is the starting 20%, so it reports nothing.
    expect(onSizeChange.mock.calls).toEqual([[25], [28], [30]]);
    expect(onResizeEnd).toHaveBeenCalledExactlyOnceWith(30);

    // Pressing and releasing without moving changes nothing.
    drag();
    press('ArrowRight');
    expect(onResizeEnd).toHaveBeenCalledTimes(2);
    expect(onResizeEnd).toHaveBeenLastCalledWith(31);

    // Already at the limit.
    press('End');
    press('End');
    expect(onResizeEnd).toHaveBeenCalledTimes(3);
  });

  it('keeps its handlers across renders', () => {
    const { result, rerender } = setup();
    const { onPointerDown, onKeyDown } = result.current.separatorProps;
    const { containerRef } = result.current;

    rerender({ defaultSize: 20, minSize: 10, maxSize: 60 });

    expect(result.current.separatorProps.onPointerDown).toBe(onPointerDown);
    expect(result.current.separatorProps.onKeyDown).toBe(onKeyDown);
    expect(result.current.containerRef).toBe(containerRef);
    expect(result.current.separatorProps['aria-valuemax']).toBe(60);
  });
});
