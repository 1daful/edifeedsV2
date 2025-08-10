<template>
  <q-page class="q-pa-md">
    <!-- Header with actions -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="text-h4 q-ma-none">Media Library</h4>
        <p class="text-subtitle2 text-grey-6 q-ma-none">
          {{ totalCount }} items • {{ filteredMedia.length }} filtered
        </p>
      </div>

      <div class="row q-gutter-sm">
        <q-btn
          color="primary"
          icon="add"
          label="Upload Media"
          @click="showUploadDialog = true"
        />
        <q-btn
          flat
          color="grey-7"
          :icon="viewMode === 'grid' ? 'view_list' : 'grid_view'"
          @click="toggleViewMode"
        />
        <q-btn
          flat
          color="grey-7"
          icon="refresh"
          @click="refreshMedia"
          :loading="loading"
        />
      </div>
    </div>

    <!-- Filters with collapsible advanced options -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <media-filters
          v-model:filters="currentFilters"
          :loading="loading"
          @filter="handleFilterChange"
          @reset="resetFilters"
        />

        <!-- Advanced filters toggle -->
        <q-expansion-item
          v-model="showAdvancedFilters"
          icon="tune"
          label="Advanced Filters"
          class="q-mt-md"
        >
          <div class="q-pt-md">
            <AdvancedFilters
              v-model:filters="advancedFilters"
              @change="handleAdvancedFilterChange"
            />
          </div>
        </q-expansion-item>
      </q-card-section>
    </q-card>

    <!-- Loading state -->
    <div v-if="loading && !allMedia.length" class="flex flex-center q-py-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <!-- Empty state -->
    <q-card v-else-if="!loading && !allMedia.length" class="text-center q-py-xl">
      <q-card-section>
        <q-icon name="photo_library" size="4rem" color="grey-4" />
        <h5 class="text-h5 q-mt-md q-mb-sm">No media found</h5>
        <p class="text-subtitle1 text-grey-6">
          Upload your first media file to get started
        </p>
        <q-btn
          color="primary"
          icon="add"
          label="Upload Media"
          @click="showUploadDialog = true"
          class="q-mt-md"
        />
      </q-card-section>
    </q-card>

    <!-- Media content -->
    <template v-else>
      <!-- Search results info -->
      <div v-if="hasActiveFilters" class="q-mb-md">
        <q-chip
          removable
          color="primary"
          text-color="white"
          @remove="resetFilters"
        >
          {{ filteredMedia.length }} results found
        </q-chip>
      </div>

      <!-- Media list/grid -->
      <media-list
        :items="paginatedMedia"
        :view-mode="viewMode"
        :loading="loading"
        @select="handleMediaSelect"
        @delete="handleMediaDelete"
        @edit="handleMediaEdit"
        @preview="handleMediaPreview"
      />

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex flex-center q-mt-lg">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="6"
          boundary-numbers
          direction-links
          @update:model-value="handlePageChange"
        />
      </div>
    </template>

    <!-- Upload Dialog -->
    <media-upload-dialog
      v-model="showUploadDialog"
      @uploaded="handleMediaUploaded"
    />

    <!-- Preview Dialog -->
    <media-preview-dialog
      v-model="showPreviewDialog"
      :media="selectedMedia"
    />

    <!-- Edit Dialog -->
    <media-edit-dialog
      v-model="showEditDialog"
      :media="selectedMedia"
      @updated="handleMediaUpdated"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { debounce } from 'lodash-es'
import MediaFilters from '../components/media/MediaFilters.vue'
import MediaList from '../components/media/MediaList.vue'
import AdvancedFilters from '../components/media/AdvancedFilters.vue'
import MediaUploadDialog from '../components/media/MediaUploadDialog.vue'
import MediaPreviewDialog from '../components/media/MediaPreviewDialog.vue'
import MediaEditDialog from '../components/media/MediaEditDialog.vue'
import { useMediaStore } from '../stores/media'
import { useNotify } from '../composables/useNotify'

// Composables
const $q = useQuasar()
const mediaStore = useMediaStore()
const { notifySuccess, notifyError } = useNotify()

// Reactive data
const allMedia = ref([])
const loading = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(20)
const viewMode = ref('grid') // 'grid' or 'list'
const selectedMedia = ref(null)

// Filter states
const currentFilters = ref({
  type: '',
  category: '',
  search: '',
  dateRange: null
})

const advancedFilters = ref({
  size: { min: null, max: null },
  duration: { min: null, max: null },
  tags: [],
  author: '',
  favorite: null
})

// Dialog states
const showUploadDialog = ref(false)
const showPreviewDialog = ref(false)
const showEditDialog = ref(false)
const showAdvancedFilters = ref(false)

// Computed properties
const totalCount = computed(() => allMedia.value.length)

const hasActiveFilters = computed(() => {
  const basic = Object.values(currentFilters.value).some(val =>
    val !== '' && val !== null && val?.length > 0
  )
  const advanced = Object.values(advancedFilters.value).some(val => {
    if (Array.isArray(val)) return val.length > 0
    if (typeof val === 'object' && val !== null) {
      return Object.values(val).some(v => v !== null && v !== '')
    }
    return val !== null && val !== ''
  })
  return basic || advanced
})

