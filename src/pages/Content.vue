<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Loading Overlay -->
    <q-inner-loading :showing="isLoading" color="primary">
      <q-spinner-dots size="50px" />
    </q-inner-loading>

    <!-- Top Bar -->
    <q-header elevated class="bg-white text-black shadow-2">
      <q-toolbar>
        <q-btn 
          flat 
          round 
          icon="menu" 
          @click="toggleDrawer"
          :aria-label="$t('navigation.menu')"
          data-testid="menu-button"
        />
        <q-toolbar-title class="text-weight-bold cursor-pointer" @click="navigateToHome">
          {{ appConfig.name }}
        </q-toolbar-title>
        
        <q-space />
        
        <!-- Search -->
        <q-btn 
          flat 
          round 
          icon="search" 
          @click="openSearch"
          :aria-label="$t('actions.search')"
          data-testid="search-button"
        />
        
        <!-- Notifications -->
        <q-btn 
          flat 
          round 
          icon="notifications"
          @click="openNotifications"
          :aria-label="$t('navigation.notifications')"
          data-testid="notifications-button"
        >
          <q-badge 
            v-if="unreadNotifications > 0" 
            color="red" 
            floating
            :label="unreadNotifications > 99 ? '99+' : unreadNotifications"
          />
        </q-btn>
        
        <!-- Profile -->
        <q-btn-dropdown 
          flat 
          round 
          icon="person"
          :aria-label="$t('navigation.profile')"
          data-testid="profile-dropdown"
        >
          <q-list>
            <q-item clickable @click="navigateToProfile" v-close-popup>
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>{{ $t('navigation.profile') }}</q-item-section>
            </q-item>
            <q-item clickable @click="navigateToSettings" v-close-popup>
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>{{ $t('navigation.settings') }}</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable @click="handleLogout" v-close-popup>
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>{{ $t('auth.logout') }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
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
      class="bg-grey-1"
    >
      <q-scroll-area class="fit">
        <q-list>
          <!-- Navigation Items -->
          <q-item 
            v-for="item in navigationItems" 
            :key="item.name"
            clickable 
            v-ripple
            :active="currentRoute === item.route"
            active-class="bg-primary text-white"
            @click="navigateTo(item.route)"
            :data-testid="`nav-${item.name}`"
          >
            <q-item-section avatar>
              <q-icon :name="item.icon" />
            </q-item-section>
            <q-item-section>
              {{ $t(`navigation.${item.name}`) }}
            </q-item-section>
            <q-item-section side v-if="item.badge">
              <q-badge :color="item.badgeColor" :label="item.badge" />
            </q-item-section>
          </q-item>
          
          <q-separator class="q-my-md" />
          
          <!-- Quick Actions -->
          <q-item-label header class="text-grey-8">
            {{ $t('navigation.quickActions') }}
          </q-item-label>
          
          <q-item clickable v-ripple @click="createContent">
            <q-item-section avatar>
              <q-icon name="add_circle" color="positive" />
            </q-item-section>
            <q-item-section>{{ $t('actions.createContent') }}</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- Main Content -->
    <q-page-container>
      <q-page class="q-pa-md">
        <!-- Error State -->
        <div v-if="error" class="text-center q-pa-xl">
          <q-icon name="error_outline" size="80px" color="negative" class="q-mb-md" />
          <div class="text-h6 q-mb-md">{{ $t('errors.loadingFailed') }}</div>
          <div class="text-body2 text-grey-7 q-mb-md">{{ error }}</div>
          <q-btn 
            color="primary" 
            @click="retryLoading"
            :loading="isRetrying"
            :label="$t('actions.retry')"
          />
        </div>

        <!-- Content -->
        <div v-else>
          <!-- Hero Section -->
          <div class="hero-section q-mb-xl">
            <q-card class="hero-card bg-gradient-primary text-white">
              <q-card-section class="q-pa-xl text-center">
                <div class="text-h4 q-mb-md">{{ $t('home.welcome') }}</div>
                <div class="text-h6 q-mb-lg">{{ $t('home.subtitle') }}</div>
                <q-btn 
                  color="white" 
                  text-color="primary" 
                  :label="$t('actions.getStarted')"
                  @click="navigateToExplore"
                  size="lg"
                  rounded
                />
              </q-card-section>
            </q-card>
          </div>

          <!-- Explore Section -->
          <section class="explore-section q-mb-xl">
            <div class="section-header q-mb-lg">
              <div class="text-h5 text-weight-bold">{{ $t('sections.explore') }}</div>
              <div class="text-subtitle1 text-grey-7">{{ $t('sections.exploreDescription') }}</div>
            </div>
            
            <div class="row q-col-gutter-lg">
              <div 
                v-for="(item, index) in exploreItems" 
                :key="item.id"
                class="col-12 col-sm-6 col-md-4 col-lg-3"
              >
                <q-card 
                  class="explore-card cursor-pointer"
                  @click="openContent(item)"
                  :data-testid="`explore-item-${index}`"
                  v-intersection="onIntersection"
                >
                  <div class="card-image-container">
                    <q-img 
                      :src="item.image" 
                      :alt="item.title"
                      :ratio="16/9"
                      class="rounded-borders-top"
                      loading="lazy"
                      @error="handleImageError"
                    >
                      <template v-slot:loading>
                        <q-skeleton height="200px" />
                      </template>
                      <template v-slot:error>
                        <div class="absolute-full flex flex-center bg-grey-3">
                          <q-icon name="broken_image" size="48px" color="grey-6" />
                        </div>
                      </template>
                    </q-img>
                    
                    <!-- Content Type Badge -->
                    <q-badge 
                      :color="getTypeColor(item.type)" 
                      :label="item.type"
                      class="absolute-top-right q-ma-sm"
                    />
                    
                    <!-- Bookmark Button -->
                    <q-btn 
                      round 
                      :icon="item.bookmarked ? 'bookmark' : 'bookmark_border'"
                      :color="item.bookmarked ? 'yellow-8' : 'white'"
                      class="absolute-bottom-right q-ma-sm"
                      @click.stop="toggleBookmark(item)"
                      :loading="item.bookmarkLoading"
                    />
                  </div>
                  
                  <q-card-section class="q-pa-md">
                    <div class="text-h6 ellipsis-2-lines q-mb-xs">{{ item.title }}</div>
                    <div class="text-body2 text-grey-7 ellipsis-2-lines q-mb-sm">
                      {{ item.description }}
                    </div>
                    
                    <div class="row items-center justify-between">
                      <div class="text-caption text-grey-6">
                        <q-icon name="schedule" size="16px" class="q-mr-xs" />
                        {{ formatDate(item.createdAt) }}
                      </div>
                      <div class="text-caption text-grey-6">
                        <q-icon name="visibility" size="16px" class="q-mr-xs" />
                        {{ formatNumber(item.views) }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
            
            <!-- Load More -->
            <div class="text-center q-mt-lg" v-if="hasMoreExploreItems">
              <q-btn 
                :label="$t('actions.loadMore')"
                @click="loadMoreExploreItems"
                :loading="loadingMoreExplore"
                color="primary"
                outline
              />
            </div>
          </section>

          <!-- Topics Section -->
          <section class="topics-section q-mb-xl">
            <div class="section-header q-mb-lg">
              <div class="text-h5 text-weight-bold">{{ $t('sections.topics') }}</div>
              <div class="text-subtitle1 text-grey-7">{{ $t('sections.topicsDescription') }}</div>
            </div>
            
            <div class="topics-grid">
              <q-chip 
                v-for="topic in topics" 
                :key="topic.id"
                clickable
                :color="selectedTopics.includes(topic.id) ? 'primary' : 'grey-3'"
                :text-color="selectedTopics.includes(topic.id) ? 'white' : 'grey-8'"
                @click="toggleTopic(topic.id)"
                class="q-ma-xs topic-chip"
                :data-testid="`topic-${topic.name}`"
              >
                <q-icon :name="topic.icon" left />
                {{ topic.name }}
                <q-badge 
                  v-if="topic.count" 
                  :color="selectedTopics.includes(topic.id) ? 'white' : 'primary'"
                  :text-color="selectedTopics.includes(topic.id) ? 'primary' : 'white'"
                  :label="formatNumber(topic.count)"
                  class="q-ml-xs"
                />
              </q-chip>
            </div>
          </section>

          <!-- Collections Section -->
          <section class="collections-section">
            <div class="section-header q-mb-lg">
              <div class="text-h5 text-weight-bold">{{ $t('sections.collections') }}</div>
              <div class="text-subtitle1 text-grey-7">{{ $t('sections.collectionsDescription') }}</div>
            </div>
            
            <div class="row q-col-gutter-md">
              <div 
                v-for="collection in collections" 
                :key="collection.id"
                class="col-12 col-sm-6 col-md-4 col-lg-3"
              >
                <q-card 
                  class="collection-card cursor-pointer"
                  @click="openCollection(collection)"
                  :data-testid="`collection-${collection.id}`"
                >
                  <q-img 
                    :src="collection.thumbnail" 
                    :alt="collection.title"
                    :ratio="1"
                    class="rounded-borders-top"
                    loading="lazy"
                  >
                    <template v-slot:loading>
                      <q-skeleton height="200px" />
                    </template>
                    <div class="absolute-bottom bg-gradient-up text-white q-pa-md">
                      <div class="text-h6 ellipsis">{{ collection.title }}</div>
                      <div class="text-caption">
                        {{ collection.itemCount }} {{ $t('common.items') }}
                      </div>
                    </div>
                  </q-img>
                </q-card>
              </div>
            </div>
          </section>
        </div>
      </q-page>
    </q-page-container>

    <!-- Search Dialog -->
    <q-dialog v-model="searchDialog" position="top">
      <q-card class="search-card">
        <q-card-section class="q-pa-none">
          <q-input 
            v-model="searchQuery"
            :placeholder="$t('search.placeholder')"
            autofocus
            borderless
            @input="handleSearchInput"
            class="search-input"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-btn 
                flat 
                round 
                icon="close" 
                @click="searchDialog = false"
                :aria-label="$t('actions.close')"
              />
            </template>
          </q-input>
        </q-card-section>
        
        <!-- Search Results -->
        <q-card-section v-if="searchResults.length > 0" class="q-pt-none">
          <q-list>
            <q-item 
              v-for="result in searchResults" 
              :key="result.id"
              clickable
              @click="selectSearchResult(result)"
            >
              <q-item-section avatar>
                <q-avatar size="40px">
                  <q-img :src="result.thumbnail" />
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useQuasar, date } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

// Composables
const $q = useQuasar()
const { t } = useI18n()
const router = useRouter()

// Reactive state
const drawer = ref(false)
const isLoading = ref(true)
const isRetrying = ref(false)
const error = ref(null)
const searchDialog = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const selectedTopics = ref([])
const loadingMoreExplore = ref(false)
const hasMoreExploreItems = ref(true)
const currentRoute = ref('home')
const unreadNotifications = ref(3)

// Configuration
const appConfig = {
  name: 'Edifeeds',
  version: '1.0.0',
  apiBaseUrl: process.env.API_BASE_URL || 'https://api.edifeeds.com',
  itemsPerPage: 12
}

// Navigation items
const navigationItems = [
  { name: 'home', icon: 'home', route: '/home' },
  { name: 'bookmarks', icon: 'bookmark', route: '/bookmarks', badge: 5, badgeColor: 'primary' },
  { name: 'explore', icon: 'explore', route: '/explore' },
  { name: 'topics', icon: 'topic', route: '/topics' },
  { name: 'collections', icon: 'collections', route: '/collections' },
  { name: 'history', icon: 'history', route: '/history' }
]

// Sample data (in production, this would come from API)
const exploreItems = ref([
  {
    id: 1,
    title: 'Sunday Worship Highlights',
    description: 'Experience the power of collective worship and spiritual connection.',
    type: 'Video',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    createdAt: new Date('2024-06-10'),
    views: 1250,
    bookmarked: false,
    bookmarkLoading: false
  },
  {
    id: 2,
    title: 'Devotional Music Collection',
    description: 'Uplifting songs to inspire your daily spiritual journey.',
    type: 'Music',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
    createdAt: new Date('2024-06-09'),
    views: 890,
    bookmarked: true,
    bookmarkLoading: false
  },
  {
    id: 3,
    title: 'Daily Inspiration Quotes',
    description: 'Start your day with meaningful words of encouragement.',
    type: 'Quote',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    createdAt: new Date('2024-06-08'),
    views: 2100,
    bookmarked: false,
    bookmarkLoading: false
  },
  {
    id: 4,
    title: 'Faith & Healing Stories',
    description: 'Testimonies of transformation and divine intervention.',
    type: 'Book',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    createdAt: new Date('2024-06-07'),
    views: 1750,
    bookmarked: false,
    bookmarkLoading: false
  }
])

const topics = ref([
  { id: 1, name: 'Faith', icon: 'favorite', count: 245 },
  { id: 2, name: 'Healing', icon: 'healing', count: 189 },
  { id: 3, name: 'Hope', icon: 'wb_sunny', count: 321 },
  { id: 4, name: 'Grace', icon: 'spa', count: 156 },
  { id: 5, name: 'Worship', icon: 'music_note', count: 298 },
  { id: 6, name: 'Purpose', icon: 'explore', count: 203 }
])

const collections = ref([
  {
    id: 1,
    title: 'Morning Devotions',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&h=300&fit=crop',
    itemCount: 24
  },
  {
    id: 2,
    title: 'Praise & Worship',
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop',
    itemCount: 18
  },
  {
    id: 3,
    title: 'Bible Study',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
    itemCount: 32
  },
  {
    id: 4,
    title: 'Youth Ministry',
    thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&h=300&fit=crop',
    itemCount: 15
  }
])

// Search functionality
let searchTimeout = null
watch(searchQuery, (newQuery) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    performSearch(newQuery)
  }, 300)
})

