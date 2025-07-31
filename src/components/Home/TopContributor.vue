<template>
  <div class="top-creators">
    <div class="header">
      <h2 class="title">Top Creators & Ministries</h2>
      <p class="subtitle">Discover inspiring Christian content from featured creators and ministries</p>
    </div>

    <div class="creators-container">
      <div class="creators-scroll" ref="creatorsScroll">
        <div
          v-for="creator in creators"
          :key="creator.id"
          class="creator-card"
          @click="viewCreator(creator)"
        >
          <div class="creator-header">
            <div class="profile-image">
              <img :src="creator.profileImage" :alt="creator.name" />
              <div class="verified-badge" v-if="creator.verified">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div class="creator-info">
              <h3 class="creator-name">{{ creator.name }}</h3>
              <p class="creator-type">{{ creator.type }}</p>
              <div class="creator-stats">
                <span class="followers">{{ formatFollowers(creator.followers) }} followers</span>
                <span class="content-count">{{ creator.contentCount }} posts</span>
              </div>
            </div>
          </div>

          <div class="sample-content">
            <h4 class="sample-title">Latest Content</h4>
            <div class="content-list">
              <div
                v-for="content in creator.sampleContent"
                :key="content.id"
                class="content-item"
              >
                <div class="content-thumbnail" v-if="content.thumbnail">
                  <img :src="content.thumbnail" :alt="content.title" />
                </div>
                <div class="content-details">
                  <p class="content-title">{{ content.title }}</p>
                  <span class="content-date">{{ formatDate(content.date) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="creator-actions">
            <button class="follow-btn" :class="{ following: creator.isFollowing }" @click.stop="toggleFollow(creator)">
              {{ creator.isFollowing ? 'Following' : 'Follow' }}
            </button>
            <button class="view-btn" @click.stop="viewCreator(creator)">
              View Profile
            </button>
          </div>
        </div>
      </div>

      <!-- Scroll navigation buttons -->
      <button class="scroll-btn scroll-left" @click="scrollLeft" :disabled="!canScrollLeft">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
      </button>
      <button class="scroll-btn scroll-right" @click="scrollRight" :disabled="!canScrollRight">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>
      </button>
    </div>

    <div class="view-all">
      <button class="view-all-btn" @click="viewAllCreators">
        View All Creators
      </button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'TopCreators',
  data() {
    return {
      canScrollLeft: false,
      canScrollRight: true,
      creators: [
        {
          id: 1,
          name: 'Pastor John Smith',
          type: 'Ministry Leader',
          profileImage: 'https://via.placeholder.com/80x80/4A90E2/FFFFFF?text=JS',
          verified: true,
          followers: 125000,
          contentCount: 342,
          isFollowing: false,
          sampleContent: [
            {
              id: 1,
              title: 'Finding Hope in Difficult Times',
              date: '2024-06-28',
              thumbnail: 'https://via.placeholder.com/60x40/E8F4FD/4A90E2?text=Video'
            },
            {
              id: 2,
              title: 'The Power of Prayer in Daily Life',
              date: '2024-06-25',
              thumbnail: 'https://via.placeholder.com/60x40/F0F8FF/5B9BD5?text=Audio'
            },
            {
              id: 3,
              title: 'Walking in Faith: A Weekly Devotional',
              date: '2024-06-22',
              thumbnail: 'https://via.placeholder.com/60x40/FFF8E1/FFB74D?text=Blog'
            }
          ]
        },
        {
          id: 2,
          name: 'Grace Community Church',
          type: 'Local Church',
          profileImage: 'https://via.placeholder.com/80x80/8BC34A/FFFFFF?text=GCC',
          verified: true,
          followers: 89000,
          contentCount: 156,
          isFollowing: true,
          sampleContent: [
            {
              id: 4,
              title: 'Sunday Service: The Good Shepherd',
              date: '2024-06-30',
              thumbnail: 'https://via.placeholder.com/60x40/E8F5E8/8BC34A?text=Live'
            },
            {
              id: 5,
              title: 'Youth Group Bible Study',
              date: '2024-06-27',
              thumbnail: 'https://via.placeholder.com/60x40/F3E5F5/AB47BC?text=Study'
            }
          ]
        },
        {
          id: 3,
          name: 'Sarah Williams',
          type: 'Christian Blogger',
          profileImage: 'https://via.placeholder.com/80x80/FF9800/FFFFFF?text=SW',
          verified: false,
          followers: 45000,
          contentCount: 287,
          isFollowing: false,
          sampleContent: [
            {
              id: 6,
              title: 'Motherhood and Faith: My Journey',
              date: '2024-06-29',
              thumbnail: 'https://via.placeholder.com/60x40/FFF3E0/FF9800?text=Blog'
            },
            {
              id: 7,
              title: 'Scripture Memorization Tips',
              date: '2024-06-26',
              thumbnail: 'https://via.placeholder.com/60x40/E8F5E8/4CAF50?text=Tips'
            }
          ]
        },
        {
          id: 4,
          name: 'David Martinez',
          type: 'Youth Pastor',
          profileImage: 'https://via.placeholder.com/80x80/9C27B0/FFFFFF?text=DM',
          verified: true,
          followers: 67000,
          contentCount: 198,
          isFollowing: false,
          sampleContent: [
            {
              id: 8,
              title: 'Engaging Youth in Faith',
              date: '2024-06-28',
              thumbnail: 'https://via.placeholder.com/60x40/F3E5F5/9C27B0?text=Youth'
            }
          ]
        },
        {
          id: 5,
          name: 'Faith Fellowship',
          type: 'Mega Church',
          profileImage: 'https://via.placeholder.com/80x80/FF5722/FFFFFF?text=FF',
          verified: true,
          followers: 234000,
          contentCount: 567,
          isFollowing: true,
          sampleContent: [
            {
              id: 9,
              title: 'Weekly Worship Service',
              date: '2024-06-30',
              thumbnail: 'https://via.placeholder.com/60x40/FFF3E0/FF5722?text=Worship'
            }
          ]
        }
      ]
    }
  },
  mounted() {
    this.updateScrollButtons()
    this.$refs.creatorsScroll.addEventListener('scroll', this.updateScrollButtons)
  },
  beforeUnmount() {
    this.$refs.creatorsScroll?.removeEventListener('scroll', this.updateScrollButtons)
  },
  methods: {
    formatFollowers(count) {
      if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M'
      } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K'
      }
      return count.toString()
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) return 'Yesterday'
      if (diffDays <= 7) return `${diffDays} days ago`
      return date.toLocaleDateString()
    },
    toggleFollow(creator) {
      creator.isFollowing = !creator.isFollowing
      this.$emit('follow-toggled', { creatorId: creator.id, isFollowing: creator.isFollowing })
    },
    viewCreator(creator) {
      this.$emit('view-creator', creator)
    },
    viewAllCreators() {
      this.$emit('view-all-creators')
    },
    scrollLeft() {
      const container = this.$refs.creatorsScroll
      container.scrollBy({
        left: -380,
        behavior: 'smooth'
      })
    },
    scrollRight() {
      const container = this.$refs.creatorsScroll
      container.scrollBy({
        left: 380,
        behavior: 'smooth'
      })
    },
    updateScrollButtons() {
      const container = this.$refs.creatorsScroll
      if (container) {
        this.canScrollLeft = container.scrollLeft > 0
        this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth)
      }
    }
  }
}
</script>

