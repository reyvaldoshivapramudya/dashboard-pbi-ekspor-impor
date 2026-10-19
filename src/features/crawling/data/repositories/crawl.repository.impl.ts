import type { NewsArticle } from '@/features/articles/domain/entities/news-article'

import type {
  ArticleRepository,
  NewArticleInput,
} from '@/features/articles/domain/repositories/article.repository'

import type { CrawlRun, StartCrawlInput } from '../../domain/entities/crawl-run'

import type { CrawlRepository } from '../../domain/repositories/crawl.repository'

const STORAGE_KEY = 'eksim-insight:crawl-history:v1'

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `CRAWL-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function formatPeriod(period: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${period}-01T12:00:00Z`))
}

const MEDIA_SOURCE_ORDER = [
  'Antara',
  'CNBC Indonesia',
  'DetikFinance',
  'Liputan6',
  'SINDOnews',
  'Bisnis.com',
  'Tribun',
] as const

const ARTICLE_SEEDS = [
  {
    category: 'commodity',
    commodity: 'Minyak Kelapa Sawit (CPO)',
    sentiment: 'positive',
    sentimentScore: 0.45,
    countries: ['India', 'Tiongkok'],
  },
  {
    category: 'policy',
    commodity: null,
    sentiment: 'negative',
    sentimentScore: -0.28,
    countries: ['Indonesia'],
  },
  {
    category: 'logistics',
    commodity: null,
    sentiment: 'negative',
    sentimentScore: -0.36,
    countries: ['Indonesia'],
  },
  {
    category: 'commodity',
    commodity: 'Nikel',
    sentiment: 'positive',
    sentimentScore: 0.53,
    countries: ['Tiongkok'],
  },
  {
    category: 'policy',
    commodity: null,
    sentiment: 'negative',
    sentimentScore: -0.31,
    countries: ['Indonesia', 'Tiongkok'],
  },
  {
    category: 'logistics',
    commodity: null,
    sentiment: 'negative',
    sentimentScore: -0.22,
    countries: ['Indonesia'],
  },
  {
    category: 'commodity',
    commodity: 'Beras',
    sentiment: 'positive',
    sentimentScore: 0.34,
    countries: ['Thailand', 'Vietnam'],
  },
] as const

function buildSimulatedArticle(mediaName: string, period: string, index: number): NewArticleInput {
  const seed = ARTICLE_SEEDS[index % ARTICLE_SEEDS.length] ?? ARTICLE_SEEDS[0]

  const mediaSlug = mediaName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const periodLabel = formatPeriod(period)

  const commodities = seed.commodity ? [seed.commodity] : []

  return {
    publishedAt: `${period}-15`,
    period,

    category: seed.category,
    searchKeywords: ['ekspor', 'impor', 'simulasi'],

    title: `[SIMULASI] Pantauan ekspor-impor ${periodLabel} — ${mediaName}`,

    mediaName,

    commodities,
    commodityScope: seed.commodity ? 'specific' : 'cross_commodity',

    relatedCountries: [...seed.countries],

    summary:
      `Artikel contoh untuk demonstrasi hasil simulasi crawling ` +
      `portal ${mediaName} pada periode ${periodLabel}. ` +
      `Konten ini bukan berita nyata dan tidak berasal dari portal tersebut.`,

    url: `https://example.com/dummy/crawling/` + `${period}/${mediaSlug}`,

    sentiment: seed.sentiment,
    sentimentScore: seed.sentimentScore,
  }
}

export class CrawlRepositoryImpl implements CrawlRepository {
  private memoryHistory: CrawlRun[] = []

  constructor(private readonly articleRepository: ArticleRepository) {}

  private readHistory(): CrawlRun[] {
    if (typeof window === 'undefined') {
      return this.memoryHistory.map((run) => ({
        ...run,
        mediaNames: [...run.mediaNames],
      }))
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)

      if (stored === null) {
        return [...this.memoryHistory]
      }

      const parsed: unknown = JSON.parse(stored)

      if (Array.isArray(parsed)) {
        this.memoryHistory = parsed as CrawlRun[]

        return this.memoryHistory.map((run) => ({
          ...run,
          mediaNames: [...run.mediaNames],
        }))
      }
    } catch (error) {
      console.warn('Gagal membaca riwayat crawling.', error)
    }

    return [...this.memoryHistory]
  }

  private writeHistory(runs: CrawlRun[]): void {
    this.memoryHistory = runs.map((run) => ({
      ...run,
      mediaNames: [...run.mediaNames],
    }))

    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memoryHistory))
    } catch (error) {
      console.warn('Riwayat crawling hanya tersedia di memori.', error)
    }
  }

  private upsertRun(run: CrawlRun): void {
    const runs = this.readHistory()
    const index = runs.findIndex((item) => item.id === run.id)

    if (index === -1) {
      this.writeHistory([run, ...runs])
      return
    }

    runs[index] = run
    this.writeHistory(runs)
  }

  async getHistory(): Promise<CrawlRun[]> {
    return this.readHistory().sort((a, b) => b.startedAt.localeCompare(a.startedAt))
  }

  async runSimulation(input: StartCrawlInput): Promise<CrawlRun> {
    const startedAt = new Date().toISOString()

    const runningRun: CrawlRun = {
      id: createId(),
      period: input.period,
      mediaNames: [...input.mediaNames],

      startedAt,
      completedAt: null,

      status: 'running',

      articlesFound: input.mediaNames.length,
      articlesAdded: 0,
      duplicatesSkipped: 0,

      message: 'Simulasi crawling sedang berlangsung.',
    }

    this.upsertRun(runningRun)

    try {
      // Jeda ini hanya untuk memperlihatkan status "Berjalan"
      // pada prototipe. Tidak ada request ke portal berita.
      await wait(1500)

      const existingArticles: NewsArticle[] = await this.articleRepository.getAll()

      const existingUrls = new Set(existingArticles.map((article) => article.url))

      let articlesAdded = 0
      let duplicatesSkipped = 0

      for (const [index, mediaName] of input.mediaNames.entries()) {
        const sourceIndex = MEDIA_SOURCE_ORDER.indexOf(
          mediaName as (typeof MEDIA_SOURCE_ORDER)[number],
        )

        const candidate = buildSimulatedArticle(
          mediaName,
          input.period,
          sourceIndex >= 0 ? sourceIndex : index,
        )

        if (existingUrls.has(candidate.url)) {
          duplicatesSkipped += 1
          continue
        }

        await this.articleRepository.create(candidate)
        existingUrls.add(candidate.url)
        articlesAdded += 1
      }

      const completedRun: CrawlRun = {
        ...runningRun,
        completedAt: new Date().toISOString(),
        status: 'success',
        articlesFound: input.mediaNames.length,
        articlesAdded,
        duplicatesSkipped,
        message:
          `Simulasi selesai. ${articlesAdded} artikel ditambahkan; ` +
          `${duplicatesSkipped} duplikat dilewati.`,
      }

      this.upsertRun(completedRun)

      return completedRun
    } catch (error) {
      const failedRun: CrawlRun = {
        ...runningRun,
        completedAt: new Date().toISOString(),
        status: 'failed',
        message: error instanceof Error ? error.message : 'Simulasi crawling gagal.',
      }

      this.upsertRun(failedRun)

      return failedRun
    }
  }
}
