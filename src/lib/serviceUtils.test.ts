import { describe, it, expect } from 'vitest'
import {
  sortByDateDesc,
  sortByDateAsc,
  filterByField,
  countByField,
  mapToSortedArray,
  searchByFields,
} from './serviceUtils'

describe('serviceUtils', () => {
  const testItems = [
    { id: '1', name: 'Alice', status: 'active', createdAt: new Date('2024-01-01') },
    { id: '2', name: 'Bob', status: 'inactive', createdAt: new Date('2024-01-02') },
    { id: '3', name: 'Charlie', status: 'active', createdAt: new Date('2024-01-03') },
  ]

  describe('sortByDateDesc', () => {
    it('should sort items by date descending (newest first)', () => {
      const sorted = sortByDateDesc([...testItems], 'createdAt')
      expect(sorted[0].id).toBe('3')
      expect(sorted[1].id).toBe('2')
      expect(sorted[2].id).toBe('1')
    })
  })

  describe('sortByDateAsc', () => {
    it('should sort items by date ascending (oldest first)', () => {
      const sorted = sortByDateAsc([...testItems], 'createdAt')
      expect(sorted[0].id).toBe('1')
      expect(sorted[1].id).toBe('2')
      expect(sorted[2].id).toBe('3')
    })
  })

  describe('filterByField', () => {
    it('should filter items by field value', () => {
      const filtered = filterByField(testItems, 'status', 'active')
      expect(filtered).toHaveLength(2)
      expect(filtered.map((i) => i.id)).toEqual(['1', '3'])
    })

    it('should return empty array if no matches', () => {
      const filtered = filterByField(testItems, 'status', 'pending' as any)
      expect(filtered).toHaveLength(0)
    })
  })

  describe('countByField', () => {
    it('should count items grouped by field value', () => {
      const counts = countByField(testItems, 'status', ['active', 'inactive', 'pending'])
      expect(counts).toEqual({
        active: 2,
        inactive: 1,
        pending: 0,
      })
    })
  })

  describe('mapToSortedArray', () => {
    it('should convert Map to sorted array (descending by default)', () => {
      const map = new Map(testItems.map((item) => [item.id, item]))
      const sorted = mapToSortedArray(map, 'createdAt')
      expect(sorted[0].id).toBe('3')
      expect(sorted[2].id).toBe('1')
    })

    it('should sort ascending when specified', () => {
      const map = new Map(testItems.map((item) => [item.id, item]))
      const sorted = mapToSortedArray(map, 'createdAt', true)
      expect(sorted[0].id).toBe('1')
      expect(sorted[2].id).toBe('3')
    })
  })

  describe('searchByFields', () => {
    it('should search across multiple fields', () => {
      const results = searchByFields(testItems, 'alice', ['name', 'status'])
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Alice')
    })

    it('should be case-insensitive', () => {
      const results = searchByFields(testItems, 'CHARLIE', ['name'])
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Charlie')
    })

    it('should search partial matches', () => {
      const results = searchByFields(testItems, 'ali', ['name'])
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Alice')
    })

    it('should return all items if query is empty', () => {
      const results = searchByFields(testItems, '', ['name'])
      expect(results).toHaveLength(3)
    })

    it('should return empty array if no matches', () => {
      const results = searchByFields(testItems, 'xyz', ['name'])
      expect(results).toHaveLength(0)
    })
  })
})
