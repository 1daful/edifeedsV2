<template>
  <section class="content-explorer q-mb-xl">
    <!-- Header with gradient background -->
    <div class="header-section q-mb-lg">
      <div class="header-content">
        <h2 class="section-title">
          <span class="title-gradient">Explore by Content Type</span>
        </h2>
        <div class="title-decoration"></div>
      </div>
    </div>

    <!-- Enhanced tabs with custom styling -->
    <div class="tabs-container">
      <div class="tabs-wrapper">
        <div class="tab-background" :style="tabBackgroundStyle"></div>
        <div class="custom-tabs">
          <button
            v-for="(tabItem, index) in tabs"
            :key="tabItem.name"
            :class="['custom-tab', { active: tab === tabItem.name }]"
            @click="selectTab(tabItem.name, index)"
            @mouseenter="onTabHover(index)"
            @mouseleave="onTabLeave"
          >
            <div class="tab-icon">
              <component :is="tabItem.icon" class="icon" />
            </div>
            <span class="tab-label">{{ tabItem.label }}</span>
            <div class="tab-ripple" :class="{ animate: rippleTab === tabItem.name }"></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Enhanced tab panels with smooth transitions -->
    <div class="panels-container">
      <div class="panel-wrapper">
        <transition-group name="panel" mode="out-in">
          <div
            v-for="tabItem in tabs"
            :key="tabItem.name"
            v-show="tab === tabItem.name"
            :class="['custom-panel', { active: tab === tabItem.name }]"
          >
            <div class="panel-content">
              <div class="content-header">
                <div class="content-icon">
                  <component :is="tabItem.icon" class="large-icon" />
                </div>
                <h3 class="content-title">{{ tabItem.label }}</h3>
              </div>
              <div class="slot-container">
                <slot :name="tabItem.name" />
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Icons (you can replace these with your preferred icon library)
const VideoIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
    </svg>
  `
}

const MusicIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  `
}

const BookIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
    </svg>
  `
}

const QuoteIcon = {
  template: `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
    </svg>
  `
}

const tab = ref('videos')
const rippleTab = ref('')
const activeTabIndex = ref(0)
const hoveredTabIndex = ref(-1)

const tabs = [
  { name: 'videos', label: 'Videos', icon: VideoIcon },
  { name: 'music', label: 'Music', icon: MusicIcon },
  { name: 'books', label: 'Books', icon: BookIcon },
  { name: 'quotes', label: 'Quotes', icon: QuoteIcon }
]

const tabBackgroundStyle = computed(() => {
  const index = hoveredTabIndex.value >= 0 ? hoveredTabIndex.value : activeTabIndex.value
  const translateX = index * 100
  return {
    transform: `translateX(${translateX}%)`,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }
})

const selectTab = (tabName: string, index: number) => {
  tab.value = tabName
  activeTabIndex.value = index
  rippleTab.value = tabName

  // Reset ripple animation
  setTimeout(() => {
    rippleTab.value = ''
  }, 300)
}

const onTabHover = (index: number) => {
  hoveredTabIndex.value = index
}

const onTabLeave = () => {
  hoveredTabIndex.value = -1
}

onMounted(() => {
  // Set initial active tab index
  const initialIndex = tabs.findIndex(t => t.name === tab.value)
  activeTabIndex.value = initialIndex >= 0 ? initialIndex : 0
})
</script>

<style scoped>
.content-explorer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Header Styles */
.header-section {
  position: relative;
  padding: 2rem 0;
  background: linear-gradient(135deg,
    rgba(var(--q-primary-rgb), 0.1) 0%,
    rgba(var(--q-secondary-rgb), 0.05) 100%);
  border-radius: 20px;
  overflow: hidden;
}

.header-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.header-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  position: relative;
}

.title-gradient {
  background: linear-gradient(135deg,
    var(--q-primary) 0%,
    var(--q-secondary) 50%,
    var(--q-accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.title-decoration {
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, var(--q-primary), var(--q-secondary));
  margin: 1rem auto;
  border-radius: 2px;
  position: relative;
}

.title-decoration::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(90deg, var(--q-primary), var(--q-secondary));
  border-radius: 4px;
  opacity: 0.3;
  blur: 4px;
}

/* Tabs Container */
.tabs-container {
  margin: 3rem 0;
}

.tabs-wrapper {
  position: relative;
  background: rgba(var(--q-surface-rgb), 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 8px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.tab-background {
  position: absolute;
  top: 8px;
  left: 8px;
  width: calc(25% - 4px);
  height: calc(100% - 16px);
  background: linear-gradient(135deg, var(--q-primary), var(--q-secondary));
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(var(--q-primary-rgb), 0.3);
  z-index: 1;
}

.custom-tabs {
  display: flex;
  position: relative;
  z-index: 2;
}

.custom-tab {
  flex: 1;
  background: none;
  border: none;
  padding: 1.5rem 1rem;
  cursor: pointer;
  position: relative;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
}

.custom-tab:hover {
  transform: translateY(-2px);
}

.custom-tab.active {
  color: white;
}

.custom-tab:not(.active) {
  color: var(--q-text-color);
}

.tab-icon {
  width: 24px;
  height: 24px;
  position: relative;
  z-index: 3;
}

.icon {
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
}

.custom-tab:hover .icon {
  transform: scale(1.1);
}

.tab-label {
  font-size: 0.9rem;
  font-weight: 600;
  position: relative;
  z-index: 3;
  transition: all 0.3s ease;
}

.tab-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.tab-ripple.animate {
  width: 100px;
  height: 100px;
  opacity: 0;
}

/* Panels */
.panels-container {
  margin-top: 3rem;
}

.panel-wrapper {
  position: relative;
  min-height: 400px;
}

.custom-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: rgba(var(--q-surface-rgb), 0.6);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2rem;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-panel.active {
  opacity: 1;
  transform: translateY(0);
}

.content-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(var(--q-primary-rgb), 0.2);
}

.content-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--q-primary), var(--q-secondary));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(var(--q-primary-rgb), 0.3);
}

.large-icon {
  width: 24px;
  height: 24px;
}

.content-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: var(--q-text-color);
}

.slot-container {
  position: relative;
  z-index: 1;
}

/* Panel Transitions */
.panel-enter-active,
.panel-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.panel-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-explorer {
    padding: 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .custom-tab {
    padding: 1rem 0.5rem;
  }

  .tab-label {
    font-size: 0.8rem;
  }

  .custom-panel {
    padding: 1.5rem;
  }

  .content-header {
    flex-direction: column;
    text-align: center;
  }
}

/* Dark mode support */
.body--dark .tabs-wrapper {
  background: rgba(255, 255, 255, 0.1);
}

.body--dark .custom-panel {
  background: rgba(255, 255, 255, 0.05);
}

.body--dark .header-section {
  background: linear-gradient(135deg,
    rgba(var(--q-primary-rgb), 0.2) 0%,
    rgba(var(--q-secondary-rgb), 0.1) 100%);
}
</style>
