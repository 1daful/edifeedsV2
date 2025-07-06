<template>
  <q-page class="q-pa-md" style="max-width: 600px; margin: auto;">
    <div class="text-h6 q-mb-md">{{ isEdit ? 'Edit History Entry' : 'Add History Entry' }}</div>

    <q-form @submit="handleSubmit" class="q-gutter-md">

      <q-input v-model="form.title" label="Title" filled required />

      <q-input v-model="form.slug" label="Slug (URL-friendly)" filled required />

      <q-input v-model="form.date" label="Date (YYYY-MM-DD)" filled required />

      <q-input v-model="form.summary" label="Summary" filled type="textarea" autogrow required />

      <q-input v-model="form.content" label="Content" filled type="textarea" autogrow required />

      <q-input v-model="form.image_url" label="Image URL (optional)" filled />

      <q-select
        v-model="form.tags"
        :options="tagOptions"
        label="Tags"
        filled
        multiple
        use-chips
      />

      <q-btn
        label="Save"
        type="submit"
        color="primary"
        :loading="loading"
        unelevated
        class="full-width"
      />
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { Notify } from 'quasar'
import { HistoryForm } from '../../utils/types'


const route = useRoute()
const router = useRouter()

const form = ref<HistoryForm>({
  title: '',
  slug: '',
  date: '',
  summary: '',
  content: '',
  image_url: '',
  tags: []
})

const tagOptions = ['Revival', 'Missionary', 'Martyrdom', 'Reformation', 'Church History']

const isEdit = ref(false)
const loading = ref(false)

onMounted(async () => {
  const entryId = route.query.id as string
  if (entryId) {
    isEdit.value = true
    loading.value = true
    const { data, error } = await supabase.from('christian_history').select('*').eq('id', entryId).single()
    if (!error && data) {
      form.value = { ...data }
    } else {
      Notify.create({ type: 'negative', message: 'Failed to load entry.' })
    }
    loading.value = false
  }
})

async function handleSubmit() {
  loading.value = true
  let response
  if (isEdit.value) {
    response = await supabase.from('christian_history').update({ ...form.value }).eq('id', route.query.id)
  } else {
    response = await supabase.from('christian_history').insert({ ...form.value })
  }

  loading.value = false

  if (response.error) {
    Notify.create({ type: 'negative', message: response.error.message })
  } else {
    Notify.create({ type: 'positive', message: 'Entry saved successfully.' })
    router.push('/admin/history')
  }
}
</script>
