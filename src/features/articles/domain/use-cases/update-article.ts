import type { NewsArticle } from '../entities/news-article'
import type { ArticleRepository } from '../repositories/article.repository'

export class UpdateArticle {
  constructor(private readonly repository: ArticleRepository) {}

  execute(article: NewsArticle) {
    return this.repository.update(article)
  }
}
