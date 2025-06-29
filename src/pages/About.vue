<template>
  <q-page class="about-page">
  <!-- Hero Section -->
  <section class="hero-section">
    <div class="hero-content">
      <div class="hero-text">
        <h1 class="hero-title">About Edifeeds</h1>
        <p class="hero-subtitle">
          Nurturing faith through curated Christian content that edifies, inspires, and transforms lives
        </p>
        <div class="hero-stats">
          <div class="stat-item">
            <div class="stat-number">{{ animatedStats.users }}+</div>
            <div class="stat-label">Active Users</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ animatedStats.content }}+</div>
            <div class="stat-label">Content Pieces</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ animatedStats.countries }}+</div>
            <div class="stat-label">Countries Reached</div>
          </div>
        </div>
      </div>
      <div class="hero-image">
        <q-img
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=400&fit=crop&crop=face"
          alt="Christian community"
          class="hero-img"
          :ratio="4/3"
        />
      </div>
    </div>
  </section>

  <!-- Mission, Vision, Values Section -->
  <section class="mvv-section q-py-xl">
    <div class="container">
      <div class="row q-col-gutter-xl">
        <div class="col-12 col-md-4">
          <q-card class="mvv-card mission-card" flat>
            <q-card-section class="text-center q-pa-xl">
              <q-avatar size="80px" color="primary" text-color="white" class="q-mb-md">
                <q-icon name="favorite" size="40px" />
              </q-avatar>
              <h3 class="mvv-title">Our Mission</h3>
              <p class="mvv-description">
                To edify the body of Christ by making faith-based content easily accessible,
                organized by topics, and engaging for believers at every stage of their spiritual journey.
              </p>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="mvv-card vision-card" flat>
            <q-card-section class="text-center q-pa-xl">
              <q-avatar size="80px" color="secondary" text-color="white" class="q-mb-md">
                <q-icon name="visibility" size="40px" />
              </q-avatar>
              <h3 class="mvv-title">Our Vision</h3>
              <p class="mvv-description">
                To become the leading platform where Christians worldwide discover, engage with,
                and share transformative content that deepens their relationship with God and community.
              </p>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card class="mvv-card values-card" flat>
            <q-card-section class="text-center q-pa-xl">
              <q-avatar size="80px" color="accent" text-color="white" class="q-mb-md">
                <q-icon name="stars" size="40px" />
              </q-avatar>
              <h3 class="mvv-title">Our Values</h3>
              <p class="mvv-description">
                Biblical truth, authentic community, inclusive worship, spiritual growth,
                and stewarding technology to serve God's kingdom and His people.
              </p>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </section>

  <!-- Story Section -->
  <section class="story-section q-py-xl bg-grey-1">
    <div class="container">
      <div class="row q-col-gutter-xl items-center">
        <div class="col-12 col-md-6">
          <div class="story-content">
            <h2 class="section-title">Our Story</h2>
            <div class="story-text">
              <p class="q-mb-md">
                Edifeeds was born from a simple observation: in our digital age, Christians were
                struggling to find quality, biblical content amidst the noise of countless platforms
                and sources. We saw believers spending precious time searching for sermons, music,
                and resources instead of engaging with them.
              </p>
              <p class="q-mb-md">
                Founded in 2023 by a team of passionate believers and technology enthusiasts,
                Edifeeds emerged as a solution to bridge the gap between excellent Christian
                content and the people who need it most.
              </p>
              <p>
                Today, we're proud to serve thousands of believers worldwide, helping them
                discover content that not only informs but transforms, building stronger
                faith communities one feed at a time.
              </p>
            </div>
            <q-btn
              label="Read Our Full Journey"
              color="primary"
              outline
              class="q-mt-lg"
              @click="showJourneyDialog = true"
            />
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="story-timeline">
            <q-timeline color="primary">
              <q-timeline-entry
                v-for="milestone in milestones"
                :key="milestone.year"
                :title="milestone.year"
                :subtitle="milestone.event"
                :icon="milestone.icon"
                :color="milestone.color"
              >
                <div class="text-caption">{{ milestone.description }}</div>
              </q-timeline-entry>
            </q-timeline>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Section -->
  <section class="features-section q-py-xl">
    <div class="container">
      <div class="text-center q-mb-xl">
        <h2 class="section-title">What Makes Us Different</h2>
        <p class="section-subtitle">
          Discover the features that set Edifeeds apart in the Christian content space
        </p>
      </div>

      <div class="row q-col-gutter-lg">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card
            class="feature-card h-100"
            flat
            bordered
            @click="selectedFeature = feature"
            clickable
          >
            <q-card-section class="text-center q-pa-lg">
              <q-icon
                :name="feature.icon"
                :color="feature.color"
                size="3rem"
                class="q-mb-md"
              />
              <h4 class="feature-title">{{ feature.title }}</h4>
              <p class="feature-description">{{ feature.description }}</p>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </section>

  <!-- Team Section -->
  <section class="team-section q-py-xl bg-grey-1">
    <div class="container">
      <div class="text-center q-mb-xl">
        <h2 class="section-title">Meet Our Team</h2>
        <p class="section-subtitle">
          Passionate believers committed to serving the Christian community through technology
        </p>
      </div>

      <div class="row q-col-gutter-xl justify-center">
        <div
          v-for="member in teamMembers"
          :key="member.name"
          class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <q-card class="team-card" flat>
            <q-card-section class="text-center q-pa-lg">
              <q-avatar size="100px" class="q-mb-md">
                <q-img :src="member.image" :alt="member.name" />
              </q-avatar>
              <h4 class="team-name">{{ member.name }}</h4>
              <p class="team-role text-primary">{{ member.role }}</p>
              <p class="team-bio text-caption">{{ member.bio }}</p>
              <div class="team-social q-mt-md">
                <q-btn
                  v-if="member.linkedin"
                  flat
                  round
                  color="primary"
                  icon="fab fa-linkedin"
                  size="sm"
                  @click="openLink(member.linkedin)"
                />
                <q-btn
                  v-if="member.twitter"
                  flat
                  round
                  color="primary"
                  icon="fab fa-twitter"
                  size="sm"
                  @click="openLink(member.twitter)"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </section>

  <!-- Impact Section -->
  <section class="impact-section q-py-xl">
    <div class="container">
      <div class="row q-col-gutter-xl items-center">
        <div class="col-12 col-md-6">
          <h2 class="section-title">Our Impact</h2>
          <p class="section-subtitle q-mb-lg">
            See how Edifeeds is making a difference in the lives of believers worldwide
          </p>

          <div class="impact-stats">
            <div class="impact-stat q-mb-md">
              <q-icon name="group" color="primary" size="md" class="q-mr-md" />
              <div>
                <div class="stat-number">{{ animatedStats.users }}+</div>
                <div class="stat-description">Active monthly users discovering content</div>
              </div>
            </div>

            <div class="impact-stat q-mb-md">
              <q-icon name="play_circle" color="secondary" size="md" class="q-mr-md" />
              <div>
                <div class="stat-number">{{ animatedStats.hours }}+</div>
                <div class="stat-description">Hours of content consumed monthly</div>
              </div>
            </div>

            <div class="impact-stat q-mb-md">
              <q-icon name="share" color="accent" size="md" class="q-mr-md" />
              <div>
                <div class="stat-number">{{ animatedStats.shares }}+</div>
                <div class="stat-description">Content pieces shared with others</div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6">
          <q-card class="testimonial-card" flat>
            <q-card-section class="q-pa-xl">
              <div class="testimonial-content">
                <q-icon name="format_quote" color="primary" size="2rem" class="q-mb-md" />
                <p class="testimonial-text">
                  "Edifeeds has transformed my daily devotion time. I no longer spend hours
                  searching for quality content - it's all curated and ready for me to dive deep
                  into God's word."
                </p>
                <div class="testimonial-author q-mt-lg">
                  <q-avatar size="40px" class="q-mr-md">
                    <q-img src="https://images.unsplash.com/photo-1494790108755-2616b612b147?w=80&h=80&fit=crop&crop=face" />
                  </q-avatar>
                  <div>
                    <div class="author-name">Sarah Johnson</div>
                    <div class="author-title text-caption">Ministry Leader</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </section>

  <!-- Call to Action -->
  <section class="cta-section q-py-xl">
    <div class="container text-center">
      <h2 class="cta-title">Join Our Community</h2>
      <p class="cta-subtitle q-mb-lg">
        Start your journey of faith-based content discovery today
      </p>
      <div class="cta-buttons">
        <q-btn
          label="Get Started"
          color="primary"
          size="lg"
          class="q-ma-sm"
          @click="navigateToSignup"
        />
        <q-btn
          label="Learn More"
          color="primary"
          outline
          size="lg"
          class="q-ma-sm"
          @click="navigateToFeatures"
        />
      </div>
    </div>
  </section>

  <!-- Journey Dialog -->
  <q-dialog v-model="showJourneyDialog" maximized>
    <q-card class="journey-dialog">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Our Complete Journey</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="showJourneyDialog = false" />
      </q-card-section>

      <q-card-section class="q-pa-lg">
        <div class="journey-content">
          <h3>The Beginning (2023)</h3>
          <p>Our founders, while leading a Bible study group, noticed how much time was spent searching for supplementary content...</p>

          <h3>Development Phase</h3>
          <p>After months of research and development, working closely with pastors, worship leaders, and everyday believers...</p>

          <h3>Launch and Growth</h3>
          <p>Since our launch, we've seen tremendous growth and positive feedback from our community...</p>

          <h3>The Future</h3>
          <p>We're continuing to innovate and expand our platform to serve the global Christian community better...</p>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Reactive data
