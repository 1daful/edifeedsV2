<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h6">Manage Authors</div>
      <q-btn
        label="Add Author"
        color="primary"
        icon="add"
        @click="addAuthor"
      />
    </div>

    <q-input
      filled
      debounce="300"
      v-model="search"
      placeholder="Search authors..."
      class="q-mb-md"
    />

    <q-table
      :rows="filteredAuthors"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :loading="loading"
      dense
    >
      <template #body-cell-actions="props">
        <q-td align="center">
          <q-btn
            dense
            flat
            icon="edit"
            @click="editAuthor(props.row.id)"
          />
          <q-btn
            dense
            flat
            icon="delete"
            color="negative"
            @click="confirmDelete(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="confirmDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirm Delete</div>
          <div>Are you sure you want to delete <b>{{ authorToDelete?.name }}</b>?</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="deleteAuthor" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '..//../lib/supabase' // adjust based on your project
import { Notify } from 'quasar'
import { AuthorProfile } from '../../utils/types'

const router = useRouter()

const authors = ref<AuthorProfile[]>([])
const search = ref('')
const loading = ref(false)

const confirmDialog = ref(false)
const authorToDelete = ref<AuthorProfile | null>(null)

const columns = [
  { name: 'image', label: '', align: 'left' as const, field: 'image_url', format: (val: any) => `<img src="${val}" alt="" style="height:40px;border-radius:50%;">`, sortable: false },
  { name: 'name', label: 'Name', align: 'left' as const, field: 'name', sortable: true },
  { name: 'slug', label: 'Slug', align: 'left' as const, field: 'slug', sortable: true },
  { name: 'tags', label: 'Tags', align: 'left' as const, field: (row: any) => row.tags?.join(', '), sortable: false },
  { name: 'actions', label: '', align: 'center' as const, field: 'actions', sortable: false },
]

const filteredAuthors = computed(() => {
  if (!search.value) return authors.value
  return authors.value.filter(author =>
    author.name.toLowerCase().includes(search.value.toLowerCase())
    || author.slug.toLowerCase().includes(search.value.toLowerCase())
    || (author.tags?.some(tag => tag.toLowerCase().includes(search.value.toLowerCase())))
  )
})

onMounted(async () => {
  loading.value = true
  const { data, error } = await supabase.from('authors').select('*').order('name')
  if (error) {
    Notify.create({ type: 'negative', message: 'Failed to fetch authors.' })
  } else {
    authors.value = data
  }
  loading.value = false
})

function addAuthor() {
  router.push('/admin/author-form')
}

function editAuthor(id: string) {
  router.push({ path: '/admin/author-form', query: { id } })
}

function confirmDelete(author: AuthorProfile) {
  authorToDelete.value = author
  confirmDialog.value = true
}

async function deleteAuthor() {
  if (!authorToDelete.value) return
  loading.value = true
  const { error } = await supabase.from('authors').delete().eq('id', authorToDelete.value.id)
  loading.value = false
  confirmDialog.value = false

  if (error) {
    Notify.create({ type: 'negative', message: 'Failed to delete author.' })
  } else {
    Notify.create({ type: 'positive', message: 'Author deleted successfully.' })
    authors.value = authors.value.filter(a => a.id !== authorToDelete.value?.id)
  }
}
</script>
