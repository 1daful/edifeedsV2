<template>
  <section class="content-section">
    <div class="section-header">
      <h2 class="section-title">
        <q-icon name="wb_sunny" class="section-icon" />
        Daily Inspirations
      </h2>
      <p class="section-subtitle">Your daily dose of spiritual nourishment</p>
    </div>

    <div class="daily-grid">
      <q-card
        v-for="(item, index) in dailyItems"
        :key="index"
        class="daily-card"
        :style="{ animationDelay: `${(index + 1) * 0.1}s` }"
      >
        <q-card-section class="text-center">
          <q-icon
            :name="item.icon"
            class="daily-icon"
            :class="`daily-icon-${index + 1}`"
          />
          <h4 class="daily-title">{{ item.title }}</h4>
          <p class="daily-content">{{ item.content }}</p>
        </q-card-section>
      </q-card>
    </div>
  </section>
</template>

<script setup lang="ts">
  const props = defineProps({
    dailyQuote: {
      type: String,
      default: ''
    },
    dailySong: {
      type: String,
      default: ''
    },
    dailyDevotional: {
      type: String,
      default: ''
    }
  })

  const dailyItems = [
    {
      icon: 'format_quote',
      title: 'Quote of the Day',
      content: props.dailyQuote || '"Faith is taking the first step even when you don\'t see the whole staircase." - Martin Luther King Jr.'
    },
    {
      icon: 'music_note',
      title: 'Song of the Day',
      content: props.dailySong || '"Amazing Grace" - A timeless hymn that speaks to the power of redemption and divine mercy in our lives.'
    },
    {
      icon: 'menu_book',
      title: 'Daily Devotional',
      content: props.dailyDevotional || 'Today\'s reading reminds us that in times of uncertainty, we can find peace in prayer and trust in God\'s plan.'
    }
  ]

</script>

<style scoped>
.content-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 2.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.section-icon {
  font-size: 2.5rem !important;
  color: #f39c12;
  filter: drop-shadow(0 2px 4px rgba(243, 156, 18, 0.3));
}

.section-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  font-weight: 300;
  font-style: italic;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.daily-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.daily-card {
  background: rgba(255, 255, 255, 0.95) !important;
  border-radius: 16px !important;
  position: relative;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out;
}

.daily-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3498db, #e74c3c, #f39c12);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.daily-card:hover {
  transform: translateY(-8px);
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.15),
    0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.daily-card:hover::before {
  opacity: 1;
}

.daily-icon {
  font-size: 3rem !important;
  margin-bottom: 1rem;
  display: block;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s ease;
}

.daily-icon-1 {
  color: #3498db;
}

.daily-icon-2 {
  color: #e74c3c;
}

.daily-icon-3 {
  color: #f39c12;
}

.daily-card:hover .daily-icon {
  transform: scale(1.1);
}

.daily-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.daily-content {
  font-size: 1rem;
  line-height: 1.6;
  color: #34495e;
  font-weight: 400;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Responsive design */
@media (max-width: 768px) {
  .content-section {
    padding: 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .daily-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

/* Animation for cards appearing */
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
</style>
