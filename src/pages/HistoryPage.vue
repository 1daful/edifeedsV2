<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Christian History</div>

    <q-input
      filled
      debounce="300"
      v-model="search"
      placeholder="Search history..."
      class="q-mb-md"
    />

    <q-list bordered separator>
      <q-item
        v-for="entry in filteredEntries"
        :key="entry.id"
        clickable
        @click="viewEntry(entry.slug)"
      >
        <q-item-section avatar>
          <q-avatar square size="64px">
            <img :src="entry.image_url" v-if="entry.image_url" />
            <q-icon name="event" v-else />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ entry.title }}</q-item-label>
          <q-item-label caption>{{ formatDate(entry.date) }}</q-item-label>
          <q-item-label caption>{{ entry.summary }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="arrow_forward_ios" />
        </q-item-section>
      </q-item>
    </q-list>

    <q-banner v-if="!loading && filteredEntries.length === 0" class="q-mt-md">
      No entries found.
    </q-banner>

    <q-spinner v-if="loading" size="40px" color="primary" class="q-mt-md" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'
import { HistoryEntry } from '../utils/types'

const router = useRouter()
const entries = ref<HistoryEntry[]>([])
const search = ref('')
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('christian_history')
    .select('*')
    .order('date', { ascending: false })

  if (!error && data) {
    entries.value = data
  }
  loading.value = false
})

function viewEntry(slug: string) {
  router.push(`/history/${slug}`)
}

function formatDate(dateStr: string) {
  return dayjs(dateStr).format('MMMM D, YYYY')
}

const filteredEntries = computed(() => {
  if (!search.value) return entries.value
  return entries.value.filter(entry =>
    entry.title.toLowerCase().includes(search.value.toLowerCase()) ||
    entry.summary.toLowerCase().includes(search.value.toLowerCase())
  )
})
</script>
