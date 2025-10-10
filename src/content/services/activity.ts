declare global {
  interface Window {
    splitSoulActivityDetector: UserActivityDetector
  }
}

class UserActivityDetector {
  private lastActivityTime: number = Date.now()
  private isActive: boolean = true
  private activityThrottle: number = 1000
  private lastUpdateSent: number = 0

  constructor() {
    this.setupActivityListeners()
    this.notifyBackgroundOfActivity()
  }

  private setupActivityListeners() {
    // Mouse events
    document.addEventListener('mousemove', this.handleActivity.bind(this), { passive: true })
    document.addEventListener('mousedown', this.handleActivity.bind(this), { passive: true })
    document.addEventListener('mouseup', this.handleActivity.bind(this), { passive: true })
    document.addEventListener('click', this.handleActivity.bind(this), { passive: true })
    document.addEventListener('wheel', this.handleActivity.bind(this), { passive: true })

    // Keyboard events
    document.addEventListener('keydown', this.handleActivity.bind(this), { passive: true })
    document.addEventListener('keyup', this.handleActivity.bind(this), { passive: true })

    // Scroll events
    document.addEventListener('scroll', this.handleActivity.bind(this), { passive: true })

    // Touch events
    document.addEventListener('touchstart', this.handleActivity.bind(this), { passive: true })
    document.addEventListener('touchmove', this.handleActivity.bind(this), { passive: true })
    document.addEventListener('touchend', this.handleActivity.bind(this), { passive: true })

    // Focus events
    window.addEventListener('focus', this.handleActivity.bind(this), { passive: true })
    window.addEventListener('blur', this.handleInactivity.bind(this), { passive: true })

    // Visibility change
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
  }

  private removeActivityListeners() {
    // Mouse events
    document.removeEventListener('mousemove', this.handleActivity.bind(this))
    document.removeEventListener('mousedown', this.handleActivity.bind(this))
    document.removeEventListener('mouseup', this.handleActivity.bind(this))
    document.removeEventListener('click', this.handleActivity.bind(this))
    document.removeEventListener('wheel', this.handleActivity.bind(this))

    // Keyboard events
    document.removeEventListener('keydown', this.handleActivity.bind(this))
    document.removeEventListener('keyup', this.handleActivity.bind(this))

    // Scroll events
    document.removeEventListener('scroll', this.handleActivity.bind(this))

    // Touch events
    document.removeEventListener('touchstart', this.handleActivity.bind(this))
    document.removeEventListener('touchmove', this.handleActivity.bind(this))
    document.removeEventListener('touchend', this.handleActivity.bind(this))

    // Focus events
    window.removeEventListener('focus', this.handleActivity.bind(this))
    window.removeEventListener('blur', this.handleInactivity.bind(this))

    // Visibility change
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
  }

  private handleActivity() {
    const now = Date.now()
    this.lastActivityTime = now

    if (!this.isActive) {
      this.isActive = true
      this.notifyBackgroundOfActivity()
    } else if (now - this.lastUpdateSent > this.activityThrottle) {
      this.notifyBackgroundOfActivity()
    }
  }

  private handleInactivity() {
    this.isActive = false
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      this.handleInactivity()
    } else {
      this.handleActivity()
    }
  }

  private notifyBackgroundOfActivity() {
    const now = Date.now()
    if (now - this.lastUpdateSent < this.activityThrottle) {
      return
    }

    this.lastUpdateSent = now

    chrome.runtime
      .sendMessage({
        type: 'USER_ACTIVITY',
        data: {
          timestamp: now,
          url: window.location.href,
          title: document.title,
          isActive: this.isActive
        }
      })
      .catch(error => {
        console.debug('Could not send activity to background:', error)
      })
  }

  public getActivityStatus() {
    return {
      isActive: this.isActive,
      lastActivityTime: this.lastActivityTime,
      currentUrl: window.location.href,
      currentTitle: document.title
    }
  }

  public destroy() {
    this.removeActivityListeners()
  }
}

const activityDetector = new UserActivityDetector()
window.splitSoulActivityDetector = activityDetector
