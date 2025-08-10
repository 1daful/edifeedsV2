<template>
  <q-dialog
    v-model="dialogModel"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card style="min-width: 500px; max-width: 600px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Edit Media</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="closeDialog" />
      </q-card-section>

      <q-form @submit="saveChanges" class="q-gutter-md">
        <q-card-section>
          <!-- File Preview -->
          <div class="text-center q-mb-md">
            <div class="media-preview-small">
              <q-img
                v-if="isImage"
                :src="media?.thumbnail_url || media?.url"
                :alt="editForm.name"
                style="max-width: 200px; max-height: 150px;"
                fit="contain"
              />
              <q-avatar
                v-else
                size="80px"
                :color="getFileTypeColor(media?.type)"
                text-color="white"
                :icon="getFileTypeIcon(media?.type)"
              />
            </div>
          </div>

          <!-- Basic Information -->
          <q-input
            v-model="editForm.name"
            label="File Name *"
            outlined
            dense
            :rules="[val => !!val || 'Name is required']"
            class="q-mb-md"
          />

          <q-input
            v-model="editForm.description"
            label="Description"
            outlined
            dense
            type="textarea"
            rows="3"
            placeholder="Add a description for this media file..."
            class="q-mb-md"
          />

          <!-- Category Selection -->
          <q-select
            v-model="editForm.category"
            :options="categoryOptions"
            label="Category"
            outlined
            dense
            clearable
            class="q-mb-md"
          />

          <!-- Tags -->
          <q-select
            v-model="editForm.tags"
            :options="availableTags"
            label="Tags"
            outlined
            dense
            multiple
            use-chips
            use-input
            input-debounce="300"
            @new-value="createTag"
            placeholder="Add tags..."
            class="q-mb-md"
          >
            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No tags found. Type to create new ones.
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Author -->
          <q-input
            v-model="editForm.author"
            label="Author/Creator"
            outlined
            dense
            placeholder="Enter author name"
            class="q-mb-md"
          />

          <!-- Additional Options -->
          <q-expansion-item
            v-model="showAdvancedOptions"
            icon="tune"
            label="Advanced Options"
            class="q-mb-md"
          >
            <div class="q-pt-md q-gutter-md">
              <!-- Privacy Settings -->
              <div>
                <q-checkbox
                  v-model="editForm.is_private"
                  label="Make this file private"
                />
                <div class="text-caption text-grey-6 q-ml-lg">
                  Private files are only visible to you
                </div>
              </div>

              <!-- Favorite -->
              <div>
                <q-checkbox
                  v-model="editForm.favorite"
                  label="Mark as favorite"
                />
              </div>

              <!-- Alternative Text (for images) -->
              <q-input
                v-if="isImage"
                v-model="editForm.alt_text"
                label="Alternative Text"
                outlined
                dense
                placeholder="Describe this image for accessibility"
              />

              <!-- Copyright/License -->
              <q-select
                v-model="editForm.license"
                :options="licenseOptions"
                label="License"
                outlined
                dense
                clearable
              />

              <!-- Custom Fields -->
              <div class="custom-fields">
                <div class="text-subtitle2 q-mb-sm">Custom Fields</div>
                <div
                  v-for="(field, index) in editForm.custom_fields"
                  :key="index"
                  class="row q-gutter-sm q-mb-sm"
                >
                  <div class="col">
                    <q-input
                      v-model="field.key"
                      placeholder="Field name"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col">
                    <q-input
                      v-model="field.value"
                      placeholder="Value"
                      outlined
                      dense
                    />
                  </div>
                  <div class="col-auto">
                    <q-btn
                      flat
                      round
                      dense
                      icon="remove"
                      color="negative"
                      @click="removeCustomField(index)"
                    />
                  </div>
                </div>
                <q-btn
                  flat
                  icon="add"
                  label="Add Field"
                  color="primary"
                  @click="addCustomField"
                  size="sm"
                />
              </div>
            </div>
          </q-expansion-item>
        </q-card-section>

        <!-- Actions -->
        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancel"
            @click="closeDialog"
            :disable="saving"
          />
          <q-btn
            type="submit"
            color="primary"
            label="Save Changes"
            :loading="saving"
            :disable="!hasChanges"
          />
        </q-card-actions>
      </q-form>

      <!-- Loading overlay -->
      <q-inner-loading :showing="loading">
        <q-spinner-dots size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useMediaStore } from '../../stores/media'
import { useNotify } from '../../composables/useNotify'

// Props & Emits
const props = defineProps({
  modelValue: Boolean,
  media: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'updated'])

// Composables
const $q = useQuasar()
const mediaStore = useMediaStore()
const { notifySuccess, notifyError } = useNotify()

// Reactive data
const loading = ref(false)
const saving = ref(false)
const showAdvancedOptions = ref(false)

