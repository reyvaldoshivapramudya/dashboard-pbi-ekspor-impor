import type { ArticleChange } from '@/features/articles/domain/entities/article-change'
import type { ArticleChangeRepository } from '@/features/articles/domain/repositories/article-change.repository'

export const ARTICLE_CHANGES_STORAGE_KEY = 'eksim-insight:article-changes:v1'

export class ArticleChangeRepositoryImpl implements ArticleChangeRepository {
  async getAll(): Promise<ArticleChange[]> {
    if (typeof window === 'undefined') return []

    try {
      const stored = window.localStorage.getItem(ARTICLE_CHANGES_STORAGE_KEY)
      if (stored === null) return []

      const parsed: unknown = JSON.parse(stored)
      if (!Array.isArray(parsed)) return []

      return (parsed as ArticleChange[]).sort((a, b) =>
        b.changedAt.localeCompare(a.changedAt),
      )
    } catch (error) {
      console.warn('Tidak dapat membaca riwayat perubahan artikel.', error)
      return []
    }
  }
}
