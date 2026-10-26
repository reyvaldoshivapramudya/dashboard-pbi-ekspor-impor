import type { ArticleChangeRepository } from '../repositories/article-change.repository'

export class GetArticleChanges {
  constructor(private readonly repository: ArticleChangeRepository) {}

  execute() {
    return this.repository.getAll()
  }
}
