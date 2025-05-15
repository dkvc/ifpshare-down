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
    <InputText placeholder="https://ifpshare.com/..." />
    <Button label="Create PDF" @click="createPDF" />
  </InputGroup>

  <Toast position="bottom-right" />
</template>
