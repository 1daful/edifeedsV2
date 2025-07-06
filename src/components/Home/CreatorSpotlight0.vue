<template>
  <section class="q-mb-xl">
    <h2 class="text-h5 text-primary q-mb-md">Spotlight on Creators</h2>
    <q-card-group row wrap>
      <q-card
        v-for="creator in creators"
        :key="creator.id"
        flat
        bordered
        class="rounded-borders hover-lift q-ma-sm cursor-pointer"
        style="width: 180px;"
        @click="goToCreator(creator.slug)"
      >
        <q-img :src="creator.avatar" ratio="1" />
        <q-card-section>
          <div class="text-subtitle1">{{ creator.name }}</div>
          <div class="text-caption text-grey-7">{{ creator.bio }}</div>
        </q-card-section>
      </q-card>
    </q-card-group>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { defineProps } from 'vue'

const props = defineProps<{
  creators: Array<{
    id: number
    name: string
    bio: string
    avatar: string
    slug: string
  }>
}>()

const router = useRouter()
const goToCreator = (slug: string) => {
  router.push(`/creators/${slug}`)
}
</script>
