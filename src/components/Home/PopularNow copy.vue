<template>
  <section class="q-mb-xl">
    <h2 class="text-h5 text-primary q-mb-md">Popular Now</h2>
    <q-carousel
      v-model="slide"
      navigation
      height="220px"
      control-color="primary"
      arrows
    >
      <q-carousel-slide
        v-for="item in items"
        :name="item.id"
        :key="item.id"
        @click="goToContent(item.id, item.type)"
        class="cursor-pointer"
      >
        <q-img :src="item.cover" :ratio="16/9" />
        <div class="absolute-bottom bg-black bg-opacity-50 text-white q-pa-sm">
          <div class="text-subtitle1">{{ item.title }}</div>
        </div>
      </q-carousel-slide>
    </q-carousel>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { defineProps } from 'vue'

const props = defineProps<{
  items: Array<{
    id: number
    title: string
    cover: string
    type: string // video | music | book | quote
  }>
}>()

const router = useRouter()
const slide = ref(1)

const goToContent = (id: number, type: string) => {
  router.push(`/content/${type}/${id}`)
}
</script>
