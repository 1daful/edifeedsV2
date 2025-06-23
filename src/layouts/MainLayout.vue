<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Top Bar -->
    <q-header elevated class="bg-white text-black shadow-2">
      <q-toolbar>
        <q-btn 
          flat 
          round 
          icon="menu" 
          @click="toggleDrawer"
          aria-label="Toggle menu"
          :loading="drawerLoading"
        />
        <q-toolbar-title class="text-weight-bold cursor-pointer" @click="goHome">
          Edifeeds
        </q-toolbar-title>
        <q-space />
        <q-btn 
          flat 
          round 
          icon="search" 
          @click="openSearch"
          aria-label="Search"
        />
        <q-btn 
          flat 
          round 
          icon="notifications"
          @click="openNotifications"
          aria-label="Notifications"
        >
          <q-badge v-if="notificationCount > 0" color="red" floating>
            {{ notificationCount }}
          </q-badge>
        </q-btn>
        <q-btn 
          flat 
          round 
          icon="person" 
          @click="openProfile"
          aria-label="Profile"
        />
      </q-toolbar>
    </q-header>

    <!-- Drawer -->
    <q-drawer 
      v-model="drawer" 
      side="left" 
      bordered 
      :width="280"
      :breakpoint="1024"
      show-if-above
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="text-h6 text-weight-bold q-mb-md">Menu</div>
          <q-list separator>
            <q-item 
              v-for="item in menuItems" 
              :key="item.id"
              clickable 
              v-ripple
              :active="activeMenuItem === item.id"
              @click="selectMenuItem(item)"
              class="rounded-borders"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ item.label }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="item.badge">
                <q-badge :color="item.badgeColor || 'primary'">
                  {{ item.badge }}
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- Main Content -->
    <q-page-container>
      <q-page class="q-pa-md">
        <!-- Error State -->
        <q-banner v-if="error" class="bg-negative text-white q-mb-md" rounded>
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ error }}
          <template v-slot:action>
            <q-btn flat label="Retry" @click="retryLoad" />
            <q-btn flat icon="close" @click="dismissError" />
          </template>
        </q-banner>

        <!-- Loading State -->
        <div v-if="loading" class="q-pa-xl text-center">
          <q-spinner-dots size="50px" color="primary" />
          <div class="q-mt-md text-grey-6">Loading content...</div>
        </div>

        <!-- Content -->
        <div v-else>
          <!-- Trending Section -->
          <section class="q-mb-xl">
            <div class="row items-center q-mb-md">
              <div class="text-h5 text-weight-bold">🔥 Trending</div>
              <q-space />
              <q-btn flat label="View All" color="primary" @click="viewAllTrending" />
            </div>
            
            <q-card 
              class="trending-card cursor-pointer" 
              flat 
              bordered
              @click="openTrendingItem(trendingItem)"
              :loading="trendingLoading"
            >
              <q-img 
                :src="trendingItem.image" 
                :ratio="16/9"
                class="rounded-borders"
                @error="handleImageError"
              >
                <div class="absolute-bottom text-white q-pa-md">
                  <div class="text-h6 text-weight-bold">{{ trendingItem.title }}</div>
                  <div class="text-body2 q-mt-xs">{{ trendingItem.description }}</div>
                  <div class="row items-center q-mt-sm">
                    <q-icon name="visibility" size="16px" class="q-mr-xs" />
                    <span class="text-caption">{{ formatViews(trendingItem.views) }}</span>
                    <q-space />
                    <span class="text-caption">{{ formatDate(trendingItem.date) }}</span>
                  </div>
                </div>
                <div class="absolute-top-right q-pa-md">
                  <q-chip color="red" text-color="white" size="sm">
                    <q-icon name="trending_up" size="16px" class="q-mr-xs" />
                    Trending
                  </q-chip>
                </div>
              </q-img>
            </q-card>
          </section>

          <!-- Daily Verse Section -->
          <section class="q-mb-xl">
            <div class="row items-center q-mb-md">
              <div class="text-h5 text-weight-bold">📖 Daily Verse</div>
              <q-space />
              <q-btn flat icon="refresh" @click="refreshDailyVerse" :loading="verseLoading" />
            </div>
            
            <q-card 
              class="daily-verse-card row no-wrap cursor-pointer" 
              flat 
              bordered
              @click="openVerse(dailyVerse)"
            >
              <q-img 
                :src="dailyVerse.image" 
                class="col-4 rounded-borders-left"
                @error="handleImageError"
              />
              <div class="q-pa-md col">
                <div class="text-h6 text-weight-medium q-mb-sm">
                  "{{ dailyVerse.text }}"
                </div>
                <div class="text-subtitle2 text-primary q-mb-sm">
                  {{ dailyVerse.reference }}
                </div>
                <div class="text-caption text-grey-6">
                  {{ dailyVerse.category }}
                </div>
                <div class="row items-center q-mt-md">
                  <q-btn size="sm" flat icon="share" label="Share" @click.stop="shareVerse" />
                  <q-btn size="sm" flat icon="bookmark" :color="dailyVerse.bookmarked ? 'primary' : 'grey'" 
                         @click.stop="toggleBookmark('verse', dailyVerse.id)" />
                </div>
              </div>
            </q-card>
          </section>

          <!-- Continue Watching Section -->
          <section class="q-mb-xl" v-if="continueWatching.length > 0">
            <div class="row items-center q-mb-md">
              <div class="text-h5 text-weight-bold">▶️ Continue Watching</div>
              <q-space />
              <q-btn flat label="Clear All" @click="clearWatchingHistory" />
            </div>
            
            <div class="row q-col-gutter-md">
              <div 
                v-for="item in continueWatching" 
                :key="item.id"
                class="col-12 col-sm-6 col-md-4"
              >
                <q-card 
                  class="continue-watching-card cursor-pointer" 
                  flat 
                  bordered
                  @click="continueWatchingItem(item)"
                >
                  <div class="relative-position">
                    <q-img 
                      :src="item.thumbnail" 
                      :ratio="16/9"
                      class="rounded-borders-top"
                      @error="handleImageError"
                    />
                    <div class="absolute-bottom-left q-pa-xs">
                      <q-linear-progress 
                        :value="item.progress / 100" 
                        color="red" 
                        track-color="white"
                        class="rounded-borders"
                        style="height: 4px;"
                      />
                    </div>
                    <div class="absolute-center">
                      <q-btn round color="white" text-color="black" icon="play_arrow" size="md" />
                    </div>
                    <div class="absolute-top-right q-pa-xs">
                      <q-chip size="sm" color="black" text-color="white">
                        {{ formatDuration(item.remainingTime) }}
                      </q-chip>
                    </div>
                  </div>
                  <q-card-section class="q-pa-sm">
                    <div class="text-subtitle2 text-weight-medium ellipsis">
                      {{ item.title }}
                    </div>
                    <div class="text-caption text-grey-6">
                      {{ item.progress }}% complete
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </section>

          <!-- Collections Section -->
          <section>
            <div class="row items-center q-mb-md">
              <div class="text-h5 text-weight-bold">📚 Collections</div>
              <q-space />
              <q-btn flat label="Browse All" color="primary" @click="browseCollections" />
            </div>
            
            <div class="row q-col-gutter-md">
              <div 
                v-for="collection in collections" 
                :key="collection.id"
                class="col-12 col-sm-6 col-md-3"
              >
                <q-card 
                  class="collection-card cursor-pointer" 
                  flat 
                  bordered
                  @click="openCollection(collection)"
                >
                  <q-img 
                    :src="collection.image" 
                    :ratio="1"
                    class="rounded-borders-top"
                    @error="handleImageError"
                  >
                    <div class="absolute-bottom text-white q-pa-md">
                      <div class="text-subtitle1 text-weight-bold">
                        {{ collection.title }}
                      </div>
                      <div class="text-caption">
                        {{ collection.itemCount }} items
                      </div>
                    </div>
                  </q-img>
                  <q-card-section class="q-pa-sm">
                    <div class="text-caption text-grey-6">
                      {{ collection.description }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </section>
        </div>
      </q-page>
    </q-page-container>

    <!-- Search Dialog -->
    <q-dialog v-model="searchDialog" position="top">
      <q-card style="width: 100%; max-width: 600px;">
        <q-card-section class="row items-center q-pb-none">
          <q-input
            v-model="searchQuery"
            placeholder="Search for content..."
            outlined
            dense
            autofocus
            class="full-width"
            @keyup.enter="performSearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-btn flat round icon="close" @click="searchDialog = false" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-section v-if="searchResults.length > 0">
          <q-list>
            <q-item 
              v-for="result in searchResults" 
              :key="result.id"
              clickable 
              @click="selectSearchResult(result)"
            >
              <q-item-section avatar>
                <q-avatar>
                  <q-img :src="result.thumbnail" @error="handleImageError" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ result.title }}</q-item-label>
                <q-item-label caption>{{ result.type }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// State Management
const drawer = ref(false)
const drawerLoading = ref(false)
const loading = ref(true)
const error = ref(null)
const activeMenuItem = ref('home')
const searchDialog = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const trendingLoading = ref(false)
const verseLoading = ref(false)
const notificationCount = ref(3)

// Menu Items
const menuItems = reactive([
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'trending', label: 'Trending', icon: 'trending_up', badge: '12', badgeColor: 'red' },
  { id: 'bookmarks', label: 'Bookmarks', icon: 'bookmark' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'downloads', label: 'Downloads', icon: 'download' },
  { id: 'favorites', label: 'Favorites', icon: 'favorite' },
  { id: 'playlists', label: 'Playlists', icon: 'playlist_play' },
  { id: 'settings', label: 'Settings', icon: 'settings' }
])

