<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'

import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  Database,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  File,
  FilePenLine,
  FilePlus,
  Globe,
  History,
  Info,
  LoaderCircle,
  LogOut,
  Menu,
  Moon,
  Package,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sun,
  ThumbsUp,
  Trash2,
  X,
} from '@lucide/vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    name: string
    size?: number
    strokeWidth?: number
  }>(),
  {
    size: 18,
    strokeWidth: 1.8,
  },
)

const icons: Record<string, Component> = {
  activity: Activity,
  'arrow-down': ArrowDown,
  'arrow-up': ArrowUp,
  'bar-chart': BarChart3,
  bell: Bell,
  calendar: CalendarDays,
  check: Check,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'circle-alert': CircleAlert,
  'circle-check': CircleCheck,
  'circle-help': CircleHelp,
  database: Database,
  download: Download,
  'external-link': ExternalLink,
  eye: Eye,
  'eye-off': EyeOff,
  file: File,
  'file-edit': FilePenLine,
  'file-plus': FilePlus,
  globe: Globe,
  history: History,
  info: Info,
  loader: LoaderCircle,
  'log-out': LogOut,
  menu: Menu,
  package: Package,
  pencil: Pencil,
  play: Play,
  plus: Plus,
  refresh: RefreshCw,
  search: Search,
  sliders: SlidersHorizontal,
  moon: Moon,
  sun: Sun,
  'thumbs-up': ThumbsUp,
  trash: Trash2,
  x: X,
}

const resolvedIcon = computed(() => icons[props.name] ?? CircleHelp)
</script>

<template>
  <component
    :is="resolvedIcon"
    v-bind="$attrs"
    :size="size"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  />
</template>
