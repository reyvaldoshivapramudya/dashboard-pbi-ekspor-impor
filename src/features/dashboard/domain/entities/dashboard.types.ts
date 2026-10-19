export type DashboardPeriod = 'all' | string

export interface ChartItem {
  label: string
  value: number
}

export interface DashboardSummary {
  totalArticles: number
  mediaCount: number
  identifiedCommoditiesCount: number
  positiveSentimentCount: number
  negativeSentimentCount: number
  topCommodities: ChartItem[]
  sentimentDistribution: ChartItem[]
  mediaDistribution: ChartItem[]
  categoryDistribution: ChartItem[]
  commodityScopeDistribution: ChartItem[]
}
