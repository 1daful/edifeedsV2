<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import bibleStructure from "../../public/bible.json";

const props = defineProps({
  placeholder: { type: Object, default: () => ({ book: 'Select a book...', chapter: 'Select a chapter...', verses: 'Select verses...' }) },
  maxSelections: { type: Number, default: null },
  allowRangeSelection: { type: Boolean, default: true },
  showPreview: { type: Boolean, default: true },
  dense: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  initialSelection: { type: Array, default: () => [] }
});

const emit = defineEmits(['selection-change']);
const modelValue = defineModel();

// Bible translations available via Bible API
const bibleTranslations = ref([
  { label: 'King James Version (KJV)', value: 'kjv', id: 'de4e12af7f28f599-02' },
  { label: 'New International Version (NIV)', value: 'niv', id: '71c6eab17ae5b667-01' },
  { label: 'English Standard Version (ESV)', value: 'esv', id: '59dcc2ca707d4bec-01' },
  { label: 'New American Standard Bible (NASB)', value: 'nasb', id: '65eec8e0b60e656b-01' },
  { label: 'New Revised Standard Version (NRSV)', value: 'nrsv', id: '40072c4a5aba4022-01' },
  { label: 'Christian Standard Bible (CSB)', value: 'csb', id: '685d1470fe4d5c3b-01' },
  { label: 'New Living Translation (NLT)', value: 'nlt', id: '71c6eab17ae5b667-04' }
]);

const selectedTranslation = ref('kjv');
const quotations = ref({});
const loadingQuotations = ref(false);
const quotationError = ref(null);
const showQuotations = ref(false);

const allBooksData = computed(() => {
  const allBooks = [...bibleStructure.bible.old_testament, ...bibleStructure.bible.new_testament];
  return allBooks.reduce((acc, book) => {
    acc[book.book] = book;
    acc[book.abbreviation] = book;
    return acc;
  }, {});
});

const newSelectionBook = ref(null);
const newSelectionChapter = ref(null);
const newSelectionVerses = ref([]);
const selections = ref([]);
const showRangeInput = ref(false);
const rangeStart = ref(null);
const rangeEnd = ref(null);
const error = ref(null);

const books = computed(() => {
  return [...bibleStructure.bible.old_testament, ...bibleStructure.bible.new_testament]
    .map(book => ({ label: book.book, value: book.book }))
    .sort((a, b) => a.label.localeCompare(b.label));
});

const chapters = computed(() => {
  if (!newSelectionBook.value) return [];
  const bookData = allBooksData.value[newSelectionBook.value];
  if (!bookData) return [];
  return Array.from({ length: bookData.chapters }, (_, index) => ({ label: `Chapter ${index + 1}`, value: index + 1 }));
});

const verses = computed(() => {
  if (!newSelectionBook.value || !newSelectionChapter.value) return [];
  const bookData = allBooksData.value[newSelectionBook.value];
  const verseCount = bookData?.verses_per_chapter[newSelectionChapter.value - 1];
  if (!verseCount) return [];
  return Array.from({ length: verseCount }, (_, i) => ({ label: `Verse ${i + 1}`, value: i + 1 }));
});

const formattedSelections = computed(() => {
  const formatted = [];
  selections.value.forEach(sel => {
    const sortedVerses = [...sel.verses].sort((a, b) => a - b);
    let start = sortedVerses[0], end = start;
    if (!start) return;

    for (let i = 1; i < sortedVerses.length; i++) {
      if (sortedVerses[i] === end + 1) {
        end = sortedVerses[i];
      } else {
        formatted.push(start === end ? `${sel.book} ${sel.chapter}:${start}` : `${sel.book} ${sel.chapter}:${start}-${end}`);
        start = sortedVerses[i];
        end = start;
      }
    }
    formatted.push(start === end ? `${sel.book} ${sel.chapter}:${start}` : `${sel.book} ${sel.chapter}:${start}-${end}`);
  });
  return formatted;
});

const selectionSummary = computed(() => {
  const verseCount = selections.value.reduce((total, sel) => total + sel.verses.length, 0);
  if (verseCount === 0) return 'No verses selected';
  return `${verseCount} verse${verseCount === 1 ? '' : 's'} selected`;
});