// Computed properties
const currentUser = computed(() => {
  // In production, this would come from auth store
  return {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://via.placeholder.com/40'
  }
})

// Methods
const toggleDrawer = () => {
  drawer.value = !drawer.value
}

const navigateTo = (route) => {
  currentRoute.value = route
  router.push(route)
  if ($q.screen.lt.lg) {
    drawer.value = false
  }
}

const navigateToHome = () => navigateTo('/home')
const navigateToExplore = () => navigateTo('/explore')
const navigateToProfile = () => navigateTo('/profile')
const navigateToSettings = () => navigateTo('/settings')

const openSearch = () => {
  searchDialog.value = true
}

const openNotifications = () => {
  // Handle notifications
  $q.notify({
    message: t('notifications.opened'),
    type: 'info'
  })
}

const handleLogout = async () => {
  try {
    // Perform logout logic
    $q.notify({
      message: t('auth.loggedOut'),
      type: 'positive'
    })
    router.push('/login')
  } catch (error) {
    $q.notify({
      message: t('auth.logoutError'),
      type: 'negative'
    })
  }
}

const openContent = (item) => {
  router.push(`/content/${item.id}`)
}

const openCollection = (collection) => {
  router.push(`/collection/${collection.id}`)
}

const toggleBookmark = async (item) => {
  item.bookmarkLoading = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    item.bookmarked = !item.bookmarked
    
    $q.notify({
      message: item.bookmarked ? t('actions.bookmarked') : t('actions.unbookmarked'),
      type: 'positive',
      icon: item.bookmarked ? 'bookmark' : 'bookmark_border'
    })
  } catch (error) {
    $q.notify({
      message: t('errors.bookmarkFailed'),
      type: 'negative'
    })
  } finally {
    item.bookmarkLoading = false
  }
}

