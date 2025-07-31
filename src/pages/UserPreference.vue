<template>
  <q-page class="spiritual-app">
    <!-- Header with user greeting -->
    <div class="header-section q-pa-md">
      <div class="container">
        <div class="row items-center">
          <div class="col">
            <h4 class="text-h4 text-weight-light q-mb-sm">
              Good {{ getTimeOfDay }}, {{ userName }}
            </h4>
            <p class="text-subtitle1 text-grey-7">
              "Be still and know that I am God" - Psalm 46:10
            </p>
          </div>
          <div class="col-auto">
            <q-avatar size="60px" class="spiritual-avatar">
              <q-icon name="person" size="30px" />
            </q-avatar>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="content-section q-pa-md">
      <div class="container">
        <!-- Tab Navigation -->
        <q-tabs
          v-model="activeTab"
          dense
          class="text-primary q-mb-lg"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="profile" icon="person" label="Profile" />
          <q-tab name="preferences" icon="settings" label="Preferences" />
          <q-tab name="progress" icon="trending_up" label="Progress" />
          <q-tab name="journal" icon="book" label="Journal" />
        </q-tabs>

        <!-- Tab Panels -->
        <q-tab-panels v-model="activeTab" animated>
          <!-- Profile Settings Panel -->
          <q-tab-panel name="profile" class="q-pa-none">
            <q-card class="spiritual-card">
              <q-card-section>
                <div class="card-header">
                  <q-icon name="person" size="24px" class="q-mr-sm" />
                  <span class="text-h6">Spiritual Profile</span>
                </div>

                <div class="q-mt-md">
                  <q-input
                    filled
                    v-model="userName"
                    label="Display Name"
                    class="q-mb-md"
                    :rules="[val => !!val || 'Name is required']"
                  />

                  <q-select
                    filled
                    v-model="interests"
                    :options="interestOptions"
                    label="Select Your Spiritual Interests"
                    multiple
                    emit-value
                    map-options
                    class="q-mb-md"
                    hint="Choose topics that resonate with your spiritual journey"
                  >
                    <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
                      <q-item v-bind="itemProps">
                        <q-item-section side>
                          <q-icon :name="opt.icon" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ opt.label }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-checkbox :model-value="selected" @click="toggleOption(opt)" />
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>

                  <q-select
                    filled
                    v-model="spiritualLevel"
                    :options="spiritualLevels"
                    label="Spiritual Journey Stage"
                    class="q-mb-md"
                    hint="This helps us customize content for you"
                  />

                  <q-btn
                    label="Save Profile"
                    color="primary"
                    class="full-width q-mt-md"
                    @click="saveProfile"
                    :loading="saving"
                  />
                </div>
              </q-card-section>
            </q-card>
          </q-tab-panel>

          <!-- Feed Preferences Panel -->
          <q-tab-panel name="preferences" class="q-pa-none">
            <q-card class="spiritual-card">
              <q-card-section>
                <div class="card-header">
                  <q-icon name="settings" size="24px" class="q-mr-sm" />
                  <span class="text-h6">Feed Preferences</span>
                </div>

                <div class="q-mt-md">
                  <!-- Quiet Time Section -->
                  <div class="preference-group">
                    <div class="preference-header">
                      <q-icon name="schedule" class="q-mr-sm" />
                      <span class="text-subtitle1">Quiet Time Reminder</span>
                    </div>
                    <q-time
                      v-model="quietTime"
                      class="q-mt-sm"
                      format24h
                      :hour-options="hourOptions"
                    />
                  </div>

                  <!-- Content Preferences -->
                  <div class="preference-group">
                    <div class="preference-header">
                      <q-icon name="content_copy" class="q-mr-sm" />
                      <span class="text-subtitle1">Content Settings</span>
                    </div>

                    <q-list class="q-mt-sm">
                      <q-item>
                        <q-item-section>
                          <q-item-label>Devotional Snippets</q-item-label>
                          <q-item-label caption>Daily inspirational content</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-toggle v-model="preferences.devotionalSnippets" />
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label>Music Recommendations</q-item-label>
                          <q-item-label caption>Worship and Christian music</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-toggle v-model="preferences.musicRecommendations" />
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-item-label>Verse Notifications</q-item-label>
                          <q-item-label caption>Daily scripture reminders</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-toggle v-model="preferences.verseNotifications" />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>

                  <!-- Notification Frequency -->
                  <div class="preference-group">
                    <q-select
                      filled
                      v-model="preferences.quoteFrequency"
                      :options="frequencyOptions"
                      label="Inspirational Quote Frequency"
                      class="q-mt-md"
                    />
                  </div>

                  <q-btn
                    label="Save Preferences"
                    color="primary"
                    class="full-width q-mt-md"
                    @click="savePreferences"
                    :loading="saving"
                  />
                </div>
              </q-card-section>
            </q-card>
          </q-tab-panel>

          <!-- Progress Tracker Panel -->
          <q-tab-panel name="progress" class="q-pa-none">
            <q-card class="spiritual-card">
              <q-card-section>
                <div class="card-header">
                  <q-icon name="trending_up" size="24px" class="q-mr-sm" />
                  <span class="text-h6">Spiritual Progress</span>
                </div>

                <div class="q-mt-md">
                  <!-- Progress Stats -->
                  <div class="row q-gutter-md q-mb-lg">
                    <div class="col-12 col-md-4" v-for="(stat, index) in progressStats" :key="index">
                      <q-card class="progress-stat-card">
                        <q-card-section class="text-center">
                          <q-icon :name="stat.icon" size="32px" :color="stat.color" class="q-mb-sm" />
                          <div class="text-h4 text-weight-bold">{{ stat.value }}</div>
                          <div class="text-caption">{{ stat.label }}</div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>

                  <!-- Weekly Progress -->
                  <div class="progress-section">
                    <div class="text-subtitle1 q-mb-md">This Week's Journey</div>
                    <q-list bordered separator>
                      <q-item v-for="(item, index) in weeklyProgress" :key="index">
                        <q-item-section side>
                          <q-icon :name="item.icon" :color="item.color" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ item.label }}</q-item-label>
                          <q-item-label caption>{{ item.subtitle }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-circular-progress
                            :value="item.progress"
                            size="40px"
                            :thickness="0.2"
                            :color="item.color"
                            class="q-ma-md"
                          >
                            <div class="text-caption">{{ item.progress }}%</div>
                          </q-circular-progress>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>

                  <!-- Achievements -->
                  <div class="achievements-section q-mt-lg">
                    <div class="text-subtitle1 q-mb-md">Recent Achievements</div>
                    <div class="row q-gutter-sm">
                      <div class="col-auto" v-for="achievement in achievements" :key="achievement.id">
                        <q-badge
                          :color="achievement.unlocked ? 'positive' : 'grey-4'"
                          :text-color="achievement.unlocked ? 'white' : 'grey-7'"
                          :label="achievement.name"
                          class="achievement-badge"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-tab-panel>

          <!-- Prayer Journal Panel -->
          <q-tab-panel name="journal" class="q-pa-none">
            <q-card class="spiritual-card">
              <q-card-section>
                <div class="card-header">
                  <q-icon name="book" size="24px" class="q-mr-sm" />
                  <span class="text-h6">Prayer Journal</span>
                </div>

                <div class="q-mt-md">
                  <!-- Today's Entry -->
                  <div class="journal-entry-section">
                    <div class="text-subtitle1 q-mb-md">Today's Entry</div>

                    <q-input
                      filled
                      v-model="journalEntry.title"
                      label="Entry Title (optional)"
                      class="q-mb-md"
                    />

                    <q-input
                      filled
                      v-model="journalEntry.note"
                      type="textarea"
                      label="Write your prayer, thoughts, or gratitude..."
                      autogrow
                      rows="4"
                      class="q-mb-md"
                      :rules="[val => !!val || 'Please share your thoughts']"
                    />

                    <div class="row q-gutter-md q-mb-md">
                      <div class="col-12 col-md-6">
                        <q-select
                          filled
                          v-model="journalEntry.mood"
                          :options="moods"
                          label="Today's Mood"
                          emit-value
                          map-options
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-select
                          filled
                          v-model="journalEntry.category"
                          :options="journalCategories"
                          label="Entry Category"
                        />
                      </div>
                    </div>

                    <q-btn
                      label="Save Entry"
                      color="primary"
                      class="full-width q-mt-md"
                      @click="saveJournalEntry"
                      :loading="saving"
                    />
                  </div>

                  <!-- Recent Entries -->
                  <div class="recent-entries-section q-mt-lg">
                    <div class="text-subtitle1 q-mb-md">Recent Entries</div>
                    <q-list bordered separator>
                      <q-item v-for="(entry, index) in recentEntries" :key="index" clickable>
                        <q-item-section side>
                          <q-avatar :color="entry.mood.color" text-color="white" size="32px">
                            {{ entry.mood.emoji }}
                          </q-avatar>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ entry.title || 'Untitled Entry' }}</q-item-label>
                          <q-item-label caption>{{ entry.date }} • {{ entry.category }}</q-item-label>
                          <q-item-label caption class="text-grey-7">
                            {{ entry.preview }}
                          </q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-btn flat round icon="more_vert" />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Notify } from 'quasar'

