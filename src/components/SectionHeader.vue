<template>
  <div class="q-mb-xl section-header">
    <div class="section-icon">
      {{ icon }}
    </div>
    <h2 class="section-title text-h4 text-weight-bold">{{ title }}</h2>
    <q-space />
    <span v-if="subtitle" class="section-subtitle">{{ subtitle }}</span>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  title: String,
  subtitle: String
});
</script>

<style lang="scss" scoped>
.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="white" opacity="0.1"/><circle cx="80" cy="40" r="1" fill="white" opacity="0.1"/><circle cx="40" cy="70" r="1" fill="white" opacity="0.1"/><circle cx="90" cy="90" r="1" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    pointer-events: none;
  }
}
.section-subtitle {
  color: #666;
  font-size: 1rem;
}
</style>
