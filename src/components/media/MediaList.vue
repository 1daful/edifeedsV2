<template>
  <div class="media-grid-container">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="row q-col-gutter-md">
        <div
          class="col-12 col-sm-6 col-md-4"
          v-for="n in skeletonCount"
          :key="`skeleton-${n}`"
        >
          <q-skeleton-loader />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!items?.length" class="empty-state">
      <q-icon name="image_not_supported" size="4rem" color="grey-5" />
      <h6 class="text-grey-6 q-mt-md q-mb-none">{{ emptyStateText }}</h6>
      <p class="text-grey-5 text-body2">{{ emptyStateSubtext }}</p>
      <q-btn
        v-if="showRetryButton"
        @click="$emit('retry')"
        color="primary"
        outline
        label="Try Again"
        icon="refresh"
      />
    </div>

    <!-- Media Grid -->
    <div v-else class="media-grid" :class="gridClasses">
      <div
        class="row q-col-gutter-md"
        role="grid"
        :aria-label="`${items.length} media items`"
      >
        <div
          class="col-12 col-sm-6 col-md-4"
          :class="columnClasses"
          v-for="(item, index) in paginatedItems"
          :key="item.id || index"
          role="gridcell"
          :aria-posinset="index + 1"
          :aria-setsize="items.length"
        >
          <transition
            appear
            enter-active-class="animated fadeInUp"
            :style="{ 'animation-delay': `${index * 50}ms` }"
          >
            <media-card
              :media="item"
              @click="$emit('item-click', item)"
              @favorite="$emit('item-favorite', item)"
              @share="$emit('item-share', item)"
              :loading="itemsLoading?.includes(item.id)"
              class="full-height"
            />
          </transition>
        </div>
      </div>

      <!-- Load More / Pagination -->
      <div v-if="showPagination" class="pagination-container q-mt-lg">
        <q-btn
          v-if="canLoadMore"
          @click="loadMore"
          :loading="loadingMore"
          color="primary"
          outline
          size="md"
          class="full-width"
        >
          <template v-if="!loadingMore">
            Load More ({{ remainingCount }} remaining)
          </template>
        </q-btn>

        <q-pagination
          v-else-if="totalPages > 1"
          v-model="currentPage"
          :max="totalPages"
          :max-pages="7"
          boundary-numbers
          direction-links
          @update:model-value="onPageChange"
          class="justify-center"
        />
      </div>
    </div>

    <!-- Floating Action Button for Grid View Toggle -->
    <q-page-sticky
      v-if="showViewToggle"
      position="bottom-right"
      :offset="[18, 18]"
    >
      <q-btn
        fab
        :icon="gridMode === 'grid' ? 'list' : 'grid_view'"
        color="primary"
        @click="toggleGridMode"
        :title="`Switch to ${gridMode === 'grid' ? 'list' : 'grid'} view`"
      />
    </q-page-sticky>
  </div>
</template>

<script setup lang="">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import MediaCard from './MediaCard.vue'

// Props with validation and defaults
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
    validator: (items) => Array.isArray(items)
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  itemsLoading: {
    type: Array,
    default: () => []
  },
  skeletonCount: {
    type: Number,
    default: 6
  },
  emptyStateText: {
    type: String,
    default: 'No media found'
  },
  emptyStateSubtext: {
    type: String,
    default: 'Try adjusting your filters or check back later'
  },
  showRetryButton: {
    type: Boolean,
    default: false
  },
  itemsPerPage: {
    type: Number,
    default: 12
  },
  paginationType: {
    type: String,
    default: 'loadmore', // 'loadmore' | 'pagination' | 'infinite'
    validator: (value) => ['loadmore', 'pagination', 'infinite'].includes(value)
  },
  showViewToggle: {
    type: Boolean,
    default: true
  },
  defaultGridMode: {
    type: String,
    default: 'grid', // 'grid' | 'list'
    validator: (value) => ['grid', 'list'].includes(value)
  }
})

