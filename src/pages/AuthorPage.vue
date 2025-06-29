<template>
  <q-page class="q-pa-md">
    <!-- Loading State -->
    <div v-if="loading" class="text-center q-mt-xl">
      <q-spinner-dots size="60px" color="primary" />
      <div class="text-h6 q-mt-md text-grey-7">Loading author...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center q-mt-xl">
      <q-icon name="error_outline" size="48px" color="negative" />
      <div class="text-h6 q-mt-md">{{ error }}</div>
      <q-btn
        label="Retry"
        color="primary"
        outline
        class="q-mt-md"
        @click="loadAuthor"
      />
    </div>

    <!-- Author not found -->
    <div v-else-if="!author" class="text-center q-mt-xl">
      <q-icon name="person_off" size="48px" color="warning" />
      <div class="text-h6 q-mt-md">Author not found</div>
      <q-btn
        label="Go Back"
        color="primary"
        outline
        class="q-mt-md"
        @click="$router.go(-1)"
      />
    </div>

    <!-- Author Content -->
    <div v-else class="q-gutter-md">
      <!-- Breadcrumb -->
      <q-breadcrumbs class="q-mb-md">
        <q-breadcrumbs-el label="Home" icon="home" to="/" />
        <q-breadcrumbs-el label="Authors" to="/authors" />
        <q-breadcrumbs-el :label="author.name" />
      </q-breadcrumbs>

      <!-- Author Profile Card -->
      <q-card
        flat
        bordered
        class="q-pa-md author-profile-card"
        :class="{ 'featured-author': author.featured }"
      >
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-img
              :src="author.photo"
              :alt="author.name"
              ratio="3/4"
              class="rounded-borders author-image"
              spinner-color="primary"
              loading="lazy"
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-3">
                  <q-icon name="person" size="64px" color="grey-5" />
                </div>
              </template>
            </q-img>
          </div>

          <div class="col-12 col-md-8">
            <div class="author-header">
              <div class="text-h4 q-mb-sm author-name">
                {{ author.name }}
                <q-badge
                  v-if="author.featured"
                  color="amber"
                  text-color="black"
                  class="q-ml-sm"
                >
                  Featured
                </q-badge>
              </div>

              <div class="author-meta text-caption text-grey-7 q-mb-md">
                <div class="q-mb-xs">
                  <q-icon name="cake" size="16px" class="q-mr-xs" />
                  {{ formatDate(author.birthDate) }}
                  <span v-if="author.deathDate" class="q-ml-sm">
                    - {{ formatDate(author.deathDate) }}
                  </span>
                </div>
                <div class="q-mb-xs">
                  <q-icon name="public" size="16px" class="q-mr-xs" />
                  {{ author.nationality || 'Unknown' }}
                </div>
                <div v-if="author.genres?.length" class="q-mb-xs">
                  <q-icon name="category" size="16px" class="q-mr-xs" />
                  {{ author.genres.join(', ') }}
                </div>
              </div>
            </div>

            <div class="author-bio q-mb-md">
              <div
                v-if="!showFullBio && author.bio && author.bio.length > 300"
                class="bio-preview"
              >
                {{ author.bio.substring(0, 300) }}...
                <q-btn
                  flat
                  dense
                  color="primary"
                  label="Read more"
                  size="sm"
                  @click="showFullBio = true"
                />
              </div>
              <div v-else class="bio-full">
                {{ author.bio }}
              </div>
            </div>

            <!-- Author Stats -->
            <div class="author-stats row q-gutter-md q-mb-md">
              <div class="stat-item text-center">
                <div class="text-h6 text-primary">{{ books.length }}</div>
                <div class="text-caption">Books</div>
              </div>
              <div v-if="author.awards?.length" class="stat-item text-center">
                <div class="text-h6 text-amber">{{ author.awards.length }}</div>
                <div class="text-caption">Awards</div>
              </div>
              <div v-if="totalRating" class="stat-item text-center">
                <div class="text-h6 text-orange">{{ totalRating.toFixed(1) }}</div>
                <div class="text-caption">Avg Rating</div>
              </div>
            </div>

            <!-- Social Links -->
            <div v-if="author.socialLinks" class="social-links q-gutter-sm">
              <q-btn
                v-for="(link, platform) in author.socialLinks"
                :key="platform"
                :icon="getSocialIcon(platform)"
                :href="link"
                target="_blank"
                round
                outline
                size="sm"
                :color="getSocialColor(platform)"
              />
            </div>
          </div>
        </div>
      </q-card>

      <!-- Awards Section -->
      <q-card
        v-if="author.awards?.length"
        flat
        bordered
        class="q-pa-md"
      >
        <div class="text-h6 q-mb-md">
          <q-icon name="emoji_events" class="q-mr-sm" />
          Awards & Recognition
        </div>
        <div class="awards-grid">
          <q-chip
            v-for="award in author.awards"
            :key="award"
            color="amber"
            text-color="black"
            icon="emoji_events"
            :label="award"
            class="q-ma-xs"
          />
        </div>
      </q-card>

      <!-- Books Section -->
      <q-card v-if="books.length" flat bordered class="q-pa-md">
        <div class="section-header row items-center justify-between q-mb-md">
          <div class="text-h6">
            <q-icon name="menu_book" class="q-mr-sm" />
            Books by {{ author.name }} ({{ books.length }})
          </div>

          <div class="book-controls">
            <q-btn-toggle
              v-model="viewMode"
              :options="[
                { label: 'Grid', value: 'grid', icon: 'grid_view' },
                { label: 'List', value: 'list', icon: 'view_list' }
              ]"
              outline
              color="primary"
              size="sm"
            />
          </div>
        </div>

        <!-- Sort Controls -->
        <div class="sort-controls q-mb-md">
          <q-select
            v-model="sortBy"
            :options="sortOptions"
            label="Sort by"
            dense
            outlined
            style="min-width: 150px"
            @update:model-value="sortBooks"
          />
        </div>

        <!-- Books Grid View -->
        <div v-if="viewMode === 'grid'" class="books-grid">
          <transition-group name="book-grid" tag="div" class="row q-gutter-md">
            <q-card
              v-for="book in sortedBooks"
              :key="book.id"
              class="book-card col-12 col-sm-6 col-md-4 col-lg-3"
              flat
              bordered
              @click="navigateToBook(book.id)"
            >
              <q-img
                :src="book.coverImage"
                :alt="book.title"
                ratio="3/4"
                spinner-color="primary"
                loading="lazy"
                class="book-cover"
              >
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-grey-3">
                    <q-icon name="menu_book" size="48px" color="grey-5" />
                  </div>
                </template>

                <div class="absolute-top-right q-pa-sm">
                  <q-badge
                    v-if="book.averageRating"
                    color="amber"
                    text-color="black"
                  >
                      {{ book.averageRating }}
                  </q-badge>
                </div>
              </q-img>

              <q-card-section class="q-pa-sm">
                <div class="text-subtitle2 book-title">{{ book.title }}</div>
                <div class="text-caption text-grey-7">
                  {{ getPublishedYear(book) || 'Unknown year' }}
                </div>
                <div v-for="genre in book.genres" class="text-caption text-primary">
                  {{ genre }}
                </div>
              </q-card-section>

              <q-card-actions class="q-pa-sm">
                <q-btn
                  flat
                  dense
                  color="primary"
                  label="View Details"
                  size="sm"
                  @click.stop="navigateToBook(book.id)"
                />
              </q-card-actions>
            </q-card>
          </transition-group>
        </div>

        <!-- Books List View -->
        <div v-else class="books-list">
          <transition-group name="book-list" tag="div">
            <q-item
              v-for="book in sortedBooks"
              :key="book.id"
              clickable
              class="book-list-item q-mb-sm"
              @click="navigateToBook(book.id)"
            >
              <q-item-section avatar>
                <q-img
                  :src="book.coverImage"
                  :alt="book.title"
                  ratio="3/4"
                  width="60px"
                  class="rounded-borders"
                  loading="lazy"
                >
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-grey-3">
                      <q-icon name="menu_book" size="24px" color="grey-5" />
                    </div>
                  </template>
                </q-img>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-subtitle1">{{ book.title }}</q-item-label>
                <q-item-label caption>
                  {{ getPublishedYear(book) || 'Unknown year' }}
                  <span v-for="genre in book.genres" class="q-ml-sm">• {{ genre }}</span>
                </q-item-label>
                <q-item-label v-if="book.description" caption class="text-grey-7">
                  {{ book.description.substring(0, 150) }}...
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="column items-end">
                  <q-badge
                    v-if="book.averageRating"
                    color="amber"
                    text-color="black"
                    class="q-mb-xs"
                  >
                    ⭐ {{ book.averageRating }}
                  </q-badge>
                  <q-btn
                    flat
                    dense
                    color="primary"
                    icon="arrow_forward"
                    size="sm"
                  />
                </div>
              </q-item-section>
            </q-item>
          </transition-group>
        </div>
      </q-card>

      <!-- No Books Message -->
      <q-card v-else flat bordered class="q-pa-md text-center">
        <q-icon name="menu_book" size="48px" color="grey-5" />
        <div class="text-h6 q-mt-md text-grey-7">No books found</div>
        <div class="text-caption text-grey-7">
          This author doesn't have any books in our database yet.
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { sampleAuthors } from '../utils/sampleData'
import { sampleBooks } from '../utils/sampleData'
import { EnhancedAuthor, Book } from '../utils/types'