const showJourneyDialog = ref(false)
const selectedFeature = ref(null)

// Animated statistics
const stats = ref({
  users: 0,
  content: 0,
  countries: 0,
  hours: 0,
  shares: 0
})

const targetStats = {
  users: 15000,
  content: 50000,
  countries: 45,
  hours: 125000,
  shares: 25000
}

// Computed animated stats
const animatedStats = computed(() => ({
  users: stats.value.users.toLocaleString(),
  content: stats.value.content.toLocaleString(),
  countries: stats.value.countries,
  hours: stats.value.hours.toLocaleString(),
  shares: stats.value.shares.toLocaleString()
}))

// Team members data
const teamMembers = ref([
  {
    name: 'David Kim',
    role: 'Founder & CEO',
    bio: 'Passionate about using technology to serve the Kingdom of God',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    linkedin: 'https://linkedin.com/in/davidkim',
    twitter: 'https://twitter.com/davidkim'
  },
  {
    name: 'Rachel Thompson',
    role: 'Head of Content',
    bio: 'Former worship pastor with a heart for biblical content curation',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b147?w=200&h=200&fit=crop&crop=face',
    linkedin: 'https://linkedin.com/in/rachelthompson'
  },
  {
    name: 'Michael Chen',
    role: 'Lead Developer',
    bio: 'Full-stack developer dedicated to building user-friendly Christian platforms',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    linkedin: 'https://linkedin.com/in/michaelchen'
  },
  {
    name: 'Grace Wilson',
    role: 'Community Manager',
    bio: 'Building authentic connections within our growing faith community',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    twitter: 'https://twitter.com/gracewilson'
  }
])

