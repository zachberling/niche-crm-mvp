import { Activity, CreateActivity, ActivitySchema, ActivityType } from '@/types/activity'
import { v4 as uuidv4 } from 'uuid'

/**
 * In-memory activity storage for MVP
 * In production, this would be replaced with a database layer
 */
class ActivityService {
  private activities: Map<string, Activity> = new Map()

  /**
   * Create a new activity
   */
  async create(data: CreateActivity): Promise<Activity> {
    const activity: Activity = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
    }

    // Validate with Zod schema
    const validated = ActivitySchema.parse(activity)
    
    this.activities.set(validated.id, validated)
    return validated
  }

  /**
   * Get an activity by ID
   */
  async getById(id: string): Promise<Activity | null> {
    const activity = this.activities.get(id)
    return activity || null
  }

  /**
   * Get all activities
   */
  async getAll(): Promise<Activity[]> {
    return Array.from(this.activities.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  /**
   * Get activities for a specific contact
   */
  async getByContactId(contactId: string): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.contactId === contactId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  /**
   * Get activities by type
   */
  async getByType(type: ActivityType): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.type === type)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  /**
   * Get activities for a contact filtered by type
   */
  async getByContactIdAndType(contactId: string, type: ActivityType): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.contactId === contactId && activity.type === type)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  /**
   * Get recent activities across all contacts
   */
  async getRecent(limit: number = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
  }

  /**
   * Get activity count by type
   */
  async getTypeCounts(): Promise<Record<ActivityType, number>> {
    const activities = Array.from(this.activities.values())
    
    return {
      call: activities.filter(a => a.type === 'call').length,
      email: activities.filter(a => a.type === 'email').length,
      meeting: activities.filter(a => a.type === 'meeting').length,
      note: activities.filter(a => a.type === 'note').length,
      task: activities.filter(a => a.type === 'task').length,
      status_change: activities.filter(a => a.type === 'status_change').length,
    }
  }

  /**
   * Get activities within a date range
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => {
        const activityDate = activity.createdAt.getTime()
        return activityDate >= startDate.getTime() && activityDate <= endDate.getTime()
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  /**
   * Delete an activity
   */
  async delete(id: string): Promise<boolean> {
    return this.activities.delete(id)
  }

  /**
   * Delete all activities for a contact
   */
  async deleteByContactId(contactId: string): Promise<number> {
    const toDelete = Array.from(this.activities.values())
      .filter(activity => activity.contactId === contactId)
    
    let deletedCount = 0
    for (const activity of toDelete) {
      if (this.activities.delete(activity.id)) {
        deletedCount++
      }
    }
    
    return deletedCount
  }

  /**
   * Get total activity count
   */
  async count(): Promise<number> {
    return this.activities.size
  }

  /**
   * Get activity count for a specific contact
   */
  async countByContactId(contactId: string): Promise<number> {
    return Array.from(this.activities.values())
      .filter(activity => activity.contactId === contactId)
      .length
  }

  /**
   * Clear all activities (useful for testing)
   */
  async clear(): Promise<void> {
    this.activities.clear()
  }
}

// Export singleton instance
export const activityService = new ActivityService()
