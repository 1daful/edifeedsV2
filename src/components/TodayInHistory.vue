<template>
  <q-card flat bordered v-if="history">
    <q-item>
      <q-item-section avatar>
        <q-avatar size="64px">
          <img :src="history.image_url" v-if="history.image_url" />
          <q-icon name="event" size="40px" v-else />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-h6">{{ history.title }}</q-item-label>
        <q-item-label caption>{{ formattedDate }}</q-item-label>
        <q-item-label caption>{{ history.summary }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn icon="arrow_forward" flat @click="viewDetail" />
      </q-item-section>
    </q-item>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import dayjs from 'dayjs'

const router = useRouter()
const history = ref(null)

const today = dayjs().format('MM-DD')

const formattedDate = computed(() => {
  return history.value ? dayjs(history.value.date).format('MMMM D, YYYY') : ''
})

onMounted(async () => {
  const { data, error } = await supabase
    .from('christian_history')
    .select('*')
    .filter('date', 'like', `%-${today}`)
    .order('date', { ascending: true })
    .limit(1)

  if (!error && data?.length) {
    history.value = data[0]
  }
})

function viewDetail() {
  if (history.value?.slug) {
    router.push(`/history/${history.value.slug}`)
  }
}
</script>
