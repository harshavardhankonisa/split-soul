export class AgendaManager {
  private activeAgendas: string[] = []
  public async AddAgenda() {
    this.activeAgendas.push('agenda')
  }
}

export const agendaManager = new AgendaManager()
