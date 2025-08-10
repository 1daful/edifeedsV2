<!-- src/pages/CreateContentPage.vue -->
<template>
  <q-page class="q-pa-md">
    <div class="content-header q-mb-lg">
      <div class="text-h4 text-weight-light">Create New Content</div>
      <div class="text-subtitle1 text-grey-7">Share inspiring content with your community</div>
    </div>

    <q-stepper
      v-model="currentStep"
      ref="stepper"
      color="primary"
      animated
      class="content-stepper"
    >
      <!-- Step 1: Content Type & Basic Info -->
      <q-step
        :name="1"
        title="Content Details"
        icon="info"
        :done="currentStep > 1"
        :header-nav="currentStep > 1"
      >
        <q-form ref="basicForm" class="q-gutter-md">
          <div class="row q-gutter-md">
            <!-- div class="col-12 col-md-6">
              <q-select
                filled
                v-model="form.type"
                :options="mediaTypeOptions"
                label="Content Type"
                :rules="[val => !!val || 'Please select a content type']"
                emit-value
                map-options
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section avatar>
                      <q-icon :name="scope.opt.icon" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div -->
            <!-- div class="col-12 col-md-6">
              <q-input
                filled
                v-model="form.topic"
                label="Topic / Category"
                :rules="[val => !!val || 'Topic is required']"
                hint="e.g., Faith, Prayer, Worship"
              >
                <template v-slot:append>
                  <q-icon name="local_offer" />
                </template>
              </q-input>
            </div -->
            <div class="col-12 col-md-6 example-section q-mb-xl">
              <div class="text-h6 q-mb-md">Custom Tags Input</div>
              <div class="tags-input-container">
                <div class="tags-display q-mb-sm" v-if="tags2.length">
                  <q-chip
                    v-for="(tag, index) in tags2"
                    :key="index"
                    removable
                    @remove="removeTag(index)"
                    color="primary"
                    text-color="white"
                    :label="tag"
                    icon="local_offer"
                  />
                </div>
                <q-input
                  filled
                  v-model="tagInput"
                  label="Add tags"
                  hint="Press Enter or Add button to add tags"
                  @keydown.enter.prevent="addTag"
                  @keydown.comma.prevent="addTag"
                  @keydown.tab.prevent="addTag"
                >
                  <template v-slot:append>
                    <q-btn
                      round
                      dense
                      flat
                      icon="add"
                      @click="addTag"
                      :disable="!tagInput.trim()"
                    />
                  </template>
                </q-input>
              </div>
              <div class="q-mt-sm text-caption">Tags: {{ tags2 }}</div>
            </div>
          </div>

          <q-input
            filled
            v-model="form.title"
            label="Title"
            :rules="[
              val => !!val || 'Title is required',
              val => val.length >= 3 || 'Title must be at least 3 characters',
              val => val.length <= 100 || 'Title must be less than 100 characters'
            ]"
            counter
            maxlength="100"
          >
            <template v-slot:append>
              <q-icon name="title" />
            </template>
          </q-input>

          <q-input
            filled
            v-model="form.note"
            type="textarea"
            label="Description"
            :rules="[
              val => !!val || 'Description is required',
              val => val.length >= 10 || 'Description must be at least 10 characters'
            ]"
            counter
            maxlength="500"
            rows="4"
            hint="Provide a meaningful description of the content"
          />

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

          <!-- q-input
            filled
            v-model="form.author"
            label="Author / Minister / Speaker"
            :rules="[val => !!val || 'Author is required']"
            hint="Who created or presented this content?"
          >
            <template v-slot:append>
              <q-icon name="person" />
            </template>
          </q-input -->
        </q-form>

        <q-stepper-navigation class="q-mt-lg">
          <q-btn @click="nextStep" color="primary" label="Continue" icon-right="arrow_forward" />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 2: Media & Links -->
      <!--q-step
        :name="2"
        title="Media & Links"
        icon="perm_media"
        :done="currentStep > 2"
        :header-nav="currentStep > 2"
      >
        <div class="q-gutter-md">
          <q-input
            filled
            v-model="form.link"
            label="Source Link"
            type="url"
            :rules="[
              val => !val || isValidUrl(val) || 'Please enter a valid URL'
            ]"
            hint="Optional: Link to the original source"
          >
            <template v-slot:append>
              <q-icon name="link" />
            </template>
          </q-input>

          <div class="thumbnail-section">
            <div class="text-subtitle2 q-mb-sm">Thumbnail Image</div>

            <div class="row q-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  filled
                  v-model="form.thumbnail"
                  label="Thumbnail URL"
                  type="url"
                  :rules="[
                    val => !val || isValidUrl(val) || 'Please enter a valid URL'
                  ]"
                  hint="Or upload an image below"
                >
                  <template v-slot:append>
                    <q-icon name="image" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-6">
                <q-uploader
                  label="Upload thumbnail image"
                  accept="image/*"
                  :auto-upload="false"
                  :hide-upload-btn="true"
                  @added="onFileAdded"
                  @removed="onFileRemoved"
                  :loading="uploadLoading"
                  style="max-width: 100%"
                  class="full-width"
                >
                  <template v-slot:header="scope">
                    <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
                      <q-icon name="cloud_upload" />
                      <div class="col">
                        <div class="q-uploader__title">Upload Image</div>
                        <div class="q-uploader__subtitle">
                          {{ scope.files.length ? `${scope.files.length} file(s)` : 'Drag and drop or click to select' }}
                        </div>
                      </div>
                    </div>
                  </template>
                </q-uploader>
              </div>
            </div>

            <q-img
              v-if="form.thumbnail"
              :src="form.thumbnail"
              class="q-mt-md thumbnail-preview"
              style="max-width: 300px; border-radius: 8px;"
              :ratio="16/9"
              fit="cover"
              loading="lazy"
            >
              <div class="absolute-bottom-right q-pa-xs">
                <q-btn
                  round
                  dense
                  icon="close"
                  color="negative"
                  size="sm"
                  @click="removeThumbnail"
                />
              </div>
            </q-img>
          </div>
        </div>

        <q-stepper-navigation class="q-mt-lg">
          <q-btn flat @click="previousStep" color="primary" label="Back" icon="arrow_back" />
          <q-btn @click="nextStep" color="primary" label="Continue" icon-right="arrow_forward" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step-->
    <q-step
      :name="2"
      title="Assign Content"
      icon="assignment"
      :done="currentStep > 2"
      :header-nav="currentStep > 2"
      caption="Select content to assign to topic"
    >
      <ContentAssignment
        :topic="form"
      ></ContentAssignment>
    </q-step>

      <!-- Step 3: Review & Submit -->
      <q-step
        :name="3"
        title="Review & Submit"
        icon="send"
      >
        <div class="review-section">
          <div class="text-h6 q-mb-md">Review Your Content</div>

          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="row q-gutter-md">
                <div class="col-12 col-md-8">
                  <!-- div class="review-item">
                    <strong>Type:</strong>
                    <q-chip :icon="getMediaTypeIcon(form.type)" color="primary" text-color="white" class="q-ml-sm">
                      {{ getMediaTypeLabel(form.type) }}
                    </q-chip>
                  </div -->
                  <div class="review-item"><strong>Title:</strong> {{ form.title }}</div>
                  <!-- div class="review-item"><strong>Author:</strong> {{ form.author }}</div -->
                  <!-- div class="review-item" v-if="form.link">
                    <strong>Source:</strong>
                    <a :href="form.link" target="_blank" class="text-primary">{{ form.link }}</a>
                  </div -->
                  <div class="review-item">
                    <strong>Note:</strong>
                    <div class="q-mt-sm">{{ form.note }}</div>
                  </div>
                </div>
                <div class="col-12 col-md-4" v-if="form.cover_image">
                  <q-img
                    :src="form.cover_image"
                    class="rounded-borders"
                    style="max-width: 200px;"
                    :ratio="16/9"
                    fit="cover"
                  />
                </div>
                <div class="review-item">
                  <strong>Tags:</strong>
                  <div class="q-mt-sm">{{ form.tags.join(', ') }}</div>
                </div>
                <div class="review-item">
                  <strong>Scripture:</strong>
                  <div class="q-mt-sm">{{ form.scripture.join(', ') }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-banner v-if="!isFormValid" class="text-white bg-negative q-mb-md">
            <q-icon name="warning" class="q-mr-sm" />
            Please complete all required fields before submitting.
          </q-banner>
        </div>

        <q-stepper-navigation class="q-mt-lg">
          <q-btn flat @click="previousStep" color="primary" label="Back" icon="arrow_back" />
          <q-btn
            @click="handleSubmit"
            color="positive"
            label="Submit Content"
            icon-right="send"
            class="q-ml-sm"
            :loading="submitLoading"
            :disable="!isFormValid"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>

    <!-- Success Dialog -->
    <q-dialog v-model="showSuccessDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-icon name="check_circle" color="positive" size="md" class="q-mr-sm" />
          <div class="text-h6">Content Submitted Successfully!</div>
        </q-card-section>
        <q-card-section>
          Your content has been submitted and is now available in the library.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Create Another" color="primary" @click="resetForm" />
          <q-btn flat label="View Library" color="primary" @click="goToLibrary" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Loading Overlay -->
    <q-inner-loading :showing="submitLoading">
      <q-spinner-gears size="50px" color="primary" />
      <div class="q-mt-md">Submitting your content...</div>
    </q-inner-loading>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { ApiRequest } from "@edifiles/services";
import { addFiles } from "../utils/storage";
import { watch } from 'vue';
import { auth, dbClient } from '../api/apiList';
import ContentAssignment from "../components/Admin/ContentAssignment.vue";

const router = useRouter();
const $q = useQuasar();

// Reactive data
const currentStep = ref(1);
const submitLoading = ref(false);
const uploadLoading = ref(false);
const showSuccessDialog = ref(false);
const basicForm = ref();
const stepper = ref();

// Enhanced media types with icons and descriptions
const mediaTypeOptions = [
  {
    value: 'book',
    label: 'Book',
    icon: 'menu_book',
    description: 'Religious books, devotionals, studies'
  },
  {
    value: 'video',
    label: 'Video',
    icon: 'play_circle',
    description: 'Sermons, testimonies, teachings'
  },
  {
    value: 'song',
    label: 'Song',
    icon: 'music_note',
    description: 'Worship songs, hymns, spiritual music'
  },
  {
    value: 'quote',
    label: 'Quote',
    icon: 'format_quote',
    description: 'Inspirational quotes, verses'
  }
];

// Form data with validation
const form = ref({
  title: '',
  note: '',
  cover_image: '',
  tags: [],
  scripture: [],
});

const tags2 = ref<string[]>(['custom', 'tags']);
const tagInput = ref('');

function addTag() {
  const tag = tagInput.value.trim().toLowerCase();
  if (tag && !tags2.value.includes(tag)) {
    tags2.value.push(tag);
    tagInput.value = '';
  }
}

function removeTag(index: number) {
  tags2.value.splice(index, 1);
}

// Computed properties
const isFormValid = computed(() => {
  return form.value.title &&
         form.value.note &&
         form.value.title.length >= 3 &&
         form.value.note.length >= 10;
});

// Utility functions
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function getMediaTypeIcon(type: string): string {
  const option = mediaTypeOptions.find(opt => opt.value === type);
  return option?.icon || 'help';
}

function getMediaTypeLabel(type: string): string {
  const option = mediaTypeOptions.find(opt => opt.value === type);
  return option?.label || type;
}

// Stepper navigation
async function nextStep() {
  if (currentStep.value === 1) {
    const valid = await basicForm.value?.validate();
    if (!valid) return;
  }

  if (currentStep.value < 3) {
    currentStep.value++;
  }
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

// File handling with enhanced error handling
async function onFileAdded(files: readonly File[]) {
  if (files.length === 0) return;

  const file = files[0];

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    $q.notify({
      type: 'negative',
      message: 'File size must be less than 5MB',
      position: 'top'
    });
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    $q.notify({
      type: 'negative',
      message: 'Please select a valid image file',
      position: 'top'
    });
    return;
  }

  uploadLoading.value = true;

  try {
    const result = await addFiles(Array.from(files));
    form.value.cover_image = result ?? '';

    if (result) {
      $q.notify({
        type: 'positive',
        message: 'Thumbnail uploaded successfully',
        position: 'top'
      });
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to upload thumbnail. Please try again.',
      position: 'top'
    });
  } finally {
    uploadLoading.value = false;
  }
}

