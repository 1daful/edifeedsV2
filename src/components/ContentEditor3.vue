<template>
  <div class="tinymce-editor-wrapper">
    <div
      ref="editorRef"
      class="tinymce-editor"
      :id="editorId"
    ></div>
    <div v-if="loading" class="editor-loading">
      <q-spinner color="primary" size="2em" />
      <div class="q-mt-sm">Loading editor...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, defineProps, defineEmits } from 'vue';
import { useQuasar } from 'quasar';

// Define props
const props = defineProps<{
  modelValue: string;
  config?: any;
  disabled?: boolean;
  placeholder?: string;
}>();

// Define emits
const emit = defineEmits<{
  change: [content: string];
  'update:modelValue': [content: string];
  init: [editor: any];
  blur: [event: any];
  focus: [event: any];
}>();

const $q = useQuasar();
const editorRef = ref<HTMLElement>();
const editor = ref<any>(null);
const loading = ref(true);
const editorId = ref(`tinymce-${Math.random().toString(36).substr(2, 9)}`);

// Default configuration
const defaultConfig = {
  height: 400,
  menubar: true,
  branding: false,
  statusbar: true,
  resize: true,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
    'template', 'codesample', 'hr', 'pagebreak', 'nonbreaking', 'save'
  ],
  toolbar: `
    undo redo | blocks fontfamily fontsize |
    bold italic underline strikethrough |
    alignleft aligncenter alignright alignjustify |
    outdent indent | numlist bullist |
    forecolor backcolor removeformat |
    pagebreak | charmap emoticons |
    fullscreen preview save |
    insertfile image media template link anchor codesample |
    code help
  `,
  toolbar_mode: 'sliding',
  contextmenu: 'link image table',
  skin: 'oxide',
  content_css: 'default',
  content_style: `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      margin: 1rem;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #1976d2;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    p {
      margin-bottom: 1em;
    }
    blockquote {
      border-left: 4px solid #1976d2;
      margin: 1.5em 0;
      padding-left: 1em;
      font-style: italic;
      color: #666;
    }
    code {
      background: #f5f5f5;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Monaco', 'Consolas', monospace;
    }
    pre {
      background: #f5f5f5;
      padding: 1em;
      border-radius: 4px;
      overflow-x: auto;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: #f8f9fa;
      font-weight: bold;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
    }
  `,
  mobile: {
    //theme: 'mobile',
    plugins: ['autosave', 'lists', 'autolink'],
    toolbar: ['undo', 'bold', 'italic', 'styleselect']
  },
  // File and image handling
  file_picker_types: 'image',
  automatic_uploads: true,
  paste_data_images: true,

  // Additional features
  autosave_interval: '30s',
  autosave_prefix: 'tinymce-autosave-{path}{query}-{id}-',
  autosave_restore_when_empty: false,
  autosave_retention: '2m',

  // Word count and character limit
  wordcount_countregex: /[\w\u2019\'-]+/g,

  // Link options
  link_assume_external_targets: true,
  target_list: [
    { title: 'None', value: '' },
    { title: 'Same window', value: '_self' },
    { title: 'New window', value: '_blank' }
  ],

  // Table options
  table_default_attributes: {
    border: '1'
  },
  table_default_styles: {
    'border-collapse': 'collapse'
  },

  // Advanced paste options
  paste_auto_cleanup_on_paste: true,
  paste_remove_styles: false,
  paste_remove_styles_if_webkit: false,
  paste_strip_class_attributes: 'all',

  // Accessibility
  a11y_advanced_options: true,

  // Custom save function
  save_onsavecallback: () => {
    // Trigger save event
    const content = editor.value?.getContent() || '';
    emit('change', content);
    emit('update:modelValue', content);
  }
};

