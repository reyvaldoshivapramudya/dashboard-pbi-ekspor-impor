<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/shared/components/AppIcon.vue'

type Accent = 'blue' | 'green' | 'orange'

const props = withDefaults(
  defineProps<{
    title: string
    value: string | number
    description: string
    icon: string
    accent?: Accent
    badge?: string
  }>(),
  {
    accent: 'blue',
  },
)

const accentClasses = computed(() => {
  const styles = {
    blue: {
      icon: 'bg-blue-50 text-bps-blue',
      indicator: 'bg-bps-blue',
    },
    green: {
      icon: 'bg-emerald-50 text-bps-green',
      indicator: 'bg-bps-green',
    },
    orange: {
      icon: 'bg-orange-50 text-bps-orange',
      indicator: 'bg-bps-orange',
    },
  }

  return styles[props.accent]
})
</script>

<template>
  <article
    class="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition duration-200 hover:border-blue-200"
  >
    <div class="flex min-w-0 items-center gap-4">
      <div
        :class="[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          accentClasses.icon,
        ]"
      >
        <AppIcon :name="icon" class="h-5 w-5" />
      </div>

      <div class="min-w-0 flex-1">
        <p class="text-xs font-semibold leading-4 text-slate-500">
          {{ title }}
        </p>

        <div class="mt-0.5 flex min-w-0 items-center justify-between gap-2">
          <p
            class="wrap-break-word text-2xl font-bold leading-none tracking-tight text-slate-900"
          >
            {{ value }}
          </p>

          <span
            v-if="badge"
            class="shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600"
          >
            {{ badge }}
          </span>
        </div>

        <p class="mt-1 text-xs leading-tight text-slate-500">
          {{ description }}
        </p>
      </div>
    </div>

    <div :class="['absolute inset-x-0 bottom-0 h-0.5', accentClasses.indicator]"></div>
  </article>
</template>
