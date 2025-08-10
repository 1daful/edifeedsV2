<template>
  <q-card
    flat
    bordered
    class="media-card"
    :class="{ 'media-card--loading': isLoading, 'media-card--favorited': isFavorited }"
    @mouseenter="onHover(true)"
    @mouseleave="onHover(false)"
  >
    <!-- Thumbnail with loading state and play overlay -->
    <div class="media-card__thumbnail-container">
      <q-img
        :src="media.thumbnail"
        :ratio="16/9"
        :loading="isImageLoading"
        spinner-color="primary"
        @load="onImageLoad"
        @error="onImageError"
        class="media-card__thumbnail"
      >
        <div class="absolute-full text-subtitle2 flex flex-center" v-if="!media.thumbnail">
          <q-icon name="image" size="3em" color="grey-5" />
        </div>
      </q-img>

      <!-- Play overlay on hover -->
      <div
        v-if="isHovered && !isLoading"
        class="media-card__play-overlay absolute-full flex flex-center"
        @click="playMedia"
      >
        <q-btn
          fab
          color="primary"
          icon="play_arrow"
          size="lg"
          class="shadow-10"
        />
      </div>

      <!-- Duration badge -->
      <div v-if="media.duration" class="media-card__duration-badge absolute-bottom-right">
        <q-chip dense dark color="black" text-color="white" size="sm">
          {{ formatDuration(media.duration) }}
        </q-chip>
      </div>

      <!-- Type indicator -->
      <div class="media-card__type-indicator absolute-top-left">
        <q-chip
          :icon="getTypeIcon(media.type)"
          dense
          :color="getTypeColor(media.type)"
          text-color="white"
          size="sm"
        >
          {{ media.type }}
        </q-chip>
      </div>
    </div>

    <!-- Content section with improved layout -->
    <q-card-section class="media-card__content">
      <div class="text-subtitle1 text-weight-medium q-mb-xs line-clamp-2">
        {{ media.title }}
      </div>

      <div class="text-caption text-grey-7 q-mb-sm">
        <q-icon name="person" size="xs" class="q-mr-xs" />
        {{ media.creator }}
        <span class="q-mx-xs">·</span>
        <q-icon :name="getTypeIcon(media.type)" size="xs" class="q-mr-xs" />
        {{ media.type }}
        <span v-if="media.uploadDate" class="q-mx-xs">·</span>
        <span v-if="media.uploadDate">{{ formatDate(media.uploadDate) }}</span>
      </div>

      <!-- Enhanced tags with colors -->
      <div class="q-mt-xs" v-if="media.tags && media.tags.length">
        <q-chip
          v-for="(tag, index) in visibleTags"
          :key="tag"
          size="sm"
          dense
          :color="getTagColor(index)"
          text-color="white"
          clickable
          @click="onTagClick(tag)"
          class="q-mr-xs q-mb-xs"
        >
          {{ tag }}
        </q-chip>

        <!-- Show more tags button -->
        <q-chip
          v-if="media.tags.length > maxVisibleTags && !showAllTags"
          size="sm"
          dense
          outline
          clickable
          @click="toggleShowAllTags"
          class="q-mr-xs q-mb-xs"
        >
          +{{ media.tags.length - maxVisibleTags }} more
        </q-chip>
      </div>

      <!-- Metadata row -->
      <div v-if="media.views || media.rating" class="media-card__metadata q-mt-sm">
        <div class="text-caption text-grey-6">
          <span v-if="media.views">
            <q-icon name="visibility" size="xs" class="q-mr-xs" />
            {{ formatViews(media.views) }} views
          </span>
          <span v-if="media.views && media.rating" class="q-mx-sm">·</span>
          <span v-if="media.rating">
            <q-rating
              :model-value="media.rating"
              readonly
              size="xs"
              color="amber"
              class="q-mr-xs"
            />
            {{ media.rating.toFixed(1) }}
          </span>
        </div>
      </div>
    </q-card-section>

    <!-- Enhanced actions with tooltips and states -->
    <q-card-actions align="between" class="q-pa-md">
      <div>
        <q-btn
          flat
          dense
          :icon="isPlaying ? 'pause' : 'play_arrow'"
          :color="isPlaying ? 'negative' : 'primary'"
          @click="togglePlay"
          :loading="isLoading"
          class="q-mr-xs"
        >
          <q-tooltip>{{ isPlaying ? 'Pause' : 'Play' }}</q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          icon="launch"
          @click="openInNewTab"
          color="primary"
        >
          <q-tooltip>Open in new tab</q-tooltip>
        </q-btn>
      </div>

      <div>
        <q-btn
          flat
          dense
          :icon="isFavorited ? 'bookmark' : 'bookmark_border'"
          :color="isFavorited ? 'red' : 'grey'"
          @click="toggleFavorite"
          :loading="isFavoriteLoading"
        >
          <q-tooltip>{{ isFavorited ? 'Remove from favorites' : 'Add to favorites' }}</q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          icon="share"
          @click="shareMedia"
          color="grey"
          class="q-ml-xs"
        >
          <q-tooltip>Share</q-tooltip>
        </q-btn>

        <q-btn
          flat
          dense
          icon="more_vert"
          color="grey"
          class="q-ml-xs"
        >
          <q-tooltip>More options</q-tooltip>
          <q-menu>
            <q-list dense>
              <q-item clickable @click="downloadMedia" v-close-popup>
                <q-item-section avatar>
                  <q-icon name="download" />
                </q-item-section>
                <q-item-section>Download</q-item-section>
              </q-item>
              <q-item clickable @click="reportMedia" v-close-popup>
                <q-item-section avatar>
                  <q-icon name="flag" />
                </q-item-section>
                <q-item-section>Report</q-item-section>
              </q-item>
              <q-item clickable @click="addToPlaylist" v-close-popup>
                <q-item-section avatar>
                  <q-icon name="playlist_add" />
                </q-item-section>
                <q-item-section>Add to playlist</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