// Load TinyMCE
const loadTinyMCE = async () => {
  if (typeof window !== 'undefined' && !(window as any).tinymce) {
    try {
      // Load TinyMCE from CDN
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js';
      script.onload = () => initEditor();
      script.onerror = () => {
        loading.value = false;
        $q.notify({
          type: 'negative',
          message: 'Failed to load TinyMCE editor',
          position: 'top'
        });
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error loading TinyMCE:', error);
      loading.value = false;
    }
  } else if ((window as any).tinymce) {
    initEditor();
  }
};

// Initialize editor
const initEditor = async () => {
  if (!editorRef.value || !(window as any).tinymce) return;

  try {
    const config = {
      ...defaultConfig,
      ...props.config,
      selector: `#${editorId.value}`,
      readonly: props.disabled,
      setup: (ed: any) => {
        editor.value = ed;

        ed.on('init', () => {
          loading.value = false;
          ed.setContent(props.modelValue || '');
          /*if (props.disabled) {
            ed.setMode('readonly');
          }*/
          emit('init', ed);
        });

        ed.on('change keyup undo redo', () => {
          const content = ed.getContent();
          emit('change', content);
          emit('update:modelValue', content);
        });

        ed.on('blur', (event: any) => {
          emit('blur', event);
        });

        ed.on('focus', (event: any) => {
          emit('focus', event);
        });

        ed.on('ExecCommand', (e: any) => {
          if (e.command === 'mceSave') {
            const content = ed.getContent();
            emit('change', content);
            emit('update:modelValue', content);
          }
        });
      }
    };

    await (window as any).tinymce.init(config);
  } catch (error) {
    console.error('Error initializing TinyMCE:', error);
    loading.value = false;
    $q.notify({
      type: 'negative',
      message: 'Failed to initialize editor',
      position: 'top'
    });
  }
};

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.getContent() !== newValue) {
    editor.value.setContent(newValue || '');
  }
});

/*watch(() => props.disabled, (newValue) => {
  if (editor.value) {
    editor.value.setMode(newValue ? 'readonly' : 'design');
  }
});*/

// Lifecycle hooks
onMounted(() => {
  loadTinyMCE();
});

onBeforeUnmount(() => {
  if (editor.value && (window as any).tinymce) {
    try {
      (window as any).tinymce.remove(`#${editorId.value}`);
    } catch (error) {
      console.error('Error removing TinyMCE:', error);
    }
  }
});

// Expose methods
defineExpose({
  getContent: () => editor.value?.getContent() || '',
  setContent: (content: string) => editor.value?.setContent(content),
  insertContent: (content: string) => editor.value?.insertContent(content),
  focus: () => editor.value?.focus(),
  getEditor: () => editor.value
});
</script>

<style scoped>
.tinymce-editor-wrapper {
  position: relative;
  min-height: 400px;
}

.tinymce-editor {
  min-height: 400px;
}

.editor-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Override TinyMCE styles for better integration */
:deep(.tox-tinymce) {
  border: 1px solid var(--q-primary) !important;
  border-radius: 4px !important;
}

:deep(.tox-toolbar-overlord) {
  background: #f8f9fa !important;
}

:deep(.tox-statusbar) {
  border-top: 1px solid #e0e0e0 !important;
  background: #f8f9fa !important;
}

/* Dark mode support */
.body--dark :deep(.tox-tinymce) {
  border-color: #424242 !important;
}

.body--dark :deep(.tox-toolbar-overlord) {
  background: #424242 !important;
}

.body--dark :deep(.tox-statusbar) {
  background: #424242 !important;
  border-top-color: #616161 !important;
}

.body--dark .editor-loading {
  background: rgba(66, 66, 66, 0.9);
  color: white;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .tinymce-editor-wrapper {
    min-height: 300px;
  }

  .tinymce-editor {
    min-height: 300px;
  }

  :deep(.tox-toolbar__group) {
    flex-wrap: wrap !important;
  }

  :deep(.tox-toolbar__primary) {
    flex-wrap: wrap !important;
  }
}
</style>
