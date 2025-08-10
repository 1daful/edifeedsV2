<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { bibleData } from '../utils/sampleData'

// Props and emits
const props = defineProps({
  placeholder: {
    type: Object,
    default: () => ({
      book: 'Select a book...',
      chapter: 'Select a chapter...',
      verses: 'Select verses...'
    })
  },
  maxSelections: {
    type: Number,
    default: null
  },
  allowRangeSelection: {
    type: Boolean,
    default: true
  },
  showPreview: {
    type: Boolean,
    default: true
  },
  dense: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  initialSelection: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'selection-change', 'book-change', 'chapter-change'])
const modelValue = defineModel()

// State
const selectedBook = ref(null)
const selectedChapter = ref(null)
const selectedVerses = ref([])
const rangeStart = ref(null)
const rangeEnd = ref(null)
const isRangeMode = ref(false)
const loading = ref(false)
const error = ref(null)

// Computed properties
const books = computed(() =>
  Object.keys(bibleData)
    .sort()
    .map(book => ({
      label: book,
      value: book,
      chaptersCount: Object.keys(bibleData[book].chapters).length
    }))
)

const chapters = computed(() => {
  if (!selectedBook.value) return []
  return Object.keys(bibleData[selectedBook.value].chapters)
    .map(num => ({
      label: `Chapter ${num}`,
      value: Number(num),
      versesCount: bibleData[selectedBook.value].chapters[num]
    }))
    .sort((a, b) => a.value - b.value)
})

const verses = computed(() => {
  if (!selectedBook.value || !selectedChapter.value) return []
  const count = bibleData[selectedBook.value].chapters[selectedChapter.value]
  return Array.from({ length: count }, (_, i) => ({
    label: `Verse ${i + 1}`,
    value: i + 1
  }))
})

const scriptureSelections = computed(() => {
  if (!selectedBook.value || !selectedChapter.value || !selectedVerses.value.length) return []

  const sortedVerses = [...selectedVerses.value].sort((a, b) => a - b)
  const ranges = []
  let start = sortedVerses[0]
  let end = start

  for (let i = 1; i < sortedVerses.length; i++) {
    if (sortedVerses[i] === end + 1) {
      end = sortedVerses[i]
    } else {
      ranges.push(start === end ? `${selectedBook.value} ${selectedChapter.value}:${start}` :
                  `${selectedBook.value} ${selectedChapter.value}:${start}-${end}`)
      start = sortedVerses[i]
      end = start
    }
  }

  ranges.push(start === end ? `${selectedBook.value} ${selectedChapter.value}:${start}` :
              `${selectedBook.value} ${selectedChapter.value}:${start}-${end}`)

  return ranges
})

const isMaxSelectionsReached = computed(() =>
  props.maxSelections && selectedVerses.value.length >= props.maxSelections
)

const selectionSummary = computed(() => {
  const count = selectedVerses.value.length
  if (count === 0) return 'No verses selected'
  if (count === 1) return '1 verse selected'
  return `${count} verses selected`
})

// Methods
const clearSelection = () => {
  selectedBook.value = null
  selectedChapter.value = null
  selectedVerses.value = []
  rangeStart.value = null
  rangeEnd.value = null
  isRangeMode.value = false
}

const selectVerseRange = (start, end) => {
  if (!start || !end) return
  const min = Math.min(start, end)
  const max = Math.max(start, end)
  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  if (props.maxSelections && range.length > props.maxSelections) {
    error.value = `Cannot select more than ${props.maxSelections} verses`
    return
  }

  selectedVerses.value = range
  rangeStart.value = null
  rangeEnd.value = null
  isRangeMode.value = false
}

const toggleRangeMode = () => {
  isRangeMode.value = !isRangeMode.value
  rangeStart.value = null
  rangeEnd.value = null
  if (!isRangeMode.value) {
    selectedVerses.value = []
  }
}

const selectAllVerses = () => {
  if (!selectedBook.value || !selectedChapter.value) return
  const count = bibleData[selectedBook.value].chapters[selectedChapter.value]
  const allVerses = Array.from({ length: count }, (_, i) => i + 1)

  if (props.maxSelections && allVerses.length > props.maxSelections) {
    error.value = `Cannot select more than ${props.maxSelections} verses`
    return
  }

  selectedVerses.value = allVerses
}

const initializeFromProps = () => {
  if (props.initialSelection) {
    const { book, chapter, verses } = props.initialSelection
    if (book && bibleData[book]) {
      selectedBook.value = book
      if (chapter && bibleData[book].chapters[chapter]) {
        selectedChapter.value = chapter
        if (verses && Array.isArray(verses)) {
          selectedVerses.value = verses.filter(v =>
            v >= 1 && v <= bibleData[book].chapters[chapter]
          )
        }
      }
    }
  }
}

const validateSelection = () => {
  error.value = null

  if (props.maxSelections && selectedVerses.value.length > props.maxSelections) {
    error.value = `Maximum ${props.maxSelections} verses allowed`
    return false
  }

  return true
}

