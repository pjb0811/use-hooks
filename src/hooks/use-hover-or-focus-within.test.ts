import { createElement } from 'react';

import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import useHoverOrFocusWithin from './use-hover-or-focus-within';

type Props = NonNullable<Parameters<typeof useHoverOrFocusWithin>[0]>;

// A container with two buttons inside, and a button outside it. The state of
// the hook is written to `data-*` attributes so a test can read it.
const Probe = (props: Props) => {
  const { active, hovered, focusWithin, handlers } =
    useHoverOrFocusWithin(props);

  return createElement(
    'div',
    null,
    createElement(
      'div',
      {
        ...handlers,
        'data-testid': 'box',
        'data-active': String(active),
        'data-hovered': String(hovered),
        'data-focus': String(focusWithin),
      },
      createElement('button', { 'data-testid': 'a' }, 'a'),
      createElement('button', { 'data-testid': 'b' }, 'b'),
    ),
    createElement('button', { 'data-testid': 'outside' }, 'outside'),
  );
};

const state = () => {
  const box = screen.getByTestId('box');

  return {
    active: box.dataset.active,
    hovered: box.dataset.hovered,
    focus: box.dataset.focus,
  };
};

describe('useHoverOrFocusWithin', () => {
  it('is inactive at first', () => {
    render(createElement(Probe));

    expect(state()).toEqual({
      active: 'false',
      hovered: 'false',
      focus: 'false',
    });
  });

  it('is active while the pointer is over the container', () => {
    render(createElement(Probe));

    fireEvent.mouseEnter(screen.getByTestId('box'));
    expect(state()).toEqual({
      active: 'true',
      hovered: 'true',
      focus: 'false',
    });

    fireEvent.mouseLeave(screen.getByTestId('box'));
    expect(state()).toEqual({
      active: 'false',
      hovered: 'false',
      focus: 'false',
    });
  });

  it('is active while focus is inside the container', () => {
    render(createElement(Probe));

    fireEvent.focus(screen.getByTestId('a'));
    expect(state()).toEqual({
      active: 'true',
      hovered: 'false',
      focus: 'true',
    });

    fireEvent.blur(screen.getByTestId('a'), {
      relatedTarget: screen.getByTestId('outside'),
    });
    expect(state()).toEqual({
      active: 'false',
      hovered: 'false',
      focus: 'false',
    });
  });

  it('stays active when the pointer leaves while focus is inside', () => {
    render(createElement(Probe));

    fireEvent.mouseEnter(screen.getByTestId('box'));
    fireEvent.focus(screen.getByTestId('a'));
    fireEvent.mouseLeave(screen.getByTestId('box'));

    expect(state()).toEqual({
      active: 'true',
      hovered: 'false',
      focus: 'true',
    });
  });

  it('stays active when focus leaves while the pointer is over', () => {
    render(createElement(Probe));

    fireEvent.mouseEnter(screen.getByTestId('box'));
    fireEvent.focus(screen.getByTestId('a'));
    fireEvent.blur(screen.getByTestId('a'), {
      relatedTarget: screen.getByTestId('outside'),
    });

    expect(state()).toEqual({
      active: 'true',
      hovered: 'true',
      focus: 'false',
    });
  });

  it('does not toggle focusWithin when focus moves between two children', () => {
    const onActiveChange = vi.fn();

    render(createElement(Probe, { onActiveChange }));

    fireEvent.focus(screen.getByTestId('a'));
    expect(onActiveChange).toHaveBeenCalledTimes(1);

    fireEvent.blur(screen.getByTestId('a'), {
      relatedTarget: screen.getByTestId('b'),
    });
    expect(state().focus).toBe('true');

    fireEvent.focus(screen.getByTestId('b'));
    expect(state().focus).toBe('true');
    expect(onActiveChange).toHaveBeenCalledTimes(1);
  });

  it('ends focusWithin when focus goes nowhere (relatedTarget is null)', () => {
    render(createElement(Probe));

    fireEvent.focus(screen.getByTestId('a'));
    fireEvent.blur(screen.getByTestId('a'));

    expect(state().focus).toBe('false');
  });

  it('returns no handlers and stays inactive when disabled', () => {
    const { result } = renderHook(() =>
      useHoverOrFocusWithin({ enabled: false }),
    );

    expect(result.current.handlers).toEqual({});
    expect(result.current).toMatchObject({
      active: false,
      hovered: false,
      focusWithin: false,
    });
  });

  it('does not react to events when disabled', () => {
    render(createElement(Probe, { enabled: false }));

    fireEvent.mouseEnter(screen.getByTestId('box'));
    fireEvent.focus(screen.getByTestId('a'));

    expect(state()).toEqual({
      active: 'false',
      hovered: 'false',
      focus: 'false',
    });
  });

  it('clears the flags when it becomes disabled, and starts clean when enabled again', () => {
    const { rerender } = render(createElement(Probe, { enabled: true }));

    fireEvent.mouseEnter(screen.getByTestId('box'));
    expect(state().active).toBe('true');

    rerender(createElement(Probe, { enabled: false }));
    expect(state().active).toBe('false');

    rerender(createElement(Probe, { enabled: true }));
    expect(state()).toEqual({
      active: 'false',
      hovered: 'false',
      focus: 'false',
    });
  });

  describe('onActiveChange', () => {
    it('is called only when active changes', () => {
      const onActiveChange = vi.fn();

      render(createElement(Probe, { onActiveChange }));
      expect(onActiveChange).not.toHaveBeenCalled();

      fireEvent.mouseEnter(screen.getByTestId('box'));
      expect(onActiveChange).toHaveBeenLastCalledWith(true);

      // Focus joins the hover: still active, so no call.
      fireEvent.focus(screen.getByTestId('a'));
      fireEvent.mouseLeave(screen.getByTestId('box'));
      expect(onActiveChange).toHaveBeenCalledTimes(1);

      fireEvent.blur(screen.getByTestId('a'));
      expect(onActiveChange).toHaveBeenCalledTimes(2);
      expect(onActiveChange).toHaveBeenLastCalledWith(false);
    });

    it('calls the callback from the latest render', () => {
      const first = vi.fn();
      const second = vi.fn();
      const { rerender } = render(
        createElement(Probe, { onActiveChange: first }),
      );

      rerender(createElement(Probe, { onActiveChange: second }));
      fireEvent.mouseEnter(screen.getByTestId('box'));

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledWith(true);
    });

    it('reports false when it becomes disabled while active', () => {
      const onActiveChange = vi.fn();
      const { rerender } = render(
        createElement(Probe, { enabled: true, onActiveChange }),
      );

      fireEvent.mouseEnter(screen.getByTestId('box'));
      rerender(createElement(Probe, { enabled: false, onActiveChange }));

      expect(onActiveChange).toHaveBeenLastCalledWith(false);
    });
  });
});
