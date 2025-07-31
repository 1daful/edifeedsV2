<template>
  <q-page class="elegant-home-page">
    <!-- Simple Background -->
    <div class="background-gradient"></div>

    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="gradient-text">What are you</span>
            <span class="looking-for">looking for today?</span>
          </h1>
          <p class="hero-subtitle">
            Discover inspiration, guidance, and uplifting content ✨
          </p>
        </div>

        <!-- Search Bar -->
        <div class="search-container">
          <q-input
            v-model="searchQuery"
            class="elegant-search"
            placeholder="Search for inspiration..."
            standout="bg-white/20 text-white"
            dark
            rounded
          >
            <template #prepend>
              <q-icon name="search" class="search-icon" />
            </template>
          </q-input>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Browse Topics Section -->
      <section class="content-section">
        <div class="section-header">
          <h2 class="section-title">Browse Topics</h2>
          <p class="section-subtitle">Explore what speaks to your heart</p>
        </div>

        <div class="topics-grid">
          <div
            v-for="topic in topics"
            :key="topic.id"
            class="topic-card"
            :style="{ background: topic.gradient }"
          >
            <q-icon :name="topic.icon" class="topic-icon" />
            <h3 class="topic-title">{{ topic.title }}</h3>
            <p class="topic-description">{{ topic.description }}</p>
          </div>
        </div>
      </section>

      <!-- Popular Now Section -->
      <section class="content-section">
        <div class="section-header">
          <h2 class="section-title">
            <q-icon name="trending_up" class="section-icon" />
            Popular Now
          </h2>
          <p class="section-subtitle">What's inspiring others right now</p>
        </div>

        <div class="popular-grid">
          <div
            v-for="item in popularItems"
            :key="item.id"
            class="popular-card"
          >
            <div class="card-thumbnail">
              <q-icon
                :name="item.type === 'video' ? 'play_circle' :
                       item.type === 'music' ? 'music_note' : 'menu_book'"
                class="thumbnail-icon"
              />
            </div>
            <div class="card-content">
              <h4 class="card-title">{{ item.title }}</h4>
              <p class="card-meta">{{ item.duration }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Explore by Type Section -->
      <section class="content-section">
        <div class="section-header">
          <h2 class="section-title">Explore by Type</h2>
          <p class="section-subtitle">Find your preferred way to connect</p>
        </div>

        <div class="explore-tabs">
          <q-tabs
            v-model="activeTab"
            class="custom-tabs"
            indicator-color="white"
            active-color="white"
            align="justify"
          >
            <q-tab name="videos" label="Videos" />
            <q-tab name="music" label="Music" />
            <q-tab name="books" label="Books" />
            <q-tab name="quotes" label="Quotes" />
          </q-tabs>

          <q-tab-panels v-model="activeTab" animated class="tab-panels">
            <q-tab-panel name="videos" class="tab-panel">
              <div class="content-grid">
                <div class="content-card" v-for="i in 6" :key="i">
                  <div class="content-thumbnail">
                    <q-icon name="play_circle" class="content-icon" />
                  </div>
                  <div class="content-info">
                    <h4>Inspiring Video {{ i }}</h4>
                    <p>{{ Math.floor(Math.random() * 20) + 5 }}:{{ String(Math.floor(Math.random() * 60)).padStart(2, '0') }}</p>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="music" class="tab-panel">
              <div class="content-grid">
                <div class="content-card" v-for="i in 6" :key="i">
                  <div class="content-thumbnail">
                    <q-icon name="music_note" class="content-icon" />
                  </div>
                  <div class="content-info">
                    <h4>Worship Song {{ i }}</h4>
                    <p>Artist Name</p>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="books" class="tab-panel">
              <div class="content-grid">
                <div class="content-card" v-for="i in 6" :key="i">
                  <div class="content-thumbnail">
                    <q-icon name="menu_book" class="content-icon" />
                  </div>
                  <div class="content-info">
                    <h4>Inspiring Book {{ i }}</h4>
                    <p>By Author Name</p>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="quotes" class="tab-panel">
              <div class="content-grid quotes-grid">
                <div class="quote-card" v-for="i in 6" :key="i">
                  <q-icon name="format_quote" class="quote-mark" />
                  <p class="quote-text">Inspiring quote {{ i }} about faith, hope, and love that touches the heart.</p>
                  <div class="quote-author">- Author Name</div>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </section>

      <!-- Daily Inspirations Section -->
      <section class="content-section">
        <div class="section-header">
          <h2 class="section-title">
            <q-icon name="wb_sunny" class="section-icon" />
            Daily Inspirations
          </h2>
          <p class="section-subtitle">Your daily dose of spiritual nourishment</p>
        </div>

        <div class="daily-grid">
          <div class="daily-card">
            <q-icon name="format_quote" class="daily-icon" />
            <h4>Quote of the Day</h4>
            <p>{{ dailyQuote }}</p>
          </div>
          <div class="daily-card">
            <q-icon name="music_note" class="daily-icon" />
            <h4>Song of the Day</h4>
            <p>{{ dailySong }}</p>
          </div>
          <div class="daily-card">
            <q-icon name="menu_book" class="daily-icon" />
            <h4>Daily Devotional</h4>
            <p>{{ dailyDevotional }}</p>
          </div>
        </div>
      </section>

      <!-- Call to Action Section -->
      <section class="cta-section">
        <div class="cta-content">
          <h2 class="cta-title">Ready to Begin Your Journey?</h2>
          <p class="cta-text">Join thousands who find daily inspiration and spiritual growth</p>
          <div class="cta-buttons">
            <q-btn
              unelevated
              rounded
              size="lg"
              class="cta-primary"
              label="Get Started"
              @click="handleGetStarted"
            />
            <q-btn
              outline
              rounded
              size="lg"
              class="cta-secondary"
              label="Learn More"
              @click="handleLearnMore"
            />
          </div>
        </div>
      </section>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Search functionality
const searchQuery = ref('')
const activeTab = ref('videos')

// Sample data
const topics = ref([
  {
    id: 1,
    title: 'Faith',
    description: 'Strengthen your faith journey',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: 'church'
  },
  {
    id: 2,
    title: 'Hope',
    description: 'Find light in darkness',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: 'lightbulb'
  },
  {
    id: 3,
    title: 'Love',
    description: 'Discover unconditional love',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: 'favorite'
  },
  {
    id: 4,
    title: 'Peace',
    description: 'Find inner tranquility',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    icon: 'spa'
  }
])

const popularItems = ref([
  {
    id: 1,
    title: 'Top Sermon This Week',
    type: 'video',
    duration: '28:45'
  },
  {
    id: 2,
    title: 'Peaceful Worship Mix',
    type: 'music',
    duration: '1:15:30'
  },
  {
    id: 3,
    title: 'Daily Devotional',
    type: 'book',
    duration: '5 min read'
  }
])

//const popularItems = await getPopularItems()

const dailyQuote = '"I can do all things through Christ who strengthens me."'
const dailySong = 'Way Maker - Sinach'
const dailyDevotional = 'Today\'s devotion: Trust in His timing and find peace in His plan'

// Methods
const handleGetStarted = () => {
  console.log('Get Started clicked')
}

const handleLearnMore = () => {
  console.log('Learn More clicked')
}
</script>

<style scoped>
.elegant-home-page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* Simple Background */
.background-gradient {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: -1;
}

/* Hero Section */
.hero-section {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin-bottom: 2rem;
}

.hero-content {
  text-align: center;
  max-width: 700px;
  width: 100%;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.gradient-text {
  background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
}

.looking-for {
  color: rgba(255, 255, 255, 0.9);
  display: inline-block;
  margin-left: 0.5rem;
}

.hero-subtitle {
  font-size: clamp(1rem, 3vw, 1.3rem);
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  font-weight: 300;
}

/* Search Container */
.search-container {
  max-width: 500px;
  margin: 0 auto;
}

.elegant-search {
  backdrop-filter: blur(10px);
  border-radius: 25px;
  transition: transform 0.2s ease;
}

.elegant-search:hover {
  transform: translateY(-2px);
}

.search-icon {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.3rem;
}

/* Main Content */
.main-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30px 30px 0 0;
  min-height: 100vh;
  padding: 3rem 0;
  position: relative;
  z-index: 1;
}

/* Content Sections */
.content-section {
  margin: 3rem 0;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #666;
  font-weight: 300;
}

.section-icon {
  font-size: 1.8rem;
  color: #667eea;
}

/* Topics Grid */
.topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.topic-card {
  padding: 2rem;
  border-radius: 15px;
  text-align: center;
  color: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.topic-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.topic-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.topic-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.topic-description {
  font-size: 1rem;
  opacity: 0.9;
}

/* Popular Grid */
.popular-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.popular-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.popular-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.card-thumbnail {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.thumbnail-icon {
  font-size: 2rem;
  color: white;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.card-meta {
  color: #666;
  font-size: 0.9rem;
}

/* Explore Tabs */
.explore-tabs {
  max-width: 1200px;
  margin: 0 auto;
}

.custom-tabs {
  background: rgba(102, 126, 234, 0.1);
  border-radius: 15px;
  margin-bottom: 2rem;
}

.tab-panels {
  background: transparent;
}

.tab-panel {
  padding: 0;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.content-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.content-card:hover {
  transform: translateY(-3px);
}

.content-thumbnail {
  width: 100%;
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.content-icon {
  font-size: 2.5rem;
  color: white;
}

.content-info h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.content-info p {
  color: #666;
  font-size: 0.9rem;
}

/* Quote Grid */
.quotes-grid .content-card {
  text-align: center;
}

.quote-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.quote-card:hover {
  transform: translateY(-3px);
}

.quote-mark {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.quote-text {
  font-size: 1.1rem;
  color: #333;
  font-style: italic;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.quote-author {
  color: #666;
  font-weight: 600;
}

/* Daily Grid */
.daily-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.daily-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.daily-card:hover {
  transform: translateY(-3px);
}

.daily-icon {
  font-size: 2.5rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.daily-card h4 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

.daily-card p {
  color: #666;
  line-height: 1.6;
}

/* Call to Action */
.cta-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 3rem 2rem;
  margin: 3rem 2rem;
  text-align: center;
  color: white;
}

.cta-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta-text {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-primary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 1rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.cta-primary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.cta-secondary {
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
  padding: 1rem 2rem;
  transition: all 0.3s ease;
}

.cta-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-section {
    padding: 0 1rem;
    margin: 2rem 0;
  }

  .hero-section {
    min-height: 50vh;
    padding: 1rem;
  }

  .section-title {
    font-size: 1.8rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .topics-grid, .popular-grid, .daily-grid {
    grid-template-columns: 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .cta-primary, .cta-secondary {
    width: 100%;
    max-width: 280px;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 2rem 0;
  }

  .hero-section {
    min-height: 40vh;
  }

  .cta-section {
    margin: 2rem 0.5rem;
    padding: 2rem 1rem;
  }
}
</style>
