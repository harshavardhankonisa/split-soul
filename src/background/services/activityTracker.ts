import type { Activity } from '../../interface/database'
import { ActivityUtils } from '../../utils/activity'
import { createActivity, updateActivity, getAllActivitys } from '../../services/dexie/collections/activity'

class ActivityTracker {
  private activeActivities: Map<number, Activity> = new Map()
  private readonly IDLE_TIMEOUT = 10 * 60 * 1000
  private readonly ACTIVITY_CHECK_INTERVAL = 1000

  constructor() {
    this.setupTabListeners()
    this.setupActivityTimers()
    this.restoreActiveActivities()
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
      existingActivity.lastActivityTime = new Date()
      existingActivity.updatedAt = new Date()
      await updateActivity(existingActivity.id, {
        isActive: true,
        lastActivityTime: existingActivity.lastActivityTime,
        updatedAt: existingActivity.updatedAt
      })
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
        const timeSinceLastActivity = now - activity.lastActivityTime.getTime()
        if (timeSinceLastActivity >= this.IDLE_TIMEOUT) {
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
          await updateActivity(activity.id, {
            activeDuration: activity.activeDuration,
            updatedAt: activity.updatedAt
          })
        }
      }
    }, this.ACTIVITY_CHECK_INTERVAL)
  }

  private async pauseAllActivities() {
    for (const [tabId, activity] of this.activeActivities) {
      if (activity.isActive) {
        if ((await chrome.tabs.get(tabId)).audible === false) {
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
  }

  private async restoreActiveActivities() {
    const allActivities = await getAllActivitys()
    const activeActivities = allActivities.filter(activity => activity.isActive && activity.endTime.getTime() === 0)
    for (const activity of activeActivities) {
      try {
        await chrome.tabs.get(activity.tabId)
        this.activeActivities.set(activity.tabId, activity)
      } catch {
        await updateActivity(activity.id, {
          endTime: new Date(),
          isActive: false,
          updatedAt: new Date()
        })
      }
    }
  }

  private setupTabListeners() {
    chrome.tabs.onActivated.addListener(async activeInfo => {
      await this.handleTabActivated(activeInfo.tabId)
    })

    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete') {
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

    chrome.runtime.onStartup.addListener(async () => {
      await this.restoreActiveActivities()
    })
  }

  public handleUserActivity(sender: chrome.runtime.MessageSender) {
    const tabId = sender.tab!.id!
    const activity = this.activeActivities.get(tabId)

    if (activity) {
      const now = new Date()
      activity.lastActivityTime = now
      activity.websiteUrl = sender.tab?.url || ''
      activity.websiteTitle = sender.tab?.title || ''
      activity.updatedAt = now
      activity.isActive = true
      updateActivity(activity.id, {
        isActive: true,
        lastActivityTime: now,
        updatedAt: now,
        websiteUrl: sender.tab?.url || '',
        websiteTitle: sender.tab?.title || ''
      })
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
