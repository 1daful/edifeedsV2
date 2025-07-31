<template>
  <div class="hero-container">
    <q-carousel
      animated
      swipeable
      infinite
      :autoplay="autoplayEnabled"
      :autoplay-duration="autoplayDuration"
      height="300px"
      control-color="white"
      v-model="currentSlide"
      @update:model-value="onSlideChange"
      ref="carousel"
    >
      <q-carousel-slide
        v-for="highlight in highlights"
        :key="highlight.id"
        :name="highlight.id"
        class="hero-slide"
      >
        <div class="hero-content" :style="{ backgroundImage: `url(${highlight.image})` }">
          <div class="hero-overlay">
            <div class="hero-text">
              <div class="text-h4 text-weight-bold">{{ highlight.title }}</div>
              <div class="text-subtitle1 q-mt-sm">{{ highlight.subtitle }}</div>
              <q-btn
                class="q-mt-md"
                color="white"
                text-color="primary"
                :label="highlight.cta"
                @click="navigateToHighlight(highlight)"
                unelevated
              />
            </div>
          </div>
        </div>
      </q-carousel-slide>

      <template v-slot:control>
        <!-- Progress Dots - using built-in position -->
        <q-carousel-control
          position="bottom"
          :offset="[0, 18]"
          class="q-gutter-xs"
        >
          <div class="hero-progress">
            <div
              v-for="highlight in highlights"
              :key="highlight.id"
              class="progress-dot"
              :class="{ active: currentSlide === highlight.id }"
              @click="goToSlide(highlight.id)"
            />
          </div>
        </q-carousel-control>
      </template>
    </q-carousel>

    <!-- Custom positioned controls outside carousel -->
    <div class="carousel-controls-overlay">
      <!-- Left Navigation Button -->
      <div class="nav-controls-left" v-if="highlights.length > 1">
        <q-btn
          round
          dense
          color="white"
          text-color="primary"
          icon="chevron_left"
          @click="previousSlide"
          class="nav-btn"
          :disable="isFirstSlide && !infinite"
        />
      </div>

      <!-- Right Navigation Button -->
      <div class="nav-controls-right" v-if="highlights.length > 1">
        <q-btn
          round
          dense
          color="white"
          text-color="primary"
          icon="chevron_right"
          @click="nextSlide"
          class="nav-btn"
          :disable="isLastSlide && !infinite"
        />
      </div>

      <!-- Autoplay Toggle Button -->
      <div class="autoplay-controls">
        <q-btn
          round
          dense
          color="white"
          text-color="primary"
          :icon="autoplayEnabled ? 'pause' : 'play_arrow'"
          @click="toggleAutoplay"
          class="autoplay-btn"
        />
      </div>

      <!-- Slide Counter -->
      <div class="slide-counter-wrapper">
        <div class="slide-counter">
          {{ currentSlideIndex + 1 }} / {{ highlights.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const carousel = ref(null);

const currentSlide = ref('highlight-1');
const autoplayEnabled = ref(true);
const autoplayDuration = ref(5000);
const infinite = ref(true); // Add infinite control

const highlights = ref([
  {
    id: 'highlight-1',
    title: 'Weekly Sermon Series',
    subtitle: 'Walking in Faith: A Journey of Trust',
    cta: 'Watch Now',
    image: '/api/placeholder/800/300',
    link: '/sermons/weekly'
  },
  {
    id: 'highlight-2',
    title: 'Community Prayer Night',
    subtitle: 'Join us for an evening of worship and prayer',
    cta: 'Learn More',
    image: '/api/placeholder/800/300',
    link: '/events/prayer-night'
  },
  {
    id: 'highlight-3',
    title: 'Bible Study Groups',
    subtitle: 'Connect with others in meaningful study',
    cta: 'Join Group',
    image: '/api/placeholder/800/300',
    link: '/groups'
  },
  {
    id: 'highlight-4',
    title: 'Youth Ministry',
    subtitle: 'Engaging activities for young believers',
    cta: 'Get Involved',
    image: '/api/placeholder/800/300',
    link: '/youth'
  }
]);

// Computed properties
const currentSlideIndex = computed(() => {
  return highlights.value.findIndex(h => h.id === currentSlide.value);
});

const isFirstSlide = computed(() => {
  return currentSlideIndex.value === 0;
});

const isLastSlide = computed(() => {
  return currentSlideIndex.value === highlights.value.length - 1;
});

// Methods
function onSlideChange(newSlide) {
  currentSlide.value = newSlide;
}

function navigateToHighlight(highlight: { link: string; }) {
  router.push(highlight.link);
}

function goToSlide(slideId: string) {
  currentSlide.value = slideId;
}

// Enhanced navigation methods
function previousSlide() {
  if (carousel.value) {
    // Use Quasar's built-in method
    (carousel.value as any).previous();
  } else {
    // Fallback manual navigation
    const currentIndex = currentSlideIndex.value;
    if (currentIndex > 0) {
      currentSlide.value = highlights.value[currentIndex - 1].id;
    } else if (infinite.value) {
      currentSlide.value = highlights.value[highlights.value.length - 1].id;
    }
  }
}

function nextSlide() {
  if (carousel.value) {
    // Use Quasar's built-in method
    (carousel.value as any).next();
  } else {
    // Fallback manual navigation
    const currentIndex = currentSlideIndex.value;
    if (currentIndex < highlights.value.length - 1) {
      currentSlide.value = highlights.value[currentIndex + 1].id;
    } else if (infinite.value) {
      currentSlide.value = highlights.value[0].id;
    }
  }
}

function toggleAutoplay() {
  autoplayEnabled.value = !autoplayEnabled.value;
}

// Keyboard controls
function handleKeyboard(event: KeyboardEvent) {
  // Only handle if not typing in an input
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return;
  }

  switch(event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      previousSlide();
      break;
    case 'ArrowRight':
      event.preventDefault();
      nextSlide();
      break;
    case ' ':
      event.preventDefault();
      toggleAutoplay();
      break;
  }
}

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(event: TouchEvent) {
  touchStartX = event.changedTouches[0].screenX;
}

function handleTouchEnd(event: TouchEvent) {
  touchEndX = event.changedTouches[0].screenX;
  handleSwipe();
}

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swipe left - next slide
      nextSlide();
    } else {
      // Swipe right - previous slide
      previousSlide();
    }
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeyboard);

  // Wait for component to be fully mounted
  nextTick(() => {
    const carouselEl = carousel.value?.$el || carousel.value;
    if (carouselEl) {
      carouselEl.addEventListener('touchstart', handleTouchStart, { passive: true });
      carouselEl.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
  });
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboard);

  const carouselEl = carousel.value?.$el || carousel.value;
  if (carouselEl) {
    carouselEl.removeEventListener('touchstart', handleTouchStart);
    carouselEl.removeEventListener('touchend', handleTouchEnd);
  }
});
</script>