// Emits
const emit = defineEmits([
  'item-click',
  'item-favorite',
  'item-share',
  'load-more',
  'page-change',
  'retry',
  'grid-mode-change'
])

// Reactive state
const currentPage = ref(1)
const loadingMore = ref(false)
const gridMode = ref(props.defaultGridMode)

// Computed properties
const totalPages = computed(() =>
  Math.ceil((props.items?.length || 0) / props.itemsPerPage)
)

const paginatedItems = computed(() => {
  if (!props.items?.length) return []

  if (props.paginationType === 'loadmore') {
    return props.items.slice(0, currentPage.value * props.itemsPerPage)
  }

  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return props.items.slice(start, end)
})

const canLoadMore = computed(() =>
  props.paginationType === 'loadmore' &&
  paginatedItems.value.length < props.items.length
)

const remainingCount = computed(() =>
  Math.max(0, props.items.length - paginatedItems.value.length)
)

const showPagination = computed(() =>
  props.items?.length > props.itemsPerPage && !props.isLoading
)

const gridClasses = computed(() => ({
  'media-grid--list': gridMode.value === 'list',
  'media-grid--grid': gridMode.value === 'grid'
}))

const columnClasses = computed(() => {
  if (gridMode.value === 'list') {
    return 'col-12'
  }
  return 'col-12 col-sm-6 col-md-4 col-lg-3'
})

// Methods
const loadMore = async () => {
  if (canLoadMore.value && !loadingMore.value) {
    loadingMore.value = true
    currentPage.value++

    try {
      await emit('load-more', {
        page: currentPage.value,
        offset: paginatedItems.value.length
      })
    } finally {
      loadingMore.value = false
    }
  }
}

const onPageChange = (page) => {
  currentPage.value = page
  emit('page-change', page)

  // Scroll to top of grid
  const gridElement = document.querySelector('.media-grid')
  if (gridElement) {
    gridElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const toggleGridMode = () => {
  gridMode.value = gridMode.value === 'grid' ? 'list' : 'grid'
  emit('grid-mode-change', gridMode.value)

  // Store preference in localStorage
  localStorage.setItem('media-grid-mode', gridMode.value)
}

// Infinite scroll for 'infinite' pagination type
const handleScroll = () => {
  if (props.paginationType !== 'infinite' || !canLoadMore.value) return

  const scrollPosition = window.innerHeight + window.scrollY
  const documentHeight = document.documentElement.offsetHeight

  if (scrollPosition >= documentHeight - 1000) {
    loadMore()
  }
}

// Lifecycle
onMounted(() => {
  // Restore grid mode preference
  const savedGridMode = localStorage.getItem('media-grid-mode')
  if (savedGridMode && ['grid', 'list'].includes(savedGridMode)) {
    gridMode.value = savedGridMode
  }

  // Setup infinite scroll
  if (props.paginationType === 'infinite') {
    window.addEventListener('scroll', handleScroll, { passive: true })
  }
})

// Watch for changes in pagination type
watch(() => props.paginationType, (newType, oldType) => {
  if (oldType === 'infinite') {
    window.removeEventListener('scroll', handleScroll)
  }

  if (newType === 'infinite') {
    window.addEventListener('scroll', handleScroll, { passive: true })
  }

  // Reset pagination state
  currentPage.value = 1
})

// Cleanup
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.media-grid-container {
  position: relative;
}

.loading-container {
  opacity: 0.7;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  min-height: 300px;
}

.media-grid--list .media-card {
  max-width: none;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Animation classes for Quasar transitions */
.animated {
  animation-duration: 0.6s;
  animation-fill-mode: both;
}

.fadeInUp {
  animation-name: fadeInUp;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .media-grid--grid .col-12 {
    /* On mobile, show 2 columns in grid mode */
    width: 50% !important;
    max-width: 50% !important;
  }
}

@media (min-width: 1200px) {
  .media-grid--grid .col-lg-3 {
    width: 25%;
    max-width: 25%;
  }
}
</style>