const toggleTopic = (topicId) => {
  const index = selectedTopics.value.indexOf(topicId)
  if (index > -1) {
    selectedTopics.value.splice(index, 1)
  } else {
    selectedTopics.value.push(topicId)
  }
}

const createContent = () => {
  router.push('/create')
}

const loadMoreExploreItems = async () => {
  loadingMoreExplore.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Add more items (in production, fetch from API)
    hasMoreExploreItems.value = false
  } catch (error) {
    $q.notify({
      message: t('errors.loadMoreFailed'),
      type: 'negative'
    })
  } finally {
    loadingMoreExplore.value = false
  }
}

const performSearch = async (query) => {
  if (!query.trim()) {
    searchResults.value = []
    return
  }
  
  try {
    // Simulate API search
    await new Promise(resolve => setTimeout(resolve, 300))
    searchResults.value = exploreItems.value.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    )
  } catch (error) {
    console.error('Search failed:', error)
  }
}

const selectSearchResult = (result) => {
  searchDialog.value = false
  searchQuery.value = ''
  searchResults.value = []
  openContent(result)
}

const handleSearchInput = (value) => {
  searchQuery.value = value
}

const retryLoading = async () => {
  isRetrying.value = true
  error.value = null
  try {
    await loadInitialData()
  } finally {
    isRetrying.value = false
  }
}

