<template>
  <q-page class="q-pa-md" style="max-width: 500px; margin: auto;">
    <div class="text-h6 q-mb-md">{{ isEdit ? 'Edit Author' : 'Create Author' }}</div>

    <q-form @submit="handleSubmit" class="q-gutter-md">

      <q-input v-model="form.name" label="Name" filled required />

      <q-input v-model="form.slug" label="Slug (URL-friendly)" filled required />

      <q-input v-model="form.bio" label="Biography" filled type="textarea" autogrow required />

      <q-input v-model="form.image_url" label="Image URL" filled required />

      <q-input v-model="form.denomination" label="Denomination" filled />

      <q-input v-model="form.country" label="Country" filled />

      <q-input v-model="form.website" label="Website" filled />

      <q-select
        v-model="form.tags"
        :options="tagOptions"
        label="Tags"
        filled
        multiple
        use-chips
        emit-value
        map-options
      />

      <div>
        <div class="text-subtitle2 q-mb-sm">Social Links</div>
        <q-input v-model="form.social_links.youtube" label="YouTube URL" filled />
        <q-input v-model="form.social_links.facebook" label="Facebook URL" filled />
        <q-input v-model="form.social_links.instagram" label="Instagram URL" filled />
        <q-input v-model="form.social_links.twitter" label="Twitter URL" filled />
      </div>

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
import { supabase } from '../../lib/supabase' // adjust based on your project
import { Notify } from 'quasar'
import { AuthorForm } from '../../utils/types'

const route = useRoute()
const router = useRouter()

const form = ref<AuthorForm>({
  name: '',
  slug: '',
  bio: '',
  image_url: '',
  denomination: '',
  country: '',
  website: '',
  tags: [],
  social_links: {}
})

const tagOptions = ['Pastor', 'Worship Leader', 'Author', 'Theologian', 'Missionary']

const isEdit = ref(false)
const loading = ref(false)

onMounted(async () => {
  const authorId = route.query.id as string
  if (authorId) {
    isEdit.value = true
    loading.value = true
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .eq('id', authorId)
      .single()
    if (error) {
      Notify.create({ type: 'negative', message: 'Failed to load author.' })
    } else if (data) {
      form.value = {
        ...data,
        social_links: data.social_links || {}
      }
    }
    loading.value = false
  }
})

async function handleSubmit() {
  loading.value = true

  let response
  if (isEdit.value) {
    response = await supabase
      .from('authors')
      .update({
        ...form.value,
        updated_at: new Date()
      })
      .eq('id', route.query.id)
  } else {
    response = await supabase
      .from('authors')
      .insert({
        ...form.value,
        created_at: new Date(),
        updated_at: new Date()
      })
  }

  const { error } = response
  loading.value = false

  if (error) {
    Notify.create({ type: 'negative', message: error.message })
  } else {
    Notify.create({ type: 'positive', message: 'Author saved successfully.' })
    router.push('/admin/authors')
  }
}
</script>
