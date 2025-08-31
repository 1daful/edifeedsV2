<template>
  <div class="live-banner text-white text-center q-pa-xl q-rounded-borders-20">
    <div class="live-indicator q-mb-md">
      <div class="live-dot" />
      <span>LIVE NOW</span>
    </div>
    <div class="text-h4 text-weight-bold q-mb-md">Sunday Service - Grace Community</div>
    <div class="text-body1 q-mb-lg">Join 2,847 believers in worship and the Word</div>
    <q-btn unelevated rounded outline label="Join Live Stream" class="q-px-lg q-py-md text-white" />
  </div>
</template>

<style lang="scss" scoped>
.live-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  .live-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 20px;
  }
  .live-dot {
    width: 10px;
    height: 10px;
    background: #ff4444;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
