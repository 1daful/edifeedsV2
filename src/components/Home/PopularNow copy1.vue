<template>
  <section class="popular-section q-mb-xl">
    <div class="section-header text-center q-mb-lg">
      <h2 class="section-title text-h4 text-weight-bold q-mb-sm">
        <q-icon name="local_fire_department" class="section-icon q-mr-sm" />
        <span class="gradient-text">Trending</span> Today
      </h2>
      <p class="section-subtitle text-body1 text-grey-7">
        Discover what's captivating others right now.
      </p>
    </div>

    <div class="carousel-container relative-position">
      <q-carousel
        v-model="slide"
        height="320px"
        control-color="white"
        control-type="flat"
        arrows
        :autoplay="5000"
        animated
        transition-prev="slide-right"
        transition-next="slide-left"
        class="elegant-carousel shadow-10"
        infinite
      >
        <q-carousel-slide
          v-for="item in items"
          :name="item.id"
          :key="item.id"
          @click="goToContent(item.id, item.type)"
          class="carousel-slide column no-wrap flex-center"
        >
          <div class="slide-image-wrapper">
            <q-img
              :src="item.cover"
              :ratio="16/9"
              class="slide-image"
              fit="cover"
            >
              <template v-slot:loading>
                <div class="loading-shimmer-bg"></div>
              </template>
              <div class="content-type-tag absolute-top-right q-ma-md">
                <q-icon :name="getTypeIcon(item.type)" size="sm" class="q-mr-xs" />
                {{ item.type.toUpperCase() }}
              </div>
               <div class="play-button-overlay flex flex-center">
                <q-btn
                  round
                  color="primary"
                  icon="play_arrow"
                  size="lg"
                  class="play-btn-lg"
                  @click.stop="goToContent(item.id, item.type)"
                >
                  <q-tooltip anchor="center middle" self="center middle" :offset="[10, 10]">
                    View {{ item.type }}
                  </q-tooltip>
                </q-btn>
              </div>
            </q-img>
          </div>

          <div class="slide-content-info text-white text-center q-px-lg q-pb-md">
            <h3 class="content-title text-h6 text-weight-bold q-mb-xs ellipsis-2-lines">
              {{ item.title }}
            </h3>
            <div class="content-meta text-body2 text-grey-4">
              <q-icon name="visibility" size="xs" class="q-mr-xs" />
              Popular
            </div>
          </div>
        </q-carousel-slide>
      </q-carousel>

      <div class="custom-navigation q-mt-md flex flex-center">
        <div class="nav-dots">
          <div
            v-for="item in items"
            :key="item.id"
            :class="['nav-dot', { 'nav-dot--active': slide === item.id }]"
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
  background-color: #f8f9fa; /* Light background for contrast */
}

/* Section Header */
.section-header {
  margin-bottom: 3rem;
}

.section-title {
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.03em;
  color: #212121; /* Darker for better contrast */
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-icon {
  font-size: 2.2rem;
  color: #e53935; /* A more vibrant red for "fire" icon */
}

.gradient-text {
  background: linear-gradient(135deg, #FF5722 0%, #FFC107 100%); /* Warm, inviting gradient */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-weight: 400;
  color: #616161;
  max-width: 600px;
  margin: 0 auto;
}

/* Carousel Container */
.carousel-container {
  max-width: 1000px; /* Constrain width for better focus */
  margin: 0 auto;
}

.elegant-carousel {
  border-radius: 16px;
  overflow: hidden;
  background: #333; /* Darker background for carousel to make content pop */
}

/* Slide Enhancements */
.carousel-slide {
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* Align content to bottom */
  align-items: center;
  padding: 0; /* Remove padding from Quasar slide */
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Smooth ease-out-quad */
}

.carousel-slide:hover {
  transform: translateY(-5px); /* Subtle lift on hover */
}

.slide-image-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 16px; /* Match carousel border-radius */
}

.slide-image {
  object-fit: cover;
  transition: transform 0.6s ease-out; /* Slower, smoother zoom */
}

.carousel-slide:hover .slide-image {
  transform: scale(1.08);
}

/* Gradient Overlay - Darker for readability */
.slide-image-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.9) 100%
  );
  transition: opacity 0.4s ease;
}

