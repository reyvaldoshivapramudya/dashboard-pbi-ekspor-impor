<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

import AppIcon from '@/shared/components/AppIcon.vue'
import { useAuthStore, type UserRole } from '@/app/stores/auth.store'

import logoBps from '@/assets/images/bps-logo.png'

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

// Logic jam real-time
const currentTime = ref(new Date())

let clockInterval: ReturnType<typeof setInterval> | undefined

const timeLabel = computed(() => {
  const time = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Jakarta',
  })
    .format(currentTime.value)
    .replace(/:/g, '.')

  return `${time} WIB (GMT+7)`
})

onMounted(() => {
  clockInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (clockInterval !== undefined) {
    clearInterval(clockInterval)
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#f1f6ff] text-slate-800">
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
        'fixed inset-y-0 left-0 z-50 flex w-[min(88vw,20rem)] flex-col lg:w-60',
        'border-r border-white/10 bg-[#052b61] text-white shadow-xl shadow-blue-950/20',
        'transition-transform duration-200',
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Identitas BPS dan RITME -->
      <div class="shrink-0 px-4 pb-4 pt-4 sm:px-5 sm:pt-5">
        <div class="flex items-center gap-3 border-b border-white/20 px-1 pb-4 sm:pb-5">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center sm:w-14">
            <img :src="logoBps" alt="Logo BPS" class="h-auto max-h-12 w-full object-contain" />
          </div>

          <div class="min-w-0 flex-1">
            <p
              class="truncate text-[clamp(1.35rem,5vw,1.6rem)] font-black leading-none tracking-[0.12em] text-white"
            >
              RITME
            </p>
            <p
              class="mt-1 break-words text-[10px] font-semibold uppercase leading-3 tracking-[0.08em] text-white/75"
            >
              Rekap Informasi &amp; Tren Media
            </p>
          </div>

          <button
            type="button"
            aria-label="Tutup sidebar"
            class="shrink-0 rounded-lg p-2 text-white/75 hover:bg-white/10 lg:hidden"
            @click="closeMobileSidebar"
          >
            <AppIcon name="x" />
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <nav aria-label="Navigasi utama" class="flex-1 space-y-1 overflow-y-auto px-3 py-3 sm:px-4">
        <section>
          <div class="space-y-1.5">
            <RouterLink
              v-for="item in primaryItems"
              :key="item.routeName"
              :to="{ name: item.routeName }"
              :aria-current="route.name === item.routeName ? 'page' : undefined"
              :class="[
                'flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                'transition-colors duration-150',
                route.name === item.routeName
                  ? 'bg-[#2996f3] text-white shadow-sm shadow-blue-950/20'
                  : 'text-white/80 hover:bg-white/10 hover:text-white',
              ]"
              @click="closeMobileSidebar"
            >
              <AppIcon :name="item.icon" class="h-5 w-5 shrink-0" />

              <span class="min-w-0 flex-1 break-words leading-5">
                {{ item.label }}
              </span>
            </RouterLink>
          </div>
        </section>

        <section v-if="visibleAdminItems.length > 0">
          <div class="space-y-1.5">
            <RouterLink
              v-for="item in visibleAdminItems"
              :key="item.routeName"
              :to="{ name: item.routeName }"
              :aria-current="route.name === item.routeName ? 'page' : undefined"
              :class="[
                'flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                'transition-colors duration-150',
                route.name === item.routeName
                  ? 'bg-[#2996f3] text-white shadow-sm shadow-blue-950/20'
                  : 'text-white/80 hover:bg-white/10 hover:text-white',
              ]"
              @click="closeMobileSidebar"
            >
              <AppIcon :name="item.icon" class="h-5 w-5 shrink-0" />

              <span class="min-w-0 flex-1 break-words leading-5">
                {{ item.label }}
              </span>
            </RouterLink>
          </div>
        </section>
      </nav>

      <!-- Prototype status -->
      <div class="shrink-0 border-t border-white/15 p-3 sm:p-4">
        <div class="rounded-xl border border-white/15 bg-white/5 p-3">
          <div class="flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
            <p class="text-xs font-semibold text-white">Mode Prototipe</p>
          </div>
          <p class="mt-2 text-xs leading-relaxed text-white/70">
            Data simulasi. Belum terhubung ke layanan crawling aktif.
          </p>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="min-h-screen lg:pl-60">
      <!-- Topbar -->
      <header class="sticky top-0 z-30 border-b border-blue-100 bg-white/95 backdrop-blur">
        <div
          :class="
            route.name === 'dashboard'
              ? 'flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-6'
              : 'flex min-h-20 items-center justify-between gap-3 px-4 sm:px-6 lg:px-6'
          "
        >
          <div class="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Buka navigasi"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-bps-blue/40 hover:text-bps-blue lg:hidden"
              @click="isMobileSidebarOpen = true"
            >
              <AppIcon name="menu" class="h-5 w-5" />
            </button>

            <div class="min-w-0 py-3 sm:py-4">
              <p class="truncate text-sm font-semibold text-slate-800 sm:text-base">
                {{ pageTitle }}
              </p>
              <p class="mt-1 line-clamp-2 text-xs leading-4 text-slate-500">
                {{ pageDescription }}
              </p>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-3 sm:gap-4">
            <div class="hidden text-right xl:block">
              <p class="text-xs font-medium capitalize text-slate-700">
                {{ dateLabel }}
              </p>

              <p
                class="mt-1 text-xs font-semibold tabular-nums text-slate-500"
                aria-label="Waktu saat ini dalam zona WIB"
              >
                {{ timeLabel }}
              </p>
            </div>

            <div class="hidden h-9 w-px bg-slate-200 xl:block" aria-hidden="true" />

            <div>
              <label
                for="role-switcher"
                class="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500"
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

      <main
        :class="
          route.name === 'dashboard'
            ? 'px-3 py-2 sm:px-4 sm:py-2 lg:px-5'
            : 'px-4 py-6 sm:px-6 sm:py-8 lg:px-8'
        "
      >
        <RouterView />
      </main>

      <!-- Footer -->
      <footer v-if="route.name !== 'dashboard'" class="px-4 pb-6 sm:px-6 lg:px-8">
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
