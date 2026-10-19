import type { CrawlRun } from '../entities/crawl-run'
import type { CrawlRepository } from '../repositories/crawl.repository'

export class GetCrawlHistory {
  constructor(private readonly repository: CrawlRepository) {}

  execute(): Promise<CrawlRun[]> {
    return this.repository.getHistory()
  }
}
