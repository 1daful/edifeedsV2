<template>
  <q-dialog v-model="show">
    <q-card style="min-width: 600px; max-width: 90vw;">
      <q-card-section>
        <div class="text-h6">Assign Content to Topic</div>
        <div class="text-subtitle2">{{ topic.title }}</div>
      </q-card-section>

      <q-card-section>
        <div class="row q-gutter-md items-center q-mb-sm">
          <q-select
            v-model="filterType"
            :options="typeOptions"
            label="Filter by Type"
            dense
            clearable
          />
          <q-input v-model="search" label="Search Title" dense clearable />
          <q-btn dense label="Search" @click="fetchContents" />
        </div>

        <q-table
          :rows="contents"
          :columns="columns"
          row-key="id"
          selection="multiple"
          v-model:selected="selected"
          flat bordered
          :loading="loading"
          dense
        >
          <template v-slot:top-right>
            <div>{{ selected.length }} selected</div>
          </template>
        </q-table>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn
          flat
          label="Assign Selected"
          color="primary"
          :disable="selected.length === 0"
          @click="assign"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  topic: { type: Object, required: true }
})
const emit = defineEmits(['update:modelValue', 'assigned'])

const show = ref(props.modelValue)
watch(() => props.modelValue, v => (show.value = v))
watch(show, v => emit('update:modelValue', v))

const filterType = ref(null)
const search = ref('')
const loading = ref(false)
const contents = ref([])
const selected = ref([])

const typeOptions = ['video', 'article', 'music', 'quote', 'event']

const columns = [
  { name: 'title', label: 'Title', field: 'title', align: 'left' },
  { name: 'type', label: 'Type', field: 'type', align: 'left' }
]

// Placeholder fetch function
async function fetchContents() {
  loading.value = true
  // Replace with your backend call:
  contents.value = [
    { id: 1, title: 'Faith in Hard Times', type: 'video' },
    { id: 2, title: 'Trust and Trials', type: 'article' },
    { id: 3, title: 'Praise Playlist', type: 'music' }
  ]
  // Apply filters locally if needed:
  if (filterType.value) {
    contents.value = contents.value.filter(c => c.type === filterType.value)
  }
  if (search.value) {
    contents.value = contents.value.filter(c => c.title.toLowerCase().includes(search.value.toLowerCase()))
  }
  loading.value = false
}

async function assign() {
  loading.value = true
  const contentIds = selected.value.map(item => item.id)
  console.log(`Assigning contents ${contentIds} to topic ${props.topic.id}`)

  // Replace with your backend update logic:
  // await assignContentToTopic(contentIds, props.topic.id)

  loading.value = false
  emit('assigned', { topicId: props.topic.id, contentIds })
  show.value = false
}
</script>
