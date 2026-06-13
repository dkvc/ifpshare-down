<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { Form } from '@primevue/forms'
import InputGroup from 'primevue/inputgroup'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

import Toast from 'primevue/toast'
import { useToast } from 'primevue'

/* Internal imports */
import { ParsedJsonSchema, ShareResourcesSchema } from '@/types'

import { parsePrefixedImageUrlsFromJson, parseImageUrlsFromResources } from '@/utils/json'
import { processImages } from '@/utils/image'
import { createAndSavePDF } from '@/utils/pdf'
import { getFetchURL, getMdcArea, isNewFormatURL, extractSId } from '@/utils/url'

/* Refs */
const urlInput = ref('')
const loading = ref(false)
const phase = ref<'idle' | 'downloading' | 'processing' | 'generating'>('idle')
const progress = ref<{ current: number; total: number } | null>(null)
const abortController = ref<AbortController | null>(null)

/* Computed */
const progressPercent = computed(() => {
  if (!progress.value) return 0
  return Math.round((progress.value.current / progress.value.total) * 100)
})

const phaseLabel = computed(() => {
  switch (phase.value) {
    case 'downloading': return 'Downloading images...'
    case 'processing': return 'Processing images...'
    case 'generating': return 'Generating PDF...'
    default: return ''
  }
})

/* Handle Mobile/Different screens */
const windowWidth = ref(window.innerWidth)
const isMobile = computed(() => windowWidth.value < 768)
const toastPosition = computed(() => {
  return isMobile.value ? 'top-center' : 'top-right'
})
const toastBreakpoints = {
  '767px': {
    width: '90vw',
  },
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

/* Initialize toasts */
const toast = useToast()
const showError = (message: string) => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
    life: 3000,
  })
}

/* Step 1: Get image URLs from the given URL */
async function getImageUrls(url: string): Promise<string[] | null> {
  if (!url) {
    showError('Please enter a URL')
    return null
  }

  const fetchURL = getFetchURL(url)
  if (!fetchURL) {
    showError('Invalid URL provided. Have you entered a valid URL?')
    return null
  }
  try {
    const isNew = isNewFormatURL(url)
    const headers: Record<string, string> = {}
    if (isNew) {
      const sId = extractSId(url)
      if (sId) {
        const mdcArea = getMdcArea(sId)
        if (mdcArea) headers['mdc-area'] = mdcArea
      }
    }

    const response = await fetch(fetchURL, { headers: isNew ? headers : undefined })
    if (!response.ok) {
      showError('Failed to fetch data. Have you entered a valid URL?')
      return null
    }
    const jsonData = await response.json()

    if (isNew) {
      const resources = ShareResourcesSchema.parse(jsonData)
      return parseImageUrlsFromResources(resources)
    }
    const parsedJson = ParsedJsonSchema.parse(jsonData)
    return parsePrefixedImageUrlsFromJson(parsedJson)
  } catch (error) {
    showError('Failed to fetch data. Have you entered a valid URL?')
    console.error('Error fetching data:', error)
    return null
  }
}

/* Step 2: Download images with concurrency limit */
async function downloadImages(
  imageUrls: string[],
  signal?: AbortSignal,
  onProgress?: (done: number, total: number) => void,
): Promise<Blob[]> {
  const imageBlobs: Blob[] = []
  const CONCURRENCY = 4
  let downloaded = 0

  const iterator = imageUrls.entries()
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    for (const [i, url] of iterator) {
      if (signal?.aborted) break
      try {
        const response = await fetch(url, { signal })
        if (!response.ok) {
          showError('Failed to fetch image.')
          continue
        }
        const blob = await response.blob()
        imageBlobs[i] = blob
        onProgress?.(++downloaded, imageUrls.length)
      } catch (error) {
        if ((error as Error).name === 'AbortError') break
        showError('Failed to fetch image.')
        console.error('Error fetching image:', error)
      }
    }
  })
  await Promise.all(workers)
  return imageBlobs
}

/* Cancel */
function cancelOperation() {
  abortController.value?.abort()
  abortController.value = null
  phase.value = 'idle'
  progress.value = null
  loading.value = false
}

/* Main function to create PDF */
async function createPDF() {
  loading.value = true
  phase.value = 'downloading'
  progress.value = null
  abortController.value = new AbortController()
  const signal = abortController.value.signal

  const url = urlInput.value.trim()

  const imageUrls = await getImageUrls(url)
  if (!imageUrls || imageUrls.length === 0) {
    if (imageUrls?.length === 0) showError('No PNG images found in the provided URL.')
    cancelOperation()
    return
  }

  progress.value = { current: 0, total: imageUrls.length }

  try {
    const imageBlobs = await downloadImages(
      imageUrls,
      signal,
      (done, total) => { progress.value = { current: done, total } },
    )

    phase.value = 'processing'
    const processed = await processImages(
      imageBlobs,
      (done, total) => { progress.value = { current: done, total } },
      signal,
    )

    phase.value = 'generating'
    progress.value = null
    await createAndSavePDF(processed)
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      showError('Failed to create PDF.')
      console.error('Error creating PDF:', error)
    }
  } finally {
    loading.value = false
    phase.value = 'idle'
    progress.value = null
    abortController.value = null
  }
}
</script>

<template>
  <div v-focustrap>
    <div v-if="isMobile">
      <Form @submit="createPDF" id="mobile-div">
        <InputText placeholder="Enter URL" v-model="urlInput" :disabled="loading" autofocus />
        <Button type="submit" label="Create PDF" :disabled="loading" />
      </Form>
    </div>
    <div v-else>
      <Form @submit="createPDF">
        <InputGroup>
          <InputText placeholder="Enter URL" v-model="urlInput" :disabled="loading" autofocus />
          <Button type="submit" label="Create PDF" :disabled="loading" />
        </InputGroup>
      </Form>
    </div>

    <div v-if="loading" class="progress-area">
      <div class="progress-label">{{ phaseLabel }}</div>
      <div v-if="progress" class="progress-bar-track">
        <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <div v-if="progress" class="progress-counter">{{ progress.current }} / {{ progress.total }}</div>
      <Button label="Cancel" severity="danger" size="small" @click="cancelOperation" class="cancel-btn" />
    </div>

    <Toast :position="toastPosition" :breakpoints="toastBreakpoints" />
  </div>
</template>

<style scoped>
.progress-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.progress-label {
  font-size: 0.9rem;
  color: var(--p-text-muted-color);
}

.progress-bar-track {
  width: 100%;
  height: 6px;
  background: var(--p-surface-200);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--p-primary-color);
  border-radius: 3px;
  transition: width 0.2s ease;
}

.progress-counter {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}

.cancel-btn {
  margin-top: 0.25rem;
}

/* Small screens */
@media (max-width: 768px) {
  #mobile-div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1em;
    width: 100%;
  }
}
</style>
