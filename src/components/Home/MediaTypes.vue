<template>
  <q-page class="q-pa-md">
    <!-- Search and Filter Section -->
    <div class="row q-mb-lg">
      <div class="col-12 col-md-6">
        <q-input
          v-model="searchQuery"
          placeholder="Search across all categories..."
          outlined
          clearable
          @input="filterContent"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-6 q-pl-md">
        <q-select
          v-model="selectedCategory"
          :options="categoryOptions"
          label="Filter by Category"
          outlined
          clearable
          @update:model-value="filterContent"
        />
      </div>
    </div>

    <!-- Tabs Section -->
    <q-tabs
      v-model="activeTab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab
        v-for="(category, categoryKey) in filteredData"
        :key="categoryKey"
        :name="categoryKey"
        :icon="getCategoryIcon(categoryKey)"
        :label="`${getCategoryTitle(categoryKey)} (${category.length})`"
      />
    </q-tabs>

    <q-separator />

    <!-- Tab Panels -->
    <q-tab-panels v-model="activeTab" animated>
      <q-tab-panel
        v-for="(category, categoryKey) in filteredData"
        :key="categoryKey"
        :name="categoryKey"
        class="q-pa-none"
      >
        <div class="q-pa-md">
          <!-- Category Header -->
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h5">
              <q-icon :name="getCategoryIcon(categoryKey)" class="q-mr-sm" />
              {{ getCategoryTitle(categoryKey) }}
            </div>
            <q-chip
              :color="getCategoryColor(categoryKey)"
              text-color="white"
              size="md"
            >
              {{ category.length }} items
            </q-chip>
          </div>

          <!-- Items Grid -->
          <div class="row q-col-gutter-md">
            <div
              v-for="(item, idx) in category"
              :key="idx"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card
                flat
                bordered
                clickable
                v-ripple
                @click="selectItem(categoryKey, item)"
                :class="{ 'bg-blue-1': selectedItem?.category === categoryKey && selectedItem?.item === item }"
                class="full-height"
              >
                <q-card-section>
                  <div class="text-h6 q-mb-sm">{{ item.title }}</div>
                  <div class="text-subtitle2 text-grey-6 q-mb-sm" v-if="item.author">
                    by {{ item.author }}
                  </div>
                  <div class="text-body2 text-grey-7" v-if="item.description">
                    {{ item.description }}
                  </div>
                </q-card-section>

                <q-card-actions class="row items-center justify-between">
                  <q-rating
                    v-if="item.rating"
                    :model-value="item.rating"
                    size="sm"
                    color="amber"
                    readonly
                  />
                  <q-btn
                    flat
                    round
                    dense
                    :icon="item.liked ? 'favorite' : 'favorite_border'"
                    :color="item.liked ? 'red' : 'grey'"
                    @click.stop="toggleLike(categoryKey, idx)"
                  />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Empty State -->
    <div v-if="Object.keys(filteredData).length === 0" class="text-center q-mt-xl">
      <q-icon name="search_off" size="4rem" color="grey-5" />
      <div class="text-h6 q-mt-md text-grey-6">No results found</div>
      <div class="text-body2 text-grey-5">
        Try adjusting your search terms or category filter
      </div>
    </div>

    <!-- Selected Item Details Dialog -->
    <q-dialog v-model="showDetails" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ selectedItem?.item?.title }}</div>
          <div class="text-subtitle2 text-grey-6" v-if="selectedItem?.item?.author">
            by {{ selectedItem?.item?.author }}
          </div>
        </q-card-section>

        <q-card-section v-if="selectedItem?.item?.description">
          {{ selectedItem?.item?.description }}
        </q-card-section>

        <q-card-section v-if="selectedItem?.item?.rating">
          <div class="row items-center">
            <span class="q-mr-sm">Rating:</span>
            <q-rating
              :model-value="selectedItem.item.rating"
              size="sm"
              color="amber"
              readonly
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup />
          <q-btn
            flat
            :label="selectedItem?.item?.liked ? 'Unlike' : 'Like'"
            :color="selectedItem?.item?.liked ? 'red' : 'primary'"
            @click="toggleLikeFromDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Floating Action Button for Adding New Items -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="add"
        color="primary"
        @click="showAddDialog = true"
      />
    </q-page-sticky>

    <!-- Add New Item Dialog -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Add New Item</div>
        </q-card-section>

        <q-card-section>
          <q-select
            v-model="newItem.category"
            :options="Object.keys(sampleData)"
            label="Category"
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="newItem.title"
            label="Title"
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="newItem.author"
            label="Author/Artist"
            outlined
            class="q-mb-md"
          />
          <q-input
            v-model="newItem.description"
            label="Description"
            outlined
            type="textarea"
            rows="3"
            class="q-mb-md"
          />
          <q-rating
            v-model="newItem.rating"
            size="md"
            color="amber"
            class="q-mb-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" @click="cancelAdd" />
          <q-btn
            flat
            label="Add"
            color="primary"
            @click="addNewItem"
            :disable="!newItem.title || !newItem.category"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const searchQuery = ref('')
