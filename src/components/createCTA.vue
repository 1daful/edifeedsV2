<template>
  <section class="py-12 px-4 grid gap-8 max-w-5xl mx-auto">
    <div v-for="feature in features" :key="feature.title" class="bg-white rounded-xl shadow p-6 text-center">
      <q-icon :name="feature.icon" size="48px" color="primary" class="mb-4" />
      <h3 class="text-xl font-semibold mb-2">{{ feature.title }}</h3>
      <p class="text-gray-700 mb-3">{{ feature.description }}</p>
      <p class="text-sm italic text-gray-500">{{ feature.scripture }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { QIcon } from 'quasar';

const features = ref([
  {
    icon: 'create',
    title: 'Share Your Light',
    description: 'Use simple tools to share devotionals, prayers, and inspirations God lays on your heart.',
    scripture: '"You are the light of the world..." - Matthew 5:14'
  },
  {
    icon: 'group',
    title: 'Build Up the Body',
    description: 'Encourage fellow believers as we grow in faith and love together.',
    scripture: '"...encourage one another and build one another up..." - 1 Thessalonians 5:11'
  },
  {
    icon: 'insights',
    title: 'See Lives Touched',
    description: 'Witness how your shared words and worship uplift hearts across the world.',
    scripture: '"Let your light shine before others, so that they may see your good works..." - Matthew 5:16'
  }
]);
</script>

<style scoped>
section {
  background: #f9fafb;
}
</style>
