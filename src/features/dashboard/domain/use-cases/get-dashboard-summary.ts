import type { DashboardSummary } from '../entities/dashboard.types';
import type { DashboardRepository } from '../repositories/dashboard.repository'

export class GetDashboardSummary {
  constructor(private readonly repository: DashboardRepository) {}

  execute(period: string): Promise<DashboardSummary> {
    return this.repository.getSummary(period)
  }
}
