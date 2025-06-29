<!-- src/pages/UpcomingEventsPage.vue -->
<template>
  <q-page class="events-page">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">
          <q-icon name="event" size="48px" color="white" />
        </div>
        <h1 class="hero-title">Upcoming Christian Events</h1>
        <p class="hero-subtitle">
          Join our community in worship, fellowship, and spiritual growth
        </p>
      </div>
      <div class="hero-decoration"></div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="filters-container">
        <div class="filters-header">
          <h3>Find Your Perfect Event</h3>
          <q-btn
            flat
            round
            icon="tune"
            @click="showAdvancedFilters = !showAdvancedFilters"
            :color="showAdvancedFilters ? 'primary' : 'grey-7'"
            class="filter-toggle"
          >
            <q-tooltip>Advanced Filters</q-tooltip>
          </q-btn>
        </div>

        <div class="basic-filters">
          <q-select
            v-model="selectedCategory"
            :options="categoryOptions"
            label="Category"
            filled
            behavior="menu"
            class="filter-select"
            transition-show="scale"
            transition-hide="scale"
          >
            <template v-slot:prepend>
              <q-icon name="category" />
            </template>
          </q-select>

          <q-select
            v-model="selectedDate"
            :options="dateOptions"
            label="Time Range"
            filled
            behavior="menu"
            class="filter-select"
            transition-show="scale"
            transition-hide="scale"
          >
            <template v-slot:prepend>
              <q-icon name="schedule" />
            </template>
          </q-select>

          <q-select
            v-model="selectedLocation"
            :options="locationOptions"
            label="Location"
            filled
            behavior="menu"
            class="filter-select"
            transition-show="scale"
            transition-hide="scale"
          >
            <template v-slot:prepend>
              <q-icon name="place" />
            </template>
          </q-select>
        </div>

        <!-- Advanced Filters -->
        <q-slide-transition>
          <div v-show="showAdvancedFilters" class="advanced-filters">
            <q-input
              v-model="searchQuery"
              label="Search events..."
              filled
              clearable
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-toggle
              v-model="showOnlineOnly"
              label="Online events only"
              color="primary"
              class="online-toggle"
            />

            <q-btn
              flat
              label="Clear All Filters"
              icon="clear"
              @click="clearFilters"
              class="clear-filters-btn"
            />
          </div>
        </q-slide-transition>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="stats-section">
      <div class="stats-container">
        <div class="stat-item">
          <q-icon name="event_available" size="24px" color="primary" />
          <span class="stat-number">{{ filteredEvents.length }}</span>
          <span class="stat-label">Events Found</span>
        </div>
        <div class="stat-item">
          <q-icon name="people" size="24px" color="secondary" />
          <span class="stat-number">{{ totalAttendees }}</span>
          <span class="stat-label">Expected Attendees</span>
        </div>
        <div class="stat-item">
          <q-icon name="location_on" size="24px" color="accent" />
          <span class="stat-number">{{ uniqueLocations }}</span>
          <span class="stat-label">Locations</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-section">
      <div class="loading-container">
        <q-spinner-dots color="primary" size="60px" />
        <p class="loading-text">Loading amazing events for you...</p>
      </div>
    </div>

    <!-- Events Grid -->
    <div v-else class="events-section">
      <div class="events-container">
        <!-- Sort Options -->
        <div class="sort-section">
          <q-btn-toggle
            v-model="sortBy"
            :options="sortOptions"
            flat
            class="sort-toggle"
            toggle-color="primary"
          />
          <q-btn-toggle
            v-model="viewMode"
            :options="viewModeOptions"
            flat
            class="view-toggle"
            toggle-color="primary"
          />
        </div>

        <!-- No Results State -->
        <div v-if="filteredEvents.length === 0" class="no-results">
          <q-icon name="event_busy" size="80px" color="grey-5" />
          <h4>No events found</h4>
          <p>Try adjusting your filters or check back later for new events.</p>
          <q-btn flat color="primary" label="Clear Filters" @click="clearFilters" />
        </div>

        <!-- Events Grid/List -->
        <div v-else :class="eventsGridClass">
          <transition-group name="event-card" tag="div" class="events-grid-inner">
            <div
              v-for="event in sortedEvents"
              :key="event.id"
              class="event-card-wrapper"
            >
              <q-card
                class="event-card"
                :class="{ 'featured': event.featured, 'list-view': viewMode === 'list' }"
                @click="showEventDetails(event)"
              >
                <!-- Featured Badge -->
                <div v-if="event.featured" class="featured-badge">
                  <q-icon name="star" size="16px" />
                  Featured
                </div>

                <!-- Event Image/Icon -->
                <div class="event-visual">
                  <div class="event-image" :style="getEventImageStyle(event)">
                    <div class="event-date-overlay">
                      <span class="date-day">{{ getEventDay(event.date) }}</span>
                      <span class="date-month">{{ getEventMonth(event.date) }}</span>
                    </div>
                  </div>
                </div>

                <q-card-section class="event-content">
                  <div class="event-header">
                    <h6 class="event-title">{{ event.title }}</h6>
                    <q-chip
                      :color="getCategoryColor(event.category)"
                      text-color="white"
                      size="sm"
                      class="category-chip"
                    >
                      {{ event.category }}
                    </q-chip>
                  </div>

                  <div class="event-meta">
                    <div class="meta-item">
                      <q-icon name="schedule" size="16px" />
                      <span>{{ formatEventTime(event.date) }}</span>
                    </div>
                    <div class="meta-item">
                      <q-icon name="place" size="16px" />
                      <span>{{ event.location }}</span>
                    </div>
                    <div v-if="event.attendees" class="meta-item">
                      <q-icon name="people" size="16px" />
                      <span>{{ event.attendees }} attending</span>
                    </div>
                  </div>

                  <p v-if="event.description" class="event-description">
                    {{ truncateText(event.description, 100) }}
                  </p>

                  <!-- Event Tags -->
                  <div v-if="event.tags" class="event-tags">
                    <q-chip
                      v-for="tag in event.tags.slice(0, 3)"
                      :key="tag"
                      size="xs"
                      outline
                      color="grey-7"
                      class="tag-chip"
                    >
                      {{ tag }}
                    </q-chip>
                  </div>
                </q-card-section>

                <q-card-actions class="event-actions">
                  <q-btn
                    v-if="event.link"
                    unelevated
                    color="primary"
                    :label="event.isPaid ? `Join - ${event.price}` : 'Join Event'"
                    :href="event.link"
                    target="_blank"
                    @click.stop
                    class="join-btn"
                  />

                  <q-space />

                  <q-btn
                    flat
                    round
                    :icon="isBookmarked(event.id) ? 'bookmark' : 'bookmark_border'"
                    :color="isBookmarked(event.id) ? 'amber' : 'grey-7'"
                    @click.stop="toggleBookmark(event.id)"
                    class="bookmark-btn"
                  >
                    <q-tooltip>
                      {{ isBookmarked(event.id) ? 'Remove bookmark' : 'Bookmark event' }}
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    round
                    icon="share"
                    color="grey-7"
                    @click.stop="shareEvent(event)"
                    class="share-btn"
                  >
                    <q-tooltip>Share event</q-tooltip>
                  </q-btn>
                </q-card-actions>
              </q-card>
            </div>
          </transition-group>
        </div>
      </div>
    </div>

    <!-- Load More Button -->
    <div v-if="hasMoreEvents" class="load-more-section">
      <q-btn
        unelevated
        color="primary"
        label="Load More Events"
        icon="expand_more"
        @click="loadMoreEvents"
        :loading="loadingMore"
        class="load-more-btn"
      />
    </div>

    <!-- Event Details Dialog -->
    <q-dialog v-model="showDialog" class="event-dialog">
      <q-card v-if="selectedEvent" class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="dialog-title">{{ selectedEvent.title }}</div>
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="dialog-content">
          <div class="dialog-image" :style="getEventImageStyle(selectedEvent)"></div>

          <div class="dialog-meta">
            <div class="meta-row">
              <q-icon name="schedule" />
              <span>{{ formatDate(selectedEvent.date) }}</span>
            </div>
            <div class="meta-row">
              <q-icon name="place" />
              <span>{{ selectedEvent.location }}</span>
            </div>
            <div v-if="selectedEvent.organizer" class="meta-row">
              <q-icon name="person" />
              <span>{{ selectedEvent.organizer }}</span>
            </div>
          </div>

          <p class="dialog-description">{{ selectedEvent.description }}</p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            label="Join Event"
            :href="selectedEvent.link"
            target="_blank"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Event } from "../utils/types";

