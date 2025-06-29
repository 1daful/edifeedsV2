<!-- src/pages/SearchPage.vue -->
<template>
  <q-page class="q-pa-md">
    <!-- Enhanced Search Input with Voice Support -->
    <div class="search-container q-mb-md">
      <q-input
        v-model="searchQuery"
        debounce="400"
        placeholder="Search content..."
        filled
        clearable
        class="search-input"
        @keyup.enter="performSearch"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
        <template v-slot:append>
          <q-btn
            v-if="speechSupported"
            :color="isListening ? 'negative' : 'primary'"
            :icon="isListening ? 'mic_off' : 'mic'"
            flat
            round
            dense
            @click="toggleVoiceSearch"
            :loading="isListening"
          >
            <q-tooltip>{{ isListening ? 'Stop voice search' : 'Voice search' }}</q-tooltip>
          </q-btn>
        </template>
      </q-input>

      <!-- Voice Search Feedback -->
      <div v-if="isListening" class="voice-feedback q-mt-sm">
        <q-banner class="bg-blue-1 text-blue-8">
          <template v-slot:avatar>
            <q-icon name="mic" color="blue" />
          </template>
          Listening... Speak now
          <template v-slot:action>
            <q-btn flat color="blue" label="Cancel" @click="stopVoiceSearch" />
          </template>
        </q-banner>
      </div>
    </div>

    <!-- Filter Buttons with Count -->
    <div class="filter-section q-mb-md">
      <div class="row items-center q-gutter-sm">
        <q-btn-group outline>
          <q-btn
            v-for="filterOption in filterOptions"
            :key="filterOption.value"
            :flat="filter !== filterOption.value"
            :label="`${filterOption.label} (${getFilterCount(filterOption.value)})`"
            @click="setFilter(filterOption.value)"
          />
        </q-btn-group>

        <!-- Sort Options -->
        <q-separator vertical />
        <q-select
          v-model="sortBy"
          :options="sortOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          outlined
          dense
          label="Sort by"
          class="sort-select"
          style="min-width: 120px"
        />
      </div>
    </div>

    <!-- Search History/Recent Searches -->
    <div v-if="!searchQuery && searchHistory.length > 0" class="history-section q-mb-md">
      <div class="text-h6 q-mb-sm">Recent Searches</div>
      <div class="row q-gutter-sm">
        <q-chip
          v-for="(historyItem, index) in searchHistory.slice(0, 10)"
          :key="index"
          clickable
          removable
          color="primary"
          text-color="white"
          @click="searchQuery = historyItem.query"
          @remove="removeFromHistory(index)"
        >
          {{ historyItem.query }}
          <q-tooltip>{{ formatDate(historyItem.timestamp) }}</q-tooltip>
        </q-chip>
        <q-btn
          v-if="searchHistory.length > 0"
          flat
          dense
          icon="clear_all"
          label="Clear History"
          @click="clearHistory"
          class="text-grey-6"
        />
      </div>
    </div>

    <!-- AI-Powered Tag Suggestions -->
    <div v-if="suggestedTags.length > 0" class="suggestions-section q-mb-md">
      <div class="text-subtitle2 q-mb-sm">Suggested tags:</div>
      <div class="row q-gutter-xs">
        <q-chip
          v-for="tag in suggestedTags"
          :key="tag"
          clickable
          outline
          color="secondary"
          @click="addTagToSearch(tag)"
        >
          {{ tag }}
        </q-chip>
      </div>
    </div>

    <q-separator class="q-my-md" />

    <!-- Results Count and Status -->
    <div v-if="searchQuery" class="results-header q-mb-md">
      <div class="text-subtitle2 text-grey-7">
        {{ loading ? 'Searching...' : `${filteredResults.length} results found` }}
        <span v-if="searchQuery"> for "<strong>{{ searchQuery }}</strong>"</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <q-card class="q-pa-lg">
        <div class="text-center">
          <q-spinner-dots size="40px" color="primary" />
          <div class="q-mt-md text-subtitle2">Searching content...</div>
        </div>
      </q-card>
    </div>

    <!-- Empty State -->
    <div v-else-if="searchQuery && filteredResults.length === 0" class="empty-state">
      <q-card class="q-pa-lg text-center">
        <q-icon name="search_off" size="64px" color="grey-5" />
        <div class="text-h6 q-mt-md">No results found</div>
        <div class="text-subtitle2 text-grey-6">
          Try adjusting your search terms or filters
        </div>
        <q-btn
          flat
          color="primary"
          label="Clear filters"
          @click="clearFilters"
          class="q-mt-md"
        />
      </q-card>
    </div>

    <!-- Search Results -->
    <div v-else-if="filteredResults.length > 0" class="results-grid">
      <div class="row q-gutter-md">
        <template v-for="item in paginatedResults" :key="item.id">
          <q-card class="result-card col-12 col-sm-6 col-md-4 col-lg-3">
            <div class="card-media">
              <q-img
                :src="item.thumbnail || getDefaultThumbnail(item.type)"
                ratio="16/9"
                spinner-color="primary"
                spinner-size="24px"
              >
                <div class="absolute-top-right">
                  <q-chip
                    :color="getTypeColor(item.type)"
                    text-color="white"
                    dense
                    square
                  >
                    {{ item.type }}
                  </q-chip>
                </div>
              </q-img>
            </div>

            <q-card-section class="card-content">
              <div class="text-subtitle1 text-weight-medium ellipsis-2-lines">
                {{ item.title }}
              </div>
              <div class="text-caption text-grey-6 ellipsis-3-lines q-mt-xs">
                {{ item.snippet }}
              </div>

              <!-- Metadata -->
              <div class="metadata q-mt-sm">
                <div class="text-caption text-grey-5">
                  <q-icon name="schedule" size="12px" class="q-mr-xs" />
                  {{ formatDate(item.createdAt) }}
                </div>
                <div v-if="item.author" class="text-caption text-grey-5">
                  <q-icon name="person" size="12px" class="q-mr-xs" />
                  {{ item.author }}
                </div>
              </div>
            </q-card-section>

            <q-card-actions class="card-actions">
              <q-btn
                flat
                dense
                :icon="isBookmarked(item) ? 'bookmark' : 'bookmark_border'"
                :color="isBookmarked(item) ? 'amber' : 'grey-6'"
                @click="toggleBookmark(item)"
              >
                <q-tooltip>{{ isBookmarked(item) ? 'Remove bookmark' : 'Add bookmark' }}</q-tooltip>
              </q-btn>

              <q-btn
                flat
                dense
                icon="share"
                color="grey-6"
                @click="shareItem(item)"
              >
                <q-tooltip>Share</q-tooltip>
              </q-btn>

              <q-space />

              <q-btn
                flat
                dense
                label="Open"
                color="primary"
                :to="getLink(item)"
              />
            </q-card-actions>
          </q-card>
        </template>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-container q-mt-lg">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="7"
          boundary-numbers
          color="primary"
          size="md"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';

