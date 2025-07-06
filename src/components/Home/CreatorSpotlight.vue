<template>
  <section class="creators-spotlight q-mb-xl">
    <!-- Header Section -->
    <div class="spotlight-header q-mb-lg">
      <div class="header-content">
        <h2 class="spotlight-title">
          <span class="title-gradient">Spotlight on</span>
          <span class="title-accent">Creators</span>
        </h2>
        <div class="title-underline"></div>
      </div>
      <div class="header-decoration">
        <div class="decoration-dot"></div>
        <div class="decoration-line"></div>
      </div>
    </div>

    <!-- Creators Grid -->
    <div class="creators-grid">
      <div
        v-for="(creator, index) in creators"
        :key="creator.id"
        class="creator-card"
        :style="{ '--animation-delay': `${index * 0.1}s` }"
        @click="goToCreator(creator.slug)"
      >
        <div class="card-inner">
          <!-- Avatar Container -->
          <div class="avatar-container">
            <div class="avatar-ring"></div>
            <div class="avatar-glow"></div>
            <q-img
              :src="creator.avatar"
              class="creator-avatar"
              ratio="1"
              loading="lazy"
            >
              <template v-slot:error>
                <div class="avatar-fallback">
                  <q-icon name="person" size="2rem" color="grey-5" />
                </div>
              </template>
            </q-img>
            <div class="avatar-overlay">
              <q-icon name="visibility" size="1.2rem" />
            </div>
          </div>

          <!-- Content -->
          <div class="creator-content">
            <h3 class="creator-name">{{ creator.name }}</h3>
            <p class="creator-bio">{{ creator.bio }}</p>

            <!-- Action Button -->
            <div class="card-action">
              <q-btn
                flat
                dense
                round
                color="primary"
                icon="arrow_forward"
                size="sm"
                class="action-btn"
              />
            </div>
          </div>

          <!-- Card Effects -->
          <div class="card-shimmer"></div>
          <div class="card-border"></div>
        </div>
      </div>
    </div>

    <!-- Background Elements -->
    <div class="bg-elements">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-gradient"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { defineProps } from 'vue'

const props = defineProps<{
  creators: Array<{
    id: number
    name: string
    bio: string
    avatar: string
    slug: string
  }>
}>()

const router = useRouter()
const goToCreator = (slug: string) => {
  router.push(`/creators/${slug}`)
}
</script>

<style scoped>
.creators-spotlight {
  position: relative;
  padding: 2rem 0;
  overflow: hidden;
}

/* Header Styles */
.spotlight-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3rem;
}

.header-content {
  position: relative;
}

.spotlight-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.title-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-accent {
  color: #1976d2;
  position: relative;
}

.title-underline {
  height: 4px;
  width: 60px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
  margin-top: 0.5rem;
  animation: expand 0.8s ease-out;
}

.header-decoration {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.decoration-dot {
  width: 12px;
  height: 12px;
  background: #667eea;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.decoration-line {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, #667eea, transparent);
}

/* Grid Layout */
.creators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Creator Card */
.creator-card {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
  animation: fadeInUp 0.6s ease-out var(--animation-delay);
  animation-fill-mode: both;
}

.card-inner {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  height: 100%;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.creator-card:hover {
  transform: translateY(-8px);
}

.creator-card:hover .card-inner {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* Avatar Styles */
.avatar-container {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
}

.avatar-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid transparent;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2) border-box;
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  transition: all 0.3s ease;
}

.avatar-glow {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.creator-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  z-index: 2;
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 3;
  color: white;
}

.creator-card:hover .avatar-overlay {
  opacity: 1;
}

.creator-card:hover .avatar-glow {
  opacity: 1;
}

.creator-card:hover .avatar-ring {
  transform: scale(1.05);
}

/* Content Styles */
.creator-content {
  text-align: center;
  position: relative;
  z-index: 2;
}

.creator-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  transition: color 0.3s ease;
}

.creator-bio {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.8rem;
}

.card-action {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.action-btn {
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.creator-card:hover .action-btn {
  opacity: 1;
  transform: translateY(0);
}

/* Card Effects */
.card-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease;
}

.creator-card:hover .card-shimmer {
  left: 100%;
}

.card-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 20px;
  padding: 1px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.creator-card:hover .card-border {
  opacity: 1;
}

/* Background Elements */
.bg-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: -1;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

.bg-circle-1 {
  width: 200px;
  height: 200px;
  top: 20%;
  right: 10%;
  animation-delay: -2s;
}

.bg-circle-2 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 15%;
  animation-delay: -4s;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%);
}

/* Animations */
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

@keyframes expand {
  from {
    width: 0;
  }
  to {
    width: 60px;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .creators-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1.5rem;
  }

  .spotlight-title {
    font-size: 2rem;
  }

  .header-decoration {
    display: none;
  }

  .card-inner {
    padding: 1.25rem;
  }

  .avatar-container {
    width: 70px;
    height: 70px;
  }
}

@media (max-width: 480px) {
  .creators-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1rem;
  }

  .spotlight-title {
    font-size: 1.75rem;
  }
}
</style>