.carousel-slide:hover .slide-image-wrapper::after {
  opacity: 0.95; /* More pronounced on hover */
}

/* Content Type Tag - Sleeker design */
.content-type-tag {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  transition: background 0.3s ease;
  z-index: 3; /* Ensure it's above overlay */
}

.carousel-slide:hover .content-type-tag {
  background: rgba(0, 0, 0, 0.6);
}

/* Play Button Overlay - Always visible but subtle */
.play-button-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2); /* Very subtle initial overlay */
  opacity: 0; /* Initially hidden */
  transition: opacity 0.4s ease;
  z-index: 2; /* Below content info, above image */
}

.carousel-slide:hover .play-button-overlay {
  opacity: 1; /* Fully visible on hover */
  background: rgba(0, 0, 0, 0.4); /* Darker on hover */
}

.play-btn-lg {
  transform: scale(0.8); /* Slightly smaller initially */
  opacity: 0; /* Initially hidden */
  transition: transform 0.4s ease, opacity 0.4s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3); /* Subtle shadow for depth */
}

.carousel-slide:hover .play-btn-lg {
  transform: scale(1); /* Return to normal size */
  opacity: 1; /* Fully visible */
}

/* Content Info Block - Overlapping the image slightly */
.slide-content-info {
  position: relative;
  z-index: 3; /* Ensure content is above image and overlay */
  padding-top: 50px; /* Push content down over image */
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.7) 70%,
    transparent 100%
  );
  width: 100%;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

.content-title {
  color: white;
  font-weight: 700; /* Bolder for impact */
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5); /* Subtle text shadow */
}

.content-meta {
  display: flex;
  align-items: center;
  justify-content: center; /* Center meta info */
  margin-top: 0.5rem;
  color: #bdbdbd; /* Lighter grey for better contrast on dark background */
}

/* Custom Navigation Dots */
.custom-navigation {
  padding: 1.5rem 0;
}

.nav-dots {
  display: flex;
  gap: 0.75rem; /* Slightly more space */
  align-items: center;
}

.nav-dot {
  width: 10px; /* Slightly larger */
  height: 10px; /* Slightly larger */
  border-radius: 50%;
  background: #bdbdbd; /* Neutral grey */
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1); /* Subtle shadow for depth */
}

.nav-dot--active {
  background: linear-gradient(135deg, #FF5722 0%, #FFC107 100%); /* Active dot matches header gradient */
  transform: scale(1.4); /* More pronounced active state */
  box-shadow: 0 4px 10px rgba(255,87,34,0.4); /* Glow effect */
}

.nav-dot:hover {
  background: #9e9e9e; /* Darker grey on hover */
  transform: scale(1.2);
}

/* Loading Shimmer Effect */
.loading-shimmer-bg {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  width: 100%;
  height: 100%;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Responsive Design */
@media (max-width: 768px) {
  .popular-section {
    padding: 1.5rem 0;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .section-icon {
    font-size: 1.8rem;
  }

  .section-subtitle {
    font-size: 0.95rem;
    padding: 0 1rem;
  }

  .elegant-carousel {
    border-radius: 12px;
    height: 250px; /* Adjust height for smaller screens */
  }

  .slide-content-info {
    padding: 30px 1rem 1rem;
  }

  .content-title {
    font-size: 1.1rem;
  }

  .content-meta {
    font-size: 0.8rem;
  }

  .content-type-tag {
    padding: 0.3rem 0.6rem;
    font-size: 0.65rem;
    top: 0.5rem;
    right: 0.5rem;
  }

  .play-btn-lg {
    size: md;
  }

  .nav-dot {
    width: 7px;
    height: 7px;
  }

  .nav-dot--active {
    transform: scale(1.3);
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .popular-section {
    background-color: #212121; /* Dark background */
  }

  .section-title {
    color: #e0e0e0;
  }

  .section-subtitle {
    color: #a0a0a0;
  }

  .elegant-carousel {
    background: #424242;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  }

  .nav-dot {
    background: #616161;
  }

  .nav-dot:hover {
    background: #757575;
  }

  .loading-shimmer-bg {
    background: linear-gradient(90deg, #333 25%, #444 50%, #333 75%);
  }
}
</style>
