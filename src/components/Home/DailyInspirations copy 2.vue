<template>
  <section class="q-mb-xl">
    <!-- Enhanced Header with Gradient Text -->
    <div class="text-center q-mb-lg">
      <h2 class="gradient-text text-h4 q-mb-sm" style="font-weight: 600; letter-spacing: -0.5px;">
        Daily Inspirations
      </h2>
      <div class="accent-line"></div>
    </div>

    <!-- Enhanced Card Grid with Staggered Animation -->
    <div class="inspiration-grid">
      <q-card
        v-for="(item, index) in inspirationItems"
        :key="index"
        class="inspiration-card"
        :class="`card-${index + 1}`"
        flat
        @click="onCardClick(item.type)"
      >
        <!-- Gradient Background Overlay -->
        <div class="card-gradient-overlay" :class="item.gradientClass"></div>

        <!-- Card Content -->
        <q-card-section class="card-content">
          <!-- Icon with Animated Background -->
          <div class="icon-container" :class="item.iconBg">
            <q-icon
              :name="item.icon"
              size="28px"
              class="icon-main"
              :class="item.iconColor"
            />
          </div>

          <!-- Title with Enhanced Typography -->
          <h6 class="card-title">
            {{ item.title }}
          </h6>

          <!-- Content with Better Spacing -->
          <p class="card-text">
            {{ item.content }}
          </p>

          <!-- Subtle Action Indicator -->
          <div class="card-action">
            <q-icon name="arrow_forward" size="16px" class="action-icon" />
          </div>
        </q-card-section>

        <!-- Decorative Elements -->
        <div class="card-shine"></div>
        <div class="card-border-glow"></div>
      </q-card>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'

const props = defineProps<{
  quote: string
  song: string
  devotional: string
}>()

const inspirationItems = computed(() => [
  {
    type: 'quote',
    title: 'Quote of the Day',
    content: props.quote,
    icon: 'format_quote',
    iconColor: 'text-amber-7',
    iconBg: 'icon-bg-amber',
    gradientClass: 'gradient-amber'
  },
  {
    type: 'song',
    title: 'Worship Song',
    content: props.song,
    icon: 'music_note',
    iconColor: 'text-purple-7',
    iconBg: 'icon-bg-purple',
    gradientClass: 'gradient-purple'
  },
  {
    type: 'devotional',
    title: 'Devotional Highlight',
    content: props.devotional,
    icon: 'auto_stories',
    iconColor: 'text-teal-7',
    iconBg: 'icon-bg-teal',
    gradientClass: 'gradient-teal'
  }
])

const onCardClick = (type: string) => {
  // Handle card click - could emit event or navigate
  console.log(`Clicked ${type} card`)
}
</script>

<style scoped>
/* Enhanced Typography */
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.accent-line {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  margin: 0 auto;
  border-radius: 2px;
}

/* Grid Layout */
.inspiration-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Enhanced Card Styles */
.inspiration-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  min-height: 200px;
}

.inspiration-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* Staggered Animation */
.card-1 { animation-delay: 0.1s; }
.card-2 { animation-delay: 0.2s; }
.card-3 { animation-delay: 0.3s; }

/* Gradient Overlays */
.card-gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  transition: height 0.3s ease;
}

.inspiration-card:hover .card-gradient-overlay {
  height: 100%;
  opacity: 0.05;
}

.gradient-amber {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.gradient-purple {
  background: linear-gradient(135deg, #a855f7, #7c3aed);
}

.gradient-teal {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
}

/* Card Content */
.card-content {
  position: relative;
  z-index: 2;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Icon Styles */
.icon-container {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.icon-bg-amber {
  background: linear-gradient(135deg, #fef3c7, #fed7aa);
}

.icon-bg-purple {
  background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
}

.icon-bg-teal {
  background: linear-gradient(135deg, #ccfbf1, #a7f3d0);
}

.inspiration-card:hover .icon-container {
  transform: scale(1.1) rotate(5deg);
}

.icon-main {
  transition: all 0.3s ease;
}

/* Typography */
.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #1f2937;
  letter-spacing: -0.3px;
}

.card-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #6b7280;
  margin: 0;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Action Indicator */
.card-action {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  opacity: 0;
  transition: all 0.3s ease;
}

.inspiration-card:hover .card-action {
  opacity: 1;
  transform: translateX(0);
}

.action-icon {
  color: #9ca3af;
  transition: all 0.3s ease;
}

.inspiration-card:hover .action-icon {
  color: #6b7280;
  transform: translateX(4px);
}

/* Decorative Elements */
.card-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transition: left 0.5s;
}

.inspiration-card:hover .card-shine {
  left: 100%;
}

.card-border-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  padding: 1px;
  background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: exclude;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.inspiration-card:hover .card-border-glow {
  opacity: 1;
}

/* Responsive Design */
@media (max-width: 600px) {
  .inspiration-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 0 16px;
  }

  .card-content {
    padding: 20px;
  }

  .gradient-text {
    font-size: 1.5rem;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .inspiration-card {
    background: rgba(31, 41, 55, 0.95);
    border-color: rgba(75, 85, 99, 0.3);
  }

  .card-title {
    color: #f9fafb;
  }

  .card-text {
    color: #d1d5db;
  }
}
</style>