// Reactive state
const loading = ref(true);
const loadingMore = ref(false);
const events = ref<Event[]>([]);
const bookmarkedEvents = ref<Set<string>>(new Set());
const showDialog = ref(false);
const selectedEvent = ref<Event | null>(null);
const showAdvancedFilters = ref(false);
const hasMoreEvents = ref(false);

// Filter state
const selectedCategory = ref('All');
const selectedDate = ref('All');
const selectedLocation = ref('All');
const searchQuery = ref('');
const showOnlineOnly = ref(false);
const sortBy = ref('date');
const viewMode = ref('grid');

// Options
const categoryOptions = ['All', 'Worship', 'Conference', 'Bible Study', 'Prayer Meeting', 'Youth Event'];
const dateOptions = ['All', 'Today', 'This Week', 'This Month', 'Next Month'];
const locationOptions = ['All', 'Online', 'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano'];

const sortOptions = [
  { label: 'Date', value: 'date', icon: 'schedule' },
  { label: 'Name', value: 'name', icon: 'sort_by_alpha' },
  { label: 'Popularity', value: 'attendees', icon: 'trending_up' }
];

const viewModeOptions = [
  { label: '', value: 'grid', icon: 'grid_view' },
  { label: '', value: 'list', icon: 'view_list' }
];

