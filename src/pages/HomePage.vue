<template>
  <q-page class="q-pa-md">
    <div class="text-h6">Home</div>
    <q-list bordered separator>
      <q-item v-for="(item, index) in contentList" :key="index" clickable @click="goToContent(item)">
        <q-item-section avatar>
          <q-avatar icon="collections" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ item.title }}</q-item-label>
          <q-item-label caption>{{ item.type }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const contentList = ref([
  { title: 'Sunday Worship Playlist', type: 'Music', id: 1 },
  { title: 'Grace Over Guilt', type: 'Article', id: 2 },
  { title: 'Daily Devotional Quote', type: 'Quote', id: 3 },
])

function goToContent(item) {
  router.push({ path: '/content', query: { ...item } })
}
</script>