const loadInitialData = async () => {
  try {
    // Simulate API calls
    await Promise.all([
      new Promise(resolve => setTimeout(resolve, 800)),
      // Add more API calls as needed
    ])
  } catch (err) {
    error.value = t('errors.loadingFailed')
    throw err
  }
}

const onIntersection = (entry) => {
  // Implement intersection observer logic for lazy loading
  if (entry.isIntersecting) {
    // Load content when visible
  }
}

const handleImageError = (event) => {
  console.warn('Image failed to load:', event.target.src)
}

// Utility functions
const formatDate = (dateValue) => {
  return date.formatDate(dateValue, 'MMM DD, YYYY')
}

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const getTypeColor = (type) => {
  const colors = {
    'Video': 'red',
    'Music': 'purple',
    'Quote': 'orange',
    'Book': 'blue',
    'Article': 'green'
  }
  return colors[type] || 'grey'
}

// Lifecycle hooks
onMounted(async () => {
  try {
    await loadInitialData()
  } catch (error) {
    console.error('Failed to load initial data:', error)
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})

// Internationalization setup (mock)
const $t = (key) => {
  const translations = {
    'navigation.menu': 'Menu',
    'navigation.home': 'Home',
    'navigation.bookmarks': 'Bookmarks',
    'navigation.explore': 'Explore',
    'navigation.topics': 'Topics',
    'navigation.collections': 'Collections',
    'navigation.history': 'History',
    'navigation.notifications': 'Notifications',
    'navigation.profile': 'Profile',
    'navigation.settings': 'Settings',
    'navigation.quickActions': 'Quick Actions',
    'actions.search': 'Search',
    'actions.retry': 'Retry',
    'actions.loadMore': 'Load More',
    'actions.getStarted': 'Get Started',
    'actions.createContent': 'Create Content',
    'actions.bookmarked': 'Bookmarked',
    'actions.unbookmarked': 'Removed from bookmarks',
    'actions.close': 'Close',
    'auth.logout': 'Logout',
    'auth.loggedOut': 'Successfully logged out',
    'auth.logoutError': 'Failed to logout',
    'home.welcome': 'Welcome to Edifeeds',
    'home.subtitle': 'Discover inspiring content for your spiritual journey',
    'sections.explore': 'Explore Content',
    'sections.exploreDescription': 'Discover new and trending spiritual content',
    'sections.topics': 'Topical Categories',
    'sections.topicsDescription': 'Browse content by spiritual themes',
    'sections.collections': 'Featured Collections',
    'sections.collectionsDescription': 'Curated content collections',
    'search.placeholder': 'Search for content...',
    'errors.loadingFailed': 'Failed to load content',
    'errors.bookmarkFailed': 'Failed to bookmark content',
    'errors.loadMoreFailed': 'Failed to load more content',
    'notifications.opened': 'Notifications opened',
    'common.items': 'items'
  }
  return translations[key] || key
}
</script>

<style scoped>
.hero-section {
  margin-bottom: 3rem;
}

.hero-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 300px;
  display: flex;
  align-items: center;
}

