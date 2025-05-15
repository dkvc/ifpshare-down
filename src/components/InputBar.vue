<script setup lang="ts">
import { ref } from 'vue'

import InputGroup from 'primevue/inputgroup'
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

/* Initialize toasts */
const toast = useToast()
const showError = (message: string) => {
  toast.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
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
    <div v-if="isMobile" id="mobile-div">
      <InputText placeholder="Enter URL" v-model="urlInput" autofocus />
      <Button type="button" label="Create PDF" @click="createPDF" :disabled="loading" />
    </div>
    <div v-else>
      <InputGroup>
        <InputText placeholder="Enter URL" v-model="urlInput" autofocus />
        <Button type="button" label="Create PDF" @click="createPDF" :disabled="loading" />
      </InputGroup>
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
</style>
