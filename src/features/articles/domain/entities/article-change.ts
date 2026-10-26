export type ArticleChangeAction = 'created' | 'updated' | 'deleted'

export interface ArticleChange {
  id: string
  articleId: string
  action: ArticleChangeAction
  articleTitle: string
  changedAt: string
}
