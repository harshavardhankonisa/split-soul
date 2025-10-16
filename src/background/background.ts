import { setupOnInstalled } from './listeners/onInstalled'
import { setupOnStartup } from './listeners/onStartup'
import { setupOnMessage } from './listeners/onMessage'
import { setupOnSuspend } from './listeners/onSuspend'

console.log('Background service worker starting...')

setupOnInstalled()
setupOnStartup()
setupOnMessage()
setupOnSuspend()
