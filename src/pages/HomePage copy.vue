// pages/IndexPage.vue - Enhanced Edifeeds Homepage with advanced features (FIXED)
<template>
  <q-page class="homepage">
    <!-- HERO SECTION with enhanced visuals -->
     <HeroSlide></HeroSlide>

    <!-- QUICK ACCESS TOOLBAR -->
    <div class="quick-access q-mt-md">
      <div class="row q-gutter-sm justify-center">
        <q-btn
          v-for="action in quickActions"
          :key="action.id"
          :icon="action.icon"
          :label="action.label"
          :color="action.color"
          class="quick-action-btn"
          @click="handleQuickAction(action)"
          unelevated
        />
      </div>
    </div>

    <!-- QUIET TIME CORNER with enhanced features -->
     <!-- QueitTime></QueitTime -->
    <!-- UPCOMING EVENTS with enhanced preview -->
    <!-- div class="q-mt-lg">
      <q-card class="events-card" elevation="2">
        <q-card-section>
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6">
              <q-icon name="event" class="q-mr-sm" />
              Upcoming Events
            </div>
            <q-btn flat label="See All" to="/events" color="primary" />
          </div>

          <q-carousel
            animated
            swipeable
            height="180px"
            control-color="primary"
            v-model="currentEventSlide"
          >
            <q-carousel-slide
              v-for="event in upcomingEvents"
              :key="event.id"
              :name="event.id"
            >
              <q-card flat class="event-preview-card full-height">
                <q-card-section class="q-pa-md">
                  <div class="text-h6 text-primary">{{ event.title }}</div>
                  <div class="text-body2 text-grey-7 q-mt-sm">{{ event.description }}</div>
                  <div class="row items-center q-mt-md">
                    <q-icon name="schedule" size="sm" class="q-mr-xs" />
                    <span class="text-caption">{{ formatEventDate(event.date) }}</span>
                  </div>
                  <div class="row items-center q-mt-xs">
                    <q-icon name="location_on" size="sm" class="q-mr-xs" />
                    <span class="text-caption">{{ event.location }}</span>
                  </div>
                </q-card-section>
              </q-card>
            </q-carousel-slide>
          </q-carousel>
        </q-card-section>
      </q-card>
    </div -->

    <!-- DISCOVERY SECTIONS with enhanced cards -->
    <div v-for="section in discoverySections" :key="section.title" class="q-mt-lg">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">{{ section.title }}</div>
        <q-btn flat dense label="See All" :to="section.link" color="primary" />
      </div>

      <q-scroll-area
        horizontal
        class="discovery-scroll-area rounded-borders"
        style="height: 220px"
      >
        <div class="row no-wrap q-gutter-sm q-pa-sm">
          <q-card
            v-for="item in section.items"
            :key="item.id"
            class="discovery-card cursor-pointer"
            @click="navigateToItem(item)"
            :class="{ 'discovery-card-hover': true }"
          >
            <div class="discovery-card-image">
              <img :src="item.image" :alt="item.title" />
              <div class="discovery-card-overlay">
                <q-btn
                  round
                  color="white"
                  text-color="primary"
                  icon="play_arrow"
                  size="md"
                  @click.stop="playItem(item)"
                />
              </div>
            </div>
            <q-card-section class="q-pa-sm">
              <div class="text-body2 text-weight-medium">{{ item.title }}</div>
              <div class="text-caption text-grey-6">{{ item.subtitle }}</div>
              <div class="row items-center q-mt-xs">
                <q-rating
                  v-model="item.rating"
                  readonly
                  size="sm"
                  color="amber"
                  class="q-mr-xs"
                />
                <span class="text-caption">({{ item.reviews }})</span>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-scroll-area>
    </div>

    <!-- PERSONALIZED TOOLS with enhanced features -->
    <div class="q-mt-lg">
      <div class="text-h6 q-mb-md">
        <q-icon name="bookmark" class="q-mr-sm" />
        Continue Watching & Bookmarks
      </div>

      <q-tabs v-model="personalizedTab" class="q-mb-md">
        <q-tab name="continue" label="Continue Watching" />
        <q-tab name="bookmarks" label="Bookmarks" />
        <q-tab name="favorites" label="Favorites" />
      </q-tabs>

      <q-tab-panels v-model="personalizedTab">
        <q-tab-panel name="continue">
          <PersonalizedContentGrid :items="continueWatching" />
        </q-tab-panel>
        <q-tab-panel name="bookmarks">
          <PersonalizedContentGrid :items="bookmarks" />
        </q-tab-panel>
        <q-tab-panel name="favorites">
          <PersonalizedContentGrid :items="favorites" />
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- FLOATING ACTION BUTTON - FIXED VERSION -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-fab
        v-model="showCreateMenu"
        icon="add"
        direction="up"
        color="primary"
        @click.stop
      >
        <q-fab-action
          v-for="option in createOptions"
          :key="option.id"
          :icon="option.icon"
          :label="option.label"
          color="primary"
          @click="handleCreate(option)"
        />
      </q-fab>
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import HeroSlide from '../components/Home/HeroSlide.vue'
//import PersonalizedContentGrid from '../components/PersonalizedContentGrid.vue'