// Reactive data
const activeTab = ref('profile')
const saving = ref(false)
const userName = ref('Friend')

// Profile data
const interests = ref([])
const interestOptions = [
  { label: 'Worship & Praise', value: 'worship', icon: 'music_note' },
  { label: 'Bible Study', value: 'bible', icon: 'menu_book' },
  { label: 'Family Life', value: 'family', icon: 'family_restroom' },
  { label: 'Prayer & Meditation', value: 'prayer', icon: 'self_improvement' },
  { label: 'Youth Ministry', value: 'youth', icon: 'group' },
  { label: 'Community Service', value: 'service', icon: 'volunteer_activism' },
  { label: 'Christian Living', value: 'living', icon: 'favorite' },
  { label: 'Spiritual Growth', value: 'growth', icon: 'trending_up' }
]

const spiritualLevel = ref('')
const spiritualLevels = [
  'New Believer',
  'Growing in Faith',
  'Mature Believer',
  'Spiritual Mentor',
  'Church Leader'
]

// Preferences data
const preferences = ref({
  devotionalSnippets: true,
  musicRecommendations: true,
  verseNotifications: true,
  quoteFrequency: 'daily'
})

const quietTime = ref('07:00')
const hourOptions = Array.from({ length: 24 }, (_, i) => i)

