<template>
  <q-dialog
    v-model="dialogModel"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="upload-dialog">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Upload Media Files</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="closeDialog" />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <!-- Upload Area -->
        <div class="upload-container">
          <!-- Drag & Drop Area -->
          <div
            ref="dropZone"
            class="drop-zone"
            :class="{
              'drop-zone--active': isDragOver,
              'drop-zone--disabled': uploading
            }"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              @change="handleFileSelect"
              style="display: none"
            >

            <div class="drop-zone__content">
              <q-icon
                :name="isDragOver ? 'cloud_download' : 'cloud_upload'"
                size="4rem"
                :color="isDragOver ? 'primary' : 'grey-5'"
              />
              <h6 class="q-mt-md q-mb-sm">
                {{ isDragOver ? 'Drop files here' : 'Drag & drop files here' }}
              </h6>
              <p class="text-grey-6">
                or <span class="text-primary cursor-pointer">browse files</span>
              </p>
              <p class="text-caption text-grey-5">
                Supports images, videos, audio, and documents
              </p>
            </div>
          </div>

          <!-- File List -->
          <div v-if="selectedFiles.length > 0" class="q-mt-lg">
            <div class="text-subtitle1 q-mb-md">
              Selected Files ({{ selectedFiles.length }})
            </div>

            <q-list bordered class="rounded-borders">
              <q-item
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="file-item"
              >
                <q-item-section avatar>
                  <q-avatar
                    :color="getFileTypeColor(file.type)"
                    text-color="white"
                    :icon="getFileTypeIcon(file.type)"
                    size="40px"
                  />
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ file.name }}</q-item-label>
                  <q-item-label caption>
                    {{ formatFileSize(file.size) }} • {{ file.type }}
                  </q-item-label>

                  <!-- Progress bar during upload -->
                  <q-linear-progress
                    v-if="uploadProgress[index] !== undefined"
                    :value="uploadProgress[index] / 100"
                    color="primary"
                    class="q-mt-sm"
                  />
                </q-item-section>

                <q-item-section side>
                  <div class="row items-center q-gutter-sm">
                    <!-- Upload status -->
                    <q-icon
                      v-if="uploadStatus[index] === 'success'"
                      name="check_circle"
                      color="positive"
                      size="sm"
                    />
                    <q-icon
                      v-else-if="uploadStatus[index] === 'error'"
                      name="error"
                      color="negative"
                      size="sm"
                    />
                    <q-spinner
                      v-else-if="uploadStatus[index] === 'uploading'"
                      color="primary"
                      size="sm"
                    />

                    <!-- Remove button -->
                    <q-btn
                      flat
                      round
                      dense
                      icon="close"
                      size="sm"
                      @click="removeFile(index)"
                      :disable="uploading"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Upload Options -->
          <div v-if="selectedFiles.length > 0" class="q-mt-lg">
            <q-expansion-item
              v-model="showUploadOptions"
              icon="settings"
              label="Upload Options"
              class="upload-options"
            >
              <div class="q-pa-md">
                <div class="row q-gutter-md">
                  <!-- Category Selection -->
                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="uploadOptions.category"
                      :options="categoryOptions"
                      label="Category"
                      outlined
                      dense
                    />
                  </div>

                  <!-- Tags -->
                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="uploadOptions.tags"
                      :options="availableTags"
                      label="Tags"
                      outlined
                      dense
                      multiple
                      use-chips
                      use-input
                      @new-value="createTag"
                    />
                  </div>

                  <!-- Privacy Settings -->
                  <div class="col-12">
                    <q-checkbox
                      v-model="uploadOptions.isPrivate"
                      label="Make files private"
                    />
                  </div>

                  <!-- Auto-generate thumbnails -->
                  <div class="col-12">
                    <q-checkbox
                      v-model="uploadOptions.generateThumbnails"
                      label="Auto-generate thumbnails for images and videos"
                    />
                  </div>
                </div>
              </div>
            </q-expansion-item>
          </div>
        </div>
      </q-card-section>

      <!-- Actions -->
      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          label="Cancel"
          @click="closeDialog"
          :disable="uploading"
        />
        <q-btn
          color="primary"
          label="Upload Files"
          @click="startUpload"
          :disable="selectedFiles.length === 0 || uploading"
          :loading="uploading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useMediaStore } from '../../stores/media'
import { useNotify } from '../../composables/useNotify'

// Props & Emits
const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'uploaded'])

// Composables
const $q = useQuasar()
const mediaStore = useMediaStore()
const { notifySuccess, notifyError } = useNotify()

// Reactive data
const selectedFiles = ref([])
const uploading = ref(false)
const isDragOver = ref(false)
const showUploadOptions = ref(false)
const uploadProgress = ref({})
const uploadStatus = ref({})

