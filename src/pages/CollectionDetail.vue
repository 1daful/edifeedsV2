<template>
  <q-page padding>
    <q-toolbar class="q-mb-md">
      <q-btn flat round icon="arrow_back" @click="$router.back()" />
      <q-toolbar-title>{{ collection?.name || 'Collection' }}</q-toolbar-title>
    </q-toolbar>

    <q-tabs v-model="tab" dense class="text-primary" align="justify">
      <q-tab name="video" label="Videos" />
      <q-tab name="music" label="Music" />
      <q-tab name="book" label="Books" />
      <q-tab name="quote" label="Quotes" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="video">
        <ContentGrid :items="videos" @loadMore="loadMore('video')" />
      </q-tab-panel>
      <q-tab-panel name="music">
        <ContentGrid :items="music" @loadMore="loadMore('music')" />
      </q-tab-panel>
      <q-tab-panel name="book">
        <ContentGrid :items="books" @loadMore="loadMore('book')" />
      </q-tab-panel>
      <q-tab-panel name="quote">
        <ContentGrid :items="quotes" @loadMore="loadMore('quote')" />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '@/boot/supabase';
import ContentGrid from '@/components/ContentGrid.vue';
import { useQuasar } from 'quasar';

const route = useRoute();
const $q = useQuasar();
const collectionId = route.params.id;
const collection = ref(null);
const tab = ref('video');
const limit = 12;
const page = ref({ video: 0, music: 0, book: 0, quote: 0 });
const videos = ref([]);
const music = ref([]);
const books = ref([]);
const quotes = ref([]);

const fetchCollection = async () => {
  const { data, error } = await supabase.from('collections').select('*').eq('id', collectionId).single();
  if (!error) collection.value = data;
};

const loadItems = async (mediaType) => {
  const { data, error } = await supabase
    .from('collection_items')
    .select('content_id, media_type')
    .eq('collection_id', collectionId)
    .eq('media_type', mediaType)
    .range(page.value[mediaType] * limit, (page.value[mediaType] + 1) * limit - 1);
  if (error) {
    $q.notify({ type: 'negative', message: error.message });
  } else {
    const target = mediaType === 'video' ? videos : mediaType === 'music' ? music : mediaType === 'book' ? books : quotes;
    target.value.push(...data);
    page.value[mediaType]++;
    localStorage.setItem(`collection_${collectionId}_${mediaType}_page`, page.value[mediaType]);
  }
};

const loadMore = (mediaType) => {
  loadItems(mediaType);
};

onMounted(() => {
  fetchCollection();
  ['video', 'music', 'book', 'quote'].forEach(type => {
    page.value[type] = parseInt(localStorage.getItem(`collection_${collectionId}_${type}_page`) || '0');
    loadItems(type);
  });
});
</script>

<style scoped>
.q-page { background: white; }
</style>