const frequencyOptions = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'None', value: 'none' }
]

// Progress data
const progressStats = ref([
  { label: 'Days This Week', value: 5, icon: 'calendar_today', color: 'primary' },
  { label: 'Verses Read', value: 42, icon: 'menu_book', color: 'positive' },
  { label: 'Prayers Logged', value: 12, icon: 'favorite', color: 'deep-orange' }
])

const weeklyProgress = ref([
  { label: 'Daily Devotions', subtitle: '5 of 7 days', progress: 71, icon: 'book', color: 'primary' },
  { label: 'Prayer Time', subtitle: '3 of 7 days', progress: 43, icon: 'self_improvement', color: 'positive' },
  { label: 'Scripture Memory', subtitle: '2 verses this week', progress: 100, icon: 'psychology', color: 'deep-orange' },
  { label: 'Community Engagement', subtitle: '1 group this week', progress: 25, icon: 'group', color: 'purple' }
])

const achievements = ref([
  { id: 1, name: 'First Prayer', unlocked: true },
  { id: 2, name: 'Week Warrior', unlocked: true },
  { id: 3, name: 'Scripture Scholar', unlocked: false },
  { id: 4, name: 'Community Helper', unlocked: false }
])

// Journal data
const journalEntry = ref({
  title: '',
  note: '',
  mood: '',
  category: 'Prayer'
})

