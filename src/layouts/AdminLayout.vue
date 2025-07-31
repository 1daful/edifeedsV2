<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Top Bar -->
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          @click="toggleDrawer"
          :class="{ 'rotate-180': leftDrawerOpen }"
          class="transition-transform duration-300"
        />

        <q-toolbar-title class="flex items-center gap-2">
          <q-avatar size="32px" class="bg-white text-primary">
            <q-icon name="auto_awesome" />
          </q-avatar>
          Edifeeds Admin
          <q-chip
            v-if="currentPageTitle"
            size="sm"
            color="white"
            text-color="primary"
            :label="currentPageTitle"
            class="ml-4"
          />
        </q-toolbar-title>

        <q-space />

        <!-- Search -->
        <q-btn
          flat
          dense
          round
          icon="search"
          @click="showSearch = !showSearch"
          class="mr-2"
        >
          <q-tooltip>Search</q-tooltip>
        </q-btn>

        <!-- Notifications -->
        <q-btn
          flat
          dense
          round
          icon="notifications"
          class="mr-2"
          @click="showNotifications = true"
        >
          <q-badge v-if="notifications.length > 0" color="red" floating>
            {{ notifications.length }}
          </q-badge>
          <q-tooltip>Notifications ({{ notifications.length }})</q-tooltip>
        </q-btn>

        <!-- User Menu -->
        <q-btn flat dense round icon="account_circle">
          <q-menu>
            <q-list style="min-width: 200px">
              <q-item>
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" size="40px">
                    {{ userInitials }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ currentUser.name }}</q-item-label>
                  <q-item-label caption>{{ currentUser.role }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup @click="viewProfile">
                <q-item-section avatar><q-icon name="person" /></q-item-section>
                <q-item-section>Profile</q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="toggleTheme">
                <q-item-section avatar>
                  <q-icon :name="isDark ? 'light_mode' : 'dark_mode'" />
                </q-item-section>
                <q-item-section>{{ isDark ? 'Light Mode' : 'Dark Mode' }}</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup @click="confirmLogout">
                <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>

      <!-- Search Bar -->
      <q-slide-transition>
        <q-toolbar v-show="showSearch" class="bg-white text-dark">
          <q-input
            v-model="searchQuery"
            placeholder="Search content, users, analytics..."
            filled
            dense
            class="full-width"
            @keyup.enter="performSearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-btn
                flat
                dense
                round
                icon="close"
                @click="closeSearch"
              />
            </template>
          </q-input>
        </q-toolbar>
      </q-slide-transition>
    </q-header>

    <!-- Sidebar Drawer -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="280"
      :breakpoint="1024"
      class="drawer-custom"
    >
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <!-- User Info Card -->
          <q-card flat bordered class="q-mb-md bg-gradient-to-r from-primary to-secondary text-white">
            <q-card-section class="text-center q-py-md">
              <q-avatar size="60px" class="q-mb-sm">
                <img :src="currentUser.avatar || '/default-avatar.png'" />
              </q-avatar>
              <div class="text-h6">{{ currentUser.name }}</div>
              <div class="text-caption opacity-80">{{ currentUser.email }}</div>
            </q-card-section>
          </q-card>

          <!-- Quick Stats -->
          <div class="row q-gutter-sm q-mb-md">
            <div class="col">
              <q-card flat bordered class="text-center q-pa-sm">
                <div class="text-h6 text-primary">{{ stats.totalUsers }}</div>
                <div class="text-caption">Users</div>
              </q-card>
            </div>
            <div class="col">
              <q-card flat bordered class="text-center q-pa-sm">
                <div class="text-h6 text-positive">{{ stats.activeContent }}</div>
                <div class="text-caption">Content</div>
              </q-card>
            </div>
          </div>
        </div>

        <q-list padding>
          <!-- Dashboard -->
          <q-item
            clickable
            v-ripple
            :to="{ name: 'admin-dashboard' }"
            exact-active-class="bg-primary text-white"
            class="rounded-borders q-ma-xs"
          >
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>Dashboard</q-item-section>
            <q-item-section side v-if="pendingTasks > 0">
              <q-badge color="red" :label="pendingTasks" />
            </q-item-section>
          </q-item>

          <!-- Topic Manager -->
          <q-item
            clickable
            v-ripple
            to="/admin/topics"
            active-class="bg-primary text-white"
            class="rounded-borders q-ma-xs"
          >
            <q-item-section avatar>
              <q-icon name="topic" />
            </q-item-section>
            <q-item-section>Topic Manager</q-item-section>
          </q-item>

          <!-- Content Management -->
          <q-expansion-item
            icon="collections"
            label="Content Management"
            :default-opened="isContentSectionActive"
            class="content-expansion"
          >
            <template v-slot:header>
              <q-item-section avatar>
                <q-icon name="collections" />
              </q-item-section>
              <q-item-section>
                Content Management
              </q-item-section>
              <q-item-section side>
                <q-badge v-if="contentCounts.total > 0" color="blue" :label="contentCounts.total" />
              </q-item-section>
            </template>

            <q-list class="q-pl-md">
              <q-item
                v-for="contentType in contentTypes"
                :key="contentType.route"
                clickable
                v-ripple
                :to="{ name: contentType.route }"
                active-class="bg-blue-1 text-primary"
                class="rounded-borders q-ma-xs"
              >
                <q-item-section avatar>
                  <q-icon :name="contentType.icon" size="sm" />
                </q-item-section>
                <q-item-section>{{ contentType.label }}</q-item-section>
                <q-item-section side>
                  <q-badge
                    v-if="contentCounts[contentType.key] > 0"
                    color="grey-6"
                    :label="contentCounts[contentType.key]"
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>

          <!-- User Management -->
          <q-item
            clickable
            v-ripple
            :to="{ name: 'admin-users' }"
            active-class="bg-primary text-white"
            class="rounded-borders q-ma-xs"
          >
            <q-item-section avatar>
              <q-icon name="people" />
            </q-item-section>
            <q-item-section>User Management</q-item-section>
            <q-item-section side>
              <q-badge v-if="userCounts.pending > 0" color="orange" :label="userCounts.pending" />
            </q-item-section>
          </q-item>

          <!-- Prayer Requests -->
          <q-item
            clickable
            v-ripple
            :to="{ name: 'admin-prayers' }"
            active-class="bg-primary text-white"
            class="rounded-borders q-ma-xs"
          >
            <q-item-section avatar>
              <q-icon name="favorite" />
            </q-item-section>
            <q-item-section>Prayer Requests</q-item-section>
            <q-item-section side>
              <q-badge v-if="prayerRequests.new > 0" color="red" :label="prayerRequests.new" />
            </q-item-section>
          </q-item>

          <!-- Analytics -->
          <q-item
            clickable
            v-ripple
            :to="{ name: 'admin-analytics' }"
            active-class="bg-primary text-white"
            class="rounded-borders q-ma-xs"
          >
            <q-item-section avatar>
              <q-icon name="analytics" />
            </q-item-section>
            <q-item-section>Analytics & Reports</q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <!-- System Section -->
          <q-item-label header class="text-grey-7">System</q-item-label>

          <!-- Settings -->
          <q-item
            clickable
            v-ripple
            :to="{ name: 'admin-settings' }"
            active-class="bg-primary text-white"
            class="rounded-borders q-ma-xs"
          >
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>Settings</q-item-section>
          </q-item>

          <!-- Backup & Security -->
          <q-item
            clickable
            v-ripple
            :to="{ name: 'admin-backup' }"
            active-class="bg-primary text-white"
            class="rounded-borders q-ma-xs"
          >
            <q-item-section avatar>
              <q-icon name="security" />
            </q-item-section>
            <q-item-section>Backup & Security</q-item-section>
          </q-item>

          <!-- Help & Support -->
          <q-item
            clickable
            v-ripple
            @click="showHelp = true"
            class="rounded-borders q-ma-xs"
          >
            <q-item-section avatar>
              <q-icon name="help" />
            </q-item-section>
            <q-item-section>Help & Support</q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <!-- Logout -->
          <q-item
            clickable
            v-ripple
            @click="confirmLogout"
            class="rounded-borders q-ma-xs text-negative"
          >
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section>Logout</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- Main Content -->
    <q-page-container>
      <router-view v-slot="{ Component, route }">
        <transition
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          mode="out-in"
        >
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </q-page-container>

    <!-- Notifications Dialog -->
    <q-dialog v-model="showNotifications" position="right">
      <q-card style="width: 350px; max-height: 70vh">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Notifications</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-list v-if="notifications.length > 0">
            <q-item
              v-for="notification in notifications"
              :key="notification.id"
              class="q-mb-sm"
            >
              <q-item-section avatar>
                <q-avatar :color="notification.color" text-color="white">
                  <q-icon :name="notification.icon" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ notification.title }}</q-item-label>
                <q-item-label caption>{{ notification.message }}</q-item-label>
                <q-item-label caption class="text-grey-5">
                  {{ formatTime(notification.timestamp) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  size="sm"
                  round
                  flat
                  icon="close"
                  @click="dismissNotification(notification.id)"
                />
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else class="text-center text-grey-5 q-py-lg">
            <q-icon name="notifications_off" size="48px" class="q-mb-md" />
            <div>No new notifications</div>
          </div>
        </q-card-section>

        <q-card-actions align="right" v-if="notifications.length > 0">
          <q-btn flat color="primary" @click="clearAllNotifications">
            Clear All
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Help Dialog -->
    <q-dialog v-model="showHelp" maximized>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Help & Support</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-splitter v-model="helpSplitter" style="height: 70vh">
            <template v-slot:before>
              <q-list>
                <q-item-label header>Quick Help</q-item-label>
                <q-item clickable @click="selectedHelp = 'getting-started'">
                  <q-item-section>Getting Started</q-item-section>
                </q-item>
                <q-item clickable @click="selectedHelp = 'content-management'">
                  <q-item-section>Content Management</q-item-section>
                </q-item>
                <q-item clickable @click="selectedHelp = 'user-management'">
                  <q-item-section>User Management</q-item-section>
                </q-item>
                <q-item clickable @click="selectedHelp = 'troubleshooting'">
                  <q-item-section>Troubleshooting</q-item-section>
                </q-item>
              </q-list>
            </template>
            <template v-slot:after>
              <div class="q-pa-md">
                <div v-if="selectedHelp === 'getting-started'">
                  <h5>Getting Started with Edifeeds Admin</h5>
                  <p>Welcome to the Edifeeds admin panel. Here you can manage all aspects of your platform including content, users, and analytics.</p>
                </div>
                <!-- Add more help content sections -->
              </div>
            </template>
          </q-splitter>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

// Composables
const router = useRouter()
const route = useRoute()
const $q = useQuasar()

// Reactive state
const leftDrawerOpen = ref(true)
const showSearch = ref(false)
const showNotifications = ref(false)
const showHelp = ref(false)
const searchQuery = ref('')
const helpSplitter = ref(20)
const selectedHelp = ref('getting-started')

// Theme management
const isDark = ref($q.dark.isActive)

// User data
const currentUser = ref({
  name: 'Admin User',
  email: 'admin@edifeeds.com',
  role: 'Super Administrator',
  avatar: null
})

// Statistics
const stats = ref({
  totalUsers: 1247,
  activeContent: 892,
  pendingReviews: 23
})

const pendingTasks = computed(() => 5) // Calculate from various pending items

// Content types configuration
const contentTypes = ref([
  { label: 'Videos', route: 'admin-content-videos', icon: 'video_library', key: 'videos' },
  { label: 'Music', route: 'admin-content-music', icon: 'music_note', key: 'music' },
  { label: 'Articles', route: 'admin-content-articles', icon: 'article', key: 'articles' },
  { label: 'Quotes', route: 'admin-content-quotes', icon: 'format_quote', key: 'quotes' },
  { label: 'Events', route: 'admin-content-events', icon: 'event', key: 'events' }
])

// Content counts
const contentCounts = ref({
  videos: 156,
  music: 89,
  articles: 234,
  quotes: 145,
  events: 67,
  total: 691
})

// User counts
const userCounts = ref({
  pending: 8,
  active: 1239
})

// Prayer requests
const prayerRequests = ref({
  new: 12,
  total: 234
})

// Notifications
const notifications = ref([
  {
    id: 1,
    title: 'New User Registration',
    message: 'John Doe has registered and needs approval',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    icon: 'person_add',
    color: 'blue'
  },
  {
    id: 2,
    title: 'Content Flagged',
    message: 'A video has been flagged for review',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    icon: 'flag',
    color: 'orange'
  },
  {
    id: 3,
    title: 'System Alert',
    message: 'Server backup completed successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
    icon: 'backup',
    color: 'green'
  }
])

// Computed properties
const userInitials = computed(() => {
  const names = currentUser.value.name.split(' ')
  return names.map(name => name[0]).join('').toUpperCase()
})

const currentPageTitle = computed(() => {
  const titleMap = {
    'admin-dashboard': 'Dashboard',
    'admin-topics': 'Topics',
    'admin-content-videos': 'Videos',
    'admin-content-music': 'Music',
    'admin-content-articles': 'Articles',
    'admin-content-quotes': 'Quotes',
    'admin-content-events': 'Events',
    'admin-users': 'Users',
    'admin-prayers': 'Prayers',
    'admin-analytics': 'Analytics',
    'admin-settings': 'Settings'
  }
  return titleMap[route.name] || ''
})

const isContentSectionActive = computed(() => {
  return route.name && route.name.includes('admin-content')
})

// Methods
function toggleDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function toggleTheme() {
  $q.dark.toggle()
  isDark.value = $q.dark.isActive
}

function closeSearch() {
  showSearch.value = false
  searchQuery.value = ''
}

function performSearch() {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'admin-search',
      query: { q: searchQuery.value }
    })
    closeSearch()
  }
}

