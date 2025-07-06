<template>
  <section class="topic-browser q-mb-xl">
    <!-- Enhanced Header with Gradient -->
    <div class="section-header q-mb-lg">
      <h2 class="section-title text-h4 text-weight-light q-mb-sm">
        <span class="gradient-text">Explore</span> Topics
      </h2>
      <div class="section-subtitle text-grey-6">
        Discover fascinating subjects curated just for you
      </div>
      <div class="header-accent"></div>
    </div>

    <!-- Enhanced Grid Layout -->
    <div class="topics-grid">
      <q-card
        v-for="(topic, index) in topics"
        :key="topic.id"
        class="topic-card rounded-borders cursor-pointer"
        :class="`topic-card--${index % 4}`"
        flat
        @click="goToTopic(topic.slug)"
        @mouseenter="onCardHover(index)"
        @mouseleave="onCardLeave(index)"
      >
        <!-- Image Container with Overlay -->
        <div class="image-container">
          <q-img
            :src="topic.image"
            ratio="16/9"
            class="topic-image"
            loading="lazy"
          >
            <div class="image-overlay">
              <q-icon name="arrow_forward" size="24px" class="explore-icon" />
            </div>
          </q-img>

          <!-- Floating Badge -->
          <div class="topic-badge">
            <q-icon name="local_offer" size="14px" class="q-mr-xs" />
            Topic
          </div>
        </div>

        <!-- Content Section -->
        <q-card-section class="topic-content">
          <div class="topic-title text-h6 text-weight-medium q-mb-xs">
            {{ topic.title }}
          </div>
          <div class="topic-description text-body2 text-grey-6 q-mb-md">
            {{ topic.description }}
          </div>

          <!-- Action Footer -->
          <div class="topic-footer">
            <span class="explore-text text-primary text-weight-medium">
              Explore
            </span>
            <q-icon
              name="trending_flat"
              size="18px"
              class="explore-arrow text-primary"
            />
          </div>
        </q-card-section>

        <!-- Animated Border -->
        <div class="card-border"></div>
      </q-card>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { defineProps, ref } from 'vue'

const props = defineProps<{
  topics: Array<{
    id: number
    title: string
    description: string
    image: string
    slug: string
  }>
}>()

const router = useRouter()
const hoveredCard = ref<number | null>(null)

const goToTopic = (slug: string) => {
  router.push(`/topics/${slug}`)
}

const onCardHover = (index: number) => {
  hoveredCard.value = index
}

const onCardLeave = (index: number) => {
  hoveredCard.value = null
}
</script>

<style scoped>
.topic-browser {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

/* Enhanced Header Styles */
.section-header {
  text-align: center;
  position: relative;
  padding: 2rem 0;
}

.section-title {
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.2;
  margin-bottom: 0.5rem;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
}

.section-subtitle {
  font-size: 1.1rem;
  opacity: 0.8;
  margin-bottom: 1rem;
}

.header-accent {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
  margin: 0 auto;
  opacity: 0.8;
}

/* Advanced Grid Layout */
.topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 1rem 0;
}

/* Enhanced Card Styles */
.topic-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.topic-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

/* Card Color Variations */
.topic-card--0:hover { box-shadow: 0 20px 40px rgba(102, 126, 234, 0.2); }
.topic-card--1:hover { box-shadow: 0 20px 40px rgba(118, 75, 162, 0.2); }
.topic-card--2:hover { box-shadow: 0 20px 40px rgba(64, 224, 208, 0.2); }
.topic-card--3:hover { box-shadow: 0 20px 40px rgba(255, 107, 107, 0.2); }

/* Image Container */
.image-container {
  position: relative;
  overflow: hidden;
}

.topic-image {
  transition: transform 0.4s ease;
}

.topic-card:hover .topic-image {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.topic-card:hover .image-overlay {
  opacity: 1;
}

.explore-icon {
  color: white;
  transform: translateX(-10px);
  transition: transform 0.3s ease;
}

.topic-card:hover .explore-icon {
  transform: translateX(0);
}

/* Floating Badge */
.topic-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #667eea;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.topic-card:hover .topic-badge {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

/* Content Section */
.topic-content {
  padding: 1.5rem;
}

.topic-title {
  color: #2c3e50;
  line-height: 1.3;
  margin-bottom: 0.5rem;
  transition: color 0.3s ease;
}

.topic-card:hover .topic-title {
  color: #667eea;
}

.topic-description {
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Action Footer */
.topic-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.explore-text {
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.explore-arrow {
  transform: translateX(-5px);
  opacity: 0.7;
  transition: all 0.3s ease;
}

.topic-card:hover .explore-arrow {
  transform: translateX(0);
  opacity: 1;
}

/* Animated Border */
.card-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  padding: 2px;
  background: linear-gradient(45deg, transparent, rgba(102, 126, 234, 0.5), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.topic-card:hover .card-border {
  opacity: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .topics-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .section-header {
    padding: 1rem 0;
  }

  .topic-content {
    padding: 1rem;
  }
}

/* Dark Mode Support */
.body--dark .topic-card {
  background: rgba(30, 30, 30, 0.95);
  border-color: rgba(255, 255, 255, 0.1);
}

.body--dark .topic-title {
  color: #e0e0e0;
}

.body--dark .topic-card:hover .topic-title {
  color: #667eea;
}

.body--dark .topic-badge {
  background: rgba(50, 50, 50, 0.9);
  color: #667eea;
}

/* Loading Animation */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.topic-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transition: left 0.5s ease;
}

.topic-card:hover::before {
  left: 100%;
}
</style>
