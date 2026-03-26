/**
 * Shared utility functions for service classes
 * Reduces code duplication across contactService, leadService, and activityService
 */

/**
 * Sort items by a date field in descending order (newest first)
 */
export function sortByDateDesc<T>(
  items: T[],
  dateField: keyof T
): T[] {
  return items.sort((a, b) => {
    const dateA = a[dateField] as unknown as Date
    const dateB = b[dateField] as unknown as Date
    return dateB.getTime() - dateA.getTime()
  })
}

/**
 * Sort items by a date field in ascending order (oldest first)
 */
export function sortByDateAsc<T>(
  items: T[],
  dateField: keyof T
): T[] {
  return items.sort((a, b) => {
    const dateA = a[dateField] as unknown as Date
    const dateB = b[dateField] as unknown as Date
    return dateA.getTime() - dateB.getTime()
  })
}

/**
 * Filter items by a field value
 */
export function filterByField<T, K extends keyof T>(
  items: T[],
  field: K,
  value: T[K]
): T[] {
  return items.filter((item) => item[field] === value)
}

/**
 * Count items grouped by a field value
 */
export function countByField<T, K extends keyof T>(
  items: T[],
  field: K,
  possibleValues: T[K][]
): Record<string, number> {
  const counts: Record<string, number> = {}
  
  possibleValues.forEach((value) => {
    counts[String(value)] = items.filter((item) => item[field] === value).length
  })
  
  return counts
}

/**
 * Convert Map to sorted array
 */
export function mapToSortedArray<T>(
  map: Map<string, T>,
  sortField: keyof T,
  ascending = false
): T[] {
  const items = Array.from(map.values())
  return ascending 
    ? sortByDateAsc(items, sortField)
    : sortByDateDesc(items, sortField)
}

/**
 * Search items by multiple text fields (case-insensitive)
 */
export function searchByFields<T>(
  items: T[],
  query: string,
  searchFields: (keyof T)[]
): T[] {
  const lowercaseQuery = query.toLowerCase().trim()
  
  if (!lowercaseQuery) {
    return items
  }

  return items.filter((item) => {
    const fieldsToSearch = searchFields
      .map((field) => item[field])
      .filter(Boolean)
      .map((field) => String(field).toLowerCase())

    return fieldsToSearch.some((field) => field.includes(lowercaseQuery))
  })
}
