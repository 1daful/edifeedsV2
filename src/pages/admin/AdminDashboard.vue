<template>
  <q-page class="q-pa-md">
    <!-- Header with Actions -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 q-mb-xs">
          Edifeeds Admin Dashboard
          <q-badge v-if="hasNewNotifications" color="red" floating>!</q-badge>
        </div>
        <div class="text-subtitle2 text-grey-7">
          Welcome back! Last updated {{ lastUpdateTime }}
        </div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          icon="refresh"
          color="primary"
          outline
          @click="refreshDashboard"
          :loading="loading"
          label="Refresh"
        />
        <q-btn
          icon="settings"
          color="secondary"
          flat
          @click="openSettings"
        />
      </div>
    </div>

    <!-- Loading State -->
    <q-linear-progress v-if="loading" indeterminate color="primary" class="q-mb-md" />

    <!-- Alert System -->
    <div v-if="alerts.length > 0" class="q-mb-md">
      <q-banner
        v-for="alert in alerts"
        :key="alert.id"
        :class="getBannerClass(alert.type)"
        dense
        rounded
        class="q-mb-sm"
      >
        <template #avatar>
          <q-icon :name="getAlertIcon(alert.type)" />
        </template>
        {{ alert.message }}
        <template #action>
          <q-btn
            flat
            color="white"
            icon="close"
            size="sm"
            @click="dismissAlert(alert.id)"
          />
        </template>
      </q-banner>
    </div>

    <!-- Enhanced Stats Cards with Trends -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="card in statsCards" :key="card.label" class="col-12 col-sm-6 col-md-3">
        <q-card class="stats-card" :class="{ 'stats-card--clickable': card.clickable }" @click="handleStatsClick(card)">
          <q-card-section class="text-center q-pb-none">
            <div class="row items-center justify-between q-mb-sm">
              <q-icon :name="card.icon" size="32px" :color="card.color || 'primary'" />
              <q-chip
                v-if="card.trend !== undefined"
                :color="card.trend >= 0 ? 'green' : 'red'"
                :icon="card.trend >= 0 ? 'trending_up' : 'trending_down'"
                text-color="white"
                size="sm"
              >
                {{ Math.abs(card.trend) }}%
              </q-chip>
            </div>
            <div class="text-h4 text-weight-bold">{{ formatNumber(card.count) }}</div>
            <div class="text-subtitle2 text-grey-7">{{ card.label }}</div>
            <div v-if="card.subtitle" class="text-caption text-grey-6">{{ card.subtitle }}</div>
          </q-card-section>

          <!-- Mini chart for trend visualization -->
          <q-card-section v-if="card.chartData" class="q-pt-none">
            <div class="mini-chart">
              <svg width="100%" height="30" viewBox="0 0 100 30">
                <polyline
                  :points="generateChartPoints(card.chartData)"
                  fill="none"
                  :stroke="card.color || '#1976d2'"
                  stroke-width="2"
                  opacity="0.7"
                />
              </svg>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Enhanced Quick Links with Categories -->
    <div class="text-h6 q-mb-sm flex items-center">
      <q-icon name="dashboard" class="q-mr-sm" />
      Quick Access
    </div>
    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="category in quickLinkCategories" :key="category.name" class="col-12 col-md-4">
        <div class="text-subtitle1 text-weight-medium q-mb-sm text-grey-8">
          {{ category.name }}
        </div>
        <div class="column q-gutter-sm">
          <q-card
            v-for="link in category.links"
            :key="link.label"
            class="quick-link-card cursor-pointer"
            @click="goTo(link.to)"
          >
            <q-card-section class="row items-center q-py-md">
              <q-icon :name="link.icon" size="24px" :color="link.color || 'secondary'" class="q-mr-md" />
              <div class="col">
                <div class="text-subtitle1">{{ link.label }}</div>
                <div v-if="link.description" class="text-caption text-grey-6">{{ link.description }}</div>
              </div>
              <q-badge v-if="link.badge" :color="link.badgeColor || 'primary'">
                {{ link.badge }}
              </q-badge>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Enhanced Recent Activity with Filtering -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-8">
        <q-card>
          <q-card-section class="row items-center">
            <div class="text-h6 col">
              <q-icon name="history" class="q-mr-sm" />
              Recent Activity
            </div>
            <q-select
              v-model="activityFilter"
              :options="activityFilterOptions"
              outlined
              dense
              style="min-width: 150px"
              @update:model-value="filterActivities"
            />
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-none" style="max-height: 400px; overflow-y: auto;">
            <div v-if="filteredActivities.length === 0" class="text-center q-pa-lg">
              <q-icon name="inbox" size="48px" color="grey-5" />
              <div class="text-subtitle1 q-mt-sm text-grey-6">No recent activities</div>
            </div>

            <q-list v-else separator>
              <q-item
                v-for="activity in filteredActivities"
                :key="activity.id"
                class="activity-item"
                :class="{ 'activity-item--unread': !activity.read }"
                @click="markAsRead(activity.id)"
              >
                <q-item-section avatar>
                  <q-avatar :color="getActivityColor(activity.type)" text-color="white" size="32px">
                    <q-icon :name="getActivityIcon(activity.type)" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ activity.message }}</q-item-label>
                  <q-item-label caption class="row items-center">
                    <q-icon name="schedule" size="14px" class="q-mr-xs" />
                    {{ activity.time }}
                    <q-space />
                    <q-chip v-if="activity.priority === 'high'" color="red" text-color="white" size="xs">
                      High Priority
                    </q-chip>
                  </q-item-label>
                </q-item-section>

                <q-item-section side v-if="!activity.read">
                  <q-badge color="primary" floating />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-separator />

          <q-card-actions align="center">
            <q-btn flat color="primary" @click="viewAllActivities">
              View All Activities
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>

      <!-- System Status Panel -->
      <div class="col-12 col-lg-4">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="monitor_heart" class="q-mr-sm" />
              System Status
            </div>

            <div v-for="status in systemStatus" :key="status.service" class="row items-center q-mb-sm">
              <q-icon
                :name="status.status === 'healthy' ? 'check_circle' : 'error'"
                :color="status.status === 'healthy' ? 'green' : 'red'"
                class="q-mr-sm"
              />
              <div class="col">
                <div class="text-body2">{{ status.service }}</div>
                <div class="text-caption text-grey-6">{{ status.lastCheck }}</div>
              </div>
              <q-chip
                :color="status.status === 'healthy' ? 'green' : 'red'"
                text-color="white"
                size="sm"
              >
                {{ status.status }}
              </q-chip>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Performance Metrics</div>
            <div v-for="metric in performanceMetrics" :key="metric.name" class="q-mb-sm">
              <div class="row items-center justify-between q-mb-xs">
                <span class="text-body2">{{ metric.name }}</span>
                <span class="text-caption">{{ metric.value }}{{ metric.unit }}</span>
              </div>
              <q-linear-progress
                :value="metric.percentage / 100"
                :color="metric.percentage > 80 ? 'red' : metric.percentage > 60 ? 'orange' : 'green'"
                size="4px"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Settings Dialog -->
    <q-dialog v-model="showSettings" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <q-avatar icon="settings" color="primary" text-color="white" />
          <span class="q-ml-sm text-h6">Dashboard Settings</span>
        </q-card-section>

        <q-card-section>
          <q-toggle
            v-model="settings.autoRefresh"
            label="Auto-refresh dashboard"
            color="primary"
          />
          <q-select
            v-if="settings.autoRefresh"
            v-model="settings.refreshInterval"
            :options="refreshIntervalOptions"
            label="Refresh interval"
            outlined
            class="q-mt-md"
          />
          <q-toggle
            v-model="settings.notifications"
            label="Enable notifications"
            color="primary"
            class="q-mt-md"
          />
          <q-toggle
            v-model="settings.compactView"
            label="Compact view"
            color="primary"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" @click="showSettings = false" />
          <q-btn label="Save" color="primary" @click="saveSettings" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