// Bible API functions
const getBookAbbreviation = (bookName) => {
  const bookData = allBooksData.value[bookName];
  return bookData?.abbreviation?.toUpperCase() || bookName.toUpperCase();
};

const fetchBibleQuotation = async (book, chapter, verses) => {
  const translation = bibleTranslations.value.find(t => t.value === selectedTranslation.value);
  if (!translation) return null;

  const bookAbbr = getBookAbbreviation(book);
  const verseRanges = [];

  // Group consecutive verses into ranges
  const sortedVerses = [...verses].sort((a, b) => a - b);
  let start = sortedVerses[0], end = start;

  for (let i = 1; i < sortedVerses.length; i++) {
    if (sortedVerses[i] === end + 1) {
      end = sortedVerses[i];
    } else {
      verseRanges.push(start === end ? `${start}` : `${start}-${end}`);
      start = sortedVerses[i];
      end = start;
    }
  }
  verseRanges.push(start === end ? `${start}` : `${start}-${end}`);

  try {
    const promises = verseRanges.map(async (range) => {
      const reference = `${bookAbbr}.${chapter}.${range}`;
      const response = await fetch(`https://bible-api.com/${book}%20${chapter}:${verses.join(',')}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${reference}`);
      }

      const data = await response.json();
      const fullText = data.verses.map(verse => verse.text).join(' ');
      return {
        reference: `${book} ${chapter}:${range}`,
        content: fullText
      };
    });

    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Error fetching Bible quotation:', error);
    throw error;
  }
};

const loadAllQuotations = async () => {
  if (selections.value.length === 0) return;

  loadingQuotations.value = true;
  quotationError.value = null;
  quotations.value = {};

  try {
    for (const selection of selections.value) {
      const key = `${selection.book}-${selection.chapter}-${selection.verses.join(',')}`;
      const quotationData = await fetchBibleQuotation(selection.book, selection.chapter, selection.verses);
      quotations.value[key] = quotationData;
    }
  } catch (error) {
    quotationError.value = 'Failed to load Bible quotations. Please check your API key and try again.';
  } finally {
    loadingQuotations.value = false;
  }
};

const getQuotationKey = (selection) => {
  return `${selection.book}-${selection.chapter}-${selection.verses.join(',')}`;
};

const addSelection = () => {
  if (!newSelectionBook.value || !newSelectionChapter.value || !newSelectionVerses.value.length) {
    error.value = 'Please select a book, chapter, and at least one verse.';
    return;
  }
  const newReference = {
    book: newSelectionBook.value,
    chapter: newSelectionChapter.value,
    verses: newSelectionVerses.value.sort((a, b) => a - b)
  };
  selections.value.push(newReference);
  clearNewSelection();
  error.value = null;
};

const selectVerseRange = () => {
  if (!rangeStart.value || !rangeEnd.value) return;
  const min = Math.min(rangeStart.value, rangeEnd.value);
  const max = Math.max(rangeStart.value, rangeEnd.value);
  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const combinedVerses = [...new Set([...(newSelectionVerses.value || []), ...range])];
  newSelectionVerses.value = combinedVerses.sort((a, b) => a - b);
  rangeStart.value = null;
  rangeEnd.value = null;
  showRangeInput.value = false;
};

const clearNewSelection = () => {
  newSelectionBook.value = null;
  newSelectionChapter.value = null;
  newSelectionVerses.value = [];
  showRangeInput.value = false;
  rangeStart.value = null;
  rangeEnd.value = null;
};

const selectAllVerses = () => {
  if (newSelectionChapter.value) {
    newSelectionVerses.value = verses.value.map(v => v.value);
  }
};

const removeSelection = (index) => {
  selections.value.splice(index, 1);
  // Clear quotations when selections change
  quotations.value = {};
};

const clearAllSelections = () => {
  selections.value = [];
  clearNewSelection();
  quotations.value = {};
  showQuotations.value = false;
};

watch([newSelectionBook, newSelectionChapter], () => {
  if (newSelectionBook.value === null) {
    newSelectionChapter.value = null;
    newSelectionVerses.value = [];
  } else if (newSelectionChapter.value === null) {
    newSelectionVerses.value = [];
  }
});

