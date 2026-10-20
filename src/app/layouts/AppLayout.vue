<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

import AppIcon from '@/shared/components/AppIcon.vue'
import { useAuthStore, type UserRole } from '@/app/stores/auth.store'

interface NavigationItem {
  label: string
  icon: string
  routeName: string
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isMobileSidebarOpen = ref(false)

const primaryItems = computed<NavigationItem[]>(() => [
  {
    label: 'Dashboard',
    icon: 'bar-chart',
    routeName: 'dashboard',
  },
  {
    label: authStore.isAdmin ? 'Manajemen Artikel Berita' : 'Artikel Berita',
    icon: authStore.isAdmin ? 'file-edit' : 'file',
    routeName: authStore.isAdmin ? 'article-management' : 'articles',
  },
  {
    label: 'Download',
    icon: 'download',
    routeName: 'download',
  },
])

const adminItems: NavigationItem[] = [
  {
    label: 'Crawling Berita',
    icon: 'globe',
    routeName: 'crawling',
  },
]

const visibleAdminItems = computed(() => (authStore.isAdmin ? adminItems : []))

const pageTitle = computed(() => String(route.meta.title ?? 'Dashboard'))

const pageDescription = computed(() =>
  String(route.meta.description ?? 'Pantau fenomena berita ekspor dan impor.'),
)

const dateLabel = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date())

function closeMobileSidebar() {
  isMobileSidebarOpen.value = false
}

function handleRoleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const newRole = target.value as UserRole

  authStore.setRole(newRole)
  closeMobileSidebar()

  if (newRole === 'user' && route.meta.requiresAdmin) {
    void router.push({ name: 'dashboard' })
    return
  }

  if (newRole === 'admin' && route.name === 'articles') {
    void router.push({ name: 'article-management' })
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#f7f9fc] text-slate-800">
    <!-- Mobile overlay -->
    <button
      v-if="isMobileSidebarOpen"
      type="button"
      aria-label="Tutup navigasi"
      class="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
      @click="closeMobileSidebar"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex w-68 flex-col',
        'border-r border-slate-200 bg-white',
        'transition-transform duration-200',
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Brand -->
      <div class="flex h-20 shrink-0 items-center gap-3 border-b border-slate-100 px-5">
        <div class="min-w-0">
          <p class="text-lg font-bold tracking-tight text-slate-900">
            PBI <span class="text-bps-blue">Ekspor Impor</span>
          </p>
          <p class="mt-0.5 text-[10px] font-semibold tracking-[0.16em] text-slate-400">
            NEWS INTELLIGENCE
          </p>
        </div>

        <button
          type="button"
          aria-label="Tutup sidebar"
          class="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          @click="closeMobileSidebar"
        >
          <AppIcon name="x" />
        </button>
      </div>

      <!-- Navigation -->
      <nav aria-label="Navigasi utama" class="flex-1 space-y-7 overflow-y-auto px-4 py-6">
        <section>
          <p class="mb-3 px-3 text-[10px] font-bold tracking-[0.16em] text-slate-400">MENU UTAMA</p>

          <div class="space-y-1.5">
            <RouterLink
              v-for="item in primaryItems"
              :key="item.routeName"
              :to="{ name: item.routeName }"
              :aria-current="route.name === item.routeName ? 'page' : undefined"
              :class="[
                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium',
                'transition-colors duration-150',
                route.name === item.routeName
                  ? 'bg-bps-blue/10 text-bps-blue ring-1 ring-inset ring-bps-blue/15'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-bps-blue',
              ]"
              @click="closeMobileSidebar"
            >
              <AppIcon :name="item.icon" class="h-5 w-5 shrink-0" />

              <span class="min-w-0 flex-1 leading-5">
                {{ item.label }}
              </span>
            </RouterLink>
          </div>
        </section>

        <section v-if="visibleAdminItems.length > 0">
          <p class="mb-3 px-3 text-[10px] font-bold tracking-[0.16em] text-slate-400">
            OPERASIONAL
          </p>

          <div class="space-y-1.5">
            <RouterLink
              v-for="item in visibleAdminItems"
              :key="item.routeName"
              :to="{ name: item.routeName }"
              :aria-current="route.name === item.routeName ? 'page' : undefined"
              :class="[
                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium',
                'transition-colors duration-150',
                route.name === item.routeName
                  ? 'bg-bps-blue/10 text-bps-blue ring-1 ring-inset ring-bps-blue/15'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-bps-blue',
              ]"
              @click="closeMobileSidebar"
            >
              <AppIcon :name="item.icon" class="h-5 w-5 shrink-0" />

              <span class="min-w-0 flex-1 leading-5">
                {{ item.label }}
              </span>
            </RouterLink>
          </div>
        </section>
      </nav>

      <!-- Prototype status -->
      <div class="shrink-0 border-t border-slate-100 p-4">
        <div class="rounded-xl border border-blue-100 bg-blue-50/70 p-3">
          <div class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-bps-orange" aria-hidden="true" />
            <p class="text-xs font-semibold text-slate-800">Mode Prototipe</p>
          </div>

          <p class="mt-2 text-xs leading-relaxed text-slate-500">
            Data simulasi. Belum terhubung ke layanan crawling aktif.
          </p>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="min-h-screen lg:pl-68">
      <!-- Topbar -->
      <header class="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div class="flex min-h-20 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div class="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Buka navigasi"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-bps-blue/40 hover:text-bps-blue lg:hidden"
              @click="isMobileSidebarOpen = true"
            >
              <AppIcon name="menu" class="h-5 w-5" />
            </button>

            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-slate-800 sm:text-base">
                Monitoring Ekspor & Impor
              </p>
              <p class="mt-1 hidden text-xs text-slate-500 sm:block">
                Portal analisis fenomena berita nasional
              </p>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-3 sm:gap-4">
            <div class="hidden text-right xl:block">
              <p class="text-xs font-medium capitalize text-slate-700">
                {{ dateLabel }}
              </p>
              <p class="mt-1 text-[11px] text-slate-400">Ruang kerja prototipe</p>
            </div>

            <div class="hidden h-9 w-px bg-slate-200 xl:block" aria-hidden="true" />

            <div>
              <label
                for="role-switcher"
                class="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500"
              >
                Simulasi role
              </label>

              <select
                id="role-switcher"
                :value="authStore.role"
                class="h-9 max-w-32 rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-700 outline-none transition focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15 sm:px-3"
                @change="handleRoleChange"
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>

            <div
              :class="[
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                'text-xs font-bold ring-2 ring-white',
                authStore.isAdmin
                  ? 'bg-bps-blue/10 text-bps-blue'
                  : 'bg-emerald-50 text-emerald-700',
              ]"
              :title="authStore.isAdmin ? 'Administrator' : 'User'"
            >
              {{ authStore.isAdmin ? 'AD' : 'US' }}
            </div>
          </div>
        </div>
      </header>

      <!-- Page heading -->
      <main class="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div class="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div class="min-w-0">
            <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {{ pageTitle }}
            </h1>

            <p class="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
              {{ pageDescription }}
            </p>
          </div>
        </div>

        <RouterView />
      </main>

      <!-- Footer -->
      <footer class="px-4 pb-6 sm:px-6 lg:px-8">
        <div
          class="flex flex-col gap-2 border-t border-slate-200 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>© 2026</p>
          <p>Monitoring fenomena berita ekspor impor</p>
        </div>
      </footer>
    </div>
  </div>
</template>
