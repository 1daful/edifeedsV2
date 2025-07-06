<template>
  <router-view />
</template>

<script setup lang='ts'>
import { onBeforeMount } from 'vue';
import { useAuthStore } from './stores/auth';
import { supabase } from './lib/supabase'

onBeforeMount(() => {
  supabase.auth.onAuthStateChange((event, session) => {
    const authStore = useAuthStore()
    if (session?.user) {
      authStore.user = session.user
    } else {
      authStore.user = null
    }
  })
})
</script>

<style>
.rounded-borders {
  border-radius: 12px;
}

.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
</style>
