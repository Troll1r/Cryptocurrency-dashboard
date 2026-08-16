import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('bitcoin', 300))

    expect(result.current).toBe('bitcoin')
  })

  it('updates the value only after the delay', () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'bitcoin' },
    })

    rerender({ value: 'ethereum' })

    expect(result.current).toBe('bitcoin')

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('ethereum')
  })

  it('clears the pending update when the value changes again', () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'bitcoin' },
    })

    rerender({ value: 'ethereum' })
    rerender({ value: 'solana' })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('solana')
  })
})
