import { activityTracker } from './activityTracker'
import { aiApiBridge } from './aiApiBridge'
import { chatManager } from './chatManager'

export class MainSoulAgent {
  private lastSummary: string | null = null
  private readonly ACTIVE_TABS_CHECK_INTERVAL = 2 * 60 * 1000

  constructor() {
    this.startActiveTabsTimer()
  }

  private startActiveTabsTimer() {
    setInterval(() => this.processActiveTabs(), this.ACTIVE_TABS_CHECK_INTERVAL)
  }
  private async isSimilarSummary(prev: string, current: string): Promise<boolean> {
    const prompt = `You are a strict comparator. Compare two short summaries of recent browsing activity.
      If they convey essentially the same meaning (same sites focus and time emphasis), answer ONLY "SIMILAR".
      Otherwise answer ONLY "DIFFERENT".
        
      Summary A: "${prev}"
      Summary B: "${current}"
      Answer:`
    const resp = await aiApiBridge.prompt(prompt)
    return resp.includes('SIMILAR')
  }

  private async processActiveTabs() {
    const activeActivities = activityTracker.getCurrentActivities()

    if (activeActivities.length === 0) {
      return
    }

    const activityDetails =
      'Activities:\n' +
      activeActivities
        .map(a => {
          const seconds = Math.round(a.activeDuration / 1000)
          const minutes = Math.round(seconds / 60)
          const display = minutes > 0 ? `${minutes}m` : `${seconds}s`
          const startIso = new Date(a.startTime).toISOString()
          const lastIso = new Date(a.lastActivityTime).toISOString()
          return `- websiteTitle: ${a.websiteTitle}\n  websiteUrl: ${a.websiteUrl}\n  isActive: ${a.isActive}\n  startTime: ${startIso}\n  lastActivityTime: ${lastIso}\n  activeDurationMs: ${a.activeDuration}\n  activeDurationDisplay: ${display}`
        })
        .join('\n')

    const summary = await aiApiBridge.summarize(activityDetails, {
      type: 'tldr',
      format: 'plain-text',
      length: 'medium',
      context:
        'Schema: Activity { websiteTitle, websiteUrl, isActive, startTime ISO, lastActivityTime ISO, activeDurationMs, activeDurationDisplay }. ' +
        'Task: Output exactly one sentence starting with "Main Body spent" listing the top 1-3 sites with their times; optionally merge related sites. Add a brief "why" clause (e.g., likely researching coding resources). Keep it friendly & concise.'
    })

    if (this.lastSummary) {
      const similar = await this.isSimilarSummary(this.lastSummary, summary)
      if (similar) return
    }
    this.lastSummary = summary

    chatManager.addChat({
      username: 'Main Soul',
      message: summary
    })
  }
}

export const mainSoulAgent = new MainSoulAgent()
