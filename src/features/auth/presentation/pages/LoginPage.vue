<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import logoBps from '@/assets/images/bps-logo.png'
import loginBuilding from '@/assets/images/login-building.png'
import AppIcon from '@/shared/components/AppIcon.vue'
import { useAuthStore } from '@/app/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const isSubmitting = ref(false)

function submitLogin(): void {
  if (isSubmitting.value) return

  isSubmitting.value = true
  errorMessage.value = ''

  const result = authStore.login(username.value, password.value)
  if (!result.success) {
    errorMessage.value = result.message ?? 'Login gagal. Silakan coba kembali.'
    isSubmitting.value = false
    return
  }

  void router.push({ name: 'dashboard' })
}
</script>

<template>
  <main
    class="login-page min-h-screen bg-cover bg-center bg-no-repeat md:bg-white"
    :style="{ backgroundImage: `url(${loginBuilding})` }"
  >
    <section class="grid min-h-screen w-full overflow-hidden bg-white md:grid-cols-2 md:bg-white">
      <div
        class="login-form-panel flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-20 lg:py-14"
      >
        <div class="mx-auto w-full max-w-md">
        <div class="login-brand mb-10 flex items-center gap-4">
          <img :src="logoBps" alt="Logo BPS" class="h-16 w-16 object-contain" />
          <div>
            <p class="text-xl font-extrabold tracking-[0.16em] text-bps-blue">RITME</p>
            <p class="text-xs font-medium leading-5 text-slate-400">
              Rekap Informasi &amp; Tren Media
            </p>
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-bps-blue">Selamat datang</p>
          <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">Masuk ke akun Anda</h1>
          <p class="mt-2 text-sm leading-6 text-slate-500">
            Pantau informasi dan tren berita ekspor impor dalam satu dashboard.
          </p>
        </div>

        <form class="mt-8 space-y-5" @submit.prevent="submitLogin">
        <div
          v-if="errorMessage"
          role="alert"
          class="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
        >
          <AppIcon name="circle-alert" class="mt-0.5 h-4 w-4 shrink-0" />
          <p>{{ errorMessage }}</p>
        </div>

        <div>
          <label for="login-username" class="mb-1.5 block text-xs font-semibold text-slate-700">
            Username
          </label>
          <input
            id="login-username"
            v-model="username"
            autocomplete="username"
            required
            class="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
            placeholder="Masukkan username Anda"
          />
        </div>

        <div>
          <label for="login-password" class="mb-1.5 block text-xs font-semibold text-slate-700">
            Kata sandi
          </label>
          <div class="relative">
            <input
              id="login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
              class="h-11 w-full rounded-lg border border-slate-200 px-3 pr-11 text-sm outline-none transition placeholder:text-slate-400 focus:border-bps-blue focus:ring-2 focus:ring-bps-blue/15"
              placeholder="Masukkan kata sandi Anda"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-slate-400 transition hover:text-slate-600"
              :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              <AppIcon :name="showPassword ? 'eye-off' : 'eye'" class="h-4 w-4" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-bps-blue px-4 text-sm font-semibold text-white transition hover:bg-bps-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <AppIcon v-if="isSubmitting" name="loader" class="h-4 w-4 animate-spin" />
          Masuk
        </button>
        </form>

        <div class="mt-7 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-400">
          <p class="font-semibold text-slate-600">Akun demo pengembangan</p>
          <p class="mt-1">Admin: <strong class="text-slate-500">admin / admin123</strong></p>
          <p>User: <strong class="text-slate-500">user / user123</strong></p>
        </div>
        </div>
      </div>

      <div class="relative hidden min-h-screen bg-slate-100 md:block">
        <img
          :src="loginBuilding"
          alt="Gedung Badan Pusat Statistik"
          class="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </section>
  </main>
</template>
