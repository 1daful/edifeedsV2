<template>
  <div class="px-4 py-6">
    <!-- Header Section -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-semibold text-gray-800">Upcoming Events</h2>
        <p class="text-sm text-gray-500 mt-1">{{ events.length }} events coming up</p>
      </div>
      <div class="flex items-center space-x-2">
        <q-btn
          flat
          dense
          round
          :icon="viewMode === 'grid' ? 'view_list' : 'grid_view'"
          @click="toggleViewMode"
          class="text-gray-600"
        />
        <q-btn
          flat
          dense
          round
          icon="refresh"
          @click="refreshEvents"
          :loading="loading"
          class="text-gray-600"
        />
        <q-btn
          flat
          label="See All Events"
          @click="$router.push('/events')"
          class="text-primary"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <q-spinner-dots size="40px" color="primary" />
    </div>

    <!-- Empty State -->
    <div v-else-if="events.length === 0" class="text-center py-12">
      <q-icon name="event" size="48px" class="text-gray-400 mb-4" />
      <p class="text-gray-500 text-lg">No upcoming events</p>
      <p class="text-gray-400 text-sm">Check back later for new events</p>
    </div>



    <!-- Events List/Grid -->
    <div v-else>
      <!-- Grid View -->
      <q-scroll-area
        v-if="viewMode === 'grid'"
        style="height: 400px; width: 100%;"
        :bar-style="barStyle"
        :content-style="contentStyle"

        class="w-full"
        horizontal
        :thumb-style="{ backgroundColor: '#1976d2', width: '4px', borderRadius: '2px' }"
      >
        <div class="flex space-x-4 pb-2">
          <q-card
            v-for="event in events"
            :key="event.id"
            class="min-w-[280px] max-w-[280px] cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
            @click="navigateToEvent(event)"
          >
            <!-- Event Image -->
            <q-img
              :src="event.thumbnail_url"
              :ratio="16/9"
              class="transition-all duration-300 hover:brightness-110"
              spinner-color="primary"
              no-spinner
            >
              <!-- Live Badge -->
              <div
                v-if="isLive(event)"
                class="absolute top-3 left-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium animate-pulse shadow-lg"
              >
                <q-icon name="fiber_manual_record" size="8px" class="mr-1" />
                LIVE NOW
              </div>

              <!-- Event Type Badge -->
              <div
                v-if="event.type"
                class="absolute top-3 right-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full"
              >
                {{ event.type }}
              </div>

              <!-- Gradient Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </q-img>

            <q-card-section class="pb-2">
              <div class="text-base font-semibold line-clamp-2 text-gray-800 mb-2">
                {{ event.title }}
              </div>

              <div class="flex items-center text-xs text-gray-500 mb-2">
                <q-icon name="schedule" size="14px" class="mr-1" />
                {{ formatDate(event.start_time) }}
              </div>

              <div v-if="event.location" class="flex items-center text-xs text-gray-500 mb-2">
                <q-icon name="location_on" size="14px" class="mr-1" />
                {{ event.location }}
              </div>

              <div v-if="event.attendees_count" class="flex items-center text-xs text-gray-500">
                <q-icon name="group" size="14px" class="mr-1" />
                {{ event.attendees_count }} attending
              </div>
            </q-card-section>

            <q-card-actions align="between" class="pt-0">
              <div class="flex items-center space-x-1">
                <q-chip
                  v-if="getEventStatus(event) === 'soon'"
                  size="sm"
                  color="orange"
                  text-color="white"
                  icon="access_time"
                  dense
                >
                  Starting Soon
                </q-chip>
                <q-chip
                  v-else-if="getEventStatus(event) === 'today'"
                  size="sm"
                  color="green"
                  text-color="white"
                  icon="today"
                  dense
                >
                  Today
                </q-chip>
              </div>

              <div class="flex items-center space-x-1">
                <q-btn
                  flat
                  dense
                  size="sm"
                  :icon="isReminded(event) ? 'notifications_active' : 'notifications'"
                  :color="isReminded(event) ? 'primary' : 'grey'"
                  @click.stop="toggleReminder(event)"
                >
                  <q-tooltip>
                    {{ isReminded(event) ? 'Remove reminder' : 'Set reminder' }}
                  </q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  dense
                  size="sm"
                  icon="share"
                  color="grey"
                  @click.stop="shareEvent(event)"
                >
                  <q-tooltip>Share event</q-tooltip>
                </q-btn>
              </div>
            </q-card-actions>
          </q-card>
        </div>
      </q-scroll-area>

      <!-- List View -->
      <div v-else class="space-y-3">
        <q-card
          v-for="event in events"
          :key="event.id"
          class="cursor-pointer hover:shadow-md transition-all duration-200"
          @click="navigateToEvent(event)"
        >
          <q-card-section class="flex items-center space-x-4 py-3">
            <q-img
              :src="event.thumbnail_url"
              class="w-16 h-16 rounded-lg flex-shrink-0"
              spinner-color="primary"
            />

            <div class="flex-grow min-w-0">
              <div class="flex items-center space-x-2 mb-1">
                <h3 class="font-medium text-gray-800 truncate">{{ event.title }}</h3>
                <q-badge
                  v-if="isLive(event)"
                  color="red"
                  text-color="white"
                  label="LIVE"
                  class="animate-pulse"
                />
              </div>

              <div class="flex items-center text-sm text-gray-500 space-x-4">
                <span class="flex items-center">
                  <q-icon name="schedule" size="14px" class="mr-1" />
                  {{ formatDate(event.start_time) }}
                </span>
                <span v-if="event.location" class="flex items-center">
                  <q-icon name="location_on" size="14px" class="mr-1" />
                  {{ event.location }}
                </span>
              </div>
            </div>

            <div class="flex items-center space-x-2 flex-shrink-0">
              <q-btn
                flat
                dense
                size="sm"
                :icon="isReminded(event) ? 'notifications_active' : 'notifications'"
                :color="isReminded(event) ? 'primary' : 'grey'"
                @click.stop="toggleReminder(event)"
              />
              <q-btn
                flat
                dense
                size="sm"
                icon="share"
                color="grey"
                @click.stop="shareEvent(event)"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>


