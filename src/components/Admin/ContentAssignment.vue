<template>
  <q-step
    :name="stepName"
    :title="stepTitle"
    :caption="stepCaption"
    :icon="stepIcon"
    :done="isDone"
    :header-nav="headerNav"
    :disable="disable"
  >
    <div class="q-pa-md">
      <!-- Topic Info Header -->
      <div class="q-mb-lg">
        <div class="text-h6 q-mb-xs">{{ topic.title }}</div>
        <div class="text-subtitle2 text-grey-7 q-mb-xs">{{ topic.description || 'Assign content to this topic' }}</div>
        <q-separator class="q-mt-md" />
      </div>

      <!-- Enhanced Filters Section -->
      <div class="row q-gutter-md items-end q-mb-md">
        <div class="col-md-3 col-xs-12">
          <q-select
            v-model="filterType"
            :options="typeOptionsWithCounts"
            label="Filter by Type"
            dense
            clearable
            emit-value
            map-options
            @update:model-value="applyFilters"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :label="scope.opt.count" color="grey-5" />
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <div class="col-md-4 col-xs-12">
          <q-input
            v-model="search"
            label="Search Title"
            dense
            clearable
            @update:model-value="onSearchChange"
            debounce="300"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div class="col-md-2 col-xs-12">
          <q-btn
            dense
            label="Refresh"
            icon="refresh"
            @click="fetchContents"
            :loading="loading"
            outline
          />
        </div>

        <div class="col-md-3 col-xs-12 text-right">
          <q-chip
            v-if="totalItems > 0"
            :label="`${filteredContents.length} of ${totalItems} items`"
            color="grey-3"
            text-color="grey-8"
            size="sm"
          />
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row q-gutter-sm q-mb-md" v-if="filteredContents.length > 0">
        <q-btn
          size="sm"
          dense
          outline
          label="Select All"
          @click="selectAll"
          :disable="selected.length === filteredContents.length"
        />
        <q-btn
          size="sm"
          dense
          outline
          label="Clear Selection"
          @click="clearSelection"
          :disable="selected.length === 0"
        />
        <q-btn
          size="sm"
          dense
          outline
          label="Select by Type"
          @click="showTypeSelector = true"
          v-if="typeOptionsWithCounts.length > 1"
        />
      </div>

      <!-- Enhanced Table -->
      <q-table
        :rows="filteredContents"
        :columns="enhancedColumns"
        row-key="id"
        selection="multiple"
        v-model:selected="selected"
        flat
        bordered
        :loading="loading"
        dense
        :pagination="{ rowsPerPage: 50 }"
        :no-data-label="noDataMessage"
        class="content-table"
      >
        <template v-slot:top-right>
          <div class="text-body2 text-grey-7">
            <q-icon name="check_circle" class="q-mr-xs" />
            {{ selected.length }} selected
          </div>
        </template>

        <template v-slot:body-cell-type="props">
          <q-td :props="props">
            <q-chip
              :label="props.value"
              :color="getTypeColor(props.value)"
              text-color="white"
              size="sm"
              :icon="getTypeIcon(props.value)"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-chip
              :label="props.value || 'Available'"
              :color="props.value === 'assigned' ? 'orange' : 'green'"
              text-color="white"
              size="sm"
              :icon="props.value === 'assigned' ? 'assignment' : 'check_circle'"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              dense
              round
              flat
              size="sm"
              :icon="isSelected(props.row) ? 'remove' : 'add'"
              :color="isSelected(props.row) ? 'negative' : 'primary'"
              @click="toggleSelection(props.row)"
            />
          </q-td>
        </template>
      </q-table>

      <!-- Selection Summary -->
      <div class="q-mt-md q-pa-sm bg-grey-1 rounded-borders" v-if="selected.length > 0">
        <div class="text-body2 text-grey-8">
          <q-icon name="assignment" class="q-mr-xs" />
          Ready to assign {{ selected.length }} item{{ selected.length > 1 ? 's' : '' }} to "{{ topic.title }}"
        </div>
      </div>

      <!-- Step Navigation Actions -->
      <div class="row justify-between q-mt-lg">
        <q-btn
          flat
          color="primary"
          @click="$emit('back')"
          label="Back"
          icon="chevron_left"
          v-if="!hideBackButton"
        />

        <div class="q-gutter-sm">
          <q-btn
            flat
            label="Skip"
            @click="skip"
            v-if="allowSkip"
          />
          <q-btn
            unelevated
            :label="nextButtonLabel"
            color="primary"
            :disable="selected.length === 0 && !allowSkip"
            :loading="assigning"
            @click="handleNext"
            :icon="nextButtonIcon"
          />
        </div>
      </div>
    </div>

    <!-- Type Selector Dialog -->
    <q-dialog v-model="showTypeSelector">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Select by Type</div>
        </q-card-section>
        <q-card-section>
          <q-option-group
            v-model="selectedTypes"
            :options="typeOptionsForSelection"
            color="primary"
            type="checkbox"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            flat
            label="Select"
            color="primary"
            @click="selectByTypes"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-step>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  // Step props
  stepName: { type: [String, Number], required: true },
  stepTitle: { type: String, default: 'Assign Content' },
  stepCaption: { type: String, default: 'Select content to assign to topic' },
  stepIcon: { type: String, default: 'assignment' },
  headerNav: { type: Boolean, default: true },
  disable: { type: Boolean, default: false },

  // Component props
  topic: { type: Object, required: true },
  excludeAssigned: { type: Boolean, default: false },
  apiEndpoint: { type: String, default: '/api/contents' },

  // Navigation props
  hideBackButton: { type: Boolean, default: false },
  allowSkip: { type: Boolean, default: false },
  nextButtonLabel: { type: String, default: 'Assign & Continue' },
  nextButtonIcon: { type: String, default: 'assignment' },

  // Auto-load
  autoLoad: { type: Boolean, default: true }
})

