<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { Form } from '@primevue/forms'
import InputGroup from 'primevue/inputgroup'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'

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

/* Handle Mobile/Different screens */
const windowWidth = ref(window.innerWidth)
const isMobile = computed(() => windowWidth.value < 768)
const toastPosition = computed(() => {
  return isMobile.value ? 'top-center' : 'top-right'
})
const toastBreakpoints = {
  // When screen width is 767px or less (If you change this, change value in isMobile too)
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
async function downloadImages(imageUrls: string[], signal?: AbortSignal): Promise<Blob[]> {
  const imageBlobs: Blob[] = []
  const CONCURRENCY = 4

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

/* Main function to create PDF */
async function createPDF() {
  loading.value = true
  const url = urlInput.value.trim()

  const imageUrls = await getImageUrls(url)
  if (!imageUrls || imageUrls.length === 0) {
    if (imageUrls?.length === 0) {
      showError('No PNG images found in the provided URL.')
    }
    loading.value = false
    return
  }

  const abortController = new AbortController()
  const noop = () => {}

  try {
    const imageBlobs = await downloadImages(imageUrls, abortController.signal)
    const processed = await processImages(imageBlobs, noop, abortController.signal)
    await createAndSavePDF(processed)
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      showError('Failed to create PDF.')
      console.error('Error creating PDF:', error)
    }
  } finally {
    loading.value = false
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

    <ProgressSpinner
      style="width: 50px; height: 50px"
      strokeWidth="6"
      fill="transparent"
      animationDuration=".5s"
      aria-label="Generating PDF"
      v-if="loading"
      class="spinner"
    />

    <Toast :position="toastPosition" :breakpoints="toastBreakpoints" />
  </div>
</template>

<style scoped>
.spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1.5rem auto 0rem;
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
