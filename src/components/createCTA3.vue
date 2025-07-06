<template>
  <section
    class="create-on-edifeeds-section relative py-20 px-4 text-center overflow-hidden"
    :class="{ 'animate-in': isVisible }"
    ref="sectionRef"
  >
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 opacity-10">
      <div class="floating-shapes">
        <div
          v-for="i in 6"
          :key="i"
          class="floating-shape"
          :style="{
            '--delay': `${i * 0.5}s`,
            '--duration': `${8 + i}s`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }"
        />
      </div>
    </div>

    <!-- Content Container -->
    <div class="relative z-10 max-w-4xl mx-auto">
      <!-- Badge/Tag -->
      <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm font-medium">
        <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        Join {{ communityStats.activeCreators }}+ Active Creators
      </div>

      <!-- Main Heading with Gradient Text -->
      <h2 class="text-4xl md:text-6xl font-bold mb-6 leading-tight">
        <span class="block">Edifeeds is</span>
        <span class="gradient-text block">Yours to Share Too</span>
      </h2>

      <!-- Enhanced Description -->
      <p class="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed max-w-3xl mx-auto">
        Create, curate, and share inspiring content with the Edifeeds community.
        <span class="font-semibold text-white">Your voice can uplift others.</span>
      </p>

      <!-- Stats Row -->
      <div class="flex flex-wrap justify-center gap-8 mb-10 text-center">
        <div v-for="stat in stats" :key="stat.label" class="stat-item">
          <div class="text-2xl md:text-3xl font-bold text-white mb-1">
            {{ animatedValue(stat.value) }}{{ stat.suffix }}
          </div>
          <div class="text-sm text-white/70">{{ stat.label }}</div>
        </div>
      </div>

      <!-- Enhanced Action Buttons -->
      <div class="flex flex-col sm:flex-row justify-center gap-4 mb-8">
        <q-btn
          color="white"
          text-color="primary"
          :label="isCreating ? 'Creating...' : 'Start Creating'"
          :loading="isCreating"
          @click="goToCreate"
          class="cta-primary text-lg font-semibold py-4 px-8 rounded-full shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        >
          <template v-slot:default>
            <q-icon name="add_circle" class="mr-2" />
            {{ isCreating ? 'Creating...' : 'Start Creating' }}
          </template>
        </q-btn>

        <q-btn
          color="transparent"
          text-color="white"
          label="Learn More"
          @click="goToLearnMore"
          class="cta-secondary text-lg font-semibold py-4 px-8 rounded-full border-2 border-white/30 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
        >
          <template v-slot:default>
            <q-icon name="info" class="mr-2" />
            Learn More
          </template>
        </q-btn>
      </div>

      <!-- Feature Highlights -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div
          v-for="(feature, index) in features"
          :key="feature.title"
          class="feature-card p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300"
          :style="{ '--delay': `${index * 0.2}s` }"
        >
          <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <q-icon :name="feature.icon" class="text-2xl text-white" />
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">{{ feature.title }}</h3>
          <p class="text-white/80 text-sm">{{ feature.description }}</p>
        </div>
      </div>

      <!-- Social Proof -->
      <div class="flex flex-wrap justify-center items-center gap-4 mt-12 pt-8 border-t border-white/20">
        <span class="text-white/70 text-sm">Trusted by creators from:</span>
        <div class="flex gap-6 opacity-60">
          <div v-for="platform in platforms" :key="platform" class="text-white text-sm font-medium">
            {{ platform }}
          </div>
        </div>
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const sectionRef = ref<HTMLElement>();
const isVisible = ref(false);
const isCreating = ref(false);

// Community stats (these could come from an API)
const communityStats = ref({
  activeCreators: '5.2K'
});

// Faith-focused stats
const stats = ref([
  { value: 5200, suffix: '+', label: 'Faith Sharers' },
  { value: 890, suffix: 'K', label: 'Lives Touched' },
  { value: 127, suffix: '', label: 'Countries Reached' }
]);

// Christian-minded features
const features = ref([
  {
    icon: 'favorite',
    title: 'Share His Love',
    description: 'Use your unique gifts to spread God\'s love and hope to those who need it most'
  },
  {
    icon: 'church',
    title: 'Build Fellowship',
    description: 'Connect with believers worldwide and strengthen the body of Christ through shared faith'
  },
  {
    icon: 'lightbulb',
    title: 'Inspire Faith',
    description: 'Share testimonies, Bible verses, and encouragement that draws others closer to Jesus'
  }
]);

// Christian community representation
const platforms = ref([
  'Churches', 'Ministries', 'Mission Fields', 'Bible Studies', 'Prayer Groups'
]);

// Intersection Observer for animations
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (sectionRef.value) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value = true;
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(sectionRef.value);
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});

// Animated value display
const animatedValue = (value: number) => {
  if (!isVisible.value) return '0';

  if (value >= 1000000) {
    return (value / 1000000).toFixed(1);
  } else if (value >= 1000) {
    return (value / 1000).toFixed(value >= 10000 ? 0 : 1);
  }
  return value.toString();
};

// Enhanced navigation functions
async function goToCreate() {
  isCreating.value = true;

  // Add some loading simulation for better UX
  await new Promise(resolve => setTimeout(resolve, 800));

  try {
    await router.push('/create');
  } catch (error) {
    console.error('Navigation error:', error);
  } finally {
    isCreating.value = false;
  }
}

function goToLearnMore() {
  router.push('/about/contributing');
}
</script>

<style scoped>
.create-on-edifeeds-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.create-on-edifeeds-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

/* Gradient text effect */
.gradient-text {
  background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c7d2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Floating shapes animation */
.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.floating-shape {
  position: absolute;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float var(--duration, 10s) infinite ease-in-out;
  animation-delay: var(--delay, 0s);
}

.floating-shape:nth-child(2n) {
  border-radius: 30%;
  transform: rotate(45deg);
}

.floating-shape:nth-child(3n) {
  width: 15px;
  height: 15px;
  background: rgba(255, 255, 255, 0.05);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  25% {
    transform: translateY(-20px) rotate(90deg);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-10px) rotate(180deg);
    opacity: 0.5;
  }
  75% {
    transform: translateY(-30px) rotate(270deg);
    opacity: 0.9;
  }
}

/* Component animations */
.animate-in {
  animation: slideInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Button enhancements */
.cta-primary {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.cta-primary:hover {
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px) scale(1.02);
}

.cta-secondary {
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cta-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
}

/* Feature cards */
.feature-card {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: calc(1s + var(--delay, 0s));
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stats animation */
.stat-item {
  opacity: 0;
  animation: fadeIn 0.8s ease-out forwards;
  animation-delay: 1.2s;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* Responsive improvements */
@media (max-width: 640px) {
  .gradient-text {
    font-size: 2.5rem;
  }

  .feature-card {
    margin-bottom: 1rem;
  }

  .stat-item {
    min-width: 100px;
  }
}

/* Enhanced focus states for accessibility */
.q-btn:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 4px;
}

/* Loading state */
.q-btn .q-spinner {
  color: inherit;
}
</style>
