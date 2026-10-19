import type { ArticleRepository } from '../repositories/article.repository'

export class DeleteArticle {
  constructor(private readonly repository: ArticleRepository) {}

  execute(id: string): Promise<void> {
    return this.repository.delete(id)
  }
}