function onFileRemoved() {
  form.value.cover_image = '';
}

function removeThumbnail() {
  form.value.cover_image = '';
}

// Enhanced form submission
async function handleSubmit() {
  if (!isFormValid.value) {
    $q.notify({
      type: 'negative',
      message: 'Please complete all required fields',
      position: 'top'
    });
    return;
  }

  submitLoading.value = true;

  const query: ApiRequest = {
    url: 'topics',
    method: 'post', // More descriptive operation name
    data: {
      //type: form.value.type,
      title: form.value.title.trim(),
      note: form.value.note.trim(),
      //link: form.value.link.trim() || null,
      cover_image: form.value.cover_image.trim() || null,
      author_id: (await auth.getUser()).data.user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: tags2.value.length > 0 ? tags2.value : null,
      slug: slugify(form.value.title),
    }
  };

  try {
    const res = await dbClient.post(query);

    if (res.ok) {
      showSuccessDialog.value = true;

      // Analytics/tracking could be added here
      $q.notify({
        type: 'positive',
        message: 'Content submitted successfully!',
        position: 'top'
      });
    } else {
      throw new Error(res.error || 'Submission failed');
    }
  } catch (err) {
    console.error('Submission error:', err);
    $q.notify({
      type: 'negative',
      message: 'Failed to submit content. Please try again.',
      position: 'top',
      actions: [
        { label: 'Retry', color: 'white', handler: () => handleSubmit() }
      ]
    });
  } finally {
    submitLoading.value = false;
  }
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Form reset and navigation
function resetForm() {
  form.value = {
    //type: '',
    title: '',
    note: '',
    cover_image: '',
    scripture: [],
    tags: []
  };
  currentStep.value = 1;
  showSuccessDialog.value = false;

  // Reset form validation
  basicForm.value?.resetValidation();
}

function goToLibrary() {
  showSuccessDialog.value = false;
  router.push('/library'); // Adjust route as needed
}

// Auto-save functionality (optional)
let autoSaveTimer: NodeJS.Timeout;

function startAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    // Save to localStorage as draft
    if (form.value.title || form.value.note) {
      localStorage.setItem('content_draft', JSON.stringify(form.value));
    }
  }, 2000);
}

