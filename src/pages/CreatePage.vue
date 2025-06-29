<!-- src/pages/CreateContentPage.vue -->
<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md"> Submit New Content</div>

    <q-form @submit.prevent="handleSubmit(form.type)" class="q-gutter-md">
      <q-select filled v-model="form.type" :options="mediaTypes" label="Content Type" />

      <q-input filled v-model="form.title" label="Title" />
      <q-input filled v-model="form.description" type="textarea" label="Description" />
      <q-input filled v-model="form.link" label="Source Link (optional)" />
      <q-input filled v-model="form.thumbnail" label="Thumbnail URL" />
      <q-uploader
        label="Upload thumbnail image"
        accept="image/*"
        :auto-upload="false"
        :hide-upload-btn="true"
        @added="onFileAdded"
        style="max-width: 300px"
      />
      <q-img
        v-if="form.thumbnail"
        :src="form.thumbnail"
        class="q-mt-md"
        style="max-width: 200px;"
      />
      <q-input filled v-model="form.author" label="Author / Minister" />
      <q-input filled v-model="form.topic" label="Topic / Tag" />

      <div class="text-right">
        <q-btn label="Submit Content" color="primary" type="submit" />
      </div>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { QueryType, SupabaseRepo } from "@edifiles/services";
import { addFiles } from "../utils/storage";
import { config } from "../../public/config";

//const repo = new SupabaseRepo({url: import.meta.env.VITE_SUPABASE_URL, key: import.meta.env.VITE_SUPABASE_ANON_KEY});

const repo = new SupabaseRepo(config.supabase);

const mediaTypes = ['book', 'video', 'song', 'quote'];

const form = ref({
  type: '',
  title: '',
  description: '',
  link: '',
  thumbnail: '',
  topic: '',
  author: '',
});

async function handleSubmit(type: string) {
  const query: QueryType = {
    name: type,
    data: undefined
  }
  try {
    const res = await repo.get(query)

    if (res.ok) {
      alert('Content submitted successfully!');
      form.value = {
        type: 'book',
        title: '',
        description: '',
        link: '',
        thumbnail: '',
        topic: '',
        author: '',
      };
    } else {
      alert('Submission failed.');
    }
  } catch (err) {
    console.error(err);
    alert('Something went wrong.');
  }
}

function onFileAdded(files: readonly File[]) {
  try {
    addFiles(Array.from(files), form.value.thumbnail);
  } catch (error) {
    console.error('Error uploading file:', error);
    alert('Failed to upload thumbnail.');
  }
}
</script>
