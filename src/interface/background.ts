export interface Vote {
  id: number
  title: string
  description: string
  votes: {
    user: number
    vote: 'yes' | 'no' | 'abstain'
  }[]
  status: 'open' | 'closed'
  createdAt: Date
}

export interface Agenda {
  id: number
  title: string
  description: string
}