// Props with enhanced validation
const props = defineProps({
  media: {
    type: Object,
    required: true,
    validator: (media) => {
      return media && media.title && media.creator && media.type
    }
  },
  maxVisibleTags: {
    type: Number,
    default: 3
  },
  autoPlay: {
    type: Boolean,
    default: false
  }
})

// Emits for parent component communication
const emit = defineEmits([
  'play', 'pause', 'favorite', 'share', 'tag-click',
  'download', 'report', 'add-to-playlist'
])

const $q = useQuasar()

// Reactive state
const isHovered = ref(false)
const isPlaying = ref(false)
const isLoading = ref(false)
const isFavorited = ref(false)
const isFavoriteLoading = ref(false)
const isImageLoading = ref(true)
const showAllTags = ref(false)

// Computed properties
const visibleTags = computed(() => {
  if (!props.media.tags) return []

  if (showAllTags.value) {
    return props.media.tags
  }
  return props.media.tags.slice(0, props.maxVisibleTags)
})

// Methods
function onHover(hovered) {
  isHovered.value = hovered
}

function onImageLoad() {
  isImageLoading.value = false
}

function onImageError() {
  isImageLoading.value = false
  console.warn('Failed to load image:', props.media.thumbnail)
}

async function playMedia() {
  if (!props.media.link) return

  isLoading.value = true
  isPlaying.value = true

  try {
    // Simulate API call or media loading
    await new Promise(resolve => setTimeout(resolve, 500))

    window.open(props.media.link, '_blank')
    emit('play', props.media)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to play media',
      position: 'top'
    })
  } finally {
    isLoading.value = false
    setTimeout(() => { isPlaying.value = false }, 2000)
  }
}

function togglePlay() {
  if (isPlaying.value) {
    isPlaying.value = false
    emit('pause', props.media)
  } else {
    playMedia()
  }
}

