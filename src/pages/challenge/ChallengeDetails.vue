<template>
  <q-page class="glassmorphism-page">
    <!-- Background gradient -->
    <div class="page-background"></div>

    <div class="page-content">
      <!-- Enhanced toolbar with glassmorphism -->
      <div class="glass-toolbar">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          @click="goBack"
          class="glass-btn"
        />
        <div class="toolbar-title">{{ challenge?.title || 'Loading...' }}</div>
      </div>

      <div v-if="challenge" class="challenge-container">
        <!-- Main challenge card -->
        <div class="glass-card main-card">
          <div class="card-header">
            <h2 class="challenge-title">{{ challenge.title }}</h2>
            <p class="challenge-description">{{ challenge.description }}</p>
          </div>

          <div class="divider"></div>

          <!-- Progress section -->
          <div class="progress-section">
            <div class="progress-container">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${(progress / challenge.days) * 100}%` }"
                ></div>
              </div>
              <div class="progress-text">
                {{ progress }} / {{ challenge.days }} days completed
              </div>
            </div>
          </div>

          <!-- Action section -->
          <div class="action-section">
            <button
              v-if="!started"
              @click="startChallenge"
              class="glass-btn primary-btn"
            >
              <span class="btn-text">Start Challenge</span>
              <div class="btn-glow"></div>
            </button>

            <div v-else class="days-container">
              <div
                v-for="(link, index) in challenge.content_links"
                :key="index"
                class="day-card glass-card"
              >
                <div class="day-header">
                  <span class="day-number">Day {{ index + 1 }}</span>
                  <div class="day-actions">
                    <button
                      class="glass-btn secondary-btn"
                      @click="openContent(link)"
                    >
                      <q-icon name="open_in_new" size="16px" />
                      View Content
                    </button>
                    <button
                      class="glass-btn"
                      :class="{ 'completed': completedDays.includes(index), 'success-btn': !completedDays.includes(index) }"
                      :disabled="completedDays.includes(index)"
                      @click="markDayComplete(index)"
                    >
                      <q-icon
                        :name="completedDays.includes(index) ? 'check_circle' : 'radio_button_unchecked'"
                        size="16px"
                      />
                      {{ completedDays.includes(index) ? 'Completed' : 'Mark Complete' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { Notify } from 'quasar'

const route = useRoute()
const router = useRouter()

const challenge = ref(null)
const started = ref(false)
const completedDays = ref([])
const progress = ref(0)

const fetchChallenge = async () => {
  try {
    const res = await api.get(`/api/challenges/${route.params.id}`)
    challenge.value = res.data.challenge

    // check if user has started
    const userRes = await api.get('/api/user_challenges')
    const userChallenge = userRes.data.find(uc => uc.challenge_id === route.params.id)
    if (userChallenge) {
      started.value = true
      completedDays.value = userChallenge.progress || []
      progress.value = completedDays.value.length
    }
  } catch (err) {
    console.error(err)
    Notify.create({ type: 'negative', message: 'Error loading challenge' })
  }
}

const startChallenge = async () => {
  try {
    await api.post(`/api/challenges/${route.params.id}/start`)
    started.value = true
    completedDays.value = []
    progress.value = 0
    Notify.create({ type: 'positive', message: 'Challenge started!' })
  } catch (err) {
    console.error(err)
    Notify.create({ type: 'negative', message: 'Failed to start challenge' })
  }
}

const markDayComplete = async (dayIndex) => {
  try {
    await api.post(`/api/challenges/${route.params.id}/mark_day_complete`, { day: dayIndex })
    completedDays.value.push(dayIndex)
    progress.value = completedDays.value.length
    Notify.create({ type: 'positive', message: `Day ${dayIndex + 1} marked as complete!` })
  } catch (err) {
    console.error(err)
    Notify.create({ type: 'negative', message: 'Failed to mark day complete' })
  }
}

const openContent = (link) => {
  window.open(link, '_blank')
}

const goBack = () => {
  router.back()
}

onMounted(fetchChallenge)
</script>

<style scoped>
.glassmorphism-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.page-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: -1;
}

.page-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
  animation: backgroundShift 10s ease-in-out infinite;
}

@keyframes backgroundShift {
  0%, 100% { transform: translateX(0px) translateY(0px); }
  50% { transform: translateX(-20px) translateY(-10px); }
}

.page-content {
  position: relative;
  z-index: 1;
  padding: 20px;
}

.glass-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 12px 20px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.toolbar-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.challenge-container {
  max-width: 800px;
  margin: 0 auto;
}

.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.main-card {
  padding: 32px;
}

.card-header {
  text-align: center;
  margin-bottom: 24px;
}

.challenge-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.challenge-description {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.6;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  margin: 24px 0;
}

.progress-section {
  margin-bottom: 32px;
}

.progress-container {
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-weight: 500;
}

.glass-btn {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 20px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 8px;
}

.glass-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.glass-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 32px;
  font-size: 1.1rem;
  border: none;
  width: 100%;
  justify-content: center;
}

.primary-btn:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.primary-btn:hover .btn-glow {
  left: 100%;
}

.secondary-btn {
  background: rgba(102, 126, 234, 0.3);
  border: 1px solid rgba(102, 126, 234, 0.5);
}

.success-btn {
  background: rgba(76, 175, 80, 0.3);
  border: 1px solid rgba(76, 175, 80, 0.5);
}

.success-btn:hover {
  background: rgba(76, 175, 80, 0.4);
}

.completed {
  background: rgba(76, 175, 80, 0.5);
  border: 1px solid rgba(76, 175, 80, 0.7);
}

.days-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.day-card {
  padding: 20px;
  margin-bottom: 0;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.day-number {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.day-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .page-content {
    padding: 16px;
  }

  .main-card {
    padding: 24px;
  }

  .challenge-title {
    font-size: 1.5rem;
  }

  .day-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .day-actions {
    width: 100%;
  }

  .glass-btn {
    flex: 1;
    min-width: 0;
  }
}
</style>
