<template>
  <q-page class="landing-page">
    <!-- Background Animation -->
    <div class="background-animation">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
    </div>

    <!-- Main Content -->
    <div class="content-container flex flex-center column q-pa-xl">
      <!-- Logo with Animation -->
      <transition
        appear
        enter-active-class="animated fadeInDown"
        :duration="800"
      >
        <q-img
          src="https://via.placeholder.com/150x150?text=Edifeeds"
          contain
          class="logo q-mb-lg"
          :class="{ 'logo-dark': isDark }"
          style="max-width: 200px;"
        />
      </transition>

      <!-- Animated Title -->
      <transition
        appear
        enter-active-class="animated fadeInUp"
        :duration="1000"
      >
        <div class="title-container text-center q-mb-md">
          <div class="text-h4 text-primary title-text">
            Your Daily Source of
          </div>
          <div class="text-h3 text-accent animated-gradient-text">
            Christian Inspiration
          </div>
        </div>
      </transition>

      <!-- Subtitle with Typing Effect -->
      <transition
        appear
        enter-active-class="animated fadeIn"
        :duration="1200"
      >
        <div class="text-subtitle1 text-grey-7 text-center q-mb-xl subtitle-text">
          {{ displayedText }}
          <span class="cursor" :class="{ 'blink': showCursor }">|</span>
        </div>
      </transition>

      <!-- Feature Cards -->
      <transition
        appear
        enter-active-class="animated fadeInUp"
        :duration="1400"
      >
        <div class="feature-grid q-mb-xl">
          <q-card
            v-for="(feature, index) in features"
            :key="index"
            class="feature-card"
            flat
            bordered
            :class="{ 'feature-card-dark': isDark }"
          >
            <q-card-section class="text-center">
              <q-icon
                :name="feature.icon"
                size="2rem"
                :color="feature.color"
                class="q-mb-sm"
              />
              <div class="text-subtitle2 text-weight-medium">
                {{ feature.title }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </transition>

      <!-- Action Buttons -->
      <transition
        appear
        enter-active-class="animated fadeInUp"
        :duration="1600"
      >
        <div class="button-container">
          <q-btn
            label="Get Started"
            color="primary"
            size="lg"
            class="action-btn primary-btn q-mb-md"
            :loading="isLoading.register"
            @click="goToRegister"
            no-caps
            rounded
          >
            <template v-if="!isLoading.register" v-slot:append>
              <q-icon name="arrow_forward" />
            </template>
          </q-btn>

          <q-btn
            label="Login"
            color="primary"
            size="lg"
            outline
            class="action-btn secondary-btn"
            :loading="isLoading.login"
            @click="goToLogin"
            no-caps
            rounded
          >
            <template v-if="!isLoading.login" v-slot:append>
              <q-icon name="login" />
            </template>
          </q-btn>
        </div>
      </transition>
    </div>

    <!-- Settings Panel -->
    <div class="settings-panel absolute-top-right q-pa-md">
      <q-btn
        round
        flat
        :icon="showSettings ? 'close' : 'settings'"
        color="primary"
        @click="showSettings = !showSettings"
        class="settings-toggle"
      />

      <transition
        enter-active-class="animated slideInRight"
        leave-active-class="animated slideOutRight"
      >
        <q-card
          v-if="showSettings"
          class="settings-card q-pa-md q-mt-sm"
          :class="{ 'settings-card-dark': isDark }"
        >
          <div class="text-subtitle2 q-mb-md">Theme</div>
          <q-toggle
            v-model="isDark"
            checked-icon="dark_mode"
            unchecked-icon="light_mode"
            color="primary"
            label="Dark Mode"
            @update:model-value="toggleDarkMode"
          />

          <div class="text-subtitle2 q-mb-md q-mt-md">Animation</div>
          <q-toggle
            v-model="animationsEnabled"
            icon="animation"
            color="primary"
            label="Enable Animations"
            @update:model-value="toggleAnimations"
          />
        </q-card>
      </transition>
    </div>

    <!-- Loading Overlay -->
    <q-inner-loading :showing="isInitialLoading">
      <q-spinner-gears size="50px" color="primary" />
      <div class="text-primary q-mt-md">Loading Inspiration...</div>
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { ref, onMounted, onUnmounted } from 'vue'

// Composables
const $q = useQuasar()
const router = useRouter()

// Reactive state
const isDark = ref($q.dark.isActive)
const showSettings = ref(false)
const animationsEnabled = ref(true)
const isInitialLoading = ref(true)
const isLoading = ref({
  register: false,
  login: false
})

// Typing animation state
const fullText = "Discover uplifting videos, music, books, and quotes — all in one place."
const displayedText = ref("")
const currentIndex = ref(0)
const showCursor = ref(true)
const typingInterval = ref(null)
const cursorInterval = ref(null)

// Features data
const features = ref([
  { icon: 'video_library', title: 'Inspiring Videos', color: 'primary' },
  { icon: 'library_music', title: 'Uplifting Music', color: 'secondary' },
  { icon: 'menu_book', title: 'Sacred Books', color: 'accent' },
  { icon: 'format_quote', title: 'Daily Quotes', color: 'positive' }
])

// Computed properties
/*const animationClass = computed(() =>
  animationsEnabled.value ? 'animations-enabled' : 'animations-disabled'
)*/

// Methods
const toggleDarkMode = (val) => {
  $q.dark.set(val)
  // Save preference to localStorage
  localStorage.setItem('darkMode', val.toString())
}

const toggleAnimations = (val) => {
  animationsEnabled.value = val
  localStorage.setItem('animationsEnabled', val.toString())
}

const startTypingAnimation = () => {
  if (!animationsEnabled.value) {
    displayedText.value = fullText
    return
  }

  typingInterval.value = setInterval(() => {
    if (currentIndex.value < fullText.length) {
      displayedText.value += fullText[currentIndex.value]
      currentIndex.value++
    } else {
      clearInterval(typingInterval.value)
    }
  }, 50)
}

const startCursorBlink = () => {
  cursorInterval.value = setInterval(() => {
    showCursor.value = !showCursor.value
  }, 500)
}

const goToRegister = async () => {
  isLoading.value.register = true

  try {
    // Simulate API call or validation
    await new Promise(resolve => setTimeout(resolve, 800))

    // Add smooth transition
    if (animationsEnabled.value) {
      document.querySelector('.content-container').style.transform = 'translateX(-100%)'
      document.querySelector('.content-container').style.opacity = '0'

      setTimeout(() => {
        router.push('/register')
      }, 300)
    } else {
      router.push('/register')
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Something went wrong. Please try again.' + error,
      position: 'top'
    })
  } finally {
    isLoading.value.register = false
  }
}

