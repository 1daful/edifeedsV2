<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>Edifeeds</q-toolbar-title>
      </q-toolbar>
      <q-tabs align="left" dense v-model="activeTab">
        <q-tab v-for="tab in topicTabs" :key="tab.name" :name="tab.name" :label="tab.label" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">

        <!-- Trending Videos Section -->
        <div class="q-mb-lg">
          <div class="text-h6 q-mb-sm flex justify-between items-center">
            <span>Trending Videos</span>
            <q-btn flat dense icon="arrow_forward" label="See All" @click="goToSection('videos')" />
          </div>
          <q-carousel animated swipeable control-type="flat" navigation-position="bottom" height="200px" :model-value="activeTab">
            <q-carousel-slide v-for="item in trendingVideos" :key="item.id" :name="item.title">
              <q-img :src="item.thumbnail" :alt="item.title" class="rounded-borders">
                <div class="absolute-bottom text-subtitle2 bg-black bg-opacity-50 q-pa-xs">{{ item.title }}</div>
              </q-img>
            </q-carousel-slide>
          </q-carousel>
        </div>

        <!-- Quotes of the Day Section -->
        <div class="q-mb-lg">
          <div class="text-h6 q-mb-sm flex justify-between items-center">
            <span>Quotes of the Day</span>
            <q-btn flat dense icon="arrow_forward" label="See All" @click="goToSection('quotes')" />
          </div>
          <q-slide-group snap class="no-wrap">
            <q-slide-item v-for="quote in quotesOfTheDay" :key="quote.id" class="q-mr-sm">
              <q-card flat bordered class="q-pa-md" style="width: 200px;">
                <div class="text-caption text-grey">{{ quote.author }}</div>
                <div class="text-body2">“{{ quote.text }}”</div>
              </q-card>
            </q-slide-item>
          </q-slide-group>
        </div>

        <!-- Books You May Love Section -->
        <div class="q-mb-lg">
          <div class="text-h6 q-mb-sm flex justify-between items-center">
            <span>Books You May Love</span>
            <q-btn flat dense icon="arrow_forward" label="See All" @click="goToSection('books')" />
          </div>
          <q-slide-group snap class="no-wrap">
            <q-slide-item v-for="book in booksYouMayLove" :key="book.id" class="q-mr-sm">
              <q-card flat bordered style="width: 120px;">
                <q-img :src="book.cover" :alt="book.title" ratio="2/3" />
                <q-card-section>
                  <div class="text-caption">{{ book.title }}</div>
                </q-card-section>
              </q-card>
            </q-slide-item>
          </q-slide-group>
        </div>

        <!-- New Music Section -->
        <div class="q-mb-lg">
          <div class="text-h6 q-mb-sm flex justify-between items-center">
            <span>New Music</span>
            <q-btn flat dense icon="arrow_forward" label="See All" @click="goToSection('music')" />
          </div>
          <q-slide-group snap class="no-wrap">
            <q-slide-item v-for="music in newMusic" :key="music.id" class="q-mr-sm">
              <q-card flat bordered style="width: 150px;">
                <q-img :src="music.cover" :alt="music.title" ratio="1/1" />
                <q-card-section>
                  <div class="text-caption">{{ music.title }}</div>
                </q-card-section>
              </q-card>
            </q-slide-item>
          </q-slide-group>
        </div>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('all')

const topicTabs = [
  { name: 'all', label: 'All' },
  { name: 'faith', label: 'Faith' },
  { name: 'worship', label: 'Worship' },
  { name: 'forgiveness', label: 'Forgiveness' },
  { name: 'christian_living', label: 'Christian Living' },
]

// Dummy data placeholders (replace with API reactive data)
const trendingVideos = ref([
  { id: 1, title: 'The Power of Faith', thumbnail: 'https://via.placeholder.com/300x200' },
  { id: 2, title: 'Worship Night Live', thumbnail: 'https://via.placeholder.com/300x200' },
])

const quotesOfTheDay = ref([
  { id: 1, author: 'C.S. Lewis', text: 'Faith is the art of holding on to things your reason has once accepted.' },
  { id: 2, author: 'Billy Graham', text: 'God has given us two hands, one to receive with and the other to give with.' },
])

const booksYouMayLove = ref([
  { id: 1, title: 'Mere Christianity', cover: 'https://via.placeholder.com/120x180' },
  { id: 2, title: 'The Purpose Driven Life', cover: 'https://via.placeholder.com/120x180' },
])

const newMusic = ref([
  { id: 1, title: 'Oceans - Hillsong', cover: 'https://via.placeholder.com/150' },
  { id: 2, title: 'Way Maker - Sinach', cover: 'https://via.placeholder.com/150' },
])

function goToSection(section: string) {
  router.push(`/explore/${section}`)
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
</style>
