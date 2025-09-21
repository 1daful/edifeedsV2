<template>
  <q-card class="devotion-card q-mb-md" :class="{ 'loading': isLoading }">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-content">
      <q-card-section>
        <q-skeleton type="text" class="text-h6" />
        <q-skeleton height="200px" class="q-mt-md" />
        <q-skeleton type="text" width="60%" class="q-mt-sm" />
        <q-skeleton type="text" width="80%" />
        <q-skeleton type="text" width="40%" />
      </q-card-section>
    </div>

    <!-- Content -->
    <div v-else-if="content && !error">
      <!-- Header with Date and Category -->
      <q-card-section class="devotion-header">
        <div class="row items-center justify-between">
          <div>
            <div class="text-h5 text-weight-medium devotion-title">
              {{ content.title }}
            </div>
            <div class="text-caption text-grey-6 q-mt-xs">
              <q-icon name="calendar_today" size="xs" class="q-mr-xs" />
              {{ formatDate(content.published_at) }}
              <span v-if="content.category" class="q-ml-md">
                <q-icon name="label" size="xs" class="q-mr-xs" />
                {{ content.category }}
              </span>
            </div>
          </div>
          <q-chip
            v-if="content.read_time"
            color="primary"
            text-color="white"
            icon="schedule"
            size="sm"
          >
            {{ content.read_time }} min read
          </q-chip>
        </div>
      </q-card-section>

      <!-- Media Section -->
      <q-card-section v-if="content.media_url" class="q-pa-none">
        <div class="media-container">
          <!-- Video -->
          <div v-if="content.media_type === 'video'" class="video-wrapper">
            <iframe
              :src="sanitizeVideoUrl(content.media_url)"
              :title="content.title"
              width="100%"
              height="250"
              frameborder="0"
              allowfullscreen
              loading="lazy"
              @error="onMediaError"
            ></iframe>
          </div>

          <!-- Audio -->
          <div v-else-if="content.media_type === 'audio'" class="audio-wrapper q-pa-md">
            <audio
              controls
              :src="content.media_url"
              class="full-width"
              preload="metadata"
              @error="onMediaError"
            >
              Your browser doesn't support audio playback.
            </audio>
          </div>

          <!-- Image -->
          <div v-else-if="content.media_type === 'image'" class="image-wrapper">
            <q-img
              :src="content.media_url"
              :alt="content.title"
              fit="cover"
              height="250px"
              loading="lazy"
              @error="onMediaError"
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-3 text-grey-7">
                  <q-icon name="broken_image" size="24px" />
                </div>
              </template>
            </q-img>
          </div>
        </div>
      </q-card-section>

      <!-- Content Section -->
      <q-card-section class="devotion-content">
        <!-- Scripture Reference -->
        <div v-if="content.scripture_reference" class="scripture-ref q-mb-md">
          <q-icon name="menu_book" class="q-mr-sm text-primary" />
          <span class="text-weight-medium text-primary">{{ content.scripture_reference }}</span>
        </div>

        <!-- Main Content -->
        <div class="devotion-text" v-html="formatContent(content.content)"></div>

        <!-- Prayer Section -->
        <div v-if="content.prayer" class="prayer-section q-mt-lg q-pa-md bg-grey-1 rounded-borders">
          <div class="text-weight-medium text-grey-8 q-mb-sm">
            <q-icon name="hands" class="q-mr-sm" />
            Prayer
          </div>
          <div class="text-italic">{{ content.prayer }}</div>
        </div>

        <!-- Tags -->
        <div v-if="content.tags && content.tags.length" class="tags-section q-mt-md">
          <q-chip
            v-for="tag in content.tags"
            :key="tag"
            color="grey-3"
            text-color="grey-8"
            size="sm"
            class="q-mr-xs q-mb-xs"
          >
            {{ tag }}
          </q-chip>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="between" class="q-px-md q-pb-md">
        <div class="action-buttons">
          <q-btn
            flat
            round
            :icon="isBookmarked ? 'bookmark' : 'bookmark_border'"
            :color="isBookmarked ? 'amber' : 'grey-6'"
            :loading="bookmarkLoading"
            @click="toggleBookmark"
            size="sm"
          >
            <q-tooltip>{{ isBookmarked ? 'Remove bookmark' : 'Bookmark devotion' }}</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            icon="share"
            color="grey-6"
            @click="openShareMenu"
            size="sm"
          >
            <q-tooltip>Share devotion</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            icon="text_increase"
            color="grey-6"
            @click="increaseFontSize"
            size="sm"
          >
            <q-tooltip>Increase font size</q-tooltip>
          </q-btn>

          <q-btn
            flat
            round
            icon="text_decrease"
            color="grey-6"
            @click="decreaseFontSize"
            size="sm"
          >
            <q-tooltip>Decrease font size</q-tooltip>
          </q-btn>
        </div>

        <div class="engagement-stats" v-if="content.likes_count || content.shares_count">
          <span class="text-caption text-grey-6">
            <q-icon name="favorite" size="xs" class="q-mr-xs" v-if="content.likes_count" />
            {{ content.likes_count || 0 }}
            <q-icon name="share" size="xs" class="q-ml-md q-mr-xs" v-if="content.shares_count" />
            {{ content.shares_count || 0 }}
          </span>
        </div>
      </q-card-actions>

      <!-- Share Menu -->
      <q-menu v-model="showShareMenu" anchor="bottom right" self="top right">
        <q-list style="min-width: 200px">
          <q-item clickable @click="shareVia('copy')">
            <q-item-section avatar>
              <q-icon name="content_copy" />
            </q-item-section>
            <q-item-section>Copy Link</q-item-section>
          </q-item>

          <q-item clickable @click="shareVia('email')">
            <q-item-section avatar>
              <q-icon name="email" />
            </q-item-section>
            <q-item-section>Email</q-item-section>
          </q-item>

          <q-item clickable @click="shareVia('whatsapp')">
            <q-item-section avatar>
              <q-icon name="chat" />
            </q-item-section>
            <q-item-section>WhatsApp</q-item-section>
          </q-item>

          <q-item clickable @click="shareVia('twitter')">
            <q-item-section avatar>
              <q-icon name="share" />
            </q-item-section>
            <q-item-section>Twitter</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </div>

    <!-- Error State -->
    <q-card-section v-else-if="error" class="error-state text-center q-py-xl">
      <q-icon name="error_outline" size="48px" color="negative" class="q-mb-md" />
      <div class="text-h6 text-negative q-mb-sm">Oops! Something went wrong</div>
      <div class="text-body2 text-grey-6 q-mb-md">{{ error }}</div>
      <q-btn
        color="primary"
        label="Try Again"
        @click="fetch"
        :loading="isLoading"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { supabase } from "../lib/supabase";
