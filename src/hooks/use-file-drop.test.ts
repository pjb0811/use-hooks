import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import useFileDrop from './use-file-drop';

const file = (name: string, type: string) => new File(['x'], name, { type });

// jsdom has no DragEvent or DataTransfer, so a plain cancelable event carries
// the `dataTransfer` the hook reads.
const drag = (
  node: HTMLElement,
  type: 'dragenter' | 'dragleave' | 'dragover' | 'drop',
  files: File[] = [],
) => {
  const event = Object.assign(
    new Event(type, { bubbles: true, cancelable: true }),
    { dataTransfer: { files } },
  );

  act(() => {
    node.dispatchEvent(event);
  });

  return event;
};

const setup = (options?: Parameters<typeof useFileDrop>[0]) => {
  const node = document.createElement('div');
  const hook = renderHook(
    (props: Parameters<typeof useFileDrop>[0]) => useFileDrop(props),
    { initialProps: options },
  );

  act(() => {
    hook.result.current.dropRef(node);
  });

  return { node, ...hook };
};

describe('useFileDrop', () => {
  it('is not dragging at first', () => {
    const { result } = setup();

    expect(result.current.isDragging).toBe(false);
  });

  it('is dragging from the first dragenter until the last dragleave', () => {
    const { node, result } = setup();

    drag(node, 'dragenter');
    expect(result.current.isDragging).toBe(true);

    // Moving onto a child fires another dragenter and a dragleave.
    drag(node, 'dragenter');
    drag(node, 'dragleave');
    expect(result.current.isDragging).toBe(true);

    drag(node, 'dragleave');
    expect(result.current.isDragging).toBe(false);
  });

  it('marks the element as a drop target by cancelling dragover', () => {
    const { node } = setup();

    expect(drag(node, 'dragover').defaultPrevented).toBe(true);
  });

  it('passes dropped files to onDrop and stops dragging', () => {
    const onDrop = vi.fn();
    const { node, result } = setup({ onDrop });
    const a = file('a.png', 'image/png');
    const b = file('b.txt', 'text/plain');

    drag(node, 'dragenter');
    drag(node, 'drop', [a, b]);

    expect(onDrop).toHaveBeenCalledWith([a, b]);
    expect(result.current.isDragging).toBe(false);
  });

  it('keeps only files that match `accept`', () => {
    const onDrop = vi.fn();
    const { node } = setup({ onDrop, accept: '.txt, image/*' });
    const png = file('a.png', 'image/png');
    const txt = file('b.TXT', 'text/plain');
    const pdf = file('c.pdf', 'application/pdf');

    drag(node, 'drop', [png, txt, pdf]);

    expect(onDrop).toHaveBeenCalledWith([png, txt]);
  });

  it('matches an exact MIME type in `accept`', () => {
    const onDrop = vi.fn();
    const { node } = setup({ onDrop, accept: 'application/pdf' });
    const pdf = file('c.pdf', 'application/pdf');

    drag(node, 'drop', [file('a.png', 'image/png'), pdf]);

    expect(onDrop).toHaveBeenCalledWith([pdf]);
  });

  it('does not call onDrop when nothing matches', () => {
    const onDrop = vi.fn();
    const { node } = setup({ onDrop, accept: 'image/*' });

    drag(node, 'drop', [file('c.pdf', 'application/pdf')]);

    expect(onDrop).not.toHaveBeenCalled();
  });

  it('takes only the first file with multiple: false', () => {
    const onDrop = vi.fn();
    const { node } = setup({ onDrop, multiple: false });
    const a = file('a.png', 'image/png');

    drag(node, 'drop', [a, file('b.png', 'image/png')]);

    expect(onDrop).toHaveBeenCalledWith([a]);
  });

  it('ignores every drag event while disabled', () => {
    const onDrop = vi.fn();
    const { node, result } = setup({ onDrop, disabled: true });

    drag(node, 'dragenter');
    expect(result.current.isDragging).toBe(false);
    expect(drag(node, 'dragover').defaultPrevented).toBe(false);

    drag(node, 'drop', [file('a.png', 'image/png')]);
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('stops dragging as soon as it becomes disabled', () => {
    const { node, result, rerender } = setup();

    drag(node, 'dragenter');
    expect(result.current.isDragging).toBe(true);

    rerender({ disabled: true });
    expect(result.current.isDragging).toBe(false);
  });

  it('uses the options of the latest render', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { node, rerender } = setup({ onDrop: first });
    const a = file('a.png', 'image/png');

    rerender({ onDrop: second });
    drag(node, 'drop', [a]);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith([a]);
  });

  it('stops listening when the node is released', () => {
    const onDrop = vi.fn();
    const { node, result } = setup({ onDrop });

    act(() => {
      result.current.dropRef(null);
    });
    drag(node, 'drop', [file('a.png', 'image/png')]);

    expect(onDrop).not.toHaveBeenCalled();
  });

  it('moves its listeners to a new node', () => {
    const onDrop = vi.fn();
    const { node, result } = setup({ onDrop });
    const other = document.createElement('div');
    const a = file('a.png', 'image/png');

    act(() => {
      result.current.dropRef(other);
    });
    drag(node, 'drop', [a]);
    expect(onDrop).not.toHaveBeenCalled();

    drag(other, 'drop', [a]);
    expect(onDrop).toHaveBeenCalledTimes(1);
  });
});