const emit = defineEmits(['next', 'back', 'assigned', 'error', 'skip'])

// Reactive state
const filterType = ref(null)
const search = ref('')
const loading = ref(false)
const assigning = ref(false)
const contents = ref([])
const selected = ref([])
const showTypeSelector = ref(false)
const selectedTypes = ref([])
const totalItems = ref(0)

// Step completion state
const isDone = computed(() => selected.value.length > 0)

// Type configuration with enhanced metadata
const typeConfig = {
  video: { color: 'red', icon: 'play_circle', label: 'Video' },
  article: { color: 'blue', icon: 'article', label: 'Article' },
  music: { color: 'purple', icon: 'music_note', label: 'Music' },
  quote: { color: 'orange', icon: 'format_quote', label: 'Quote' },
  event: { color: 'green', icon: 'event', label: 'Event' },
  podcast: { color: 'indigo', icon: 'podcast', label: 'Podcast' },
  book: { color: 'brown', icon: 'book', label: 'Book' }
}

// Enhanced computed properties
const typeOptionsWithCounts = computed(() => {
  const counts = {}
  contents.value.forEach(content => {
    counts[content.type] = (counts[content.type] || 0) + 1
  })

  return Object.keys(typeConfig)
    .filter(type => counts[type] > 0)
    .map(type => ({
      label: typeConfig[type].label,
      value: type,
      count: counts[type] || 0
    }))
})

const typeOptionsForSelection = computed(() => {
  return typeOptionsWithCounts.value.map(opt => ({
    label: `${opt.label} (${opt.count})`,
    value: opt.value
  }))
})

const filteredContents = computed(() => {
  let filtered = [...contents.value]

  if (filterType.value) {
    filtered = filtered.filter(c => c.type === filterType.value)
  }

  if (search.value.trim()) {
    const searchTerm = search.value.toLowerCase().trim()
    filtered = filtered.filter(c =>
      c.title.toLowerCase().includes(searchTerm) ||
      (c.description && c.description.toLowerCase().includes(searchTerm)) ||
      (c.author && c.author.toLowerCase().includes(searchTerm))
    )
  }

  if (props.excludeAssigned) {
    filtered = filtered.filter(c => c.status !== 'assigned')
  }

  return filtered
})

const noDataMessage = computed(() => {
  if (loading.value) return 'Loading...'
  if (contents.value.length === 0) return 'No content available'
  if (search.value || filterType.value) return 'No content matches your filters'
  return 'No data available'
})

// Enhanced columns
const enhancedColumns = [
  {
    name: 'title',
    label: 'Title',
    field: 'title',
    align: 'left',
    sortable: true,
    style: 'max-width: 300px',
    classes: 'ellipsis'
  },
  {
    name: 'type',
    label: 'Type',
    field: 'type',
    align: 'center',
    sortable: true
  },
  {
    name: 'author',
    label: 'Author',
    field: 'author',
    align: 'left',
    sortable: true
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center'
  },
  {
    name: 'actions',
    label: 'Action',
    field: '',
    align: 'center'
  }
]