// Content Data
const trendingItem = reactive({
  id: 1,
  title: 'The Power of Faith in Modern Times',
  description: 'Discover how faith transforms lives in today\'s world',
  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop',
  views: 12500,
  date: new Date()
})

const dailyVerse = reactive({
  id: 1,
  text: 'Be still and know that I am God',
  reference: 'Psalm 46:10',
  category: 'Peace & Comfort',
  image: 'https://images.unsplash.com/photo-1544273677-6e4e5b0f0b8e?w=300&h=200&fit=crop',
  bookmarked: false
})

const continueWatching = reactive([
  {
    id: 1,
    title: 'Sunday Service - Living with Purpose',
    thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=300&h=200&fit=crop',
    progress: 65,
    remainingTime: 1800 // seconds
  },
  {
    id: 2,
    title: 'Bible Study - Psalms Deep Dive',
    thumbnail: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop',
    progress: 30,
    remainingTime: 2400
  },
  {
    id: 3,
    title: 'Youth Ministry - Finding Your Path',
    thumbnail: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=300&h=200&fit=crop',
    progress: 85,
    remainingTime: 600
  }
])

const collections = reactive([
  {
    id: 1,
    title: 'Sunday Sermons',
    description: 'Weekly inspirational messages',
    image: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=300&h=300&fit=crop',
    itemCount: 52
  },
  {
    id: 2,
    title: 'Bible Studies',
    description: 'Deep dive into scripture',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop',
    itemCount: 24
  },
  {
    id: 3,
    title: 'Youth Ministry',
    description: 'Content for young believers',
    image: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=300&h=300&fit=crop',
    itemCount: 18
  },
  {
    id: 4,
    title: 'Music & Worship',
    description: 'Uplifting songs and hymns',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    itemCount: 36
  }
])

