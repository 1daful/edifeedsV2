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
