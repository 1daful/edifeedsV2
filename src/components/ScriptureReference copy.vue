<template>
  <div class="col-12">
    <!-- Scripture Reference Input -->
    <q-select
      v-model="form.scripture"
      label="Scripture References"
      multiple
      use-input
      use-chips
      new-value-mode="add-unique"
      input-debounce="0"
      hint="e.g., John 3:16, Romans 8:28"
      @update:model-value="onScriptureChange"
    />

    <!-- Scripture Text Display and Selection -->
    <div v-if="scriptureTexts.length > 0" class="q-mt-md">
      <q-separator class="q-mb-md" />
      <div class="text-h6 q-mb-md">Scripture Passages</div>

      <div v-for="(scripture, index) in scriptureTexts" :key="index" class="q-mb-lg">
        <div class="text-subtitle1 text-primary q-mb-sm">{{ scripture.reference }}</div>

        <!-- Full text display with selection capability -->
        <q-card flat bordered class="q-pa-md">
          <div
            class="scripture-text"
            :id="`scripture-${index}`"
            @mouseup="onTextSelection(index)"
            style="line-height: 1.6; user-select: text; cursor: text;"
          >
            {{ scripture.text }}
          </div>
        </q-card>

        <!-- Selected portions display -->
        <div v-if="scripture.selectedPortions.length > 0" class="q-mt-sm">
          <div class="text-caption text-grey-7 q-mb-xs">Selected portions:</div>
          <div class="row q-gutter-xs">
            <q-chip
              v-for="(portion, portionIndex) in scripture.selectedPortions"
              :key="portionIndex"
              removable
              @remove="removeSelectedPortion(index, portionIndex)"
              color="primary"
              text-color="white"
              size="sm"
            >
              "{{ portion }}"
            </q-chip>
          </div>
        </div>

        <!-- Manual text input for specific portions -->
        <q-input
          v-model="manualSelections[index]"
          label="Or type specific text portion"
          outlined
          dense
          class="q-mt-sm"
          @keyup.enter="addManualSelection(index)"
        >
          <template v-slot:append>
            <q-btn
              flat
              dense
              icon="add"
              @click="addManualSelection(index)"
              :disable="!manualSelections[index]"
            />
          </template>
        </q-input>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  name: 'ScriptureSelector',
  setup() {
    const form = reactive({
      scripture: [],
      selectedScripturePortions: {} // Will store selected text portions by reference
    })

    const scriptureTexts = ref([])
    const manualSelections = ref({})

    // Mock scripture database - in real app, this would come from an API
    const scriptureDatabase = {
      'John 3:16': 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
      'Romans 8:28': 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
      'Psalm 23:1': 'The Lord is my shepherd, I lack nothing.',
      'Matthew 5:16': 'In the same way, let your light shine before others, that they may see your good deeds and glorify your Father in heaven.',
      'Philippians 4:13': 'I can do all this through him who gives me strength.'
    }

    const onScriptureChange = (newReferences) => {
      // Update scripture texts when references change
      scriptureTexts.value = newReferences.map(ref => ({
        reference: ref,
        text: scriptureDatabase[ref] || `Loading text for ${ref}...`,
        selectedPortions: form.selectedScripturePortions[ref] || []
      }))

      // Initialize manual selections for new references
      newReferences.forEach((ref, index) => {
        if (!(index in manualSelections.value)) {
          manualSelections.value[index] = ''
        }
      })

      // Clean up removed references
      const removedRefs = Object.keys(form.selectedScripturePortions).filter(
        ref => !newReferences.includes(ref)
      )
      removedRefs.forEach(ref => {
        delete form.selectedScripturePortions[ref]
      })
    }

    const onTextSelection = (scriptureIndex) => {
      const selection = window.getSelection()
      const selectedText = selection.toString().trim()

      if (selectedText && selectedText.length > 0) {
        const scripture = scriptureTexts.value[scriptureIndex]
        const reference = scripture.reference

        // Initialize if doesn't exist
        if (!form.selectedScripturePortions[reference]) {
          form.selectedScripturePortions[reference] = []
        }

        // Add if not already selected
        if (!form.selectedScripturePortions[reference].includes(selectedText)) {
          form.selectedScripturePortions[reference].push(selectedText)
          scripture.selectedPortions.push(selectedText)
        }

        // Clear selection
        selection.removeAllRanges()
      }
    }

    const addManualSelection = (scriptureIndex) => {
      const text = manualSelections.value[scriptureIndex]?.trim()
      if (!text) return

      const scripture = scriptureTexts.value[scriptureIndex]
      const reference = scripture.reference

      // Initialize if doesn't exist
      if (!form.selectedScripturePortions[reference]) {
        form.selectedScripturePortions[reference] = []
      }

      // Add if not already selected
      if (!form.selectedScripturePortions[reference].includes(text)) {
        form.selectedScripturePortions[reference].push(text)
        scripture.selectedPortions.push(text)
      }

      // Clear input
      manualSelections.value[scriptureIndex] = ''
    }

    const removeSelectedPortion = (scriptureIndex, portionIndex) => {
      const scripture = scriptureTexts.value[scriptureIndex]
      const reference = scripture.reference
      const portion = scripture.selectedPortions[portionIndex]

      // Remove from both places
      scripture.selectedPortions.splice(portionIndex, 1)
      const mainIndex = form.selectedScripturePortions[reference].indexOf(portion)
      if (mainIndex > -1) {
        form.selectedScripturePortions[reference].splice(mainIndex, 1)
      }
    }

    return {
      form,
      scriptureTexts,
      manualSelections,
      onScriptureChange,
      onTextSelection,
      addManualSelection,
      removeSelectedPortion
    }
  }
}
</script>

<style scoped>
.scripture-text {
  font-family: 'Times New Roman', serif;
  font-size: 16px;
}

.scripture-text::selection {
  background-color: #e3f2fd;
  color: #1976d2;
}
</style>