<style scoped>
.hero-container {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hero-slide {
  position: relative;
}

.hero-content {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-overlay {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.3));
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  padding: 24px;
}

.hero-text {
  max-width: 600px;
}

/* Carousel controls overlay */
.carousel-controls-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

.carousel-controls-overlay > * {
  pointer-events: auto;
}

/* Navigation controls positioning */
.nav-controls-left {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
}

.nav-controls-right {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
}

/* Autoplay controls positioning */
.autoplay-controls {
  position: absolute;
  top: 18px;
  right: 18px;
}

/* Slide counter positioning */
.slide-counter-wrapper {
  position: absolute;
  top: 18px;
  left: 18px;
}

/* Enhanced navigation button styles */
.nav-btn {
  opacity: 0.8;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.nav-btn:hover {
  opacity: 1;
  transform: scale(1.05);
}

.nav-btn:active {
  transform: scale(0.95);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Progress dots */
.hero-progress {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.progress-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
  cursor: pointer;
}

.progress-dot:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: scale(1.1);
}

.progress-dot.active {
  background: white;
  transform: scale(1.2);
}

/* Autoplay controls */
.autoplay-controls .autoplay-btn {
  opacity: 0.8;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.autoplay-controls .autoplay-btn:hover {
  opacity: 1;
  transform: scale(1.05);
}

/* Slide counter */
.slide-counter-wrapper {
  display: flex;
  justify-content: flex-start;
}

.slide-counter {
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-overlay {
    padding: 16px;
  }

  .hero-text .text-h4 {
    font-size: 1.5rem;
  }

  .nav-btn {
    width: 36px;
    height: 36px;
  }

  .nav-controls-left {
    left: 8px;
  }

  .nav-controls-right {
    right: 8px;
  }

  .autoplay-controls {
    top: 8px;
    right: 8px;
  }

  .slide-counter-wrapper {
    top: 8px;
    left: 8px;
  }
}

/* Animation for slide transitions */
.hero-slide {
  transition: transform 0.3s ease-in-out;
}

/* Focus styles for accessibility */
.nav-btn:focus,
.progress-dot:focus,
.autoplay-btn:focus {
  outline: 2px solid white;
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .hero-content {
    height: 200px;
  }

  .hero-text .text-h4 {
    font-size: 1.5rem;
  }
}
</style>