// Enhanced methods
async function fetchContents() {
  loading.value = true
  try {
    // Replace with actual API call
    // const response = await fetch(`${props.apiEndpoint}?topicId=${props.topic.id}`)
    // const data = await response.json()

    // Mock data with enhanced properties
    const mockData = [
      {
        id: 1,
        title: 'Faith in Hard Times: A Journey Through Adversity',
        type: 'video',
        author: 'John Smith',
        description: 'An inspiring video about maintaining faith during difficult times',
        status: 'available',
        duration: '15:30',
        createdAt: '2024-01-15'
      },
      {
        id: 2,
        title: 'Trust and Trials: Biblical Perspectives',
        type: 'article',
        author: 'Mary Johnson',
        description: 'Deep theological insights on trust during trials',
        status: 'assigned',
        readTime: '8 min',
        createdAt: '2024-01-10'
      },
      {
        id: 3,
        title: 'Praise Playlist: Uplifting Worship Songs',
        type: 'music',
        author: 'Various Artists',
        description: 'A collection of contemporary worship music',
        status: 'available',
        duration: '45:00',
        createdAt: '2024-01-20'
      },
      {
        id: 4,
        title: 'Hope Anchors the Soul',
        type: 'quote',
        author: 'Hebrews 6:19',
        description: 'Biblical quote about hope and steadfastness',
        status: 'available',
        createdAt: '2024-01-12'
      },
      {
        id: 5,
        title: 'Community Prayer Night',
        type: 'event',
        author: 'Church Community',
        description: 'Weekly community gathering for prayer and fellowship',
        status: 'available',
        eventDate: '2024-02-01',
        createdAt: '2024-01-18'
      }
    ]

    contents.value = mockData
    totalItems.value = mockData.length
    applyFilters()

  } catch (error) {
    console.error('Error fetching contents:', error)
    emit('error', { message: 'Failed to load content', error })
    $q.notify({
      type: 'negative',
      message: 'Failed to load content. Please try again.',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

async function handleNext() {
  if (selected.value.length > 0) {
    await assign()
  } else if (props.allowSkip) {
    skip()
  }
}

function skip() {
  emit('skip', {
    stepName: props.stepName,
    topicId: props.topic.id
  })
  emit('next')
}

async function assign() {
  if (selected.value.length === 0) return

  assigning.value = true
  try {
    const contentIds = selected.value.map(item => item.id)
    console.log(`Assigning contents ${contentIds} to topic ${props.topic.id}`)

    // Replace with actual API call
    // await fetch(`/api/topics/${props.topic.id}/assign`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ contentIds })
    // })

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    emit('assigned', {
      stepName: props.stepName,
      topicId: props.topic.id,
      contentIds,
      contents: selected.value
    })

    $q.notify({
      type: 'positive',
      message: `Successfully assigned ${selected.value.length} item${selected.value.length > 1 ? 's' : ''} to "${props.topic.title}"`,
      position: 'top'
    })

    emit('next')

  } catch (error) {
    console.error('Error assigning contents:', error)
    emit('error', { message: 'Failed to assign content', error })
    $q.notify({
      type: 'negative',
      message: 'Failed to assign content. Please try again.',
      position: 'top'
    })
  } finally {
    assigning.value = false
  }
}

// Utility functions
function getTypeColor(type) {
  return typeConfig[type]?.color || 'grey'
}

function getTypeIcon(type) {
  return typeConfig[type]?.icon || 'help'
}

function isSelected(row) {
  return selected.value.some(item => item.id === row.id)
}

function toggleSelection(row) {
  const index = selected.value.findIndex(item => item.id === row.id)
  if (index > -1) {
    selected.value.splice(index, 1)
  } else {
    selected.value.push(row)
  }
}

function selectAll() {
  selected.value = [...filteredContents.value]
}

function clearSelection() {
  selected.value = []
}

function selectByTypes() {
  const itemsToSelect = filteredContents.value.filter(content =>
    selectedTypes.value.includes(content.type)
  )
  selected.value = [...selected.value, ...itemsToSelect.filter(item =>
    !selected.value.some(selected => selected.id === item.id)
  )]
}

function applyFilters() {
  // Filters are applied through computed property
  // This function can be used for additional filter logic if needed
}

function onSearchChange() {
  // Debounced search is handled by the input component
  // This function can be used for additional search logic if needed
}

// Expose methods for parent component
defineExpose({
  fetchContents,
  clearSelection,
  selectAll,
  getSelected: () => selected.value
})

// Initialize
onMounted(() => {
  if (props.autoLoad) {
    nextTick(() => {
      fetchContents()
    })
  }
})
</script>

<style scoped>
.content-table {
  max-height: 400px;
}

.content-table .q-table__middle {
  max-height: 350px;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
