import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import useControllableState from './use-controllable-state';

describe('useControllableState', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('uncontrolled', () => {
    it('starts as the default value', () => {
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: 'a' }),
      );

      expect(result.current[0]).toBe('a');
    });

    it('updates its own state and calls onChange', () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({ defaultValue: 'a', onChange }),
      );

      act(() => result.current[1]('b'));

      expect(result.current[0]).toBe('b');
      expect(onChange).toHaveBeenCalledWith('b');
    });
  });

  describe('controlled', () => {
    it('shows the value prop and ignores the default', () => {
      const { result } = renderHook(() =>
        useControllableState({ value: 'x', defaultValue: 'a' }),
      );

      expect(result.current[0]).toBe('x');
    });

    it('calls onChange but leaves the value to the parent', () => {
      const onChange = vi.fn();
      const { result, rerender } = renderHook(
        ({ value }) => useControllableState({ value, onChange }),
        { initialProps: { value: 'x' } },
      );

      act(() => result.current[1]('y'));
      expect(result.current[0]).toBe('x');
      expect(onChange).toHaveBeenCalledWith('y');

      rerender({ value: 'y' });
      expect(result.current[0]).toBe('y');
    });

    it('does not change its own state while controlled', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { result, rerender } = renderHook(
        ({ value }: { value?: string }) =>
          useControllableState({ value, defaultValue: 'a' }),
        { initialProps: { value: 'x' } as { value?: string } },
      );

      act(() => result.current[1]('y'));
      rerender({ value: undefined });

      expect(result.current[0]).toBe('a');
    });
  });

  describe('switching modes', () => {
    it('warns when it goes from controlled to uncontrolled', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { rerender } = renderHook(
        ({ value }: { value?: string }) =>
          useControllableState({ value, defaultValue: 'a' }),
        { initialProps: { value: 'x' } as { value?: string } },
      );

      rerender({ value: undefined });

      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0]?.[0]).toContain(
        'from controlled to uncontrolled',
      );
    });

    it('warns when it goes from uncontrolled to controlled', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { rerender } = renderHook(
        ({ value }: { value?: string }) =>
          useControllableState({ value, defaultValue: 'a' }),
        { initialProps: {} as { value?: string } },
      );

      rerender({ value: 'x' });

      expect(warn.mock.calls[0]?.[0]).toContain(
        'from uncontrolled to controlled',
      );
    });

    it('does not warn when the mode stays the same', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { rerender } = renderHook(
        ({ value }) => useControllableState({ value }),
        { initialProps: { value: 'x' } },
      );

      rerender({ value: 'y' });

      expect(warn).not.toHaveBeenCalled();
    });

    it('does not warn in production', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'production');

      const { rerender } = renderHook(
        ({ value }: { value?: string }) =>
          useControllableState({ value, defaultValue: 'a' }),
        { initialProps: { value: 'x' } as { value?: string } },
      );

      rerender({ value: undefined });

      expect(warn).not.toHaveBeenCalled();
      vi.unstubAllEnvs();
    });
  });
});
