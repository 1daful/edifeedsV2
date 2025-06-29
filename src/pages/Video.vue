<template>
  <q-page class="q-pa-md">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <!-- Error State -->
    <q-card v-else-if="error" flat bordered class="q-pa-md bg-negative text-white">
      <q-card-section>
        <div class="text-h6">Error Loading Video</div>
        <div>{{ error }}</div>
        <q-btn
          flat
          label="Retry"
          @click="loadVideo"
          class="q-mt-md"
          color="white"
        />
      </q-card-section>
    </q-card>

    <!-- Main Video Content -->
    <div v-else class="row q-col-gutter-md">
      <!-- Video Player Section -->
      <div class="col-12 col-lg-8">
        <q-card flat bordered class="video-card">
          <!-- Video Player -->
          <div class="video-container" :class="{ 'theater-mode': theaterMode }">
            <q-video
              ref="videoPlayer"
              :src="video.url"
              :poster="video.thumbnail"
              class="video-player"
              @loadstart="onVideoLoadStart"
              @loadeddata="onVideoLoaded"
              @timeupdate="onTimeUpdate"
              @ended="onVideoEnded"
            />

            <!-- Video Overlay Controls -->
            <div class="video-overlay" v-show="showOverlay">
              <q-btn
                round
                flat
                :icon="isPlaying ? 'pause' : 'play_arrow'"
                size="lg"
                color="white"
                @click="togglePlay"
                class="play-btn"
              />

              <!-- Theater Mode Toggle -->
              <q-btn
                round
                flat
                :icon="theaterMode ? 'fullscreen_exit' : 'fullscreen'"
                color="white"
                @click="toggleTheaterMode"
                class="theater-btn"
              />
            </div>

            <!-- Progress Bar -->
            <div class="progress-container">
              <q-linear-progress
                :value="watchProgress"
                color="red"
                track-color="grey-8"
                size="4px"
                class="video-progress"
              />
            </div>
          </div>

          <q-card-section class="q-pa-md">
            <!-- Video Title and Metadata -->
            <div class="row items-center justify-between q-mb-sm">
              <div class="col">
                <div class="text-h5 text-weight-medium video-title">
                  {{ video.title }}
                </div>
                <div class="text-subtitle2 text-grey-7 q-mt-xs">
                  <q-chip
                    :label="video.category"
                    color="primary"
                    text-color="white"
                    size="sm"
                    class="q-mr-sm"
                  />
                  {{ formatViews(video.views) }} views • {{ formatDate(video.uploadDate) }}
                </div>
              </div>

              <!-- Share Button -->
              <q-btn
                round
                flat
                icon="share"
                @click="shareVideo"
                color="grey-7"
                class="q-ml-md"
              >
                <q-tooltip>Share video</q-tooltip>
              </q-btn>
            </div>

            <!-- Speaker Info -->
            <div class="row items-center q-mb-md">
              <q-avatar size="40px" class="q-mr-md">
                <img :src="video.speakerAvatar || '/default-avatar.png'" />
              </q-avatar>
              <div class="col">
                <div class="text-subtitle1 text-weight-medium">{{ video.speaker }}</div>
                <div class="text-caption text-grey-7">
                  {{ video.speakerBio || 'Content Creator' }}
                </div>
              </div>
              <q-btn
                :label="isSubscribed ? 'Subscribed' : 'Subscribe'"
                :color="isSubscribed ? 'grey' : 'red'"
                :outline="isSubscribed"
                @click="toggleSubscription"
                class="q-ml-md"
              />
            </div>

            <!-- Action Buttons -->
            <div class="row items-center justify-between q-mb-md action-bar">
              <div class="row items-center q-gutter-sm">
                <!-- Like/Dislike -->
                <q-btn-group flat>
                  <q-btn
                    flat
                    :icon="userReaction === 'like' ? 'thumb_up' : 'thumb_up_off_alt'"
                    :color="userReaction === 'like' ? 'positive' : 'grey-7'"
                    @click="reactToVideo('like')"
                    :label="formatCount(video.likes)"
                  />
                  <q-btn
                    flat
                    :icon="userReaction === 'dislike' ? 'thumb_down' : 'thumb_down_off_alt'"
                    :color="userReaction === 'dislike' ? 'negative' : 'grey-7'"
                    @click="reactToVideo('dislike')"
                  />
                </q-btn-group>

                <!-- Bookmark -->
                <q-btn
                  flat
                  :icon="video.bookmarked ? 'bookmark' : 'bookmark_border'"
                  :color="video.bookmarked ? 'amber' : 'grey-7'"
                  @click="toggleBookmark"
                  :label="video.bookmarked ? 'Saved' : 'Save'"
                />

                <!-- Download -->
                <q-btn
                  flat
                  icon="download"
                  color="grey-7"
                  @click="downloadVideo"
                  label="Download"
                  v-if="video.downloadable"
                />
              </div>

              <!-- Rating -->
              <div class="row items-center">
                <span class="text-caption q-mr-sm">Rate:</span>
                <q-rating
                  v-model="video.userRating"
                  size="sm"
                  color="amber"
                  @update:model-value="rateVideo"
                  :max="5"
                />
              </div>
            </div>

            <!-- Description -->
            <q-expansion-item
              :label="`Description (${video.description?.length || 0} characters)`"
              default-opened
              header-class="text-weight-medium"
            >
              <div class="q-pa-md description-content">
                <div v-html="formattedDescription"></div>

                <!-- Tags -->
                <div class="q-mt-md" v-if="video.tags && video.tags.length">
                  <div class="text-caption text-grey-7 q-mb-sm">Tags:</div>
                  <q-chip
                    v-for="tag in video.tags"
                    :key="tag"
                    :label="tag"
                    color="grey-3"
                    text-color="grey-8"
                    size="sm"
                    clickable
                    @click="searchByTag(tag)"
                    class="q-mr-sm q-mb-sm"
                  />
                </div>
              </div>
            </q-expansion-item>

            <!-- Video Stats -->
            <div class="row q-mt-md stats-section">
              <div class="col-3 text-center">
                <div class="text-h6 text-weight-bold">{{ formatCount(video.views) }}</div>
                <div class="text-caption text-grey-7">Views</div>
              </div>
              <div class="col-3 text-center">
                <div class="text-h6 text-weight-bold">{{ formatCount(video.likes) }}</div>
                <div class="text-caption text-grey-7">Likes</div>
              </div>
              <div class="col-3 text-center">
                <div class="text-h6 text-weight-bold">{{ formatCount(video.comments || 0) }}</div>
                <div class="text-caption text-grey-7">Comments</div>
              </div>
              <div class="col-3 text-center">
                <div class="text-h6 text-weight-bold">{{ video.duration }}</div>
                <div class="text-caption text-grey-7">Duration</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Comments Section -->
        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              Comments ({{ video.comments || 0 }})
              <q-btn
                flat
                icon="sort"
                @click="toggleCommentSort"
                class="float-right"
              >
                <q-tooltip>Sort comments</q-tooltip>
              </q-btn>
            </div>
            <comment-section
              :item-id="video.id"
              item-type="video"
              :sort-order="commentSortOrder"
              @comment-added="onCommentAdded"
            />
          </q-card-section>
        </q-card>
      </div>

      <!-- Sidebar -->
      <div class="col-12 col-lg-4">
        <!-- Up Next -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Up Next</div>
            <div class="q-mb-sm" v-if="autoplay">
              <q-checkbox
                v-model="autoplayEnabled"
                label="Autoplay"
                @update:model-value="toggleAutoplay"
              />
            </div>
            <related-content
              type="video"
              :topic="video.topic"
              :current-video-id="video.id"
              :max-items="5"
              @video-selected="navigateToVideo"
            />
          </q-card-section>
        </q-card>

        <!-- Playlist (if video is part of playlist) -->
        <q-card flat bordered class="q-mb-md" v-if="playlist">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              {{ playlist.title }}
              <q-chip
                :label="`${currentPlaylistIndex + 1}/${playlist.videos.length}`"
                color="primary"
                text-color="white"
                size="sm"
                class="float-right"
              />
            </div>
            <playlist-component
              :playlist="playlist"
              :current-video-id="video.id"
              @video-selected="navigateToVideo"
            />
          </q-card-section>
        </q-card>

        <!-- Video Info Card -->
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">Video Info</div>
            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="category" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Category</q-item-label>
                  <q-item-label caption>{{ video.category }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="language" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Language</q-item-label>
                  <q-item-label caption>{{ video.language || 'English' }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="high_quality" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Quality</q-item-label>
                  <q-item-label caption>{{ video.quality || 'HD' }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="schedule" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Watch Time</q-item-label>
                  <q-item-label caption>{{ formatWatchTime(watchTime) }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Share Dialog -->
    <q-dialog v-model="showShareDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Share Video</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="shareUrl"
            label="Video URL"
            readonly
            outlined
          >
            <template v-slot:append>
              <q-btn
                flat
                icon="content_copy"
                @click="copyToClipboard"
                color="primary"
              />
            </template>
          </q-input>

          <div class="row q-gutter-sm q-mt-md">
            <q-btn
              flat
              icon="facebook"
              color="blue-8"
              @click="shareToSocial('facebook')"
            />
            <q-btn
              flat
              icon="twitter"
              color="light-blue"
              @click="shareToSocial('twitter')"
            />
            <q-btn
              flat
              icon="linkedin"
              color="blue-9"
              @click="shareToSocial('linkedin')"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

export default {
  name: 'EnhancedVideoPlayer',

  props: {
    videoId: {
      type: String,
      required: true
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    playlistId: String
  },

  setup(props) {
    const $q = useQuasar()
    const router = useRouter()

    // Reactive state
    const loading = ref(true)
    const error = ref(null)
    const video = ref({})
    const playlist = ref(null)
    const currentPlaylistIndex = ref(0)

    // Video player state
    const videoPlayer = ref(null)
    const isPlaying = ref(false)
    const watchProgress = ref(0)
    const watchTime = ref(0)
    const showOverlay = ref(false)
    const theaterMode = ref(false)

    // User interactions
    const userReaction = ref(null) // 'like' or 'dislike'
    const isSubscribed = ref(false)
    const autoplayEnabled = ref(props.autoplay)
    const commentSortOrder = ref('newest')

    // UI state
    const showShareDialog = ref(false)
    const shareUrl = ref('')

    // Computed properties
    const formattedDescription = computed(() => {
      if (!video.value.description) return ''
      // Convert URLs to links and add line breaks
      return video.value.description
        .replace(/\n/g, '<br>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
    })

    // Methods
    const loadVideo = async () => {
      try {
        loading.value = true
        error.value = null

        // Simulate API call - replace with actual API
        const response = await fetchVideoData(props.videoId)
        video.value = response.video

        if (props.playlistId) {
          playlist.value = response.playlist
          currentPlaylistIndex.value = response.playlistIndex
        }

        // Load user-specific data
        await loadUserData()

      } catch (err) {
        error.value = err.message || 'Failed to load video'
      } finally {
        loading.value = false
      }
    }

    const loadUserData = async () => {
      // Load user's rating, bookmark status, subscription, etc.
      // This would typically come from your API
      userReaction.value = video.value.userReaction
      isSubscribed.value = video.value.isSubscribed
    }

    const togglePlay = () => {
      const player = videoPlayer.value?.$el?.querySelector('video')
      if (player) {
        if (player.paused) {
          player.play()
          isPlaying.value = true
        } else {
          player.pause()
          isPlaying.value = false
        }
      }
    }

    const toggleTheaterMode = () => {
      theaterMode.value = !theaterMode.value
      // Optional: Toggle fullscreen API
    }

    const onVideoLoadStart = () => {
      console.log('Video loading started')
    }

    const onVideoLoaded = () => {
      console.log('Video loaded')
    }

    const onTimeUpdate = (event) => {
      const player = event.target
      watchProgress.value = player.currentTime / player.duration
      watchTime.value = player.currentTime
    }

    const onVideoEnded = () => {
      isPlaying.value = false
      if (autoplayEnabled.value && playlist.value) {
        playNextVideo()
      }
    }

    const playNextVideo = () => {
      if (currentPlaylistIndex.value < playlist.value.videos.length - 1) {
        const nextVideo = playlist.value.videos[currentPlaylistIndex.value + 1]
        navigateToVideo(nextVideo.id)
      }
    }

    const rateVideo = async (rating) => {
      try {
        await updateVideoRating(video.value.id, rating)
        $q.notify({
          message: 'Rating updated',
          color: 'positive',
          icon: 'star'
        })
      } catch (err) {
        $q.notify({
          message: 'Failed to update rating',
          color: 'negative',
          icon: 'error'
        })
      }
    }

    const toggleBookmark = async () => {
      try {
        video.value.bookmarked = !video.value.bookmarked
        await updateBookmarkStatus(video.value.id, video.value.bookmarked)

        $q.notify({
          message: video.value.bookmarked ? 'Video saved' : 'Video removed from saved',
          color: 'positive',
          icon: video.value.bookmarked ? 'bookmark' : 'bookmark_border'
        })
      } catch (err) {
        video.value.bookmarked = !video.value.bookmarked // Revert on error
        $q.notify({
          message: 'Failed to update bookmark',
          color: 'negative',
          icon: 'error'
        })
      }
    }

    const reactToVideo = async (reaction) => {
      let oldReaction
      try {
        oldReaction = userReaction.value
        userReaction.value = userReaction.value === reaction ? null : reaction

        await updateVideoReaction(video.value.id, userReaction.value)

        // Update like count optimistically
        if (reaction === 'like') {
          if (oldReaction === 'like') {
            video.value.likes--
          } else {
            video.value.likes++
            if (oldReaction === 'dislike') video.value.dislikes--
          }
        }

      } catch (err) {
        userReaction.value = oldReaction // Revert on error
        $q.notify({
          message: 'Failed to update reaction',
          color: 'negative',
          icon: 'error'
        })
      }
    }

    const toggleSubscription = async () => {
      try {
        isSubscribed.value = !isSubscribed.value
        await updateSubscription(video.value.speakerId, isSubscribed.value)

        $q.notify({
          message: isSubscribed.value ? 'Subscribed!' : 'Unsubscribed',
          color: 'positive',
          icon: isSubscribed.value ? 'notifications_active' : 'notifications_off'
        })
      } catch (err) {
        isSubscribed.value = !isSubscribed.value
        $q.notify({
          message: 'Failed to update subscription',
          color: 'negative',
          icon: 'error'
        })
      }
    }

    const shareVideo = () => {
      shareUrl.value = `${window.location.origin}/video/${video.value.id}`
      showShareDialog.value = true
    }

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(shareUrl.value)
        $q.notify({
          message: 'URL copied to clipboard',
          color: 'positive',
          icon: 'content_copy'
        })
      } catch (err) {
        $q.notify({
          message: 'Failed to copy URL',
          color: 'negative',
          icon: 'error'
        })
      }
    }

    const shareToSocial = (platform) => {
      const url = encodeURIComponent(shareUrl.value)
      const title = encodeURIComponent(video.value.title)

      const urls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
      }

      window.open(urls[platform], '_blank', 'width=600,height=400')
    }

    const downloadVideo = async () => {
      try {
        $q.notify({
          message: 'Download started',
          color: 'positive',
          icon: 'download'
        })
        // Implement download logic
      } catch {
        $q.notify({
          message: 'Download failed',
          color: 'negative',
          icon: 'error'
        })
      }
    }

    const toggleCommentSort = () => {
      commentSortOrder.value = commentSortOrder.value === 'newest' ? 'oldest' : 'newest'
    }

    const onCommentAdded = () => {
      video.value.comments = (video.value.comments || 0) + 1
    }

    const navigateToVideo = (videoId) => {
      router.push({ name: 'VideoPlayer', params: { videoId } })
    }

    const searchByTag = (tag) => {
      router.push({ name: 'Search', query: { q: tag, type: 'video' } })
    }

    const toggleAutoplay = (enabled) => {
      // Save user preference
      localStorage.setItem('autoplay', enabled.toString())
    }

    // Utility functions
    const formatViews = (views) => {
      if (views >= 1e6) return (views / 1e6).toFixed(1) + 'M'
      if (views >= 1e3) return (views / 1e3).toFixed(1) + 'K'
      return views?.toString() || '0'
    }

    const formatCount = (count) => {
      return formatViews(count)
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString()
    }

    const formatWatchTime = (seconds) => {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Mock API functions (replace with actual API calls)
    const fetchVideoData = async (videoId) => {
      // Mock implementation
      return {
        video: {
          id: videoId,
          title: 'Advanced Vue.js Techniques',
          speaker: 'John Doe',
          speakerAvatar: '/avatar.jpg',
          speakerBio: 'Senior Frontend Developer',
          description: 'Learn advanced Vue.js techniques including composition API, custom hooks, and performance optimization.',
          url: 'https://example.com/video.mp4',
          thumbnail: '/thumbnail.jpg',
          views: 15420,
          likes: 892,
          comments: 45,
          uploadDate: '2024-01-15',
          category: 'Technology',
          topic: 'Vue.js',
          tags: ['vue', 'javascript', 'frontend', 'web-development'],
          duration: '24:35',
          quality: '1080p',
          language: 'English',
          downloadable: true,
          userRating: 4
        }
      }
    }

    const updateVideoRating = async (videoId, rating) => {
      // Mock API call
      console.log('Rating updated:', videoId, rating)
    }

    const updateBookmarkStatus = async (videoId, bookmarked) => {
      // Mock API call
      console.log('Bookmark updated:', videoId, bookmarked)
    }

    const updateVideoReaction = async (videoId, reaction) => {
      // Mock API call
      console.log('Reaction updated:', videoId, reaction)
    }

    const updateSubscription = async (speakerId, subscribed) => {
      // Mock API call
      console.log('Subscription updated:', speakerId, subscribed)
    }

    // Lifecycle
    onMounted(() => {
      loadVideo()

      // Load autoplay preference
      const savedAutoplay = localStorage.getItem('autoplay')
      if (savedAutoplay !== null) {
        autoplayEnabled.value = savedAutoplay === 'true'
      }
    })

    // Watch for video ID changes
    watch(() => props.videoId, () => {
      loadVideo()
    })

    return {
      // State
      loading,
      error,
      video,
      playlist,
      currentPlaylistIndex,
      videoPlayer,
      isPlaying,
      watchProgress,
      watchTime,
      showOverlay,
      theaterMode,
      userReaction,
      isSubscribed,
      autoplayEnabled,
      commentSortOrder,
      showShareDialog,
      shareUrl,

      // Computed
      formattedDescription,

      // Methods
      loadVideo,
      togglePlay,
      toggleTheaterMode,
      onVideoLoadStart,
      onVideoLoaded,
      onTimeUpdate,
      onVideoEnded,
      rateVideo,
      toggleBookmark,
      reactToVideo,
      toggleSubscription,
      shareVideo,
      copyToClipboard,
      shareToSocial,
      downloadVideo,
      toggleCommentSort,
      onCommentAdded,
      navigateToVideo,
      searchByTag,
      toggleAutoplay,
      formatViews,
      formatCount,
      formatDate,
      formatWatchTime
    }
  }
}
</script>

<style lang="sass" scoped>
.video-card
  position: relative

.video-container
  position: relative
  background: #000

  &.theater-mode
    position: fixed
    top: 0
    left: 0
    right: 0
    z-index: 9999
    height: 100vh

.video-player
  width: 100%
  height: auto

.video-overlay
  position: absolute
  top: 0
  left: 0
  right: 0
  bottom: 0
  display: flex
  align-items: center
  justify-content: center
  background: rgba(0, 0, 0, 0.3)
  opacity: 0
  transition: opacity 0.3s ease

  &:hover
    opacity: 1

.play-btn
  font-size: 4rem !important

.theater-btn
  position: absolute
  top: 16px
  right: 16px

.progress-container
  position: absolute
  bottom: 0
  left: 0
  right: 0

.video-progress
  height: 4px !important

.video-title
  line-height: 1.3

.action-bar
  border-top: 1px solid #e0e0e0
  border-bottom: 1px solid #e0e0e0
  padding: 12px 0
  margin: 16px 0

.description-content
  max-height: 200px
  overflow-y: auto

.stats-section
  background: #f5f5f5
  border-radius: 8px
  padding: 16px
  margin-top: 16px

@media (max-width: 1024px)
  .video-container.theater-mode
    position: relative
    height: auto
</style>
