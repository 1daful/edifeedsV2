<template>
  <q-page class="heavens-gateway">
    <q-header elevated class="bg-transparent header-glass">
      <q-toolbar>
        <q-toolbar-title class="logo">Heaven's Gateway</q-toolbar-title>
        <q-tabs v-model="activeTab" class="desktop-only">
          <q-tab v-for="tab in navTabs" :key="tab.name" :name="tab.name" :label="tab.label" />
        </q-tabs>
        <q-btn flat dense round icon="menu" aria-label="Menu" class="mobile-only" @click="toggleDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above :width="250" :breakpoint="768" class="mobile-only">
      <q-list>
        <q-item v-for="tab in navTabs" :key="tab.name" clickable v-ripple @click="navigateTo(tab.name)">
          <q-item-section>{{ tab.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Welcome to Heaven's Gateway</h1>
        <p class="hero-subtitle">Your divine destination for faith-filled media, worship, and inspiration</p>
        <q-input
          v-model="searchQuery"
          filled
          placeholder="Search for sermons, worship songs, testimonies..."
          class="search-bar"
          @keyup.enter="performSearch"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <div class="main-content">
      <q-page-container class="container">
        <section class="section">
          <div class="section-header">
            <q-icon name="local_fire_department" class="section-icon" />
            <div class="section-title-group">
              <h2 class="section-title">Heaven's Hotlist</h2>
              <span class="section-subtitle">Most-loved content right now</span>
            </div>
          </div>
          <div class="trending-grid">
            <q-card v-for="(item, index) in trendingContent" :key="item.id" @click="openContent(item.id)" :class="{ 'featured-card': index === 0 }">
              <div class="card-image" :class="{ 'featured': index === 0 }">
                <q-icon :name="item.icon" :size="index === 0 ? '4rem' : '3rem'" />
              </div>
              <q-card-section>
                <div class="card-title">{{ item.title }}</div>
                <p class="card-description">{{ item.description }}</p>
              </q-card-section>
            </q-card>
          </div>
        </section>

        <section class="section">
          <div class="section-header">
            <q-icon name="bakery_dining" class="section-icon" />
            <div class="section-title-group">
              <h2 class="section-title">Daily Manna</h2>
              <span class="section-subtitle">Bite-sized daily refreshment</span>
            </div>
          </div>
          <div class="quick-access-grid">
            <q-card v-for="item in dailyManna" :key="item.id" class="quick-card" @click="openContent(item.id)">
              <q-card-section class="text-center">
                <q-icon :name="item.icon" size="2.5rem" class="quick-card-icon" />
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
              </q-card-section>
            </q-card>
          </div>
        </section>

        <section class="live-section">
          <div class="live-content">
            <q-chip color="red" text-color="white" class="live-indicator">
              <q-avatar><div class="live-dot"></div></q-avatar> LIVE NOW
            </q-chip>
            <h2 class="live-title">Sunday Service - Grace Community</h2>
            <p class="live-subtitle">Join {{ liveViewers.toLocaleString() }} believers in worship and the Word</p>
            <q-btn size="lg" outline color="white" label="Join Live Stream" @click="joinLiveStream" class="live-btn" />
          </div>
        </section>

        <section class="section">
          <div class="section-header">
            <q-icon name="center_focus_strong" class="section-icon" />
            <div class="section-title-group">
              <h2 class="section-title">Faith Focus</h2>
              <span class="section-subtitle">In-depth teachings & sermons</span>
            </div>
          </div>
          <div class="cards-grid">
            <q-card v-for="item in faithFocus" :key="item.id" @click="openContent(item.id)">
              <div class="card-image">
                <q-icon :name="item.icon" size="3rem" />
              </div>
              <q-card-section>
                <div class="card-title">{{ item.title }}</div>
                <p class="card-description">{{ item.description }}</p>
              </q-card-section>
            </q-card>
          </div>
        </section>

        <section class="section">
          <div class="section-header">
            <q-icon name="groups" class="section-icon" />
            <div class="section-title-group">
              <h2 class="section-title">Fellowship Circle</h2>
              <span class="section-subtitle">Connect with your faith family</span>
            </div>
          </div>
          <div class="community-stats">
            <q-card v-for="stat in communityStats" :key="stat.label" class="stat-card">
              <q-card-section class="text-center">
                <div class="stat-number">{{ stat.number }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="community-grid">
            <q-card class="community-card main-feature">
              <q-card-section>
                <div class="community-header">
                  <q-icon name="chat" class="community-icon" />
                  <div><h3>Unity Hub</h3><p>Connect, share, and grow together</p></div>
                </div>
                <div class="recent-activity">
                  <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                    <q-avatar class="user-avatar"><q-icon name="person" /></q-avatar>
                    <div class="activity-text">
                      <strong>{{ activity.user }}</strong> {{ activity.action }}
                      <span class="activity-time">{{ activity.time }}</span>
                    </div>
                  </div>
                </div>
                <q-btn color="primary" label="Join the Conversation" class="full-width" @click="joinDiscussion" />
              </q-card-section>
            </q-card>

            <q-card class="community-card">
              <q-card-section>
                <div class="community-header">
                  <q-icon name="favorite" class="community-icon" />
                  <div><h3>Prayer Wall</h3><p>Lift each other up in prayer</p></div>
                </div>
                <div class="prayer-requests">
                  <div v-for="prayer in prayerRequests" :key="prayer.id" class="prayer-item">
                    <p class="prayer-text">"{{ prayer.request }}"</p>
                    <div class="prayer-stats">
                      <span>❤️ {{ prayer.praying }} praying</span>
                      <span>💬 {{ prayer.responses }} responses</span>
                    </div>
                  </div>
                </div>
                <q-btn color="primary" label="+ Add Prayer Request" class="full-width" @click="addPrayerRequest" />
              </q-card-section>
            </q-card>

            <q-card class="community-card">
              <q-card-section>
                <div class="community-header">
                  <q-icon name="group" class="community-icon" />
                  <div><h3>Small Groups</h3><p>Find your local fellowship</p></div>
                </div>
                <div class="groups-list">
                  <div v-for="group in smallGroups" :key="group.id" class="group-item">
                    <div class="group-info">
                      <strong>{{ group.name }}</strong>
                      <span>{{ group.members }} members • {{ group.schedule }}</span>
                    </div>
                    <q-btn
                      :label="group.joined ? 'Joined ✓' : 'Join'"
                      :color="group.joined ? 'positive' : 'primary'"
                      outline
                      @click="toggleGroupJoin(group)"
                    />
                  </div>
                </div>
                <q-btn color="primary" label="View All Groups" class="full-width" @click="viewAllGroups" />
              </q-card-section>
            </q-card>

            <q-card class="community-card">
              <q-card-section>
                <div class="community-header">
                  <q-icon name="event" class="community-icon" />
                  <div><h3>Kingdom Calendar</h3><p>Upcoming events & gatherings</p></div>
                </div>
                <div class="events-list">
                  <div v-for="event in upcomingEvents" :key="event.id" class="event-item">
                    <div class="event-date">
                      <span class="date-day">{{ event.day }}</span>
                      <span class="date-month">{{ event.month }}</span>
                    </div>
                    <div class="event-details">
                      <strong>{{ event.title }}</strong>
                      <span>{{ event.location }} • {{ event.time }}</span>
                    </div>
                  </div>
                </div>
                <q-btn color="primary" label="View Full Calendar" class="full-width" @click="viewCalendar" />
              </q-card-section>
            </q-card>
          </div>
        </section>
      </q-page-container>
    </div>

    <q-footer class="bg-grey-9 text-white text-center">
      <q-toolbar>
        <q-toolbar-title>
          © 2025 Heaven's Gateway. Spreading faith, hope, and love through digital media.
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-page>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'HeavensGateway',
  setup() {
    // Reactive data and methods
    const activeTab = ref('home');
    const leftDrawerOpen = ref(false);
    const searchQuery = ref('');
    const liveViewers = ref(2847);

    // Consolidated data for navigation and content
    const navTabs = ref([
      { name: 'home', label: 'Home' },
      { name: 'trending', label: 'Trending' },
      { name: 'worship', label: 'Worship' },
      { name: 'teachings', label: 'Teachings' },
      { name: 'live', label: 'Live' },
    ]);

    const trendingContent = ref([
      { id: 'way-maker', icon: 'music_note', title: 'Way Maker - Live Worship', description: 'Experience this powerful worship session that\'s touching hearts across the globe. Join thousands in praise and feel the presence of God.' },
      { id: 'faith-trials', icon: 'menu_book', title: 'Faith in Trials', description: 'Pastor John\'s powerful message on finding strength in difficult times.' },
      { id: 'miracle-testimony', icon: 'auto_awesome', title: 'Miracle Testimony', description: 'Sarah\'s incredible story of healing and restoration.' },
    ]);

    const dailyManna = ref([
      { id: 'morning-devotion', icon: 'wb_sunny', title: 'Morning Devotion', description: 'Start your day with God\'s word and prayer' },
      { id: 'living-waters', icon: 'water_drop', title: 'Living Waters', description: 'Heart-soothing worship and scripture moments' },
      { id: 'grace-drops', icon: 'star', title: 'Grace Drops', description: 'Short but powerful wisdom pieces' },
      { id: 'verse-day', icon: 'smartphone', title: 'Verse of the Day', description: 'Daily scripture to carry in your heart' },
    ]);

    const faithFocus = ref([
      { id: 'armor-god', icon: 'shield', title: 'The Armor of God Series', description: 'Deep dive into Ephesians 6 - understanding spiritual warfare and protection in Christ.' },
      { id: 'kingdom-conversations', icon: 'psychology', title: 'Kingdom Conversations', description: 'Thought-provoking interview with Dr. Sarah Mitchell on faith and science.' },
      { id: 'roots-revelation', icon: 'nature', title: 'Roots & Revelation', description: 'Biblical archaeology discoveries that confirm scripture\'s historical accuracy.' },
    ]);

    const communityStats = ref([
      { number: '47K+', label: 'Active Members' },
      { number: '152', label: 'Prayer Groups' },
      { number: '89', label: 'Cities Worldwide' },
      { number: '1.2K', label: 'Daily Prayers' },
    ]);

    const recentActivities = ref([
      { id: 1, user: 'Sarah M.', action: 'shared a prayer request for healing', time: '2 min ago' },
      { id: 2, user: 'Pastor John', action: 'posted daily devotion', time: '15 min ago' },
      { id: 3, user: 'Michael T.', action: 'celebrated 1 year of sobriety', time: '1 hour ago' },
    ]);

    const prayerRequests = ref([
      { id: 1, request: 'Praying for my daughter\'s healing...', praying: 234, responses: 12 },
      { id: 2, request: 'Job interview tomorrow, need wisdom...', praying: 89, responses: 8 },
    ]);

    const smallGroups = ref([
      { id: 1, name: 'Young Adults Lagos', members: 23, schedule: 'Meets Fridays', joined: false },
      { id: 2, name: 'Marriage & Family', members: 45, schedule: 'Meets Sundays', joined: false },
      { id: 3, name: 'Bible Study Online', members: 127, schedule: 'Daily', joined: false },
    ]);

    const upcomingEvents = ref([
      { id: 1, day: '15', month: 'AUG', title: 'Youth Revival Night', location: 'Victory Chapel', time: '7:00 PM' },
      { id: 2, day: '22', month: 'AUG', title: 'Community Outreach', location: 'City Center', time: '9:00 AM' },
    ]);

    const toggleDrawer = () => { leftDrawerOpen.value = !leftDrawerOpen.value };
    const navigateTo = (section) => {
      activeTab.value = section;
      leftDrawerOpen.value = false;
    };
    const performSearch = () => { console.log('Searching for:', searchQuery.value) };
    const openContent = (contentId) => { console.log('Opening content:', contentId) };
    const joinLiveStream = () => { console.log('Joining live stream') };
    const joinDiscussion = () => { console.log('Joining discussion') };
    const addPrayerRequest = () => {
      const newPrayer = { id: Date.now(), request: 'Please pray for God\'s guidance in my new chapter...', praying: 1, responses: 0 };
      prayerRequests.value.unshift(newPrayer);
    };
    const toggleGroupJoin = (group) => { group.joined = !group.joined; };
    const viewAllGroups = () => { console.log('Viewing all groups') };
    const viewCalendar = () => { console.log('Viewing calendar') };

    onMounted(() => { console.log('Heaven\'s Gateway loaded') });

    return {
      activeTab, leftDrawerOpen, searchQuery, liveViewers, navTabs, trendingContent,
      dailyManna, faithFocus, communityStats, recentActivities, prayerRequests,
      smallGroups, upcomingEvents, toggleDrawer, navigateTo, performSearch,
      openContent, joinLiveStream, joinDiscussion, addPrayerRequest,
      toggleGroupJoin, viewAllGroups, viewCalendar,
    };
  },
};
</script>

<style scoped>
/*
  The CSS remains largely the same as it is already well-structured.
  Minor adjustments were made for the `trending-grid` to handle the `v-for` loop.
*/

.heavens-gateway {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}
.header-glass {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}
.logo {
  font-size: 2rem;
  font-weight: bold;
  color: white !important;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}
.desktop-only { display: flex; }
.mobile-only { display: none; }
@media (max-width: 768px) {
  .desktop-only { display: none; }
  .mobile-only { display: block; }
}
.hero-section {
  padding: 4rem 2rem;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
}
.hero-title {
  font-size: 3.5rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 1s ease;
}
.hero-subtitle {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  animation: fadeInUp 1s ease 0.2s both;
}
.search-bar {
  max-width: 600px;
  margin: 0 auto;
  animation: fadeInUp 1s ease 0.4s both;
}
.search-bar .q-field__control {
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
.main-content {
  background: white;
  margin-top: 2rem;
  border-radius: 30px 30px 0 0;
  min-height: 100vh;
  padding: 3rem 0;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}
.section { margin-bottom: 4rem; }
.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}
.section-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 12px;
  border-radius: 12px;
  font-size: 1.5rem;
}
.section-title-group {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.section-title {
  font-size: 2rem;
  color: #333;
  font-weight: bold;
  margin: 0;
}
.section-subtitle {
  color: #666;
  font-size: 1rem;
}
.trending-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 2rem;
  margin-bottom: 4rem;
}
.featured-card {
  grid-row: span 2;
  cursor: pointer;
  transition: all 0.3s ease;
}
.featured-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}
.card-image {
  height: 200px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  overflow: hidden;
}
.card-image.featured { height: 300px; }
.card-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}
.card-description {
  color: #666;
  line-height: 1.5;
  margin: 0;
}
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
.cards-grid .q-card {
  cursor: pointer;
  transition: all 0.3s ease;
}
.cards-grid .q-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}
.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
}
.quick-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border: 1px solid rgba(102, 126, 234, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}
.quick-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(102, 126, 234, 0.2);
}
.quick-card-icon {
  margin-bottom: 1rem;
  color: #667eea;
}
.quick-card h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #333;
}
.quick-card p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}
.live-section {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 20px;
  padding: 3rem;
  color: white;
  margin-bottom: 4rem;
  text-align: center;
}
.live-indicator { margin-bottom: 1rem; }
.live-dot {
  width: 10px;
  height: 10px;
  background: #ff4444;
  border-radius: 50%;
  animation: pulse 2s infinite;
}
.live-title { font-size: 2.5rem; margin-bottom: 1rem; }
.live-subtitle { font-size: 1.2rem; margin-bottom: 2rem; }
.live-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid white;
}
.community-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}
.stat-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border: 1px solid rgba(102, 126, 234, 0.2);
}
.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}
.stat-label {
  color: #666;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.community-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}
.community-card { border: 1px solid rgba(0, 0, 0, 0.05); }
.community-card.main-feature { grid-row: span 2; }
.community-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.community-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 15px;
  border-radius: 15px;
  font-size: 1.5rem;
}
.community-header h3 {
  font-size: 1.3rem;
  margin-bottom: 0.2rem;
  color: #333;
}
.community-header p {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}
.recent-activity { margin-bottom: 1.5rem; }
.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
}
.user-avatar {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}
.activity-text { flex: 1; }
.activity-text strong { color: #333; }
.activity-time {
  display: block;
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.2rem;
}
.prayer-requests { margin-bottom: 1.5rem; }
.prayer-item {
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}
.prayer-text {
  font-style: italic;
  margin-bottom: 0.5rem;
  color: #555;
}
.prayer-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #666;
}
.groups-list, .events-list { margin-bottom: 1.5rem; }
.group-item, .event-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  margin-bottom: 0.8rem;
}
.group-info, .event-details { flex: 1; }
.group-info strong, .event-details strong {
  display: block;
  color: #333;
  margin-bottom: 0.2rem;
}
.group-info span, .event-details span {
  font-size: 0.8rem;
  color: #666;
}
.event-date {
  text-align: center;
  margin-right: 1rem;
  flex-shrink: 0;
}
.date-day {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}
.date-month {
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
}
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
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
@media (max-width: 768px) {
  .hero-title { font-size: 2.5rem; }
  .trending-grid { grid-template-columns: 1fr; }
  .community-grid { grid-template-columns: 1fr; }
  .community-stats { grid-template-columns: repeat(2, 1fr); }
}
</style>
