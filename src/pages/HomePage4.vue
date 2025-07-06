<template>
  <q-page class="q-pa-md">

    <div class="text-center q-mb-xl">
      <h1 class="text-h4 q-mb-sm">What are you looking for today?</h1>
      <p class="text-subtitle1">Discover inspiration, guidance, and uplifting content</p>
    </div>

    <BrowseTopics :topics="topics" />

    <PopularNow :items="popularItems" />

    <ExploreByType>
      <template #videos>
        <div>Show Videos Grid Here</div>
      </template>
      <template #music>
        <div>Show Music Grid Here</div>
      </template>
      <template #books>
        <div>Show Books Grid Here</div>
      </template>
      <template #quotes>
        <div>Show Quotes Grid Here</div>
      </template>
    </ExploreByType>

    <DailyInspirations
      :quote="dailyQuote"
      :song="dailySong"
      :devotional="dailyDevotional"
    />

    <CreatorSpotlight :creators="creators" />

  </q-page>
</template>

<script setup lang="ts">
import BrowseTopics from '../components/Home/BrowseTopics.vue'
import PopularNow from '../components/Home/PopularNow.vue'
import ExploreByType from '../components/Home/ExploreByType.vue'
import DailyInspirations from '../components/Home/DailyInspirations.vue'
import CreatorSpotlight from '../components/Home/CreatorSpotlight.vue'

import { ref } from 'vue'

// Replace below with real API calls
const topics = ref([
  { id: 1, title: 'Faith', description: 'Strengthen your faith', image: '/faith.jpg', slug: 'faith' },
])

const popularItems = ref([
  { id: 1, title: 'Top Sermon This Week', cover: '/sermon.jpg', type: 'video' },
])

const dailyQuote = '“I can do all things through Christ...”'
const dailySong = 'Way Maker - Sinach'
const dailyDevotional = 'Today’s devotion: Trust in His timing'

const creators = ref([
  { id: 1, name: 'Pastor John Doe', bio: 'Teaching faith and hope', avatar: '/pastor.jpg', slug: 'john-doe' },
])
</script>