// Computed properties
const filteredEvents = computed(() => {
  let filtered = events.value.filter(event => {
    const matchesCategory = selectedCategory.value === 'All' || event.category === selectedCategory.value;
    const matchesLocation = selectedLocation.value === 'All' || event.location === selectedLocation.value;
    const matchesSearch = !searchQuery.value ||
      event.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesOnlineFilter = !showOnlineOnly.value || event.location === 'Online';

    return matchesCategory && matchesLocation && matchesSearch && matchesOnlineFilter;
  });

  return filtered;
});

const sortedEvents = computed(() => {
  const events = [...filteredEvents.value];

  switch (sortBy.value) {
    case 'name':
      return events.sort((a, b) => a.title.localeCompare(b.title));
    case 'attendees':
      return events.sort((a, b) => (b.attendees || 0) - (a.attendees || 0));
    case 'date':
    default:
      return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
});

const eventsGridClass = computed(() => ({
  'events-grid': viewMode.value === 'grid',
  'events-list': viewMode.value === 'list'
}));

const totalAttendees = computed(() =>
  filteredEvents.value.reduce((sum, event) => sum + (event.attendees || 0), 0)
);

const uniqueLocations = computed(() =>
  new Set(filteredEvents.value.map(event => event.location)).size
);

// Methods
onMounted(async () => {
  await loadEvents();
});

async function loadEvents() {
  try {
    loading.value = true;
    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 1000));

    events.value = [
      {
        id: '1',
        title: 'Sunday Worship Service',
        description: 'Join us for a powerful time of worship, prayer, and biblical teaching.',
        date: '2024-12-29T10:00:00',
        location: 'Lagos',
        category: 'Worship',
        link: '#',
        featured: true,
        attendees: 250,
        tags: ['worship', 'community', 'prayer'],
        organizer: 'Pastor John Doe'
      },
      {
        id: '2',
        title: 'Youth Conference 2024',
        description: 'An exciting conference designed specifically for young people to grow in faith.',
        date: '2024-12-30T09:00:00',
        location: 'Online',
        category: 'Conference',
        link: '#',
        attendees: 150,
        tags: ['youth', 'conference', 'growth'],
        isPaid: true,
        price: '₦5,000'
      },
      {
        id: '3',
        title: 'Bible Study: Book of Romans',
        description: 'Deep dive into Paul\'s letter to the Romans with interactive discussions.',
        date: '2024-12-31T19:00:00',
        location: 'Abuja',
        category: 'Bible Study',
        link: '#',
        attendees: 80,
        tags: ['bible study', 'romans', 'theology']
      }
    ];

    hasMoreEvents.value = true;
  } catch (error) {
    console.error('Failed to load events:', error);
    events.value = [];
  } finally {
    loading.value = false;
  }
}

async function loadMoreEvents() {
  loadingMore.value = true;
  // Simulate loading more events
  await new Promise(resolve => setTimeout(resolve, 1000));
  loadingMore.value = false;
  hasMoreEvents.value = false;
}

function clearFilters() {
  selectedCategory.value = 'All';
  selectedDate.value = 'All';
  selectedLocation.value = 'All';
  searchQuery.value = '';
  showOnlineOnly.value = false;
  showAdvancedFilters.value = false;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatEventTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getEventDay(dateStr: string) {
  return new Date(dateStr).getDate().toString();
}

function getEventMonth(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short' });
}

function getCategoryColor(category: string) {
  const colorMap: Record<string, string> = {
    'Worship': 'deep-purple',
    'Conference': 'indigo',
    'Bible Study': 'blue',
    'Prayer Meeting': 'teal',
    'Youth Event': 'pink'
  };
  return colorMap[category] || 'grey';
}

function getEventImageStyle(event: Event) {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  ];

  const index = parseInt(event.id) % gradients.length;
  return { background: gradients[index] };
}

