<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-sm-6 col-md-4" v-for="item in items" :key="item.id">
      <media-card :media="item" />
    </div>
  </div>
</template>

<script setup>
defineProps(['items'])
import MediaCard from './MediaCard.vue'
</script>
