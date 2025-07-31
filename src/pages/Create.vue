<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-lg">Quasar Tags Input Examples</div>

    <!-- Method 1: Using q-select with multiple and use-chips -->
    <div class="example-section q-mb-xl">
      <div class="text-h6 q-mb-md">Method 1: Q-Select with Multiple & Chips</div>
      <q-select
        filled
        v-model="tags1"
        multiple
        use-input
        use-chips
        :options="tagOptions"
        label="Select or type tags"
        hint="Select from dropdown or type new tags"
        new-value-mode="add-unique"
        @filter="filterFn"
        @new-value="createValue"
        style="width: 100%; max-width: 500px;"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <div class="q-mt-sm text-caption">Selected: {{ tags1 }}</div>
    </div>

    <!-- Method 2: Custom Tags Input with q-input and q-chip -->
    <div class="example-section q-mb-xl">
      <div class="text-h6 q-mb-md">Method 2: Custom Tags Input</div>
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
          hint="Press Enter or comma to add tags"
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

    <!-- Method 3: Advanced Tags Input with Autocomplete -->
    <div class="example-section q-mb-xl">
      <div class="text-h6 q-mb-md">Method 3: Advanced with Autocomplete</div>
      <AdvancedTagsInput
        v-model="tags3"
        :suggestions="allSuggestions"
        label="Advanced Tags Input"
        hint="Type to see suggestions, press Enter to add"
      />
      <div class="q-mt-sm text-caption">Selected: {{ tags3 }}</div>
    </div>

    <!-- Method 4: Tags Input with Categories -->
    <div class="example-section q-mb-xl">
      <div class="text-h6 q-mb-md">Method 4: Categorized Tags</div>
      <CategorizedTagsInput
        v-model="tags4"
        :categories="tagCategories"
        label="Categorized Tags"
      />
      <div class="q-mt-sm text-caption">Selected: {{ tags4 }}</div>
    </div>

    <!-- Method 5: Inline Tags Editor -->
    <div class="example-section q-mb-xl">
      <div class="text-h6 q-mb-md">Method 5: Inline Tags Editor</div>
      <InlineTagsEditor v-model="tags5" />
      <div class="q-mt-sm text-caption">Tags: {{ tags5 }}</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Method 1: Basic tags with q-select
const tags1 = ref<string[]>(['vue', 'quasar']);
const tagOptions = ref<string[]>(['vue', 'quasar', 'javascript', 'typescript', 'nodejs', 'web', 'frontend', 'backend']);
const filteredOptions = ref<string[]>([...tagOptions.value]);

// Method 2: Custom tags input
const tags2 = ref<string[]>(['custom', 'tags']);
const tagInput = ref('');

// Method 3: Advanced tags
const tags3 = ref<string[]>(['advanced']);

// Method 4: Categorized tags
const tags4 = ref<{category: string, tag: string}[]>([]);

// Method 5: Inline tags
const tags5 = ref<string[]>(['inline', 'editor']);

// Suggestions for advanced input
const allSuggestions = [
  'javascript', 'typescript', 'vue', 'react', 'angular',
  'nodejs', 'express', 'quasar', 'vuetify', 'bootstrap',
  'css', 'html', 'sass', 'webpack', 'vite'
];

// Categories for categorized tags
const tagCategories = {
  'Languages': ['javascript', 'typescript', 'python', 'java'],
  'Frameworks': ['vue', 'react', 'angular', 'quasar'],
  'Tools': ['webpack', 'vite', 'eslint', 'prettier'],
  'Concepts': ['frontend', 'backend', 'fullstack', 'api']
};

