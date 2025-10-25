# Usage Guide — Split Soul

Concise instructions to use the Split Soul Chrome extension.

## Quick start

1. Build the extension

- npm install
- npm run build

2. Load in Chrome

- Go to chrome://extensions
- Enable Developer mode
- Click “Load unpacked” → select the dist/ folder
- Pin “Split Soul” and click the toolbar icon to open the popup

3. Optional dev loop

- npm run dev (watches and rebuilds to dist/). In chrome://extensions click the “Reload” button to pick up changes.

## Using the chat (Main Body ↔ Souls)

- Type in the popup; Main Soul discusses every 5 minutes; Split Souls reply only when necessary.
- The agent suggests actions; when you approve, the ActionExecutionAgent executes one tool.
- You can directly command tools with natural prompts (see “Tab tools” below).

## Tab tools (20)

Each is invoked via natural language. Examples:

1. Close current tab — “Close the current tab.”
2. Close tabs by domain — “Close all tabs from example.com.”
3. Close inactive tabs — “Close tabs inactive for 45 minutes, keep pinned.”
4. Close duplicated tabs — “Close duplicate tabs across all windows.”
5. Reload tab — “Reload the current tab (hard refresh).”
6. Reload stale tabs — “Reload tabs idle for more than 15 minutes.”
7. Pin by domain — “Pin all tabs from github.com.”
8. Unpin all — “Unpin all tabs in this window.”
9. Mute others — “Mute all other tabs.”
10. Mute audible — “Mute tabs that are playing audio.”
11. Unmute all — “Unmute all tabs.”
12. Move to new window — “Move tabs with titles containing ‘Docs’ to a new window.”
13. Merge all windows — “Merge all windows into the current window.”
14. Group by domain — “Group tabs by domain and collapse them.”
15. Ungroup all — “Ungroup all tabs in this window.”
16. Set group title/color — “Rename this group to ‘Focus’ and set color to blue.”
17. Discard inactive tabs — “Discard tabs inactive for 30 minutes, keep pinned.”
18. Duplicate tab — “Duplicate the current tab.”
19. Switch tab — “Go to the next tab.” or “Go to the previous tab.”
20. Highlight by query — “Highlight tabs whose title contains ‘api’.”

Notes

- For #16: If you omit groupId, the active tab’s group is used (it must be in a group).
- For #1: If a bogus tabId like 0 is inferred, the tool falls back to the active tab.

## Activity tracking (client-only)

- Captures website name/url, startTime/endTime, activeDuration.
- Inactive after 10 minutes without mouse/keyboard; resumes on activity.
- Data is stored locally in IndexedDB (Dexie). No network calls.

## Agenda manager

- Kafka-like array of agendas.
- Every 2 minutes: logs all active agendas and clears them from activeAgendas.
- Console prefix: [AGENDA]

## Settings

Open the Settings in the popup. Configurable:

- API key (if any)
- Activity intervals & throttle
- Idle timeout
- Main Soul enable
- API check toggle
- All settings have sensible defaults and fallback handling

## Troubleshooting

- Popup doesn’t load or changes not reflected
  - Ensure dist/ is loaded. After npm run dev or npm run build, click “Reload” on chrome://extensions.
- Built-in AI (Summarizer) only works with window access
  - The background delegates to an offscreen document to use the Summarizer API.

## Keyboard shortcut

- Default: Command+Shift+Y (mac) / Ctrl+Shift+Y (win/linux) to open the popup (configurable in chrome://extensions → Keyboard shortcuts).

## Privacy

- 100% local. No cloud calls by default. Data stored in your browser.
