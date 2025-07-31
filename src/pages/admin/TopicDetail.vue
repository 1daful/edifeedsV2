<template>
  <q-page class="q-pa-md">
    <q-breadcrumbs class="q-mb-md">
      <q-breadcrumbs-el label="Admin" to="/admin/dashboard" />
      <q-breadcrumbs-el label="Topics" to="/admin/topics" />
      <q-breadcrumbs-el :label="topic?.title || 'Loading...'" />
    </q-breadcrumbs>

    <q-card>
      <q-card-section>
        <div class="row items-center justify-between">
          <div class="text-h5">{{ topic.title }}</div>
          <div class="q-gutter-sm">
            <q-btn color="primary" label="Edit Topic" @click="editTopic" />
            <q-btn color="secondary" label="Assign Content" @click="openAssignModal" />
          </div>
        </div>
        <div class="text-subtitle2 q-mt-sm">{{ topic.description }}</div>
        <div class="q-mt-sm">
          <q-img v-if="topic.imageUrl" :src="topic.imageUrl" :ratio="16/9" style="max-width: 300px;" />
        </div>
        <div class="q-mt-sm">
          <q-badge color="green" v-if="topic.status === 'active'">Active</q-badge>
          <q-badge color="blue" v-if="topic.status === 'upcoming'">Upcoming</q-badge>
          <q-badge color="grey" v-if="topic.status === 'archived'">Archived</q-badge>
        </div>
        <div class="text-caption q-mt-xs">
          {{ topic.startDate }} - {{ topic.endDate }}
        </div>
      </q-card-section>
    </q-card>

    <q-card class="q-mt-md">
      <q-card-section>
        <div class="text-h6">Assigned Contents</div>
        <div class="row q-gutter-md items-center q-mt-sm">
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
      </q-card-section>

      <q-table
        :rows="contents"
        :columns="columns"
        row-key="id"
        flat
        bordered
        dense
        :loading="loading"
      >
        <template v-slot:body-cell-title="props">
          <q-td>
            <div class="text-weight-medium">{{ props.row.title }}</div>
            <div class="text-caption text-grey">{{ props.row.type }}</div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <ContentAssignModal
      v-model="assignModal"
      :topic="topic"
      @assigned="fetchContents"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContentAssignModal from '../../components/Admin/ContentAssigmentmodal.vue'

const route = useRoute()
const router = useRouter()

const topicId = route.params.id
const topic = ref({})
const contents = ref([])
const loading = ref(false)
const assignModal = ref(false)

const filterType = ref(null)
const search = ref('')

const typeOptions = ['video', 'article', 'music', 'quote', 'event']

const columns = [
  { name: 'title', label: 'Title', field: 'title', align: 'left' },
  { name: 'type', label: 'Type', field: 'type', align: 'left' },
  { name: 'createdAt', label: 'Created At', field: 'createdAt', align: 'left' }
]

// Replace with your backend calls
async function fetchTopic() {
  // Placeholder
  topic.value = {
    id: topicId,
    title: 'Faith in Trials',
    description: 'Exploring how to trust God during challenging times.',
    imageUrl: 'https://via.placeholder.com/300x200',
    startDate: '2025-07-22',
    endDate: '2025-07-28',
    status: 'active'
  }
}

async function fetchContents() {
  loading.value = true
  // Replace with your backend filtered fetch:
  contents.value = [
    { id: 1, title: 'Faith in Hard Times', type: 'video', createdAt: '2025-07-19' },
    { id: 2, title: 'Trusting God Fully', type: 'article', createdAt: '2025-07-18' }
  ]
  if (filterType.value) {
    contents.value = contents.value.filter(c => c.type === filterType.value)
  }
  if (search.value) {
    contents.value = contents.value.filter(c => c.title.toLowerCase().includes(search.value.toLowerCase()))
  }
  loading.value = false
}

function openAssignModal() {
  assignModal.value = true
}

function editTopic() {
  router.push(`/admin/topics/${topicId}/edit`)
}

onMounted(() => {
  fetchTopic()
  fetchContents()
})
</script>
