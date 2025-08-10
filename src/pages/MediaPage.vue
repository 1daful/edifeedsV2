<template>
  <q-page class="q-pa-md">
    <!-- Header with actions -->
    <div class="row q-mb-md items-center justify-between">
      <h5 class="q-ma-none">Media Library</h5>
      <div class="row q-gutter-sm">
        <q-btn
          icon="refresh"
          label="Refresh"
          color="primary"
          outline
          @click="refreshMedia"
          :loading="isRefreshing"
        />
        <q-btn
          icon="upload"
          label="Upload"
          color="primary"
          @click="showUploadDialog"
        />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-3" v-for="stat in mediaStats" :key="stat.label">
        <q-card class="text-center q-pa-md">
          <q-icon :name="stat.icon" size="2rem" :color="stat.color" class="q-mb-sm" />
          <div class="text-h6">{{ stat.value }}</div>
          <div class="text-caption text-grey-6">{{ stat.label }}</div>
        </q-card>
      </div>
    </div>

    <!-- Enhanced Filters -->
    <media-filters
      @filter="handleFilterChange"
      :loading="isLoading"
      :total-count="totalMediaCount"
      :filtered-count="filteredMedia.length"
    />

    <!-- Search and Sort Bar -->
    <q-card flat class="q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-6">
            <q-input
              v-model="searchQuery"
              placeholder="Search media..."
              outlined
              dense
              clearable
              @input="debouncedSearch"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="sortBy"
              :options="sortOptions"
              label="Sort by"
              outlined
              dense
              emit-value
              map-options
              @update:model-value="applySorting"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-btn-toggle
              v-model="viewMode"
              :options="viewModeOptions"
              color="primary"
              outline
              dense
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center q-py-xl">
      <q-spinner size="3rem" color="primary" />
      <div class="text-h6 q-mt-md">Loading media...</div>
    </div>

    <!-- Error State -->
    <q-banner v-else-if="error" class="bg-negative text-white q-mb-md" rounded>
      <template v-slot:avatar>
        <q-icon name="error" />
      </template>
      {{ error }}
      <template v-slot:action>
        <q-btn flat label="Retry" @click="fetchMedia" />
      </template>
    </q-banner>

    <!-- Empty State -->
    <q-card v-else-if="filteredMedia.length === 0 && !isLoading" flat class="text-center q-py-xl">
      <q-icon name="photo_library" size="4rem" color="grey-5" />
      <div class="text-h6 q-mt-md text-grey-6">
        {{ allMedia.length === 0 ? 'No media files found' : 'No media matches your filters' }}
      </div>
      <div class="text-body2 text-grey-6 q-mt-sm">
        {{ allMedia.length === 0 ? 'Upload some files to get started' : 'Try adjusting your search or filters' }}
      </div>
      <q-btn
        v-if="allMedia.length === 0"
        label="Upload Media"
        color="primary"
        class="q-mt-md"
        @click="showUploadDialog"
      />
    </q-card>

    <!-- Media List/Grid -->
    <media-list
      v-else
      :items="paginatedMedia"
      :view-mode="viewMode"
      :loading="isLoading"
      @select="handleMediaSelect"
      @delete="handleMediaDelete"
      @update="handleMediaUpdate"
    />

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="row justify-center q-mt-md">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="6"
        boundary-numbers
        direction-links
        @update:model-value="handlePageChange"
      />
    </div>

    <!-- Selection Actions -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]" v-if="selectedMedia.length > 0">
      <q-fab
        color="primary"
        icon="keyboard_arrow_up"
        direction="up"
        :model-value="true"
      >
        <q-fab-action
          color="negative"
          icon="delete"
          @click="confirmBulkDelete"
          :label="`Delete ${selectedMedia.length}`"
        />
        <q-fab-action
          color="info"
          icon="download"
          @click="bulkDownload"
          label="Download"
        />
        <q-fab-action
          color="warning"
          icon="folder"
          @click="showBulkMoveDialog"
          label="Move"
        />
      </q-fab>
    </q-page-sticky>

    <!-- Upload Dialog -->
    <q-dialog v-model="uploadDialog" persistent>
      <media-upload-dialog
        @uploaded="handleMediaUploaded"
        @close="uploadDialog = false"
      />
    </q-dialog>

    <!-- Bulk Actions Dialogs -->
    <q-dialog v-model="bulkDeleteDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirm Deletion</div>
        </q-card-section>
        <q-card-section>
          Are you sure you want to delete {{ selectedMedia.length }} media file(s)? This action cannot be undone.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="bulkDeleteDialog = false" />
          <q-btn color="negative" label="Delete" @click="executeBulkDelete" :loading="isDeletingBulk" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { debounce } from 'lodash-es'
