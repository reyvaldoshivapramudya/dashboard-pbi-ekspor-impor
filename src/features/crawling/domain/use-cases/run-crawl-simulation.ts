import type { CrawlRun, StartCrawlInput } from '../entities/crawl-run'
import type { CrawlRepository } from '../repositories/crawl.repository'

export class RunCrawlSimulation {
  constructor(private readonly repository: CrawlRepository) {}

  execute(input: StartCrawlInput): Promise<CrawlRun> {
    const mediaNames = [...new Set(input.mediaNames.map((name) => name.trim()))].filter(Boolean)

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(input.period)) {
      throw new Error('Format periode harus YYYY-MM.')
    }

    if (mediaNames.length === 0) {
      throw new Error('Pilih setidaknya satu portal berita.')
    }

    return this.repository.runSimulation({
      period: input.period,
      mediaNames,
    })
  }
}
