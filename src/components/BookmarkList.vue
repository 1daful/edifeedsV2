<template>
  <div>
    <q-card v-for="item in items" :key="item.id" class="q-mb-md">
      <q-img :src="item.thumbnail" ratio="16/9" />
      <q-card-section>
        <div class="text-subtitle1">{{ item.title }}</div>
        <div class="text-caption">Type: {{ item.type }}</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" :to="`/${item.type}/${item.id}`" label="View" />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
defineProps<{ items: Array<{ id: string; title: string; type: string; thumbnail: string }> }>();
</script>