const selectedCategory = ref(null)
const showDetails = ref(false)
const showAddDialog = ref(false)
const selectedItem = ref(null)
const activeTab = ref('Books') // Default active tab

const newItem = reactive({
  category: null,
  title: '',
  author: '',
  description: '',
  rating: 0
})

const sampleData = reactive({
  Books: [
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      description: 'A classic American novel set in the Jazz Age',
      rating: 4.5,
      liked: false
    },
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      description: 'A timeless tale of racial injustice and childhood innocence',
      rating: 4.8,
      liked: true
    },
    {
      title: '1984',
      author: 'George Orwell',
      description: 'A dystopian social science fiction novel',
      rating: 4.7,
      liked: false
    }
  ],
  Music: [
    {
      title: 'Bohemian Rhapsody',
      author: 'Queen',
      description: 'An iconic rock opera masterpiece',
      rating: 4.9,
      liked: true
    },
    {
      title: 'Hotel California',
      author: 'Eagles',
      description: 'A legendary rock song with mysterious lyrics',
      rating: 4.6,
      liked: false
    },
    {
      title: 'Imagine',
      author: 'John Lennon',
      description: 'A song about peace and unity',
      rating: 4.8,
      liked: true
    }
  ],
  Videos: [
    {
      title: 'The Shawshank Redemption',
      author: 'Frank Darabont',
      description: 'A story of hope and friendship in prison',
      rating: 4.9,
      liked: true
    },
    {
      title: 'Pulp Fiction',
      author: 'Quentin Tarantino',
      description: 'A non-linear crime film with interconnected stories',
      rating: 4.7,
      liked: false
    },
    {
      title: 'The Dark Knight',
      author: 'Christopher Nolan',
      description: 'Batman faces his greatest challenge with the Joker',
      rating: 4.8,
      liked: true
    }
  ],
  Quotes: [
    {
      title: 'Be yourself; everyone else is already taken.',
      author: 'Oscar Wilde',
      description: 'A reminder about the importance of authenticity',
      rating: 4.5,
      liked: false
    },
    {
      title: 'In the middle of difficulty lies opportunity.',
      author: 'Albert Einstein',
      description: 'About finding opportunities in challenges',
      rating: 4.7,
      liked: true
    },
    {
      title: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
      description: 'About passion and work satisfaction',
      rating: 4.6,
      liked: false
    }
  ]
})

const categoryOptions = computed(() => Object.keys(sampleData))

const filteredData = computed(() => {
  let filtered = { ...sampleData }

  // Filter by category
  if (selectedCategory.value) {
    filtered = { [selectedCategory.value]: filtered[selectedCategory.value] }
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    const result = {}

    Object.keys(filtered).forEach(category => {
      const filteredItems = filtered[category].filter(item =>
        item.title.toLowerCase().includes(query) ||
        (item.author && item.author.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query))
      )

      if (filteredItems.length > 0) {
        result[category] = filteredItems
      }
    })

    return result
  }

  return filtered
})

// Watch for filtered data changes and update active tab
watch(filteredData, (newData) => {
  const availableTabs = Object.keys(newData)
  if (availableTabs.length > 0 && !availableTabs.includes(activeTab.value)) {
    activeTab.value = availableTabs[0]
  }
})

const getCategoryIcon = (category) => {
  const icons = {
    Books: 'book',
    Music: 'library_music',
    Videos: 'movie',
    Quotes: 'format_quote'
  }
  return icons[category] || 'category'
}

const getCategoryTitle = (category) => {
  return `Popular ${category}`
}

const getCategoryColor = (category) => {
  const colors = {
    Books: 'blue',
    Music: 'green',
    Videos: 'purple',
    Quotes: 'orange'
  }
  return colors[category] || 'grey'
}

const selectItem = (category, item) => {
  selectedItem.value = { category, item }
  showDetails.value = true
}

const toggleLike = (category, index) => {
  sampleData[category][index].liked = !sampleData[category][index].liked
}

const toggleLikeFromDialog = () => {
  if (selectedItem.value) {
    const { category, item } = selectedItem.value
    const index = sampleData[category].findIndex(i => i.title === item.title)
    if (index !== -1) {
      toggleLike(category, index)
    }
  }
}

const addNewItem = () => {
  if (newItem.title && newItem.category) {
    sampleData[newItem.category].push({
      title: newItem.title,
      author: newItem.author || undefined,
      description: newItem.description || undefined,
      rating: newItem.rating || 0,
      liked: false
    })

    // Switch to the tab where the item was added
    activeTab.value = newItem.category

    cancelAdd()
  }
}

const cancelAdd = () => {
  Object.assign(newItem, {
    category: null,
    title: '',
    author: '',
    description: '',
    rating: 0
  })
  showAddDialog.value = false
}

const filterContent = () => {
  // This function is called when search or category filter changes
  // The actual filtering is handled by the computed property
}
</script>

<style scoped>
.full-height {
  height: 100%;
}
</style>
