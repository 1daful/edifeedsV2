<template>
  <q-dialog
    v-model="dialogModel"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
    class="preview-dialog"
  >
    <q-card class="preview-card">
      <!-- Header -->
      <q-card-section class="preview-header row items-center q-pa-md">
        <div class="col">
          <div class="text-h6">{{ media?.name || 'Media Preview' }}</div>
          <div class="text-caption text-grey-6">
            {{ formatFileSize(media?.size) }} •
            {{ formatDate(media?.created_at) }}
          </div>
        </div>

        <div class="row q-gutter-sm">
          <!-- Download -->
          <q-btn
            flat
            round
            icon="download"
            @click="downloadMedia"
            :disable="!media"
          >
            <q-tooltip>Download</q-tooltip>
          </q-btn>

          <!-- Favorite -->
          <q-btn
            flat
            round
            :icon="media?.favorite ? 'favorite' : 'favorite_border'"
            :color="media?.favorite ? 'red' : 'grey-7'"
            @click="toggleFavorite"
            :disable="!media"
          >
            <q-tooltip>{{ media?.favorite ? 'Remove from favorites' : 'Add to favorites' }}</q-tooltip>
          </q-btn>

          <!-- Edit -->
          <q-btn
            flat
            round
            icon="edit"
            @click="editMedia"
            :disable="!media"
          >
            <q-tooltip>Edit metadata</q-tooltip>
          </q-btn>

          <!-- Delete -->
          <q-btn
            flat
            round
            icon="delete"
            color="negative"
            @click="deleteMedia"
            :disable="!media"
          >
            <q-tooltip>Delete</q-tooltip>
          </q-btn>

          <!-- Close -->
          <q-btn
            flat
            round
            icon="close"
            @click="closeDialog"
          >
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Content -->
      <q-card-section class="preview-content">
        <div class="row full-height">
          <!-- Media Display -->
          <div class="col-12 col-md-8 preview-media-container">
            <div class="preview-media">
              <!-- Image Preview -->
              <template v-if="isImage">
                <q-img
                  :src="media?.url || media?.preview_url"
                  :alt="media?.name"
                  fit="contain"
                  class="full-width full-height"
                  @load="onMediaLoad"
                  @error="onMediaError"
                >
                  <template #loading>
                    <div class="absolute-center">
                      <q-spinner size="50px" color="primary" />
                    </div>
                  </template>
                  <template #error>
                    <div class="absolute-center text-center">
                      <q-icon name="broken_image" size="50px" color="grey-5" />
                      <div class="text-grey-6 q-mt-sm">Failed to load image</div>
                    </div>
                  </template>
                </q-img>
              </template>

              <!-- Video Preview -->
              <template v-else-if="isVideo">
                <video
                  ref="videoRef"
                  :src="media?.url"
                  controls
                  class="full-width full-height video-player"
                  @loadedmetadata="onVideoLoad"
                  @error="onMediaError"
                >
                  Your browser does not support video playback.
                </video>
              </template>

              <!-- Audio Preview -->
              <template v-else-if="isAudio">
                <div class="audio-preview">
                  <q-icon name="audiotrack" size="6rem" color="primary" class="q-mb-lg" />
                  <audio
                    ref="audioRef"
                    :src="media?.url"
                    controls
                    class="full-width"
                    @loadedmetadata="onAudioLoad"
                    @error="onMediaError"
                  >
                    Your browser does not support audio playback.
                  </audio>
                </div>
              </template>

              <!-- Document Preview -->
              <template v-else-if="isDocument">
                <div class="document-preview">
                  <q-icon
                    :name="getDocumentIcon(media?.type)"
                    size="6rem"
                    :color="getDocumentColor(media?.type)"
                    class="q-mb-lg"
                  />
                  <div class="text-h6 q-mb-md">{{ media?.name }}</div>
                  <div class="text-body2 text-grey-6 q-mb-lg">
                    {{ media?.type }} • {{ formatFileSize(media?.size) }}
                  </div>

                  <!-- PDF Preview -->
                  <template v-if="isPDF">
                    <q-btn
                      color="primary"
                      icon="visibility"
                      label="View PDF"
                      @click="openPDFViewer"
                      class="q-mr-sm"
                    />
                  </template>

                  <q-btn
                    outline
                    color="primary"
                    icon="download"
                    label="Download"
                    @click="downloadMedia"
                  />
                </div>
              </template>

              <!-- Unsupported Format -->
              <template v-else>
                <div class="unsupported-preview">
                  <q-icon name="help_outline" size="6rem" color="grey-5" class="q-mb-lg" />
                  <div class="text-h6 q-mb-md">Preview not available</div>
                  <div class="text-body2 text-grey-6 q-mb-lg">
                    This file type cannot be previewed in the browser
                  </div>
                  <q-btn
                    color="primary"
                    icon="download"
                    label="Download to view"
                    @click="downloadMedia"
                  />
                </div>
              </template>
            </div>
          </div>

          <!-- Media Details Sidebar -->
          <div class="col-12 col-md-4 preview-sidebar">
            <q-scroll-area class="full-height">
              <div class="q-pa-md">
                <!-- Basic Info -->
                <div class="info-section q-mb-lg">
                  <h6 class="section-title">File Information</h6>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">Name:</span>
                      <span class="info-value">{{ media?.name }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Type:</span>
                      <span class="info-value">{{ media?.type }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Size:</span>
                      <span class="info-value">{{ formatFileSize(media?.size) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Uploaded:</span>
                      <span class="info-value">{{ formatDate(media?.created_at) }}</span>
                    </div>
                    <div v-if="media?.author" class="info-item">
                      <span class="info-label">Author:</span>
                      <span class="info-value">{{ media.author }}</span>
                    </div>
                  </div>
                </div>

                <!-- Media Dimensions/Duration -->
                <div v-if="mediaDimensions || mediaDuration" class="info-section q-mb-lg">
                  <h6 class="section-title">Media Properties</h6>
                  <div class="info-grid">
                    <div v-if="mediaDimensions" class="info-item">
                      <span class="info-label">Dimensions:</span>
                      <span class="info-value">{{ mediaDimensions }}</span>
                    </div>
                    <div v-if="mediaDuration" class="info-item">
                      <span class="info-label">Duration:</span>
                      <span class="info-value">{{ formatDuration(mediaDuration) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Categories & Tags -->
                <div v-if="media?.category || media?.tags?.length" class="info-section q-mb-lg">
                  <h6 class="section-title">Organization</h6>
                  <div class="info-grid">
                    <div v-if="media.category" class="info-item">
                      <span class="info-label">Category:</span>
                      <q-chip
                        :label="media.category"
                        color="primary"
                        text-color="white"
                        size="sm"
                      />
                    </div>
                    <div v-if="media.tags?.length" class="info-item">
                      <span class="info-label">Tags:</span>
                      <div class="tags-container">
                        <q-chip
                          v-for="tag in media.tags"
                          :key="tag"
                          :label="tag"
                          color="grey-3"
                          text-color="grey-8"
                          size="sm"
                          class="q-mr-xs q-mb-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Description -->
                <div v-if="media?.description" class="info-section q-mb-lg">
                  <h6 class="section-title">Description</h6>
                  <p class="description-text">{{ media.description }}</p>
                </div>

                <!-- Actions -->
                <div class="info-section">
                  <h6 class="section-title">Actions</h6>
                  <div class="action-buttons">
                    <q-btn
                      flat
                      color="primary"
                      icon="edit"
                      label="Edit"
                      class="full-width q-mb-sm"
                      @click="editMedia"
                    />
                    <q-btn
                      flat
                      color="grey-7"
                      icon="share"
                      label="Share"
                      class="full-width q-mb-sm"
                      @click="shareMedia"
                    />
                    <q-btn
                      flat
                      color="negative"
                      icon="delete"
                      label="Delete"
                      class="full-width"
                      @click="deleteMedia"
                    />
                  </div>
                </div>
              </div>
            </q-scroll-area>
          </div>
        </div>
      </q-card-section>

      <!-- PDF Viewer Dialog -->
      <q-dialog v-model="showPDFViewer" maximized>
        <q-card>
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">{{ media?.name }}</div>
            <q-space />
            <q-btn icon="close" flat round dense @click="showPDFViewer = false" />
          </q-card-section>
          <q-card-section class="q-pt-none full-height">
            <iframe
              :src="media?.url"
              class="full-width full-height"
              style="border: none; min-height: 80vh;"
            />
          </q-card-section>
        </q-card>
      </q-dialog>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { date } from 'quasar'
import { useMediaStore } from '../../stores/media'
import { useNotify } from '../../composables/useNotify'

// Props & Emits
const props = defineProps({
  modelValue: Boolean,
  media: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'edit', 'delete'])

// Composables
const $q = useQuasar()
const mediaStore = useMediaStore()
const { notifySuccess, notifyError } = useNotify()

// Reactive data
const videoRef = ref(null)
const audioRef = ref(null)
const showPDFViewer = ref(false)
const mediaDimensions = ref(null)
const mediaDuration = ref(null)

// Computed
const dialogModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isImage = computed(() =>
  props.media?.type?.startsWith('image/')
)

const isVideo = computed(() =>
  props.media?.type?.startsWith('video/')
)

const isAudio = computed(() =>
  props.media?.type?.startsWith('audio/')
)

const isDocument = computed(() =>
  !isImage.value && !isVideo.value && !isAudio.value
)

const isPDF = computed(() =>
  props.media?.type?.includes('pdf')
)

// Methods
const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  return date.formatDate(dateString, 'MMM DD, YYYY HH:mm')
}

const formatDuration = (seconds) => {
  if (!seconds) return 'Unknown'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

const getDocumentIcon = (type) => {
  if (type?.includes('pdf')) return 'picture_as_pdf'
  if (type?.includes('word') || type?.includes('doc')) return 'description'
  if (type?.includes('excel') || type?.includes('sheet')) return 'table_chart'
  if (type?.includes('powerpoint') || type?.includes('presentation')) return 'slideshow'
  if (type?.includes('text')) return 'article'
  return 'insert_drive_file'
}

const getDocumentColor = (type) => {
  if (type?.includes('pdf')) return 'red'
  if (type?.includes('word')) return 'blue'
  if (type?.includes('excel')) return 'green'
  if (type?.includes('powerpoint')) return 'orange'
  return 'grey-6'
}

const onMediaLoad = () => {
  // Handle successful media load
}

const onMediaError = () => {
  notifyError('Failed to load media')
}

const onVideoLoad = () => {
  if (videoRef.value) {
    const video = videoRef.value
    mediaDimensions.value = `${video.videoWidth} × ${video.videoHeight}`
    mediaDuration.value = video.duration
  }
}

const onAudioLoad = () => {
  if (audioRef.value) {
    mediaDuration.value = audioRef.value.duration
  }
}

const toggleFavorite = async () => {
  try {
    await mediaStore.toggleFavorite(props.media.id)
    props.media.favorite = !props.media.favorite
    notifySuccess(props.media.favorite ? 'Added to favorites' : 'Removed from favorites')
  } catch (error) {
    console.error('Error toggling favorite:', error)
    notifyError('Failed to update favorite status')
  }
}

const downloadMedia = () => {
  if (props.media?.url) {
    const link = document.createElement('a')
    link.href = props.media.url
    link.download = props.media.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

const editMedia = () => {
  emit('edit', props.media)
  closeDialog()
}

const deleteMedia = () => {
  $q.dialog({
    title: 'Delete Media',
    message: `Are you sure you want to delete "${props.media.name}"? This action cannot be undone.`,
    cancel: true,
    persistent: true,
    color: 'negative'
  }).onOk(() => {
    emit('delete', props.media)
    closeDialog()
  })
}

const shareMedia = async () => {
  if (navigator.share && props.media?.url) {
    try {
      await navigator.share({
        title: props.media.name,
        url: props.media.url
      })
    } catch (error) {
      // Fallback to copying URL
      copyToClipboard()
    }
  } else {
    copyToClipboard()
  }
}

const copyToClipboard = () => {
  if (props.media?.url) {
    navigator.clipboard.writeText(props.media.url).then(() => {
      notifySuccess('URL copied to clipboard')
    }).catch(() => {
      notifyError('Failed to copy URL')
    })
  }
}

const openPDFViewer = () => {
  showPDFViewer.value = true
}

const closeDialog = () => {
  dialogModel.value = false
}

// Watchers
watch(() => props.media, (newMedia) => {
  if (newMedia) {
    // Reset media properties
    mediaDimensions.value = null
    mediaDuration.value = null

    // Set dimensions for images
    if (isImage.value && newMedia.width && newMedia.height) {
      mediaDimensions.value = `${newMedia.width} × ${newMedia.height}`
    }
  }
}, { immediate: true })
</script>

<style scoped>
.preview-dialog {
  background: rgba(0, 0, 0, 0.8);
}

.preview-card {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.preview-header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.preview-content {
  flex: 1;
  padding: 0;
  overflow: hidden;
}

.preview-media-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  min-height: 100%;
}

.preview-media {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.video-player {
  max-width: 100%;
  max-height: 100%;
}

.audio-preview,
.document-preview,
.unsupported-preview {
  text-align: center;
  padding: 2rem;
}

.preview-sidebar {
  background: white;
  border-left: 1px solid #e0e0e0;
  height: 100%;
}

.info-section {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 1rem;
}

.info-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #333;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

.info-value {
  font-size: 0.875rem;
  color: #333;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.description-text {
  font-size: 0.875rem;
  line-height: 1.5;
  color: #555;
  margin: 0;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .preview-content .row {
    flex-direction: column;
  }

  .preview-media-container {
    min-height: 50vh;
  }

  .preview-sidebar {
    border-left: none;
    border-top: 1px solid #e0e0e0;
  }
}
</style>
