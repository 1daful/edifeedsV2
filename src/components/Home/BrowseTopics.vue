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

    <!-- Pill Buttons Layout -->
    <div class="topics-pills">
      <q-btn
        v-for="(topic, index) in topics"
        :key="topic.id"
        class="topic-pill cursor-pointer"
        :class="`topic-pill--${index % 4}`"
        flat
        no-caps
        @click="goToTopic(topic.slug)"
        @mouseenter="onPillHover(index)"
        @mouseleave="onPillLeave(index)"
      >
        <!-- Pill Content -->
        <div class="pill-content">
          <q-icon name="local_offer" size="16px" class="pill-icon q-mr-xs" />
          <span class="pill-text">{{ topic.title }}</span>
          <q-icon
            name="trending_flat"
            size="16px"
            class="pill-arrow q-ml-xs"
          />
        </div>

        <!-- Animated Background -->
        <div class="pill-background"></div>
      </q-btn>
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
const hoveredPill = ref<number | null>(null)

const goToTopic = (slug: string) => {
  router.push(`/topics/${slug}`)
}

const onPillHover = (index: number) => {
  hoveredPill.value = index
}

const onPillLeave = (index: number) => {
  hoveredPill.value = null
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

/* Pill Layout */
.topics-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  padding: 1rem 0;
}

/* Pill Button Styles */
.topic-pill {
  position: relative;
  padding: 8px 20px;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  min-height: 40px;
  font-size: 0.9rem;
  font-weight: 500;
}

.topic-pill:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

/* Pill Color Variations */
.topic-pill--0:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(102, 126, 234, 0.05));
  color: #667eea;
}
.topic-pill--1:hover {
  background: linear-gradient(135deg, rgba(118, 75, 162, 0.1), rgba(118, 75, 162, 0.05));
  color: #764ba2;
}
.topic-pill--2:hover {
  background: linear-gradient(135deg, rgba(64, 224, 208, 0.1), rgba(64, 224, 208, 0.05));
  color: #40e0d0;
}
.topic-pill--3:hover {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 107, 107, 0.05));
  color: #ff6b6b;
}

/* Pill Content */
.pill-content {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.pill-icon {
  opacity: 0.7;
  transition: all 0.3s ease;
}

.topic-pill:hover .pill-icon {
  opacity: 1;
  transform: scale(1.1);
}

.pill-text {
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.pill-arrow {
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.topic-pill:hover .pill-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Animated Background */
.pill-background {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
  z-index: 1;
}

.topic-pill:hover .pill-background {
  left: 100%;
}

/* Responsive Design */
@media (max-width: 768px) {
  .topics-pills {
    gap: 8px;
  }

  .topic-pill {
    padding: 6px 16px;
    min-height: 36px;
    font-size: 0.85rem;
  }

  .section-header {
    padding: 1rem 0;
  }
}

@media (max-width: 480px) {
  .topics-pills {
    flex-direction: column;
    align-items: center;
  }

  .topic-pill {
    width: 100%;
    max-width: 280px;
    justify-content: center;
  }
}

/* Dark Mode Support */
.body--dark .topic-pill {
  background: rgba(30, 30, 30, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
}

.body--dark .topic-pill:hover {
  border-color: rgba(102, 126, 234, 0.3);
}

.body--dark .topic-pill--0:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(102, 126, 234, 0.1));
  color: #667eea;
}
.body--dark .topic-pill--1:hover {
  background: linear-gradient(135deg, rgba(118, 75, 162, 0.2), rgba(118, 75, 162, 0.1));
  color: #764ba2;
}
.body--dark .topic-pill--2:hover {
  background: linear-gradient(135deg, rgba(64, 224, 208, 0.2), rgba(64, 224, 208, 0.1));
  color: #40e0d0;
}
.body--dark .topic-pill--3:hover {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 107, 107, 0.1));
  color: #ff6b6b;
}

/* Loading States */
.topic-pill.loading {
  opacity: 0.7;
  pointer-events: none;
}

.topic-pill.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Focus States for Accessibility */
.topic-pill:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Pulse Animation on Load */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.topic-pill {
  animation: pulse 0.6s ease-out;
}

/* Stagger Animation Delay */
.topic-pill:nth-child(1) { animation-delay: 0.1s; }
.topic-pill:nth-child(2) { animation-delay: 0.2s; }
.topic-pill:nth-child(3) { animation-delay: 0.3s; }
.topic-pill:nth-child(4) { animation-delay: 0.4s; }
.topic-pill:nth-child(5) { animation-delay: 0.5s; }
.topic-pill:nth-child(6) { animation-delay: 0.6s; }
</style>