const $q = useQuasar()
const router = useRouter()

// Reactive state
const currentEventSlide = ref('event-1')
const personalizedTab = ref('continue')
const showCreateMenu = ref(false)

// Enhanced data structures

const quickActions = ref([
  { id: 'search', icon: 'search', label: 'Search', color: 'primary' },
  { id: 'live', icon: 'live_tv', label: 'Live', color: 'red' },
  { id: 'donate', icon: 'favorite', label: 'Donate', color: 'pink' },
  { id: 'connect', icon: 'people', label: 'Connect', color: 'green' }
])


const upcomingEvents = ref([
  {
    id: 'event-1',
    title: 'Sunday Service',
    description: 'Join us for worship, fellowship, and God\'s word',
    date: new Date('2024-01-21'),
    location: 'Main Sanctuary'
  },
  {
    id: 'event-2',
    title: 'Bible Study',
    description: 'Deep dive into the Gospel of Matthew',
    date: new Date('2024-01-22'),
    location: 'Fellowship Hall'
  },
  {
    id: 'event-3',
    title: 'Youth Group',
    description: 'Fun activities and spiritual growth for teens',
    date: new Date('2024-01-23'),
    location: 'Youth Center'
  }
])

const discoverySections = computed(() => [
  {
    title: '🪐 Topic Spotlight',
    link: '/topics',
    items: generateSampleItems('topic', 8)
  },
  {
    title: '💬 Most Discussed This Week',
    link: '/discussions',
    items: generateSampleItems('discussion', 8)
  },
  {
    title: '🎶 Worship Picks',
    link: '/music',
    items: generateSampleItems('music', 8)
  },
  {
    title: '👀 Because You Watched…',
    link: '/recommended',
    items: generateSampleItems('recommended', 8)
  }
])

const continueWatching = ref(generateSampleItems('continue', 6))
const bookmarks = ref(generateSampleItems('bookmark', 6))
const favorites = ref(generateSampleItems('favorite', 6))

const createOptions = ref([
  { id: 'post', icon: 'article', label: 'Create Post' },
  { id: 'prayer', icon: 'volunteer_activism', label: 'Prayer Request' },
  { id: 'testimony', icon: 'record_voice_over', label: 'Share Testimony' },
  { id: 'question', icon: 'help', label: 'Ask Question' }
])

// Methods
function generateSampleItems(type, count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${type}-${i + 1}`,
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Item ${i + 1}`,
    subtitle: `Subtitle for ${type} ${i + 1}`,
    image: `/api/placeholder/160/120`,
    rating: Math.floor(Math.random() * 5) + 1,
    reviews: Math.floor(Math.random() * 100) + 1,
    duration: `${Math.floor(Math.random() * 60) + 5} min`
  }))
}

function handleQuickAction(action) {
  switch (action.id) {
    case 'search':
      router.push('/search')
      break
    case 'live':
      router.push('/live')
      break
    case 'donate':
      router.push('/donate')
      break
    case 'connect':
      router.push('/connect')
      break
  }
}

function formatEventDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function navigateToItem(item) {
  // Navigate to item detail page
  router.push(`/content/${item.id}`)
}

function playItem(item) {
  // Handle play action
  $q.notify({
    message: `Playing: ${item.title}`,
    icon: 'play_arrow',
    color: 'primary'
  })
}

function handleCreate(option) {
  showCreateMenu.value = false
  router.push(`/create/${option.id}`)
  $q.notify({
    message: `Creating ${option.label}`,
    icon: option.icon,
    color: 'primary'
  })
}

// Lifecycle
onMounted(() => {
  // Initialize any necessary data or start timers
  console.log('Homepage mounted')
})
</script>

<style scoped>
.homepage {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
  /* Add bottom padding to prevent content from being hidden behind FAB */
  padding-bottom: 80px;
}

.quick-access {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quick-action-btn {
  min-width: 120px;
  border-radius: 8px;
}

.events-card {
  border-radius: 16px;
}

.event-preview-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.discovery-scroll-area {
  background: rgba(0, 0, 0, 0.02);
}

.discovery-card {
  width: 160px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}

.discovery-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.discovery-card-image {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.discovery-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discovery-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.discovery-card:hover .discovery-card-overlay {
  opacity: 1;
}

/* Responsive design */
@media (max-width: 768px) {
  .homepage {
    padding: 8px;
    padding-bottom: 80px;
  }

  .quick-action-btn {
    min-width: 80px;
    font-size: 0.8rem;
  }

  .discovery-card {
    width: 140px;
    height: 180px;
  }

  .discovery-card-image {
    height: 100px;
  }
}
</style>
