import { createElement } from 'react';

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import useRovingFocus from './use-roving-focus';

type Options = Parameters<typeof useRovingFocus>[0];

const LABELS = ['One', 'Two', 'Three', 'Four'];

const Group = ({
  labels = LABELS,
  dir,
  ...options
}: Partial<Options> & { labels?: string[]; dir?: 'ltr' | 'rtl' }) => {
  const { getItemProps } = useRovingFocus({ count: labels.length, ...options });

  return createElement(
    'div',
    { role: 'toolbar', dir, style: { direction: dir } },
    labels.map((label, index) =>
      createElement('button', { key: label, ...getItemProps(index) }, label),
    ),
  );
};

const item = (label: string) => screen.getByRole('button', { name: label });

const tabStops = () =>
  screen
    .getAllByRole('button')
    .filter(element => element.tabIndex === 0)
    .map(element => element.textContent);

const press = (label: string, key: string) => {
  const element = item(label);

  act(() => element.focus());

  return fireEvent.keyDown(element, { key });
};

describe('useRovingFocus', () => {
  it('makes only the active item a Tab stop', () => {
    render(createElement(Group));

    expect(tabStops()).toEqual(['One']);
    expect(item('Two').tabIndex).toBe(-1);
  });

  it('starts at defaultIndex', () => {
    render(createElement(Group, { defaultIndex: 2 }));

    expect(tabStops()).toEqual(['Three']);
  });

  it('moves focus with Up and Down when vertical', () => {
    render(createElement(Group));

    press('One', 'ArrowDown');
    expect(document.activeElement).toBe(item('Two'));
    expect(tabStops()).toEqual(['Two']);

    press('Two', 'ArrowUp');
    expect(document.activeElement).toBe(item('One'));

    press('One', 'ArrowRight');
    expect(document.activeElement).toBe(item('One'));
  });

  it('moves focus with Left and Right when horizontal', () => {
    render(createElement(Group, { orientation: 'horizontal' }));

    press('One', 'ArrowRight');
    expect(document.activeElement).toBe(item('Two'));

    press('Two', 'ArrowLeft');
    expect(document.activeElement).toBe(item('One'));

    press('One', 'ArrowDown');
    expect(document.activeElement).toBe(item('One'));
  });

  it('moves focus with all four arrows when both', () => {
    render(createElement(Group, { orientation: 'both' }));

    press('One', 'ArrowRight');
    press('Two', 'ArrowDown');
    expect(document.activeElement).toBe(item('Three'));

    press('Three', 'ArrowLeft');
    press('Two', 'ArrowUp');
    expect(document.activeElement).toBe(item('One'));
  });

  it('moves to the first and last items with Home and End', () => {
    render(createElement(Group, { defaultIndex: 1 }));

    press('Two', 'End');
    expect(document.activeElement).toBe(item('Four'));

    press('Four', 'Home');
    expect(document.activeElement).toBe(item('One'));
  });

  it('wraps at both ends while loop is on', () => {
    render(createElement(Group));

    press('One', 'ArrowUp');
    expect(document.activeElement).toBe(item('Four'));

    press('Four', 'ArrowDown');
    expect(document.activeElement).toBe(item('One'));
  });

  it('stops at both ends while loop is off', () => {
    render(createElement(Group, { loop: false }));

    press('One', 'ArrowUp');
    expect(document.activeElement).toBe(item('One'));

    press('One', 'End');
    press('Four', 'ArrowDown');
    expect(document.activeElement).toBe(item('Four'));
  });

  it('prevents the default action of the keys it handles only', () => {
    render(createElement(Group, { loop: false }));

    // At the start with loop off there is nowhere to go, but the arrow still
    // must not scroll the page.
    expect(press('One', 'ArrowUp')).toBe(false);
    expect(press('One', 'Enter')).toBe(true);
    expect(press('One', 'ArrowRight')).toBe(true);
  });

  it('ignores arrows with Alt, Control or Meta held', () => {
    render(createElement(Group));

    const element = item('One');

    act(() => element.focus());
    fireEvent.keyDown(element, { key: 'ArrowDown', altKey: true });
    fireEvent.keyDown(element, { key: 'ArrowDown', ctrlKey: true });
    fireEvent.keyDown(element, { key: 'ArrowDown', metaKey: true });

    expect(document.activeElement).toBe(element);
  });

  it('swaps Left and Right in a right-to-left container', () => {
    render(createElement(Group, { orientation: 'horizontal', dir: 'rtl' }));

    press('One', 'ArrowLeft');
    expect(document.activeElement).toBe(item('Two'));

    press('Two', 'ArrowRight');
    expect(document.activeElement).toBe(item('One'));
  });

  it('skips disabled items, including on Home and End', () => {
    const isDisabled = (index: number) => index === 0 || index === 2;

    render(createElement(Group, { defaultIndex: 1, isDisabled }));

    press('Two', 'ArrowDown');
    expect(document.activeElement).toBe(item('Four'));

    press('Four', 'Home');
    expect(document.activeElement).toBe(item('Two'));

    press('Two', 'ArrowUp');
    expect(document.activeElement).toBe(item('Four'));
  });

  it('makes an item focused by click or from code the Tab stop', () => {
    render(createElement(Group));

    act(() => item('Three').focus());

    expect(tabStops()).toEqual(['Three']);
  });

  it('reports changes without moving the Tab stop in controlled mode', () => {
    const onActiveIndexChange = vi.fn();

    render(createElement(Group, { activeIndex: 0, onActiveIndexChange }));

    press('One', 'ArrowDown');

    expect(onActiveIndexChange).toHaveBeenCalledTimes(1);
    expect(onActiveIndexChange).toHaveBeenCalledWith(1);
    expect(tabStops()).toEqual(['One']);
  });

  it('follows activeIndex in controlled mode', () => {
    const { rerender } = render(createElement(Group, { activeIndex: 0 }));

    rerender(createElement(Group, { activeIndex: 3 }));

    expect(tabStops()).toEqual(['Four']);
  });

  it('reports each move once in uncontrolled mode', () => {
    const onActiveIndexChange = vi.fn();

    render(createElement(Group, { onActiveIndexChange }));

    press('One', 'ArrowDown');
    press('Two', 'End');

    expect(onActiveIndexChange.mock.calls).toEqual([[1], [3]]);
  });

  it('clamps the active index when count shrinks', () => {
    const { rerender } = render(createElement(Group, { defaultIndex: 3 }));

    rerender(createElement(Group, { labels: ['One', 'Two'] }));

    expect(tabStops()).toEqual(['Two']);
  });

  it('returns the active index', () => {
    const { result } = renderHook(() =>
      useRovingFocus({ count: 3, defaultIndex: 2 }),
    );

    expect(result.current.activeIndex).toBe(2);
  });
});
