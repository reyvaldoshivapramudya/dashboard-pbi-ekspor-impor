import type { NewsArticle } from "../entities/news-article";

export type NewArticleInput = Omit<NewsArticle, 'id'>

export interface ArticleRepository {
  getAll(): Promise<NewsArticle[]>
  create(article: NewArticleInput): Promise<NewsArticle>
  update(article: NewsArticle): Promise<NewsArticle>
  delete(id: string): Promise<void>
}