// Reactive state
const loading = ref(false)
const lastUpdateTime = ref(new Date().toLocaleTimeString())
const showSettings = ref(false)
const activityFilter = ref('all')
const refreshTimer = ref(null)

// Settings
const settings = ref({
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  notifications: true,
  compactView: false
})

// Enhanced stats with trends and mini charts
const statsCards = ref([
  {
    label: 'Total Content',
    count: 1284,
    icon: 'collections',
    color: 'primary',
    trend: 12.5,
    subtitle: '+160 this month',
    clickable: true,
    chartData: [45, 52, 48, 61, 55, 67, 72, 69, 75, 82],
    route: '/admin/content'
  },
  {
    label: 'Active Topics',
    count: 12,
    icon: 'topic',
    color: 'secondary',
    trend: 8.3,
    subtitle: '3 pending review',
    clickable: true,
    chartData: [3, 5, 4, 7, 8, 9, 12, 11, 10, 12],
    route: '/admin/topics'
  },
  {
    label: 'Users',
    count: 3428,
    icon: 'people',
    color: 'positive',
    trend: 23.1,
    subtitle: '+89 this week',
    clickable: true,
    chartData: [2800, 2950, 3100, 3200, 3350, 3400, 3428, 3420, 3425, 3428],
    route: '/admin/users'
  },
  {
    label: 'Prayer Requests',
    count: 247,
    icon: 'favorite',
    color: 'deep-purple',
    trend: -5.2,
    subtitle: '23 awaiting response',
    clickable: true,
    chartData: [280, 275, 265, 270, 260, 255, 250, 248, 247, 247],
    route: '/admin/prayers'
  }
])

