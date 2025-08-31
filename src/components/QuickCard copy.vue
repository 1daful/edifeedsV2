<template>
  <q-card class="quick-card-container">
    <q-card-section class="text-center">
      <div class="text-h4 text-primary q-mb-md">{{ icon }}</div>
      <div class="text-h6 text-weight-bold q-mb-sm">{{ title }}</div>
      <div class="text-caption text-grey-7">{{ description }}</div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  icon: String,
  title: String,
  description: String
});
</script>

<style lang="scss" scoped>
.quick-card-container {
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(102, 126, 234, 0.2);
  }
}
</style>
