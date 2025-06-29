<template>
  <div>
    <q-card v-for="collection in collections" :key="collection.id" class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1">{{ collection.title }}</div>
        <div class="text-caption">{{ collection.count }} items</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" :to="`/collections/${collection.id}`" label="Open Collection" />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
defineProps<{ collections: Array<{ id: string; title: string; count: number }> }>();
</script>
