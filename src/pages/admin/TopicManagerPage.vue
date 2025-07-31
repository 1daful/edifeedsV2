<template>
  <q-page class="q-pa-md">
    <!-- Header Section -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold">Topic Management</div>
        <div class="text-grey-7">Manage your topics and content assignments</div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          label="Bulk Actions"
          color="grey-7"
          outline
          :disable="selectedRows.length === 0"
          @click="showBulkActions = true"
        >
          <q-badge v-if="selectedRows.length > 0" color="primary" floating>
            {{ selectedRows.length }}
          </q-badge>
        </q-btn>
        <q-btn
          label="Add Topic"
          color="primary"
          icon="add"
          @click="openAddDialog"
        />
      </div>
    </div>

    <!-- Filters and Search -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section class="q-py-sm">
        <div class="row q-gutter-md items-center">
          <q-input
            v-model="searchQuery"
            outlined
            dense
            placeholder="Search topics..."
            style="min-width: 250px"
            @keyup.enter="fetchTopics"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-select
            v-model="statusFilter"
            outlined
            dense
            :options="statusOptions"
            label="Status"
            emit-value
            map-options
            clearable
            style="min-width: 120px"
            @update:model-value="fetchTopics"
          />

          <q-select
            v-model="sortBy"
            outlined
            dense
            :options="sortOptions"
            label="Sort by"
            emit-value
            map-options
            style="min-width: 150px"
            @update:model-value="fetchTopics"
          />

          <q-btn
            flat
            icon="refresh"
            @click="refreshTopics"
            :loading="loading"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Topics Table -->
    <q-table
      :rows="filteredTopics"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :loading="loading"
      selection="multiple"
      v-model:selected="selectedRows"
      :pagination="pagination"
      @request="onRequest"
      binary-state-sort
    >
      <!-- Status Column -->
      <template v-slot:body-cell-status="props">
        <q-td>
          <q-chip
            :color="getStatusColor(props.value)"
            :text-color="getStatusTextColor(props.value)"
            size="sm"
            :label="props.value"
          />
        </q-td>
      </template>

      <!-- Tags Column -->
      <template v-slot:body-cell-tags="props">
        <q-td>
          <div class="row q-gutter-xs">
            <q-chip
              v-for="tag in (props.value || []).slice(0, 3)"
              :key="tag"
              size="sm"
              color="blue-grey-2"
              text-color="blue-grey-8"
              :label="tag"
            />
            <q-chip
              v-if="(props.value || []).length > 3"
              size="sm"
              color="grey-3"
              text-color="grey-7"
              :label="`+${(props.value || []).length - 3}`"
            />
          </div>
        </q-td>
      </template>

      <!-- Progress Column -->
      <template v-slot:body-cell-progress="props">
        <q-td>
          <div class="row items-center q-gutter-sm">
            <q-linear-progress
              :value="props.row.completionPercentage / 100"
              :color="getProgressColor(props.row.completionPercentage)"
              size="8px"
              class="col-grow"
            />
            <span class="text-caption">{{ props.row.completionPercentage }}%</span>
          </div>
        </q-td>
      </template>

      <!-- Actions Column -->
      <template v-slot:body-cell-actions="props">
        <q-td>
          <q-btn-group flat>
            <q-btn
              dense
              flat
              icon="visibility"
              @click="router.push({
                name: 'topic',
                params: {
                  id: props.row.id,
                  slug: props.row.slug
                }
              })"
            >
              <q-tooltip>View Topic</q-tooltip>
            </q-btn>
            <q-btn
              dense
              flat
              icon="edit"
              @click="editTopic(props.row)"
            >
              <q-tooltip>Edit Topic</q-tooltip>
            </q-btn>
            <q-btn
              dense
              flat
              icon="link"
              @click="openAssignModal(props.row)"
            >
              <q-tooltip>Assign Content</q-tooltip>
            </q-btn>
            <q-btn
              dense
              flat
              :icon="props.row.status === 'archived' ? 'unarchive' : 'archive'"
              :color="props.row.status === 'archived' ? 'positive' : 'grey'"
              @click="toggleArchive(props.row)"
            >
              <q-tooltip>{{ props.row.status === 'archived' ? 'Restore' : 'Archive' }}</q-tooltip>
            </q-btn>
            <q-btn
              dense
              flat
              icon="more_vert"
            >
              <q-menu>
                <q-list dense>
                  <q-item clickable @click="duplicateTopic(props.row)">
                    <q-item-section avatar>
                      <q-icon name="content_copy" />
                    </q-item-section>
                    <q-item-section>Duplicate</q-item-section>
                  </q-item>
                  <q-item clickable @click="exportTopic(props.row)">
                    <q-item-section avatar>
                      <q-icon name="download" />
                    </q-item-section>
                    <q-item-section>Export</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item
                    clickable
                    @click="confirmDelete(props.row)"
                    class="text-negative"
                  >
                    <q-item-section avatar>
                      <q-icon name="delete" />
                    </q-item-section>
                    <q-item-section>Delete</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-btn-group>
        </q-td>
      </template>

      <!-- No Data -->
      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey-7 q-gutter-sm q-py-xl">
          <q-icon size="2em" name="topic" />
          <span>No topics found</span>
        </div>
      </template>
    </q-table>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 500px; max-width: 600px;">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ editingTopic ? 'Edit Topic' : 'Add New Topic' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="row q-gutter-md">
            <div class="col-12">
              <q-input
                v-model="form.title"
                label="Title *"
                :rules="[val => !!val || 'Title is required']"
                ref="titleInput"
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="form.description"
                label="Description"
                type="textarea"
                rows="3"
                counter
                maxlength="500"
              />
            </div>

            <div class="col-12">
              <q-input
                v-model="form.cover_image"
                label="Cover Image URL"
                hint="Enter a valid image URL"
              >
                <template v-slot:append>
                  <q-btn
                    flat
                    icon="preview"
                    @click="previewImage"
                    :disable="!form.cover_image"
                  />
                </template>
              </q-input>
            </div>

            <div class="col-6">
              <q-input
                v-model="form.start_date"
                label="Start Date *"
                type="date"
                :rules="[val => !!val || 'Start date is required']"
              />
            </div>

            <div class="col-6">
              <q-input
                v-model="form.end_date"
                label="End Date"
                type="date"
                :rules="[
                  val => !val || !form.start_date || val >= form.start_date || 'End date must be after start date'
                ]"
              />
            </div>

            <div class="col-6">
              <q-select
                v-model="form.status"
                :options="statusOptions"
                label="Status"
                emit-value
                map-options
              />
            </div>

            <div class="col-6">
              <q-select
                v-model="form.priority"
                :options="priorityOptions"
                label="Priority"
                emit-value
                map-options
              />
            </div>

            <div class="col-12">
              <q-select
                v-model="form.tags"
                label="Tags"
                multiple
                use-input
                use-chips
                new-value-mode="add-unique"
                input-debounce="0"
                hint="Press Enter to add new tags"
              />
            </div>

            <div class="col-12">
              <q-select
                v-model="form.scripture"
                label="Scripture References"
                multiple
                use-input
                use-chips
                new-value-mode="add-unique"
                input-debounce="0"
                hint="e.g., John 3:16, Romans 8:28"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            label="Save Topic"
            color="primary"
            @click="saveTopic"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Bulk Actions Dialog -->
    <q-dialog v-model="showBulkActions">
      <q-card>
        <q-card-section>
          <div class="text-h6">Bulk Actions</div>
          <div class="text-grey-7">{{ selectedRows.length }} topics selected</div>
        </q-card-section>

        <q-card-section>
          <div class="column q-gutter-sm">
            <q-btn
              flat
              label="Archive Selected"
              icon="archive"
              @click="bulkArchive"
            />
            <q-btn
              flat
              label="Change Status"
              icon="flag"
              @click="showBulkStatusDialog = true"
            />
            <q-btn
              flat
              label="Export Selected"
              icon="download"
              @click="bulkExport"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Content Assignment Modal -->
    <ContentAssignModal
      v-model="assignModal"
      :topic="selectedTopic"
      @assigned="onContentAssigned"
    />

    <!-- Image Preview Dialog -->
    <q-dialog v-model="showImagePreview">
      <q-card>
        <q-card-section>
          <img
            :src="form.cover_image"
            style="max-width: 100%; height: auto;"
            @error="imageError = true"
          />
          <div v-if="imageError" class="text-center text-negative q-pa-md">
            Failed to load image
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ContentAssignModal from '../../components/Admin/ContentAssigmentmodal.vue'
import { dbClient } from '../../api/apiList'

