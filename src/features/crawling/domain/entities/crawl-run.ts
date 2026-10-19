export type CrawlStatus = 'running' | 'success' | 'failed'

export interface CrawlRun {
  id: string
  period: string
  mediaNames: string[]
  startedAt: string
  completedAt: string | null
  status: CrawlStatus
  articlesFound: number
  articlesAdded: number
  duplicatesSkipped: number
  message: string
}

export interface StartCrawlInput {
  period: string
  mediaNames: string[]
}
