<template>
  <q-card flat bordered class="media-card">
    <q-img :src="media.thumbnail" :ratio="16/9" />

    <q-card-section>
      <div class="text-subtitle1">{{ media.title }}</div>
      <div class="text-caption text-grey">
        {{ media.creator }} · {{ media.type }}
      </div>
      <div class="q-mt-xs">
        <q-chip v-for="tag in media.tags" :key="tag" size="sm" dense>
          {{ tag }}
        </q-chip>
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat dense icon="play_arrow" @click="playMedia" />
      <q-btn flat dense icon="bookmark_border" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
const props = defineProps({
  media: {
    type: Object,
    required: true
  }
})

function playMedia() {
  window.open(props.media.link, '_blank')
}
</script>
