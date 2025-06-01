import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import FocusTrap from 'primevue/focustrap'
import Lara from '@primeuix/themes/lara'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import { definePreset } from '@primeuix/themes'

const app = createApp(App)
const themePreset = definePreset(Lara, {
  semantic: {
    colorScheme: {
      light: {
        primary: {
          color: '{emerald:950}',
        },
      },
    },
  },
})

app.use(PrimeVue, {
  theme: {
    preset: themePreset,
    options: {
      darkModeSelector: 'system',
    },
  },
})

app.use(ToastService)
app.directive('focustrap', FocusTrap)
app.mount('#app')
