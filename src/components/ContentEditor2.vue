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
import { ref, onMounted, onBeforeUnmount, watch, defineProps, defineEmits, nextTick } from 'vue';
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
  menubar: false,
  branding: false,
  statusbar: true,
  resize: true,
  width: '100%',
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'help', 'wordcount'
  ],
  // Primary toolbar - most commonly used tools
  toolbar1: `
    undo redo | bold italic underline |
    alignleft aligncenter alignright |
    numlist bullist | link image | showmore
  `,
  // Secondary toolbar - advanced tools (hidden by default)
  toolbar2: `
    blocks fontsize | strikethrough |
    outdent indent | forecolor backcolor |
    removeformat | charmap table |
    insertdatetime | searchreplace |
    visualblocks code preview fullscreen help
  `,
  toolbar_mode: 'wrap',
  toolbar_sticky: true,
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
  a11y_advanced_options: true
};

// Check if TinyMCE is already loaded
const isTinyMCELoaded = () => {
  return typeof window !== 'undefined' && (window as any).tinymce;
};

// Load TinyMCE with better error handling
const loadTinyMCE = async () => {
  if (isTinyMCELoaded()) {
    await initEditor();
    return;
  }

  try {
    loading.value = true;

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js';

    const loadPromise = new Promise((resolve, reject) => {
      script.onload = () => {
        // Wait a bit for TinyMCE to fully initialize
        setTimeout(() => {
          if (isTinyMCELoaded()) {
            resolve(true);
          } else {
            reject(new Error('TinyMCE failed to load properly'));
          }
        }, 100);
      };
      script.onerror = () => reject(new Error('Failed to load TinyMCE script'));
    });

    document.head.appendChild(script);
    await loadPromise;
    await initEditor();
  } catch (error) {
    console.error('Error loading TinyMCE:', error);
    loading.value = false;
    $q.notify({
      type: 'negative',
      message: 'Failed to load TinyMCE editor. Please refresh the page.',
      position: 'top'
    });
  }
};

// Initialize editor with better error handling
const initEditor = async () => {
  if (!editorRef.value || !isTinyMCELoaded()) {
    console.error('Editor initialization failed: missing requirements');
    loading.value = false;
    return;
  }

  try {
    // Remove any existing editor instance
    if (editor.value) {
      try {
        (window as any).tinymce.remove(`#${editorId.value}`);
      } catch (e) {
        console.warn('Failed to remove existing editor:', e);
      }
    }

    const config = {
      ...defaultConfig,
      ...props.config,
      selector: `#${editorId.value}`, // Use selector instead of target for better compatibility
      readonly: props.disabled,
      setup: (ed: any) => {
        editor.value = ed;

        ed.on('init', () => {
          console.log('TinyMCE initialized successfully');
          loading.value = false;

          // Add custom "More Tools" dropdown button
          ed.ui.registry.addMenuButton('moretools', {
            text: 'More',
            icon: 'more-drawer',
            tooltip: 'More formatting tools',
            fetch: (callback) => {
              const items = [
                {
                  type: 'menuitem',
                  text: 'Heading 2',
                  icon: 'header',
                  onAction: () => editor.value.formatter.toggle('h2')
                },
                {
                  type: 'menuitem',
                  text: 'Heading 3',
                  icon: 'header',
                  onAction: () => editor.value.formatter.toggle('h3')
                },
                {
                  type: 'separator'
                },
                {
                  type: 'menuitem',
                  text: 'Strikethrough',
                  icon: 'strike-through',
                  onAction: () => editor.value.execCommand('Strikethrough')
                },
                {
                  type: 'menuitem',
                  text: 'Increase Indent',
                  icon: 'indent',
                  onAction: () => editor.value.execCommand('Indent')
                },
                {
                  type: 'menuitem',
                  text: 'Decrease Indent',
                  icon: 'outdent',
                  onAction: () => editor.value.execCommand('Outdent')
                },
                {
                  type: 'separator'
                },
                {
                  type: 'menuitem',
                  text: 'Text Color',
                  icon: 'forecolor',
                  onAction: () => editor.value.execCommand('ForeColor', false, '#ff0000')
                },
                {
                  type: 'menuitem',
                  text: 'Background Color',
                  icon: 'backcolor',
                  onAction: () => editor.value.execCommand('BackColor', false, '#ffff00')
                },
                {
                  type: 'menuitem',
                  text: 'Clear Formatting',
                  icon: 'remove-formatting',
                  onAction: () => editor.value.execCommand('RemoveFormat')
                },
                {
                  type: 'separator'
                },
                {
                  type: 'menuitem',
                  text: 'Insert Table',
                  icon: 'table',
                  onAction: () => editor.value.execCommand('mceInsertTable', false, {rows: 2, columns: 2})
                },
                {
                  type: 'menuitem',
                  text: 'Special Characters',
                  icon: 'character-count',
                  onAction: () => editor.value.execCommand('mceShowCharmap')
                },
                {
                  type: 'menuitem',
                  text: 'Insert Date/Time',
                  icon: 'insert-time',
                  onAction: () => editor.value.execCommand('mceInsertDate')
                },
                {
                  type: 'separator'
                },
                {
                  type: 'menuitem',
                  text: 'Find & Replace',
                  icon: 'search',
                  onAction: () => editor.value.execCommand('SearchReplace')
                },
                {
                  type: 'menuitem',
                  text: 'Visual Blocks',
                  icon: 'visualblocks',
                  onAction: () => editor.value.execCommand('mceVisualBlocks')
                },
                {
                  type: 'menuitem',
                  text: 'Preview',
                  icon: 'preview',
                  onAction: () => editor.value.execCommand('mcePreview')
                }
              ];
              callback(items);
            }
          });

          // Set initial content
          if (props.modelValue) {
            ed.setContent(props.modelValue);
          }

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
      message: 'Failed to initialize editor. Please try refreshing the page.',
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

watch(() => props.disabled, (newValue) => {
  if (editor.value) {
    if (newValue) {
      editor.value.setMode('readonly');
    } else {
      editor.value.setMode('design');
    }
  }
});

// Lifecycle hooks
onMounted(async () => {
  // Wait for DOM to be ready
  await nextTick();
  await loadTinyMCE();
});

onBeforeUnmount(() => {
  if (editor.value && isTinyMCELoaded()) {
    try {
      (window as any).tinymce.remove(`#${editorId.value}`);
      editor.value = null;
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
  border: 1px solid #e0e0e0;
  border-radius: 4px;
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


.body--dark :global(.floating-toolbar .toolbar-btn:hover) {
  background: #757575;
  border-color: #9e9e9e;
}
@media (max-width: 768px) {
  .tinymce-editor-wrapper {
    min-height: 300px;
  }

  .tinymce-editor {
    min-height: 300px;
  }

  /* Force toolbar to wrap properly on mobile */
  :deep(.tox-toolbar) {
    flex-wrap: wrap !important;
  }

  :deep(.tox-toolbar__group) {
    flex-wrap: wrap !important;
    margin: 2px !important;
  }

  :deep(.tox-toolbar__primary) {
    flex-wrap: wrap !important;
  }

  /* Make toolbar buttons smaller on mobile */
  :deep(.tox-tbtn) {
    margin: 1px !important;
    min-width: 30px !important;
  }

  /* Ensure editor fits container width */
  :deep(.tox-tinymce) {
    max-width: 100% !important;
    overflow-x: hidden !important;
  }

  /* Make editor content area responsive */
  :deep(.tox-edit-area) {
    overflow-x: hidden !important;
  }

  :deep(.tox-edit-area iframe) {
    max-width: 100% !important;
  }
}
</style>