const editForm = ref({
  name: '',
  description: '',
  category: '',
  tags: [],
  author: '',
  is_private: false,
  favorite: false,
  alt_text: '',
  license: '',
  custom_fields: []
})

const originalForm = ref({})

// Options data
const categoryOptions = [
  'Images', 'Videos', 'Audio', 'Documents',
  'Design', 'Marketing', 'Archive', 'Other'
]

const availableTags = ref([
  'important', 'draft', 'final', 'archive',
  'project-a', 'project-b', 'marketing',
  'social-media', 'web', 'print', 'personal',
  'work', 'creative', 'reference'
])

const licenseOptions = [
  'All Rights Reserved',
  'Creative Commons CC0',
  'Creative Commons CC BY',
  'Creative Commons CC BY-SA',
  'Creative Commons CC BY-NC',
  'Creative Commons CC BY-NC-SA',
  'MIT License',
  'Public Domain'
]

// Computed
const dialogModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isImage = computed(() =>
  props.media?.type?.startsWith('image/')
)

const hasChanges = computed(() => {
  return JSON.stringify(editForm.value) !== JSON.stringify(originalForm.value)
})

// Methods
const loadMediaData = () => {
  if (props.media) {
    editForm.value = {
      name: props.media.name || '',
      description: props.media.description || '',
      category: props.media.category || '',
      tags: [...(props.media.tags || [])],
      author: props.media.author || '',
      is_private: props.media.is_private || false,
      favorite: props.media.favorite || false,
      alt_text: props.media.alt_text || '',
      license: props.media.license || '',
      custom_fields: [...(props.media.custom_fields || [])]
    }

    // Store original form state
    originalForm.value = JSON.parse(JSON.stringify(editForm.value))
  }
}

const createTag = (val, done) => {
  if (val.length > 0) {
    const newTag = val.toLowerCase().trim()
    if (!availableTags.value.includes(newTag)) {
      availableTags.value.push(newTag)
    }
    done(newTag, 'toggle')
  }
}

const addCustomField = () => {
  editForm.value.custom_fields.push({ key: '', value: '' })
}

const removeCustomField = (index) => {
  editForm.value.custom_fields.splice(index, 1)
}

const getFileTypeIcon = (type) => {
  if (type?.startsWith('image/')) return 'image'
  if (type?.startsWith('video/')) return 'videocam'
  if (type?.startsWith('audio/')) return 'audiotrack'
  if (type?.includes('pdf')) return 'picture_as_pdf'
  if (type?.includes('word')) return 'description'
  return 'insert_drive_file'
}

const getFileTypeColor = (type) => {
  if (type?.startsWith('image/')) return 'green'
  if (type?.startsWith('video/')) return 'red'
  if (type?.startsWith('audio/')) return 'orange'
  if (type?.includes('pdf')) return 'red'
  if (type?.includes('word')) return 'blue'
  return 'grey'
}

const saveChanges = async () => {
  if (!hasChanges.value) {
    closeDialog()
    return
  }

  saving.value = true

  try {
    // Clean up custom fields (remove empty ones)
    const cleanedCustomFields = editForm.value.custom_fields.filter(
      field => field.key.trim() && field.value.trim()
    )

    const updateData = {
      ...editForm.value,
      custom_fields: cleanedCustomFields,
      updated_at: new Date().toISOString()
    }

    const updatedMedia = await mediaStore.updateMedia(props.media.id, updateData)

    emit('updated', updatedMedia)
    notifySuccess('Media updated successfully')
    closeDialog()

  } catch (error) {
    console.error('Error updating media:', error)
    notifyError('Failed to update media')
  } finally {
    saving.value = false
  }
}

const closeDialog = () => {
  if (hasChanges.value && !saving.value) {
    $q.dialog({
      title: 'Unsaved Changes',
      message: 'You have unsaved changes. Are you sure you want to close?',
      cancel: true,
      persistent: true
    }).onOk(() => {
      dialogModel.value = false
      resetForm()
    })
  } else {
    dialogModel.value = false
    resetForm()
  }
}

const resetForm = () => {
  editForm.value = {
    name: '',
    description: '',
    category: '',
    tags: [],
    author: '',
    is_private: false,
    favorite: false,
    alt_text: '',
    license: '',
    custom_fields: []
  }
  originalForm.value = {}
  showAdvancedOptions.value = false
}

// Watchers
watch(() => props.media, (newMedia) => {
  if (newMedia) {
    loadMediaData()
  }
}, { immediate: true })

watch(dialogModel, (isOpen) => {
  if (isOpen && props.media) {
    loadMediaData()
  }
})

// Lifecycle
onMounted(() => {
  if (props.media) {
    loadMediaData()
  }
})
</script>

<style scoped>
.media-preview-small {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
}

.custom-fields {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1rem;
  background: #fafafa;
}

.q-expansion-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}
</style>
