<template>
  <q-layout>
    <q-page-container>
      <q-page class="q-pa-md">
        <div class="quote-container">
          <!-- Loading State -->
          <q-card v-if="loading" flat bordered class="q-pa-md">
            <q-skeleton height="200px" class="q-mb-md" />
            <q-skeleton type="text" width="80%" class="q-mb-sm" />
            <q-skeleton type="text" width="40%" class="q-mb-md" />
            <q-skeleton type="rect" width="120px" height="24px" />
          </q-card>

          <!-- Main Quote Card -->
          <q-card
            v-else
            flat
            bordered
            class="quote-card q-pa-md"
            :class="{ 'bookmarked': quote.bookmarked, 'dark-mode': darkMode }"
          >
            <!-- Image with Overlay and Actions -->
            <div class="image-container relative-position">
              <q-img
                :src="quote.imageUrl"
                :alt="`Quote by ${quote.author}`"
                ratio="16/9"
                class="rounded-borders q-mb-md quote-image"
                :class="{ 'blur-on-hover': showImageActions }"
                @error="handleImageError"
                @load="imageLoaded = true"
              >
                <template v-slot:loading>
                  <q-skeleton height="100%" />
                </template>

                <!-- Image Overlay Actions -->
                <div
                  v-if="showImageActions && imageLoaded"
                  class="image-overlay absolute-full flex flex-center"
                >
                  <q-btn
                    round
                    color="white"
                    text-color="dark"
                    icon="download"
                    @click="downloadImage"
                    class="q-ma-sm"
                    size="md"
                  />
                  <q-btn
                    round
                    color="white"
                    text-color="dark"
                    icon="fullscreen"
                    @click="showImageModal = true"
                    class="q-ma-sm"
                    size="md"
                  />
                </div>
              </q-img>

              <!-- Category Tag -->
              <q-chip
                v-if="quote.category"
                :label="quote.category"
                color="primary"
                text-color="white"
                class="absolute-top-right q-ma-sm category-chip"
                size="sm"
              />
            </div>

            <!-- Quote Text with Typography Options -->
            <div class="quote-content">
              <div
                class="quote-text q-mb-sm"
                :class="[
                  `text-${textSize}`,
                  { 'text-italic': italicText, 'text-weight-medium': boldText }
                ]"
                :style="{ fontFamily: selectedFont }"
              >
                <q-icon name="format_quote" class="quote-icon-start" />
                {{ quote.text }}
                <q-icon name="format_quote" class="quote-icon-end" />
              </div>

              <div class="text-caption text-grey author-text q-mb-md">
                — {{ quote.author }}
                <q-chip
                  v-if="quote.authorBio"
                  clickable
                  @click="showAuthorInfo = true"
                  size="sm"
                  outline
                  class="q-ml-sm"
                >
                  <q-icon name="info" size="xs" />
                </q-chip>
              </div>
            </div>

            <!-- Interactive Elements Row -->
            <div class="actions-row q-mb-md">
              <!-- Rating with Analytics -->
              <div class="rating-section">
                <q-rating
                  v-model="quote.userRating"
                  size="md"
                  color="amber"
                  icon="star"
                  icon-selected="star"
                  icon-half="star_half"
                  @update:model-value="rateQuote"
                  :readonly="ratingSubmitted"
                />
                <div class="text-caption q-mt-xs">
                  {{ quote.averageRating?.toFixed(1) || 'No ratings' }}
                  ({{ quote.totalRatings || 0 }} {{ quote.totalRatings === 1 ? 'rating' : 'ratings' }})
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons">
                <q-btn
                  :icon="quote.bookmarked ? 'bookmark' : 'bookmark_border'"
                  flat
                  round
                  @click="toggleBookmark"
                  :color="quote.bookmarked ? 'primary' : 'grey'"
                  :loading="bookmarkLoading"
                >
                  <q-tooltip>{{ quote.bookmarked ? 'Remove bookmark' : 'Add bookmark' }}</q-tooltip>
                </q-btn>

                <q-btn
                  icon="favorite"
                  flat
                  round
                  @click="toggleLike"
                  :color="quote.liked ? 'red' : 'grey'"
                  :loading="likeLoading"
                >
                  <q-badge v-if="quote.likeCount > 0" :label="quote.likeCount" floating />
                  <q-tooltip>{{ quote.liked ? 'Unlike' : 'Like' }}</q-tooltip>
                </q-btn>

                <q-btn
                  icon="share"
                  flat
                  round
                  @click="showShareOptions = true"
                >
                  <q-tooltip>Share quote</q-tooltip>
                </q-btn>

                <q-btn
                  icon="content_copy"
                  flat
                  round
                  @click="copyQuote"
                >
                  <q-tooltip>Copy to clipboard</q-tooltip>
                </q-btn>

                <!-- Typography Controls -->
                <q-btn
                  icon="text_fields"
                  flat
                  round
                  @click="showTypographyPanel = !showTypographyPanel"
                >
                  <q-tooltip>Text options</q-tooltip>
                </q-btn>
              </div>
            </div>

            <!-- Typography Panel -->
            <q-slide-transition>
              <q-card v-show="showTypographyPanel" flat class="typography-panel q-pa-md q-mb-md">
                <div class="row q-gutter-md items-center">
                  <div class="col-auto">
                    <q-select
                      v-model="textSize"
                      :options="textSizeOptions"
                      label="Size"
                      dense
                      outlined
                      style="min-width: 100px"
                    />
                  </div>
                  <div class="col-auto">
                    <q-select
                      v-model="selectedFont"
                      :options="fontOptions"
                      label="Font"
                      dense
                      outlined
                      style="min-width: 150px"
                    />
                  </div>
                  <div class="col-auto">
                    <q-toggle v-model="italicText" label="Italic" />
                  </div>
                  <div class="col-auto">
                    <q-toggle v-model="boldText" label="Bold" />
                  </div>
                </div>
              </q-card>
            </q-slide-transition>

            <!-- Tags Section -->
            <div v-if="quote.tags && quote.tags.length" class="tags-section q-mb-md">
              <div class="text-caption text-grey q-mb-xs">Tags:</div>
              <q-chip
                v-for="tag in quote.tags"
                :key="tag"
                :label="tag"
                clickable
                @click="$emit('tag-clicked', tag)"
                size="sm"
                color="grey-3"
                class="q-mr-xs q-mb-xs"
              />
            </div>

            <q-separator spaced />

            <!-- Enhanced Comment Section -->
            <div class="comment-section">
              <div class="row items-center q-mb-md">
                <div class="col">
                  <div class="text-h6">Comments ({{ quote.commentCount || 0 }})</div>
                </div>
                <div class="col-auto">
                  <q-select
                    v-model="commentSort"
                    :options="commentSortOptions"
                    label="Sort by"
                    dense
                    outlined
                    style="min-width: 120px"
                  />
                </div>
              </div>
              <comment-section
                :item-id="quote.id"
                item-type="quote"
                :sort-by="commentSort"
                @comment-added="handleCommentAdded"
              />
            </div>

            <q-separator spaced />

            <!-- Related Content with Tabs -->
            <div class="related-section">
              <q-tabs v-model="relatedTab" class="q-mb-md" align="left">
                <q-tab name="similar" label="Similar Quotes" />
                <q-tab name="author" label="Same Author" />
                <q-tab name="topic" label="Same Topic" />
              </q-tabs>

              <q-tab-panels v-model="relatedTab" animated>
                <q-tab-panel name="similar">
                  <related-content type="quote" :topic="quote.topic" mode="similar" />
                </q-tab-panel>
                <q-tab-panel name="author">
                  <related-content type="quote" :author="quote.author" mode="author" />
                </q-tab-panel>
                <q-tab-panel name="topic">
                  <related-content type="quote" :topic="quote.topic" mode="topic" />
                </q-tab-panel>
              </q-tab-panels>
            </div>
          </q-card>

          <!-- Share Dialog -->
          <q-dialog v-model="showShareOptions">
            <q-card style="min-width: 300px">
              <q-card-section>
                <div class="text-h6">Share Quote</div>
              </q-card-section>
              <q-card-section>
                <div class="q-gutter-sm">
                  <q-btn
                    flat
                    icon="link"
                    label="Copy Link"
                    @click="copyShareLink"
                    class="full-width"
                  />
                  <q-btn
                    flat
                    icon="mail"
                    label="Email"
                    @click="shareViaEmail"
                    class="full-width"
                  />
                  <q-btn
                    flat
                    icon="message"
                    label="SMS"
                    @click="shareViaSMS"
                    class="full-width"
                  />
                  <q-btn
                    flat
                    icon="download"
                    label="Download as Image"
                    @click="downloadAsImage"
                    class="full-width"
                  />
                </div>
              </q-card-section>
            </q-card>
          </q-dialog>

          <!-- Image Modal -->
          <q-dialog v-model="showImageModal">
            <q-card style="max-width: 90vw; max-height: 90vh">
              <q-img :src="quote.imageUrl" :alt="`Quote by ${quote.author}`" />
              <q-card-actions align="right">
                <q-btn flat label="Close" @click="showImageModal = false" />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <!-- Author Info Dialog -->
          <q-dialog v-model="showAuthorInfo">
            <q-card style="min-width: 400px">
              <q-card-section>
                <div class="text-h6">{{ quote.author }}</div>
              </q-card-section>
              <q-card-section>
                <div class="text-body2">{{ quote.authorBio }}</div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Close" @click="showAuthorInfo = false" />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useClipboard } from '@vueuse/core'