const moods = [
  { label: '😊 Joyful', value: 'joyful', emoji: '😊', color: 'positive' },
  { label: '😌 Peaceful', value: 'peaceful', emoji: '😌', color: 'blue' },
  { label: '🤔 Thoughtful', value: 'thoughtful', emoji: '🤔', color: 'orange' },
  { label: '😢 Struggling', value: 'struggling', emoji: '😢', color: 'negative' },
  { label: '🙏 Grateful', value: 'grateful', emoji: '🙏', color: 'purple' }
]

const journalCategories = [
  'Prayer Request',
  'Gratitude',
  'Reflection',
  'Bible Study',
  'Life Update',
  'Spiritual Growth'
]

const recentEntries = ref([
  {
    title: 'Morning Gratitude',
    date: 'Today',
    category: 'Gratitude',
    preview: 'Thankful for family and health...',
    mood: { emoji: '😊', color: 'positive' }
  },
  {
    title: 'Prayer for Wisdom',
    date: 'Yesterday',
    category: 'Prayer Request',
    preview: 'Seeking guidance for upcoming decisions...',
    mood: { emoji: '🤔', color: 'orange' }
  },
  {
    title: 'Bible Study Reflection',
    date: '2 days ago',
    category: 'Bible Study',
    preview: 'Studied Romans 8:28 today...',
    mood: { emoji: '😌', color: 'blue' }
  }
])

// Computed properties
const getTimeOfDay = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'
  return 'Evening'
})

// Methods
async function saveProfile() {
  if (!userName.value) {
    Notify.create({ type: 'warning', message: 'Please enter your name' })
    return
  }

  saving.value = true
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    Notify.create({
      type: 'positive',
      message: 'Profile saved successfully!',
      position: 'top'
    })
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Error saving profile' })
  } finally {
    saving.value = false
  }
}

async function savePreferences() {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    Notify.create({
      type: 'positive',
      message: 'Preferences updated successfully!',
      position: 'top'
    })
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Error saving preferences' })
  } finally {
    saving.value = false
  }
}

async function saveJournalEntry() {
  if (!journalEntry.value.note.trim()) {
    Notify.create({ type: 'warning', message: 'Please write something in your journal entry' })
    return
  }

  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Add to recent entries
    const newEntry = {
      title: journalEntry.value.title || 'Untitled Entry',
      date: 'Today',
      category: journalEntry.value.category,
      preview: journalEntry.value.note.substring(0, 50) + '...',
      mood: moods.find(m => m.value === journalEntry.value.mood) || moods[0]
    }
    recentEntries.value.unshift(newEntry)

    Notify.create({
      type: 'positive',
      message: 'Journal entry saved!',
      position: 'top'
    })

    // Reset form
    journalEntry.value = {
      title: '',
      note: '',
      mood: '',
      category: 'Prayer'
    }
  } catch (error) {
    Notify.create({ type: 'negative', message: 'Error saving journal entry' })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.spiritual-app {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.header-section {
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(102, 126, 234, 0.2);
}

.header-section h4 {
  color: #667eea;
  margin: 0;
}

.header-section p {
  color: rgba(102, 126, 234, 0.8);
  margin: 0;
  font-style: italic;
}

.spiritual-avatar {
  background: #667eea;
  color: white;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.content-section {
  padding-top: 2rem;
}

.spiritual-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  color: #667eea;
  font-weight: 600;
}

.preference-group {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.preference-header {
  display: flex;
  align-items: center;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.progress-stat-card {
  background: #ffffff;
  border-radius: 12px;
  transition: transform 0.2s ease;
  border: 1px solid rgba(102, 126, 234, 0.1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.progress-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.progress-section {
  margin-bottom: 2rem;
}

.achievements-section {
  padding: 1rem;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.achievement-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.achievement-badge:hover {
  transform: scale(1.05);
}

.journal-entry-section {
  margin-bottom: 2rem;
}

.recent-entries-section {
  padding: 1rem;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .header-section h4 {
    font-size: 1.5rem;
  }

  .progress-stat-card {
    margin-bottom: 1rem;
  }
}

/* Animation classes */
.q-tab-panels {
  background: transparent;
}

.q-tab-panel {
  padding: 0;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.4);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.6);
}
</style>
