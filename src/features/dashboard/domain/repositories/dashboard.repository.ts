import type { DashboardSummary } from "../entities/dashboard.types";

export interface DashboardRepository {
  getSummary(period: string): Promise<DashboardSummary>
  getAvailablePeriods(): Promise<string[]>
}
