<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { bibleData } from '../utils/sampleData'
import bibleStructure from "../../public/bible.json";

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
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'selection-change'])
const modelValue = defineModel()

// State for creating a new reference
const newSelectionBook = ref(null)
const newSelectionChapter = ref(null)
const newSelectionVerses = ref([])

// State for the list of all selections
const selections = ref([])

// State for range selection
const showRangeInput = ref(false)
const rangeStart = ref(null)
const rangeEnd = ref(null)
const error = ref(null)

// Computed properties
/*const books = computed(() =>
  Object.keys(bibleData)
    .sort()
    .map(book => ({
      label: book,
      value: book,
      chaptersCount: Object.keys(bibleData[book].chapters).length
    }))
)*/

const books = computed(() => {
  let books = []
  const bibleStruct = {};
  [...bibleStructure.bible.old_testament, ...bibleStructure.bible.new_testament].forEach(book => {
    bibleStruct[book.book] = {
      label: book.book,
      value: book.abbreviation,
      chaptersCount: book.chapters
    };
  });
  books.push(...Object.values(bibleStruct).sort((a, b) => a.label.localeCompare(b.label)));
 return books
})

const chapters = computed(() => {
  if (!newSelectionBook.value) return []
  return Object.keys(bibleData[newSelectionBook.value].chapters)
    .map(num => ({
      label: `Chapter ${num}`,
      value: Number(num),
      versesCount: bibleData[newSelectionBook.value].chapters[num]
    }))
    .sort((a, b) => a.value - b.value)
})

const verses = computed(() => {
  if (!newSelectionBook.value || !newSelectionChapter.value) return []
  const count = bibleData[newSelectionBook.value].chapters[newSelectionChapter.value]
  return Array.from({ length: count }, (_, i) => ({
    label: `Verse ${i + 1}`,
    value: i + 1
  }))
})

// Combined formatted list for display
const formattedSelections = computed(() => {
  if (selections.value.length === 0) return []

  const formatted = []
  selections.value.forEach(sel => {
    const sortedVerses = [...sel.verses].sort((a, b) => a - b)
    const ranges = []
    let start = sortedVerses[0]
    let end = start

    for (let i = 1; i < sortedVerses.length; i++) {
      if (sortedVerses[i] === end + 1) {
        end = sortedVerses[i]
      } else {
        ranges.push(start === end ? `${sel.book} ${sel.chapter}:${start}` : `${sel.book} ${sel.chapter}:${start}-${end}`)
        start = sortedVerses[i]
        end = start
      }
    }
    if (start !== undefined) {
      ranges.push(start === end ? `${sel.book} ${sel.chapter}:${start}` : `${sel.book} ${sel.chapter}:${start}-${end}`)
    }
    formatted.push(...ranges)
  })

  return formatted
})

const isMaxSelectionsReached = computed(() =>
  props.maxSelections && selections.value.length >= props.maxSelections
)

const selectionSummary = computed(() => {
  const verseCount = selections.value.reduce((total, sel) => total + sel.verses.length, 0)
  if (verseCount === 0) return 'No verses selected'
  if (verseCount === 1) return '1 verse selected'
  return `${verseCount} verses selected`
})

// Methods
const clearNewSelection = () => {
  newSelectionBook.value = null
  newSelectionChapter.value = null
  newSelectionVerses.value = []
  cancelRangeInput()
}

const addSelection = () => {
  if (!newSelectionBook.value || !newSelectionChapter.value || !newSelectionVerses.value.length) {
    error.value = 'Please select a book, chapter, and at least one verse.'
    return
  }

  const newReference = {
    book: newSelectionBook.value,
    chapter: newSelectionChapter.value,
    verses: newSelectionVerses.value.sort((a, b) => a - b)
  }

  selections.value.push(newReference)
  clearNewSelection()
  error.value = null
}

const removeSelection = (index) => {
  selections.value.splice(index, 1)
}

const clearAllSelections = () => {
  selections.value = []
  clearNewSelection()
}

const toggleRangeInput = () => {
  showRangeInput.value = !showRangeInput.value
  if (!showRangeInput.value) {
    cancelRangeInput()
  }
}

const cancelRangeInput = () => {
  rangeStart.value = null
  rangeEnd.value = null
}

const selectVerseRange = () => {
  if (!rangeStart.value || !rangeEnd.value) return

  const min = Math.min(rangeStart.value, rangeEnd.value)
  const max = Math.max(rangeStart.value, rangeEnd.value)
  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  const currentVerses = newSelectionVerses.value || [];
  const combinedVerses = [...new Set([...currentVerses, ...range])];

  newSelectionVerses.value = combinedVerses.sort((a, b) => a - b)
  cancelRangeInput()
  showRangeInput.value = false
}

