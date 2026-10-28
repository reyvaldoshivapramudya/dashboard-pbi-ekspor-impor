import type { NewsArticle } from '@/features/articles/domain/entities/news-article'
import type {
  ArticleRepository,
  NewArticleInput,
} from '@/features/articles/domain/repositories/article.repository'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    let detail = `Permintaan API gagal (${response.status}).`

    try {
      const body = (await response.json()) as { detail?: string }
      if (body.detail) detail = body.detail
    } catch {
      // Gunakan pesan status bila backend tidak mengirim JSON.
    }

    throw new Error(detail)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export class ArticleApiRepository implements ArticleRepository {
  getAll(): Promise<NewsArticle[]> {
    return request<NewsArticle[]>('/articles')
  }

  create(article: NewArticleInput): Promise<NewsArticle> {
    return request<NewsArticle>('/articles', {
      method: 'POST',
      body: JSON.stringify(article),
    })
  }

  update(article: NewsArticle): Promise<NewsArticle> {
    return request<NewsArticle>(`/articles/${article.id}`, {
      method: 'PUT',
      body: JSON.stringify(article),
    })
  }

  async delete(id: string): Promise<void> {
    await request<void>(`/articles/${id}`, { method: 'DELETE' })
  }
}
