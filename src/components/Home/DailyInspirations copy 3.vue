<template>
  <section class="daily-inspirations q-mb-xl">
    <div class="section-header q-mb-lg">
      <h2 class="text-h4 text-weight-light text-primary q-mb-xs">Daily Inspirations</h2>
      <div class="header-divider"></div>
    </div>

    <div class="inspirations-grid">
      <q-card
        flat
        class="inspiration-card quote-card"
        @click="onCardClick('quote')"
      >
        <div class="card-icon-wrapper">
          <q-icon name="format_quote" class="card-icon" />
        </div>
        <q-card-section class="card-content">
          <h6 class="card-title">Quote of the Day</h6>
          <p class="card-text">{{ quote }}</p>
        </q-card-section>
        <div class="card-accent quote-accent"></div>
      </q-card>

      <q-card
        flat
        class="inspiration-card song-card"
        @click="onCardClick('song')"
      >
        <div class="card-icon-wrapper">
          <q-icon name="music_note" class="card-icon" />
        </div>
        <q-card-section class="card-content">
          <h6 class="card-title">Worship Song of the Day</h6>
          <p class="card-text">{{ song }}</p>
        </q-card-section>
        <div class="card-accent song-accent"></div>
      </q-card>

      <q-card
        flat
        class="inspiration-card devotional-card"
        @click="onCardClick('devotional')"
      >
        <div class="card-icon-wrapper">
          <q-icon name="menu_book" class="card-icon" />
        </div>
        <q-card-section class="card-content">
          <h6 class="card-title">Devotional Highlight</h6>
          <p class="card-text">{{ devotional }}</p>
        </q-card-section>
        <div class="card-accent devotional-accent"></div>
      </q-card>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  quote: string
  song: string
  devotional: string
}>()

const emit = defineEmits<{
  cardClick: [type: string]
}>()

const onCardClick = (type: string) => {
  emit('cardClick', type)
}
</script>

<style scoped>
.daily-inspirations {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  position: relative;
}

.header-divider {
  width: 60px;
  height: 3px;
  background: linear-gradient(135deg, #1976d2, #42a5f5);
  margin: 0 auto;
  border-radius: 2px;
}

.inspirations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  padding: 0 16px;
}

.inspiration-card {
  position: relative;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.inspiration-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #cbd5e1;
}

.card-icon-wrapper {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.card-icon {
  font-size: 24px;
  color: #64748b;
  transition: all 0.3s ease;
}

.inspiration-card:hover .card-icon {
  color: #1976d2;
  transform: scale(1.1);
}

.card-content {
  padding: 24px;
  padding-right: 80px;
}

.card-title {
  color: #1e293b;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 12px;
  line-height: 1.4;
}

.card-text {
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-accent {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  transition: all 0.3s ease;
}

.quote-accent {
  background: linear-gradient(90deg, #f59e0b, #f97316);
}

.song-accent {
  background: linear-gradient(90deg, #10b981, #059669);
}

.devotional-accent {
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
}

.inspiration-card:hover .card-accent {
  height: 6px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .inspirations-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 0 8px;
  }

  .card-content {
    padding: 20px;
    padding-right: 70px;
  }

  .card-icon-wrapper {
    width: 40px;
    height: 40px;
  }

  .card-icon {
    font-size: 20px;
  }
}

/* Animation for initial load */
.inspiration-card {
  animation: fadeInUp 0.6s ease-out;
}

.inspiration-card:nth-child(2) {
  animation-delay: 0.1s;
}

.inspiration-card:nth-child(3) {
  animation-delay: 0.2s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