// Organized quick links by category
const quickLinkCategories = ref([
  {
    name: 'Content Management',
    links: [
      {
        label: 'Video Library',
        icon: 'video_library',
        to: '/admin/content/videos',
        color: 'red',
        description: 'Manage video content',
        badge: '24',
        badgeColor: 'red'
      },
      {
        label: 'Audio Messages',
        icon: 'library_music',
        to: '/admin/content/audio',
        color: 'purple',
        description: 'Audio sermons & talks'
      },
      {
        label: 'Articles & Blogs',
        icon: 'article',
        to: '/admin/content/articles',
        color: 'blue',
        description: 'Written content'
      }
    ]
  },
  {
    name: 'Community',
    links: [
      {
        label: 'User Management',
        icon: 'people',
        to: '/admin/users',
        color: 'green',
        description: 'Manage user accounts'
      },
      {
        label: 'Prayer Requests',
        icon: 'favorite',
        to: '/admin/prayers',
        color: 'deep-purple',
        description: 'Community prayers',
        badge: '23',
        badgeColor: 'deep-purple'
      },
      {
        label: 'Discussion Forums',
        icon: 'forum',
        to: '/admin/forums',
        color: 'orange',
        description: 'Community discussions'
      }
    ]
  },
  {
    name: 'Administration',
    links: [
      {
        label: 'Topics & Schedules',
        icon: 'schedule',
        to: '/admin/topics',
        color: 'teal',
        description: 'Manage weekly topics'
      },
      {
        label: 'Analytics',
        icon: 'analytics',
        to: '/admin/analytics',
        color: 'indigo',
        description: 'Platform insights'
      },
      {
        label: 'System Settings',
        icon: 'tune',
        to: '/admin/settings',
        color: 'grey-7',
        description: 'Platform configuration'
      }
    ]
  }
])

// Enhanced activities with types and priorities
const activities = ref([
  {
    id: 1,
    message: 'New user registered: Sarah Johnson',
    time: '2 minutes ago',
    type: 'user',
    priority: 'normal',
    read: false
  },
  {
    id: 2,
    message: 'Topic "Faith in Trials" scheduled for next week',
    time: '1 hour ago',
    type: 'content',
    priority: 'normal',
    read: true
  },
  {
    id: 3,
    message: 'System backup completed successfully',
    time: '2 hours ago',
    type: 'system',
    priority: 'low',
    read: true
  },
  {
    id: 4,
    message: 'Prayer request flagged for review',
    time: '4 hours ago',
    type: 'prayer',
    priority: 'high',
    read: false
  },
  {
    id: 5,
    message: '15 new prayer requests received',
    time: '6 hours ago',
    type: 'prayer',
    priority: 'normal',
    read: true
  }
])

