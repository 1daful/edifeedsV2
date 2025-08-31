<template>
  <!-- Daily Verse Section -->
    <section class="q-mb-xl">
      <div class="row items-center q-mb-md">
        <div class="text-h5 text-weight-bold">📖 Daily Verse</div>
        <q-space />
        <q-btn flat icon="refresh" @click="refreshDailyVerse" :loading="verseLoading" />
      </div>

      <q-card
        class="daily-verse-card row no-wrap cursor-pointer"
        flat
        bordered
        @click="openVerse(dailyVerse)"
      >
        <!--q-img
          :src="dailyVerse.image"
          class="col-4 rounded-borders-left"
          @error="handleImageError"
          v-if="dailyVerse.image"
        /-->
        <div class="q-pa-md col">
          <div class="text-h6 text-weight-medium q-mb-sm" v-if="dailyVerse?.verse_text">
            "{{ dailyVerse.verse_text }}"
          </div>
          <div class="text-subtitle2 text-primary q-mb-sm">
            {{ dailyVerse?.verse_ref }}
          </div>
          <!--div class="text-caption text-grey-6">
            {{ dailyVerse.category }}
          </div-->
          <div class="row items-center q-mt-md">
            <q-btn size="sm" flat icon="share" label="Share" @click.stop="shareVerse" />
            <q-btn size="sm" flat icon="bookmark" :color="dailyVerse ? 'primary' : 'grey'" @click.stop="toggleBookmark('verse')" />
          </div>
        </div>
      </q-card>
    </section>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onBeforeMount, reactive, ref } from 'vue';
import { dbClient } from '../../api/apiList';
import { supabase } from '../../lib/supabase';
//import { mediaClient } from '../../api/mediaApi';
//import { randomVerse } from '../../api/Resources';

const $q = useQuasar()

/*const dailyVerse1 = reactive({
  id: 1,
  text: 'Be still and know that I am God',
  reference: 'Psalm 46:10',
  category: 'Peace & Comfort',
  image: 'https://images.unsplash.com/photo-1544273677-6e4e5b0f0b8e?w=300&h=200&fit=crop',
  bookmarked: false
})*/

let dailyVerse = ref(null)

onBeforeMount(async () => {
  const { data } = await supabase
    .from("verse_of_day")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(1)
    .single();
  dailyVerse.value = data
  console.log('Daily verse loaded:', dailyVerse.value);
});

const handleImageError = (event) => {
  // Set fallback image
  event.target.src = 'https://via.placeholder.com/300x200/E0E0E0/757575?text=Image+Not+Found'
}

const shareVerse = () => {
  if (navigator.share) {
    navigator.share({
      title: 'Daily Verse from Edifeeds',
      text: `"${dailyVerse.text}" - ${dailyVerse.reference}`,
      url: window.location.href
    })
  } else {
    // Fallback for browsers without Web Share API
    navigator.clipboard.writeText(`"${dailyVerse.text}" - ${dailyVerse.reference}`)
    $q.notify({
      message: 'Verse copied to clipboard!',
      type: 'positive',
      position: 'bottom'
    })
  }
}

const toggleBookmark = async (type) => {
  try {
    if (type === 'verse') {
      dailyVerse.bookmarked = !dailyVerse.bookmarked
      $q.notify({
        message: dailyVerse.bookmarked ? 'Verse bookmarked!' : 'Bookmark removed',
        type: 'positive',
        position: 'bottom'
      })
    }
    // API call would go here
  } catch {
    showError('Failed to update bookmark')
  }
}

const showError = (message) => {
  error.value = message
  setTimeout(() => {
    if (error.value === message) {
      error.value = null
    }
  }, 5000)
}

const verseLoading = ref(false);
const refreshDailyVerse = () => console.log('Refresh daily verse');
const openVerse = (verse: any) => console.log('Open verse', verse);
</script>

<style scoped>
.daily-verse-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.daily-verse-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

</style>