<q-scroll-area
      >
        <div class="flex space-x-4 pb-2 q-pa-md" style="width: max-content;">

              <div class="flex space-x-4 pb-2">
                <q-card
                  v-for="event in events"
                  :key="event.id"
                  class="min-w-[280px] max-w-[280px] cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
                  @click="navigateToEvent(event)"
                >
                  <!-- Event Image -->
                  <q-img
                    :src="event.thumbnail_url"
                    :ratio="16/9"
                    class="transition-all duration-300 hover:brightness-110"
                    spinner-color="primary"
                    no-spinner
                  >
                    <!-- Live Badge -->
                    <div
                      v-if="isLive(event)"
                      class="absolute top-3 left-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium animate-pulse shadow-lg"
                    >
                      <q-icon name="fiber_manual_record" size="8px" class="mr-1" />
                      LIVE NOW
                    </div>

                    <!-- Event Type Badge -->
                    <div
                      v-if="event.type"
                      class="absolute top-3 right-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full"
                    >
                      {{ event.type }}
                    </div>

                    <!-- Gradient Overlay -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </q-img>

                  <q-card-section class="pb-2">
                    <div class="text-base font-semibold line-clamp-2 text-gray-800 mb-2">
                      {{ event.title }}
                    </div>

                    <div class="flex items-center text-xs text-gray-500 mb-2">
                      <q-icon name="schedule" size="14px" class="mr-1" />
                      {{ formatDate(event.start_time) }}
                    </div>

                    <div v-if="event.location" class="flex items-center text-xs text-gray-500 mb-2">
                      <q-icon name="location_on" size="14px" class="mr-1" />
                      {{ event.location }}
                    </div>

                    <div v-if="event.attendees_count" class="flex items-center text-xs text-gray-500">
                      <q-icon name="group" size="14px" class="mr-1" />
                      {{ event.attendees_count }} attending
                    </div>
                  </q-card-section>

                  <q-card-actions align="between" class="pt-0">
                    <div class="flex items-center space-x-1">
                      <q-chip
                        v-if="getEventStatus(event) === 'soon'"
                        size="sm"
                        color="orange"
                        text-color="white"
                        icon="access_time"
                        dense
                      >
                        Starting Soon
                      </q-chip>
                      <q-chip
                        v-else-if="getEventStatus(event) === 'today'"
                        size="sm"
                        color="green"
                        text-color="white"
                        icon="today"
                        dense
                      >
                        Today
                      </q-chip>
                    </div>

                    <div class="flex items-center space-x-1">
                      <q-btn
                        flat
                        dense
                        size="sm"
                        :icon="isReminded(event) ? 'notifications_active' : 'notifications'"
                        :color="isReminded(event) ? 'primary' : 'grey'"
                        @click.stop="toggleReminder(event)"
                      >
                        <q-tooltip>
                          {{ isReminded(event) ? 'Remove reminder' : 'Set reminder' }}
                        </q-tooltip>
                      </q-btn>

                      <q-btn
                        flat
                        dense
                        size="sm"
                        icon="share"
                        color="grey"
                        @click.stop="shareEvent(event)"
                      >
                        <q-tooltip>Share event</q-tooltip>
                      </q-btn>
                    </div>
                  </q-card-actions>
                </q-card>
              </div>
        </div>
      </q-scroll-area>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const $router = useRouter();
