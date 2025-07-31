<template>
  <q-page class="challenges-page">
    <!-- Background with subtle gradient -->
    <div class="page-background"></div>

    <!-- Enhanced header with glassmorphism -->
    <div class="header-container">
      <q-toolbar class="toolbar-glass">
        <q-toolbar-title class="header-title">
          <q-icon name="emoji_events" size="32px" class="header-icon" />
          Content Challenges
        </q-toolbar-title>
        <q-btn
          flat
          round
          icon="refresh"
          @click="refreshChallenges"
          :loading="loading"
          class="refresh-btn"
        />
      </q-toolbar>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <q-spinner-dots size="50px" color="primary" />
      <p class="loading-text">Loading challenges...</p>
    </div>

    <!-- Enhanced challenges list -->
    <div v-else class="challenges-container">
      <transition-group name="challenge-list" tag="div">
        <div
          v-for="challenge in challenges"
          :key="challenge.id"
          class="challenge-card"
          @click="goToChallenge(challenge)"
        >
          <div class="challenge-content">
            <div class="challenge-header">
              <div class="challenge-icon">
                <q-icon :name="getChallengeIcon(challenge.category)" size="24px" />
              </div>
              <div class="challenge-info">
                <h3 class="challenge-title">{{ challenge.title }}</h3>
                <p class="challenge-description">{{ challenge.description }}</p>
              </div>
            </div>

            <div class="challenge-meta">
              <div class="challenge-stats">
                <q-chip
                  :color="getDifficultyColor(challenge.difficulty)"
                  text-color="white"
                  size="sm"
                  class="difficulty-chip"
                >
                  {{ challenge.difficulty }}
                </q-chip>
                <q-chip
                  color="primary"
                  text-color="white"
                  size="sm"
                  icon="schedule"
                  class="duration-chip"
                >
                  {{ challenge.days }} days
                </q-chip>
              </div>

              <div class="challenge-progress" v-if="challenge.completed">
                <q-icon name="check_circle" color="positive" size="24px" />
              </div>
            </div>
          </div>

          <!-- Hover effect overlay -->
          <div class="card-overlay"></div>
        </div>
      </transition-group>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && challenges.length === 0" class="empty-state">
      <q-icon name="psychology" size="80px" color="grey-5" />
      <h3>No Challenges Available</h3>
      <p>Check back later for new content challenges!</p>
      <q-btn
        color="primary"
        label="Refresh"
        @click="refreshChallenges"
        class="refresh-empty-btn"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'

const router = useRouter()
const challenges = ref([])
const loading = ref(false)

// Sample data for demonstration (remove when connecting to real API)
const sampleChallenges = [
  {
    id: 1,
    title: "30-Day Writing Challenge",
    description: "Write 500 words daily to improve your writing skills",
    days: 30,
    difficulty: "Beginner",
    category: "writing",
    completed: false
  },
  {
    id: 2,
    title: "Video Creation Mastery",
    description: "Learn video editing and storytelling techniques",
    days: 21,
    difficulty: "Intermediate",
    category: "video",
    completed: true
  },
  {
    id: 3,
    title: "Photography Fundamentals",
    description: "Master composition, lighting, and editing",
    days: 14,
    difficulty: "Beginner",
    category: "photography",
    completed: false
  },
  {
    id: 4,
    title: "Social Media Strategy",
    description: "Build an engaging social media presence",
    days: 45,
    difficulty: "Advanced",
    category: "social",
    completed: false
  }
]

const fetchChallenges = async () => {
  loading.value = true
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Replace with actual API call
    // const res = await api.get('/api/challenges')
    // challenges.value = res.data

    // Using sample data for demonstration
    challenges.value = sampleChallenges

  } catch (err) {
    console.error(err)
    Notify.create({
      type: 'negative',
      message: 'Failed to load challenges',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const refreshChallenges = async () => {
  await fetchChallenges()
  Notify.create({
    type: 'positive',
    message: 'Challenges refreshed',
    position: 'top'
  })
}

const goToChallenge = (challenge) => {
  router.push({ name: 'challenge-detail', params: { id: challenge.id } })
}

const getChallengeIcon = (category) => {
  const icons = {
    writing: 'edit',
    video: 'videocam',
    photography: 'camera_alt',
    social: 'share',
    default: 'assignment'
  }
  return icons[category] || icons.default
}

const getDifficultyColor = (difficulty) => {
  const colors = {
    'Beginner': 'positive',
    'Intermediate': 'warning',
    'Advanced': 'negative'
  }
  return colors[difficulty] || 'primary'
}

onMounted(fetchChallenges)
</script>

<style scoped>
.challenges-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.page-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: -1;
}

.header-container {
  position: sticky;
  top: 0;
  z-index: 100;
  margin-bottom: 24px;
}

.toolbar-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  color: white;
}

.header-icon {
  color: #ffd700;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.refresh-btn {
  color: white;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(180deg);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: white;
}

.loading-text {
  margin-top: 16px;
  font-size: 18px;
  opacity: 0.8;
}

.challenges-container {
  padding: 0 16px;
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  max-width: 1200px;
  margin: 0 auto;
}

.challenge-card {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.challenge-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.challenge-card:hover .card-overlay {
  opacity: 1;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.challenge-content {
  position: relative;
  z-index: 1;
}

.challenge-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.challenge-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.challenge-info {
  flex: 1;
  min-width: 0;
}

.challenge-title {
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.challenge-description {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}

.challenge-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.challenge-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.difficulty-chip,
.duration-chip {
  font-size: 12px;
  font-weight: 500;
}

.challenge-progress {
  animation: checkmark 0.5s ease-in-out;
}

@keyframes checkmark {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: white;
  text-align: center;
  padding: 40px;
}

.empty-state h3 {
  margin: 24px 0 12px 0;
  font-size: 24px;
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 32px 0;
  opacity: 0.8;
  font-size: 16px;
}

.refresh-empty-btn {
  border-radius: 24px;
  padding: 12px 32px;
  font-weight: 600;
}

/* Animations */
.challenge-list-enter-active {
  transition: all 0.5s ease;
}

.challenge-list-leave-active {
  transition: all 0.3s ease;
}

.challenge-list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.challenge-list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.challenge-list-move {
  transition: transform 0.3s ease;
}

/* Responsive design */
@media (max-width: 768px) {
  .challenges-container {
    grid-template-columns: 1fr;
    padding: 0 12px;
  }

  .challenge-card {
    padding: 20px;
  }

  .challenge-header {
    gap: 12px;
  }

  .challenge-icon {
    width: 40px;
    height: 40px;
  }

  .challenge-title {
    font-size: 18px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .challenge-card {
    background: rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .challenge-card:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }
}
</style>
