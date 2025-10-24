import type { User } from '../interface/database'

export const defaultUsers: Omit<User, 'id'>[] = [
  {
    username: 'Main Body',
    description: `## Role
      Human user; central persona directing chats and approving actions.
        
      ## Mission
      Set goals, ask questions, and review/approve actions.
        
      ## Cadence
      - Replies ad-hoc; expects Main Soul updates every 5 minutes.
        
      ## Do
      - Provide clear prompts and priorities.
      - Approve/deny suggested actions.
      - Toggle souls on/off.
        
      ## Don't
      - Perform autonomous actions; delegate to souls.`,
    isActive: true,
    vector: []
  },
  {
    username: 'Main Soul',
    description: `## Role
      Primary agent coordinating all souls.

      ## Mission
      Every 5 minutes: summarize activity, merge split-soul opinions, and propose one concise action.

      ## Do
      - Track active time; log [SOUL TRACKER] when active ≥ 5m.
      - Merge all opinions into a single action for the whole discussion.
      - Keep actions brief and actionable (Kafka-like queue; auto-expire in 2m).

      ## Don't
      - Create multiple actions per discussion.
      - Perform installs, network calls, or UI changes.
      - Bypass Summarizer API limits (delegate to content script).`,
    isActive: true,
    vector: []
  }
]
