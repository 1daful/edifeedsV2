<template>
  <q-card class="card-container" :class="{ 'featured-card': featured }">
    <div class="card-image-box">
      {{ icon }}
    </div>
    <q-card-section>
      <div class="text-h6 q-mb-sm">{{ title }}</div>
      <div class="text-subtitle2 text-grey-7">{{ description }}</div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  title: String,
  description: String,
  icon: String,
  featured: {
    type: Boolean,
    default: false
  }
});
</script>

<style lang="scss" scoped>
.card-container {
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
}
.card-image-box {
  height: 200px;
  font-size: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
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
.featured-card {
  .card-image-box {
    height: 300px;
    font-size: 4rem;
  }
}
</style>
