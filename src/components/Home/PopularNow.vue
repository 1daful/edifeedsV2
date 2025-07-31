<template>
  <section class="trending-section">
    <div class="container">
      <header class="section-header">
        <div class="title-wrapper">
          <q-icon name="local_fire_department" class="fire-icon" />
          <h2 class="section-title">
            <span class="trending-text">Trending</span>
            <span class="today-text">Today</span>
          </h2>
        </div>
        <p class="section-subtitle">
          Discover what's captivating others right now
        </p>
      </header>

      <div v-if="items && items.length" class="carousel-wrapper">
        <q-carousel
          v-model="currentSlide"
          height="400px"
          :autoplay="autoplayEnabled ? 6000 : false"
          animated
          arrows
          infinite
          control-color="primary"
          class="trending-carousel"
          @mouseenter="autoplayEnabled = false"
          @mouseleave="autoplayEnabled = true"
        >
          <q-carousel-slide
            v-for="item in items"
            :key="item.id"
            :name="item.id"
            class="carousel-slide"
          >
            <div class="slide-content" @click="handleItemClick(item)">
              <div class="slide-background">
                <q-img
                  :src="item.cover"
                  :alt="item.title"
                  class="background-image"
                  fit="cover"
                  loading="lazy"
                />
                <div class="image-overlay"></div>
              </div>

              <div class="content-badge">
                <q-icon :name="getContentIcon(item.type)" size="sm" />
                <span>{{ formatContentType(item.type) }}</span>
              </div>

              <div class="play-button-container">
                <q-btn
                  round
                  color="primary"
                  size="xl"
                  class="play-button"
                  @click.stop="handleItemClick(item)"
                >
                  <q-icon name="play_arrow" size="2rem" />
                  <q-tooltip class="text-body2" anchor="bottom middle" self="top middle">
                    Play {{ item.title }}
                  </q-tooltip>
                </q-btn>
              </div>

              <div class="content-info">
                <h3 class="content-title">{{ item.title }}</h3>
                <div class="content-meta">
                  <q-icon name="trending_up" size="sm" />
                  <span>Trending Now</span>
                </div>
              </div>
            </div>
          </q-carousel-slide>
        </q-carousel>

        <div class="navigation-controls">
          <div class="slide-indicators">
            <button
              v-for="item in items"
              :key="item.id"
              :class="['indicator', { active: currentSlide === item.id }]"
              @click="currentSlide = item.id"
              :aria-label="`Go to slide ${item.title}`"
            >
              <span class="indicator-dot"></span>
            </button>
          </div>
        </div>
      </div>
      <div v-else>
        <q-spinner-dots
          v-if="!items"
          color="primary"
          size="50px"
          class="q-mx-auto block"
        />
        <div v-else class="text-center text-subtitle1 q-pa-lg">
          No trending items available.
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

// The interface and props definition are good, no changes needed.
interface TrendingItem {
  id: number;
  title: string;
  cover: string;
  duration?: string;
  type: 'video' | 'music' | 'book' | 'quote';
}

interface Props {
  items: TrendingItem[];
  autoplay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  autoplay: true,
});

const emit = defineEmits<{
  itemClick: [item: TrendingItem];
}>();

const router = useRouter();

// State management
const currentSlide = ref(1); // Default to a reasonable start value
const autoplayEnabled = ref(props.autoplay);

// Watch for changes in the items prop to set the initial slide
watch(() => props.items, (newItems) => {
  if (newItems && newItems.length) {
    currentSlide.value = newItems[0].id;
  }
}, { immediate: true });

// Content configurations (moved outside functions for clarity)
const contentConfig = {
  video: { icon: 'play_circle', label: 'Video' },
  music: { icon: 'music_note', label: 'Music' },
  book: { icon: 'menu_book', label: 'Book' },
  quote: { icon: 'format_quote', label: 'Quote' },
};

const getContentIcon = (type: string) => {
  return contentConfig[type]?.icon || 'star';
};

const formatContentType = (type: string) => {
  return contentConfig[type]?.label || type.charAt(0).toUpperCase() + type.slice(1);
};

const handleItemClick = (item: TrendingItem) => {
  emit('itemClick', item);
  router.push(`/content/${item.type}/${item.id}`);
};