const route = useRoute()
const router = useRouter()

// Reactive state
const author = ref<EnhancedAuthor | null>(null)
const books = ref<Book[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showFullBio = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')
const sortBy = ref('title')

// Sort options
const sortOptions = [
  { label: 'Title A-Z', value: 'title' },
  { label: 'Title Z-A', value: 'title_desc' },
  { label: 'Year (Newest)', value: 'year_desc' },
  { label: 'Year (Oldest)', value: 'year' },
  { label: 'Rating (Highest)', value: 'rating_desc' },
  { label: 'Rating (Lowest)', value: 'rating' }
]

// Computed properties
const totalRating = computed(() => {
  const ratingsSum = books.value
    .filter(book => book.averageRating)
    .reduce((sum, book) => sum + (book.averageRating || 0), 0)
  const ratingsCount = books.value.filter(book => book.averageRating).length
  return ratingsCount > 0 ? ratingsSum / ratingsCount : 0
})

const sortedBooks = computed(() => {
  const booksCopy = [...books.value]

  switch (sortBy.value) {
    case 'title':
      return booksCopy.sort((a, b) => a.title.localeCompare(b.title))
    case 'title_desc':
      return booksCopy.sort((a, b) => b.title.localeCompare(a.title))
    case 'year':
      return booksCopy.sort((a, b) => (getPublishedYear(a) || 0) - (getPublishedYear(b) || 0))
    case 'year_desc':
      return booksCopy.sort((a, b) => (getPublishedYear(b) || 0) - (getPublishedYear(a) || 0))
    case 'rating':
      return booksCopy.sort((a, b) => (a.averageRating || 0) - (b.averageRating || 0))
    case 'rating_desc':
      return booksCopy.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    default:
      return booksCopy
  }
})

// Helper to extract year from publishedDate
const getPublishedYear = (book: Book): number | undefined => {
  if (!book.publishedDate) return undefined
  const yearMatch = book.publishedDate.match(/^\d{4}/)
  return yearMatch ? Number(yearMatch[0]) : undefined
}

// Methods
const loadAuthor = async () => {
  try {
    loading.value = true
    error.value = null

    const id = Number(route.params.id)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const foundAuthor = sampleAuthors.find(a => a.id === id)

    if (!foundAuthor) {
      error.value = 'Author not found'
      return
    }

    author.value = foundAuthor as EnhancedAuthor

    if (author.value.books) {
      books.value = sampleBooks.filter(b => author.value?.books?.includes(b.id))
    }

  } catch (err) {
    error.value = 'Failed to load author. Please try again.'
    console.error('Error loading author:', err)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Unknown'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

const getSocialIcon = (platform: string): string => {
  const icons: Record<string, string> = {
    twitter: 'fa-brands fa-twitter',
    facebook: 'fa-brands fa-facebook',
    instagram: 'fa-brands fa-instagram',
    linkedin: 'fa-brands fa-linkedin',
    website: 'public',
    goodreads: 'menu_book'
  }
  return icons[platform] || 'link'
}

const getSocialColor = (platform: string): string => {
  const colors: Record<string, string> = {
    twitter: 'light-blue',
    facebook: 'blue',
    instagram: 'pink',
    linkedin: 'blue-grey',
    website: 'primary',
    goodreads: 'brown'
  }
  return colors[platform] || 'primary'
}

const navigateToBook = (bookId: number) => {
  router.push({ name: 'book', params: { id: bookId } })
}

const sortBooks = () => {
  // This will trigger the computed property to re-sort
}

// Watchers
watch(() => route.params.id, () => {
  if (route.params.id) {
    loadAuthor()
  }
})

// Lifecycle
onMounted(() => {
  loadAuthor()
})
</script>

<style scoped>
.author-profile-card {
  transition: all 0.3s ease;
}

.featured-author {
  border-left: 4px solid #f2c037;
}

.author-image {
  transition: transform 0.3s ease;
}

.author-image:hover {
  transform: scale(1.02);
}

.author-name {
  line-height: 1.2;
}

.author-meta {
  line-height: 1.4;
}

.author-stats {
  border-top: 1px solid #e0e0e0;
  padding-top: 1rem;
}

.stat-item {
  flex: 1;
  min-width: 60px;
}

.social-links {
  margin-top: 1rem;
}

.awards-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.section-header {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.5rem;
}

.book-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.sort-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.books-grid {
  min-height: 200px;
}

.book-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.book-cover {
  position: relative;
}

.book-title {
  font-weight: 500;
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.book-list-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.book-list-item:hover {
  background-color: #f5f5f5;
  transform: translateX(4px);
}

.bio-preview,
.bio-full {
  line-height: 1.6;
  text-align: justify;
}

/* Animations */
.book-grid-enter-active,
.book-grid-leave-active {
  transition: all 0.3s ease;
}

.book-grid-enter-from,
.book-grid-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.book-list-enter-active,
.book-list-leave-active {
  transition: all 0.3s ease;
}

.book-list-enter-from,
.book-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .book-controls {
    flex-direction: column;
    gap: 0.5rem;
  }

  .sort-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .author-stats {
    justify-content: space-around;
  }
}
</style>
