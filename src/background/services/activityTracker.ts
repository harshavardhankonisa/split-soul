import type { Activity } from '../../interface/database'
import { ActivityUtils } from '../../utils/activity'
import { createActivity, updateActivity } from '../../services/dexie/collections/activity'

class ActivityTracker {
  private activeActivities: Map<number, Activity> = new Map()
  private activityTimers: Map<number, NodeJS.Timeout> = new Map()
  private persistedActivityIds: Map<number, number> = new Map()
  private readonly IDLE_TIMEOUT = 10 * 60 * 1000
  private readonly ACTIVITY_CHECK_INTERVAL = 1000
  private readonly PERSISTENCE_INTERVAL = 30 * 1000
  private persistenceTimer: NodeJS.Timeout | null = null

  constructor() {
    this.setupTabListeners()
    this.setupActivityTimers()
    this.setupPeriodicPersistence()
    this.recoverActiveActivities()
  }

  private async handleTabActivated(tabId: number) {
    try {
      await this.pauseAllActivities()

      const tab = await chrome.tabs.get(tabId)
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        return
      }

      await this.resumeOrCreateActivity(tabId, tab)
    } catch (error) {
      console.error('Error handling tab activation:', error)
    }
  }

  private async handleTabUpdated(tabId: number, tab: chrome.tabs.Tab) {
    try {
      if (!tab.url || !ActivityUtils.shouldTrackUrl(tab.url)) {
        return
      }

      const existingActivity = this.activeActivities.get(tabId)

      if (existingActivity && existingActivity.websiteUrl !== tab.url) {
        // URL changed - end current activity and start new one
        await this.endActivity(tabId)
        await this.createNewActivity(tabId, tab)
      } else if (!existingActivity) {
        // New activity for this tab
        await this.createNewActivity(tabId, tab)
      }
    } catch (error) {
      console.error('Error handling tab update:', error)
    }
  }

  private async handleTabClosed(tabId: number) {
    await this.endActivity(tabId)
  }

  private async pauseAllActivities() {
    for (const [tabId, activity] of this.activeActivities) {
      if (activity.isActive) {
        activity.isActive = false
        activity.updatedAt = new Date()
        activity.tabId = tabId
        this.logActivity(activity, 'PAUSED')

        // Update persisted activity
        try {
          const persistedId = this.persistedActivityIds.get(tabId)
          if (persistedId) {
            await updateActivity(persistedId, {
              isActive: false,
              updatedAt: activity.updatedAt,
              activeDuration: activity.activeDuration,
              totalDuration: activity.totalDuration
            })
          }
        } catch (error) {
          console.error(`Failed to update paused activity for tab ${tabId}:`, error)
        }
      }
    }
  }

  private async createNewActivity(tabId: number, tab: chrome.tabs.Tab) {
    const now = new Date()

    const activity: Activity = {
      id: Date.now(),
      tags: [],
      websiteName: '',
      websiteUrl: tab.url!,
      summary: '',
      startTime: now,
      activeDuration: 0,
      totalDuration: 0,
      isActive: true,
      lastActivityTime: now,
      tabId,
      createdAt: now,
      updatedAt: now,
      vector: [],
      endTime: now
    }

    this.activeActivities.set(tabId, activity)

    // Immediately persist new activity to prevent data loss
    try {
      const persistedId = await createActivity(activity)
      this.persistedActivityIds.set(tabId, persistedId)
      activity.id = persistedId // Update with the actual DB ID
    } catch (error) {
      console.error('Failed to persist new activity:', error)
    }

    this.logActivity(activity, 'STARTED')
  }

  private async resumeOrCreateActivity(tabId: number, tab: chrome.tabs.Tab) {
    const existingActivity = this.activeActivities.get(tabId)

    if (existingActivity) {
      // Resume existing activity
      existingActivity.isActive = true
      existingActivity.lastActivityTime = new Date()
      existingActivity.updatedAt = new Date()
      this.logActivity(existingActivity, 'RESUMED')

      // Update persisted activity
      try {
        const persistedId = this.persistedActivityIds.get(tabId)
        if (persistedId) {
          await updateActivity(persistedId, {
            isActive: true,
            lastActivityTime: existingActivity.lastActivityTime,
            updatedAt: existingActivity.updatedAt
          })
        }
      } catch (error) {
        console.error(`Failed to update resumed activity for tab ${tabId}:`, error)
      }
    } else {
      // Create new activity
      await this.createNewActivity(tabId, tab)
    }
  }

  private async endActivity(tabId: number) {
    const activity = this.activeActivities.get(tabId)
    if (!activity) return

    const now = new Date()
    activity.endTime = now
    activity.isActive = false
    activity.totalDuration = now.getTime() - activity.startTime.getTime()
    activity.updatedAt = now

    this.logActivity(activity, 'ENDED')

    try {
      const persistedId = this.persistedActivityIds.get(tabId)
      if (persistedId) {
        // Update existing persisted activity
        await updateActivity(persistedId, {
          endTime: activity.endTime,
          isActive: false,
          totalDuration: activity.totalDuration,
          activeDuration: activity.activeDuration,
          updatedAt: activity.updatedAt
        })
        this.persistedActivityIds.delete(tabId)
      } else {
        // Create new activity (fallback for activities not yet persisted)
        await createActivity(activity)
      }
    } catch (error) {
      console.error('Failed to save activity to database:', error)
    }

    this.activeActivities.delete(tabId)

    const timer = this.activityTimers.get(tabId)
    if (timer) {
      clearTimeout(timer)
      this.activityTimers.delete(tabId)
    }
  }

  private checkIdleActivities() {
    const now = Date.now()

    for (const [tabId, activity] of this.activeActivities) {
      if (activity.isActive) {
        const timeSinceLastActivity = now - activity.lastActivityTime.getTime()

        if (timeSinceLastActivity >= this.IDLE_TIMEOUT) {
          // Mark as idle but don't increment active duration
          activity.isActive = false
          activity.updatedAt = new Date()
          activity.tabId = tabId
          this.logActivity(activity, 'IDLE')
        } else {
          // Still active - increment active duration
          activity.activeDuration += this.ACTIVITY_CHECK_INTERVAL
          activity.totalDuration = now - activity.startTime.getTime()
          activity.updatedAt = new Date()
          activity.tabId = tabId
        }
      }
    }
  }

  private logActivity(activity: Activity, action: string) {
    console.log(`[ACTIVITY ${action}]`, {
      websiteName: activity.websiteName,
      websiteUrl: activity.websiteUrl,
      tabId: activity.tabId,
      startTime: activity.startTime.toISOString(),
      endTime: activity.endTime?.toISOString(),
      activeDuration: ActivityUtils.formatDuration(activity.activeDuration),
      totalDuration: ActivityUtils.formatDuration(activity.totalDuration),
      isActive: activity.isActive,
      lastActivityTime: activity.lastActivityTime.toISOString()
    })
  }

  private setupActivityTimers() {
    setInterval(() => {
      this.checkIdleActivities()
    }, this.ACTIVITY_CHECK_INTERVAL)
  }

  private setupPeriodicPersistence() {
    this.persistenceTimer = setInterval(() => {
      this.persistActiveActivities()
    }, this.PERSISTENCE_INTERVAL)
  }

  private async persistActiveActivities() {
    for (const [tabId, activity] of this.activeActivities) {
      try {
        const persistedId = this.persistedActivityIds.get(tabId)
        if (persistedId) {
          // Update existing persisted activity
          await updateActivity(persistedId, {
            activeDuration: activity.activeDuration,
            totalDuration: activity.totalDuration,
            lastActivityTime: activity.lastActivityTime,
            isActive: activity.isActive,
            updatedAt: activity.updatedAt
          })
        }
      } catch (error) {
        console.error(`Failed to persist activity for tab ${tabId}:`, error)
      }
    }
  }

  private async recoverActiveActivities() {
    try {
      // Get all active activities from the database
      const tabs = await chrome.tabs.query({})

      for (const tab of tabs) {
        if (!tab.id || !tab.url || !ActivityUtils.shouldTrackUrl(tab.url)) {
          continue
        }

        // Check if there's an active activity for this tab in the database
        // This is a simplified recovery - in a more robust implementation,
        // you might want to store tab-to-activity mappings in chrome.storage
        // For now, we'll just ensure fresh tracking starts
      }
    } catch (error) {
      console.error('Failed to recover active activities:', error)
    }
  }

  private setupTabListeners() {
    chrome.tabs.onActivated.addListener(async activeInfo => {
      await this.handleTabActivated(activeInfo.tabId)
    })

    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        await this.handleTabUpdated(tabId, tab)
      }
    })

    chrome.tabs.onRemoved.addListener(async tabId => {
      await this.handleTabClosed(tabId)
    })

    chrome.windows.onFocusChanged.addListener(async windowId => {
      if (windowId === chrome.windows.WINDOW_ID_NONE) {
        await this.pauseAllActivities()
      } else {
        const tabs = await chrome.tabs.query({ active: true, windowId })
        if (tabs[0]) {
          await this.handleTabActivated(tabs[0].id!)
        }
      }
    })
  }

  public getCurrentActivities(): Activity[] {
    return Array.from(this.activeActivities.values())
  }

  public handleUserActivity(tabId: number) {
    const activity = this.activeActivities.get(tabId)
    if (activity) {
      const wasInactive = !activity.isActive
      activity.lastActivityTime = new Date()
      if (!activity.isActive) {
        activity.isActive = true
        this.logActivity(activity, 'REACTIVATED')
      }

      // Update persisted activity if it was reactivated
      if (wasInactive) {
        try {
          const persistedId = this.persistedActivityIds.get(tabId)
          if (persistedId) {
            updateActivity(persistedId, {
              isActive: true,
              lastActivityTime: activity.lastActivityTime,
              updatedAt: new Date()
            }).catch(error => {
              console.error(`Failed to update reactivated activity for tab ${tabId}:`, error)
            })
          }
        } catch (error) {
          console.error(`Failed to update reactivated activity for tab ${tabId}:`, error)
        }
      }
    }
  }

  public async shutdown() {
    await this.persistActiveActivities()

    const tabIds = Array.from(this.activeActivities.keys())
    for (const tabId of tabIds) {
      await this.endActivity(tabId)
    }

    this.cleanup()
  }

  public cleanup() {
    if (this.persistenceTimer) {
      clearInterval(this.persistenceTimer)
      this.persistenceTimer = null
    }

    for (const timer of this.activityTimers.values()) {
      clearTimeout(timer)
    }
    this.activityTimers.clear()
  }
}

export const activityTracker = new ActivityTracker()
