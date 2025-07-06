<template>
  <section class="q-mb-xl">
    <h2 class="text-h5 text-primary q-mb-md">Browse by Topic</h2>
    <q-card-group row wrap>
      <q-card
        v-for="topic in topics"
        :key="topic.id"
        class="rounded-borders hover-lift cursor-pointer q-ma-sm"
        flat
        bordered
        @click="goToTopic(topic.slug)"
        style="width: 200px;"
      >
        <q-img :src="topic.image" ratio="16/9" />
        <q-card-section>
          <div class="text-subtitle1">{{ topic.title }}</div>
          <div class="text-caption text-grey-7">{{ topic.description }}</div>
        </q-card-section>
      </q-card>
    </q-card-group>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { defineProps } from 'vue'

const props = defineProps<{
  topics: Array<{
    id: number
    title: string
    description: string
    image: string
    slug: string
  }>
}>()

const router = useRouter()
const goToTopic = (slug: string) => {
  router.push(`/topics/${slug}`)
}
</script>
