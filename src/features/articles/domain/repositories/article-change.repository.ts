import type { ArticleChange } from '../entities/article-change'

export interface ArticleChangeRepository {
  getAll(): Promise<ArticleChange[]>
}
