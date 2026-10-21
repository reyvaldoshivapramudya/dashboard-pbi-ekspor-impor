import type { CommodityOverview, CommodityPoint } from '../entities/commodity-overview'
import type { NewsArticle } from '../entities/news-article'

import type { ArticleRepository } from '../repositories/article.repository'
import type { CommodityOverviewRepository } from '../repositories/commodity-overview.repository'

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

/** Komoditas dibandingkan tanpa peka huruf besar/kecil dan spasi tepi. */
function commodityKey(commodity: string): string {
  return commodity.trim().toLocaleLowerCase('id-ID')
}

function formatShortDate(dateString: string): string {
  return SHORT_DATE_FORMATTER.format(new Date(`${dateString}T12:00:00Z`))
}

/**
 * Daftar komoditas untuk halaman Manajemen Artikel Berita.
 *
 * Angka ringkasan utama (jumlah berita, poin utama, poin pendukung, positif,
 * negatif, rentang tanggal, dan poin ringkasan) berasal dari sheet
 * "Ringkasan Komoditas" pada `HasilScrapingFenomena.xlsx`, karena poin pendukung
 * dan rentang tanggal tidak dapat diturunkan dari sheet "Hasil Scraping".
 *
 * Komoditas yang belum ada di Excel namun muncul dari artikel yang ditambahkan
 * admin tetap ditampilkan sebagai baris tambahan yang dihitung dari artikel
 * tersebut, tanpa pernah menimpa angka Excel.
 */
export class GetCommodityOverview {
  constructor(
    private readonly overviewRepository: CommodityOverviewRepository,
    private readonly articleRepository: ArticleRepository,
  ) {}

  async execute(): Promise<CommodityOverview[]> {
    const rows = await this.overviewRepository.getAll()
    const knownKeys = new Set(rows.map((row) => commodityKey(row.commodity)))

    const articles = await this.articleRepository.getAll()
    const derivedRows = this.buildDerivedRows(articles, knownKeys)

    return [...rows, ...derivedRows]
  }

  private buildDerivedRows(
    articles: NewsArticle[],
    knownKeys: Set<string>,
  ): CommodityOverview[] {
    const rows = new Map<string, CommodityOverview>()

    for (const article of articles) {
      for (const commodity of article.commodities) {
        const trimmed = commodity.trim()

        if (trimmed === '') continue

        const key = commodityKey(trimmed)

        if (knownKeys.has(key)) continue

        if (!rows.has(key)) {
          rows.set(key, {
            commodity: trimmed,
            articleCount: 0,
            mainPointCount: 0,
            supportingPointCount: 0,
            positiveCount: 0,
            negativeCount: 0,
            dateRange: '',
            points: [],
          })
        }

        const row = rows.get(key)!

        row.articleCount += 1

        if (article.sentiment === 'positive') {
          row.positiveCount += 1
        } else {
          row.negativeCount += 1
        }

        const points: CommodityPoint[] = (article.mainPoints ?? []).map((text) => ({
          text,
          mediaName: article.mediaName,
          publishedAt: article.publishedAt,
        }))

        row.mainPointCount += points.length
        row.points.push(...points)
      }
    }

    for (const row of rows.values()) {
      row.points.sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))

      const first = row.points[0]?.publishedAt
      const last = row.points[row.points.length - 1]?.publishedAt

      if (first === undefined || last === undefined) continue

      row.dateRange =
        first === last
          ? formatShortDate(first)
          : `${formatShortDate(first)} - ${formatShortDate(last)}`
    }

    return [...rows.values()].sort((a, b) => a.commodity.localeCompare(b.commodity, 'id-ID'))
  }
}
