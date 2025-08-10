<template>
  <div class="media-filters">
    <!-- Filter Controls -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3">
        <q-select
          v-model="filters.type"
          :options="mediaTypes"
          label="Type"
          clearable
          emit-value
          map-options
          @update:model-value="handleFilterChange"
          :loading="loading.types"
        >
          <template v-slot:prepend>
            <q-icon name="category" />
          </template>
        </q-select>
      </div>

      <div class="col-12 col-md-3">
        <q-select
          v-model="filters.category"
          :options="categories"
          label="Category"
          clearable
          emit-value
          map-options
          @update:model-value="handleFilterChange"
          :loading="loading.categories"
        >
          <template v-slot:prepend>
            <q-icon name="folder" />
          </template>
        </q-select>
      </div>

      <div class="col-12 col-md-3">
        <q-select
          v-model="filters.creator"
          :options="creators"
          label="Creator"
          clearable
          emit-value
          map-options
          @update:model-value="handleFilterChange"
          :loading="loading.creators"
          use-input
          input-debounce="300"
          @filter="filterCreators"
        >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No creators found
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <div class="col-12 col-md-3 flex items-end">
        <div class="row q-gutter-sm full-width">
          <q-btn
            label="Apply Filters"
            color="primary"
            @click="applyFilters"
            :loading="applying"
            :disable="!hasActiveFilters"
            class="col"
          />
          <q-btn
            icon="clear"
            color="grey"
            flat
            @click="clearAllFilters"
            :disable="!hasActiveFilters"
            class="col-auto"
          >
            <q-tooltip>Clear all filters</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Advanced Filters Toggle -->
    <div class="row q-mb-md">
      <div class="col-12">
        <q-btn
          :label="showAdvanced ? 'Hide Advanced' : 'Show Advanced'"
          :icon="showAdvanced ? 'expand_less' : 'expand_more'"
          flat
          color="primary"
          @click="showAdvanced = !showAdvanced"
          size="sm"
        />
      </div>
    </div>

    <!-- Advanced Filters -->
    <q-slide-transition>
      <div v-show="showAdvanced" class="advanced-filters q-mb-md">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="filters.search"
              label="Search content"
              clearable
              @update:model-value="handleFilterChange"
              debounce="500"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-4">
            <q-select
              v-model="filters.sortBy"
              :options="sortOptions"
              label="Sort by"
              emit-value
              map-options
              @update:model-value="handleFilterChange"
            >
              <template v-slot:prepend>
                <q-icon name="sort" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-4">
            <q-select
              v-model="filters.dateRange"
              :options="dateRangeOptions"
              label="Date Range"
              emit-value
              map-options
              @update:model-value="handleFilterChange"
            >
              <template v-slot:prepend>
                <q-icon name="date_range" />
              </template>
            </q-select>
          </div>
        </div>
      </div>
    </q-slide-transition>

    <!-- Active Filters Display -->
    <div v-if="activeFilterCount > 0" class="active-filters q-mb-md">
      <div class="row items-center">
        <div class="col-auto">
          <span class="text-subtitle2 text-grey-7">Active filters ({{ activeFilterCount }}):</span>
        </div>
        <div class="col">
          <div class="row q-gutter-sm q-ml-sm">
            <q-chip
              v-for="filter in activeFilters"
              :key="filter.key"
              :label="filter.label"
              removable
              color="primary"
              text-color="white"
              @remove="removeFilter(filter.key)"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Filters -->
    <div class="quick-filters q-mb-md">
      <div class="text-subtitle2 text-grey-7 q-mb-sm">Quick filters:</div>
      <div class="row q-gutter-sm">
        <q-btn
          v-for="quick in quickFilters"
          :key="quick.label"
          :label="quick.label"
          :color="isQuickFilterActive(quick) ? 'primary' : 'grey-4'"
          :text-color="isQuickFilterActive(quick) ? 'white' : 'grey-8'"
          size="sm"
          @click="applyQuickFilter(quick)"
          unelevated
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { debounce } from 'quasar'

// Props
const props = defineProps({
  autoApply: {
    type: Boolean,
    default: false
  },
  initialFilters: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['filter', 'filtersChanged'])

// Reactive state
const filters = ref({
  type: null,
  category: null,
  creator: null,
  search: '',
  sortBy: 'newest',
  dateRange: null,
  ...props.initialFilters
})

const showAdvanced = ref(false)
const applying = ref(false)
const loading = ref({
  types: false,
  categories: false,
  creators: false
})

// Data options
const mediaTypes = ref([
  { label: '🎵 Song', value: 'song' },
  { label: '📖 Sermon', value: 'sermon' },
  { label: '🙏 Devotional', value: 'devotional' },
  { label: '📚 Bible Study', value: 'bible_study' },
  { label: '🎥 Video', value: 'video' }
])

const categories = ref([
  { label: '✝️ Faith', value: 'faith' },
  { label: '🎼 Worship', value: 'worship' },
  { label: '👥 Leadership', value: 'leadership' },
  { label: '💕 Relationships', value: 'relationships' },
  { label: '🌟 Discipleship', value: 'discipleship' },
  { label: '🎯 Purpose', value: 'purpose' }
])

const allCreators = ref([
  { label: 'Pastor John Smith', value: 'pastor_john' },
  { label: 'Minister Sarah Johnson', value: 'minister_sarah' },
  { label: 'Worship Team Alpha', value: 'worship_alpha' },
  { label: 'Youth Pastor Mike', value: 'youth_mike' },
  { label: 'Elder Mary Williams', value: 'elder_mary' }
])

const creators = ref([...allCreators.value])

const sortOptions = ref([
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'A-Z', value: 'alphabetical' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Most Viewed', value: 'views' }
])

const dateRangeOptions = ref([
  { label: 'Last 7 days', value: '7days' },
  { label: 'Last 30 days', value: '30days' },
  { label: 'Last 3 months', value: '3months' },
  { label: 'Last year', value: '1year' },
  { label: 'All time', value: 'all' }
])

const quickFilters = ref([
  { label: 'Recent Songs', filters: { type: 'song', dateRange: '30days' } },
  { label: 'Sunday Sermons', filters: { type: 'sermon', category: 'worship' } },
  { label: 'Daily Devotionals', filters: { type: 'devotional' } },
  { label: 'Leadership Content', filters: { category: 'leadership' } }
])

// Computed properties
const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value =>
    value !== null && value !== '' && value !== undefined
  )
})

