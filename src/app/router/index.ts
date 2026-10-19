import ArticleManagementPage from '@/features/article-management/presentation/pages/ArticleManagementPage.vue'
import ArticlesPage from '@/features/articles/presentation/pages/ArticlesPage.vue'
import CrawlingPage from '@/features/crawling/presentation/pages/CrawlingPage.vue'
import DashboardPage from '@/features/dashboard/presentation/pages/DashboardPage.vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import AppLayout from '../layouts/AppLayout.vue'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    description?: string
    requiresAdmin?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardPage,
        meta: {
          title: 'Dashboard',
          description: 'Pantau fenomena berita ekspor dan impor',
        },
      },
      {
        path: 'articles',
        name: 'articles',
        component: ArticlesPage,
        meta: {
          title: 'Artikel Berita',
          description: 'Cari, filter, dan telusuri berita ekspor impor',
        },
      },
      {
        path: 'crawling',
        name: 'crawling',
        component: CrawlingPage,
        meta: {
          title: 'Crawling berita',
          description: 'Kelola pengambilan data berita.',
          requiresAdmin: true,
        },
      },
      {
        path: 'article-management',
        name: 'article-management',
        component: ArticleManagementPage,
        meta: {
          title: 'Manajemen Artikel Berita',
          description: 'Cari, filter, dan kelola data artikel berita ekspor impor.',
          requiresAdmin: true,
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  // Halaman administrasi hanya untuk Admin.
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'dashboard' }
  }

  // Admin menggunakan halaman manajemen, bukan halaman baca User.
  if (to.name === 'articles' && authStore.isAdmin) {
    return { name: 'article-management' }
  }

  return true
})


export default router
