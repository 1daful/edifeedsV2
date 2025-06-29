<!-- src/pages/ContentPreviewPage.vue -->
<template>
  <q-page class="q-pa-md">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center" style="min-height: 400px;">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <!-- Error State -->
    <q-card v-else-if="error" class="bg-negative text-white">
      <q-card-section>
        <div class="text-h6">
          <q-icon name="error" class="q-mr-sm" />
          Error Loading Content
        </div>
        <p>{{ error }}</p>
        <q-btn
          color="white"
          text-color="negative"
          label="Retry"
          @click="loadContent"
          class="q-mt-md"
        />
      </q-card-section>
    </q-card>

    <!-- Main Content -->
    <div v-else-if="item" class="row q-gutter-md">
      <!-- Primary Content Card -->
      <div class="col-12 col-md-8">
        <q-card class="content-card">
          <!-- Media Section with Enhanced Display -->
          <div v-if="hasMedia" class="media-container">
            <q-img
              :src="item.thumbnail || getDefaultThumbnail()"
              :ratio="getMediaRatio()"
              class="media-image"
              @error="onImageError"
            >
              <div class="absolute-bottom-right q-pa-sm">
                <q-chip
                  :color="getTypeColor(item.type)"
                  text-color="white"
                  :label="item.type"
                  dense
                />
              </div>

              <!-- Play Overlay for Video/Music -->
              <div
                v-if="isPlayable"
                class="absolute-center play-overlay"
                @click="playContent"
              >
                <q-btn
                  fab
                  color="primary"
                  icon="play_arrow"
                  size="lg"
                  class="play-button"
                />
              </div>
            </q-img>

            <!-- Progress Bar for Media -->
            <q-linear-progress
              v-if="isPlayable && playProgress > 0"
              :value="playProgress"
              color="primary"
              size="4px"
            />
          </div>

          <q-card-section>
            <!-- Title and Metadata -->
            <div class="content-header">
              <h1 class="text-h4 q-mb-sm content-title">{{ item.title }}</h1>

              <div class="content-meta q-mb-md">
                <q-chip
                  :color="getTypeColor(item.type)"
                  text-color="white"
                  :label="item.type"
                  class="q-mr-sm"
                />
                <q-chip
                  v-if="item.author && item.author !== item.type"
                  outline
                  :label="`by ${item.author}`"
                  class="q-mr-sm"
                />
                <q-chip
                  v-if="item.duration"
                  outline
                  :label="formatDuration(item.duration)"
                  icon="schedule"
                />
              </div>
            </div>

            <!-- Enhanced Description -->
            <div class="content-description">
              <p class="text-body1 q-mb-md" :class="{ 'text-truncated': !showFullDescription && isLongDescription }">
                {{ item.description }}
              </p>

              <q-btn
                v-if="isLongDescription"
                flat
                dense
                :label="showFullDescription ? 'Show Less' : 'Show More'"
                @click="showFullDescription = !showFullDescription"
                class="q-mb-md"
              />
            </div>

            <!-- Tags -->
            <div v-if="item.tags && item.tags.length" class="q-mb-md">
              <q-chip
                v-for="tag in item.tags"
                :key="tag"
                outline
                clickable
                :label="tag"
                class="q-mr-xs q-mb-xs"
                @click="searchByTag(tag)"
              />
            </div>

            <!-- Rating Display -->
            <div v-if="item.rating" class="rating-section q-mb-md">
              <q-rating
                :model-value="item.rating"
                readonly
                size="sm"
                color="warning"
              />
              <span class="text-caption q-ml-sm">{{ item.rating }}/5</span>
              <span v-if="item.reviewCount" class="text-caption text-grey q-ml-sm">
                ({{ item.reviewCount }} reviews)
              </span>
            </div>

            <!-- Action Buttons with Enhanced Functionality -->
            <div class="action-buttons">
              <q-btn
                v-if="isPlayable"
                :color="isPlaying ? 'warning' : 'primary'"
                :label="isPlaying ? 'Pause' : 'Play'"
                :icon="isPlaying ? 'pause' : 'play_arrow'"
                class="q-mr-sm q-mb-xs"
                @click="togglePlayContent"
                :loading="loadingPlay"
              />

              <q-btn
                v-else-if="item.type === 'Book'"
                color="secondary"
                label="Read"
                icon="menu_book"
                class="q-mr-sm q-mb-xs"
                @click="readContent"
              />

              <q-btn
                v-else-if="item.type === 'Quote'"
                color="accent"
                label="Reflect"
                icon="format_quote"
                class="q-mr-sm q-mb-xs"
                @click="reflectOnQuote"
              />

              <q-btn
                outline
                color="primary"
                label="Download"
                icon="download"
                class="q-mr-sm q-mb-xs"
                @click="downloadContent"
                v-if="item.downloadable"
              />
            </div>
          </q-card-section>

          <q-separator />

          <!-- Enhanced Reactions with Real-time Updates -->
          <q-card-actions class="reaction-bar">
            <div class="reaction-group">
              <q-btn
                flat
                :color="userReactions.liked ? 'positive' : 'grey'"
                :icon="userReactions.liked ? 'thumb_up' : 'thumb_up_off_alt'"
                :label="reactions.likes"
                @click="toggleReaction('like')"
                class="reaction-btn"
              />

              <q-btn
                flat
                :color="userReactions.bookmarked ? 'warning' : 'grey'"
                :icon="userReactions.bookmarked ? 'bookmark' : 'bookmark_border'"
                :label="reactions.bookmarks"
                @click="toggleBookmark"
                class="reaction-btn"
              />

              <q-btn
                flat
                color="grey"
                icon="share"
                label="Share"
                @click="openShareDialog"
                class="reaction-btn"
              />
            </div>

            <q-space />

            <div class="view-count text-caption text-grey">
              <q-icon name="visibility" size="xs" />
              {{ formatNumber(item.views || 0) }} views
            </div>
          </q-card-actions>
        </q-card>
      </div>

      <!-- Sidebar -->
      <div class="col-12 col-md-4">
        <!-- Related Content -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Related Content</div>
            <div v-if="relatedContent.length">
              <div
                v-for="related in relatedContent"
                :key="related.id"
                class="related-item q-mb-sm cursor-pointer"
                @click="navigateToContent(related.id)"
              >
                <div class="row items-center">
                  <q-img
                    :src="related.thumbnail"
                    class="col-3 rounded-borders"
                    ratio="1"
                    style="max-width: 60px"
                  />
                  <div class="col q-ml-sm">
                    <div class="text-body2 text-weight-medium">{{ related.title }}</div>
                    <div class="text-caption text-grey">{{ related.type }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-grey">
              <q-icon name="search_off" size="md" />
              <div>No related content found</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Comments Preview -->
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              Comments ({{ comments.length }})
            </div>

            <div v-if="comments.length" class="comments-preview">
              <div
                v-for="comment in comments.slice(0, 3)"
                :key="comment.id"
                class="comment-item q-mb-sm"
              >
                <div class="text-body2">{{ comment.text }}</div>
                <div class="text-caption text-grey">- {{ comment.author }}</div>
              </div>

              <q-btn
                flat
                dense
                label="View All Comments"
                @click="showAllComments = true"
                class="q-mt-sm"
              />
            </div>

            <div v-else class="text-center text-grey">
              <q-icon name="chat_bubble_outline" size="md" />
              <div>No comments yet</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Content Not Found -->
    <q-card v-else class="text-center q-pa-xl">
      <q-icon name="search_off" size="100px" color="grey" />
      <div class="text-h6 q-mt-md">Content Not Found</div>
      <div class="text-body2 text-grey q-mb-md">
        The requested content could not be found.
      </div>
      <q-btn color="primary" label="Go Back" @click="$router.go(-1)" />
    </q-card>

    <!-- Share Dialog -->
    <q-dialog v-model="shareDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Share Content</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="q-mb-md">
            <q-input
              v-model="shareUrl"
              label="Share URL"
              readonly
              outlined
            >
              <template v-slot:after>
                <q-btn
                  flat
                  icon="content_copy"
                  @click="copyToClipboard"
                  :color="copied ? 'positive' : 'primary'"
                />
              </template>
            </q-input>
          </div>

          <div class="social-share">
            <q-btn
              flat
              icon="facebook"
              label="Facebook"
              @click="shareToSocial('facebook')"
              class="q-mr-sm"
            />
            <q-btn
              flat
              icon="twitter"
              label="Twitter"
              @click="shareToSocial('twitter')"
              class="q-mr-sm"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { sampleBooks } from "../utils/sampleData"

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

// Reactive state
const item = ref(null)
const loading = ref(true)
const error = ref(null)
const showFullDescription = ref(false)
const isPlaying = ref(false)
const loadingPlay = ref(false)
const playProgress = ref(0)
const shareDialog = ref(false)
const shareUrl = ref('')
const copied = ref(false)
const showAllComments = ref(false)

// User interactions
const userReactions = ref({
  liked: false,
  bookmarked: false
})

const reactions = ref({
  likes: 0,
  bookmarks: 0,
  shares: 0
})

const relatedContent = ref([])
const comments = ref([])

// Computed properties
const hasMedia = computed(() => {
  return item.value && (item.value.type === 'Video' || item.value.type === 'Music' || item.value.thumbnail)
})

const isPlayable = computed(() => {
  return item.value && (item.value.type === 'Video' || item.value.type === 'Music')
})

const isLongDescription = computed(() => {
  return item.value && item.value.description && item.value.description.length > 200
})

// Methods
async function loadContent() {
  loading.value = true
  error.value = null

  try {
    // In real app, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay

    const foundItem = sampleBooks.find(book => book.id === route.params.id)
    if (foundItem) {
      item.value = {
        ...foundItem,
        views: Math.floor(Math.random() * 10000),
        rating: (Math.random() * 2 + 3).toFixed(1),
        reviewCount: Math.floor(Math.random() * 500),
        tags: ['Fiction', 'Adventure', 'Classic'],
        downloadable: Math.random() > 0.5
      }

      // Load related content and comments
      await Promise.all([
        loadRelatedContent(),
        loadComments(),
        loadUserReactions(),
        loadReactionCounts()
      ])
    } else {
      item.value = null
    }
  } catch (err) {
    error.value = 'Failed to load content. Please try again.'
    console.error('Error loading content:', err)
  } finally {
    loading.value = false
  }
}

async function loadRelatedContent() {
  // Simulate loading related content
  relatedContent.value = sampleBooks
    .filter(book => book.id !== route.params.id)
    .slice(0, 3)
    .map(book => ({
      ...book,
      thumbnail: book.thumbnail || getDefaultThumbnail()
    }))
}

async function loadComments() {
  // Simulate loading comments
  comments.value = [
    { id: 1, text: "Amazing content! Really enjoyed it.", author: "John Doe" },
    { id: 2, text: "This changed my perspective completely.", author: "Jane Smith" },
    { id: 3, text: "Highly recommend to everyone!", author: "Mike Johnson" }
  ]
}

async function loadUserReactions() {
  // In real app, load from user preferences/API
  userReactions.value = {
    liked: false,
    bookmarked: false
  }
}

async function loadReactionCounts() {
  // In real app, load from API
  reactions.value = {
    likes: Math.floor(Math.random() * 1000),
    bookmarks: Math.floor(Math.random() * 500),
    shares: Math.floor(Math.random() * 200)
  }
}

function getTypeColor(type) {
  const colors = {
    'Video': 'red',
    'Music': 'purple',
    'Book': 'blue',
    'Quote': 'orange',
    'Article': 'green'
  }
  return colors[type] || 'grey'
}

function getDefaultThumbnail() {
  return 'https://via.placeholder.com/400x300?text=No+Image'
}

function getMediaRatio() {
  if (!item.value) return '16/9'
  return item.value.type === 'Video' ? '16/9' : '1/1'
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m ${secs}s`
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

function onImageError() {
  if (item.value) {
    item.value.thumbnail = getDefaultThumbnail()
  }
}

async function togglePlayContent() {
  loadingPlay.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate loading
    isPlaying.value = !isPlaying.value

    if (isPlaying.value) {
      // Simulate progress
      const interval = setInterval(() => {
        playProgress.value += 0.01
        if (playProgress.value >= 1 || !isPlaying.value) {
          clearInterval(interval)
          if (playProgress.value >= 1) {
            isPlaying.value = false
            playProgress.value = 0
          }
        }
      }, 100)
    }

    $q.notify({
      message: isPlaying.value ? 'Playing content...' : 'Paused',
      color: 'positive',
      position: 'bottom'
    })
  } catch (err) {
    $q.notify({
      message: 'Failed to play content',
      color: 'negative',
      position: 'bottom'
    })
  } finally {
    loadingPlay.value = false
  }
}

function playContent() {
  togglePlayContent()
}

function readContent() {
  $q.notify({
    message: 'Opening reader...',
    color: 'info',
    position: 'bottom'
  })
  // In real app, navigate to reader or open modal
}

function reflectOnQuote() {
  $q.notify({
    message: 'Take a moment to reflect on this wisdom',
    color: 'info',
    position: 'bottom'
  })
}

async function downloadContent() {
  $q.loading.show({
    message: 'Preparing download...'
  })

  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    $q.notify({
      message: 'Download started!',
      color: 'positive',
      position: 'bottom'
    })
  } catch (err) {
    $q.notify({
      message: 'Download failed',
      color: 'negative',
      position: 'bottom'
    })
  } finally {
    $q.loading.hide()
  }
}

async function toggleReaction(type) {
  const wasActive = userReactions.value[type === 'like' ? 'liked' : 'bookmarked']

  // Optimistic update
  if (type === 'like') {
    userReactions.value.liked = !userReactions.value.liked
    reactions.value.likes += userReactions.value.liked ? 1 : -1
  }

  try {
    // In real app, make API call
    await new Promise(resolve => setTimeout(resolve, 200))

    $q.notify({
      message: `${userReactions.value.liked ? 'Liked' : 'Unliked'}!`,
      color: 'positive',
      position: 'bottom'
    })
  } catch (err) {
    // Revert on error
    if (type === 'like') {
      userReactions.value.liked = wasActive
      reactions.value.likes += wasActive ? 1 : -1
    }

    $q.notify({
      message: 'Failed to update reaction',
      color: 'negative',
      position: 'bottom'
    })
  }
}

async function toggleBookmark() {
  const wasBookmarked = userReactions.value.bookmarked

  userReactions.value.bookmarked = !userReactions.value.bookmarked
  reactions.value.bookmarks += userReactions.value.bookmarked ? 1 : -1

  try {
    await new Promise(resolve => setTimeout(resolve, 200))

    $q.notify({
      message: userReactions.value.bookmarked ? 'Bookmarked!' : 'Removed from bookmarks',
      color: 'positive',
      position: 'bottom'
    })
  } catch (err) {
    // Revert on error
    userReactions.value.bookmarked = wasBookmarked
    reactions.value.bookmarks += wasBookmarked ? 1 : -1

    $q.notify({
      message: 'Failed to update bookmark',
      color: 'negative',
      position: 'bottom'
    })
  }
}

function openShareDialog() {
  shareUrl.value = window.location.href
  shareDialog.value = true
  copied.value = false
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true

    $q.notify({
      message: 'Link copied to clipboard!',
      color: 'positive',
      position: 'bottom'
    })

    setTimeout(() => { copied.value = false }, 2000)
  } catch (err) {
    $q.notify({
      message: 'Failed to copy link',
      color: 'negative',
      position: 'bottom'
    })
  }
}

function shareToSocial(platform) {
  const url = encodeURIComponent(shareUrl.value)
  const title = encodeURIComponent(item.value.title)

  let shareLink = ''

  switch (platform) {
    case 'facebook':
      shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`
      break
    case 'twitter':
      shareLink = `https://twitter.com/intent/tweet?url=${url}&text=${title}`
      break
  }

  if (shareLink) {
    window.open(shareLink, '_blank', 'width=600,height=400')
    reactions.value.shares += 1
  }
}

