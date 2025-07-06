<template>
  <section class="popular-section q-mb-xl">
    <!-- Enhanced Header with Gradient Accent -->
    <!-- div class="section-header q-mb-lg">
      <h2 class="section-title text-h4 text-weight-light q-mb-xs">
        <span class="gradient-text">Popular</span> Now
      </h2>
      <div class="section-subtitle text-grey-6 text-body2">
        Trending content curated for you
      </div>
      <div class="accent-line"></div>
    </div -->
    <div class="section-header">
      <h2 class="section-title">
        <q-icon name="trending_up" class="section-icon" />
        Popular Now
      </h2>
      <p class="section-subtitle">What's inspiring others right now</p>
    </div>

    <!-- Enhanced Carousel Container -->
    <div class="carousel-container">
      <q-carousel
        v-model="slide"
        navigation
        height="280px"
        control-color="primary"
        arrows
        :autoplay="5000"
        animated
        transition-prev="slide-right"
        transition-next="slide-left"
        class="elegant-carousel"
      >
        <q-carousel-slide
          v-for="item in items"
          :name="item.id"
          :key="item.id"
          @click="goToContent(item.id, item.type)"
          class="carousel-slide"
        >
          <!-- Image Container with Overlay Effects -->
          <div class="slide-image-container">
            <q-img
              :src="item.cover"
              :ratio="16/9"
              class="slide-image"
              :img-style="{ objectFit: 'cover' }"
            >
              <template v-slot:loading>
                <div class="loading-shimmer"></div>
              </template>
            </q-img>

            <!-- Gradient Overlay -->
            <div class="gradient-overlay"></div>

            <!-- Content Type Badge -->
            <div class="content-type-badge">
              <q-icon :name="getTypeIcon(item.type)" size="xs" class="q-mr-xs" />
              {{ item.type.toUpperCase() }}
            </div>
          </div>

          <!-- Enhanced Content Info -->
          <div class="slide-content">
            <div class="content-wrapper">
              <h3 class="content-title text-h6 text-weight-medium q-mb-xs">
                {{ item.title }}
              </h3>
              <div class="content-meta text-grey-4 text-caption">
                <q-icon name="trending_up" size="xs" class="q-mr-xs" />
                Trending
              </div>

              <!-- Hover Action Button -->
              <div class="action-button">
                <q-btn
                  round
                  color="primary"
                  icon="play_arrow"
                  size="sm"
                  class="play-btn"
                  @click.stop="goToContent(item.id, item.type)"
                />
              </div>
            </div>
          </div>
        </q-carousel-slide>
      </q-carousel>

      <!-- Custom Navigation Dots -->
      <div class="custom-navigation q-mt-md">
        <div class="nav-dots">
          <div
            v-for="item in items"
            :key="item.id"
            :class="['nav-dot', { active: slide === item.id }]"
            @click="slide = item.id"
          ></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { defineProps } from 'vue'

const props = defineProps<{
  items: Array<{
    id: number
    title: string
    cover: string
    type: string // video | music | book | quote
  }>
}>()

const router = useRouter()
const slide = ref(props.items[0]?.id || 1)

const goToContent = (id: number, type: string) => {
  router.push(`/content/${type}/${id}`)
}

const getTypeIcon = (type: string) => {
  const icons = {
    video: 'play_circle_filled',
    music: 'music_note',
    book: 'menu_book',
    quote: 'format_quote'
  }
  return icons[type] || 'star'
}
</script>

<style scoped>
.popular-section {
  padding: 2rem 0;
}

/* Enhanced Section Header */
.section-header {
  position: relative;
  padding-bottom: 1rem;
}

.section-title {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: -0.02em;
  margin: 0;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-weight: 400;
  opacity: 0.8;
}

.accent-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
}

/* Carousel Container */
.carousel-container {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.elegant-carousel {
  border-radius: 20px;
  overflow: hidden;
}

/* Slide Enhancements */
.carousel-slide {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
  border-radius: 20px;
  overflow: hidden;
}

/*.carousel-slide:hover {
  transform: scale(1.02);
}*/

.slide-image-container {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.slide-image {
  transition: transform 0.5s ease;
  border-radius: 20px;
}

.carousel-slide:hover .slide-image {
  transform: scale(1.05);
}

/* Gradient Overlay */
.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0.8) 100%
  );
  transition: opacity 0.3s ease;
}

.carousel-slide:hover .gradient-overlay {
  opacity: 0.9;
}

/* Content Type Badge */
.content-type-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.carousel-slide:hover .content-type-badge {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* Enhanced Content Info */
.slide-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.3) 70%,
    transparent 100%
  );
}

.content-wrapper {
  position: relative;
  z-index: 2;
}

.content-title {
  color: white;
  margin: 0;
  font-weight: 500;
  line-height: 1.3;
  transition: color 0.3s ease;
}

.content-meta {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  opacity: 0.8;
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

/* Action Button */
.action-button {
  position: absolute;
  top: -3rem;
  right: 0;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.carousel-slide:hover .action-button {
  opacity: 1;
  transform: translateY(0);
}

.play-btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.play-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* Custom Navigation */
.custom-navigation {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.nav-dots {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.nav-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-dot.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scale(1.5);
}

.nav-dot:hover {
  background: rgba(0, 0, 0, 0.5);
  transform: scale(1.2);
}

/* Loading Shimmer Effect */
.loading-shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  width: 100%;
  height: 100%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .popular-section {
    padding: 1rem 0;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .carousel-container {
    border-radius: 15px;
  }

  .slide-content {
    padding: 1.5rem;
  }

  .content-type-badge {
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.4rem 0.8rem;
    font-size: 0.7rem;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .section-subtitle {
    color: rgba(255, 255, 255, 0.7);
  }

  .nav-dot {
    background: rgba(255, 255, 255, 0.3);
  }

  .nav-dot:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  .loading-shimmer {
    background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  }
}
</style>
