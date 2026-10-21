import type { CommodityOverview } from '../../domain/entities/commodity-overview'
import type { CommodityOverviewRepository } from '../../domain/repositories/commodity-overview.repository'

import { COMMODITY_OVERVIEWS } from '../datasources/commodity-overview.datasource'

export class CommodityOverviewRepositoryImpl implements CommodityOverviewRepository {
  async getAll(): Promise<CommodityOverview[]> {
    return COMMODITY_OVERVIEWS
  }
}