const loading = ref(false);
const events = ref([]);
function fetchUpcomingEvents() {
  loading.value = true;

  return new Promise((resolve) => {
    setTimeout(() => {
      const upcoming = [
        {
          id: '1',
          title: 'Online Worship Night with Hillsong United',
          thumbnail_url: 'https://via.placeholder.com/280x158.png?text=Worship+Night',
          start_time: '2025-07-20T19:00:00Z',
          end_time: '2025-07-20T21:00:00Z',
          location: 'Online via Zoom',
          type: 'Worship',
          attendees_count: 245,
          description: 'Join us for an evening of worship and fellowship',
        },
        {
          id: '2',
          title: 'Bible Study: Book of Romans Chapter 8',
          thumbnail_url: 'https://via.placeholder.com/280x158.png?text=Bible+Study',
          start_time: '2025-07-22T18:00:00Z',
          end_time: '2025-07-22T19:30:00Z',
          location: 'Fellowship Hall',
          type: 'Study',
          attendees_count: 32,
          description: 'Deep dive into Romans Chapter 8',
        },
        {
          id: '3',
          title: 'Youth Group Game Night',
          thumbnail_url: 'https://via.placeholder.com/280x158.png?text=Youth+Night',
          start_time: '2025-07-25T19:30:00Z',
          end_time: '2025-07-25T22:00:00Z',
          location: 'Youth Center',
          type: 'Youth',
          attendees_count: 18,
          description: 'Fun games and fellowship for ages 13-18',
        },
        {
          id: '4',
          title: 'Community Outreach - Food Drive',
          thumbnail_url: 'https://via.placeholder.com/280x158.png?text=Food+Drive',
          start_time: '2025-07-28T09:00:00Z',
          end_time: '2025-07-28T15:00:00Z',
          location: 'Main Parking Lot',
          type: 'Outreach',
          attendees_count: 67,
          description: 'Help serve our community with food donations',
        },
      ];
      events.value = upcoming;
      loading.value = false;
      resolve(upcoming);
    }, 1000);
  });
}

// Reactive state
const viewMode = ref('grid'); // 'grid' or 'list'
const reminders = ref(new Set());

// Computed properties
const upcomingEvents = computed(() => {
  return events.value
    .filter(event => new Date(event.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
});

// Enhanced mock data with more realistic properties


// Enhanced date formatting
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();

  // Get dates without time for accurate day comparison
  const eventDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (eventDate.getTime() === today.getTime()) {
    return `Today at ${date.toLocaleString(undefined, { hour: 'numeric', minute: 'numeric' })}`;
  } else if (eventDate.getTime() === tomorrow.getTime()) {
    return `Tomorrow at ${date.toLocaleString(undefined, { hour: 'numeric', minute: 'numeric' })}`;
  } else {
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0 && diffDays < 7) {
      return date.toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: 'numeric' });
    } else {
      return date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
    }
  }
}


