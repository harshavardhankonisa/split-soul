import type { Agenda } from '../../interface/background'
import type { Action, User } from '../../interface/database'
import { getAllUsers } from '../../services/dexie/collections/user'
import { createAction, getAllActions, updateAction } from '../../services/dexie/collections/action'
import { activityTracker } from './activityTracker'
import { SoulOpinionAgent } from '../../services/agents/SoulOpinionAgent'

interface VotedAgenda {
  description: string
  votes: number
  voters: string[]
}

export class AgendaManager {
  private activeAgendas: Agenda[] = []
  private readonly FINAL_AGENDA_INTERVAL_MS = 5 * 60 * 1000
  private soulOpinionAgent = new SoulOpinionAgent({})

  constructor() {
    this.startFinalAgendaTimer()
  }

  private startFinalAgendaTimer() {
    setInterval(() => this.createFinalAgenda(), this.FINAL_AGENDA_INTERVAL_MS)
  }

  private async createFinalAgenda() {
    if (this.activeAgendas.length === 0) {
      return
    }

    try {
      const activeActivities = activityTracker.getCurrentActivities()
      const users = await getAllUsers()

      const agendaSummary = this.activeAgendas.map(a => a.description).join('\n\n---\n\n')

      const activitySummary = activeActivities.map(a => `${a.websiteTitle} (${a.activeDuration}ms)`).join(', ')

      const finalAgendaText = `
        Agendas:
        ${agendaSummary}
            
        Active Activities:
        ${activitySummary}
        `

      console.log('Final Agenda Created:', finalAgendaText)

      const votedAgendas = await this.voteOnAgendas(users)

      await this.createActionsFromVotes(votedAgendas)

      this.activeAgendas = []
      console.log('Active agendas cleared')
    } catch (error) {
      console.error('Error creating final agenda:', error)
    }
  }

  private async voteOnAgendas(users: User[]): Promise<VotedAgenda[]> {
    const votedAgendas: VotedAgenda[] = this.activeAgendas.map(agenda => ({
      description: agenda.description,
      votes: 0,
      voters: []
    }))

    for (const user of users) {
      if (user.username === 'Main Body') continue

      for (let i = 0; i < votedAgendas.length; i++) {
        const votePrompt = `
          Soul: "${user.username}"
          Soul Description: "${user.description}"
          Agenda: "${votedAgendas[i].description}"

          Based on this soul's interests and expertise, should they vote YES for this agenda to become an action?
          Answer with ONLY "YES" or "NO".
          Response:`

        const voteResponse = await this.soulOpinionAgent._call(votePrompt)

        if (voteResponse.includes('YES')) {
          votedAgendas[i].votes++
          votedAgendas[i].voters.push(user.username)
        }
      }
    }

    console.log('Voted Agendas:', votedAgendas)
    return votedAgendas
  }

  private async createActionsFromVotes(votedAgendas: VotedAgenda[]) {
    const existingActions = await getAllActions()

    for (const votedAgenda of votedAgendas) {
      if (votedAgenda.votes > 0) {
        const existingAction = existingActions.find(a => a.description)

        if (existingAction) {
          await updateAction(existingAction.id, {
            description: votedAgenda.description,
            priority: 'high'
          })
          console.log(`Action updated: with ${votedAgenda.votes} votes from ${votedAgenda.voters.join(', ')}`)
        } else {
          const action: Omit<Action, 'id'> = {
            description: votedAgenda.description,
            createdAt: new Date(),
            priority: 'high',
            isCompleted: false,
            vector: []
          }

          await createAction(action)
          console.log(`Action created: ${votedAgenda.votes} votes from ${votedAgenda.voters.join(', ')}`)
        }
      }
    }
  }

  // CREATE AGENDA
  public createAgenda(description: string): Agenda {
    const now = new Date()
    const agenda: Agenda = {
      description,
      createdAt: now
    }

    this.activeAgendas.push(agenda)
    return agenda
  }
}

export const agendaManager = new AgendaManager()
