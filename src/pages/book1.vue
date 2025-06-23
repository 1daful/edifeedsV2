<template>
  <q-layout>
  <q-page-container>
  <q-page class="q-pa-md">
    <q-card flat bordered class="book-detail-card">
      <div v-if="loading" class="q-pa-xl text-center">
        <q-spinner-dots color="primary" size="3em" />
        <div class="q-mt-md text-h6">Loading book details...</div>
      </div>

      <div v-else-if="error" class="q-pa-xl text-center text-negative">
        <q-icon name="error" size="3em" />
        <div class="q-mt-md text-h6">Oops! Something went wrong.</div>
        <div class="text-subtitle1">{{ error }}</div>
        <q-btn label="Retry" color="primary" @click="fetchBookDetails" class="q-mt-md" />
      </div>

      <div v-else class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-img
            :src="book.coverImage || 'placeholder.jpg'"
            alt="Book Cover"
            ratio="3/4"
            class="book-cover-image"
            @error="handleImageError"
          >
            <template v-slot:error>
              <div class="absolute-full flex flex-center bg-grey-3 text-grey-8">
                <q-icon name="image_not_supported" size="2em" />
                <div>No Image</div>
              </div>
            </template>
          </q-img>
        </div>

        <div class="col-12 col-md-8 book-info">
          <h1 class="text-h5 q-mt-none q-mb-xs">{{ book.title }}</h1>
          <div class="text-subtitle1 text-grey-8 q-mb-sm">by <span class="text-weight-medium">{{ book.author }}</span></div>
          <p class="text-body1 q-mb-md book-description">{{ book.description }}</p>

          <div class="row items-center q-gutter-x-md q-mb-md">
            <q-rating
              v-model="book.userRating"
              size="md"
              color="amber"
              @update:model-value="rateBook"
              icon="star_border"
              icon-selected="star"
              icon-half="star_half"
              :max="5"
              no-dimming
            />
            <span class="text-caption text-grey-7">({{ book.totalRatings || 0 }} ratings)</span>
            <q-btn
              :icon="book.bookmarked ? 'bookmark' : 'bookmark_border'"
              flat
              round
              @click="toggleBookmark"
              :color="book.bookmarked ? 'primary' : 'grey'"
              :aria-label="book.bookmarked ? 'Remove bookmark' : 'Add bookmark'"
            >
              <q-tooltip>{{ book.bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks' }}</q-tooltip>
            </q-btn>
          </div>

          <div class="text-caption text-grey q-mt-md">
            <strong>Published:</strong> {{ formatDate(book.publishedDate) }}
          </div>
          <div v-if="book.genre" class="text-caption text-grey">
            <strong>Genre:</strong> <q-chip size="sm" outline color="info" text-color="info">{{ book.genre }}</q-chip>
          </div>
          <div v-if="book.pageCount" class="text-caption text-grey">
            <strong>Pages:</strong> {{ book.pageCount }}
          </div>
          <div v-if="book.isbn" class="text-caption text-grey">
            <strong>ISBN:</strong> {{ book.isbn }}
          </div>

          <q-btn
            label="Read Now"
            icon="open_in_new"
            color="primary"
            class="q-mt-lg"
            :href="book.readLink"
            target="_blank"
            rel="noopener noreferrer"
            :disable="!book.readLink"
          />
        </div>
      </div>

      <q-separator spaced class="q-my-lg" />

      <h2 class="text-h6 q-mb-md">Reader Discussions</h2>
      <!--comment-section :item-id="book.id" item-type="book" /-->

      <q-separator spaced class="q-my-lg" />

      <h2 class="text-h6 q-mb-md">More Like This</h2>
      <!--related-content type="book" :topic="book.topic" /-->
    </q-card>
  </q-page>
  </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
//import CommentSection from 'src/components/CommentSection.vue'; // Adjust path as needed
//import RelatedContent from 'src/components/RelatedContent.vue'; // Adjust path as needed

export default defineComponent({
  name: 'BookDetailPage',
  components: {
    //CommentSection,
    //RelatedContent,
  },
  props: {
    bookId: {
      type: [String, Number],
      required: true,
    },
  },
  setup(props) {
    const book = ref({});
    const loading = ref(true);
    const error = ref(null);

    const fetchBookDetails = async () => {
      loading.value = true;
      error.value = null;
      try {
        // Simulate API call
        // Replace with your actual API call (e.g., using Axios or Fetch API)
        const response = await new Promise(resolve => setTimeout(() => {
          const fetchedBook = {
            id: props.bookId,
            title: 'The Great Vue.js Adventure',
            author: 'Vue Master',
            description: 'An epic journey through the world of Vue.js, exploring its powerful features and best practices. This book is a must-read for anyone looking to master front-end development with Vue.',
            coverImage: 'https://picsum.photos/400/600?random=1', // Example image
            userRating: 4,
            totalRatings: 125,
            bookmarked: false,
            publishedDate: '2023-04-15',
            readLink: 'https://vuejs.org/', // Example read link
            topic: 'Programming',
            genre: 'Technology',
            pageCount: 320,
            isbn: '978-1-23456-789-0',
          };
          resolve({ data: fetchedBook });
        }, 1000));

        if (response.data) {
          book.value = response.data;
        } else {
          throw new Error('Book not found');
        }
      } catch (err) {
        console.error('Error fetching book details:', err);
        error.value = err.message || 'Failed to load book details.';
      } finally {
        loading.value = false;
      }
    };

    const rateBook = async (newRating) => {
      // Simulate API call to update rating
      try {
        // await api.put(`/books/${book.value.id}/rate`, { rating: newRating });
        book.value.userRating = newRating;
        // Optionally, update totalRatings and average rating if your backend provides it
        console.log(`Book rated: ${newRating}`);
        // Show success notification
        // Quasar.notify({ type: 'positive', message: 'Rating updated!' });
      } catch (err) {
        console.error('Error rating book:', err);
        // Show error notification
        // Quasar.notify({ type: 'negative', message: 'Failed to update rating.' });
      }
    };

    const toggleBookmark = async () => {
      try {
        // Simulate API call to toggle bookmark
        // await api.post(`/books/${book.value.id}/bookmark`, { bookmarked: !book.value.bookmarked });
        book.value.bookmarked = !book.value.bookmarked;
        console.log(`Book bookmarked: ${book.value.bookmarked}`);
        // Show notification
        // Quasar.notify({ type: 'info', message: `Book ${book.value.bookmarked ? 'added to' : 'removed from'} bookmarks!` });
      } catch (err) {
        console.error('Error toggling bookmark:', err);
        // Show error notification
        // Quasar.notify({ type: 'negative', message: 'Failed to update bookmark status.' });
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleImageError = (event) => {
      event.target.src = 'placeholder.jpg'; // Fallback to a local placeholder image
      console.warn('Book cover image failed to load. Using placeholder.');
    };

    onMounted(() => {
      fetchBookDetails();
    });

    return {
      book,
      loading,
      error,
      rateBook,
      toggleBookmark,
      formatDate,
      handleImageError,
      fetchBookDetails, // Expose for retry button
    };
  },
});
</script>

<style lang="scss" scoped>
.book-detail-card {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
}

.book-cover-image {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.book-info {
  display: flex;
  flex-direction: column;
}

.book-description {
  white-space: pre-wrap; /* Preserves whitespace and line breaks from data */
  line-height: 1.6;
}

/* Responsive adjustments */
@media (max-width: $breakpoint-md-down) {
  .book-detail-card {
    padding: 24px;
  }
  .book-cover-image {
    margin-bottom: 24px;
  }
  .book-info {
    text-align: center;
  }
}
</style>