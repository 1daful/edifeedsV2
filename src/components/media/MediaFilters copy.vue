<template>
  <div class="row q-col-gutter-md q-mb-md">
    <div class="col-12 col-md-3">
      <q-select v-model="filters.type" :options="mediaTypes" label="Type" clearable />
    </div>
    <div class="col-12 col-md-3">
      <q-select v-model="filters.category" :options="categories" label="Category" clearable />
    </div>
    <div class="col-12 col-md-3">
      <q-select v-model="filters.creator" :options="creators" label="Creator" clearable />
    </div>
    <div class="col-12 col-md-3">
      <q-btn label="Apply Filters" color="primary" @click="$emit('filter', filters)" />
    </div>
  </div>
</template>

<script setup lang="">
import { ref } from 'vue'

const filters = ref({
  type: null,
  category: null,
  creator: null
})

const mediaTypes = ['Song', 'Sermon', 'Devotional']
const categories = ['Faith', 'Worship', 'Leadership', 'Relationships']
const creators = ['Pastor A', 'Minister B', 'Worship Team C'] // Fetch from Supabase later
</script>
