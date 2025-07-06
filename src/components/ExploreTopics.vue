<template>
  <section class="py-12 px-4 max-w-6xl mx-auto">
    <h2 class="text-2xl md:text-3xl font-bold text-center mb-8">Browse by Topics</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="topic in topics" :key="topic.slug" class="bg-white rounded-xl shadow overflow-hidden cursor-pointer hover:scale-105 transition" @click="goToTopic(topic.slug)">
        <img :src="topic.cover" alt="topic.title" class="w-full h-40 object-cover" />
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-1">{{ topic.title }}</h3>
          <p class="text-sm text-gray-600 mb-2">{{ topic.description }}</p>
          <p class="text-xs text-gray-400">{{ topic.count }} items</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';

const router = useRouter();

const topics = ref([
  {
    slug: 'faith',
    title: 'Faith',
    description: 'Strengthen your faith with inspiring resources.',
    count: 120,
    cover: '/covers/faith.jpg',
  },
  {
    slug: 'forgiveness',
    title: 'Forgiveness',
    description: 'Discover the power of God’s forgiveness and mercy.',
    count: 80,
    cover: '/covers/forgiveness.jpg',
  },
  {
    slug: 'worship',
    title: 'Worship',
    description: 'Worship resources to uplift your spirit daily.',
    count: 150,
    cover: '/covers/worship.jpg',
  },
  {
    slug: 'christian-living',
    title: 'Christian Living',
    description: 'Grow in your walk with Christ in everyday life.',
    count: 95,
    cover: '/covers/christian_living.jpg',
  },
]);

function goToTopic(slug: string) {
  router.push(`/topics/${slug}`);
}
</script>

<style scoped>
section {
  background: #f9fafb;
}
</style>
