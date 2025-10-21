import type { Activity } from '../../interface/database'
import { ActivityUtils } from '../../utils/activity'
import { createActivity, updateActivity } from '../../services/dexie/collections/activity'

class ActivityTracker {
  private activeActivities: Map<number, Activity> = new Map()
  private readonly IDLE_TIMEOUT = 10 * 60 * 1000
  private readonly ACTIVITY_CHECK_INTERVAL = 1000

  constructor() {
    this.setupTabListeners()
    this.setupActivityTimers()
  }

  private async handleTabActivated(tabId: number) {
    await this.pauseAllActivities()
    const tab = await chrome.tabs.get(tabId)
    if (!tab.url || !ActivityUtils.shouldTrackUrl(tab.url)) {
      return
    }
    await this.resumeOrCreateActivity(tabId, tab)
  }

  private async handleTabUpdated(tabId: number, tab: chrome.tabs.Tab) {
    if (!tab.url || !ActivityUtils.shouldTrackUrl(tab.url)) {
      return
    }
    const existingActivity = this.activeActivities.get(tabId)
    if (existingActivity && existingActivity.websiteUrl !== tab.url) {
      await this.endActivity(tabId)
      await this.createNewActivity(tabId, tab)
    } else if (!existingActivity) {
      await this.createNewActivity(tabId, tab)
    }
  }

  private async handleTabClosed(tabId: number) {
    await this.endActivity(tabId)
  }

  private async createNewActivity(tabId: number, tab: chrome.tabs.Tab) {
    const existingActivity = this.activeActivities.get(tabId)
    if (existingActivity && existingActivity.websiteUrl === tab.url) {
      return
    }

    const now = new Date()
    const activity: Omit<Activity, 'id'> = {
      tabId,
      websiteTitle: tab.title || '',
      websiteUrl: tab.url!,
      startTime: now,
      endTime: new Date(0),
      isActive: true,
      lastActivityTime: now,
      activeDuration: 0,
      createdAt: now,
      updatedAt: now,
      vector: []
    }
    const id = await createActivity(activity)
    this.activeActivities.set(tabId, { ...activity, id })
  }

  private async resumeOrCreateActivity(tabId: number, tab: chrome.tabs.Tab) {
    const existingActivity = this.activeActivities.get(tabId)
    if (existingActivity) {
      existingActivity.isActive = true
      const now = new Date()
      existingActivity.lastActivityTime = now
      existingActivity.updatedAt = now
      existingActivity.websiteUrl = tab.url || existingActivity.websiteUrl
      existingActivity.websiteTitle = tab.title || existingActivity.websiteTitle
    } else {
      await this.createNewActivity(tabId, tab)
    }
  }

  private async endActivity(tabId: number) {
    const activity = this.activeActivities.get(tabId)
    if (!activity) return
    const now = new Date()
    activity.endTime = now
    activity.isActive = false
    activity.updatedAt = now
    await updateActivity(activity.id, {
      endTime: activity.endTime,
      isActive: false,
      activeDuration: activity.activeDuration,
      updatedAt: activity.updatedAt
    })
    this.activeActivities.delete(tabId)
  }

  private setupActivityTimers() {
    setInterval(async () => {
      const now = Date.now()
      for (const activity of this.activeActivities.values()) {
        const tab = await chrome.tabs.get(activity.tabId)
        if (tab.audible) {
          activity.isActive = true
          activity.lastActivityTime = new Date()
          activity.updatedAt = new Date()
        }
        const timeSinceLastActivity = now - activity.lastActivityTime.getTime()
        if (timeSinceLastActivity >= this.IDLE_TIMEOUT && activity.isActive) {
          activity.isActive = false
          activity.updatedAt = new Date()
          await updateActivity(activity.id, {
            isActive: false,
            updatedAt: activity.updatedAt,
            activeDuration: activity.activeDuration
          })
        } else if (activity.isActive) {
          activity.activeDuration += this.ACTIVITY_CHECK_INTERVAL
          activity.updatedAt = new Date()
        }
      }
    }, this.ACTIVITY_CHECK_INTERVAL)
  }

  private async pauseAllActivities() {
    for (const activity of this.activeActivities.values()) {
      if (activity.isActive) {
        activity.isActive = false
        activity.updatedAt = new Date()
        await updateActivity(activity.id, {
          isActive: false,
          updatedAt: activity.updatedAt,
          activeDuration: activity.activeDuration
        })
      }
    }
  }

  private setupTabListeners() {
    chrome.tabs.onActivated.addListener(async activeInfo => {
      await this.handleTabActivated(activeInfo.tabId)
    })

    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' || typeof changeInfo.url === 'string') {
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

    chrome.windows.onRemoved.addListener(async () => {
      const tabsToRemove: number[] = []
      for (const [tabId] of this.activeActivities) {
        try {
          await chrome.tabs.get(tabId)
        } catch {
          tabsToRemove.push(tabId)
        }
      }
      for (const tabId of tabsToRemove) {
        await this.endActivity(tabId)
      }
    })

    chrome.tabs.onReplaced.addListener(async removedTabId => {
      await this.endActivity(removedTabId)
    })

    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
      if (changeInfo.discarded === true) {
        await this.endActivity(tabId)
      }
    })
  }

  public handleUserActivity(sender: chrome.runtime.MessageSender) {
    const tabId = sender.tab?.id
    if (tabId == null) return
    const activity = this.activeActivities.get(tabId)
    if (activity) {
      const now = new Date()
      activity.lastActivityTime = now
      activity.websiteUrl = sender.tab?.url || activity.websiteUrl
      activity.websiteTitle = sender.tab?.title || activity.websiteTitle
      activity.updatedAt = now
      activity.isActive = true
    }
  }

  public getCurrentActivities(): Activity[] {
    return Array.from(this.activeActivities.values())
  }

  public async shutdown() {
    const tabIds = Array.from(this.activeActivities.keys())
    for (const tabId of tabIds) {
      await this.endActivity(tabId)
    }
  }
}

export const activityTracker = new ActivityTracker()