function openInNewTab() {
  if (props.media.link) {
    window.open(props.media.link, '_blank')
  }
}

async function toggleFavorite() {
  isFavoriteLoading.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))

    isFavorited.value = !isFavorited.value
    emit('favorite', { media: props.media, favorited: isFavorited.value })

    $q.notify({
      type: 'positive',
      message: isFavorited.value ? 'Added to favorites' : 'Removed from favorites',
      position: 'top',
      timeout: 1500
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to update favorites',
      position: 'top'
    })
  } finally {
    isFavoriteLoading.value = false
  }
}

async function shareMedia() {
  if (navigator.share && props.media.link) {
    try {
      await navigator.share({
        title: props.media.title,
        text: `Check out this ${props.media.type} by ${props.media.creator}`,
        url: props.media.link
      })
      emit('share', props.media)
    } catch (error) {
      if (error.name !== 'AbortError') {
        fallbackShare()
      }
    }
  } else {
    fallbackShare()
  }
}

function fallbackShare() {
  if (props.media.link) {
    navigator.clipboard.writeText(props.media.link)
    $q.notify({
      type: 'positive',
      message: 'Link copied to clipboard',
      position: 'top',
      timeout: 1500
    })
  }
}

function onTagClick(tag) {
  emit('tag-click', { tag, media: props.media })
}

function toggleShowAllTags() {
  showAllTags.value = !showAllTags.value
}

function downloadMedia() {
  emit('download', props.media)
  $q.notify({
    type: 'info',
    message: 'Download started',
    position: 'top'
  })
}

function reportMedia() {
  emit('report', props.media)
  $q.notify({
    type: 'info',
    message: 'Report submitted',
    position: 'top'
  })
}

function addToPlaylist() {
  emit('add-to-playlist', props.media)
}

// Utility functions
function getTypeIcon(type) {
  const icons = {
    video: 'videocam',
    audio: 'audiotrack',
    podcast: 'mic',
    music: 'music_note',
    image: 'image',
    document: 'description',
    live: 'radio'
  }
  return icons[type?.toLowerCase()] || 'play_circle'
}

function getTypeColor(type) {
  const colors = {
    video: 'red',
    audio: 'purple',
    podcast: 'orange',
    music: 'green',
    image: 'blue',
    document: 'grey',
    live: 'pink'
  }
  return colors[type?.toLowerCase()] || 'primary'
}

function getTagColor(index) {
  const colors = ['primary', 'secondary', 'accent', 'positive', 'info', 'warning']
  return colors[index % colors.length]
}

function formatDuration(seconds) {
  if (!seconds) return ''

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function formatDate(date) {
  if (!date) return ''

  const now = new Date()
  const mediaDate = new Date(date)
  const diffInMs = now - mediaDate
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}

function formatViews(views) {
  if (!views) return '0'

  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`
  }
  return views.toString()
}

// Lifecycle
onMounted(() => {
  // Initialize favorite status (could come from props or API)
  isFavorited.value = props.media.favorited || false
})
</script>

<style lang="scss" scoped>
.media-card {
  transition: all 0.3s ease;
  max-width: 400px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }

  &--loading {
    opacity: 0.7;
    pointer-events: none;
  }

  &--favorited {
    border-color: #f44336;
  }
}

.media-card__thumbnail-container {
  position: relative;
  overflow: hidden;
}

.media-card__thumbnail {
  transition: transform 0.3s ease;

  .media-card:hover & {
    transform: scale(1.05);
  }
}

.media-card__play-overlay {
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0,0,0,0.7);
  }
}

.media-card__duration-badge {
  margin: 8px;
}

.media-card__type-indicator {
  margin: 8px;
}

.media-card__content {
  min-height: 120px;
}

.media-card__metadata {
  border-top: 1px solid rgba(0,0,0,0.1);
  padding-top: 8px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// Dark mode support
body.body--dark {
  .media-card__metadata {
    border-top-color: rgba(255,255,255,0.1);
  }
}
</style>