.section-header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.explore-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.explore-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.card-image-container {
  position: relative;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
}

.collection-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.collection-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.topics-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.topic-chip {
  transition: all 0.2s ease;
  border-radius: 20px;
  font-weight: 500;
}

.topic-chip:hover {
  transform: scale(1.05);
}

.search-card {
  width: 100%;
  max-width: 600px;
  border-radius: 12px;
}

.search-input {
  padding: 16px 20px;
  font-size: 16px;
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  max-height: 2.8em;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.bg-gradient-up {
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-card {
    min-height: 200px;
  }
  
  .section-header {
    text-align: left;
    margin-bottom: 1.5rem;
  }
  
  .topics-grid {
    justify-content: flex-start;
  }
}

/* Dark mode support */
.body--dark .explore-card,
.body--dark .collection-card {
  background: var(--q-dark-page);
  border: 1px solid var(--q-dark-separator);
}

.body--dark .hero-card {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}

/* Accessibility improvements */
.explore-card:focus,
.collection-card:focus {
  outline: 2px solid var(--q-primary);
  outline-offset: 2px;
}

/* Loading states */
.q-skeleton {
  border-radius: 8px;
}

/* Animation classes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--q-grey-2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--q-grey-6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--q-grey-8);
}

/* Print styles */
@media print {
  .q-header,
  .q-drawer,
  .q-btn {
    display: none !important;
  }
}
</style>