// Computed Properties
const isDesktop = computed(() => $q.screen.gt.sm)

// Methods
const toggleDrawer = async () => {
  drawerLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 100)) // Simulate loading
  drawer.value = !drawer.value
  drawerLoading.value = false
}

const goHome = () => {
  activeMenuItem.value = 'home'
  // Router navigation would go here
}

const selectMenuItem = (item) => {
  activeMenuItem.value = item.id
  if (!isDesktop.value) {
    drawer.value = false
  }
  // Handle navigation based on item.id
  handleNavigation(item.id)
}

const handleNavigation = (itemId) => {
  // This would integrate with Vue Router
  console.log(`Navigating to: ${itemId}`)
}

const openSearch = () => {
  searchDialog.value = true
}

const performSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  // Simulate API call
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    searchResults.value = [
      {
        id: 1,
        title: 'Search Result 1',
        type: 'Video',
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
      }
    ]
  } catch {
    showError('Search failed. Please try again.')
  }
}

const selectSearchResult = () => {
  searchDialog.value = false
  searchQuery.value = ''
  searchResults.value = []
  // Navigate to result
}

const openNotifications = () => {
  $q.notify({
    message: 'Notifications feature coming soon!',
    type: 'info',
    position: 'top'
  })
}

const openProfile = () => {
  $q.notify({
    message: 'Profile feature coming soon!',
    type: 'info',
    position: 'top'
  })
}

