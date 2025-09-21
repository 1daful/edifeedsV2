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
      <q-step
        :name="1"
        title="Content Details"
        icon="info"
        :done="currentStep > 1"
        :header-nav="currentStep > 1"
      >
        <q-form ref="basicForm" class="q-gutter-md">
          <q-input
            filled
            v-model="form.title"
            label="Title"
            :rules="rules.title"
            counter
            maxlength="100"
          >
            <template v-slot:append>
              <q-icon name="title" />
            </template>
          </q-input>

          <div class="editor-section">
            <div class="text-subtitle2 q-mb-sm">Content</div>
            <div class="editor-container">
              <TinyMCEEditor
                v-model="form.content"
                :config="editorConfig"
              />
            </div>
            <div class="text-caption text-grey-6 q-mt-sm">
              Use the rich text editor to create engaging content with formatting, images, and more.
            </div>
          </div>

          <q-input
            filled
            v-model="form.description"
            type="textarea"
            label="Short Description / Excerpt"
            :rules="rules.description"
            counter
            maxlength="300"
            rows="3"
            hint="Brief description for previews and search results"
          />

          <div class="category-selection-section">
            <div class="text-subtitle2 q-mb-sm">Content Category</div>

            <!-- Main Category Selection -->
            <q-select
              filled
              v-model="form.category"
              :options="filteredCategoryOptions"
              label="Select Primary Category"
              :rules="rules.required"
              hint="Choose the main category for your content"
              option-value="name"
              option-label="name"
              emit-value
              map-options
              clearable
              @update:model-value="onCategoryChange"
            >
              <template v-slot:prepend>
                <q-icon name="category" />
              </template>

              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section avatar>
                    <q-icon :name="scope.opt.icon" :color="scope.opt.color || 'primary'" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label caption lines="2">{{ scope.opt.description }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>

              <template v-slot:selected-item="scope">
                <div class="row items-center q-gutter-sm">
                  <q-icon :name="scope.opt.icon" :color="scope.opt.color || 'primary'" />
                  <span>{{ scope.opt.name }}</span>
                </div>
              </template>
            </q-select>

            <!-- Subcategory Selection (shows only when main category has children) -->
            <q-select
              v-if="availableSubcategories.length > 0"
              filled
              v-model="form.subcategory"
              :options="availableSubcategories"
              label="Select Subcategory"
              hint="Choose a more specific category"
              :rules="rules.required"
              option-value="name"
              option-label="name"
              emit-value
              map-options
              clearable
              class="q-mt-md"
            >
              <template v-slot:prepend>
                <q-icon name="subdirectory_arrow_right" />
              </template>

              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section avatar>
                    <q-icon :name="scope.opt.icon" color="secondary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                    <q-item-label caption lines="2">{{ scope.opt.description }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- Category Preview Card -->
            <q-card v-if="selectedCategoryInfo" flat bordered class="q-mt-md category-preview-card">
              <q-card-section>
                <div class="row items-center q-gutter-md">
                  <q-icon
                    :name="selectedCategoryInfo.icon"
                    :color="selectedCategoryInfo.color || 'primary'"
                    size="md"
                  />
                  <div class="col">
                    <div class="text-h6">{{ selectedCategoryInfo.name }}</div>
                    <div class="text-caption text-grey-6">{{ selectedCategoryInfo.description }}</div>
                    <div v-if="form.subcategory" class="text-caption text-primary q-mt-xs">
                      <q-icon name="subdirectory_arrow_right" size="xs" />
                      {{ form.subcategory }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Quick Category Chips (for faster selection) -->
            <div class="q-mt-md">
              <div class="text-caption text-grey-6 q-mb-sm">Quick Select:</div>
              <div class="row q-gutter-sm">
                <q-chip
                  v-for="category in quickSelectCategories"
                  :key="category.name"
                  :color="form.category === category.name ? 'primary' : 'grey-3'"
                  :text-color="form.category === category.name ? 'white' : 'dark'"
                  :outline="form.category !== category.name"
                  clickable
                  @click="selectQuickCategory(category)"
                  :icon="category.icon"
                  class="category-chip"
                >
                  {{ category.name }}
                </q-chip>
              </div>
            </div>
          </div>

          <!--q-select
            filled
            v-model="form.category"
            :options="categoryOptions"
            label="Category"
            :rules="rules.required"
            hint="Select the primary category for this content"
          >
            <template v-slot:prepend>
              <q-icon name="category" />
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                <q-item-section avatar>
                  <q-icon :name="scope.opt.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select-->

          <q-input
            filled
            v-model="form.link"
            label="Source Link (optional)"
            hint="External URL for the content"
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
                  hint="Or upload an image below"
                >
                  <template v-slot:append>
                    <q-icon name="image" />
                  </template>
                </q-input>

                <q-uploader
                  class="q-mt-sm"
                  label="Upload thumbnail image"
                  accept="image/*"
                  :auto-upload="false"
                  :hide-upload-btn="true"
                  @added="onFileAdded"
                  style="max-width: 100%"
                />
              </div>
              <div class="col-12 col-md-6" v-if="form.thumbnail">
                <q-img
                  :src="form.thumbnail"
                  class="rounded-borders"
                  style="max-width: 200px; max-height: 150px;"
                  :ratio="16/9"
                  fit="cover"
                />
              </div>
            </div>
          </div>

          <div class="tags-section">
            <div class="text-subtitle2 q-mb-sm">Tags</div>
            <div class="tags-input-container">
              <div class="tags-display q-mb-sm" v-if="tags.length">
                <q-chip
                  v-for="(tag, index) in tags"
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
                hint="Press Enter, comma, or tab to add tags"
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
          </div>

          <div class="scripture-section">
            <ScriptureReference v-model="form.scripture" />
          </div>

          <div class="preview-section">
            <q-btn
              flat
              icon="preview"
              label="Preview Content"
              @click="showPreview = !showPreview"
              class="q-mb-md"
            />
            <q-slide-transition>
              <div v-show="showPreview" class="preview-container">
                <q-card flat bordered>
                  <q-card-section>
                    <div class="text-h6 q-mb-md">{{ form.title || 'Preview Title' }}</div>
                    <div class="text-caption text-grey-6 q-mb-md">By {{ form.author || 'Author' }}</div>
                    <div class="preview-content" v-html="form.content"></div>
                  </q-card-section>
                </q-card>
              </div>
            </q-slide-transition>
          </div>
        </q-form>

        <q-stepper-navigation class="q-mt-lg">
          <q-btn
            @click="nextStep"
            color="primary"
            label="Continue"
            icon-right="arrow_forward"
            :loading="loading"
            :disable="!isBasicFormValid"
          />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="2"
        title="Assign Content"
        icon="assignment"
        :done="currentStep > 2"
        :header-nav="currentStep > 2"
        caption="Optional: Assign to existing topics"
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
          @back="previousStep"
          @selection-changed="handleSelectionChanged"
          @skip="handleAssignmentSkip"
          @error="handleAssignmentError"
        />
      </q-step>

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
                  <div class="review-item"><strong>Author:</strong> {{ user?.email || 'N/A' }}</div>
                  <div class="review-item"><strong>Category:</strong> {{ form.category?.name || 'N/A' }}</div>
                  <div class="review-item">
                    <strong>Description:</strong>
                    <div class="q-mt-sm">{{ form.description }}</div>
                  </div>
                  <div class="review-item">
                    <strong>Content:</strong>
                    <div class="q-mt-sm content-preview" v-html="form.content"></div>
                  </div>
                  <div class="review-item" v-if="form.link">
                    <strong>Source Link:</strong>
                    <a :href="form.link" target="_blank" class="q-ml-sm">{{ form.link }}</a>
                  </div>
                  <div class="review-item" v-if="tags.length">
                    <strong>Tags:</strong>
                    <div class="q-mt-sm">
                      <q-chip
                        v-for="tag in tags"
                        :key="tag"
                        :label="tag"
                        color="primary"
                        text-color="white"
                        size="sm"
                        class="q-mr-xs"
                      />
                    </div>
                  </div>
                  <div class="review-item" v-if="form.scripture && form.scripture.length">
                    <strong>Scripture:</strong>
                    <div class="q-mt-sm">{{ form.scripture.join(', ') }}</div>
                  </div>
                  <div class="review-item" v-if="assignedContent.length">
                    <strong>Assigned Topics:</strong>
                    <div class="q-mt-sm">
                      <q-list dense>
                        <q-item v-for="content in assignedContent" :key="content.id" class="q-pa-xs">
                          <q-item-section avatar>
                            <q-icon name="topic" color="primary" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ content.title }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                  </div>
                </div>
                <div class="col-12 col-md-4" v-if="form.thumbnail">
                  <q-img
                    :src="form.thumbnail"
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
            :loading="loading"
            :disable="!isFormValid"
          />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>

    <q-dialog v-model="showSuccessDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-icon name="check_circle" color="positive" size="md" class="q-mr-sm" />
          <div class="text-h6">Content Submitted Successfully!</div>
        </q-card-section>
        <q-card-section>
          <div>Your content has been submitted and is now available in the library.</div>
          <div v-if="assignedContent.length" class="q-mt-sm">
            Content has been assigned to <strong>{{ assignedContent.length }}</strong> topic{{ assignedContent.length > 1 ? 's' : '' }}.
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Create Another" color="primary" @click="resetForm" />
          <q-btn flat label="View Library" color="primary" @click="goToLibrary" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
      <div class="q-mt-md">Submitting your content...</div>
    </q-inner-loading>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { SupabaseRepo } from "@edifiles/services";
import { addFiles } from "../utils/storage";
import { config } from "../../public/config";
import ContentAssignment from "../components/Admin/ContentAssignment.vue";
import ScriptureReference from "../components/ScriptureReference.vue";
import TinyMCEEditor from "../components/ContentEditor.vue";
import { supabase } from '../lib/supabase';

// --- TYPE DEFINITIONS ---
interface Category {
  name: string;
  icon: string;
  description: string;
  parent: string | null;
}

interface ContentFormData {
  title: string;
  content: string;
  description: string;
  link: string;
  thumbnail: string;
  scripture: string[];
  category: Category | null;
  subcategory: Category | null;
}

interface AssignedContent {
  id: string | number;
  title: string;
}

// --- HOOKS & REFS ---
const user = ref(null);
const router = useRouter();
const $q = useQuasar();
const repo = new SupabaseRepo(config.supabase);
const currentStep = ref(1);
const loading = ref(false);
const showSuccessDialog = ref(false);
const showPreview = ref(false);
const basicForm = ref<any>(null);
const assignedContent = ref<AssignedContent[]>([]);

const content = ref('Hello, world!');
const isDisabled = ref(false);
const showEditor = ref(true);

// --- CONSTANTS & DATA ---

// Form field validation rules
const rules = {
  title: [
    (val: string) => !!val || 'Title is required',
    (val: string) => val.length >= 3 || 'Title must be at least 3 characters',
    (val: string) => val.length <= 100 || 'Title must be less than 100 characters'
  ],
  description: [
    (val: string) => !!val || 'Description is required',
    (val: string) => val.length >= 10 || 'Description must be at least 10 characters',
    (val: string) => val.length <= 300 || 'Description must be less than 300 characters'
  ],
  required: [(val: any) => !!val || 'This field is required']
};

// Form data with a more explicit type
const form = ref<ContentFormData>({
  title: '',
  content: '',
  description: '',
  link: '',
  thumbnail: '',
  scripture: [], // Ensure this is always an array
  category: null,
  subcategory: null,
});

const tags = ref<string[]>([]);
const tagInput = ref('');

// TinyMCE Editor Configuration
const editorConfig = computed(() => ({
  height: 400,
  menubar: true,
  plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount emoticons template codesample hr pagebreak nonbreaking',
  toolbar: `
    undo redo | blocks fontfamily fontsize |
    bold italic underline strikethrough |
    alignleft aligncenter alignright alignjustify |
    outdent indent | numlist bullist |
    forecolor backcolor removeformat |
    pagebreak | charmap emoticons |
    fullscreen preview save print |
    insertfile image media template link anchor codesample |
    ltr rtl
  `,
  images_upload_handler: async (blobInfo: any) => {
    try {
      const file = blobInfo.blob();
      if (!file) throw new Error('No image file to upload.');
      const result = await addFiles([file]);
      console.log('Image uploaded, URL:', result);
      if (!result) throw new Error('Image upload failed, no URL returned.');
      return result;
    } catch (error) {
      console.error('Error uploading image:', error);
      $q.notify({ type: 'negative', message: 'Image upload failed.', position: 'top' });
      return '';
    }
  },
  convert_urls: false,
  relative_urls: false,
  remove_script_host: false,
  // Handle image loading errors
  images_upload_credentials: true,
  templates: [
    { title: 'Devotional Template', description: 'Template for daily devotionals', content: '<h2>Daily Devotional - [Date]</h2><blockquote><p><em>"[Scripture Verse]"</em> - [Reference]</p></blockquote><h3>Reflection</h3><p>[Your reflection content here...]</p><h3>Prayer</h3><p>[Prayer content here...]</p><h3>Action Point</h3><p>[Practical application here...]</p>' },
    { title: 'Sermon Notes Template', description: 'Template for sermon notes', content: '<h2>[Sermon Title]</h2><p><strong>Date:</strong> [Date]<br><strong>Speaker:</strong> [Pastor/Minister Name]<br><strong>Text:</strong> [Scripture Reference]</p><h3>Main Points</h3><ol><li><strong>Point 1:</strong> [Description]</li><li><strong>Point 2:</strong> [Description]</li><li><strong>Point 3:</strong> [Description]</li></ol><h3>Key Takeaways</h3><ul><li>[Takeaway 1]</li><li>[Takeaway 2]</li></ul><h3>Personal Application</h3><p>[How to apply this message...]</p>' },
    { title: 'Bible Study Template', description: 'Template for Bible study guides', content: '<h2>[Study Title]</h2><p><strong>Passage:</strong> [Scripture Reference]<br><strong>Focus:</strong> [Main theme/topic]</p><h3>Background</h3><p>[Historical and cultural context...]</p><h3>Key Observations</h3><ul><li>[Observation 1]</li><li>[Observation 2]</li></ul><h3>Discussion Questions</h3><ol><li>[Question 1]</li><li>[Question 2]</li><li>[Question 3]</li></ol><h3>Practical Application</h3><p>[How to live this out...]</p>' }
  ]
}));

// Predefined list of categories (unchanged, as it's a fixed data structure)
const categoryOptions = ref([
  {
    name: 'Faith Focus',
    icon: 'auto_stories',
    color: 'deep-purple',
    description: 'In-depth teachings, sermons, and theological content',
    children: [
      { name: 'The Armor of God Series', icon: 'security', description: 'Deep dive into spiritual warfare and protection through scripture.' },
      { name: 'Kingdom Conversations', icon: 'forum', description: 'Thought-provoking interviews and discussions about faith.' },
      { name: 'Roots & Revelations', icon: 'archaeology', description: "Biblical archaeology discoveries that confirm scripture's historical accuracy." },
      { name: 'Doctrine & Theology', icon: 'school', description: 'Systematic studies of Christian beliefs and teachings.' },
      { name: 'Bible Study Guides', icon: 'menu_book', description: 'Structured guides for personal or group Bible study.' }
    ]
  },
  {
    name: 'Worship Wave',
    icon: 'music_note',
    color: 'purple',
    description: 'Worship music, playlists, and musical content',
    children: [
      { name: "Heaven's Playlist", icon: 'playlist_play', description: 'Curated worship collections by mood and theme for every season of life.' },
      { name: "Praise Pulse", icon: 'trending_up', description: "What's trending in gospel music - discover new artists and timeless classics." },
      { name: "Global Worship", icon: 'public', description: 'Experience praise and worship in different languages and cultures.' },
      { name: "Hymns & History", icon: 'history_edu', description: 'Traditional hymns with their stories and theological significance.' }
    ]
  },
  {
    name: 'Light Events',
    icon: 'lightbulb',
    color: 'amber',
    description: 'Real-life transformation stories and testimonies',
    children: [
      { name: 'Faith Journeys', icon: 'timeline', description: "Personal stories of believers walking through trials and triumphs." },
      { name: 'Miracle Moments', icon: 'auto_fix_high', description: "Documented miraculous encounters that demonstrate God's power in our lives." },
      { name: 'Breakthrough Stories', icon: 'trending_up', description: "Testimonies of addiction recovery, relationship restoration, and life transformation." },
      { name: 'Youth Testimonies', icon: 'groups', description: "Inspiring stories from young believers and their faith journey." }
    ]
  },
  {
    name: 'Community & Fellowship',
    icon: 'group',
    color: 'teal',
    description: 'Content focused on building Christian community',
    children: [
      { name: 'Small Groups', icon: 'groups_2', description: 'Resources and guides for small group ministry and fellowship.' },
      { name: 'Family Faith', icon: 'family_restroom', description: 'Content for building faith within families and households.' },
      { name: 'Outreach & Missions', icon: 'volunteer_activism', description: 'Stories and resources for evangelism and mission work.' }
    ]
  },
  {
    name: 'Devotional & Prayer',
    icon: 'self_improvement',
    color: 'indigo',
    description: 'Daily devotionals, prayers, and spiritual disciplines',
    children: [
      { name: 'Daily Devotions', icon: 'today', description: 'Daily spiritual reflections and biblical meditations.' },
      { name: 'Prayer Life', icon: 'favorite', description: 'Teaching and resources about prayer and communion with God.' },
      { name: 'Spiritual Disciplines', icon: 'fitness_center', description: 'Guides for fasting, meditation, and other spiritual practices.' }
    ]
  },
  {
    name: 'Other',
    icon: 'more_horiz',
    color: 'grey',
    description: 'Miscellaneous content that doesn\'t fit other categories'
  }
]);


// Quick select categories (most commonly used)
const quickSelectCategories = computed(() => [
  categoryOptions.value.find(cat => cat.name === 'Faith Focus'),
  categoryOptions.value.find(cat => cat.name === 'Worship Wave'),
  categoryOptions.value.find(cat => cat.name === 'Light Events'),
  categoryOptions.value.find(cat => cat.name === 'Devotional & Prayer')
].filter(Boolean));

// Filtered options for the main dropdown (flattened for easier selection)
const filteredCategoryOptions = computed(() => {
  return categoryOptions.value.map(category => ({
    name: category.name,
    icon: category.icon,
    color: category.color,
    description: category.description
  }));
});

// Available subcategories based on selected main category
const availableSubcategories = computed(() => {
  if (!form.value.category) return [];

  const mainCategory = categoryOptions.value.find(cat => cat.name === form.value.category);
  return mainCategory?.children || [];
});

// Selected category information for preview
const selectedCategoryInfo = computed(() => {
  if (!form.value.category) return null;

  return categoryOptions.value.find(cat => cat.name === form.value.category);
});

// Methods
function onCategoryChange(newCategory) {
  // Clear subcategory when main category changes
  if (form.value.category !== newCategory) {
    form.value.subcategory = null;
  }
}

function selectQuickCategory(category) {
  form.value.category = category.name;
  form.value.subcategory = null; // Reset subcategory
}

// --- COMPUTED PROPERTIES ---
const isBasicFormValid = computed(() => {
  const { title, content, description, category } = form.value;
  return !!title && title.length >= 3 &&
    !!content &&
    !!description && description.length >= 10 &&
    !!category;
});

const isFormValid = computed(() => isBasicFormValid.value);

// --- METHODS & FUNCTIONS ---

// Tag management
function addTag() {
  const tag = tagInput.value.trim().toLowerCase();
  if (tag && !tags.value.includes(tag)) {
    tags.value.push(tag);
  }
  tagInput.value = '';
}

function removeTag(index: number) {
  tags.value.splice(index, 1);
}

// File upload handler
async function onFileAdded(files: readonly File[]) {
  if (!files.length) return;
  loading.value = true;
  try {
    const result = await addFiles([files[0]]);
    if (result) {
      console.log('File uploaded, URL:', result);
      form.value.thumbnail = result;
      $q.notify({ type: 'positive', message: 'Thumbnail uploaded successfully!', position: 'top' });
    } else {
      throw new Error('Upload failed: No URL returned.');
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    $q.notify({ type: 'negative', message: `Failed to upload thumbnail.`, position: 'top' });
  } finally {
    loading.value = false;
  }
}

// Stepper navigation logic
async function nextStep() {
  if (currentStep.value === 1) {
    const valid = await basicForm.value?.validate();
    if (!valid || !isBasicFormValid.value) {
      $q.notify({ type: 'negative', message: 'Please complete all required fields', position: 'top' });
      return;
    }
  }
  if (currentStep.value < 3) {
    currentStep.value++;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Content assignment handlers
function handleSelectionChanged(event: { selected: AssignedContent[] }) {
  assignedContent.value = event.selected;
}

function handleAssignmentNext(event: { selected: AssignedContent[] }) {
  assignedContent.value = event.selected || [];
  nextStep();
}

function handleAssignmentSkip() {
  assignedContent.value = [];
  nextStep();
}

function handleAssignmentError(error: Error) {
  console.error('Assignment component error:', error);
  $q.notify({ type: 'negative', message: `Assignment error: ${error.message}`, position: 'top' });
}


// Form submission
async function handleSubmit() {
  if (!isFormValid.value || !user.value) {
    $q.notify({
      type: 'negative',
      message: 'You must be logged in and complete all required fields to submit content.',
      position: 'top',
    });
    return;
  }

  loading.value = true;
  try {
    const { title, content, description, link, thumbnail, subcategory, scripture } = form.value;
    const contentData = {
      title: title.trim(),
      content,
      description: description.trim(),
      link: link.trim() || null,
      thumbnail: thumbnail.trim() || null,
      author_id: user.value?.id || null,
      topic: tags.value.join(', ') || null,
      scripture: scripture.length > 0 ? scripture : null,
      category: subcategory?.name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const response = await repo.post({ name: 'topic_contents', data: contentData });

    if (!response.ok) throw new Error('Submission failed');

    showSuccessDialog.value = true;
    $q.notify({ type: 'positive', message: 'Content submitted successfully!', position: 'top' });
    localStorage.removeItem('content_draft');
  } catch (err: any) {
    console.error('Submission error:', err);
    $q.notify({
      type: 'negative',
      message: `Failed to submit content. ${err.message || 'Please try again.'}`,
      position: 'top',
      actions: [{ label: 'Retry', color: 'white', handler: handleSubmit }]
    });
  } finally {
    loading.value = false;
  }
}

// Dialog and navigation handlers
function resetForm() {
  Object.assign(form.value, {
    title: '', content: '', description: '', link: '', thumbnail: '', scripture: [], category: null
  });
  tags.value = [];
  tagInput.value = '';
  assignedContent.value = [];
  currentStep.value = 1;
  showSuccessDialog.value = false;
  showPreview.value = false;
  basicForm.value?.resetValidation();
  localStorage.removeItem('content_draft');
}

function goToLibrary() {
  showSuccessDialog.value = false;
  router.push('/library');
}

// Auto-save logic
let autoSaveTimer: NodeJS.Timeout | null = null;

const startAutoSave = () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
  autoSaveTimer = setTimeout(() => {
    if (form.value.title || form.value.content || form.value.description) {
      const draftData = { ...form.value, tags: tags.value, assignedContent: assignedContent.value, currentStep: currentStep.value };
      localStorage.setItem('content_draft', JSON.stringify(draftData));
    }
  }, 3000);
};

// --- LIFECYCLE HOOKS & WATCHERS ---
onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  user.value = currentUser;
  const draft = localStorage.getItem('content_draft');
  if (!draft) return;
  try {
    const draftData = JSON.parse(draft);
    if (!draftData.title && !draftData.content && !draftData.description) return;
    $q.dialog({
      title: 'Draft Found',
      message: 'Would you like to continue with your previous draft?',
      cancel: true, persistent: true
    }).onOk(() => {
      Object.assign(form.value, draftData);
      tags.value = draftData.tags || [];
      assignedContent.value = draftData.assignedContent || [];
      if (draftData.currentStep) currentStep.value = draftData.currentStep;
    }).onCancel(() => localStorage.removeItem('content_draft'));
  } catch (e) {
    localStorage.removeItem('content_draft');
    console.error('Failed to parse draft data from local storage.', e);
  }
});

watch([form, tags, assignedContent], startAutoSave, { deep: true });
// Watch for category changes to provide user feedback
watch(() => form.value.category, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    const categoryInfo = selectedCategoryInfo.value;
    if (categoryInfo && categoryInfo.children && categoryInfo.children.length > 0) {
      // Optional: Show notification that subcategories are available
      // $q.notify({
      //   type: 'info',
      //   message: `${categoryInfo.children.length} subcategories available for ${newVal}`,
      //   position: 'top'
      // });
    }
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

.editor-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  background: #fafafa;
  margin-bottom: 1rem;
}

.editor-container {
  background: white;
  border-radius: 4px;
  overflow: hidden;
}

.preview-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  background: #fafafa;
  margin-bottom: 1rem;
}

.preview-container {
  margin-top: 1rem;
}

.preview-content {
  line-height: 1.6;
  color: #333;
}

.content-preview {
  max-height: 300px;
  overflow-y: auto;
  line-height: 1.6;
  color: #333;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1rem;
  background: white;
}

.review-section .review-item {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.review-section .review-item strong {
  color: #1976d2;
}

.tags-input-container,
.thumbnail-section,
.scripture-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  background: #fafafa;
  margin-bottom: 1rem;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* TinyMCE Editor Overrides */
:deep(.tox-tinymce) {
  border-radius: 4px !important;
  border: 1px solid #e0e0e0 !important;
}

:deep(.tox-editor-header) {
  border-bottom: 1px solid #e0e0e0 !important;
}

:deep(.tox-toolbar__group) {
  border-right: 1px solid #e0e0e0 !important;
}

/* Dark mode support for editor */
.body--dark :deep(.tox-tinymce) {
  border-color: #424242 !important;
}

.body--dark :deep(.tox-editor-header) {
  background: #424242 !important;
  border-bottom-color: #616161 !important;
}

.body--dark :deep(.tox-toolbar__group) {
  border-right-color: #616161 !important;
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

  .editor-section {
    padding: 0.5rem;
  }

  /* Mobile-optimized editor toolbar */
  :deep(.tox-toolbar__group) {
    flex-wrap: wrap;
  }
}

/* Smooth transitions */
.q-stepper__step-content {
  transition: all 0.3s ease;
}

/* Custom scrollbar for content preview */
.content-preview::-webkit-scrollbar {
  width: 6px;
}

.content-preview::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.content-preview::-webkit-scrollbar-thumb {
  background: #1976d2;
  border-radius: 3px;
}

/* Print styles for content */
@media print {
  .preview-content,
  .content-preview {
    color: black !important;
    background: white !important;
  }
}

.category-selection-section {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  background: #fafafa;
  margin-bottom: 1rem;
}

.category-preview-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border: 1px solid #e3e8f0;
}

.category-chip {
  transition: all 0.2s ease;
}

.category-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

/* Dark mode support */
.body--dark .category-selection-section {
  background: #424242;
  border-color: #616161;
}

.body--dark .category-preview-card {
  background: linear-gradient(135deg, #424242 0%, #616161 100%);
  border-color: #757575;
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .category-selection-section {
    padding: 0.75rem;
  }

  .row.q-gutter-sm {
    flex-wrap: wrap;
  }

  .category-chip {
    margin-bottom: 0.25rem;
  }
}
</style>
