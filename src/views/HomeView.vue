<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Card from 'primevue/card'
import InputBar from '@/components/InputBar.vue'

const showContent = ref(false)

onMounted(() => {
  showContent.value = true
})
</script>

<template>
  <Transition name="fade">
    <main id="app-layout" v-if="showContent">
      <div id="app-horizontal">
        <Card class="card">
          <template #title>
            <div class="center-text title">Ifpshare PDF Downloader</div>
          </template>
          <template #subtitle>
            <div class="center-text subtitle">
              Downloads images from https://ifpshare.com and converts them into PDF
            </div>
          </template>
          <template #content><InputBar /></template>
        </Card>
      </div>
    </main>
  </Transition>
</template>

<style scoped>
/* App layout styles */
#app-layout {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;

  background-image:
    repeating-linear-gradient(
      to right,
      var(--grid-line-color) 0,
      var(--grid-line-color) 1px,
      transparent 1px,
      transparent var(--grid-size)
    ),
    repeating-linear-gradient(
      to bottom,
      var(--grid-line-color) 0,
      var(--grid-line-color) 1px,
      transparent 1px,
      transparent var(--grid-size)
    );
  background-size: var(--grid-size) var(--grid-size);
  background-color: var(--background-color);
}

#app-horizontal {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 50%;
}

/* Card styles */
.card {
  box-shadow: 0 4px 8px hsla(0, 0%, 0%, 0.5);
}

.center-text {
  text-align: center;
}

.center-text.title {
  font-family: 'IBM Plex Sans';
  font-size: 2em;
  font-weight: bold;
  color: var(--p-primary-color);
}

/* Animation */
.fade-enter-from {
  opacity: 0.01;
  transform: translateY(10px);
}

.fade-enter-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

/* -- Smaller Screens -- */
@media (max-width: 768px) {
  #app-horizontal {
    width: 90%;
  }

  .center-text.title {
    font-size: 1.5em;
  }

  .center-text.subtitle {
    font-size: 0.9em;
  }
}

/* -- Very small screens -- */
@media (max-width: 480px) {
  #app-layout {
    padding: 0.75rem; /* Slightly reduce padding */
  }

  #app-horizontal {
    width: 95%;
  }

  .center-text.title {
    font-size: 1.3em;
  }

  .center-text.subtitle {
    font-size: 0.82em;
  }
}
</style>
