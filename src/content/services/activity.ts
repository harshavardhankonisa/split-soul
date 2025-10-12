declare global {
  interface Window {
    splitSoulActivityDetector: UserActivityDetector
  }
}

class UserActivityDetector {
  private isActive: boolean = true
  private activityThrottle: number = 1000
  private lastUpdateSent: number = 0
  private audioCheckInterval: number = 5000

  constructor() {
    this.setupActivityListeners()
    this.notifyBackgroundOfActivity()
    this.setupAudioMonitoring()
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
    window.addEventListener('blur', async () => await this.handleWindowBlur(), { passive: true })

    // Visibility change
    document.addEventListener('visibilitychange', async () => await this.handleVisibilityChange())
  }

  private handleActivity() {
    const now = Date.now()

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

  private async isAudioPlaying(): Promise<boolean> {
    try {
      const tabInfo = await chrome.runtime.sendMessage({
        type: 'GET_CURRENT_TAB_INFO'
      })
      return tabInfo?.audible || false
    } catch (error) {
      console.debug('Error checking audio status:', error)
      return false
    }
  }

  private async handleWindowBlur() {
    if (!(await this.isAudioPlaying())) {
      this.handleInactivity()
    }
  }

  private async handleVisibilityChange() {
    if (document.hidden && !(await this.isAudioPlaying())) {
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

    chrome.runtime.sendMessage({ type: 'ACTIVITY_TRACKER' }).catch(error => {
      console.debug('Could not send activity to background:', error)
    })
  }

  private setupAudioMonitoring() {
    setInterval(async () => {
      const isAudioPlaying = await this.isAudioPlaying()
      if (!isAudioPlaying && this.isActive) {
        this.handleInactivity()
      }
    }, this.audioCheckInterval)
  }
}

const activityDetector = new UserActivityDetector()
window.splitSoulActivityDetector = activityDetector