// System status monitoring
const systemStatus = ref([
  { service: 'Database', status: 'healthy', lastCheck: '30s ago' },
  { service: 'Video Streaming', status: 'healthy', lastCheck: '1m ago' },
  { service: 'Push Notifications', status: 'healthy', lastCheck: '2m ago' },
  { service: 'Backup Service', status: 'healthy', lastCheck: '5m ago' }
])

// Performance metrics
const performanceMetrics = ref([
  { name: 'CPU Usage', value: 45, unit: '%', percentage: 45 },
  { name: 'Memory', value: 2.1, unit: 'GB', percentage: 65 },
  { name: 'Storage', value: 78, unit: '%', percentage: 78 },
  { name: 'Bandwidth', value: 125, unit: 'MB/s', percentage: 30 }
])

// Alerts system
const alerts = ref([
  {
    id: 1,
    message: 'Weekly topic scheduling reminder: Set topic for next week',
    type: 'warning'
  },
  {
    id: 2,
    message: 'New feature: Advanced analytics dashboard is now available',
    type: 'info'
  }
])

// Filter options
const activityFilterOptions = [
  { label: 'All Activities', value: 'all' },
  { label: 'User Activities', value: 'user' },
  { label: 'Content Updates', value: 'content' },
  { label: 'Prayer Requests', value: 'prayer' },
  { label: 'System Events', value: 'system' }
]

const refreshIntervalOptions = [
  { label: '15 seconds', value: 15000 },
  { label: '30 seconds', value: 30000 },
  { label: '1 minute', value: 60000 },
  { label: '5 minutes', value: 300000 }
]

// Computed properties
const hasNewNotifications = computed(() =>
  activities.value.some(activity => !activity.read)
)

const filteredActivities = computed(() => {
  if (activityFilter.value === 'all') {
    return activities.value
  }
  return activities.value.filter(activity => activity.type === activityFilter.value)
})

// Methods
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

function generateChartPoints(data) {
  const width = 100
  const height = 30
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - (value / Math.max(...data)) * height
    return `${x},${y}`
  })
  return points.join(' ')
}

function handleStatsClick(card) {
  if (card.clickable && card.route) {
    router.push(card.route)
  }
}

function goTo(path) {
  router.push(path)
}

function getBannerClass(type) {
  const classes = {
    info: 'bg-blue text-white',
    warning: 'bg-orange text-white',
    error: 'bg-red text-white',
    success: 'bg-green text-white'
  }
  return classes[type] || 'bg-grey text-white'
}

function getAlertIcon(type) {
  const icons = {
    info: 'info',
    warning: 'warning',
    error: 'error',
    success: 'check_circle'
  }
  return icons[type] || 'info'
}

function dismissAlert(id) {
  const index = alerts.value.findIndex(alert => alert.id === id)
  if (index > -1) {
    alerts.value.splice(index, 1)
  }
}

function getActivityIcon(type) {
  const icons = {
    user: 'person_add',
    content: 'edit',
    prayer: 'favorite',
    system: 'computer'
  }
  return icons[type] || 'notifications'
}

function getActivityColor(type) {
  const colors = {
    user: 'green',
    content: 'blue',
    prayer: 'deep-purple',
    system: 'orange'
  }
  return colors[type] || 'grey'
}

function markAsRead(id) {
  const activity = activities.value.find(a => a.id === id)
  if (activity) {
    activity.read = true
  }
}

function filterActivities() {
  // Filter logic is handled by computed property
}

function viewAllActivities() {
  router.push('/admin/activities')
}

