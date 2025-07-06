<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Manage Christian History</div>
      <q-btn label="Add Entry" color="primary" icon="add" @click="addEntry" />
    </div>

    <q-input filled debounce="300" v-model="search" placeholder="Search history..." class="q-mb-md" />

    <q-table
      :rows="filteredHistory"
      :columns="columns"
      row-key="id"
      flat
      bordered
      dense
      :loading="loading"
    >
      <template #body-cell-actions="props">
        <q-td align="center">
          <q-btn dense flat icon="edit" @click="editEntry(props.row.id)" />
          <q-btn dense flat icon="delete" color="negative" @click="confirmDelete(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="confirmDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirm Delete</div>
          <div>Are you sure you want to delete <b>{{ entryToDelete?.title }}</b>?</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteEntry" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { Notify } from 'quasar'
import dayjs from 'dayjs'
import { HistoryEntry } from '../../utils/types'

const router = useRouter()
const historyEntries = ref<HistoryEntry[]>([])
const search = ref('')
const loading = ref(false)

const confirmDialog = ref(false)
const entryToDelete = ref<HistoryEntry | null>(null)

const columns = [
  { name: 'date', label: 'Date', align: "left" as const, field: (row: any) => dayjs(row.date).format('MMM D, YYYY'), sortable: true },
  { name: 'title', label: 'Title', align: "left" as const, field: 'title', sortable: true },
  { name: 'slug', label: 'Slug', align: "left" as const, field: 'slug', sortable: true },
  { name: 'actions', label: '', align: "center" as const, field: 'actions', sortable: false },
]

const filteredHistory = computed(() => {
  if (!search.value) return historyEntries.value
  return historyEntries.value.filter(entry =>
    entry.title.toLowerCase().includes(search.value.toLowerCase()) ||
    entry.slug.toLowerCase().includes(search.value.toLowerCase())
  )
})

onMounted(async () => {
  loading.value = true
  const { data, error } = await supabase.from('christian_history').select('*').order('date', { ascending: false })
  if (!error) {
    historyEntries.value = data
  } else {
    Notify.create({ type: 'negative', message: 'Failed to fetch history.' })
  }
  loading.value = false
})

function addEntry() {
  router.push('/admin/history-form')
}

function editEntry(id: string) {
  router.push({ path: '/admin/history-form', query: { id } })
}

function confirmDelete(entry: HistoryEntry) {
  entryToDelete.value = entry
  confirmDialog.value = true
}

async function deleteEntry() {
  if (!entryToDelete.value) return
  loading.value = true
  const { error } = await supabase.from('christian_history').delete().eq('id', entryToDelete.value.id)
  loading.value = false
  confirmDialog.value = false

  if (!error) {
    Notify.create({ type: 'positive', message: 'Entry deleted.' })
    historyEntries.value = historyEntries.value.filter(e => e.id !== entryToDelete.value?.id)
  } else {
    Notify.create({ type: 'negative', message: 'Failed to delete entry.' })
  }
}
</script>