const goToLogin = async () => {
  isLoading.value.login = true

  try {
    await new Promise(resolve => setTimeout(resolve, 800))

    if (animationsEnabled.value) {
      document.querySelector('.content-container').style.transform = 'translateX(100%)'
      document.querySelector('.content-container').style.opacity = '0'

      setTimeout(() => {
        router.push('/login')
      }, 300)
    } else {
      router.push('/login')
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Something went wrong. Please try again.' + error,
      position: 'top'
    })
  } finally {
    isLoading.value.login = false
  }
}

const loadUserPreferences = () => {
  // Load dark mode preference
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    isDark.value = savedDarkMode === 'true'
    $q.dark.set(isDark.value)
  }

  // Load animation preference
  const savedAnimations = localStorage.getItem('animationsEnabled')
  if (savedAnimations !== null) {
    animationsEnabled.value = savedAnimations === 'true'
  }
}

const simulateInitialLoad = async () => {
  // Simulate app initialization
  await new Promise(resolve => setTimeout(resolve, 1500))
  isInitialLoading.value = false
}

// Lifecycle hooks
onMounted(async () => {
  loadUserPreferences()
  await simulateInitialLoad()

  // Start animations after loading
  setTimeout(() => {
    startTypingAnimation()
    startCursorBlink()
  }, 500)
})

onUnmounted(() => {
  if (typingInterval.value) {
    clearInterval(typingInterval.value)
  }
  if (cursorInterval.value) {
    clearInterval(cursorInterval.value)
  }
})
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.floating-shape {
  position: absolute;
  background: linear-gradient(45deg, rgba(25, 118, 210, 0.1), rgba(156, 39, 176, 0.1));
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 100px;
  height: 100px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.content-container {
  position: relative;
  z-index: 1;
  max-width: 500px;
  margin: 0 auto;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.logo {
  transition: all 0.3s ease;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.logo-dark {
  filter: drop-shadow(0 4px 8px rgba(255, 255, 255, 0.1));
}

.title-container {
  margin-bottom: 1rem;
}

.title-text {
  font-weight: 300;
  margin-bottom: 0.5rem;
}

.animated-gradient-text {
  background: linear-gradient(45deg, #1976d2, #9c27b0, #2196f3);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 3s ease infinite;
  font-weight: 600;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.subtitle-text {
  font-size: 1.1rem;
  line-height: 1.5;
  max-width: 400px;
}

.cursor {
  font-weight: 100;
  font-size: 1.2rem;
  color: var(--q-primary);
}

.cursor.blink {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
  max-width: 400px;
}

.feature-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.feature-card-dark {
  background: rgba(0, 0, 0, 0.3);
}

.button-container {
  width: 100%;
  max-width: 300px;
}

.action-btn {
  width: 100%;
  height: 50px;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
}

.secondary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.2);
}

.settings-panel {
  z-index: 100;
}

.settings-toggle {
  transition: all 0.3s ease;
}

.settings-toggle:hover {
  transform: rotate(90deg);
}

.settings-card {
  min-width: 200px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.settings-card-dark {
  background: rgba(30, 30, 30, 0.95);
}

/* Animation classes */
.animated {
  animation-duration: 1s;
  animation-fill-mode: both;
}

.fadeInDown {
  animation-name: fadeInDown;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translate3d(0, -100%, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.fadeInUp {
  animation-name: fadeInUp;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 100%, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.fadeIn {
  animation-name: fadeIn;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.slideInRight {
  animation-name: slideInRight;
}

@keyframes slideInRight {
  from {
    transform: translate3d(100%, 0, 0);
    visibility: visible;
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

.slideOutRight {
  animation-name: slideOutRight;
}

@keyframes slideOutRight {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    visibility: hidden;
    transform: translate3d(100%, 0, 0);
  }
}

/* Responsive design */
@media (max-width: 600px) {
  .feature-grid {
    grid-template-columns: 1fr;
    max-width: 250px;
  }

  .content-container {
    padding: 2rem 1rem;
  }

  .title-text {
    font-size: 1.5rem;
  }

  .animated-gradient-text {
    font-size: 1.8rem;
  }
}

/* Disable animations when user prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animated,
  .floating-shape,
  .animated-gradient-text,
  .cursor.blink {
    animation: none !important;
  }

  .action-btn:hover,
  .feature-card:hover,
  .settings-toggle:hover {
    transform: none !important;
  }
}
</style>