// Composables
const router = useRouter()
const $q = useQuasar()

// Reactive data
const topics = ref([])
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editingTopic = ref(null)
const selectedRows = ref([])
const searchQuery = ref('')
const statusFilter = ref(null)
const sortBy = ref('created_at_desc')
const assignModal = ref(false)
const selectedTopic = ref({})
const showBulkActions = ref(false)
const showBulkStatusDialog = ref(false)
const showImagePreview = ref(false)
const imageError = ref(false)
const titleInput = ref(null)

// Form data
const form = ref({
  title: '',
  description: '',
  cover_image: '',
  start_date: '',
  end_date: '',
  tags: [],
  scripture: [],
  status: 'upcoming',
  priority: 'medium'
})

// Table configuration
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const columns = [
  {
    name: 'title',
    label: 'Title',
    field: 'title',
    align: 'left',
    sortable: true,
    style: 'min-width: 200px'
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center',
    sortable: true
  },
  {
    name: 'start_date',
    label: 'Start Date',
    field: 'start_date',
    align: 'center',
    sortable: true,
    format: val => val ? new Date(val).toLocaleDateString() : '-'
  },
  {
    name: 'end_date',
    label: 'End Date',
    field: 'end_date',
    align: 'center',
    sortable: true,
    format: val => val ? new Date(val).toLocaleDateString() : '-'
  },
  {
    name: 'tags',
    label: 'Tags',
    field: 'tags',
    align: 'left',
    style: 'min-width: 150px'
  },
  {
    name: 'progress',
    label: 'Progress',
    field: 'progress',
    align: 'center',
    style: 'min-width: 120px'
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'right',
    style: 'width: 200px'
  }
]