<style scoped>
.top-creators {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  max-width: 600px;
  margin: 0 auto;
}

.creators-container {
  position: relative;
  margin-bottom: 3rem;
}

.creators-scroll {
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 1rem 0;
  scroll-behavior: smooth;
}

.creators-scroll::-webkit-scrollbar {
  display: none;
}

.creator-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8e8e8;
  transition: all 0.3s ease;
  cursor: pointer;
  flex: 0 0 350px;
  min-height: 400px;
}

.creator-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.creator-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.profile-image {
  position: relative;
  margin-right: 1rem;
  flex-shrink: 0;
}

.profile-image img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f8f9fa;
}

.verified-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: #4A90E2;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.creator-info {
  flex: 1;
}

.creator-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.creator-type {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.creator-stats {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #95a5a6;
}

.sample-content {
  margin-bottom: 1.5rem;
}

.sample-title {
  font-size: 1rem;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 0.75rem;
}

.content-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.content-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.content-item:hover {
  background: #e9ecef;
}

.content-thumbnail {
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.content-thumbnail img {
  width: 50px;
  height: 35px;
  border-radius: 4px;
  object-fit: cover;
}

.content-details {
  flex: 1;
  min-width: 0;
}

.content-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content-date {
  font-size: 0.8rem;
  color: #95a5a6;
}

.creator-actions {
  display: flex;
  gap: 0.75rem;
}

.follow-btn, .view-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.follow-btn {
  background: #4A90E2;
  color: white;
}

.follow-btn:hover {
  background: #357ABD;
}

.follow-btn.following {
  background: #27ae60;
}

.follow-btn.following:hover {
  background: #219a52;
}

.view-btn {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.view-btn:hover {
  background: #e9ecef;
}

.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.scroll-btn:hover:not(:disabled) {
  background: #f8f9fa;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.scroll-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.scroll-left {
  left: -25px;
}

.scroll-right {
  right: -25px;
}

.view-all {
  text-align: center;
}

.view-all-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.view-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .top-creators {
    padding: 1rem;
  }

  .title {
    font-size: 2rem;
  }

  .creator-card {
    flex: 0 0 280px;
  }

  .creator-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-image {
    margin-right: 0;
    margin-bottom: 1rem;
  }

  .creator-actions {
    flex-direction: column;
  }

  .scroll-btn {
    width: 40px;
    height: 40px;
  }

  .scroll-left {
    left: -20px;
  }

  .scroll-right {
    right: -20px;
  }
}

@media (max-width: 480px) {
  .scroll-btn {
    display: none;
  }

  .creators-scroll {
    padding: 1rem 1rem;
  }
}
</style>
