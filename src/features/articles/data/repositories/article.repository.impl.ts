import type { NewsArticle } from '@/features/articles/domain/entities/news-article'
import type { ArticleChange, ArticleChangeAction } from '@/features/articles/domain/entities/article-change'
import type {
  ArticleRepository,
  NewArticleInput,
} from '@/features/articles/domain/repositories/article.repository'

import { MOCK_ARTICLES } from '../datasources/articles.mock'

const STORAGE_KEY = 'eksim-insight:articles:v1'
const ARTICLE_CHANGES_STORAGE_KEY = 'eksim-insight:article-changes:v1'

function cloneArticles(articles: NewsArticle[]): NewsArticle[] {
  return articles.map((article) => ({
    ...article,
    searchKeywords: [...article.searchKeywords],
    commodities: [...article.commodities],
    relatedCountries: [...article.relatedCountries],
    mainPoints: article.mainPoints ? [...article.mainPoints] : undefined,
  }))
}

function createArticleId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `ART-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function recordChange(
  action: ArticleChangeAction,
  article: Pick<NewsArticle, 'id' | 'title'>,
): void {
  if (typeof window === 'undefined') return

  try {
    const stored = window.localStorage.getItem(ARTICLE_CHANGES_STORAGE_KEY)
    const parsed: unknown = stored === null ? [] : JSON.parse(stored)
    const changes = Array.isArray(parsed) ? (parsed as ArticleChange[]) : []
    const change: ArticleChange = {
      id: createArticleId(),
      articleId: article.id,
      action,
      articleTitle: article.title,
      changedAt: new Date().toISOString(),
    }

    window.localStorage.setItem(
      ARTICLE_CHANGES_STORAGE_KEY,
      JSON.stringify([change, ...changes].slice(0, 100)),
    )
  } catch (error) {
    console.warn('Riwayat perubahan artikel tidak dapat disimpan.', error)
  }
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
        const storedArticles = parsed as NewsArticle[]
        const hasLegacySimulationData = storedArticles.some(
          (article) =>
            article &&
            typeof article.title === 'string' &&
            /^Simulasi\s*:/i.test(article.title.trim()),
        )

        if (hasLegacySimulationData) {
          // Sinkronkan data seed yang usang dari localStorage dengan MOCK_ARTICLES terbaru.
          // Artikel buatan admin (ID di luar daftar seed) tetap dipertahankan.
          const seedIds = new Set(MOCK_ARTICLES.map((article) => article.id))
          const customArticles = storedArticles.filter(
            (article) =>
              article &&
              typeof article.id === 'string' &&
              !seedIds.has(article.id) &&
              !(typeof article.title === 'string' && /^Simulasi\s*:/i.test(article.title.trim())),
          )
          const refreshedArticles = [...MOCK_ARTICLES, ...customArticles]

          this.writeArticles(refreshedArticles)
          return cloneArticles(this.memoryArticles)
        }

        this.memoryArticles = storedArticles
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
      mainPoints: input.mainPoints ? [...input.mainPoints] : undefined,
    }

    this.writeArticles([article, ...articles])
    recordChange('created', article)

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
      mainPoints: updatedArticle.mainPoints ? [...updatedArticle.mainPoints] : undefined,
    }

    this.writeArticles(articles)
    recordChange('updated', updatedArticle)

    return updatedArticle
  }

  async delete(id: string): Promise<void> {
    const articles = this.readArticles()
    const remainingArticles = articles.filter((article) => article.id !== id)

    if (remainingArticles.length === articles.length) {
      throw new Error('Artikel tidak ditemukan.')
    }

    this.writeArticles(remainingArticles)
    const deletedArticle = articles.find((article) => article.id === id)
    if (deletedArticle) recordChange('deleted', deletedArticle)
  }
}
