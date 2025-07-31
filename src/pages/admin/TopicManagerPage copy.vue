<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Topic Management</div>
      <q-btn label="Add Topic" color="primary" @click="openAddDialog" />
    </div>

    <!-- Topics Table -->
    <q-table
      :rows="topics"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :loading="loading"
    >
      <template v-slot:body-cell-actions="props">
        <q-td>
          <q-btn dense flat icon="edit" @click="editTopic(props.row)" />
          <q-btn dense flat icon="archive" color="grey" @click="archiveTopic(props.row)" />
          <q-btn dense flat icon="link" @click="openAssignModal(props.row)" />
          <q-btn dense flat label="open" @click="router.push({
            name: 'topic',
            params: {
              id:props.row.id,
              slug: props.row.slug
            }
          })" />
        </q-td>
      </template>
    </q-table>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="dialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ editingTopic ? 'Edit Topic' : 'Add Topic' }}</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.title" label="Title" />
          <q-input v-model="form.description" label="Description" type="textarea" />
          <q-input v-model="form.cover_image" label="Image URL" />
          <div class="row q-gutter-sm">
            <q-input v-model="form.start_date" label="Start Date" type="date" />
            <q-input v-model="form.end_date" label="End Date" type="date" />
          </div>
          <q-input v-model="form.tags" label="Tags (comma separated)" />
          <q-input v-model="form.scripture" label="Scripture References (comma separated)" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="saveTopic" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add Content -->
     <ContentAssignModal
      v-model="assignModal"
      :topic="selectedTopic"
      @assigned="onContentAssigned"
    />

  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ContentAssignModal from '../../components/Admin/ContentAssigmentmodal.vue'
import { dbClient } from '../../api/apiList'

const router = useRouter()
const assignModal = ref(false)
const selectedTopic = ref({})

function openAssignModal(topic) {
  selectedTopic.value = topic
  assignModal.value = true
}

function onContentAssigned({ topicId, contentIds }) {
  console.log('Assigned contents:', contentIds, 'to topic:', topicId)
  // Refresh topics or UI as needed
}


const topics = ref([])
const loading = ref(false)
const dialog = ref(false)
const editingTopic = ref(null)

const form = ref({
  title: '',
  description: '',
  cover_image: '',
  start_date: '',
  end_date: '',
  tags: '',
  scripture: ''
})

const columns = [
  { name: 'title', label: 'Title', field: 'title', align: 'left' },
  { name: 'startDate', label: 'Start Date', field: 'startDate', align: 'left' },
  { name: 'endDate', label: 'End Date', field: 'endDate', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' }
]

// Replace with your fetch logic
async function fetchTopics() {
  loading.value = true
  // Example placeholder
  topics.value = await dbClient.get({
    method: 'get',
    url: 'topics'
  })


  /*let gh = [
    { title: 'Faith in Trials', start_date: '2025-07-22', end_date: '2025-07-28', status: 'upcoming' },
    { title: 'Prayer and Fasting', start_date: '2025-07-15', end_date: '2025-07-21', status: 'active' }
  ]*/
  console.log('Topics: ', topics)
  loading.value = false
}

function openAddDialog() {
  editingTopic.value = null
  form.value = {
    title: '',
    description: '',
    cover_image: '',
    start_date: '',
    end_date: '',
    tags: '',
    scripture: ''
  }
  dialog.value = true
}

function editTopic(topic) {
  editingTopic.value = topic
  form.value = {
    ...topic,
    tags: topic.tags ? topic.tags.join(', ') : '',
    scripture: topic.scripture ? topic.scripture.join(', ') : ''
  }
  dialog.value = true
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
}


async function saveTopic() {
  let response

  const payload = {
    ...form.value,
    slug: slugify(form.value.title),
    tags: (form.value.tags || '')
      .split(',')
      .map(t => t.trim())
      .filter(t => t),
    scripture: (form.value.scripture || '')
      .split(',')
      .map(t => t.trim())
      .filter(t => t),
    status: 'upcoming'
  }

  if (editingTopic.value) {
    // Update logic
    response = await dbClient.post({
      method: 'post',
      url: 'topics',
      data: { id: editingTopic.value.id, ...payload }
    })
    console.log('Updating topic:', payload)
  } else {
    // Create logic
    response = await dbClient.post({
      method: 'post',
      url: 'topics',
      data: payload
    })
    console.log('Creating topic:', payload)
  }

  dialog.value = false
  fetchTopics()
  console.log('Response:', response)
}


function archiveTopic(topic) {
  console.log('Archiving topic:', topic)
  // Archive logic here
  fetchTopics()
}

onMounted(fetchTopics)
</script>
