<template>
  <q-page class="q-pa-md">
    <q-tabs
      v-model="activeTab"
      dense
      align="justify"
      class="text-primary bg-grey-1 q-mb-md"
    >
      <q-tab name="quote" icon="format_quote" label="Quotes" />
      <q-tab name="book" icon="menu_book" label="Books" />
      <q-tab name="video" icon="videocam" label="Videos" />
      <q-tab name="audio" icon="music_note" label="Audios" />
    </q-tabs>

    <q-separator />

    <div v-for="type in mediaTypes" :key="type">
      <q-tab-panel v-if="activeTab === type" :name="type">
        <div v-if="loading[type]" class="text-center q-pa-md">
          <q-spinner color="primary" size="40px" />
        </div>

        <div v-else>
          <q-infinite-scroll
            :handler="() => loadMore(type)"
            :disable="!hasMore[type]"
            :offset="100"
          >
            <div class="row q-col-gutter-md">
              <div
                v-for="item in media[type]"
                :key="item.id"
                class="col-12 col-sm-6 col-md-4 col-lg-3"
              >
                <q-card
                  class="cursor-pointer"
                  @click="openContent(item)"
                >
                  <q-img
                    :src="item.thumbnail || item.image"
                    :alt="item.title"
                    ratio="16/9"
                  />
                  <q-card-section>
                    <div class="text-subtitle1 ellipsis">{{ item.title }}</div>
                    <div class="text-caption text-grey-7 ellipsis">{{ item.description }}</div>
                  </q-card-section>
                  <q-separator />
                  <q-card-actions align="around">
                    <q-btn
                      dense
                      flat
                      :icon="item.bookmarked ? 'bookmark' : 'bookmark_border'"
                      @click.stop="toggleBookmark(item)"
                    />
                    <span class="text-caption">
                      <q-icon name="visibility" size="16px" class="q-mr-xs" />
                      {{ formatNumber(item.views) }}
                    </span>
                    <span class="text-caption">
                      <q-icon name="schedule" size="16px" class="q-mr-xs" />
                      {{ formatDate(item.createdAt) }}
                    </span>
                  </q-card-actions>
                </q-card>
              </div>
            </div>
          </q-infinite-scroll>

          <div v-if="!media[type].length && !loading[type]" class="text-center q-pa-lg">
            <q-icon name="info" size="48px" color="grey" />
            <div class="text-subtitle1 q-mt-md">No {{ type }} content found for this topic.</div>
          </div>
        </div>
      </q-tab-panel>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { date, Notify } from 'quasar'
import { fetchTopicContent } from '@/services/api' // replace with your fetch method

const route = useRoute()
const router = useRouter()
const topicSlug = route.params.topicSlug
const activeTab = ref('quote')
const mediaTypes = ['quote', 'book', 'video', 'audio']

const media = reactive({ quote: [], book: [], video: [], audio: [] })
const loading = reactive({ quote: false, book: false, video: false, audio: false })
const page = reactive({ quote: 1, book: 1, video: 1, audio: 1 })
const hasMore = reactive({ quote: true, book: true, video: true, audio: true })

const loadContent = async (type) => {
  if (!hasMore[type] || loading[type]) return
  loading[type] = true
  try {
    const { items, hasMore: more } = await fetchTopicContent(topicSlug, type, page[type])
    media[type].push(...items)
    hasMore[type] = more
    page[type]++
  } catch (e) {
    Notify.create({ type: 'negative', message: `Failed to load ${type} content` })
  } finally {
    loading[type] = false
  }
}

const loadMore = (type) => {
  return loadContent(type)
}

const toggleBookmark = async (item) => {
  item.bookmarked = !item.bookmarked
  Notify.create({ type: 'positive', message: item.bookmarked ? 'Bookmarked' : 'Removed from bookmarks' })
}

const openContent = (item) => {
  router.push(`/${item.type.toLowerCase()}/${item.id}`)
}

const formatDate = (val) => date.formatDate(val, 'MMM DD, YYYY')
const formatNumber = (num) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toString()
}

onMounted(() => {
  loadContent(activeTab.value)
})
</script>

<style scoped>
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
