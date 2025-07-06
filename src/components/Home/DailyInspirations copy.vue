<template>
  <section class="q-mb-xl">
    <h2 class="text-h5 text-primary q-mb-md">Daily Inspirations</h2>
    <q-card-group row wrap>
      <q-card
        flat
        bordered
        class="rounded-borders hover-lift q-ma-sm cursor-pointer"
        style="background-color: #F9FAFB; width: 250px;"
      >
        <q-card-section>
          <h6 class="text-primary">Quote of the Day</h6>
          <p class="text-body2 text-grey-8">{{ quote }}</p>
        </q-card-section>
      </q-card>

      <q-card
        flat
        bordered
        class="rounded-borders hover-lift q-ma-sm cursor-pointer"
        style="background-color: #F9FAFB; width: 250px;"
      >
        <q-card-section>
          <h6 class="text-primary">Worship Song of the Day</h6>
          <p class="text-body2 text-grey-8">{{ song }}</p>
        </q-card-section>
      </q-card>

      <q-card
        flat
        bordered
        class="rounded-borders hover-lift q-ma-sm cursor-pointer"
        style="background-color: #F9FAFB; width: 250px;"
      >
        <q-card-section>
          <h6 class="text-primary">Devotional Highlight</h6>
          <p class="text-body2 text-grey-8">{{ devotional }}</p>
        </q-card-section>
      </q-card>
    </q-card-group>
  </section>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps<{
  quote: string
  song: string
  devotional: string
}>()
</script>
