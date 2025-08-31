<template>
  <q-page>
    <section class="hero-section text-center q-py-xl text-white">
      <div class="q-px-md">
        <h1 class="text-h2 text-weight-bold q-mb-md">Welcome to Heaven's Gateway</h1>
        <p class="text-h6 q-mb-xl">Your divine destination for faith-filled media, worship, and inspiration</p>
        <q-input
          v-model="search"
          outlined
          rounded
          placeholder="Search for sermons, worship songs, testimonies..."
          bg-color="white"
          class="search-input"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </section>

    <main class="main-content q-pb-xl">
      <div class="container q-px-md">
        <section id="trending" class="q-my-xl">
          <SectionHeader icon="🔥" title="Heaven's Hotlist" subtitle="Most-loved content right now" />
          <div class="trending-grid">
            <CardComponent featured title="Way Maker - Live Worship" description="Experience this powerful worship session that's touching hearts across the globe. Join thousands in praise and feel the presence of God." icon="🎵" />
            <CardComponent title="Faith in Trials" description="Pastor John's powerful message on finding strength in difficult times." icon="📖" />
            <CardComponent title="Miracle Testimony" description="Sarah's incredible story of healing and restoration." icon="✨" />
          </div>
        </section>

        <q-separator inset />

        <section class="q-my-xl">
          <SectionHeader icon="🍞" title="Daily Manna" subtitle="Bite-sized daily refreshment" />
          <DailyVerse/>
          <div class="quick-access">
            <!--QuickCard icon="🌅" title="Morning Devotion" description="Start your day with God's word and prayer" />
            <QuickCard icon="💧" title="Living Waters" description="Heart-soothing worship and scripture moments" />
            <QuickCard icon="🌟" title="Grace Drops" description="Short but powerful wisdom pieces" />
            <QuickCard icon="📱" title="Verse of the Day" description="Daily scripture to carry in your heart" /-->

            <!--QuickCard table="morning_devotions"/-->

          </div>
        </section>

        <q-separator inset />

        <section id="live" class="q-my-xl">
          <LiveBanner />
        </section>

        <q-separator inset />

        <section id="teachings" class="q-my-xl">
          <SectionHeader icon="🎯" title="Faith Focus" subtitle="In-depth teachings & sermons" />
          <div class="cards-grid">
            <CardComponent title="The Armor of God Series" description="Deep dive into Ephesians 6 - understanding spiritual warfare and protection in Christ." icon="👨‍🏫" />
            <CardComponent title="Kingdom Conversations" description="Thought-provoking interview with Dr. Sarah Mitchell on faith and science." icon="💭" />
            <CardComponent title="Roots & Revelation" description="Biblical archaeology discoveries that confirm scripture's historical accuracy." icon="🌳" />
          </div>
        </section>

        <q-separator inset />

        <section id="worship" class="q-my-xl">
          <SectionHeader icon="🌊" title="Worship Wave" subtitle="Fresh praise from around the globe" />
          <div class="cards-grid">
            <CardComponent title="Heaven's Playlist" description="Curated worship collections by mood and theme for every season of life." icon="🎼" />
            <CardComponent title="Praise Pulse" description="What's hot in gospel charts - discover new artists and timeless classics." icon="📈" />
            <CardComponent title="Global Worship" description="Experience praise and worship in different languages and cultures." icon="🌍" />
          </div>
        </section>

        <q-separator inset />

        <section class="q-my-xl">
          <SectionHeader icon="💡" title="Light Stories" subtitle="Real-life transformation stories" />
          <div class="cards-grid">
            <CardComponent title="Faith Journeys" description="Believers' walk through trials and triumphs - stories of perseverance and victory." icon="🚶‍♂️" />
            <CardComponent title="Miracle Moments" description="Documented miraculous encounters that demonstrate God's power in our lives." icon="⚡" />
            <CardComponent title="Breakthrough Stories" description="Testimonies of addiction recovery, relationship restoration, and life transformation." icon="🌟" />
          </div>
        </section>

        <q-separator inset />

        <section class="q-my-xl">
          <SectionHeader icon="🤝" title="Fellowship Circle" subtitle="Connect with your faith family" />
          <div class="community-stats">
            <StatCard number="47K+" label="Active Members" />
            <StatCard number="152" label="Prayer Groups" />
            <StatCard number="89" label="Cities Worldwide" />
            <StatCard number="1.2K" label="Daily Prayers" />
          </div>
          <div class="community-grid">
            <CommunityCard main-feature icon="💬" title="Unity Hub" subtitle="Connect, share, and grow together" />
            <CommunityCard icon="🙏" title="Prayer Wall" subtitle="Lift each other up in prayer" />
            <CommunityCard icon="👥" title="Small Groups" subtitle="Find your local fellowship, connect with believers, and explore meaningful relationships." />
            <EdifeedsLove icon="👥" title="Love Connections" subtitle="Find your local fellowship, connect with believers, and explore meaningful relationships." />
            <EdifeedsLove icon="👥" title="Prayer Partners" subtitle="Find your local fellowship, connect with believers, and explore meaningful relationships." />
            <EdifeedsLove icon="👥" title="Christian Matches" subtitle="Find your local fellowship, connect with believers, and explore meaningful relationships." />
            <EdifeedsLove icon="👥" title="Dating with Faith" subtitle="Find your local fellowship, connect with believers, and explore meaningful relationships." />

          </div>
        </section>
      </div>
    </main>

    <footer class="bg-dark text-white text-center q-pa-xl q-mt-xl">
      <div class="container">
        <p class="q-mb-none">&copy; 2024 Heaven's Gateway. All rights reserved.</p>
      </div>
    </footer>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SectionHeader from 'src/components/SectionHeader.vue';
import CardComponent from 'src/components/CardComponent.vue';
import LiveBanner from 'src/components/LiveBanner.vue';
import StatCard from 'src/components/StatCard.vue';
import CommunityCard from 'src/components/CommunityCard.vue';
import DailyVerse from '../components/Home/DailyVerse.vue';
import EdifeedsLove from '../components/EdifeedsLove.vue';

const search = ref('');
</script>

<style lang="scss" scoped>
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  h1 {
    animation: fadeInUp 1s ease;
  }
  p {
    animation: fadeInUp 1s ease 0.2s both;
  }
}

.search-input {
  max-width: 600px;
  margin: 0 auto;
  .q-field__control {
    border-radius: 50px !important;
  }
  animation: fadeInUp 1s ease 0.4s both;
}

.main-content {
  background: white;
  margin-top: -50px;
  position: relative;
  border-radius: 30px 30px 0 0;
  box-shadow: 0 -10px 20px rgba(0,0,0,0.05);
}

.trending-grid, .cards-grid, .quick-access, .community-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.trending-grid {
  grid-template-columns: 2fr 1fr 1fr;
  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

.community-grid {
  grid-template-columns: 2fr 1fr;
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.community-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.q-separator {
  margin: 4rem 0;
  height: 1px;
}
</style>
