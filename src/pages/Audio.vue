<template>
  <q-layout>
    <q-page-container>
      <q-page class="song-player-page">
        <!-- Hero Section with Dynamic Background -->
        <div class="hero-section" :style="heroBackgroundStyle">
          <div class="hero-overlay">
            <div class="container q-pa-lg">
              <div class="row q-gutter-lg items-center">
                <!-- Album Art with Advanced Styling -->
                <div class="col-12 col-md-4">
                  <div class="album-art-container">
                    <q-img
                      :src="song.coverImage"
                      :alt="`${song.title} album art`"
                      ratio="1"
                      class="album-art"
                      :class="{ 'playing': isPlaying, 'paused': isPaused }"
                    >
                      <template v-slot:loading>
                        <q-skeleton animation="wave" />
                      </template>
                      <div class="album-art-overlay">
                        <q-btn
                          :icon="playButtonIcon"
                          round
                          size="xl"
                          color="white"
                          text-color="primary"
                          class="play-overlay-btn"
                          @click="togglePlay"
                        />
                      </div>
                    </q-img>
                    <!-- Vinyl Record Effect -->
                    <div class="vinyl-record" :class="{ 'spinning': isPlaying }">
                      <div class="vinyl-center"></div>
                    </div>
                  </div>
                </div>

                <!-- Song Info and Controls -->
                <div class="col-12 col-md-8">
                  <div class="song-info">
                    <!-- Genre Tag -->
                    <q-chip
                      v-if="song.genre"
                      :label="song.genre"
                      color="primary"
                      text-color="white"
                      size="sm"
                      class="q-mb-sm"
                    />

                    <!-- Song Title with Typing Animation -->
                    <h1 class="song-title text-white">
                      <span
                        v-for="(char, index) in song.title"
                        :key="index"
                        :style="{ animationDelay: `${index * 0.1}s` }"
                        class="title-char"
                      >
                        {{ char === ' ' ? '\u00A0' : char }}
                      </span>
                    </h1>

                    <!-- Artist Info -->
                    <div class="artist-info q-mb-md">
                      <q-avatar size="32px" class="q-mr-sm">
                        <q-img :src="song.artistImage || 'https://via.placeholder.com/32'" />
                      </q-avatar>
                      <span class="text-h6 text-white">{{ song.artist }}</span>
                      <q-btn
                        icon="verified"
                        flat
                        dense
                        color="primary"
                        size="sm"
                        v-if="song.verified"
                        class="q-ml-xs"
                      />
                    </div>

                    <!-- Song Stats -->
                    <div class="song-stats q-mb-md">
                      <div class="stat-item">
                        <q-icon name="play_arrow" size="sm" />
                        <span>{{ formatNumber(song.playCount) }} plays</span>
                      </div>
                      <div class="stat-item">
                        <q-icon name="favorite" size="sm" />
                        <span>{{ formatNumber(song.likeCount) }} likes</span>
                      </div>
                      <div class="stat-item">
                        <q-icon name="schedule" size="sm" />
                        <span>{{ song.duration }}</span>
                      </div>
                    </div>

                    <!-- Enhanced Rating System -->
                    <div class="rating-section q-mb-md">
                      <div class="rating-label text-white q-mb-xs">Rate this song:</div>
                      <q-rating
                        v-model="song.userRating"
                        size="lg"
                        color="amber"
                        icon="star_border"
                        icon-selected="star"
                        @update:model-value="rateSong"
                        class="interactive-rating"
                      />
                      <div class="rating-stats text-white text-caption q-mt-xs">
                        Average: {{ song.averageRating }}/5 ({{ song.ratingCount }} ratings)
                      </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="action-buttons">
                      <q-btn
                        :icon="playButtonIcon"
                        :label="playButtonLabel"
                        color="primary"
                        size="lg"
                        class="primary-btn q-mr-sm"
                        @click="togglePlay"
                      />

                      <q-btn
                        :icon="song.bookmarked ? 'bookmark' : 'bookmark_border'"
                        :label="song.bookmarked ? 'Saved' : 'Save'"
                        flat
                        color="white"
                        @click="toggleBookmark"
                        class="action-btn q-mr-sm"
                      />

                      <q-btn
                        icon="queue_music"
                        label="Add to Playlist"
                        flat
                        color="white"
                        @click="showPlaylistDialog = true"
                        class="action-btn q-mr-sm"
                      />

                      <q-btn
                        icon="share"
                        flat
                        color="white"
                        @click="shareDialog = true"
                        class="action-btn q-mr-sm"
                      />

                      <q-btn
                        icon="more_vert"
                        flat
                        color="white"
                        class="action-btn"
                      >
                        <q-menu>
                          <q-list>
                            <q-item clickable @click="downloadSong">
                              <q-item-section avatar>
                                <q-icon name="download" />
                              </q-item-section>
                              <q-item-section>Download</q-item-section>
                            </q-item>
                            <q-item clickable @click="reportSong">
                              <q-item-section avatar>
                                <q-icon name="flag" />
                              </q-item-section>
                              <q-item-section>Report</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-section" v-if="isPlaying || isPaused">
          <div class="container q-pa-md">
            <div class="progress-container">
              <span class="time-label">{{ currentTime }}</span>
              <q-linear-progress
                :value="progressValue"
                color="primary"
                class="progress-bar"
                @click="seekTo"
              />
              <span class="time-label">{{ song.duration }}</span>
            </div>
          </div>
        </div>

        <!-- Content Sections -->
        <div class="container q-pa-lg">
          <!-- Lyrics Section -->
          <q-card flat class="content-card q-mb-lg">
            <q-card-section>
              <div class="section-header">
                <h3 class="section-title">
                  <q-icon name="lyrics" class="q-mr-sm" />
                  Lyrics
                </h3>
                <q-btn
                  icon="fullscreen"
                  flat
                  round
                  @click="showFullLyrics = true"
                  class="expand-btn"
                />
              </div>
              <div class="lyrics-preview">
                {{ song.lyricsSnippet }}
                <q-btn
                  label="Show More"
                  flat
                  color="primary"
                  @click="showFullLyrics = true"
                  class="q-mt-sm"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- Comments Section -->
          <q-card flat class="content-card q-mb-lg">
            <q-card-section>
              <div class="section-header">
                <h3 class="section-title">
                  <q-icon name="comment" class="q-mr-sm" />
                  Comments ({{ commentCount }})
                </h3>
              </div>
              <comment-section
                :item-id="song.id"
                item-type="song"
                @comment-count-change="updateCommentCount"
              />
            </q-card-section>
          </q-card>

          <!-- Related Content -->
          <q-card flat class="content-card">
            <q-card-section>
              <div class="section-header">
                <h3 class="section-title">
                  <q-icon name="library_music" class="q-mr-sm" />
                  You Might Also Like
                </h3>
              </div>
              <related-content
                type="song"
                :topic="song.topic"
                :current-song-id="song.id"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Dialogs -->
        <!-- Full Lyrics Dialog -->
        <q-dialog v-model="showFullLyrics" maximized>
          <q-card class="lyrics-dialog">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-h6">{{ song.title }} - Lyrics</div>
              <q-space />
              <q-btn icon="close" flat round dense @click="showFullLyrics = false" />
            </q-card-section>
            <q-card-section class="lyrics-content">
              <!-- Full lyrics would be displayed here -->
              <div class="text-body1">
                {{ song.fullLyrics || 'Lyrics not available for this song.' }}
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>

        <!-- Playlist Dialog -->
        <q-dialog v-model="showPlaylistDialog">
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-h6">Add to Playlist</div>
            </q-card-section>
            <q-card-section>
              <q-list>
                <q-item
                  v-for="playlist in userPlaylists"
                  :key="playlist.id"
                  clickable
                  @click="addToPlaylist(playlist.id)"
                >
                  <q-item-section avatar>
                    <q-avatar>
                      <q-img :src="playlist.image" />
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ playlist.name }}</q-item-label>
                    <q-item-label caption>{{ playlist.songCount }} songs</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Cancel" @click="showPlaylistDialog = false" />
              <q-btn flat label="Create New" color="primary" @click="createNewPlaylist" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Share Dialog -->
        <q-dialog v-model="shareDialog">
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-h6">Share Song</div>
            </q-card-section>
            <q-card-section>
              <div class="share-options">
                <q-btn
                  v-for="platform in sharePlatforms"
                  :key="platform.name"
                  :icon="platform.icon"
                  :label="platform.name"
                  flat
                  class="full-width q-mb-sm"
                  @click="shareOn(platform.name)"
                />
              </div>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Close" @click="shareDialog = false" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'EnhancedSongPlayer',
  props: {
    song: {
      type: Object,
      required: true,
      default: () => ({
        id: 1,
        title: 'Sample Song',
        artist: 'Sample Artist',
        coverImage: 'https://via.placeholder.com/400',
        artistImage: 'https://via.placeholder.com/32',
        genre: 'Pop',
        verified: true,
        playCount: 1250000,
        likeCount: 45000,
        duration: '3:42',
        userRating: 4,
        averageRating: 4.2,
        ratingCount: 1520,
        bookmarked: false,
        lyricsSnippet: 'This is a sample lyrics snippet that shows the beginning of the song...',
        fullLyrics: 'Full lyrics would appear here...',
        topic: 'pop-music',
        audioUrl: '#'
      })
    }
  },
  data() {
    return {
      isPlaying: false,
      isPaused: false,
      currentTime: '0:00',
      progressValue: 0,
      showFullLyrics: false,
      showPlaylistDialog: false,
      shareDialog: false,
      commentCount: 0,
      userPlaylists: [
        { id: 1, name: 'My Favorites', songCount: 23, image: 'https://via.placeholder.com/40' },
        { id: 2, name: 'Workout Mix', songCount: 15, image: 'https://via.placeholder.com/40' },
        { id: 3, name: 'Chill Vibes', songCount: 31, image: 'https://via.placeholder.com/40' }
      ],
      sharePlatforms: [
        { name: 'Twitter', icon: 'fab fa-twitter' },
        { name: 'Facebook', icon: 'fab fa-facebook' },
        { name: 'Instagram', icon: 'fab fa-instagram' },
        { name: 'Copy Link', icon: 'link' }
      ]
    }
  },
  computed: {
    heroBackgroundStyle() {
      return {
        backgroundImage: `linear-gradient(45deg,
          rgba(0,0,0,0.8), rgba(0,0,0,0.6)),
          url(${this.song.coverImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    },
    playButtonIcon() {
      if (this.isPlaying) return 'pause'
      return 'play_arrow'
    },
    playButtonLabel() {
      if (this.isPlaying) return 'Pause'
      if (this.isPaused) return 'Resume'
      return 'Play'
    }
  },
  methods: {
    togglePlay() {
      if (this.isPlaying) {
        this.isPlaying = false
        this.isPaused = true
      } else {
        this.isPlaying = true
        this.isPaused = false
        this.simulateProgress()
      }
    },
    simulateProgress() {
      // Simulate audio progress for demo
      if (this.isPlaying && this.progressValue < 1) {
        setTimeout(() => {
          this.progressValue += 0.01
          this.updateCurrentTime()
          this.simulateProgress()
        }, 100)
      }
    },
    updateCurrentTime() {
      const totalSeconds = Math.floor(this.progressValue * 222) // Assuming 3:42 = 222 seconds
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      this.currentTime = `${minutes}:${seconds.toString().padStart(2, '0')}`
    },
    seekTo(event) {
      // Calculate position based on click
      const rect = event.target.getBoundingClientRect()
      const x = event.clientX - rect.left
      this.progressValue = x / rect.width
      this.updateCurrentTime()
    },
    rateSong(rating) {
      // Emit rating event or call API
      this.$emit('rate-song', { songId: this.song.id, rating })
      this.$q.notify({
        message: `Rated ${rating} stars!`,
        color: 'positive',
        icon: 'star'
      })
    },
    toggleBookmark() {
      this.song.bookmarked = !this.song.bookmarked
      this.$q.notify({
        message: this.song.bookmarked ? 'Added to bookmarks' : 'Removed from bookmarks',
        color: 'info',
        icon: this.song.bookmarked ? 'bookmark' : 'bookmark_border'
      })
    },
    addToPlaylist(playlistId) {
      this.showPlaylistDialog = false
      this.$q.notify({
        message: 'Added to playlist!',
        color: 'positive',
        icon: 'queue_music'
      })
    },
    createNewPlaylist() {
      // Logic to create new playlist
      this.showPlaylistDialog = false
      this.$q.notify({
        message: 'Create new playlist functionality would go here',
        color: 'info'
      })
    },
    shareOn(platform) {
      this.shareDialog = false
      this.$q.notify({
        message: `Sharing on ${platform}`,
        color: 'info',
        icon: 'share'
      })
    },
    downloadSong() {
      this.$q.notify({
        message: 'Download started',
        color: 'positive',
        icon: 'download'
      })
    },
    reportSong() {
      this.$q.notify({
        message: 'Song reported',
        color: 'warning',
        icon: 'flag'
      })
    },
    updateCommentCount(count) {
      this.commentCount = count
    },
    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      }
      return num.toString()
    }
  }
}
</script>

<style lang="scss" scoped>
.song-player-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-section {
  position: relative;
  min-height: 60vh;
  background-attachment: fixed;

  .hero-overlay {
    background: linear-gradient(135deg,
      rgba(102, 126, 234, 0.9) 0%,
      rgba(118, 75, 162, 0.9) 100%);
    backdrop-filter: blur(10px);
    min-height: 60vh;
    display: flex;
    align-items: center;
  }
}

.album-art-container {
  position: relative;
  max-width: 400px;
  margin: 0 auto;

  .album-art {
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &.playing {
      transform: scale(1.05);
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
    }

    &:hover .album-art-overlay {
      opacity: 1;
    }
  }

  .album-art-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.3s ease;

    .play-overlay-btn {
      transform: scale(1.2);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
  }
}

.vinyl-record {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, #2c2c2c, #1a1a1a);
  border-radius: 50%;
  transition: transform 0.3s ease;

  &.spinning {
    animation: spin 3s linear infinite;
  }

  .vinyl-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background: #ff6b6b;
    border-radius: 50%;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.song-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;

  .title-char {
    display: inline-block;
    animation: fadeInUp 0.6s ease-out both;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.artist-info {
  display: flex;
  align-items: center;
}

.song-stats {
  display: flex;
  gap: 2rem;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
  }
}

.rating-section {
  .interactive-rating {
    .q-rating__icon {
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.2);
      }
    }
  }
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  .primary-btn {
    padding: 12px 24px;
    border-radius: 50px;
    font-weight: 600;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
    }
  }

  .action-btn {
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 25px;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
    }
  }
}

.progress-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .progress-container {
    display: flex;
    align-items: center;
    gap: 1rem;

    .time-label {
      color: white;
      font-weight: 500;
      min-width: 40px;
      text-align: center;
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      border-radius: 3px;
      cursor: pointer;
      transition: height 0.2s ease;

      &:hover {
        height: 8px;
      }
    }
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.content-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;

  .section-title {
    display: flex;
    align-items: center;
    margin: 0;
    color: #2c3e50;
    font-weight: 600;
  }
}

.lyrics-preview {
  color: #5a6c7d;
  line-height: 1.6;
}

.lyrics-dialog {
  .lyrics-content {
    max-height: 70vh;
    overflow-y: auto;
    line-height: 1.8;
    font-size: 1.1rem;
  }
}

.share-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

// Responsive Design
@media (max-width: 768px) {
  .song-title {
    font-size: 2rem;
  }

  .song-stats {
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-buttons {
    justify-content: center;

    .primary-btn {
      flex: 1;
      min-width: 120px;
    }
  }
}

// Dark mode support
.body--dark {
  .content-card {
    background: rgba(30, 30, 30, 0.95);
    color: white;
  }

  .section-title {
    color: white;
  }

  .lyrics-preview {
    color: rgba(255, 255, 255, 0.7);
  }
}
</style>
