<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { Form } from '@primevue/forms'
import InputGroup from 'primevue/InputGroup'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'

import Toast from 'primevue/toast'
import { useToast } from 'primevue'

/* Internal imports */
import { ParsedJsonSchema, type ParsedJson } from '@/types'

import { parsePrefixedImageUrlsFromJson } from '@/utils/json'
import { createAndSavePDF } from '@/utils/pdf'
import { getFetchURL } from '@/utils/url'

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

/* Step 1: Get JSON from the given URL */
async function getJson(url: string): Promise<ParsedJson | null> {
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
    const response = await fetch(fetchURL)
    if (!response.ok) {
      showError('Failed to fetch JSON data. Have you entered a valid URL?')
      return null
    }
    const jsonData = await response.json()
    const parsedJson = ParsedJsonSchema.parse(jsonData)
    return parsedJson
    /* use type zod to validate the jsonData */
  } catch (error) {
    showError('Failed to fetch JSON data. Have you entered a valid URL?')
    console.error('Error fetching JSON:', error)
    return null
  }
}

/* Step 2: Download images from image urls in the JSON data */
async function downloadImages(imageUrls: string[]): Promise<Blob[]> {
  const imageBlobs: Blob[] = []
  /* parallel download */
  const downloadPromises = imageUrls.map(async (url) => {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        showError('Failed to fetch image. Have you entered a valid URL?')
        return
      }
      // save all blobs
      const blob = await response.blob()
      imageBlobs.push(blob)
    } catch (error) {
      showError('Failed to fetch image. Have you entered a valid URL?')
      console.error('Error fetching image:', error)
    }
  })

  await Promise.all(downloadPromises)
  return imageBlobs
}

/* Main function to create PDF */
async function createPDF() {
  loading.value = true
  const url = urlInput.value.trim()
  const jsonData = await getJson(url)
  if (!jsonData) {
    loading.value = false
    return
  }

  const imageUrls = parsePrefixedImageUrlsFromJson(jsonData)
  if (imageUrls.length === 0) {
    showError('No PNG images found in the provided URL. Have you entered a valid URL?')
    loading.value = false
    return
  }

  await downloadImages(imageUrls)

  if (imageUrls.length === 0) {
    showError('No PNG images found in the provided URL. Have you entered a valid URL?')
    loading.value = false
    return
  }

  const imageBlobs = await downloadImages(imageUrls)
  createAndSavePDF(imageBlobs)
    .then(() => {
      loading.value = false
    })
    .catch((error) => {
      showError('Failed to create PDF. Have you entered a valid URL?')
      console.error('Error creating PDF:', error)
      loading.value = false
    })
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
      strokeWidth="8"
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
  margin: 1em auto;
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
