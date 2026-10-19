import type { DashboardRepository } from "../repositories/dashboard.repository";

export class GetDashboardPeriods {
  constructor(private readonly repository: DashboardRepository) {}

  execute(): Promise<string[]> {
    return this.repository.getAvailablePeriods()
  }
}
