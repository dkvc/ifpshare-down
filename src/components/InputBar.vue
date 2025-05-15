<script setup lang="ts">
/* This component is not meant to be reusable for other projects */
import { ref } from 'vue'
import InputGroup from 'primevue/inputgroup'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Toast from 'primevue/toast'
import { useToast } from 'primevue'

</script>

<template>
  <InputGroup>
    <InputText placeholder="Enter URL" v-model="urlInput" />
    <Button label="Create PDF" @click="createPDF" :disabled="loading" />
  </InputGroup>

  <ProgressSpinner
    style="width: 50px; height: 50px"
    strokeWidth="8"
    fill="transparent"
    animationDuration=".5s"
    aria-label="Generating PDF"
    v-if="loading"
    class="spinner"
  />
  <Toast position="top-right" />
</template>

<style scoped>
.spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 1em auto;
}
</style>