// Watchers
watch(newSelectionBook, () => {
  newSelectionChapter.value = null
  newSelectionVerses.value = []
})

watch(newSelectionChapter, () => {
  newSelectionVerses.value = []
})

watch(selections, (newSelections) => {
  emit('selection-change', newSelections)
  modelValue.value = formattedSelections.value
}, { deep: true })

// Lifecycle
onMounted(() => {
  if (props.initialSelection && Array.isArray(props.initialSelection)) {
    selections.value = props.initialSelection
  }
})
</script>

<template>
  <div class="scripture-selector q-pa-md">
    <div class="q-gutter-md">
      <q-card flat bordered class="q-pa-md new-selection-card">
        <q-card-section>
          <div class="text-h6 q-mb-md">Add a New Reference</div>
          <div class="q-gutter-sm">
            <q-select
              v-model="newSelectionBook"
              :options="books"
              :label="placeholder.book"
              :dense="dense"
              :readonly="readonly"
              emit-value
              map-options
              clearable
              use-input
            />
            <q-select
              v-model="newSelectionChapter"
              :options="chapters"
              :label="placeholder.chapter"
              :disable="!newSelectionBook"
              :dense="dense"
              :readonly="readonly"
              emit-value
              map-options
              clearable
            />
            <q-card v-if="newSelectionChapter" flat bordered class="q-pa-sm q-mt-md">
              <q-card-section>
                <div class="row items-center q-gutter-sm">
                  <q-select
                    v-model="newSelectionVerses"
                    :options="verses"
                    :label="placeholder.verses"
                    :disable="!newSelectionChapter || readonly"
                    :dense="dense"
                    multiple
                    use-chips
                    emit-value
                    map-options
                    clearable
                    :max-values="maxSelections"
                    class="col"
                  />
                  <q-btn flat icon="select_all" @click="selectAllVerses" :disable="readonly" round>
                    <q-tooltip>Select all verses</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="allowRangeSelection"
                    flat
                    :icon="showRangeInput ? 'remove' : 'add'"
                    @click="toggleRangeInput"
                    :color="showRangeInput ? 'negative' : ''"
                    :disable="readonly"
                    round
                  >
                    <q-tooltip>{{ showRangeInput ? 'Hide range selection' : 'Add verse range' }}</q-tooltip>
                  </q-btn>
                </div>
              </q-card-section>
              <q-card-section v-if="showRangeInput && allowRangeSelection && !readonly" class="bg-grey-2 q-mt-md q-pa-sm">
                <div class="row q-gutter-sm items-center">
                  <q-select
                    v-model="rangeStart"
                    :options="verses"
                    label="From"
                    :dense="dense"
                    emit-value
                    map-options
                    class="col"
                  />
                  <q-select
                    v-model="rangeEnd"
                    :options="verses"
                    label="To"
                    :dense="dense"
                    emit-value
                    map-options
                    class="col"
                  />
                  <q-btn color="primary" label="Apply" @click="selectVerseRange" :disable="!rangeStart || !rangeEnd" />
                </div>
              </q-card-section>
            </q-card>
            <q-btn
              color="primary"
              label="Add Reference"
              icon="add_circle"
              @click="addSelection"
              :disable="!newSelectionBook || !newSelectionChapter || !newSelectionVerses.length || readonly"
              class="q-mt-md full-width"
            />
          </div>
        </q-card-section>
      </q-card>

      <q-banner v-if="error" class="text-white bg-negative" rounded>
        <template #avatar>
          <q-icon name="error" />
        </template>
        {{ error }}
        <template #action>
          <q-btn flat label="Dismiss" @click="error = null" />
        </template>
      </q-banner>

      <q-card v-if="showPreview" flat bordered class="q-mt-md">
        <q-card-section class="q-pa-md">
          <div class="text-h6 q-mb-sm">Current Selections</div>
          <div v-if="formattedSelections.length > 0">
            <q-chip
              v-for="(selection, index) in formattedSelections"
              :key="index"
              dense
              color="primary"
              text-color="white"
              removable
              @remove="removeSelection(index)"
            >
              {{ selection }}
            </q-chip>
          </div>
          <div v-else class="text-body2 text-grey-6">
            No verses selected.
          </div>
          <div class="text-caption text-grey-6 q-mt-sm">{{ selectionSummary }}</div>
        </q-card-section>
      </q-card>

      <div v-if="!readonly" class="row q-gutter-sm q-mt-md">
        <q-btn
          outline
          color="negative"
          label="Clear All"
          icon="clear_all"
          @click="clearAllSelections"
          :disable="selections.length === 0"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.scripture-selector {
  max-width: 100%;
}
</style>