export default {
  name: 'EnhancedQuoteDisplay',

  props: {
    quoteId: {
      type: [String, Number],
      required: true
    },
    darkMode: {
      type: Boolean,
      default: false
    }
  },

  setup(props, { emit }) {
    const $q = useQuasar()
    const { copy } = useClipboard()

    // Reactive data
    const loading = ref(true)
    const quote = ref({
      id: props.quoteId,
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      imageUrl: "https://via.placeholder.com/800x450/4A90E2/FFFFFF?text=Inspirational+Quote",
      category: "Motivation",
      topic: "success",
      tags: ["motivation", "work", "passion", "success"],
      userRating: 0,
      averageRating: 4.2,
      totalRatings: 847,
      bookmarked: false,
      liked: false,
      likeCount: 1243,
      commentCount: 56,
      authorBio: "Steven Paul Jobs was an American business magnate, industrial designer, investor, and media proprietor."
    })

    // UI State
    const imageLoaded = ref(false)
    const showImageActions = ref(false)
    const showImageModal = ref(false)
    const showAuthorInfo = ref(false)
    const showShareOptions = ref(false)
    const showTypographyPanel = ref(false)

    // Loading states
    const bookmarkLoading = ref(false)
    const likeLoading = ref(false)
    const ratingSubmitted = ref(false)

    // Typography options
    const textSize = ref('subtitle1')
    const selectedFont = ref('Roboto, sans-serif')
    const italicText = ref(false)
    const boldText = ref(false)

    const textSizeOptions = [
      { label: 'Small', value: 'body2' },
      { label: 'Medium', value: 'subtitle1' },
      { label: 'Large', value: 'h6' },
      { label: 'Extra Large', value: 'h5' }
    ]

    const fontOptions = [
      { label: 'Roboto', value: 'Roboto, sans-serif' },
      { label: 'Georgia', value: 'Georgia, serif' },
      { label: 'Times New Roman', value: '"Times New Roman", serif' },
      { label: 'Arial', value: 'Arial, sans-serif' },
      { label: 'Playfair Display', value: '"Playfair Display", serif' }
    ]

    // Comment and related content
    const commentSort = ref('newest')
    const commentSortOptions = [
      { label: 'Newest', value: 'newest' },
      { label: 'Oldest', value: 'oldest' },
      { label: 'Most Liked', value: 'liked' }
    ]

    const relatedTab = ref('similar')

    // Methods
    const rateQuote = async (rating) => {
      try {
        // API call to rate quote
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
        ratingSubmitted.value = true

        // Update average rating (simulate)
        const newTotal = quote.value.totalRatings + 1
        const newSum = (quote.value.averageRating * quote.value.totalRatings) + rating
        quote.value.averageRating = newSum / newTotal
        quote.value.totalRatings = newTotal

        $q.notify({
          type: 'positive',
          message: `Thanks for rating this quote ${rating} star${rating !== 1 ? 's' : ''}!`,
          position: 'top'
        })
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to submit rating. Please try again.',
          position: 'top'
        })
      }
    }

    const toggleBookmark = async () => {
      bookmarkLoading.value = true
      try {
        // API call to toggle bookmark
        await new Promise(resolve => setTimeout(resolve, 300))
        quote.value.bookmarked = !quote.value.bookmarked

        $q.notify({
          type: 'positive',
          message: quote.value.bookmarked ? 'Quote bookmarked!' : 'Bookmark removed',
          position: 'top'
        })

        emit('bookmark-toggled', {
          quoteId: quote.value.id,
          bookmarked: quote.value.bookmarked
        })
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to update bookmark. Please try again.',
          position: 'top'
        })
      } finally {
        bookmarkLoading.value = false
      }
    }

    const toggleLike = async () => {
      likeLoading.value = true
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        const wasLiked = quote.value.liked
        quote.value.liked = !wasLiked
        quote.value.likeCount += wasLiked ? -1 : 1

        emit('like-toggled', {
          quoteId: quote.value.id,
          liked: quote.value.liked
        })
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to update like. Please try again.',
          position: 'top'
        })
      } finally {
        likeLoading.value = false
      }
    }

    const copyQuote = async () => {
      const text = `"${quote.value.text}" — ${quote.value.author}`
      try {
        await copy(text)
        $q.notify({
          type: 'positive',
          message: 'Quote copied to clipboard!',
          position: 'top'
        })
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to copy quote',
          position: 'top'
        })
      }
    }

    const handleImageError = () => {
      quote.value.imageUrl = 'https://via.placeholder.com/800x450/CCCCCC/666666?text=Image+Not+Found'
    }

    const downloadImage = () => {
      const link = document.createElement('a')
      link.href = quote.value.imageUrl
      link.download = `quote-${quote.value.author.replace(/\s+/g, '-').toLowerCase()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    const copyShareLink = async () => {
      const url = `${window.location.origin}/quotes/${quote.value.id}`
      try {
        await copy(url)
        $q.notify({
          type: 'positive',
          message: 'Link copied to clipboard!',
          position: 'top'
        })
        showShareOptions.value = false
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to copy link',
          position: 'top'
        })
      }
    }

    const shareViaEmail = () => {
      const subject = encodeURIComponent(`Check out this quote by ${quote.value.author}`)
      const body = encodeURIComponent(`"${quote.value.text}" — ${quote.value.author}\n\nView more: ${window.location.href}`)
      window.open(`mailto:?subject=${subject}&body=${body}`)
      showShareOptions.value = false
    }

    const shareViaSMS = () => {
      const text = encodeURIComponent(`"${quote.value.text}" — ${quote.value.author}`)
      window.open(`sms:?body=${text}`)
      showShareOptions.value = false
    }

    const downloadAsImage = () => {
      // This would typically use a canvas to generate an image with the quote
      $q.notify({
        type: 'info',
        message: 'Image generation feature coming soon!',
        position: 'top'
      })
      showShareOptions.value = false
    }

    const handleCommentAdded = () => {
      quote.value.commentCount += 1
    }

    // Load quote data
    const loadQuote = async () => {
      try {
        loading.value = true
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        // Quote data would be loaded here
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to load quote',
          position: 'top'
        })
      } finally {
        loading.value = false
      }
    }

    // Watchers
    watch(() => props.quoteId, () => {
      loadQuote()
    })

    // Lifecycle
    onMounted(() => {
      loadQuote()
    })

    return {
      // Data
      loading,
      quote,
      imageLoaded,
      showImageActions,
      showImageModal,
      showAuthorInfo,
      showShareOptions,
      showTypographyPanel,
      bookmarkLoading,
      likeLoading,
      ratingSubmitted,

      // Typography
      textSize,
      selectedFont,
      italicText,
      boldText,
      textSizeOptions,
      fontOptions,

      // Comments and related
      commentSort,
      commentSortOptions,
      relatedTab,

      // Methods
      rateQuote,
      toggleBookmark,
      toggleLike,
      copyQuote,
      handleImageError,
      downloadImage,
      copyShareLink,
      shareViaEmail,
      shareViaSMS,
      downloadAsImage,
      handleCommentAdded
    }
  }
}
</script>

<style lang="scss" scoped>
.quote-container {
  max-width: 800px;
  margin: 0 auto;
}

.quote-card {
  transition: all 0.3s ease;

  &.bookmarked {
    border-left: 4px solid $primary;
  }

  &.dark-mode {
    background: rgba(255, 255, 255, 0.05);
  }
}

.image-container {
  &:hover .quote-image {
    filter: brightness(0.7);
  }
}

.image-overlay {
  opacity: 0;
  transition: opacity 0.3s ease;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);

  .image-container:hover & {
    opacity: 1;
  }
}

.category-chip {
  backdrop-filter: blur(10px);
}

.quote-text {
  position: relative;
  line-height: 1.6;
  padding: 0 1rem;
}

.quote-icon-start {
  position: absolute;
  left: -0.2rem;
  top: -0.2rem;
  opacity: 0.3;
  font-size: 1.5em;
  transform: rotate(180deg);
}

.quote-icon-end {
  opacity: 0.3;
  margin-left: 0.25rem;
  font-size: 1.5em;
}

.actions-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.rating-section {
  flex: 1;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.typography-panel {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.tags-section {
  .q-chip {
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}

.comment-section,
.related-section {
  .text-h6 {
    font-weight: 500;
  }
}

// Responsive adjustments
@media (max-width: 600px) {
  .quote-card {
    margin: 0 -1rem;
    border-radius: 0;
  }

  .typography-panel .row {
    flex-direction: column;
    gap: 0.5rem;

    .col-auto {
      width: 100%;
    }
  }
}

// Animation classes
.blur-on-hover {
  transition: filter 0.3s ease;
}

// Print styles
@media print {
  .action-buttons,
  .typography-panel,
  .comment-section,
  .related-section {
    display: none !important;
  }

  .quote-card {
    box-shadow: none;
    border: 1px solid #ddd;
  }
}
</style>