// Features data
const features = ref([
  {
    title: 'Curated Content',
    description: 'Hand-picked sermons, music, and resources from trusted Christian sources',
    icon: 'verified',
    color: 'primary'
  },
  {
    title: 'Topic Organization',
    description: 'Content organized by biblical topics and themes for easy discovery',
    icon: 'category',
    color: 'secondary'
  },
  {
    title: 'Personalized Feeds',
    description: 'AI-powered recommendations based on your interests and spiritual journey',
    icon: 'person',
    color: 'accent'
  },
  {
    title: 'Community Features',
    description: 'Share, discuss, and grow together with fellow believers',
    icon: 'group',
    color: 'positive'
  },
  {
    title: 'Multi-Format Support',
    description: 'Audio, video, articles, and books all in one convenient platform',
    icon: 'library_books',
    color: 'info'
  },
  {
    title: 'Offline Access',
    description: 'Download content for offline reading and listening',
    icon: 'offline_pin',
    color: 'warning'
  }
])

// Milestones data
const milestones = ref([
  {
    year: '2023',
    event: 'Edifeeds Founded',
    description: 'Initial concept and team formation',
    icon: 'star',
    color: 'primary'
  },
  {
    year: 'Q2 2023',
    event: 'Beta Launch',
    description: 'First 100 beta users onboarded',
    icon: 'rocket_launch',
    color: 'secondary'
  },
  {
    year: 'Q4 2023',
    event: 'Public Launch',
    description: 'Platform opened to the public',
    icon: 'public',
    color: 'accent'
  },
  {
    year: '2024',
    event: 'Mobile App',
    description: 'iOS and Android apps released',
    icon: 'phone_android',
    color: 'positive'
  },
  {
    year: '2024',
    event: '10K Users',
    description: 'Reached 10,000 active users',
    icon: 'celebration',
    color: 'warning'
  }
])

