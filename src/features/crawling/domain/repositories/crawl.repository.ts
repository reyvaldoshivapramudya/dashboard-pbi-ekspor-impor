import type { CrawlRun, StartCrawlInput } from '../entities/crawl-run'

export interface CrawlRepository {
  getHistory(): Promise<CrawlRun[]>
  runSimulation(input: StartCrawlInput): Promise<CrawlRun>
}
