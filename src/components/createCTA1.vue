<template>
  <section class="create-on-edifeeds-section py-16 px-4 text-center bg-primary text-white rounded-2xl shadow-lg">
    <div class="max-w-2xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold mb-4">Edifeeds is Yours to Share Too</h2>
      <p class="text-lg md:text-xl mb-6">
        Create, curate, and share inspiring content with the Edifeeds community. Your voice can uplift others.
      </p>
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <q-btn color="white" text-color="primary" label="Start Creating" @click="goToCreate" class="text-lg font-semibold py-3 px-6 rounded-full" />
        <q-btn color="white" flat text-color="white" label="Learn More" @click="goToLearnMore" class="text-lg font-semibold py-3 px-6 rounded-full border-white border" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goToCreate() {
  router.push('/create'); // adjust to your upload/contribute page route
}

function goToLearnMore() {
  router.push('/about/contributing'); // adjust to your guidelines page route
}
</script>

<style scoped>
.create-on-edifeeds-section {
  background: linear-gradient(to right, #4b6cb7, #182848); /* or match your brand primary */
}
</style>