// Types
interface MediaItem {
  id: string;
  type: 'books' | 'videos' | 'songs' | 'quotes';
  title: string;
  snippet: string;
  thumbnail?: string;
  author?: string;
  createdAt: Date;
  tags?: string[];
  popularity?: number;
}

interface SearchHistoryItem {
  query: string;
  timestamp: Date;
}

interface FilterOption {
  label: string;
  value: 'all' | 'books' | 'videos' | 'songs' | 'quotes';
}

interface SortOption {
  label: string;
  value: 'relevance' | 'date' | 'popularity' | 'title';
}

// Composables
const $q = useQuasar();

// Reactive state
const searchQuery = ref('');
const filter = ref<'all' | 'books' | 'videos' | 'songs' | 'quotes'>('all');
const sortBy = ref<'relevance' | 'date' | 'popularity' | 'title'>('relevance');
const loading = ref(false);
const results = ref<MediaItem[]>([]);
const bookmarkedItems = ref<Set<string>>(new Set());
const searchHistory = ref<SearchHistoryItem[]>([]);
const suggestedTags = ref<string[]>([]);
const currentPage = ref(1);
const itemsPerPage = 12;

// Voice search
const isListening = ref(false);
const speechSupported = ref(false);
let recognition: any = null;

// Filter and sort options
const filterOptions: FilterOption[] = [
  { label: 'All', value: 'all' },
  { label: 'Books', value: 'books' },
  { label: 'Videos', value: 'videos' },
  { label: 'Songs', value: 'songs' },
  { label: 'Quotes', value: 'quotes' }
];

