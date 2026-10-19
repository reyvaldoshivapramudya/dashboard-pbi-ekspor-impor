
import type { NewsArticle } from '@/features/articles/domain/entities/news-article'
import type { ArticleRepository } from '@/features/articles/domain/repositories/article.repository'

import type {
  ChartItem,
  DashboardSummary,
} from '../../domain/entities/dashboard.types'

import type { DashboardRepository } from '../../domain/repositories/dashboard.repository'

function countBy(
  items: string[],
): ChartItem[] {
  const counts = new Map<string, number>()

  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort(
      (a, b) =>
        b.value - a.value ||
        a.label.localeCompare(b.label, 'id'),
    )
}

function countCategory(
  articles: NewsArticle[],
  category: NewsArticle['category'],
): number {
  return articles.filter(
    (article) => article.category === category,
  ).length
}

export class DashboardRepositoryImpl
  implements DashboardRepository
{
  constructor(
    private readonly articleRepository: ArticleRepository,
  ) {}

  async getSummary(period: string): Promise<DashboardSummary> {
    const allArticles = await this.articleRepository.getAll()

    const articles =
      period === 'all'
        ? allArticles
        : allArticles.filter(
            (article) => article.period === period,
          )

    // Komoditas spesifik dihitung satu kali per artikel
    // untuk setiap nama komoditas yang teridentifikasi.
    const commodityNames: string[] = []

    for (const article of articles) {
      if (article.commodityScope !== 'specific') continue

      for (const commodity of new Set(article.commodities)) {
        commodityNames.push(commodity)
      }
    }

    const positiveSentimentCount = articles.filter(
      (article) => article.sentiment === 'positive',
    ).length

    const negativeSentimentCount = articles.filter(
      (article) => article.sentiment === 'negative',
    ).length

    const mediaDistribution = countBy(
      articles.map((article) => article.mediaName),
    )

    return {
      totalArticles: articles.length,

      mediaCount: new Set(
        articles.map((article) => article.mediaName),
      ).size,

      identifiedCommoditiesCount: new Set(
        commodityNames,
      ).size,

      positiveSentimentCount,
      negativeSentimentCount,

      topCommodities: countBy(commodityNames).slice(0, 5),

      sentimentDistribution: [
        {
          label: 'Positif',
          value: positiveSentimentCount,
        },
        {
          label: 'Negatif',
          value: negativeSentimentCount,
        },
      ],

      mediaDistribution,

      categoryDistribution: [
        {
          label: 'Komoditas',
          value: countCategory(articles, 'commodity'),
        },
        {
          label: 'Kebijakan',
          value: countCategory(articles, 'policy'),
        },
        {
          label: 'Logistik',
          value: countCategory(articles, 'logistics'),
        },
      ],

      commodityScopeDistribution: [
        {
          label: 'Komoditas spesifik',
          value: articles.filter(
            (article) => article.commodityScope === 'specific',
          ).length,
        },
        {
          label: 'Lintas komoditas',
          value: articles.filter(
            (article) =>
              article.commodityScope === 'cross_commodity',
          ).length,
        },
      ],
    }
  }

  async getAvailablePeriods(): Promise<string[]> {
    const articles = await this.articleRepository.getAll()

    return [...new Set(articles.map((article) => article.period))]
      .sort((a, b) => b.localeCompare(a))
  }
}