const filteredMedia = computed(() => {
  let filtered = [...allMedia.value]

  // Apply basic filters
  if (currentFilters.value.type) {
    filtered = filtered.filter(item => item.type === currentFilters.value.type)
  }

  if (currentFilters.value.category) {
    filtered = filtered.filter(item => item.category === currentFilters.value.category)
  }

  if (currentFilters.value.search) {
    const searchTerm = currentFilters.value.search.toLowerCase()
    filtered = filtered.filter(item =>
      item.name?.toLowerCase().includes(searchTerm) ||
      item.description?.toLowerCase().includes(searchTerm) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  if (currentFilters.value.dateRange) {
    const { from, to } = currentFilters.value.dateRange
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.created_at)
      return itemDate >= from && itemDate <= to
    })
  }

  // Apply advanced filters
  if (advancedFilters.value.size.min !== null) {
    filtered = filtered.filter(item => item.size >= advancedFilters.value.size.min)
  }

  if (advancedFilters.value.size.max !== null) {
    filtered = filtered.filter(item => item.size <= advancedFilters.value.size.max)
  }

  if (advancedFilters.value.tags.length > 0) {
    filtered = filtered.filter(item =>
      advancedFilters.value.tags.every(tag =>
        item.tags?.includes(tag)
      )
    )
  }

  if (advancedFilters.value.author) {
    filtered = filtered.filter(item =>
      item.author?.toLowerCase().includes(advancedFilters.value.author.toLowerCase())
    )
  }

  if (advancedFilters.value.favorite !== null) {
    filtered = filtered.filter(item => item.favorite === advancedFilters.value.favorite)
  }

  return filtered
})

const totalPages = computed(() =>
  Math.ceil(filteredMedia.value.length / itemsPerPage.value)
)

const paginatedMedia = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredMedia.value.slice(start, end)
})

// Methods
const fetchMedia = async () => {
  loading.value = true
  try {
    const data = await mediaStore.fetchAllMedia()
    allMedia.value = data
  } catch (error) {
    console.error('Error fetching media:', error)
    notifyError('Failed to load media files')
  } finally {
    loading.value = false
  }
}

const refreshMedia = async () => {
  await fetchMedia()
  notifySuccess('Media library refreshed')
}

const handleFilterChange = debounce((filters) => {
  currentFilters.value = { ...filters }
  currentPage.value = 1 // Reset to first page when filtering
}, 300)

const handleAdvancedFilterChange = debounce((filters) => {
  advancedFilters.value = { ...filters }
  currentPage.value = 1
}, 300)

const resetFilters = () => {
  currentFilters.value = {
    type: '',
    category: '',
    search: '',
    dateRange: null
  }
  advancedFilters.value = {
    size: { min: null, max: null },
    duration: { min: null, max: null },
    tags: [],
    author: '',
    favorite: null
  }
  currentPage.value = 1
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
  // Save preference to localStorage
  localStorage.setItem('mediaViewMode', viewMode.value)
}

const handlePageChange = (page) => {
  currentPage.value = page
  // Scroll to top smoothly
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

const handleMediaSelect = (media) => {
  selectedMedia.value = media
}

const handleMediaDelete = async (media) => {
  $q.dialog({
    title: 'Delete Media',
    message: `Are you sure you want to delete "${media.name}"? This action cannot be undone.`,
    cancel: true,
    persistent: true,
    color: 'negative'
  }).onOk(async () => {
    try {
      await mediaStore.deleteMedia(media.id)
      allMedia.value = allMedia.value.filter(item => item.id !== media.id)
      notifySuccess('Media deleted successfully')
    } catch (error) {
      console.error('Error deleting media:', error)
      notifyError('Failed to delete media')
    }
  })
}

const handleMediaEdit = (media) => {
  selectedMedia.value = media
  showEditDialog.value = true
}

const handleMediaPreview = (media) => {
  selectedMedia.value = media
  showPreviewDialog.value = true
}

const handleMediaUploaded = (newMedia) => {
  if (Array.isArray(newMedia)) {
    allMedia.value.unshift(...newMedia)
  } else {
    allMedia.value.unshift(newMedia)
  }
  notifySuccess(`${Array.isArray(newMedia) ? newMedia.length : 1} file(s) uploaded successfully`)
}

const handleMediaUpdated = (updatedMedia) => {
  const index = allMedia.value.findIndex(item => item.id === updatedMedia.id)
  if (index !== -1) {
    allMedia.value[index] = { ...updatedMedia }
  }
  notifySuccess('Media updated successfully')
}

// Watchers
watch(() => filteredMedia.value.length, (newLength) => {
  // Reset to first page if current page is beyond available pages
  if (currentPage.value > Math.ceil(newLength / itemsPerPage.value)) {
    currentPage.value = 1
  }
})

// Lifecycle
onMounted(async () => {
  // Restore view mode preference
  const savedViewMode = localStorage.getItem('mediaViewMode')
  if (savedViewMode) {
    viewMode.value = savedViewMode
  }

  // Initial data fetch
  await fetchMedia()
})

// Expose methods for parent components
defineExpose({
  refreshMedia,
  resetFilters,
  selectMedia: handleMediaSelect
})
</script>

<style scoped>
.q-page {
  max-width: 1200px;
  margin: 0 auto;
}

.media-stats {
  font-size: 0.875rem;
  color: var(--q-color-grey-6);
}
</style>