// Options
const statusOptions = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Archived', value: 'archived' }
]

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' }
]

const sortOptions = [
  { label: 'Created (Newest)', value: 'created_at_desc' },
  { label: 'Created (Oldest)', value: 'created_at_asc' },
  { label: 'Title (A-Z)', value: 'title_asc' },
  { label: 'Title (Z-A)', value: 'title_desc' },
  { label: 'Start Date', value: 'start_date_asc' }
]

// Computed properties
const filteredTopics = computed(() => {
  let filtered = [...topics.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(topic =>
      topic.title?.toLowerCase().includes(query) ||
      topic.description?.toLowerCase().includes(query) ||
      (topic.tags || []).some(tag => tag.toLowerCase().includes(query))
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(topic => topic.status === statusFilter.value)
  }

  return filtered
})

// Helper functions
function getStatusColor(status: string) {
  const colors = {
    upcoming: 'blue',
    active: 'green',
    completed: 'purple',
    archived: 'grey'
  }
  return colors[status] || 'grey'
}

function getStatusTextColor(status: string) {
  return 'white'
}

function getProgressColor(percentage: number) {
  if (percentage < 25) return 'red'
  if (percentage < 50) return 'orange'
  if (percentage < 75) return 'yellow'
  return 'green'
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// API functions
async function fetchTopics() {
  try {
    loading.value = true
    const response = await dbClient.get({
      method: 'get',
      url: 'topics',
      params: {
        search: searchQuery.value,
        status: statusFilter.value,
        sort: sortBy.value,
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage
      }
    })

    topics.value = (response.data || response || []).map(topic => ({
      ...topic,
      completionPercentage: Math.floor(Math.random() * 100) // Mock data
    }))

    pagination.value.rowsNumber = response.total || topics.value.length
  } catch (error) {
    console.error('Failed to fetch topics:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load topics',
      caption: error.message || 'Please try again'
    })
  } finally {
    loading.value = false
  }
}

async function saveTopic() {
  try {
    saving.value = true

    const payload = {
      ...form.value,
      slug: slugify(form.value.title),
      updated_at: new Date().toISOString()
    }

    let response
    if (editingTopic.value) {
      response = await dbClient.post({
        method: 'put',
        url: `topics`,
        data: payload
      })
    } else {
      response = await dbClient.post({
        method: 'post',
        url: 'topics',
        data: { ...payload, created_at: new Date().toISOString() }
      })
    }

    $q.notify({
      type: 'positive',
      message: `Topic ${editingTopic.value ? 'updated' : 'created'} successfully`
    })

    dialog.value = false
    await fetchTopics()
  } catch (error) {
    console.error('Failed to save topic:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to save topic',
      caption: error.message || 'Please try again'
    })
  } finally {
    saving.value = false
  }
}

