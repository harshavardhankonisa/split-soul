declare global {
  interface Window {
    splitSoulActivityDetector: UserActivityDetector
  }
}

class UserActivityDetector {
  private userActivityEvents: (keyof DocumentEventMap)[] = [
    'mousedown',
    'mouseup',
    'click',
    'dblclick',
    'wheel',
    'contextmenu',
    'keydown',
    'keyup',
    'scroll',
    'dragstart',
    'dragend',
    'drop',
    'touchstart',
    'touchend',
    'touchcancel',
    'pointerdown',
    'pointerup',
    'pointercancel',
    'input',
    'change',
    'paste',
    'copy',
    'cut',
    'focusin',
    'focusout'
  ]
  private activityThrottle: number = 1000
  private lastUpdateSent: number = 0

  constructor() {
    this.setupActivityListeners()
    this.notifyBackgroundOfActivity()
  }

  private setupActivityListeners() {
    this.userActivityEvents.forEach(event => {
      document.addEventListener(event, this.notifyBackgroundOfActivity.bind(this), { passive: true })
    })
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
}

const activityDetector = new UserActivityDetector()
window.splitSoulActivityDetector = activityDetector