watch(selections, (newSelections) => {
  emit('selection-change', newSelections);
  modelValue.value = formattedSelections.value;
  // Clear quotations when selections change
  if (quotations.value && Object.keys(quotations.value).length > 0) {
    quotations.value = {};
  }
}, { deep: true });

watch(selectedTranslation, () => {
  // Clear quotations when translation changes
  quotations.value = {};
});

onMounted(() => {
  if (props.initialSelection && Array.isArray(props.initialSelection)) {
    selections.value = props.initialSelection;
  }
});
</script>

<template>
  <div class="scripture-selector q-pa-md">
    <div class="q-gutter-md">
      <!-- Translation Selection -->
      <q-card flat bordered class="q-pa-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">Bible Translation</div>
          <q-select
            v-model="selectedTranslation"
            :options="bibleTranslations"
            label="Choose Translation"
            emit-value
            map-options
            :dense="dense"
          />
        </q-card-section>
      </q-card>

      <!-- New Reference Selection -->
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
                    class="col"
                  />
                  <q-btn flat icon="select_all" @click="selectAllVerses" :disable="readonly" round>
                    <q-tooltip>Select all verses</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="allowRangeSelection"
                    flat
                    :icon="showRangeInput ? 'remove' : 'add'"
                    @click="showRangeInput = !showRangeInput"
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
        <template #avatar> <q-icon name="error" /></template>
        {{ error }}
        <template #action> <q-btn flat label="Dismiss" @click="error = null" /></template>
      </q-banner>

      <!-- Current Selections -->
      <q-card v-if="showPreview" flat bordered class="q-mt-md">
        <q-card-section class="q-pa-md">
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-h6">Current Selections</div>
            <q-btn
              v-if="selections.length > 0"
              color="primary"
              :label="showQuotations ? 'Hide Text' : 'Show Text'"
              :icon="showQuotations ? 'visibility_off' : 'menu_book'"
              @click="showQuotations ? showQuotations = false : (showQuotations = true, loadAllQuotations())"
              :loading="loadingQuotations"
              flat
            />
          </div>
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
          <div v-else class="text-body2 text-grey-6">No verses selected.</div>
          <div class="text-caption text-grey-6 q-mt-sm">{{ selectionSummary }}</div>
        </q-card-section>
      </q-card>

      <!-- Bible Quotations -->
      <q-card v-if="showQuotations && selections.length > 0" flat bordered class="q-mt-md">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            Bible Text ({{ bibleTranslations.find(t => t.value === selectedTranslation)?.label }})
          </div>

          <q-banner v-if="quotationError" class="text-white bg-negative q-mb-md" rounded>
            <template #avatar> <q-icon name="error" /></template>
            {{ quotationError }}
            <template #action>
              <q-btn flat label="Retry" @click="loadAllQuotations" />
              <q-btn flat label="Dismiss" @click="quotationError = null" />
            </template>
          </q-banner>

          <div v-if="loadingQuotations" class="text-center q-py-lg">
            <q-spinner-dots size="40px" color="primary" />
            <div class="q-mt-sm text-grey-6">Loading Bible text...</div>
          </div>

          <div v-else-if="Object.keys(quotations).length > 0" class="q-gutter-md">
            <div
              v-for="(selection, index) in selections"
              :key="index"
              class="quotation-section"
            >
              <div class="text-h6 text-primary q-mb-sm">
                {{ formattedSelections[index] }}
              </div>
              <div
                v-if="quotations[getQuotationKey(selection)]"
                class="quotation-content q-pa-md bg-grey-1 rounded-borders"
              >
                <div
                  v-for="(passage, pIndex) in quotations[getQuotationKey(selection)]"
                  :key="pIndex"
                  class="q-mb-sm"
                  v-html="passage.content"
                />
              </div>
              <div v-else class="text-grey-6 q-pa-md bg-grey-1 rounded-borders">
                Failed to load quotation for this reference.
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Action Buttons -->
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

.quotation-section {
  border-left: 4px solid var(--q-primary);
  padding-left: 16px;
  margin-bottom: 24px;
}

.quotation-content {
  font-family: 'Georgia', serif;
  line-height: 1.6;
  font-size: 16px;
}

.quotation-content :deep(sup) {
  font-size: 0.75em;
  color: var(--q-primary);
  font-weight: bold;
}
</style>