// File input ref
const fileInput = ref(null)
const dropZone = ref(null)

// Upload options
const uploadOptions = ref({
  category: '',
  tags: [],
  isPrivate: false,
  generateThumbnails: true
})

// Options data
const categoryOptions = [
  'Images', 'Videos', 'Audio', 'Documents',
  'Design', 'Marketing', 'Other'
]

const availableTags = ref([
  'important', 'draft', 'final', 'archive',
  'project-a', 'project-b', 'marketing',
  'social-media', 'web', 'print'
])

// Computed
const dialogModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Methods
const triggerFileInput = () => {
  if (!uploading.value) {
    fileInput.value?.click()
  }
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  addFiles(files)
}

const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event) => {
  event.preventDefault()
  isDragOver.value = false
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false

  const files = Array.from(event.dataTransfer.files)
  addFiles(files)
}

const addFiles = (files) => {
  // Filter valid files and check for duplicates
  const validFiles = files.filter(file => {
    const isDuplicate = selectedFiles.value.some(existing =>
      existing.name === file.name && existing.size === file.size
    )

    if (isDuplicate) {
      notifyError(`File "${file.name}" is already selected`)
      return false
    }

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      notifyError(`File "${file.name}" is too large (max 100MB)`)
      return false
    }

    return true
  })

  selectedFiles.value.push(...validFiles)

  if (validFiles.length > 0) {
    showUploadOptions.value = true
  }
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
  delete uploadProgress.value[index]
  delete uploadStatus.value[index]
}

const getFileTypeIcon = (type) => {
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('video/')) return 'videocam'
  if (type.startsWith('audio/')) return 'audiotrack'
  if (type.includes('pdf')) return 'picture_as_pdf'
  if (type.includes('word')) return 'description'
  return 'insert_drive_file'
}

const getFileTypeColor = (type) => {
  if (type.startsWith('image/')) return 'green'
  if (type.startsWith('video/')) return 'red'
  if (type.startsWith('audio/')) return 'orange'
  if (type.includes('pdf')) return 'red'
  if (type.includes('word')) return 'blue'
  return 'grey'
}

const formatFileSize = (bytes) => {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

const createTag = (val, done) => {
  if (val.length > 0) {
    if (!availableTags.value.includes(val)) {
      availableTags.value.push(val)
    }
    done(val, 'toggle')
  }
}

const startUpload = async () => {
  uploading.value = true
  const uploadedFiles = []

  try {
    for (let i = 0; i < selectedFiles.value.length; i++) {
      const file = selectedFiles.value[i]
      uploadStatus.value[i] = 'uploading'

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          if (uploadProgress.value[i] < 90) {
            uploadProgress.value[i] = (uploadProgress.value[i] || 0) + 10
          }
        }, 100)

        // Upload file to Supabase
        const uploadedFile = await mediaStore.uploadFile(
          file,
          uploadOptions.value,
          (progress) => {
            uploadProgress.value[i] = progress
          }
        )

        clearInterval(progressInterval)
        uploadProgress.value[i] = 100
        uploadStatus.value[i] = 'success'
        uploadedFiles.push(uploadedFile)

      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
        uploadStatus.value[i] = 'error'
        notifyError(`Failed to upload ${file.name}`)
      }
    }

    if (uploadedFiles.length > 0) {
      emit('uploaded', uploadedFiles)
      notifySuccess(`Successfully uploaded ${uploadedFiles.length} file(s)`)

      // Reset form after successful upload
      setTimeout(() => {
        resetForm()
        closeDialog()
      }, 1500)
    }

  } catch (error) {
    console.error('Upload error:', error)
    notifyError('Upload failed')
  } finally {
    uploading.value = false
  }
}

const resetForm = () => {
  selectedFiles.value = []
  uploadProgress.value = {}
  uploadStatus.value = {}
  showUploadOptions.value = false
  uploadOptions.value = {
    category: '',
    tags: [],
    isPrivate: false,
    generateThumbnails: true
  }

  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const closeDialog = () => {
  if (!uploading.value) {
    resetForm()
    dialogModel.value = false
  }
}

// Watch for dialog close to cleanup
watch(dialogModel, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})
</script>

<style scoped>
.upload-dialog {
  min-height: 400px;
}

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
}

.drop-zone:hover:not(.drop-zone--disabled) {
  border-color: var(--q-color-primary);
  background: #f5f5f5;
}

.drop-zone--active {
  border-color: var(--q-color-primary);
  background: rgba(var(--q-color-primary-rgb), 0.1);
}

.drop-zone--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.drop-zone__content {
  pointer-events: none;
}

.file-item {
  transition: background-color 0.2s ease;
}

.file-item:hover {
  background-color: #f5f5f5;
}

.upload-options {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style>
