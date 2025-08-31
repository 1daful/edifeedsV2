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
            <!--q-select
              v-model="form.scripture"
              label="Scripture References"
              multiple
              use-input
              use-chips
              new-value-mode="add-unique"
              input-debounce="0"
              hint="e.g., John 3:16, Romans 8:28"
            /-->
            <ScriptureReference v-model="form.scripture" />
          </div>
        </q-form>

        <q-stepper-navigation class="q-mt-lg">
          <q-btn
            @click="nextStep"
            color="primary"
            label="Continue"
            icon-right="arrow_forward"
            :loading="loading"
          />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 2: Assign Content -->
      <q-step
        :name="2"
        title="Assign Content"
        icon="assignment"
        :done="currentStep > 2"
        :header-nav="currentStep > 2"
        caption="Select content to assign to topic"
      >
        <ContentAssignment
          ref="contentAssignmentRef"
          :topic="form"
          :enable-auto-assign="false"
          :hide-back-button="false"
          :allow-skip="true"
          next-button-label="Continue"
          next-button-icon="arrow_forward"
          @next="handleAssignmentNext"
          @back="handleAssignmentBack"
          @selection-changed="handleSelectionChanged"
          @skip="handleAssignmentSkip"
          @error="handleAssignmentError"
        />
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
                  <div class="review-item"><strong>Title:</strong> {{ form.title }}</div>
                  <div class="review-item">
                    <strong>Note:</strong>
                    <div class="q-mt-sm">{{ form.note }}</div>
                  </div>
                  <div class="review-item" v-if="tags2.length">
                    <strong>Tags:</strong>
                    <div class="q-mt-sm">
                      <q-chip
                        v-for="tag in tags2"
                        :key="tag"
                        :label="tag"
                        color="primary"
                        text-color="white"
                        size="sm"
                        class="q-mr-xs"
                      />
                    </div>
                  </div>
                  <div class="review-item" v-if="form.scripture.length">
                    <strong>Scripture:</strong>
                    <div class="q-mt-sm">{{ form.scripture.join(', ') }}</div>
                  </div>
                  <div class="review-item" v-if="assignedContent.length">
                    <strong>Assigned Content:</strong>
                    <div class="q-mt-sm">
                      <q-list dense>
                        <q-item v-for="content in assignedContent" :key="content.id" class="q-pa-xs">
                          <q-item-section avatar>
                            <q-icon :name="getContentIcon(content.type)" :color="getContentColor(content.type)" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ content.title }}</q-item-label>
                            <q-item-label caption>{{ content.type }} by {{ content.author }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
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
              </div>
            </q-card-section>
          </q-card>

          <q-banner v-if="!isFormValid" class="text-white bg-negative q-mb-md">
            <q-icon name="warning" class="q-mr-sm" />
            Please complete all required fields before submitting.
          </q-banner>
        </div>

        <q-stepper-navigation class="q-mt-lg">
          <q-btn
            flat
            @click="previousStep"
            color="primary"
            label="Back"
            icon="arrow_back"
          />
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
          <div>Your content has been submitted and is now available in the library.</div>
          <div v-if="assignedContent.length" class="q-mt-sm">
            <strong>{{ assignedContent.length }}</strong> content item{{ assignedContent.length > 1 ? 's' : '' }}
            {{ assignedContent.length > 1 ? 'have' : 'has' }} been assigned to this topic.
          </div>
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { ApiRequest } from "@edifiles/services";
import { addFiles } from "../utils/storage";
import { auth, dbClient } from '../api/apiList';
import ContentAssignment from "../components/Admin/ContentAssignment.vue";
import ScriptureReference from "../components/ScriptureReference.vue";

const router = useRouter();
const $q = useQuasar();

// Reactive data
const currentStep = ref(1);
const submitLoading = ref(false);
const loading = ref(false);
const showSuccessDialog = ref(false);
const basicForm = ref();
const stepper = ref();
const contentAssignmentRef = ref();

// Content assignment state
const assignedContent = ref<any[]>([]);

// Form data with validation
const form = ref({
  title: '',
  note: '',
  cover_image: '',
  tags: [],
  scripture: [],
});

const tags2 = ref<string[]>([]);
const tagInput = ref('');

// Content type configuration
const contentTypeConfig = {
  video: { color: 'red', icon: 'play_circle' },
  article: { color: 'blue', icon: 'article' },
  music: { color: 'purple', icon: 'music_note' },
  quote: { color: 'orange', icon: 'format_quote' },
  event: { color: 'green', icon: 'event' },
  podcast: { color: 'indigo', icon: 'podcast' },
  book: { color: 'brown', icon: 'book' }
};

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

function getContentIcon(type: string): string {
  return contentTypeConfig[type]?.icon || 'help';
}

function getContentColor(type: string): string {
  return contentTypeConfig[type]?.color || 'grey';
}

// Computed properties
const isFormValid = computed(() => {
  return form.value.title &&
         form.value.note &&
         form.value.title.length >= 3 &&
         form.value.note.length >= 10;
});

// Content Assignment Event Handlers
function handleSelectionChanged(event: any) {
  assignedContent.value = event.selected;
  console.log('Selection changed:', event);
}

function handleAssignmentNext(event: any) {
  console.log('Assignment next:', event);
  assignedContent.value = event.selected || [];
  nextStep();
}

function handleAssignmentBack() {
  console.log('Assignment back');
  previousStep();
}

function handleAssignmentSkip(event: any) {
  console.log('Assignment skipped:', event);
  assignedContent.value = [];
  nextStep();
}

function handleAssignmentError(event: any) {
  console.error('Assignment error:', event);
  $q.notify({
    type: 'negative',
    message: event.message || 'An error occurred in content assignment',
    position: 'top'
  });
}

// Stepper navigation
async function nextStep() {
  if (currentStep.value === 1) {
    const valid = await basicForm.value?.validate();
    if (!valid) return;

    // Update form tags before moving to next step
    form.value.tags = [...tags2.value];
  }

  if (currentStep.value < 3) {
    currentStep.value++;
    loading.value = false;
  }
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
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

  try {
    // First, create the topic
    const topicData = {
      title: form.value.title.trim(),
      note: form.value.note.trim(),
      cover_image: form.value.cover_image.trim() || null,
      author_id: (await auth.getUser()).data.user?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: tags2.value.length > 0 ? tags2.value : null,
      scripture: form.value.scripture.length > 0 ? form.value.scripture : null,
      slug: slugify(form.value.title),
      //contents: assignedContent.value
    };

    const topicQuery: ApiRequest = {
      url: 'topics',
      method: 'post',
      data: topicData
    };

    const topicResponse = await dbClient.post(topicQuery);
    console.log('Topic creation response:', topicResponse);

    //const response = await dbClient.rpc('your_rpc_function_name', { param1: 'value1', param2: 'value2' });

    /*if (!topicResponse.ok) {
      throw new Error(topicResponse.error || 'Failed to create topic');
    }

    const createdTopic = topicResponse;
    console.log('Topic created:', createdTopic);*/

    // If there are assigned contents, create the assignments
    if (assignedContent.value.length > 0) {
      const topic_media = assignedContent.value.map(item => ({
        topic_id: topicResponse.data.id,
        media_id: media.id
      }));
      console.log('Content IDs for assignment:', contentIds);
      const assignmentQuery: ApiRequest = {
        url: `topic_contents`,
        method: 'post',
        data: contentIds
      };

      const assignmentResponse = await dbClient.post(assignmentQuery);

      /*if (!assignmentResponse.ok) {
        console.warn('Failed to assign some content, but topic was created');
        $q.notify({
          type: 'warning',
          message: 'Topic created but some content assignments failed ' + assignmentResponse,
          position: 'top'
        });
      } else {
        console.log('Content assigned successfully');
      }*/
    }

    showSuccessDialog.value = true;

    $q.notify({
      type: 'positive',
      message: 'Content topic created successfully!',
      position: 'top'
    });

  } catch (err) {
    console.error('Submission error:', err);
    $q.notify({
      type: 'negative',
      message: 'Failed to submit content. Please try again. ' + err,
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
    .replace(/^-+|-+$/g, '');
}

// Form reset and navigation
function resetForm() {
  form.value = {
    title: '',
    note: '',
    cover_image: '',
    scripture: [],
    tags: []
  };
  tags2.value = [];
  assignedContent.value = [];
  currentStep.value = 1;
  showSuccessDialog.value = false;

  // Reset form validation
  basicForm.value?.resetValidation();

  // Clear any draft
  localStorage.removeItem('content_draft');
}

function goToLibrary() {
  showSuccessDialog.value = false;
  router.push('/library'); // Adjust route as needed
}

// Auto-save functionality
let autoSaveTimer: NodeJS.Timeout;

function startAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    // Save to localStorage as draft
    if (form.value.title || form.value.note) {
      const draftData = {
        ...form.value,
        tags: tags2.value,
        assignedContent: assignedContent.value,
        currentStep: currentStep.value
      };
      localStorage.setItem('content_draft', JSON.stringify(draftData));
    }
  }, 2000);
}

// Load draft on mount
onMounted(() => {
  const draft = localStorage.getItem('content_draft');
  if (draft) {
    try {
      const draftData = JSON.parse(draft);
      if (draftData.title || draftData.note) {
        $q.dialog({
          title: 'Draft Found',
          message: 'Would you like to continue with your previous draft?',
          cancel: true,
          persistent: true
        }).onOk(() => {
          form.value = {
            title: draftData.title || '',
            note: draftData.note || '',
            cover_image: draftData.cover_image || '',
            scripture: draftData.scripture || [],
            tags: draftData.tags || []
          };
          tags2.value = draftData.tags || [];
          assignedContent.value = draftData.assignedContent || [];
          if (draftData.currentStep && draftData.currentStep > 1) {
            currentStep.value = draftData.currentStep;
          }
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
watch([form, tags2, assignedContent], startAutoSave, { deep: true });

// Watch currentStep to handle step-specific logic
watch(currentStep, (newStep, oldStep) => {
  console.log(`Step changed from ${oldStep} to ${newStep}`);

  if (newStep === 2) {
    // Entering content assignment step
    // Ensure the ContentAssignment component has the latest topic data
    if (contentAssignmentRef.value) {
      // You could refresh content or do other setup here
    }
  } else if (newStep === 3) {
    // Entering review step
    // Final validation or data preparation could go here
  }
});
</script>

<style scoped>
.content-header {
  text-align: center;
  padding: 1rem 0;
}

.content-stepper {
  background: transparent;
}

.review-section .review-item {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.review-section .review-item strong {
  color: #1976d2;
}

.tags-input-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  background: #fafafa;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
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
