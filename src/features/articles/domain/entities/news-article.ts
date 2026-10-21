export type NewsCategory = 'commodity' | 'policy' | 'logistics'

export type SentimentLabel = 'positive' | 'negative'

export type CommodityScope = 'specific' | 'cross_commodity'

export interface NewsArticle {
  id: string
  publishedAt: string
  period: string
  category: NewsCategory
  searchKeywords: string[]
  title: string
  mediaName: string
  commodities: string[]
  commodityScope: CommodityScope
  relatedCountries: string[]
  summary: string
  url: string
  sentiment: SentimentLabel
  sentimentScore: number
  mainPoints?: string[]
}