// Watchers
watch(selectedBook, async (newBook, oldBook) => {
  if (newBook !== oldBook) {
    selectedChapter.value = null
    selectedVerses.value = []
    emit('book-change', newBook)
  }
})

watch(selectedChapter, async (newChapter, oldChapter) => {
  if (newChapter !== oldChapter) {
    selectedVerses.value = []
    emit('chapter-change', { book: selectedBook.value, chapter: newChapter })
  }
})

watch(selectedVerses, (newVerses) => {
  if (!validateSelection()) return
  emit('selection-change', {
    book: selectedBook.value,
    chapter: selectedChapter.value,
    verses: newVerses,
    formatted: scriptureSelections.value
  })
})

watch(scriptureSelections, (val) => {
  modelValue.value = val
}, { deep: true })

watch(() => props.initialSelection, () => {
  initializeFromProps()
}, { deep: true })

// Lifecycle
onMounted(() => {
  initializeFromProps()
})
</script>

<template>
  <div class="scripture-selector">
    <div class="q-gutter-md">
      <!-- Book Selection -->
      <q-select
        v-model="selectedBook"
        :options="books"
        :label="placeholder.book"
        :dense="dense"
        :readonly="readonly"
        emit-value
        map-options
        clearable
        use-input
        @filter="(val, update) => update()"
      >
        <template #option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
              <q-item-label caption>{{ scope.opt.chaptersCount }} chapters</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <!-- Chapter Selection -->
      <q-select
        v-model="selectedChapter"
        :options="chapters"
        :label="placeholder.chapter"
        :disable="!selectedBook"
        :dense="dense"
        :readonly="readonly"
        emit-value
        map-options
        clearable
      >
        <template #option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
              <q-item-label caption>{{ scope.opt.versesCount }} verses</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>

      <!-- Verse Selection Controls -->
      <div v-if="selectedChapter" class="verse-controls">
        <div class="row q-gutter-sm items-center">
          <div class="col">
            <q-select
              v-model="selectedVerses"
              :options="verses"
              :label="placeholder.verses"
              :disable="!selectedChapter || readonly"
              :dense="dense"
              multiple
              use-chips
              emit-value
              map-options
              clearable
              :max-values="maxSelections"
            />
          </div>

          <q-btn-group v-if="!readonly" flat>
            <q-btn
              flat
              icon="select_all"
              @click="selectAllVerses"
              :disable="isMaxSelectionsReached"
            >
              <q-tooltip>Select all verses</q-tooltip>
            </q-btn>

            <q-btn
              v-if="allowRangeSelection"
              flat
              :icon="isRangeMode ? 'close' : 'linear_scale'"
              :color="isRangeMode ? 'negative' : 'primary'"
              @click="toggleRangeMode"
            >
              <q-tooltip>{{ isRangeMode ? 'Cancel range' : 'Select range' }}</q-tooltip>
            </q-btn>

            <q-btn
              flat
              icon="clear"
              @click="selectedVerses = []"
              :disable="!selectedVerses.length"
            >
              <q-tooltip>Clear verses</q-tooltip>
            </q-btn>
          </q-btn-group>
        </div>

        <!-- Range Selection Mode -->
        <div v-if="isRangeMode && allowRangeSelection && !readonly" class="range-selection q-mt-md">
          <div class="row q-gutter-md items-center">
            <q-select
              v-model="rangeStart"
              :options="verses"
              label="From verse"
              :dense="dense"
              emit-value
              map-options
              style="min-width: 120px"
            />
            <q-select
              v-model="rangeEnd"
              :options="verses"
              label="To verse"
              :dense="dense"
              emit-value
              map-options
              style="min-width: 120px"
            />
            <q-btn
              color="primary"
              label="Select Range"
              @click="selectVerseRange(rangeStart, rangeEnd)"
              :disable="!rangeStart || !rangeEnd"
            />
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <q-banner v-if="error" class="text-white bg-negative" rounded>
        <template #avatar>
          <q-icon name="error" />
        </template>
        {{ error }}
        <template #action>
          <q-btn flat label="Dismiss" @click="error = null" />
        </template>
      </q-banner>

      <!-- Selection Preview -->
      <div v-if="showPreview && scriptureSelections.length" class="selection-preview">
        <q-card flat bordered>
          <q-card-section class="q-pa-md">
            <div class="text-subtitle2 q-mb-sm">Selected Scripture:</div>
            <div class="text-body2">{{ scriptureSelections.join('; ') }}</div>
            <div class="text-caption text-grey-6 q-mt-sm">{{ selectionSummary }}</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Quick Actions -->
      <div v-if="!readonly" class="row q-gutter-sm">
        <q-btn
          outline
          color="negative"
          label="Clear All"
          icon="clear_all"
          @click="clearSelection"
          :disable="!selectedBook && !selectedChapter && !selectedVerses.length"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.scripture-selector {
  max-width: 100%;
}

.verse-controls {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  background: #fafafa;
}

.range-selection {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  border: 1px dashed #ccc;
}

.selection-preview {
  margin-top: 16px;
}
</style>