// Method 1 functions
function filterFn(val: string, update: (fn: () => void) => void) {
  if (val === '') {
    update(() => {
      filteredOptions.value = tagOptions.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    filteredOptions.value = tagOptions.value.filter(v => v.toLowerCase().indexOf(needle) > -1);
  });
}

function createValue(val: string, done: (item: string) => void) {
  if (val.length > 0) {
    if (!tagOptions.value.includes(val)) {
      tagOptions.value.push(val);
    }
    done(val);
  }
}

// Method 2 functions
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


//<!-- Advanced Tags Input Component -->
// Component for Method 3
const AdvancedTagsInput = {
  props: {
    modelValue: {
      type: Array as () => string[],
      default: () => []
    },
    suggestions: {
      type: Array as () => string[],
      default: () => []
    },
    label: String,
    hint: String
  },
  emits: ['update:modelValue'],
  setup(props: any, { emit }: any) {
    const inputValue = ref('');
    const showSuggestions = ref(false);
    const filteredSuggestions = computed(() => {
      if (!inputValue.value) return [];
      return props.suggestions.filter((s: string) =>
        s.toLowerCase().includes(inputValue.value.toLowerCase()) &&
        !props.modelValue.includes(s)
      ).slice(0, 5);
    });

    function addTag(tag?: string) {
      const tagToAdd = tag || inputValue.value.trim().toLowerCase();
      if (tagToAdd && !props.modelValue.includes(tagToAdd)) {
        emit('update:modelValue', [...props.modelValue, tagToAdd]);
        inputValue.value = '';
        showSuggestions.value = false;
      }
    }

    function removeTag(index: number) {
      const newTags = [...props.modelValue];
      newTags.splice(index, 1);
      emit('update:modelValue', newTags);
    }

    return {
      inputValue,
      showSuggestions,
      filteredSuggestions,
      addTag,
      removeTag
    };
  },
  template: `
    <div class="advanced-tags-input">
      <div class="tags-display q-mb-sm" v-if="modelValue.length">
        <q-chip
          v-for="(tag, index) in modelValue"
          :key="index"
          removable
          @remove="removeTag(index)"
          color="secondary"
          text-color="white"
          :label="tag"
          icon="local_offer"
        />
      </div>
      <q-input
        filled
        v-model="inputValue"
        :label="label"
        :hint="hint"
        @keydown.enter.prevent="addTag()"
        @focus="showSuggestions = true"
        @blur="setTimeout(() => showSuggestions = false, 200)"
      >
        <template v-slot:append>
          <q-btn
            round
            dense
            flat
            icon="add"
            @click="addTag()"
            :disable="!inputValue.trim()"
          />
        </template>
      </q-input>
      <q-list
        v-if="showSuggestions && filteredSuggestions.length"
        bordered
        class="suggestion-list"
        style="max-height: 200px; overflow-y: auto;"
      >
        <q-item
          v-for="suggestion in filteredSuggestions"
          :key="suggestion"
          clickable
          @click="addTag(suggestion)"
          class="suggestion-item"
        >
          <q-item-section>
            <q-item-label>{{ suggestion }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="add" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  `
};

// Component for Method 4
const CategorizedTagsInput = {
  props: {
    modelValue: {
      type: Array as () => {category: string, tag: string}[],
      default: () => []
    },
    categories: Object,
    label: String
  },
  emits: ['update:modelValue'],
  setup(props: any, { emit }: any) {
    const selectedCategory = ref('');
    const selectedTag = ref('');

    const availableCategories = computed(() => Object.keys(props.categories));
    const availableTags = computed(() => {
      return selectedCategory.value ? props.categories[selectedCategory.value] : [];
    });

    function addTag() {
      if (selectedCategory.value && selectedTag.value) {
        const newTag = { category: selectedCategory.value, tag: selectedTag.value };
        const exists = props.modelValue.some((t: any) =>
          t.category === newTag.category && t.tag === newTag.tag
        );

        if (!exists) {
          emit('update:modelValue', [...props.modelValue, newTag]);
          selectedTag.value = '';
        }
      }
    }

    function removeTag(index: number) {
      const newTags = [...props.modelValue];
      newTags.splice(index, 1);
      emit('update:modelValue', newTags);
    }

    return {
      selectedCategory,
      selectedTag,
      availableCategories,
      availableTags,
      addTag,
      removeTag
    };
  },
  template: `
    <div class="categorized-tags-input">
      <div class="tags-display q-mb-sm" v-if="modelValue.length">
        <q-chip
          v-for="(item, index) in modelValue"
          :key="index"
          removable
          @remove="removeTag(index)"
          color="accent"
          text-color="white"
          :label="item.category + ': ' + item.tag"
          icon="category"
        />
      </div>

      <div class="row q-gutter-sm">
        <div class="col-5">
          <q-select
            filled
            v-model="selectedCategory"
            :options="availableCategories"
            label="Category"
          />
        </div>
        <div class="col-5">
          <q-select
            filled
            v-model="selectedTag"
            :options="availableTags"
            label="Tag"
            :disable="!selectedCategory"
          />
        </div>
        <div class="col-2">
          <q-btn
            color="primary"
            icon="add"
            @click="addTag"
            :disable="!selectedCategory || !selectedTag"
            style="height: 56px;"
          />
        </div>
      </div>
    </div>
  `
};

// Component for Method 5
const InlineTagsEditor = {
  props: {
    modelValue: {
      type: Array as () => string[],
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  setup(props: any, { emit }: any) {
    const isEditing = ref(-1);
    const editValue = ref('');
    const newTagInput = ref('');

    function startEdit(index: number) {
      isEditing.value = index;
      editValue.value = props.modelValue[index];
    }

    function saveEdit(index: number) {
      if (editValue.value.trim()) {
        const newTags = [...props.modelValue];
        newTags[index] = editValue.value.trim();
        emit('update:modelValue', newTags);
      }
      isEditing.value = -1;
    }

    function cancelEdit() {
      isEditing.value = -1;
      editValue.value = '';
    }

    function removeTag(index: number) {
      const newTags = [...props.modelValue];
      newTags.splice(index, 1);
      emit('update:modelValue', newTags);
    }

    function addNewTag() {
      const tag = newTagInput.value.trim();
      if (tag && !props.modelValue.includes(tag)) {
        emit('update:modelValue', [...props.modelValue, tag]);
        newTagInput.value = '';
      }
    }

    return {
      isEditing,
      editValue,
      newTagInput,
      startEdit,
      saveEdit,
      cancelEdit,
      removeTag,
      addNewTag
    };
  },
  template: `
    <div class="inline-tags-editor">
      <div class="tags-container q-gutter-xs q-mb-sm">
        <template v-for="(tag, index) in modelValue" :key="index">
          <q-input
            v-if="isEditing === index"
            v-model="editValue"
            dense
            outlined
            @keydown.enter="saveEdit(index)"
            @keydown.esc="cancelEdit"
            @blur="saveEdit(index)"
            style="width: auto; min-width: 100px;"
            autofocus
          />
          <q-chip
            v-else
            :label="tag"
            removable
            @remove="removeTag(index)"
            @click="startEdit(index)"
            color="info"
            text-color="white"
            clickable
            icon="edit"
          />
        </template>
      </div>

      <q-input
        v-model="newTagInput"
        filled
        dense
        label="Add new tag"
        @keydown.enter="addNewTag"
        style="max-width: 200px;"
      >
        <template v-slot:append>
          <q-btn
            round
            dense
            flat
            icon="add"
            @click="addNewTag"
            :disable="!newTagInput.trim()"
          />
        </template>
      </q-input>
    </div>
  `
};
</script>

<style scoped>
.example-section {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 2rem;
}

.tags-input-container {
  max-width: 500px;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.suggestion-list {
  position: absolute;
  z-index: 1000;
  width: 100%;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

.advanced-tags-input {
  position: relative;
  max-width: 500px;
}

.categorized-tags-input {
  max-width: 600px;
}

.inline-tags-editor {
  max-width: 600px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-height: 40px;
  border: 1px dashed #ccc;
  border-radius: 4px;
  padding: 0.5rem;
}
</style>