// Dialog functions
function openAddDialog() {
  editingTopic.value = null
  form.value = {
    title: '',
    description: '',
    cover_image: '',
    start_date: '',
    end_date: '',
    tags: [],
    scripture: [],
    status: 'upcoming',
    priority: 'medium'
  }
  dialog.value = true
  nextTick(() => {
    titleInput.value?.focus()
  })
}

function editTopic(topic) {
  editingTopic.value = topic
  form.value = {
    ...topic,
    tags: topic.tags || [],
    scripture: topic.scripture || []
  }
  dialog.value = true
}

function previewImage() {
  imageError.value = false
  showImagePreview.value = true
}

// Topic actions
async function toggleArchive(topic) {
  const newStatus = topic.status === 'archived' ? 'upcoming' : 'archived'
  const action = newStatus === 'archived' ? 'archived' : 'restored'

  try {
    await dbClient.post({
      method: 'put',
      url: `topics/${topic.id}`,
      data: { status: newStatus }
    })

    $q.notify({
      type: 'positive',
      message: `Topic ${action} successfully`
    })

    await fetchTopics()
  } catch (error) {
    console.error(`Failed to ${action.slice(0, -1)} topic:`, error)
    $q.notify({
      type: 'negative',
      message: `Failed to ${action.slice(0, -1)} topic`
    })
  }
}

function confirmDelete(topic) {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete "${topic.title}"? This action cannot be undone.`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await dbClient.delete({
        method: 'delete',
        url: `topics/${topic.id}`
      })

      $q.notify({
        type: 'positive',
        message: 'Topic deleted successfully'
      })

      await fetchTopics()
    } catch (error) {
      console.error('Failed to delete topic:', error)
      $q.notify({
        type: 'negative',
        message: 'Failed to delete topic'
      })
    }
  })
}

function duplicateTopic(topic) {
  const duplicated = {
    ...topic,
    title: `${topic.title} (Copy)`,
    id: undefined,
    created_at: undefined,
    updated_at: undefined
  }

  editingTopic.value = null
  form.value = duplicated
  dialog.value = true
}

function exportTopic(topic) {
  const dataStr = JSON.stringify(topic, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `topic-${topic.slug || topic.id}.json`
  link.click()
  URL.revokeObjectURL(url)
}

// Bulk actions
async function bulkArchive() {
  try {
    const promises = selectedRows.value.map(topic =>
      dbClient.post({
        method: 'patch',
        url: `topics/${topic.id}`,
        data: { status: 'archived' }
      })
    )

    await Promise.all(promises)

    $q.notify({
      type: 'positive',
      message: `${selectedRows.value.length} topics archived successfully`
    })

    selectedRows.value = []
    showBulkActions.value = false
    await fetchTopics()
  } catch (error) {
    console.error('Failed to bulk archive:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to archive topics'
    })
  }
}

function bulkExport() {
  const data = selectedRows.value.map(topic => ({
    ...topic,
    exported_at: new Date().toISOString()
  }))

  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `topics-export-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)

  selectedRows.value = []
  showBulkActions.value = false
}

// Table events
function onRequest(props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination

  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending

  fetchTopics()
}

function refreshTopics() {
  selectedRows.value = []
  fetchTopics()
}

// Content assignment
function openAssignModal(topic) {
  selectedTopic.value = topic
  assignModal.value = true
}

function onContentAssigned({ topicId, contentIds }) {
  console.log('Assigned contents:', contentIds, 'to topic:', topicId)
  $q.notify({
    type: 'positive',
    message: `${contentIds.length} content items assigned successfully`
  })
  fetchTopics()
}

// Lifecycle
onMounted(() => {
  fetchTopics()
})
</script>

<style scoped>
.q-table th {
  font-weight: bold;
}

.q-chip {
  font-size: 0.75rem;
}
</style>