// Enhanced live detection
function isLive(event) {
  const now = new Date();
  const start = new Date(event.start_time);
  const end = new Date(event.end_time || new Date(start.getTime() + 2 * 60 * 60 * 1000));
  return now >= start && now <= end;
}

// Get event status
function getEventStatus(event) {
  const now = new Date();
  const eventDate = new Date(event.start_time);

  // Get dates without time for accurate day comparison
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (eventDay.getTime() === today.getTime()) {
    return 'today';
  } else if (eventDay.getTime() === tomorrow.getTime()) {
    return 'soon';
  } else {
    // Check if it's within 24 hours
    const diffTime = eventDate - now;
    const diffHours = diffTime / (1000 * 60 * 60);

    if (diffHours <= 24 && diffHours > 0) {
      return 'soon';
    }
  }

  return 'upcoming';
}

// Reminder management
function isReminded(event) {
  return reminders.value.has(event.id);
}

function toggleReminder(event) {
  if (reminders.value.has(event.id)) {
    reminders.value.delete(event.id);
    $q.notify({
      message: `Reminder removed for "${event.title}"`,
      color: 'info',
      position: 'top',
      actions: [{ label: 'Undo', color: 'white', handler: () => reminders.value.add(event.id) }]
    });
  } else {
    reminders.value.add(event.id);
    $q.notify({
      message: `Reminder set for "${event.title}"`,
      color: 'positive',
      position: 'top',
      icon: 'notifications_active',
    });

    // Schedule notification (in real app, this would integrate with a notification service)
    scheduleNotification(event);
  }
}

function scheduleNotification(event) {
  // This would typically integrate with a push notification service
  // For now, we'll simulate with a simple timeout for demo purposes
  const eventTime = new Date(event.start_time);
  const reminderTime = new Date(eventTime.getTime() - 15 * 60 * 1000); // 15 minutes before
  const now = new Date();

  if (reminderTime > now) {
    const timeUntilReminder = reminderTime - now;
    setTimeout(() => {
      if (reminders.value.has(event.id)) {
        $q.notify({
          message: `"${event.title}" starts in 15 minutes!`,
          color: 'warning',
          position: 'top',
          timeout: 0,
          actions: [
            { label: 'Join Now', color: 'white', handler: () => navigateToEvent(event) },
            { label: 'Dismiss', color: 'white' }
          ]
        });
      }
    }, timeUntilReminder);
  }
}

// Enhanced navigation
function navigateToEvent(event) {
  // Add analytics tracking here if needed
  $router.push(`/events/${event.id}`);
}

// View mode toggle
function toggleViewMode() {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid';
  $q.localStorage.set('eventsViewMode', viewMode.value);
}

// Refresh events
function refreshEvents() {
  fetchUpcomingEvents();
}

// Share event
function shareEvent(event) {
  if (navigator.share) {
    navigator.share({
      title: event.title,
      text: `Check out this event: ${event.title}`,
      url: `${window.location.origin}/events/${event.id}`
    });
  } else {
    // Fallback for browsers without native sharing
    const shareUrl = `${window.location.origin}/events/${event.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      $q.notify({
        message: 'Event link copied to clipboard!',
        color: 'positive',
        position: 'top',
        icon: 'content_copy'
      });
    });
  }
}

// Load saved view mode
onMounted(() => {
  const savedViewMode = ''
  //const savedViewMode = $q.localStorage.getItem('eventsViewMode');
  if (savedViewMode) {
    viewMode.value = savedViewMode;
  }

  fetchUpcomingEvents();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Smooth hover transitions */
.q-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom scrollbar styling */
.q-scrollarea__thumb {
  background-color: #1976d2;
  border-radius: 2px;
  opacity: 0.6;
}

.q-scrollarea__thumb:hover {
  opacity: 1;
}
</style>
