import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import FocusTrap from 'primevue/focustrap'
import Lara from '@primeuix/themes/lara'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'

const app = createApp(App)
app.use(PrimeVue, {
  theme: {
    preset: Lara,
    options: {
      darkModeSelector: 'system',
    },
  },
})

app.use(ToastService)
app.directive('focustrap', FocusTrap)
app.mount('#app')
