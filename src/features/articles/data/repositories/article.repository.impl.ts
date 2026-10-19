import type { NewsArticle } from '@/features/articles/domain/entities/news-article'
import type {
  ArticleRepository,
  NewArticleInput,
} from '@/features/articles/domain/repositories/article.repository'

import { MOCK_ARTICLES } from '../datasources/articles.mock'

const STORAGE_KEY = 'eksim-insight:articles:v1'

function cloneArticles(articles: NewsArticle[]): NewsArticle[] {
  return articles.map((article) => ({
    ...article,
    searchKeywords: [...article.searchKeywords],
    commodities: [...article.commodities],
    relatedCountries: [...article.relatedCountries],
  }))
}

function createArticleId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `ART-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export class ArticleRepositoryImpl implements ArticleRepository {
  private memoryArticles: NewsArticle[] = cloneArticles(MOCK_ARTICLES)

  private readArticles(): NewsArticle[] {
    if (typeof window === 'undefined') {
      return cloneArticles(this.memoryArticles)
    }

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)

      if (stored === null) {
        this.writeArticles(this.memoryArticles)
        return cloneArticles(this.memoryArticles)
      }

      const parsed: unknown = JSON.parse(stored)

      if (Array.isArray(parsed)) {
        this.memoryArticles = parsed as NewsArticle[]
        return cloneArticles(this.memoryArticles)
      }
    } catch (error) {
      console.warn('Tidak dapat membaca data artikel dari localStorage.', error)
    }

    return cloneArticles(this.memoryArticles)
  }

  private writeArticles(articles: NewsArticle[]): void {
    this.memoryArticles = cloneArticles(articles)

    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memoryArticles))
    } catch (error) {
      console.warn('Data hanya tersimpan selama sesi aplikasi berlangsung.', error)
    }
  }

  async getAll(): Promise<NewsArticle[]> {
    return this.readArticles().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
  }

  async create(input: NewArticleInput): Promise<NewsArticle> {
    const articles = this.readArticles()

    const article: NewsArticle = {
      ...input,
      id: createArticleId(),
      searchKeywords: [...input.searchKeywords],
      commodities: [...input.commodities],
      relatedCountries: [...input.relatedCountries],
    }

    this.writeArticles([article, ...articles])

    return article
  }

  async update(updatedArticle: NewsArticle): Promise<NewsArticle> {
    const articles = this.readArticles()
    const index = articles.findIndex((article) => article.id === updatedArticle.id)

    if (index === -1) {
      throw new Error('Artikel tidak ditemukan.')
    }

    articles[index] = {
      ...updatedArticle,
      searchKeywords: [...updatedArticle.searchKeywords],
      commodities: [...updatedArticle.commodities],
      relatedCountries: [...updatedArticle.relatedCountries],
    }

    this.writeArticles(articles)

    return updatedArticle
  }

  async delete(id: string): Promise<void> {
    const articles = this.readArticles()
    const remainingArticles = articles.filter((article) => article.id !== id)

    if (remainingArticles.length === articles.length) {
      throw new Error('Artikel tidak ditemukan.')
    }

    this.writeArticles(remainingArticles)
  }
}
