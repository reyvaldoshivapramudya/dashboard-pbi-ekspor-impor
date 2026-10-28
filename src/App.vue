<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Transition v-if="route.name === 'login'" name="page-fade" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </Transition>
    <component v-else :is="Component" />
  </RouterView>
</template>
