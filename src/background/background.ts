import { setupOnInstalled } from './listeners/onInstalled'
import { setupOnStartup } from './listeners/onStartup'
import { setupOnMessage } from './listeners/onMessage'
import { setupOnSuspend } from './listeners/onSuspend'

import './services/mainSoulAgent'

setupOnInstalled()
setupOnStartup()
setupOnMessage()
setupOnSuspend()
