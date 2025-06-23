<template>
  <q-layout>
    <q-page-container>
      <q-page class="q-pa-md">
        <!-- Loading State -->
        <div v-if="loading" class="flex flex-center q-pa-xl">
          <q-spinner-dots size="50px" color="primary" />
        </div>

        <!-- Error State -->
        <q-card v-else-if="error" flat bordered class="q-pa-md text-center">
          <q-icon name="error_outline" size="64px" color="negative" class="q-mb-md" />
          <div class="text-h6 q-mb-md">{{ error }}</div>
          <q-btn label="Retry" @click="fetchBookDetails" color="primary" />
        </q-card>

        <!-- Main Content -->
        <div v-else>
          <!-- Breadcrumb Navigation -->
          <q-breadcrumbs class="q-mb-md" separator="/">
            <q-breadcrumbs-el label="Library" :to="{ name: 'library' }" />
            <q-breadcrumbs-el :label="book.category" :to="{ name: 'category', params: { id: book.categoryId } }" />
            <q-breadcrumbs-el :label="book.title" />
          </q-breadcrumbs>

          <q-card flat bordered class="q-pa-md book-detail-card">
            <!-- Book Header -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <div class="book-cover-container">
                  <q-img
                    :src="book.coverImage"
                    :alt="`${book.title} cover`"
                    ratio="3/4"
                    class="book-cover"
                    loading="lazy"
                    @error="handleImageError"
                  >
                    <template #error>
                      <div class="absolute-full flex flex-center bg-grey-3">
                        <q-icon name="book" size="64px" color="grey-6" />
                      </div>
                    </template>

                    <!-- Overlay for additional actions -->
                    <div class="absolute-bottom-right q-pa-sm">
                      <q-btn
                        round
                        dense
                        icon="zoom_in"
                        @click="showImageModal = true"
                        color="white"
                        text-color="dark"
                        size="sm"
                      />
                    </div>
                  </q-img>

                  <!-- Book Status Badge -->
                  <q-badge
                    v-if="book.status"
                    :color="getStatusColor(book.status)"
                    class="absolute-top-left q-ma-sm"
                  >
                    {{ book.status }}
                  </q-badge>
                </div>
              </div>

              <div class="col-12 col-md-8">
                <!-- Title and Author -->
                <div class="book-header">
                  <h1 class="text-h4 q-mb-sm book-title">{{ book.title }}</h1>
                  <div class="text-subtitle1 text-grey-7 q-mb-sm">
                    by
                    <router-link
                      :to="{ name: 'author', params: { id: book.authorId } }"
                      class="text-primary text-decoration-none"
                    >
                      {{ book.author }}
                    </router-link>
                  </div>
                </div>

                <!-- Book Metadata -->
                <div class="book-metadata q-mb-md">
                  <q-chip
                    v-for="genre in book.genres"
                    :key="genre"
                    :label="genre"
                    color="primary"
                    text-color="white"
                    size="sm"
                    class="q-mr-xs"
                  />
                  <div class="text-caption text-grey q-mt-sm">
                    <q-icon name="event" size="16px" class="q-mr-xs" />
                    Published: {{ formatDate(book.publishedDate) }}
                    <span class="q-ml-md">
                      <q-icon name="menu_book" size="16px" class="q-mr-xs" />
                      {{ book.pageCount }} pages
                    </span>
                    <span v-if="book.language" class="q-ml-md">
                      <q-icon name="language" size="16px" class="q-mr-xs" />
                      {{ book.language }}
                    </span>
                  </div>
                </div>

                <!-- Description with Show More/Less -->
                <div class="book-description q-mb-md">
                  <div
                    class="description-text"
                    :class="{ 'description-collapsed': !showFullDescription && book.description.length > 300 }"
                  >
                    {{ book.description }}
                  </div>
                  <q-btn
                    v-if="book.description.length > 300"
                    :label="showFullDescription ? 'Show Less' : 'Show More'"
                    flat
                    dense
                    color="primary"
                    @click="showFullDescription = !showFullDescription"
                    class="q-mt-xs"
                  />
                </div>

                <!-- Rating and Actions -->
                <div class="book-actions q-mb-md">
                  <div class="rating-section q-mb-sm">
                    <q-rating
                      v-model="userRating"
                      size="md"
                      color="amber"
                      icon="star"
                      icon-selected="star"
                      icon-half="star_half"
                      @update:model-value="rateBook"
                      :readonly="ratingLoading"
                    />
                    <span class="q-ml-sm text-caption">
                      {{ book.averageRating ? `${book.averageRating}/5 (${book.ratingsCount} reviews)` : 'No ratings yet' }}
                    </span>
                  </div>

                  <div class="action-buttons">
                    <q-btn-group flat>
                      <q-btn
                        :icon="book.bookmarked ? 'bookmark' : 'bookmark_border'"
                        :label="book.bookmarked ? 'Bookmarked' : 'Bookmark'"
                        @click="toggleBookmark"
                        :color="book.bookmarked ? 'primary' : 'grey'"
                        :loading="bookmarkLoading"
                      />

                      <q-btn
                        :icon="book.inLibrary ? 'library_books' : 'library_add'"
                        :label="book.inLibrary ? 'In Library' : 'Add to Library'"
                        @click="toggleLibrary"
                        :color="book.inLibrary ? 'positive' : 'grey'"
                        :loading="libraryLoading"
                      />

                      <q-btn
                        icon="share"
                        label="Share"
                        @click="shareBook"
                        color="grey"
                      />
                    </q-btn-group>
                  </div>
                </div>

                <!-- Reading Options -->
                <div class="reading-options">
                  <q-btn-group>
                    <q-btn
                      v-if="book.readLink"
                      label="Read Online"
                      icon="open_in_new"
                      color="primary"
                      :href="book.readLink"
                      target="_blank"
                    />
                    <q-btn
                      v-if="book.downloadLink"
                      label="Download"
                      icon="download"
                      color="secondary"
                      @click="downloadBook"
                    />
                    <q-btn
                      v-if="book.audioLink"
                      label="Listen"
                      icon="headphones"
                      color="accent"
                      @click="playAudio"
                    />
                  </q-btn-group>
                </div>
              </div>
            </div>

            <!-- Expandable Sections -->
            <div class="q-mt-lg">
              <!-- Book Details -->
              <q-expansion-item
                icon="info"
                label="Book Details"
                default-opened
                class="q-mb-sm"
              >
                <q-card flat>
                  <q-card-section>
                    <div class="row q-col-gutter-md">
                      <div class="col-6 col-md-3">
                        <div class="text-caption text-grey">ISBN</div>
                        <div>{{ book.isbn || 'N/A' }}</div>
                      </div>
                      <div class="col-6 col-md-3">
                        <div class="text-caption text-grey">Publisher</div>
                        <div>{{ book.publisher || 'N/A' }}</div>
                      </div>
                      <div class="col-6 col-md-3">
                        <div class="text-caption text-grey">Edition</div>
                        <div>{{ book.edition || 'First' }}</div>
                      </div>
                      <div class="col-6 col-md-3">
                        <div class="text-caption text-grey">Format</div>
                        <div>{{ book.format || 'Digital' }}</div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-expansion-item>

              <!-- Table of Contents -->
              <q-expansion-item
                v-if="book.tableOfContents && book.tableOfContents.length"
                icon="list"
                label="Table of Contents"
                class="q-mb-sm"
              >
                <q-card flat>
                  <q-list>
                    <q-item
                      v-for="(chapter, index) in book.tableOfContents"
                      :key="index"
                      clickable
                      @click="goToChapter(chapter)"
                    >
                      <q-item-section>
                        <q-item-label>{{ chapter.title }}</q-item-label>
                        <q-item-label caption>Page {{ chapter.page }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card>
              </q-expansion-item>
            </div>

            <q-separator spaced />

            <!-- Reading Progress -->
            <div v-if="book.readingProgress !== undefined" class="reading-progress q-mb-md">
              <div class="text-subtitle2 q-mb-sm">Reading Progress</div>
              <q-linear-progress
                :value="book.readingProgress / 100"
                color="primary"
                size="8px"
                class="q-mb-xs"
              />
              <div class="text-caption text-grey">{{ book.readingProgress }}% completed</div>
            </div>

            <q-separator spaced />

            <!-- Comments Section -->
            <!--comment-section
              :item-id="book.id"
              item-type="book"
              :allow-replies="true"
              :show-reactions="true"
            /-->

            <q-separator spaced />

            <!-- Related Content -->
            <!--related-content
              type="book"
              :topic="book.topic"
              :author="book.author"
              :genres="book.genres"
              :exclude-id="book.id"
            /-->
          </q-card>
        </div>

        <!-- Image Modal -->
        <q-dialog v-model="showImageModal">
          <q-card style="max-width: 90vw; max-height: 90vh">
            <q-img :src="book.coverImage" :alt="`${book.title} cover`" />
            <q-card-actions align="right">
              <q-btn flat label="Close" color="primary" @click="showImageModal = false" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Share Dialog -->
        <q-dialog v-model="showShareDialog">
          <q-card style="min-width: 300px">
            <q-card-section>
              <div class="text-h6">Share Book</div>
            </q-card-section>
            <q-card-section>
              <q-input
                v-model="shareUrl"
                label="Share URL"
                readonly
                outlined
              >
                <template #append>
                  <q-btn
                    flat
                    icon="content_copy"
                    @click="copyToClipboard(shareUrl)"
                    :color="copied ? 'positive' : 'primary'"
                  />
                </template>
              </q-input>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Close" color="primary" @click="showShareDialog = false" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
//import CommentSection from '@/components/CommentSection.vue'
//import RelatedContent from '@/components/RelatedContent.vue'

const route = useRoute()
const $q = useQuasar()

// Reactive state
const loading = ref(false)
const error = ref(null)
const showFullDescription = ref(false)
const showImageModal = ref(false)
const showShareDialog = ref(false)
const bookmarkLoading = ref(false)
const libraryLoading = ref(false)
const ratingLoading = ref(false)
const copied = ref(false)

const book = reactive({
  id: null,
  title: '',
  author: '',
  authorId: null,
  description: '',
  coverImage: '',
  publishedDate: '',
  pageCount: 0,
  language: '',
  genres: [],
  category: '',
  categoryId: null,
  isbn: '',
  publisher: '',
  edition: '',
  format: '',
  status: '',
  readLink: '',
  downloadLink: '',
  audioLink: '',
  bookmarked: false,
  inLibrary: false,
  averageRating: 0,
  ratingsCount: 0,
  readingProgress: 0,
  tableOfContents: [],
  topic: ''
})

const userRating = ref(0)

// Computed properties
const shareUrl = computed(() => {
  return `${window.location.origin}/book/${book.id}`
})

// Methods
const fetchBookDetails = async () => {
  loading.value = true
  error.value = null

  try {
    // Replace with your API call
    const bookId = route.params.id
    const response = await fetch(`/api/books/${bookId}`)

    if (!response.ok) {
      throw new Error('Failed to fetch book details')
    }

    const bookData = await response.json()
    Object.assign(book, bookData)
    userRating.value = bookData.userRating || 0

  } catch (err) {
    error.value = err.message || 'An error occurred while loading the book'
  } finally {
    loading.value = false
  }
}

const rateBook = async (rating) => {
  if (ratingLoading.value) return

  ratingLoading.value = true
  try {
    const response = await fetch(`/api/books/${book.id}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating })
    })

    if (response.ok) {
      const data = await response.json()
      book.averageRating = data.averageRating
      book.ratingsCount = data.ratingsCount

      $q.notify({
        type: 'positive',
        message: 'Rating submitted successfully'
      })
    }
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Failed to submit rating'
    })
  } finally {
    ratingLoading.value = false
  }
}

const toggleBookmark = async () => {
  if (bookmarkLoading.value) return

  bookmarkLoading.value = true
  try {
    const response = await fetch(`/api/books/${book.id}/bookmark`, {
      method: book.bookmarked ? 'DELETE' : 'POST'
    })

    if (response.ok) {
      book.bookmarked = !book.bookmarked
      $q.notify({
        type: 'positive',
        message: book.bookmarked ? 'Book bookmarked' : 'Bookmark removed'
      })
    }
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Failed to update bookmark'
    })
  } finally {
    bookmarkLoading.value = false
  }
}

const toggleLibrary = async () => {
  if (libraryLoading.value) return

  libraryLoading.value = true
  try {
    const response = await fetch(`/api/books/${book.id}/library`, {
      method: book.inLibrary ? 'DELETE' : 'POST'
    })

    if (response.ok) {
      book.inLibrary = !book.inLibrary
      $q.notify({
        type: 'positive',
        message: book.inLibrary ? 'Added to library' : 'Removed from library'
      })
    }
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Failed to update library'
    })
  } finally {
    libraryLoading.value = false
  }
}

const shareBook = () => {
  showShareDialog.value = true
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)

    $q.notify({
      type: 'positive',
      message: 'URL copied to clipboard'
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Failed to copy URL'
    })
  }
}

const downloadBook = async () => {
  try {
    const response = await fetch(book.downloadLink)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${book.title}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Failed to download book'
    })
  }
}

const playAudio = () => {
  // Implement audio player logic
  window.open(book.audioLink, '_blank')
}

const goToChapter = (chapter) => {
  if (book.readLink) {
    window.open(`${book.readLink}#page=${chapter.page}`, '_blank')
  }
}

const handleImageError = () => {
  console.log('Image failed to load')
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusColor = (status) => {
  const statusColors = {
    'New': 'positive',
    'Popular': 'warning',
    'Bestseller': 'accent',
    'Featured': 'primary'
  }
  return statusColors[status] || 'grey'
}

// Lifecycle
onMounted(() => {
  fetchBookDetails()
})

// Watch for route changes
watch(() => route.params.id, () => {
  if (route.params.id) {
    fetchBookDetails()
  }
})
</script>

<style scoped>
.book-detail-card {
  max-width: 1200px;
  margin: 0 auto;
}

.book-cover-container {
  position: relative;
}

.book-cover {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.book-title {
  line-height: 1.2;
  margin-bottom: 0.5rem;
}

.book-metadata .q-chip {
  margin-bottom: 4px;
}

.description-collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rating-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.action-buttons {
  margin-top: 8px;
}

.reading-options {
  margin-top: 16px;
}

.reading-progress {
  background: rgba(0, 0, 0, 0.02);
  padding: 16px;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .rating-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-buttons .q-btn-group {
    width: 100%;
  }

  .action-buttons .q-btn {
    flex: 1;
  }
}
</style>