function viewProfile() {
  router.push({ name: 'admin-profile' })
}

function confirmLogout() {
  $q.dialog({
    title: 'Confirm Logout',
    message: 'Are you sure you want to logout?',
    cancel: true,
    persistent: true,
    color: 'negative'
  }).onOk(() => {
    logout()
  })
}

function logout() {
  // Clear authentication data
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')

  $q.notify({
    message: 'Successfully logged out',
    color: 'positive',
    position: 'top'
  })

  router.push('/login')
}

function dismissNotification(id) {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

function clearAllNotifications() {
  notifications.value = []
}

function formatTime(timestamp) {
  const now = new Date()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// Watchers
watch(route, () => {
  // Close search when route changes
  if (showSearch.value) {
    closeSearch()
  }
})

// Lifecycle
onMounted(() => {
  // Load initial data, check authentication, etc.
  console.log('Admin layout mounted')
})
</script>

<style lang="scss" scoped>
.drawer-custom {
  .q-item {
    margin: 2px 8px;
    border-radius: 8px;

    &.q-router-link--active {
      background: var(--q-primary);
      color: white;

      .q-item__section--avatar .q-icon {
        color: white;
      }
    }
  }
}

.content-expansion {
  .q-item {
    margin: 1px 4px;
  }
}

.rotate-180 {
  transform: rotate(180deg);
}

.transition-transform {
  transition: transform 0.3s ease;
}

.animated {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}

.fadeIn {
  animation-name: fadeIn;
}

.fadeOut {
  animation-name: fadeOut;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-20px); }
}
</style>