// Simplified keyboard navigation
const handleKeyDown = (event: KeyboardEvent) => {
  if (!props.items || props.items.length < 2) return;

  const currentItemIndex = props.items.findIndex(item => item.id === currentSlide.value);

  if (event.key === 'ArrowLeft') {
    const prevIndex = (currentItemIndex > 0) ? currentItemIndex - 1 : props.items.length - 1;
    currentSlide.value = props.items[prevIndex].id;
  } else if (event.key === 'ArrowRight') {
    const nextIndex = (currentItemIndex < props.items.length - 1) ? currentItemIndex + 1 : 0;
    currentSlide.value = props.items[nextIndex].id;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
/*
  CSS is well-written and follows a logical structure.
  No major changes are required here, as the styling is a matter of design choice.
  The only small refinement is to ensure the image displays properly,
  which we addressed in the previous response's debugging tips.
  The code below is your original CSS, which is already very good.
*/

.trending-section {
  padding: 4rem 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
}

.trending-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(245, 101, 101, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 1;
}

/* Header Styles */
.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.fire-icon {
  font-size: 3rem;
  color: #f59e0b;
  animation: flicker 2s infinite alternate;
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.section-title {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin: 0;
  display: flex;
  gap: 0.5rem;
}

.trending-text {
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.today-text {
  color: #334155;
}

.section-subtitle {
  font-size: 1.125rem;
  color: #64748b;
  margin: 0;
  font-weight: 400;
}

/* Carousel Wrapper */
.carousel-wrapper {
  position: relative;
  max-width: 1000px;
  margin: 0 auto;
}

.trending-carousel {
  border-radius: 24px;
  overflow: hidden;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.5);
  background: #000;
}

/* Slide Styles */
.carousel-slide {
  padding: 0;
  position: relative;
}

.slide-content {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.slide-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.background-image {
  width: 100%;
  height: 100%;
  transition: transform 0.6s ease;
}

.slide-content:hover .background-image {
  transform: scale(1.1);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.8) 100%
  );
  transition: opacity 0.3s ease;
}

.slide-content:hover .image-overlay {
  opacity: 0.9;
}

/* Content Badge */
.content-badge {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 10;
  transition: all 0.3s ease;
}

.slide-content:hover .content-badge {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(-2px);
}

/* Play Button */
.play-button-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.play-button {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  color: #1976d2;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: scale(0.8);
}

.slide-content:hover .play-button {
  opacity: 1;
  transform: scale(1);
}

.play-button:hover {
  background: white;
  transform: scale(1.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

/* Content Info */
.content-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  background: linear-gradient(
    180deg,
    transparent 0%,
    rgba(0, 0, 0, 0.7) 50%,
    rgba(0, 0, 0, 0.9) 100%
  );
  color: white;
  z-index: 5;
}

.content-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.content-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #e2e8f0;
  font-weight: 500;
}

/* Navigation Controls */
.navigation-controls {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.slide-indicators {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.indicator {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.indicator:hover {
  background: rgba(0, 0, 0, 0.1);
}

.indicator-dot {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #cbd5e1;
  transition: all 0.3s ease;
}

.indicator.active .indicator-dot {
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
  transform: scale(1.2);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.3);
}

/* Loading Placeholder */
.loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Responsive Design */
@media (max-width: 768px) {
  .trending-section {
    padding: 2rem 0;
  }

  .container {
    padding: 0 0.5rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .fire-icon {
    font-size: 2rem;
  }

  .section-subtitle {
    font-size: 1rem;
  }

  .trending-carousel {
    border-radius: 16px;
    height: 300px;
  }

  .content-badge {
    top: 1rem;
    right: 1rem;
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }

  .play-button {
    width: 60px;
    height: 60px;
  }

  .content-info {
    padding: 1.5rem;
  }

  .content-title {
    font-size: 1.25rem;
  }

  .slide-indicators {
    gap: 0.75rem;
  }

  .indicator-dot {
    width: 8px;
    height: 8px;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .trending-section {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }

  .today-text {
    color: #e2e8f0;
  }

  .section-subtitle {
    color: #94a3b8;
  }

  .indicator-dot {
    background: #475569;
  }

  .indicator:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

/* Accessibility */
.indicator:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.play-button:focus {
  outline: 3px solid #3b82f6;
  outline-offset: 3px;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .fire-icon {
    animation: none;
  }

  .background-image,
  .slide-content,
  .play-button,
  .content-badge {
    transition: none;
  }
}
</style>
