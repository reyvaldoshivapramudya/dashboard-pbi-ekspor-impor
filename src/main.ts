import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './app/router'

import './assets/main.css'

document.documentElement.dataset.theme =
  window.localStorage.getItem('eksim-insight:theme') === 'dark' ? 'dark' : 'light'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
