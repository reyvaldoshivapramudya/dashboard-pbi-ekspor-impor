import type { ArticleRepository, NewArticleInput } from '../repositories/article.repository'

export class CreateArticle {
  constructor(private readonly repository: ArticleRepository) {}

  execute(input: NewArticleInput) {
    return this.repository.create(input)
  }
}
