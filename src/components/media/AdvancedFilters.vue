<template>
  <div class="advanced-filters">
    <div class="row q-gutter-md">
      <!-- File Size Range -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle2 q-mb-md">File Size (MB)</div>
          <div class="row q-gutter-sm items-center">
            <div class="col">
              <q-input
                v-model.number="localFilters.size.min"
                type="number"
                outlined
                dense
                label="Min"
                min="0"
                step="0.1"
                @update:model-value="updateFilters"
              />
            </div>
            <div class="text-grey-6">to</div>
            <div class="col">
              <q-input
                v-model.number="localFilters.size.max"
                type="number"
                outlined
                dense
                label="Max"
                min="0"
                step="0.1"
                @update:model-value="updateFilters"
              />
            </div>
          </div>
        </q-card>
      </div>

      <!-- Duration Range (for videos/audio) -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle2 q-mb-md">Duration (seconds)</div>
          <div class="row q-gutter-sm items-center">
            <div class="col">
              <q-input
                v-model.number="localFilters.duration.min"
                type="number"
                outlined
                dense
                label="Min"
                min="0"
                @update:model-value="updateFilters"
              />
            </div>
            <div class="text-grey-6">to</div>
            <div class="col">
              <q-input
                v-model.number="localFilters.duration.max"
                type="number"
                outlined
                dense
                label="Max"
                min="0"
                @update:model-value="updateFilters"
              />
            </div>
          </div>
        </q-card>
      </div>

      <!-- Tags -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle2 q-mb-md">Tags</div>
          <q-select
            v-model="localFilters.tags"
            :options="availableTags"
            multiple
            outlined
            dense
            use-chips
            use-input
            input-debounce="300"
            @new-value="createTag"
            @update:model-value="updateFilters"
            placeholder="Select or type tags"
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No tags found
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card>
      </div>

      <!-- Author/Uploader -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle2 q-mb-md">Author/Uploader</div>
          <q-input
            v-model="localFilters.author"
            outlined
            dense
            placeholder="Enter author name"
            @update:model-value="updateFilters"
          />
        </q-card>
      </div>

      <!-- Favorite Filter -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle2 q-mb-md">Favorites</div>
          <q-option-group
            v-model="localFilters.favorite"
            :options="favoriteOptions"
            color="primary"
            type="radio"
            @update:model-value="updateFilters"
          />
        </q-card>
      </div>

      <!-- Date Created Range -->
      <div class="col-12 col-md-6">
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle2 q-mb-md">Upload Date</div>
          <q-input
            v-model="localFilters.dateCreated"
            outlined
            dense
            readonly
            placeholder="Select date range"
            @click="showDatePicker = true"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer" @click="showDatePicker = true" />
            </template>
          </q-input>
        </q-card>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="row justify-end q-gutter-sm q-mt-md">
      <q-btn
        flat
        color="grey-7"
        label="Clear All"
        @click="clearAllFilters"
      />
      <q-btn
        color="primary"
        label="Apply Filters"
        @click="applyFilters"
        :disable="!hasChanges"
      />
    </div>

    <!-- Date Range Dialog -->
    <q-dialog v-model="showDatePicker">
      <q-date
        v-model="tempDateRange"
        range
        @update:model-value="updateDateRange"
      >
        <div class="row items-center justify-end q-gutter-sm q-pa-sm">
          <q-btn flat label="Cancel" @click="showDatePicker = false" />
          <q-btn flat label="Clear" color="negative" @click="clearDateRange" />
          <q-btn flat label="OK" color="primary" @click="confirmDateRange" />
        </div>
      </q-date>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { date } from 'quasar'

// Props
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({
      size: { min: null, max: null },
      duration: { min: null, max: null },
      tags: [],
      author: '',
      favorite: null,
      dateCreated: null
    })
  }
})

// Emits
const emit = defineEmits(['update:filters', 'change'])

// Reactive data
const localFilters = ref({ ...props.filters })
const showDatePicker = ref(false)
const tempDateRange = ref(null)

// Mock data - replace with real data from your store
const availableTags = ref([
  'nature', 'portrait', 'landscape', 'urban', 'abstract',
  'black-white', 'color', 'vintage', 'modern', 'art',
  'photography', 'design', 'illustration', 'vector'
])

const favoriteOptions = [
  { label: 'All', value: null },
  { label: 'Favorites only', value: true },
  { label: 'Non-favorites only', value: false }
]

// Computed
const hasChanges = computed(() => {
  return JSON.stringify(localFilters.value) !== JSON.stringify(props.filters)
})

const formattedDateRange = computed(() => {
  if (!localFilters.value.dateCreated) return null

  const { from, to } = localFilters.value.dateCreated
  return `${date.formatDate(from, 'MMM DD, YYYY')} - ${date.formatDate(to, 'MMM DD, YYYY')}`
})

// Methods
const updateFilters = () => {
  emit('change', { ...localFilters.value })
}

const applyFilters = () => {
  emit('update:filters', { ...localFilters.value })
}

const clearAllFilters = () => {
  localFilters.value = {
    size: { min: null, max: null },
    duration: { min: null, max: null },
    tags: [],
    author: '',
    favorite: null,
    dateCreated: null
  }
  updateFilters()
  applyFilters()
}

const createTag = (val, done) => {
  if (val.length > 0) {
    if (!availableTags.value.includes(val)) {
      availableTags.value.push(val)
    }
    done(val, 'toggle')
  }
}

const updateDateRange = (newRange) => {
  tempDateRange.value = newRange
}

const confirmDateRange = () => {
  if (tempDateRange.value) {
    if (typeof tempDateRange.value === 'string') {
      // Single date selected
      localFilters.value.dateCreated = {
        from: new Date(tempDateRange.value),
        to: new Date(tempDateRange.value)
      }
    } else if (tempDateRange.value.from && tempDateRange.value.to) {
      // Date range selected
      localFilters.value.dateCreated = {
        from: new Date(tempDateRange.value.from),
        to: new Date(tempDateRange.value.to)
      }
    }
    updateFilters()
  }
  showDatePicker.value = false
}

const clearDateRange = () => {
  tempDateRange.value = null
  localFilters.value.dateCreated = null
  updateFilters()
  showDatePicker.value = false
}

// Watchers
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

// Lifecycle
onMounted(() => {
  // Initialize temp date range if filters already have date
  if (localFilters.value.dateCreated) {
    tempDateRange.value = {
      from: date.formatDate(localFilters.value.dateCreated.from, 'YYYY/MM/DD'),
      to: date.formatDate(localFilters.value.dateCreated.to, 'YYYY/MM/DD')
    }
  }
})
</script>

<style scoped>
.advanced-filters {
  width: 100%;
}

.q-card {
  transition: box-shadow 0.3s ease;
}

.q-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