function truncateText(text: string, length: number) {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

function showEventDetails(event: Event) {
  selectedEvent.value = event;
  showDialog.value = true;
}

function isBookmarked(eventId: string) {
  return bookmarkedEvents.value.has(eventId);
}

function toggleBookmark(eventId: string) {
  if (bookmarkedEvents.value.has(eventId)) {
    bookmarkedEvents.value.delete(eventId);
  } else {
    bookmarkedEvents.value.add(eventId);
  }
}

function shareEvent(event: Event) {
  if (navigator.share) {
    navigator.share({
      title: event.title,
      text: event.description,
      url: event.link || window.location.href
    });
  } else {
    // Fallback for browsers that don't support Web Share API
    navigator.clipboard.writeText(`${event.title} - ${event.link || window.location.href}`);
  }
}
</script>

<style scoped>
.events-page {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  min-height: 100vh;
}

/* Hero Section */
.hero-section {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem 3rem;
  margin-bottom: 2rem;
  overflow: hidden;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 2;
}

.hero-icon {
  margin-bottom: 1rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 1rem;
  background: linear-gradient(45deg, #ffffff, #e2e8f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
}

.hero-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
}

/* Filters Section */
.filters-section {
  margin-bottom: 2rem;
}

.filters-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filters-header h3 {
  margin: 0;
  color: #374151;
  font-size: 1.5rem;
  font-weight: 600;
}

.basic-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-select {
  transition: all 0.3s ease;
}

.filter-select:hover {
  transform: translateY(-1px);
}

.advanced-filters {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  margin-top: 1rem;
}

.search-input {
  min-width: 300px;
}

/* Stats Section */
.stats-section {
  margin-bottom: 2rem;
}

.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 0 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Loading Section */
.loading-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.loading-container {
  text-align: center;
}

.loading-text {
  margin-top: 1rem;
  color: #6b7280;
  font-size: 1.1rem;
}

/* Events Section */
.events-section {
  margin-bottom: 2rem;
}

.events-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.sort-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.events-grid-inner {
  display: contents;
}

/* Event Cards */
.event-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #e5e7eb;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.event-card.list-view {
  display: flex;
  max-height: 200px;
}

.event-card.featured {
  border: 2px solid #fbbf24;
  box-shadow: 0 8px 25px rgba(251,191,36,0.15);
}

.featured-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #fbbf24;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.event-visual {
  position: relative;
}

.event-image {
  height: 200px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-card.list-view .event-image {
  width: 200px;
  height: auto;
  min-height: 100%;
}

.event-date-overlay {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.date-day {
  display: block;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
}

.date-month {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  opacity: 0.8;
}

.event-content {
  padding: 1.5rem;
  flex: 1;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.event-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.3;
}

.category-chip {
  flex-shrink: 0;
}

.event-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.event-description {
  color: #4b5563;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.event-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.event-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
}

.join-btn {
  border-radius: 8px;
  font-weight: 600;
  padding: 0.5rem 1.5rem;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.no-results h4 {
  margin: 1rem 0 0.5rem 0;
  color: #374151;
}

.no-results p {
  margin: 0 0 2rem 0;
}

/* Load More Section */
.load-more-section {
  text-align: center;
  padding: 2rem;
}

.load-more-btn {
  border-radius: 8px;
  padding: 0.75rem 2rem;
  font-weight: 600;
}

/* Dialog Styles */
.event-dialog .dialog-card {
  max-width: 600px;
  width: 90vw;
  border-radius: 16px;
}

.dialog-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 600;
}

.dialog-content {
  padding: 0 !important;
}

.dialog-image {
  height: 200px;
  margin-bottom: 1.5rem;
}

.dialog-meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1.5rem 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #374151;
}

.dialog-description {
  margin: 0 1.5rem 1.5rem 1.5rem;
  color: #4b5563;
  line-height: 1.6;
}

/* Animations */
.event-card-enter-active,
.event-card-leave-active {
  transition: all 0.5s ease;
}

.event-card-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.event-card-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.event-card-move {
  transition: transform 0.5s ease;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .basic-filters {
    grid-template-columns: 1fr;
  }

  .advanced-filters {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .sort-section {
    flex-direction: column;
    gap: 1rem;
  }

  .events-grid {
    grid-template-columns: 1fr;
  }

  .event-card.list-view {
    flex-direction: column;
    max-height: none;
  }

  .event-card.list-view .event-image {
    width: 100%;
    height: 200px;
  }

  .event-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 2rem 1rem;
  }

  .filters-container,
  .events-container,
  .stats-container {
    padding: 0 0.5rem;
  }

  .event-content {
    padding: 1rem;
  }

  .event-actions {
    padding: 1rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .events-page {
    background: linear-gradient(180deg, #1f2937 0%, #111827 100%);
  }

  .filters-header h3,
  .event-title,
  .stat-number {
    color: #f9fafb;
  }

  .event-card {
    background: #374151;
    border-color: #4b5563;
  }

  .event-actions {
    background: #4b5563;
    border-color: #6b7280;
  }

  .advanced-filters {
    background: #374151;
  }

  .stat-item {
    background: #374151;
  }

  .sort-section {
    background: #374151;
  }
}

/* Print styles */
@media print {
  .hero-section,
  .filters-section,
  .stats-section,
  .sort-section,
  .load-more-section {
    display: none;
  }

  .events-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .event-card {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid #ddd;
  }

  .event-actions {
    display: none;
  }
}
</style>
