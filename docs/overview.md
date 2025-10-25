# Split Soul Overview

Concise overview of the Split Soul Chrome extension.

## Purpose

- Multi-agent companion for browsing
- Fully client-side; uses Chromes Built-in AI (Prompt, Summarizer, Writer, Rewriter, Translator, Proofreader)
- Tracks activity and suggests actions (tab management, summaries, agendas)

## Architecture (high-level)

- Background (service worker) Orchestrates agents, actions, storage
- Content script Listens for activity and page context when needed
- Popup UI Chat with Main/Split Souls; access Settings
- Offscreen document Runs APIs that require a window (e.g., Summarizer)
- IndexedDB (Dexie) Stores chats, actions, activities

## Key features

- Activity tracking: activeDuration with idle timeout; simple, append-only
- Agents: Main Soul heartbeat every 5 minutes; Split Souls reply when necessary
- ActionExecutionAgent: 20 tab tools (close, reload, pin, group, mute, move, merge, discard, duplicate, switch, highlight)
- Agenda manager: 2-minute sweep logs and clears active agendas
- Settings: fault-tolerant service with validation and sensible defaults
- Privacy: 100% local by default; no server dependency

## Requirements

- Chrome 138+
- Permissions: tabs, tabGroups, windows, offscreen, storage, scripting, activeTab

## Next steps

- See installation.md to build and load the extension
- See usage.md for example prompts and workflows
