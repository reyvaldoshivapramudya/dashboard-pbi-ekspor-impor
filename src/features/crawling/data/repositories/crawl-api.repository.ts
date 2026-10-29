import type { CrawlRepository } from '@/features/crawling/domain/repositories/crawl.repository'
import type { CrawlRun, StartCrawlInput } from '@/features/crawling/domain/entities/crawl-run'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export class CrawlApiRepository implements CrawlRepository {
  private history: CrawlRun[] = []

  async getHistory(): Promise<CrawlRun[]> {
    return [...this.history]
  }

  async runSimulation(input: StartCrawlInput): Promise<CrawlRun> {
    const response = await fetch(`${API_URL}/crawling/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { detail?: string }
      throw new Error(body.detail ?? `Crawling gagal (${response.status}).`)
    }

    const result = (await response.json()) as CrawlRun
    this.history = [result, ...this.history.filter((run) => run.id !== result.id)]
    return result
  }
}
