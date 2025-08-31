<template>
  <q-card class="stat-card">
    <q-card-section class="text-center">
      <div class="stat-number text-h4 text-weight-bold text-primary">{{ number }}</div>
      <div class="stat-label text-caption text-grey-7 text-uppercase">{{ label }}</div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  number: String,
  label: String
});
</script>

<style lang="scss" scoped>
.stat-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 20px;
  padding: 1rem;
}
</style>
