<template>
  <q-page class="q-pa-md">
    <!-- Heading -->
    <div class="text-h5 q-mb-sm">Edifeeds Admin Dashboard</div>
    <div class="text-subtitle2 q-mb-md">Monitor and manage your platform activities at a glance.</div>

    <!-- Quick Stats Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <q-card v-for="card in statsCards" :key="card.label" class="col-12 col-sm-6 col-md-3">
        <q-card-section class="text-center">
          <q-icon :name="card.icon" size="48px" color="primary" />
          <div class="text-h6 q-mt-sm">{{ card.count }}</div>
          <div class="text-subtitle2">{{ card.label }}</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Quick Links -->
    <div class="text-h6 q-mb-sm">Quick Access</div>
    <div class="row q-col-gutter-md">
      <q-card
        v-for="link in quickLinks"
        :key="link.label"
        class="col-12 col-sm-6 col-md-4 cursor-pointer"
        @click="goTo(link.to)"
      >
        <q-card-section class="text-center">
          <q-icon :name="link.icon" size="36px" color="secondary" />
          <div class="text-subtitle1 q-mt-sm">{{ link.label }}</div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Recent Activity -->
    <div class="text-h6 q-mt-lg q-mb-sm">Recent Activity</div>
    <q-card>
      <q-card-section>
        <div v-if="activities.length === 0" class="text-caption text-grey">No recent activities.</div>
        <q-list v-else>
          <q-item v-for="activity in activities" :key="activity.id">
            <q-item-section>
              <q-item-label>{{ activity.message }}</q-item-label>
              <q-item-label caption>{{ activity.time }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Dummy data, replace with your backend API later
const statsCards = ref([
  { label: 'Total Content', count: 128, icon: 'collections' },
  { label: 'Active Topics', count: 5, icon: 'topic' },
  { label: 'Users', count: 342, icon: 'people' },
  { label: 'Prayer Requests', count: 12, icon: 'favorite' }
])

const quickLinks = ref([
  { label: 'Manage Topics', icon: 'topic', to: '/admin/topics' },
  { label: 'Content Management', icon: 'collections', to: '/admin/content/videos' },
  { label: 'User Management', icon: 'people', to: '/admin/users' }
])

const activities = ref([])

function goTo(path) {
  router.push(path)
}

// Replace with your actual fetch
function fetchStats() {
  // e.g., call API and update statsCards
}

function fetchActivities() {
  activities.value = [
    { id: 1, message: 'New user registered: John Doe', time: '2 hours ago' },
    { id: 2, message: 'Topic "Faith in Trials" set for next week.', time: '1 day ago' },
    { id: 3, message: '5 new prayer requests received.', time: '2 days ago' }
  ]
}

onMounted(() => {
  fetchStats()
  fetchActivities()
})
</script>
