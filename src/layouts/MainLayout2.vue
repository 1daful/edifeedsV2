<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="nav-container q-py-sm">
        <q-toolbar-title class="logo">
          Heaven's Gateway
        </q-toolbar-title>
        <q-space />
        <q-btn flat dense round icon="menu" aria-label="Menu" class="gt-xs" />
        <q-btn flat class="nav-btn lt-sm" icon="menu">
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item clickable v-ripple v-close-popup>
                <q-item-section>Home</q-item-section>
              </q-item>
              <q-item clickable v-ripple v-close-popup>
                <q-item-section>Trending</q-item-section>
              </q-item>
              <q-item clickable v-ripple v-close-popup>
                <q-item-section>Worship</q-item-section>
              </q-item>
              <q-item clickable v-ripple v-close-popup>
                <q-item-section>Teachings</q-item-section>
              </q-item>
              <q-item clickable v-ripple v-close-popup>
                <q-item-section>Live</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <div class="nav-links">
          <q-btn flat dense rounded class="nav-link-item" label="Home" to="#home" />
          <q-btn flat dense rounded class="nav-link-item" label="Trending" to="#trending" />
          <q-btn flat dense rounded class="nav-link-item" label="Worship" to="#worship" />
          <q-btn flat dense rounded class="nav-link-item" label="Teachings" to="#teachings" />
          <q-btn flat dense rounded class="nav-link-item" label="Live" to="#live" />
        </div>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.q-header {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  .q-toolbar {
    max-width: 1200px;
    margin: 0 auto;
  }
}
.logo {
  font-size: 2rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}
.nav-links {
  display: flex;
  gap: 1rem;
  .nav-link-item {
    padding: 0.5rem 1rem;
    border-radius: 12px;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.1);
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }
  }
}
</style>
