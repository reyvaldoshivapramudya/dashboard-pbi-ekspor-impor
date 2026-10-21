import type { NewsArticle, NewsCategory } from '../entities/news-article'
import type { ArticleRepository } from '../repositories/article.repository'

export interface SearchArticleFilters {
  period: string
  mediaName: string
  category: 'all' | NewsCategory
  query: string
  /** Batasi hasil ke komoditas tertentu (pencocokan tanpa memedakan huruf besar/kecil). */
  commodity?: string
}

export class SearchArticles {
  constructor(private readonly repository: ArticleRepository) {}

  async execute(filters: SearchArticleFilters): Promise<NewsArticle[]> {
    const articles = await this.repository.getAll()
    const query = filters.query.trim().toLocaleLowerCase('id-ID')
    const commodity = filters.commodity?.trim().toLocaleLowerCase('id-ID') ?? ''

    return articles.filter((article) => {
      const matchesPeriod = filters.period === 'all' || article.period === filters.period

      const matchesMedia = filters.mediaName === 'all' || article.mediaName === filters.mediaName

      const matchesCategory = filters.category === 'all' || article.category === filters.category

      const matchesCommodity =
        commodity.length === 0 ||
        article.commodities.some(
          (item) => item.toLocaleLowerCase('id-ID') === commodity,
        )

      const searchableText = [article.title, ...article.commodities]
        .join(' ')
        .toLocaleLowerCase('id-ID')

      const matchesQuery = query.length === 0 || searchableText.includes(query)

      return matchesPeriod && matchesMedia && matchesCategory && matchesQuery && matchesCommodity
    })
  }
}
