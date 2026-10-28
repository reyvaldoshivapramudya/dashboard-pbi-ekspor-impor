import ArticleManagementPage from '@/features/article-management/presentation/pages/ArticleManagementPage.vue'
import ArticlesPage from '@/features/articles/presentation/pages/ArticlesPage.vue'
import CrawlingPage from '@/features/crawling/presentation/pages/CrawlingPage.vue'
import DashboardPage from '@/features/dashboard/presentation/pages/DashboardPage.vue'
import DownloadPage from '@/features/downloads/presentation/pages/DownloadPage.vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import AppLayout from '../layouts/AppLayout.vue'
import ArticleChangesPage from '@/features/articles/presentation/pages/ArticleChangesPage.vue'
import LoginPage from '@/features/auth/presentation/pages/LoginPage.vue'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    description?: string
    requiresAdmin?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
  },
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
          title: 'RITME Ekspor Impor',
          description: 'Rekap informasi dan tren media ekspor impor',
        },
      },
      {
        path: 'articles',
        name: 'articles',
        component: ArticlesPage,
        meta: {
          title: 'Artikel Berita',
          description: 'Cari, filter, dan telusuri data artikel berita ekspor impor',
        },
      },
      {
        path: 'download',
        name: 'download',
        component: DownloadPage,
        meta: {
          title: 'Download',
          description: 'Unduh hasil pengolahan berita ekspor impor dalam format Excel per periode.',
        },
      },
      {
        path: 'crawling',
        name: 'crawling',
        component: CrawlingPage,
        meta: {
          requiresAdmin: true,
        },
      },
      {
        path: 'article-changes',
        name: 'article-changes',
        component: ArticleChangesPage,
        meta: {
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

  if (!authStore.isAuthenticated && to.name !== 'login') {
    return { name: 'login' }
  }

  if (!authStore.isAuthenticated && to.name === 'login') {
    document.documentElement.dataset.theme = 'light'
    window.localStorage.setItem('eksim-insight:theme', 'light')
  }

  if (authStore.isAuthenticated && to.name === 'login') {
    return { name: 'dashboard' }
  }

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