// Methods
const animateStats = () => {
  const duration = 2000
  const steps = 60
  const stepDuration = duration / steps

  Object.keys(targetStats).forEach(key => {
    const target = targetStats[key]
    const increment = target / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        stats.value[key] = target
        clearInterval(timer)
      } else {
        stats.value[key] = Math.floor(current)
      }
    }, stepDuration)
  })
}

const openLink = (url) => {
  window.open(url, '_blank')
}

const navigateToSignup = () => {
  // Navigate to signup page
  router.push('/signup')
}

const navigateToFeatures = () => {
  // Navigate to features page
  router.push('/features')
}

// Lifecycle
onMounted(() => {
  // Start stats animation after component is mounted
  setTimeout(() => {
    animateStats()
  }, 500)
})
</script>

<style scoped>
.about-page {
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 1rem;
  min-height: 70vh;
  display: flex;
  align-items: center;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #ffd700;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.hero-img {
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

/* MVV Section */
.mvv-section {
  padding: 4rem 0;
}

.mvv-card {
  height: 100%;
  border-radius: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e0e0e0;
}

.mvv-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.mvv-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.mvv-description {
  line-height: 1.6;
  color: #666;
}

/* Story Section */
.story-section {
  padding: 4rem 0;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #333;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.story-text {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #555;
}

/* Features Section */
.features-section {
  padding: 4rem 0;
}

.feature-card {
  height: 100%;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.feature-description {
  line-height: 1.5;
  color: #666;
}

/* Team Section */
.team-section {
  padding: 4rem 0;
}

.team-card {
  border-radius: 16px;
  transition: transform 0.3s ease;
  background: white;
  border: 1px solid #e0e0e0;
}

.team-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.team-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #333;
}

.team-role {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.team-bio {
  line-height: 1.5;
  color: #666;
}

/* Impact Section */
.impact-section {
  padding: 4rem 0;
}

.impact-stat {
  display: flex;
  align-items: center;
}

.impact-stat .stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.impact-stat .stat-description {
  color: #666;
  line-height: 1.4;
}

.testimonial-card {
  border-radius: 16px;
  border: 1px solid #e0e0e0;
  background: white;
}

.testimonial-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #555;
  font-style: italic;
}

.author-name {
  font-weight: 600;
  color: #333;
}

.author-title {
  color: #666;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 0;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

/* Journey Dialog */
.journey-dialog {
  max-width: 800px;
  margin: 2rem auto;
}

.journey-content h3 {
  color: #333;
  margin: 2rem 0 1rem 0;
}

.journey-content p {
  line-height: 1.6;
  color: #666;
  margin-bottom: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-stats {
    justify-content: center;
  }

  .section-title {
    font-size: 2rem;
  }

  .cta-title {
    font-size: 2rem;
  }
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mvv-card,
.feature-card,
.team-card {
  animation: fadeInUp 0.6s ease forwards;
}

.mvv-card:nth-child(2) {
  animation-delay: 0.1s;
}

.mvv-card:nth-child(3) {
  animation-delay: 0.2s;
}
</style>
