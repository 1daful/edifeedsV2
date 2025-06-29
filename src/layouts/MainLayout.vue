<template>
  <q-layout view="lHh Lpr lFf">
    <q-inner-loading :showing="loading" color="primary">
      <q-spinner-dots size="50px" />
    </q-inner-loading>
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
          {{ appConfig.name }}
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
        <q-btn-dropdown
          flat
          round
          icon="person"
          aria-label="Profile"
          data-testid="profile-dropdown"
        >
          <q-list>
            <q-item clickable @click="router.push('/profile')" v-close-popup>
              <q-item-section avatar>
                <template v-if="authStore.user">
                  <img v-if="authStore.user.user_metadata.avatar" :src="authStore.user.user_metadata.avatar" />
                  <span v-else>{{ authStore.user.user_metadata.first_name?.charAt(0).toUpperCase() }}</span>
                </template>
                <q-icon name="person" v-else/>
              </q-item-section>
              <q-item-section>Profile</q-item-section>
            </q-item>
            <q-item clickable @click="router.push('/settings')" v-close-popup>
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>Settings</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable @click="authStore.logout()" v-close-popup>
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>Logout</q-item-section>
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
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <div class="text-h6 text-weight-bold q-mb-md">Menu</div>
          <q-list>
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

            <q-item-label header class="text-grey-8">
            {{ 'QuickActions' }}
          </q-item-label>

          <q-item clickable v-ripple @click="router.push('/create-content') ">
            <q-item-section avatar>
              <q-icon name="add_circle" color="positive" />
            </q-item-section>
            <q-item-section>{{ 'CreateContent' }}</q-item-section>
          </q-item>

          </q-list>
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- Main Content -->
    <q-page-container>
      <router-view class="q-pa-md" />
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

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { appConfig } from "../../config";
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()
const drawer = ref(false)
const drawerLoading = ref(false)
const loading = ref(true)
const error = ref(null)
const activeMenuItem = ref('home')
const searchDialog = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
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
  { id: 'settings', label: 'Settings', icon: 'settings' },
  { id: 'explore', label: 'explore', icon: 'explore', route: '/explore' },
  { id: 'topics', label: 'topics', icon: 'topic', route: '/topics' },
  { id: 'collections', label: 'collections', icon: 'collections', route: '/collections' },
  { id: 'history', label: 'history', icon: 'history', route: '/history' }
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

/*const openNotifications = () => {
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
}*/

const handleImageError = (event) => {
  // Set fallback image
  event.target.src = 'https://via.placeholder.com/300x200/E0E0E0/757575?text=Image+Not+Found'
}

const showError = (message) => {
  error.value = message
  setTimeout(() => {
    if (error.value === message) {
      error.value = null
    }
  }, 5000)
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