import MediaFilters from 'components/media/MediaFilters.vue'
import MediaList from 'components/media/MediaList.vue'
import MediaUploadDialog from 'components/media/MediaUploadDialog.vue'
// import { mediaService } from 'services/mediaService' // Your Supabase service

// Quasar instance for notifications
const $q = useQuasar()

// Reactive data
const allMedia = ref([])
const filteredMedia = ref([])
const selectedMedia = ref([])
const searchQuery = ref('')
const currentFilters = ref({})
const sortBy = ref('created_at_desc')
const viewMode = ref('grid')
const currentPage = ref(1)
const itemsPerPage = ref(20)

// UI state
const isLoading = ref(false)
const isRefreshing = ref(false)
const isDeletingBulk = ref(false)
const error = ref(null)
const uploadDialog = ref(false)
const bulkDeleteDialog = ref(false)

// Configuration
const sortOptions = [
  { label: 'Date Created (Newest)', value: 'created_at_desc' },
  { label: 'Date Created (Oldest)', value: 'created_at_asc' },
  { label: 'Name (A-Z)', value: 'name_asc' },
  { label: 'Name (Z-A)', value: 'name_desc' },
  { label: 'Size (Largest)', value: 'size_desc' },
  { label: 'Size (Smallest)', value: 'size_asc' },
  { label: 'Type', value: 'type_asc' }
]

const viewModeOptions = [
  { label: 'Grid', value: 'grid', icon: 'grid_view' },
  { label: 'List', value: 'list', icon: 'list' }
]

// Computed properties
const mediaStats = computed(() => {
  const stats = allMedia.value.reduce((acc, item) => {
    acc.total++
    acc.types[item.type] = (acc.types[item.type] || 0) + 1
    acc.totalSize += item.size || 0
    return acc
  }, { total: 0, types: {}, totalSize: 0 })

  return [
    {
      label: 'Total Files',
      value: stats.total,
      icon: 'folder',
      color: 'primary'
    },
    {
      label: 'Images',
      value: stats.types['image'] || 0,
      icon: 'image',
      color: 'green'
    },
    {
      label: 'Videos',
      value: stats.types['video'] || 0,
      icon: 'videocam',
      color: 'red'
    },
    {
      label: 'Total Size',
      value: formatFileSize(stats.totalSize),
      icon: 'storage',
      color: 'orange'
    }
  ]
})

const totalMediaCount = computed(() => allMedia.value.length)

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return filteredMedia.value

  const query = searchQuery.value.toLowerCase()
  return filteredMedia.value.filter(item =>
    item.name?.toLowerCase().includes(query) ||
    item.description?.toLowerCase().includes(query) ||
    item.tags?.some(tag => tag.toLowerCase().includes(query))
  )
})

const sortedMedia = computed(() => {
  const sorted = [...searchResults.value]

  switch (sortBy.value) {
    case 'created_at_desc':
      return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    case 'created_at_asc':
      return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    case 'name_asc':
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    case 'name_desc':
      return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
    case 'size_desc':
      return sorted.sort((a, b) => (b.size || 0) - (a.size || 0))
    case 'size_asc':
      return sorted.sort((a, b) => (a.size || 0) - (b.size || 0))
    case 'type_asc':
      return sorted.sort((a, b) => (a.type || '').localeCompare(b.type || ''))
    default:
      return sorted
  }
})

const totalPages = computed(() =>
  Math.ceil(sortedMedia.value.length / itemsPerPage.value)
)

const paginatedMedia = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sortedMedia.value.slice(start, end)
})

// Methods
const fetchMedia = async (showLoader = true) => {
  try {
    if (showLoader) isLoading.value = true
    error.value = null

    // Replace with your Supabase query
    // const { data, error: fetchError } = await mediaService.getAll()
    // if (fetchError) throw fetchError

    // Mock data for demonstration
    await new Promise(resolve => setTimeout(resolve, 1000))
    allMedia.value = generateMockData()

    applyFilters(currentFilters.value)

    $q.notify({
      type: 'positive',
      message: `Loaded ${allMedia.value.length} media files`,
      timeout: 2000
    })
  } catch (err) {
    error.value = err.message || 'Failed to load media'
    $q.notify({
      type: 'negative',
      message: error.value,
      timeout: 3000
    })
  } finally {
    isLoading.value = false
  }
}

const refreshMedia = async () => {
  isRefreshing.value = true
  await fetchMedia(false)
  isRefreshing.value = false
}

