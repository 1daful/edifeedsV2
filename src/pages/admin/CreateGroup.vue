<template>
  <q-card class="q-pa-md">
    <q-card-section>
      <q-input v-model="form.name" label="Group Name" filled />
      <q-input v-model="form.description" type="textarea" label="Description" autogrow filled />
      <q-input v-model="form.schedule" label="Meeting Schedule" filled />
    </q-card-section>

    <q-card-actions align="right">
      <q-btn label="Create Group" color="primary" @click="createGroup" />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'
import { dbClient } from '../../api/apiList'

const form = ref({
  name: '',
  description: '',
  schedule: ''
})

const createGroup = async () => {
  // insert into groups

  const { data, error } = await dbClient.post({
    method: 'post',
    url: `groups`,
    data: form.value
  })
}
</script>