const openTrendingItem = (item) => {
  console.log('Opening trending item:', item)
  // Navigate to video player
}

const viewAllTrending = () => {
  console.log('View all trending')
}

const refreshDailyVerse = async () => {
  verseLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Simulate new verse loading
    $q.notify({
      message: 'Daily verse refreshed!',
      type: 'positive',
      position: 'bottom'
    })
  } catch {
    showError('Failed to refresh verse')
  }
  verseLoading.value = false
}

const openVerse = (verse) => {
  console.log('Opening verse:', verse)
}

const shareVerse = () => {
  if (navigator.share) {
    navigator.share({
      title: 'Daily Verse from Edifeeds',
      text: `"${dailyVerse.text}" - ${dailyVerse.reference}`,
      url: window.location.href
    })
  } else {
    // Fallback for browsers without Web Share API
    navigator.clipboard.writeText(`"${dailyVerse.text}" - ${dailyVerse.reference}`)
    $q.notify({
      message: 'Verse copied to clipboard!',
      type: 'positive',
      position: 'bottom'
    })
  }
}

const toggleBookmark = async (type) => {
  try {
    if (type === 'verse') {
      dailyVerse.bookmarked = !dailyVerse.bookmarked
      $q.notify({
        message: dailyVerse.bookmarked ? 'Verse bookmarked!' : 'Bookmark removed',
        type: 'positive',
        position: 'bottom'
      })
    }
    // API call would go here
  } catch {
    showError('Failed to update bookmark')
  }
}

const continueWatchingItem = (item) => {
  console.log('Continue watching:', item)
  // Navigate to video player with timestamp
}

const clearWatchingHistory = () => {
  $q.dialog({
    title: 'Clear History',
    message: 'Are you sure you want to clear your watching history?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    continueWatching.splice(0)
    $q.notify({
      message: 'Watching history cleared',
      type: 'positive',
      position: 'bottom'
    })
  })
}

const openCollection = (collection) => {
  console.log('Opening collection:', collection)
}

const browseCollections = () => {
  console.log('Browse all collections')
}

const handleImageError = (event) => {
  // Set fallback image
  event.target.src = 'https://via.placeholder.com/300x200/E0E0E0/757575?text=Image+Not+Found'
}

const formatViews = (views) => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
  return views.toString()
}

const formatDate = (date) => {
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    .format(-Math.floor((Date.now() - date) / (1000 * 60 * 60 * 24)), 'day')
}

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

const showError = (message) => {
  error.value = message
  setTimeout(() => {
    if (error.value === message) {
      error.value = null
    }
  }, 5000)
}

const dismissError = () => {
  error.value = null
}

const retryLoad = async () => {
  error.value = null
  loading.value = true
  await loadContent()
}

const loadContent = async () => {
  try {
    // Simulate API calls
    await Promise.all([
      new Promise(resolve => setTimeout(resolve, 800)),
      // Add more API calls here
    ])
  } catch {
    showError('Failed to load content. Please check your connection.')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await loadContent()
})

// Watchers
watch(searchQuery, (newQuery) => {
  if (newQuery.length > 2) {
    // Debounced search would go here
  }
})
</script>

<style scoped>
.trending-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.trending-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.daily-verse-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.daily-verse-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.continue-watching-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.continue-watching-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}

.collection-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.collection-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}

.rounded-borders {
  border-radius: 8px;
}

.rounded-borders-top {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.rounded-borders-left {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

@media (max-width: 600px) {
  .q-page {
    padding: 8px;
  }
  
  .text-h5 {
    font-size: 1.2rem;
  }
}
</style>