import { useState, useEffect } from "react"

/**
 * Debounces a value for the specified delay
 * Useful for search inputs to prevent excessive API calls
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 * @returns The debounced value
 *
 * @example
 * const [search, setSearch] = useState("")
 * const debouncedSearch = useDebouncedValue(search, 500)
 *
 * // Use debouncedSearch in query keys
 * const { data } = useQuery({
 *   queryKey: ["items", debouncedSearch],
 *   queryFn: () => fetchItems({ search: debouncedSearch }),
 *   enabled: debouncedSearch.length >= 2, // optional: require min chars
 * })
 */
export function useDebouncedValue<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
