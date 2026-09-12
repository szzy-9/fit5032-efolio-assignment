import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initializeDemoAdmin } from './services/auth'

async function startApp() {
  let initializationError = ''
  try {
    await initializeDemoAdmin()
  } catch (error) {
    initializationError = error.message || 'Unable to initialize the demo admin. Please reload.'
  }
  createApp(App, { initializationError }).use(router).mount('#app')
}

startApp()
