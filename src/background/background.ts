import { setupOnInstalled } from './listeners/onInstalled'
import { setupOnStartup } from './listeners/onStartup'
import { setupOnMessage } from './listeners/onMessage'
import { setupOnSuspend } from './listeners/onSuspend'

console.log('Background service worker starting...')

setupOnInstalled()
setupOnStartup()
setupOnMessage()
setupOnSuspend()

// TODO: This functionality gets summary actively for every 30 seconds.
// Use this type of polling for main soul to get updates every 30 seconds in Chat.

// setInterval(() => {
//   const activities = activityTracker.getCurrentActivities()
//   if (activities.length > 0) {
//     console.log('[ACTIVITY SUMMARY]', activities.map(a => ({
//       website: a.websiteName,
//       active: a.isActive,
//       activeDuration: Math.round(a.activeDuration / 1000) + 's',
//       totalDuration: Math.round(a.totalDuration / 1000) + 's'
//     })))
//   }
// }, 30000)
