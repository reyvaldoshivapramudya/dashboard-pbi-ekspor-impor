import { ArticleRepositoryImpl } from '@/features/articles/data/repositories/article.repository.impl'
import { ArticleApiRepository } from '@/features/articles/data/repositories/article-api.repository'
import { CommodityOverviewRepositoryImpl } from '@/features/articles/data/repositories/commodity-overview.repository.impl'
import { DashboardRepositoryImpl } from '@/features/dashboard/data/repositories/dashboard.repository.impl'
import { GetDashboardPeriods } from '@/features/dashboard/domain/use-cases/get-dashboard-periods'
import { GetDashboardSummary } from '@/features/dashboard/domain/use-cases/get-dashboard-summary'
import { SearchArticles } from '@/features/articles/domain/use-cases/search-articles'
import { CreateArticle } from '@/features/articles/domain/use-cases/create-article'
import { UpdateArticle } from '@/features/articles/domain/use-cases/update-article'
import { DeleteArticle } from '@/features/articles/domain/use-cases/delete-article'
import { GetCommodityOverview } from '@/features/articles/domain/use-cases/get-commodity-overview'
import { CrawlRepositoryImpl } from '@/features/crawling/data/repositories/crawl.repository.impl'
import { CrawlApiRepository } from '@/features/crawling/data/repositories/crawl-api.repository'
import { GetCrawlHistory } from '@/features/crawling/domain/use-cases/get-crawl-history'
import { RunCrawlSimulation } from '@/features/crawling/domain/use-cases/run-crawl-simulation'
import { ArticleChangeRepositoryImpl } from '@/features/articles/data/repositories/article-change.repository.impl'
import { GetArticleChanges } from '@/features/articles/domain/use-cases/get-article-changes'

const useApiDataSource = import.meta.env.VITE_DATA_SOURCE === 'api'

export const articleRepository = useApiDataSource
  ? new ArticleApiRepository()
  : new ArticleRepositoryImpl()
export const commodityOverviewRepository = new CommodityOverviewRepositoryImpl()
export const searchArticles = new SearchArticles(articleRepository)
export const createArticle = new CreateArticle(articleRepository)
export const updateArticle = new UpdateArticle(articleRepository)
export const deleteArticle = new DeleteArticle(articleRepository)
export const articleChangeRepository = new ArticleChangeRepositoryImpl()
export const getArticleChanges = new GetArticleChanges(articleChangeRepository)
export const getCommodityOverview = new GetCommodityOverview(
  commodityOverviewRepository,
  articleRepository,
)

export const dashboardRepository = new DashboardRepositoryImpl(articleRepository)
export const getDashboardSummary = new GetDashboardSummary(dashboardRepository)
export const getDashboardPeriods = new GetDashboardPeriods(dashboardRepository)

export const crawlRepository = useApiDataSource
  ? new CrawlApiRepository()
  : new CrawlRepositoryImpl(articleRepository)
export const getCrawlHistory = new GetCrawlHistory(crawlRepository)
export const runCrawlSimulation = new RunCrawlSimulation(crawlRepository)