// Load draft on mount
onMounted(() => {
  const draft = localStorage.getItem('content_draft');
  if (draft) {
    try {
      const draftData = JSON.parse(draft);
      if (draftData.title || draftData.description) {
        $q.dialog({
          title: 'Draft Found',
          message: 'Would you like to continue with your previous draft?',
          cancel: true,
          persistent: true
        }).onOk(() => {
          form.value = { ...form.value, ...draftData };
        }).onCancel(() => {
          localStorage.removeItem('content_draft');
        });
      }
    } catch (e) {
      localStorage.removeItem('content_draft');
    }
  }
});

// Watch form changes for auto-save
watch(form, startAutoSave, { deep: true });
</script>

<style scoped>
.content-header {
  text-align: center;
  padding: 1rem 0;
}

.content-stepper {
  background: transparent;
}

.thumbnail-section {
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}

.thumbnail-preview {
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.review-section .review-item {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.review-section .review-item strong {
  color: #1976d2;
}

@media (max-width: 600px) {
  .q-stepper {
    box-shadow: none;
  }

  .content-header {
    padding: 0.5rem 0;
  }

  .text-h4 {
    font-size: 1.5rem;
  }
}

/* Loading states */
.q-uploader--loading {
  opacity: 0.6;
}

/* Smooth transitions */
.q-stepper__step-content {
  transition: all 0.3s ease;
}

/* Custom scrollbar for textarea */
.q-field--filled .q-field__control textarea {
  scrollbar-width: thin;
  scrollbar-color: #1976d2 #f5f5f5;
}

.q-field--filled .q-field__control textarea::-webkit-scrollbar {
  width: 6px;
}

.q-field--filled .q-field__control textarea::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.q-field--filled .q-field__control textarea::-webkit-scrollbar-thumb {
  background: #1976d2;
  border-radius: 3px;
}
</style>
