import type { CommodityOverview } from '../entities/commodity-overview'

export interface CommodityOverviewRepository {
  /** Ringkasan komoditas sesuai sheet "Ringkasan Komoditas" pada workbook Excel. */
  getAll(): Promise<CommodityOverview[]>
}