import { useQuasar, date } from 'quasar'

// Props
const props = defineProps({
  table: {
    type: String,
    required: true
  },
  id: {
    type: [String, Number],
    default: null
  },
  autoRefresh: {
    type: Boolean,
    default: false
  }
})

// Quasar instance
const $q = useQuasar()

// Reactive state
const content = ref(null)
const isLoading = ref(true)
const error = ref(null)
const isBookmarked = ref(false)
const bookmarkLoading = ref(false)
const showShareMenu = ref(false)
const fontSize = ref(16)

// Computed properties
const formattedDate = computed(() => {
  if (!content.value?.published_at) return ''
  return date.formatDate(content.value.published_at, 'MMMM D, YYYY')
})

// Methods
const fetch = async () => {
  try {
    isLoading.value = true
    error.value = null

    let query = supabase
      .from(props.table)
      .select(`
        *
      `)

    if (props.id) {
      query = query.eq('id', props.id)
    } else {
      query = query
        .order('published_at', { ascending: false })
        .limit(1)
    }

    const { data, error: fetchError } = await query.single()

    if (fetchError) throw fetchError

    content.value = {
      ...data,
      likes_count: data.devotion_interactions?.[0]?.likes_count || 0,
      shares_count: data.devotion_interactions?.[0]?.shares_count || 0
    }

    // Check if bookmarked
    isBookmarked.value = data.devotion_bookmarks?.length > 0

    // Mark as read
    await markAsRead(data.id)

  } catch (err) {
    console.error('Error fetching devotion:', err)
    error.value = err.message || 'Failed to load devotion'
  } finally {
    isLoading.value = false
  }
}

const markAsRead = async (id) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('devotion_reads')
      .upsert({
        user_id: user.id,
        [`${props.table}_id`]: id,
        read_at: new Date().toISOString()
      })
  } catch (err) {
    console.warn('Failed to mark devotion as read:', err)
  }
}

const toggleBookmark = async () => {
  try {
    bookmarkLoading.value = true
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      $q.notify({
        type: 'warning',
        message: 'Please sign in to bookmark devotions'
      })
      return
    }

    if (isBookmarked.value) {
      // Remove bookmark
      await supabase
        .from('devotion_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq(`${props.table}_id`, content.value.id)

      isBookmarked.value = false
      $q.notify({
        type: 'positive',
        message: 'Bookmark removed',
        icon: 'bookmark_border'
      })
    } else {
      // Add bookmark
      await supabase
        .from('devotion_bookmarks')
        .insert({
          user_id: user.id,
          [`${props.table}_id`]: content.value.id
        })

      isBookmarked.value = true
      $q.notify({
        type: 'positive',
        message: 'Devotion bookmarked',
        icon: 'bookmark'
      })
    }
  } catch (err) {
    console.error('Error toggling bookmark:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to update bookmark'
    })
  } finally {
    bookmarkLoading.value = false
  }
}

const openShareMenu = () => {
  showShareMenu.value = true
}

