<template>
  <ProfileCard :currentUser="currentUser" :matchCount="profileStats.matches" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ProfileCard from '../../../components/Community/Profile.vue';

let currentUser = ref({})

const profileStats = ref({
  likes: 245,
  matches: 28,
  views: 1200,
  messages: 156
});
</script>
