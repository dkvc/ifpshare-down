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
        <Card>
          <template #title>
            <div class="center-text title">Ifpshare PDF Downloader</div>
          </template>
          <template #subtitle>
            <div class="center-text">
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
}

#app-horizontal {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 50%;
}

/* Card styles */
.center-text {
  text-align: center;
}

.center-text.title {
  font-size: 2em;
  font-weight: bold;
  color: var(--p-primary-color);
}

/* Animation */
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}
</style>