const applyFilters = (filters) => {
  currentFilters.value = { ...filters }

  filteredMedia.value = allMedia.value.filter(item => {
    // Type filter
    if (filters.type && item.type !== filters.type) return false

    // Category filter
    if (filters.category && item.category !== filters.category) return false

    // Date range filter
    if (filters.dateFrom) {
      const itemDate = new Date(item.created_at)
      const fromDate = new Date(filters.dateFrom)
      if (itemDate < fromDate) return false
    }

    if (filters.dateTo) {
      const itemDate = new Date(item.created_at)
      const toDate = new Date(filters.dateTo)
      if (itemDate > toDate) return false
    }

    // Size filter
    if (filters.minSize && (item.size || 0) < filters.minSize) return false
    if (filters.maxSize && (item.size || 0) > filters.maxSize) return false

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const itemTags = item.tags || []
      const hasAnyTag = filters.tags.some(tag => itemTags.includes(tag))
      if (!hasAnyTag) return false
    }

    return true
  })

  // Reset pagination when filters change
  currentPage.value = 1
}

const handleFilterChange = (filters) => {
  applyFilters(filters)
}

const debouncedSearch = debounce(() => {
  currentPage.value = 1
}, 300)

const applySorting = () => {
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

const handleMediaSelect = (mediaItems) => {
  selectedMedia.value = mediaItems
}

const handleMediaDelete = async (mediaId) => {
  try {
    // Replace with your Supabase delete logic
    // await mediaService.delete(mediaId)

    allMedia.value = allMedia.value.filter(item => item.id !== mediaId)
    applyFilters(currentFilters.value)

    $q.notify({
      type: 'positive',
      message: 'Media file deleted successfully',
      timeout: 2000
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Failed to delete media file',
      timeout: 3000
    })
  }
}

const handleMediaUpdate = async (updatedMedia) => {
  try {
    const index = allMedia.value.findIndex(item => item.id === updatedMedia.id)
    if (index !== -1) {
      allMedia.value[index] = { ...allMedia.value[index], ...updatedMedia }
      applyFilters(currentFilters.value)
    }

    $q.notify({
      type: 'positive',
      message: 'Media file updated successfully',
      timeout: 2000
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Failed to update media file',
      timeout: 3000
    })
  }
}

const showUploadDialog = () => {
  uploadDialog.value = true
}

const handleMediaUploaded = (newMediaItems) => {
  allMedia.value.unshift(...newMediaItems)
  applyFilters(currentFilters.value)
  uploadDialog.value = false

  $q.notify({
    type: 'positive',
    message: `${newMediaItems.length} file(s) uploaded successfully`,
    timeout: 3000
  })
}

const confirmBulkDelete = () => {
  bulkDeleteDialog.value = true
}

const executeBulkDelete = async () => {
  try {
    isDeletingBulk.value = true

    // Replace with your Supabase bulk delete logic
    // await mediaService.bulkDelete(selectedMedia.value.map(item => item.id))

    const selectedIds = selectedMedia.value.map(item => item.id)
    allMedia.value = allMedia.value.filter(item => !selectedIds.includes(item.id))

    applyFilters(currentFilters.value)
    selectedMedia.value = []
    bulkDeleteDialog.value = false

    $q.notify({
      type: 'positive',
      message: `${selectedIds.length} file(s) deleted successfully`,
      timeout: 3000
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Failed to delete selected files',
      timeout: 3000
    })
  } finally {
    isDeletingBulk.value = false
  }
}

const bulkDownload = async () => {
  try {
    // Implementation for bulk download
    $q.notify({
      type: 'info',
      message: 'Preparing download...',
      timeout: 2000
    })

    // Your bulk download logic here
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Failed to download files',
      timeout: 3000
    })
  }
}

const showBulkMoveDialog = () => {
  // Implementation for bulk move
  $q.notify({
    type: 'info',
    message: 'Bulk move feature coming soon',
    timeout: 2000
  })
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

// Mock data generator for demonstration
const generateMockData = () => {
  const types = ['image', 'video', 'document']
  const categories = ['product', 'marketing', 'documentation', 'personal']
  const tags = ['important', 'draft', 'review', 'published', 'archived']

  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `media-file-${i + 1}`,
    type: types[Math.floor(Math.random() * types.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    size: Math.floor(Math.random() * 10000000),
    created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    tags: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () =>
      tags[Math.floor(Math.random() * tags.length)]
    ),
    url: `https://example.com/media-${i + 1}`,
    thumbnail: `https://via.placeholder.com/200x200?text=Media+${i + 1}`,
    description: `Description for media file ${i + 1}`
  }))
}

// Lifecycle
onMounted(() => {
  fetchMedia()
})

// Watchers
watch(searchQuery, debouncedSearch)
watch(currentFilters, () => {
  currentPage.value = 1
}, { deep: true })
</script>

<style scoped>
.q-page {
  min-height: 100vh;
}

.media-stats-card {
  transition: transform 0.2s ease;
}

.media-stats-card:hover {
  transform: translateY(-2px);
}
</style>
