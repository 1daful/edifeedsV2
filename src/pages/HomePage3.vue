<template>
  <q-page class="q-pa-md">
    <!-- Hero Welcome Banner -->
    <section class="q-mb-xl text-center">
      <div class="text-h5 text-weight-bold q-mb-sm">Welcome to Edifeeds</div>
      <div class="text-subtitle1 text-grey-7">Discover faith-building videos, books, music, and daily verses</div>
    </section>

    <!-- Trending Section -->
    <section class="q-mb-xl">
      <div class="row items-center q-mb-md">
        <div class="text-h5 text-weight-bold">🔥 Trending</div>
        <q-space />
        <q-btn flat label="View All" color="primary" @click="navigateTo('/trending')" />
      </div>

      <div class="row q-col-gutter-md">
        <div v-for="item in trendingItems.slice(0, 3)" :key="item.id" class="col-12 col-sm-4">
          <q-card flat bordered class="cursor-pointer" @click="openItem(item)">
            <q-img :src="item.image" :ratio="16/9" class="rounded-borders" />
            <q-card-section>
              <div class="text-subtitle1 text-weight-medium">{{ item.title }}</div>
              <div class="text-caption text-grey-7 ellipsis">{{ item.description }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </section>

    <!-- Daily Verse Section -->
    <section class="q-mb-xl">
      <div class="row items-center q-mb-md">
        <div class="text-h5 text-weight-bold">📖 Daily Verse</div>
        <q-space />
        <q-btn flat icon="refresh" @click="refreshDailyVerse" :loading="verseLoading" />
      </div>

      <q-card flat bordered class="cursor-pointer" @click="openVerse(dailyVerse)">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium q-mb-xs">"{{ dailyVerse.text }}"</div>
          <div class="text-caption text-primary">{{ dailyVerse.reference }}</div>
          <div class="text-caption text-grey-6">{{ dailyVerse.category }}</div>
        </q-card-section>
      </q-card>
    </section>

    <!-- Explore Topics -->
     <ExploreTopics />

    <!-- Continue Watching Section -->
    <section v-if="continueWatching.length" class="q-mb-xl">
      <div class="row items-center q-mb-md">
        <div class="text-h5 text-weight-bold">▶️ Continue Watching</div>
        <q-space />
        <q-btn flat label="Clear All" color="negative" @click="clearWatchingHistory" />
      </div>

      <div class="row q-col-gutter-md">
        <div v-for="item in continueWatching.slice(0, 4)" :key="item.id" class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="cursor-pointer" @click="continueWatchingItem(item)">
            <q-img :src="item.thumbnail" :ratio="16/9" class="rounded-borders-top" />
            <q-card-section>
              <div class="text-subtitle2 text-weight-medium ellipsis">{{ item.title }}</div>
              <div class="text-caption text-grey-6">{{ item.progress }}% complete</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </section>

    <!-- Collections Preview -->
    <section class="q-mb-xl">
      <div class="row items-center q-mb-md">
        <div class="text-h5 text-weight-bold">📚 Collections</div>
        <q-space />
        <q-btn flat label="Browse All" color="primary" @click="navigateTo('/collections')" />
      </div>

      <div class="row q-col-gutter-md">
        <div v-for="collection in collections.slice(0, 4)" :key="collection.id" class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="cursor-pointer" @click="openCollection(collection)">
            <q-img :src="collection.image" :ratio="1" class="rounded-borders-top" />
            <q-card-section>
              <div class="text-subtitle2 text-weight-medium">{{ collection.title }}</div>
              <div class="text-caption text-grey-6 ellipsis">{{ collection.description }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </section>

    <!-- Explore by Category Buttons -->
    <!-- section class="q-mb-xl text-center">
      <div class="text-h6 text-weight-bold q-mb-md">Explore By Category</div>
      <q-btn-group spread>
        <q-btn flat label="🎥 Videos" @click="navigateTo('/videos')" />
        <q-btn flat label="📚 Books" @click="navigateTo('/books')" />
        <q-btn flat label="🎵 Music" @click="navigateTo('/music')" />
        <q-btn flat label="🖼️ Quotes" @click="navigateTo('/quotes')" />
      </q-btn-group>
    </section -->

    <!-- Top Contributor -->
     <!-- TopContributor></TopContributor -->

    <!-- Creator CTA Section -->
    <CreateCTA />
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import CreateCTA from '../components/createCTA.vue';
import ExploreTopics from '../components/ExploreTopics.vue';

const navigateTo = (route) => {
  window.location.href = route // Replace with router.push(route) if using Vue Router
};

const trendingItems = [
  { id: 1, title: 'Faith in Action', description: 'Living out your faith daily', image: 'https://source.unsplash.com/800x450?church' },
  { id: 2, title: 'Worship Moments', description: 'Powerful worship sessions', image: 'https://source.unsplash.com/800x450?worship' },
  { id: 3, title: 'Testimonies', description: 'Stories of transformation', image: 'https://source.unsplash.com/800x450?testimony' }
];

const dailyVerse = { text: 'Be still and know that I am God', reference: 'Psalm 46:10', category: 'Peace & Comfort' };
const verseLoading = ref(false);
const continueWatching = [
  { id: 1, title: 'Sunday Service', thumbnail: 'https://source.unsplash.com/300x200?church', progress: 50 },
  { id: 2, title: 'Bible Study', thumbnail: 'https://source.unsplash.com/300x200?bible', progress: 30 }
];
const collections = [
  { id: 1, title: 'Sunday Sermons', description: 'Weekly messages', image: 'https://source.unsplash.com/300x300?sermon' },
  { id: 2, title: 'Bible Studies', description: 'Deep dives', image: 'https://source.unsplash.com/300x300?bible-study' },
  { id: 3, title: 'Youth Ministry', description: 'For young believers', image: 'https://source.unsplash.com/300x300?youth' },
  { id: 4, title: 'Music & Worship', description: 'Uplifting songs', image: 'https://source.unsplash.com/300x300?music' }
];

const openItem = (item) => console.log('Open item', item);
const refreshDailyVerse = () => console.log('Refresh daily verse');
const openVerse = (verse) => console.log('Open verse', verse);
const clearWatchingHistory = () => console.log('Clear history');
const continueWatchingItem = (item) => console.log('Continue watching', item);
const openCollection = (collection) => console.log('Open collection', collection);
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
.rounded-borders-top {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}
</style>
