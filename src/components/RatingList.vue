<template>
  <div>
    <q-card v-for="rating in ratings" :key="rating.id" class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1">{{ rating.title }}</div>
        <div class="text-caption">Type: {{ rating.type }}</div>
        <q-rating readonly :model-value="rating.rating" size="20px" color="amber" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" :to="`/${rating.type}/${rating.id}`" label="View Content" />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
defineProps<{ ratings: Array<{ id: string; title: string; type: string; rating: number }> }>();
</script>
