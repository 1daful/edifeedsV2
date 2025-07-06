<template>
  <q-page class="q-pa-md q-mx-auto" style="max-width: 700px;">
    <q-skeleton v-if="loading" height="200px" square />

    <div v-else-if="entry" class="text-center">
      <div class="text-h5 q-mb-sm">{{ entry.title }}</div>
      <div class="text-caption text-grey q-mb-md">{{ formatDate(entry.date) }}</div>

      <q-img
        v-if="entry.image_url"
        :src="entry.image_url"
        ratio="16/9"
        class="q-mb-md"
      />

      <div class="q-mb-md">{{ entry.summary }}</div>

      <div v-html="formattedContent"></div>

      <q-chip
        v-for="tag in entry.tags || []"
        :key="tag"
        color="primary"
        text-color="white"
        dense
        class="q-mr-xs q-mt-sm"
      >
        {{ tag }}
      </q-chip>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'
import { HistoryEntry } from '../utils/types'

const route = useRoute()
const entry = ref<HistoryEntry | null>(null)
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('christian_history')
    .select('*')
    .eq('slug', route.params.slug)
    .single()

  if (!error && data) {
    entry.value = data
  }
  loading.value = false
})

function formatDate(dateStr: string) {
  return dayjs(dateStr).format('MMMM D, YYYY')
}

const formattedContent = computed(() =>
  entry.value?.content
    ? entry.value.content.replace(/\n/g, '<br>')
    : ''
)
</script>
