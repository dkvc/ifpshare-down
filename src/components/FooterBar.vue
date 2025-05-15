<script setup lang="ts">
import Button from 'primevue/button'
import Panel from 'primevue/panel'
</script>

<template>
  <footer>
    <Panel>
      <div class="footer-bar">
        <p>© MIT License</p>
        <p id="appVersion">v0.1.0</p>
        <div class="footer-bar-icons">
          <Button
            as="a"
            label="GitHub"
            href="https://github.com/dkvc/ifpshare-down/"
            icon="pi pi-github"
            target="_blank"
            rel="noopener"
            variant="outlined"
            size="small"
          />
        </div>
      </div>
    </Panel>
  </footer>
</template>

<style scoped>
.footer-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;

  font-family: 'IBM Plex Sans';
  font-weight: 500;

  color: var(--p-text-muted-color);
}

.footer-bar-icons {
  display: flex;
}
</style>
