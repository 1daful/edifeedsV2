<template>
  <section class="q-mb-xl">
    <h2 class="text-h5 text-primary q-mb-md">Explore by Content Type</h2>
    <q-tabs
      v-model="tab"
      dense
      align="justify"
      active-color="primary"
      indicator-color="primary"
    >
      <q-tab name="videos" label="Videos" />
      <q-tab name="music" label="Music" />
      <q-tab name="books" label="Books" />
      <q-tab name="quotes" label="Quotes" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="videos">
        <slot name="videos" />
      </q-tab-panel>
      <q-tab-panel name="music">
        <slot name="music" />
      </q-tab-panel>
      <q-tab-panel name="books">
        <slot name="books" />
      </q-tab-panel>
      <q-tab-panel name="quotes">
        <slot name="quotes" />
      </q-tab-panel>
    </q-tab-panels>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const tab = ref('videos')
</script>
