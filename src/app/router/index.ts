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
    path: '/login',
    name: 'login',
    component: () => import('@/features/auth/presentation/pages/LoginPage.vue'),
  },
  {
    path: '/',
    component: AppLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/features/dashboard/presentation/pages/DashboardPage.vue'),
        meta: {
          title: 'RITME Ekspor Impor',
          description: 'Rekap informasi dan tren media ekspor impor',
        },
      },
      {
        path: 'articles',
        name: 'articles',
        component: () => import('@/features/articles/presentation/pages/ArticlesPage.vue'),
        meta: {
          title: 'Artikel Berita',
          description: 'Cari, filter, dan telusuri data artikel berita ekspor impor',
        },
      },
      {
        path: 'download',
        name: 'download',
        component: () => import('@/features/downloads/presentation/pages/DownloadPage.vue'),
        meta: {
          title: 'Download',
          description: 'Unduh hasil pengolahan berita ekspor impor dalam format Excel per periode.',
        },
      },
      {
        path: 'crawling',
        name: 'crawling',
        component: () => import('@/features/crawling/presentation/pages/CrawlingPage.vue'),
        meta: {
          requiresAdmin: true,
        },
      },
      {
        path: 'article-changes',
        name: 'article-changes',
        component: () => import('@/features/articles/presentation/pages/ArticleChangesPage.vue'),
        meta: {
          requiresAdmin: true,
        },
      },
      {
        path: 'article-management',
        name: 'article-management',
        component: () =>
          import('@/features/article-management/presentation/pages/ArticleManagementPage.vue'),
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

  if (to.name === 'login') {
    document.documentElement.dataset.theme = 'light'
    window.localStorage.setItem('eksim-insight:theme', 'light')
  }

  if (!authStore.isAuthenticated && to.name !== 'login') {
    return { name: 'login' }
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