function searchByTag(tag) {
  router.push(`/search?tag=${encodeURIComponent(tag)}`)
}

function navigateToContent(id) {
  router.push(`/content/${id}`)
}

// Lifecycle
onMounted(() => {
  loadContent()
})

// Watch for route changes
watch(() => route.params.id, () => {
  if (route.params.id) {
    loadContent()
  }
})
</script>

<style scoped>
.content-card {
  border-radius: 12px;
  overflow: hidden;
}

.media-container {
  position: relative;
}

.media-image {
  border-radius: 0;
}

.play-overlay {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-overlay:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.1);
}

.play-button {
  backdrop-filter: blur(10px);
}

.content-title {
  line-height: 1.2;
  margin-bottom: 0;
}

.content-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.text-truncated {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.reaction-bar {
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
}

.reaction-group {
  display: flex;
  gap: 16px;
}

.reaction-btn {
  min-width: auto;
  padding: 8px 12px;
}

.related-item {
  border-radius: 8px;
  padding: 8px;
  transition: background-color 0.2s ease;
}

.related-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.comment-item {
  padding: 8px;
  border-left: 3px solid var(--q-primary);
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  margin-bottom: 8px;
}

.social-share {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.rating-section {
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .content-title {
    font-size: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .reaction-group {
    flex-wrap: wrap;
    gap: 8px;
  }
}

/* Loading animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading-pulse {
  animation: pulse 2s infinite;
}
</style>