const activeFilterCount = computed(() => {
  return Object.values(filters.value).filter(value =>
    value !== null && value !== '' && value !== undefined
  ).length
})

const activeFilters = computed(() => {
  const active = []

  if (filters.value.type) {
    const typeLabel = mediaTypes.value.find(t => t.value === filters.value.type)?.label || filters.value.type
    active.push({ key: 'type', label: `Type: ${typeLabel}` })
  }

  if (filters.value.category) {
    const categoryLabel = categories.value.find(c => c.value === filters.value.category)?.label || filters.value.category
    active.push({ key: 'category', label: `Category: ${categoryLabel}` })
  }

  if (filters.value.creator) {
    const creatorLabel = allCreators.value.find(c => c.value === filters.value.creator)?.label || filters.value.creator
    active.push({ key: 'creator', label: `Creator: ${creatorLabel}` })
  }

  if (filters.value.search) {
    active.push({ key: 'search', label: `Search: "${filters.value.search}"` })
  }

  if (filters.value.dateRange && filters.value.dateRange !== 'all') {
    const dateLabel = dateRangeOptions.value.find(d => d.value === filters.value.dateRange)?.label || filters.value.dateRange
    active.push({ key: 'dateRange', label: dateLabel })
  }

  return active
})

// Methods
const handleFilterChange = debounce(() => {
  emit('filtersChanged', { ...filters.value })

  if (props.autoApply) {
    applyFilters()
  }
}, 300)

const applyFilters = async () => {
  applying.value = true

  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    emit('filter', { ...filters.value })
  } finally {
    applying.value = false
  }
}

const clearAllFilters = () => {
  filters.value = {
    type: null,
    category: null,
    creator: null,
    search: '',
    sortBy: 'newest',
    dateRange: null
  }

  handleFilterChange()
}

const removeFilter = (filterKey) => {
  if (filterKey === 'search') {
    filters.value[filterKey] = ''
  } else {
    filters.value[filterKey] = null
  }

  handleFilterChange()
}

const filterCreators = (val, update) => {
  update(() => {
    if (val === '') {
      creators.value = allCreators.value
    } else {
      const needle = val.toLowerCase()
      creators.value = allCreators.value.filter(creator =>
        creator.label.toLowerCase().indexOf(needle) > -1
      )
    }
  })
}

const isQuickFilterActive = (quickFilter) => {
  return Object.entries(quickFilter.filters).every(([key, value]) =>
    filters.value[key] === value
  )
}

const applyQuickFilter = (quickFilter) => {
  if (isQuickFilterActive(quickFilter)) {
    // If already active, clear the filters
    Object.keys(quickFilter.filters).forEach(key => {
      if (key === 'search') {
        filters.value[key] = ''
      } else {
        filters.value[key] = null
      }
    })
  } else {
    // Apply the quick filter
    Object.assign(filters.value, quickFilter.filters)
  }

  handleFilterChange()
}

// Watchers
watch(filters, (newFilters) => {
  // You can add persistence logic here
  // localStorage.setItem('mediaFilters', JSON.stringify(newFilters))
}, { deep: true })

// Lifecycle
onMounted(async () => {
  // Load saved filters from localStorage
  // const saved = localStorage.getItem('mediaFilters')
  // if (saved) {
  //   Object.assign(filters.value, JSON.parse(saved))
  // }

  // TODO: Load dynamic data from Supabase
  await loadDynamicData()
})

const loadDynamicData = async () => {
  // TODO: Replace with actual Supabase queries
  /*
  loading.value.creators = true
  try {
    const { data: creatorsData } = await supabase
      .from('creators')
      .select('id, name')
      .order('name')

    allCreators.value = creatorsData.map(creator => ({
      label: creator.name,
      value: creator.id
    }))

    creators.value = [...allCreators.value]
  } catch (error) {
    console.error('Error loading creators:', error)
  } finally {
    loading.value.creators = false
  }
  */
}
</script>

<style scoped>
.media-filters {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.advanced-filters {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 16px;
  border-left: 4px solid var(--q-primary);
}

.active-filters {
  background: #e3f2fd;
  border-radius: 6px;
  padding: 12px;
}

.quick-filters {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
}

@media (max-width: 768px) {
  .media-filters {
    padding: 16px;
  }

  .row.q-gutter-sm .q-btn {
    margin-bottom: 8px;
  }
}
</style>