const sortOptions: SortOption[] = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Most Recent', value: 'date' },
  { label: 'Most Popular', value: 'popularity' },
  { label: 'Title A-Z', value: 'title' }
];

// Computed properties
const filteredResults = computed(() => {
  let filtered = filter.value === 'all'
    ? results.value
    : results.value.filter(r => r.type === filter.value);

  // Apply sorting
  switch (sortBy.value) {
    case 'date':
      filtered = filtered.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case 'popularity':
      filtered = filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      break;
    case 'title':
      filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default: // relevance
      // Keep original order (assumed to be by relevance from API)
      break;
  }

  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredResults.value.length / itemsPerPage)
);

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredResults.value.slice(start, end);
});

// Watchers
watch(searchQuery, async (newVal, oldVal) => {
  if (newVal === oldVal) return;

  currentPage.value = 1; // Reset pagination

  if (newVal.trim()) {
    await performSearch();
    addToHistory(newVal);
    generateSuggestedTags(newVal);
  } else {
    results.value = [];
    suggestedTags.value = [];
  }
});

watch([filter, sortBy], () => {
  currentPage.value = 1; // Reset pagination when filters change
});

// Methods
async function performSearch() {
  if (!searchQuery.value.trim()) return;

  loading.value = true;
  try {
    // Simulate API call - replace with your actual API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock data - replace with actual API call
    results.value = generateMockResults(searchQuery.value);
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Search failed. Please try again.',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
}

function setFilter(type: typeof filter.value) {
  filter.value = type;
}

function getFilterCount(filterType: string): number {
  if (filterType === 'all') return results.value.length;
  return results.value.filter(r => r.type === filterType).length;
}

function clearFilters() {
  filter.value = 'all';
  sortBy.value = 'relevance';
}

function toggleBookmark(item: MediaItem) {
  if (bookmarkedItems.value.has(item.id)) {
    bookmarkedItems.value.delete(item.id);
    $q.notify({
      type: 'info',
      message: 'Bookmark removed',
      position: 'bottom'
    });
  } else {
    bookmarkedItems.value.add(item.id);
    $q.notify({
      type: 'positive',
      message: 'Bookmarked!',
      position: 'bottom'
    });
  }

  // Persist bookmarks to localStorage
  localStorage.setItem('bookmarks', JSON.stringify([...bookmarkedItems.value]));
}

function isBookmarked(item: MediaItem): boolean {
  return bookmarkedItems.value.has(item.id);
}

function shareItem(item: MediaItem) {
  if (navigator.share) {
    navigator.share({
      title: item.title,
      text: item.snippet,
      url: window.location.origin + getLink(item)
    });
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.origin + getLink(item));
    $q.notify({
      type: 'positive',
      message: 'Link copied to clipboard!',
      position: 'bottom'
    });
  }
}

function getLink(item: MediaItem): string {
  return `/${item.type}/${item.id}`;
}

function getTypeColor(type: string): string {
  const colors = {
    books: 'brown',
    videos: 'red',
    songs: 'purple',
    quotes: 'teal'
  };
  return colors[type as keyof typeof colors] || 'grey';
}

function getDefaultThumbnail(type: string): string {
  const defaults = {
    books: '/api/placeholder/300/200?text=Book',
    videos: '/api/placeholder/300/200?text=Video',
    songs: '/api/placeholder/300/200?text=Song',
    quotes: '/api/placeholder/300/200?text=Quote'
  };
  return defaults[type as keyof typeof defaults] || '/api/placeholder/300/200';
}

function formatDate(date: Date): string {
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    .format(Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)), 'day');
}

// Search History Management
function addToHistory(query: string) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return;

  // Remove existing entry if present
  const existingIndex = searchHistory.value.findIndex(h => h.query === trimmedQuery);
  if (existingIndex !== -1) {
    searchHistory.value.splice(existingIndex, 1);
  }

  // Add to beginning
  searchHistory.value.unshift({
    query: trimmedQuery,
    timestamp: new Date()
  });

  // Keep only last 20 searches
  if (searchHistory.value.length > 20) {
    searchHistory.value = searchHistory.value.slice(0, 20);
  }

  // Persist to localStorage
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
}