const shareVia = async (platform) => {
  showShareMenu.value = false

  const shareData = {
    title: content.value.title,
    text: `Check out this devotion: ${content.value.title}`,
    url: window.location.href
  }

  try {
    switch (platform) {
      case 'copy':
        await navigator.clipboard.writeText(shareData.url)
        $q.notify({
          type: 'positive',
          message: 'Link copied to clipboard',
          icon: 'content_copy'
        })
        break

      case 'email': {
        const emailUrl = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + '\n\n' + shareData.url)}`
        window.open(emailUrl)
        break
      }

      case 'whatsapp': {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + '\n' + shareData.url)}`
        window.open(whatsappUrl, '_blank')
        break
      }

      case 'twitter': {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`
        window.open(twitterUrl, '_blank')
        break
      }

      default:
        // Use Web Share API if available
        if (navigator.share) {
          await navigator.share(shareData)
        }
    }

    // Track share
    await trackShare(platform)

  } catch (err) {
    console.error('Error sharing:', err)
    if (err.name !== 'AbortError') {
      $q.notify({
        type: 'negative',
        message: 'Failed to share devotion'
      })
    }
  }
}

const trackShare = async (platform) => {
  try {
    await supabase
      .from('devotion_shares')
      .insert({
        [`${props.table}_id`]: content.value.id,
        platform: platform,
        shared_at: new Date().toISOString()
      })
  } catch (err) {
    console.warn('Failed to track share:', err)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return date.formatDate(dateString, 'MMMM D, YYYY')
}

const formatContent = (content) => {
  if (!content) return ''

  // Basic HTML formatting with security considerations
  return content
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
}

const sanitizeVideoUrl = (url) => {
  if (!url) return ''

  // Convert Dailymotion URLs to embed format
  if (url.includes('dailymotion.com/video/')) {
    const videoId = url.split('/video/')[1]?.split('?')[0]
    if (videoId) {
      return `https://www.dailymotion.com/embed/video/${videoId}`
    }
  }

  // Convert YouTube URLs to embed format
  if (url.includes('youtube.com/watch')) {
    const videoId = url.split('v=')[1]?.split('&')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }

  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }

  // Return original URL if it's not a recognized video platform
  return url
}

const onMediaError = () => {
  $q.notify({
    type: 'warning',
    message: 'Media failed to load',
    icon: 'warning'
  })
}

const increaseFontSize = () => {
  if (fontSize.value < 24) {
    fontSize.value += 2
    updateFontSize()
  }
}

const decreaseFontSize = () => {
  if (fontSize.value > 12) {
    fontSize.value -= 2
    updateFontSize()
  }
}

const updateFontSize = () => {
  nextTick(() => {
    const contentEl = document.querySelector('.devotion-text')
    if (contentEl) {
      contentEl.style.fontSize = `${fontSize.value}px`
    }
  })
}

// Lifecycle
onMounted(() => {
  fetch()

  // Auto-refresh if enabled
  if (props.autoRefresh) {
    const interval = setInterval(fetch, 300000) // 5 minutes

    // Cleanup on unmount
    return () => clearInterval(interval)
  }
})

// Expose methods for parent components
defineExpose({
  refresh: fetch,
  toggleBookmark,
  share: openShareMenu
})
</script>

<style scoped>
.devotion-card {
  max-width: 800px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.devotion-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.devotion-header {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-bottom: 1px solid #e0e0e0;
}

.devotion-title {
  color: #2c3e50;
  line-height: 1.3;
}

.media-container {
  position: relative;
  overflow: hidden;
}

.video-wrapper iframe {
  border-radius: 0;
}

.audio-wrapper {
  background: #f8f9fa;
}

.image-wrapper {
  position: relative;
}

.devotion-content {
  line-height: 1.6;
}

.scripture-ref {
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background: rgba(103, 126, 234, 0.1);
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.devotion-text {
  font-size: 16px;
  line-height: 1.7;
  color: #2c3e50;
}

.prayer-section {
  border-left: 4px solid #27ae60;
  position: relative;
}

.prayer-section::before {
  content: '"';
  position: absolute;
  top: -10px;
  left: 8px;
  font-size: 48px;
  color: #bdc3c7;
  font-family: serif;
}

.tags-section {
  border-top: 1px solid #ecf0f1;
  padding-top: 16px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.engagement-stats {
  display: flex;
  align-items: center;
  gap: 4px;
}

.loading-content {
  animation: pulse 1.5s ease-in-out infinite alternate;
}

.error-state {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

@keyframes pulse {
  0% { opacity: 1; }
  100% { opacity: 0.7; }
}

@media (max-width: 600px) {
  .devotion-card {
    margin: 0 8px;
  }

  .video-wrapper iframe {
    height: 200px;
  }

  .devotion-header .row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .action-buttons {
    flex-wrap: wrap;
  }
}
</style>
