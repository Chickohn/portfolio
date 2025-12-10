/**
 * Unit tests for utility functions
 */

import { cn, debounce, throttle, scrollToElement } from '@/lib/utils';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('should merge Tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toContain('py-1');
  });
});

describe('debounce utility', () => {
  jest.useFakeTimers();

  it('should debounce function calls', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 1000);

    debouncedFunc();
    debouncedFunc();
    debouncedFunc();

    expect(func).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);

    expect(func).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });
});

describe('throttle utility', () => {
  jest.useFakeTimers();

  it('should throttle function calls', () => {
    const func = jest.fn();
    const throttledFunc = throttle(func, 1000);

    throttledFunc();
    expect(func).toHaveBeenCalledTimes(1);

    throttledFunc();
    expect(func).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);
    throttledFunc();
    expect(func).toHaveBeenCalledTimes(2);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });
});

describe('scrollToElement utility', () => {
  beforeEach(() => {
    // Mock window.scrollTo
    window.scrollTo = jest.fn();
    
    // Mock getElementById
    document.getElementById = jest.fn(() => ({
      offsetTop: 100,
    } as HTMLElement));
  });

  it('should scroll to element when element exists', () => {
    scrollToElement('test-id');
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 100,
      behavior: 'smooth',
    });
  });

  it('should not scroll when element does not exist', () => {
    (document.getElementById as jest.Mock).mockReturnValue(null);
    scrollToElement('non-existent');
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});