function removeFromHistory(index: number) {
  searchHistory.value.splice(index, 1);
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
}

function clearHistory() {
  searchHistory.value = [];
  localStorage.removeItem('searchHistory');
  $q.notify({
    type: 'info',
    message: 'Search history cleared',
    position: 'bottom'
  });
}

// Voice Search
function initVoiceSearch() {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    speechSupported.value = true;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      searchQuery.value = transcript;
      isListening.value = false;
      $q.notify({
        type: 'positive',
        message: `Voice search: "${transcript}"`,
        position: 'top'
      });
    };

    recognition.onerror = (event: any) => {
      isListening.value = false;
      $q.notify({
        type: 'negative',
        message: 'Voice search failed. Please try again.',
        position: 'top'
      });
    };

    recognition.onend = () => {
      isListening.value = false;
    };
  }
}

function toggleVoiceSearch() {
  if (isListening.value) {
    stopVoiceSearch();
  } else {
    startVoiceSearch();
  }
}

function startVoiceSearch() {
  if (recognition) {
    isListening.value = true;
    recognition.start();
  }
}

function stopVoiceSearch() {
  if (recognition) {
    recognition.stop();
    isListening.value = false;
  }
}

// AI-Powered Tag Suggestions
function generateSuggestedTags(query: string) {
  // Simulate AI tag generation - replace with actual AI service
  const commonTags = ['trending', 'new', 'popular', 'classic', 'recommended'];
  const queryWords = query.toLowerCase().split(' ');

  // Simple tag suggestion logic (replace with AI)
  suggestedTags.value = commonTags
    .filter(tag => !queryWords.includes(tag))
    .slice(0, 5);
}

function addTagToSearch(tag: string) {
  const currentQuery = searchQuery.value.trim();
  searchQuery.value = currentQuery ? `${currentQuery} ${tag}` : tag;
}

// Mock data generator
function generateMockResults(query: string): MediaItem[] {
  const types: MediaItem['type'][] = ['books', 'videos', 'songs', 'quotes'];
  const mockResults: MediaItem[] = [];

  for (let i = 0; i < 24; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    mockResults.push({
      id: `${type}-${i}`,
      type,
      title: `${query} ${type.slice(0, -1)} ${i + 1}`,
      snippet: `This is a sample snippet for ${query} related ${type.slice(0, -1)} content.`,
      thumbnail: `/api/placeholder/300/200?text=${type}&bg=random`,
      author: `Author ${i + 1}`,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      popularity: Math.floor(Math.random() * 1000),
      tags: ['tag1', 'tag2', 'tag3']
    });
  }

  return mockResults;
}

// Lifecycle hooks
onMounted(() => {
  // Initialize voice search
  initVoiceSearch();

  // Load saved data
  const savedHistory = localStorage.getItem('searchHistory');
  if (savedHistory) {
    searchHistory.value = JSON.parse(savedHistory).map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
  }

  const savedBookmarks = localStorage.getItem('bookmarks');
  if (savedBookmarks) {
    bookmarkedItems.value = new Set(JSON.parse(savedBookmarks));
  }
});

onUnmounted(() => {
  if (recognition) {
    recognition.abort();
  }
});
</script>

<style lang="scss" scoped>
.search-container {
  .search-input {
    font-size: 1.1rem;
  }
}

.voice-feedback {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.filter-section {
  .sort-select {
    min-width: 140px;
  }
}

.results-grid {
  .result-card {
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .card-media {
    position: relative;
    overflow: hidden;
  }

  .card-content {
    min-height: 120px;
  }

  .card-actions {
    padding: 8px 16px;
  }
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ellipsis-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.metadata {
  .text-caption {
    display: flex;
    align-items: center;
    margin-bottom: 2px;
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
}

.empty-state,
.loading-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Responsive adjustments
@media (max-width: 600px) {
  .filter-section {
    .row {
      flex-direction: column;
      align-items: stretch;

      .q-btn-group {
        margin-bottom: 8px;
      }

      .sort-select {
        min-width: auto;
      }
    }
  }

  .results-grid {
    .result-card {
      margin-bottom: 16px;
    }
  }
}
</style>
