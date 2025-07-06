<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Discover Authors</div>

    <q-input
      filled
      dense
      debounce="300"
      v-model="search"
      placeholder="Search authors..."
      class="q-mb-md"
    />

    <q-card flat bordered v-for="author in filteredAuthors" :key="author.id" class="q-mb-sm cursor-pointer" @click="viewAuthor(author.id)">
      <q-item>
        <q-item-section avatar>
          <q-avatar size="56px">
            <img :src="author.image" :alt="author.name" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ author.name }}</q-item-label>
          <q-item-label caption>{{ author.tags?.join(', ') }}</q-item-label>
          <q-item-label caption>{{ author.bio.slice(0, 100) }}...</q-item-label>
        </q-item-section>
      </q-item>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AuthorProfile } from '../utils/types'

const router = useRouter()
const search = ref('')

// Replace with your API or store
const authors = ref<AuthorProfile[]>([
  {
    id: '1',
    name: 'Tim Keller',
    bio: 'Timothy Keller was the founding pastor of Redeemer Presbyterian Church in New York City...',
    image: 'https://via.placeholder.com/100',
    tags: ['Pastor', 'Author']
  },
  {
    id: '2',
    name: 'Sinach',
    bio: 'Sinach is a Nigerian gospel singer, songwriter, and senior worship leader at Loveworld...',
    image: 'https://via.placeholder.com/100',
    tags: ['Worship Leader']
  }
])

const filteredAuthors = computed(() => {
  if (!search.value) return authors.value
  return authors.value.filter(author =>
    author.name.toLowerCase().includes(search.value.toLowerCase())
  )
})

function viewAuthor(id: string) {
  router.push(`/authors/${id}`)
}
</script>