async function refreshDashboard() {
  loading.value = true

  try {
    // Simulate API calls
    await Promise.all([
      fetchStats(),
      fetchActivities(),
      fetchSystemStatus()
    ])

    lastUpdateTime.value = new Date().toLocaleTimeString()

    $q.notify({
      type: 'positive',
      message: 'Dashboard refreshed successfully',
      position: 'top-right'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to refresh dashboard',
      position: 'top-right'
    })
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800))

  // Update stats with slight variations
  statsCards.value.forEach(card => {
    const variation = Math.floor(Math.random() * 5) - 2
    card.count += variation

    // Update chart data
    if (card.chartData) {
      card.chartData.shift()
      card.chartData.push(card.count / 40)
    }
  })
}

async function fetchActivities() {
  // Simulate fetching new activities
  await new Promise(resolve => setTimeout(resolve, 500))

  // Occasionally add a new activity
  if (Math.random() > 0.7) {
    const newActivity = {
      id: Date.now(),
      message: `New activity detected at ${new Date().toLocaleTimeString()}`,
      time: 'Just now',
      type: ['user', 'content', 'prayer', 'system'][Math.floor(Math.random() * 4)],
      priority: 'normal',
      read: false
    }
    activities.value.unshift(newActivity)

    // Keep only last 20 activities
    if (activities.value.length > 20) {
      activities.value = activities.value.slice(0, 20)
    }
  }
}

async function fetchSystemStatus() {
  // Simulate system health checks
  await new Promise(resolve => setTimeout(resolve, 300))

  systemStatus.value.forEach(status => {
    status.lastCheck = Math.floor(Math.random() * 60) + 's ago'
    // Occasionally simulate issues
    if (Math.random() > 0.95) {
      status.status = 'error'
    } else {
      status.status = 'healthy'
    }
  })

  // Update performance metrics
  performanceMetrics.value.forEach(metric => {
    const variation = (Math.random() - 0.5) * 10
    metric.percentage = Math.max(0, Math.min(100, metric.percentage + variation))

    if (metric.name === 'CPU Usage') {
      metric.value = Math.round(metric.percentage)
    } else if (metric.name === 'Memory') {
      metric.value = (metric.percentage * 0.032).toFixed(1)
    } else if (metric.name === 'Storage') {
      metric.value = Math.round(metric.percentage)
    } else if (metric.name === 'Bandwidth') {
      metric.value = Math.round(metric.percentage * 4)
    }
  })
}

function openSettings() {
  showSettings.value = true
}

function saveSettings() {
  // Save settings to localStorage or API
  localStorage.setItem('dashboardSettings', JSON.stringify(settings.value))

  showSettings.value = false

  $q.notify({
    type: 'positive',
    message: 'Settings saved successfully',
    position: 'top-right'
  })

  // Restart auto-refresh timer if needed
  setupAutoRefresh()
}

function loadSettings() {
  const saved = localStorage.getItem('dashboardSettings')
  if (saved) {
    settings.value = { ...settings.value, ...JSON.parse(saved) }
  }
}

function setupAutoRefresh() {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
  }

  if (settings.value.autoRefresh) {
    refreshTimer.value = setInterval(() => {
      refreshDashboard()
    }, settings.value.refreshInterval)
  }
}

// Watch for settings changes
watch(() => settings.value.autoRefresh, () => {
  setupAutoRefresh()
})

watch(() => settings.value.refreshInterval, () => {
  setupAutoRefresh()
})

// Lifecycle
onMounted(() => {
  loadSettings()
  refreshDashboard()
  setupAutoRefresh()
})

onUnmounted(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
  }
})
</script>

<style scoped>
.stats-card {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.stats-card--clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  border-left-color: var(--q-primary);
}

.quick-link-card {
  transition: all 0.2s ease;
}

.quick-link-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.activity-item {
  transition: background-color 0.2s ease;
}

.activity-item--unread {
  background-color: rgba(25, 118, 210, 0.05);
  border-left: 3px solid #1976d2;
}

.activity-item:hover {
  background-color: rgba(0,0,0,0.04);
}

.mini-chart {
  height: 30px;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .stats-card {
    margin-bottom: 16px;
  }

  .quick-link-card {
    margin-bottom: 8px;
  }
}
</style>
