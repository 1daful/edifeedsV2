<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <!-- Header with Search and Notifications -->
    <q-header elevated class="bg-gradient-pink text-white">
      <q-toolbar>
        <q-toolbar-title class="flex items-center">
          <q-icon name="favorite" size="md" class="q-mr-sm" />
          💖 Edifeeds Love
        </q-toolbar-title>

        <q-space />

        <!-- Search Button -->
        <q-btn flat round icon="search" @click="toggleSearch" />

        <!-- Notifications -->
        <q-btn flat round icon="notifications" @click="showNotifications">
          <q-badge v-if="notificationCount > 0" color="red" floating>
            {{ notificationCount }}
          </q-badge>
        </q-btn>

        <!-- Profile Menu -->
        <q-btn flat round icon="account_circle" @click="showProfileMenu" />
      </q-toolbar>

      <!-- Search Bar (Expandable) -->
      <q-toolbar v-if="searchVisible" class="bg-pink-5">
        <q-input
          v-model="searchQuery"
          placeholder="Search profiles, groups, events..."
          filled
          dense
          class="full-width"
          color="white"
          label-color="white"
          @keyup.enter="performSearch"
        >
          <template v-slot:prepend>
            <q-icon name="search" color="white" />
          </template>
          <template v-slot:append>
            <q-btn flat round icon="close" @click="toggleSearch" color="white" />
          </template>
        </q-input>
      </q-toolbar>
    </q-header>

    <!-- Tabs with Enhanced Icons -->
    <q-page-container>
      <q-page>
        <q-tabs
          v-model="tab"
          dense
          class="bg-white text-pink-7 shadow-2"
          align="justify"
          active-color="pink-6"
          indicator-color="pink-6"
        >
          <q-tab name="discover" icon="favorite" class="tab-with-badge">
            <span>Discover</span>
            <q-badge v-if="newProfilesCount > 0" color="red" floating>
              {{ newProfilesCount }}
            </q-badge>
          </q-tab>
          <q-tab name="matches" icon="chat" class="tab-with-badge">
            <span>Matches</span>
            <q-badge v-if="newMatchesCount > 0" color="green" floating>
              {{ newMatchesCount }}
            </q-badge>
          </q-tab>
          <q-tab name="groups" label="Groups" icon="groups" />
          <q-tab name="events" label="Events" icon="event" />
          <q-tab name="profile" label="Profile" icon="person" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated transition-prev="slide-right" transition-next="slide-left">
          <!-- Enhanced Discover Tab -->
          <q-tab-panel name="discover">
            <!-- Filters -->
            <div class="q-pa-md bg-white">
              <q-expansion-item
                icon="tune"
                label="Filters"
                header-class="text-pink-6"
              >
                <div class="row q-col-gutter-md q-pt-md">
                  <div class="col-6">
                    <q-range
                      v-model="ageFilter"
                      :min="18"
                      :max="60"
                      label
                      color="pink-6"
                      label-always
                    />
                    <div class="text-caption text-center q-mt-sm">
                      Age: {{ ageFilter.min }} - {{ ageFilter.max }}
                    </div>
                  </div>
                  <div class="col-6">
                    <q-slider
                      v-model="distanceFilter"
                      :min="1"
                      :max="100"
                      label
                      color="pink-6"
                      label-always
                      suffix=" km"
                    />
                    <div class="text-caption text-center q-mt-sm">
                      Distance: {{ distanceFilter }} km
                    </div>
                  </div>
                  <div class="col-12">
                    <q-select
                      v-model="interestsFilter"
                      :options="interestOptions"
                      label="Interests"
                      multiple
                      use-chips
                      color="pink-6"
                    />
                  </div>
                </div>
              </q-expansion-item>
            </div>

            <!-- Profile Cards with Enhanced Design -->
            <div class="q-pa-md row q-col-gutter-md">
              <div
                v-for="user in filteredProfiles"
                :key="user.id"
                class="col-12 col-sm-6 col-md-4"
              >
                <q-card
                  class="profile-card cursor-pointer"
                  @click="viewProfile(user)"
                  :class="{ 'boosted-card': user.boosted }"
                >
                  <!-- Image with overlay info -->
                  <div class="relative-position">
                    <q-img
                      :src="user.avatar"
                      ratio="4/5"
                      class="rounded-t-borders"
                      loading="lazy"
                    >
                      <!-- Online Status -->
                      <div
                        v-if="user.online"
                        class="absolute-top-left q-ma-sm"
                      >
                        <q-badge color="green" rounded>
                          <q-icon name="fiber_manual_record" size="xs" />
                          Online
                        </q-badge>
                      </div>

                      <!-- Boosted Badge -->
                      <div
                        v-if="user.boosted"
                        class="absolute-top-right q-ma-sm"
                      >
                        <q-badge color="pink-6" rounded>
                          <q-icon name="star" size="xs" class="q-mr-xs" />
                          Boosted
                        </q-badge>
                      </div>

                      <!-- Quick Info Overlay -->
                      <div class="absolute-bottom bg-gradient-dark text-white q-pa-md">
                        <div class="text-h6 text-weight-bold">
                          {{ user.name }}, {{ user.age }}
                        </div>
                        <div class="text-caption">
                          <q-icon name="location_on" size="xs" class="q-mr-xs" />
                          {{ user.distance }}km away
                        </div>
                      </div>
                    </q-img>
                  </div>

                  <q-card-section>
                    <!-- Bio with expandable text -->
                    <div class="text-body2 text-grey-8">
                      {{ user.bio.length > 60 ? user.bio.substring(0, 60) + '...' : user.bio }}
                    </div>

                    <!-- Interests Tags -->
                    <div class="q-mt-sm" v-if="user.interests">
                      <q-chip
                        v-for="interest in user.interests.slice(0, 3)"
                        :key="interest"
                        size="sm"
                        color="pink-1"
                        text-color="pink-7"
                        :label="interest"
                      />
                    </div>

                    <!-- Compatibility Score -->
                    <div class="q-mt-sm flex items-center" v-if="user.compatibility">
                      <q-icon name="favorite" color="pink" size="sm" class="q-mr-xs" />
                      <span class="text-caption text-weight-bold text-pink-6">
                        {{ user.compatibility }}% Match
                      </span>
                    </div>
                  </q-card-section>

                  <!-- Enhanced Action Buttons -->
                  <q-card-actions align="between" class="q-px-md q-pb-md">
                    <q-btn
                      round
                      color="grey-3"
                      text-color="grey-6"
                      icon="close"
                      size="md"
                      @click.stop="passUser(user)"
                      class="action-btn"
                    />
                    <q-btn
                      round
                      color="pink-1"
                      text-color="pink-6"
                      icon="star"
                      size="md"
                      @click.stop="superLikeUser(user)"
                      class="action-btn"
                    />
                    <q-btn
                      round
                      color="pink-6"
                      icon="favorite"
                      size="md"
                      @click.stop="likeUser(user)"
                      class="action-btn"
                    />
                    <q-btn
                      round
                      color="primary"
                      icon="chat"
                      size="md"
                      @click.stop="messageUser(user)"
                      class="action-btn"
                    />
                  </q-card-actions>
                </q-card>
              </div>

              <!-- Load More Button -->
              <div class="col-12 text-center q-mt-md">
                <q-btn
                  v-if="hasMoreProfiles"
                  color="pink-6"
                  label="Load More Profiles"
                  @click="loadMoreProfiles"
                  :loading="loadingMore"
                />
              </div>
            </div>
          </q-tab-panel>

          <!-- Enhanced Matches Tab -->
          <q-tab-panel name="matches">
            <div class="q-pa-md">
              <!-- Recent Matches -->
              <div class="text-h6 text-weight-bold q-mb-md flex items-center">
                <q-icon name="whatshot" color="pink-6" class="q-mr-sm" />
                Recent Matches
              </div>

              <!-- Horizontal scroll for recent matches -->
              <q-scroll-area style="height: 200px" class="q-mb-lg">
                <div class="row no-wrap q-gutter-md">
                  <div
                    v-for="match in recentMatches"
                    :key="'recent-' + match.id"
                    class="col-auto"
                  >
                    <q-card class="recent-match-card cursor-pointer" @click="openChat(match)">
                      <q-img :src="match.avatar" ratio="1" style="width: 100px" />
                      <q-card-section class="q-pa-sm text-center">
                        <div class="text-caption text-weight-bold">{{ match.name }}</div>
                        <div class="text-caption text-grey-6">
                          {{ match.matchTime }}
                        </div>
                      </q-card-section>
                      <q-badge v-if="match.unreadMessages > 0" color="red" floating>
                        {{ match.unreadMessages }}
                      </q-badge>
                    </q-card>
                  </div>
                </div>
              </q-scroll-area>

              <!-- All Matches -->
              <div class="text-h6 text-weight-bold q-mb-md">All Matches</div>
              <div class="row q-col-gutter-md">
                <div
                  v-for="match in matches"
                  :key="match.id"
                  class="col-12 col-sm-6 col-md-4"
                >
                  <q-card class="match-card cursor-pointer" @click="openChat(match)">
                    <q-img :src="match.avatar" ratio="1" class="rounded-t-borders" />
                    <q-card-section>
                      <div class="text-subtitle1 text-weight-bold flex items-center justify-between">
                        <span>{{ match.name }}, {{ match.age }}</span>
                        <q-icon
                          v-if="match.online"
                          name="fiber_manual_record"
                          color="green"
                          size="sm"
                        />
                      </div>
                      <div class="text-caption text-grey-7">
                        {{ match.lastMessage }}
                      </div>
                      <div class="text-caption text-grey-5 q-mt-xs">
                        {{ match.lastMessageTime }}
                      </div>
                    </q-card-section>
                    <q-badge v-if="match.unreadMessages > 0" color="red" floating>
                      {{ match.unreadMessages }}
                    </q-badge>
                  </q-card>
                </div>
              </div>

              <!-- Who Liked You Section -->
              <div class="text-h6 text-weight-bold q-mt-xl q-mb-md flex items-center">
                <q-icon name="favorite" color="pink-6" class="q-mr-sm" />
                Who Liked You
                <q-chip size="sm" color="pink-1" text-color="pink-7" class="q-ml-sm">
                  {{ likes.length }}
                </q-chip>
              </div>
              <div class="row q-col-gutter-md">
                <div
                  v-for="like in likes"
                  :key="like.id"
                  class="col-12 col-sm-6 col-md-4"
                >
                  <q-card class="like-card">
                    <div class="relative-position">
                      <q-img :src="like.avatar" ratio="1" class="rounded-t-borders blur-img" />
                      <div class="absolute-full flex flex-center bg-dark bg-opacity-70 text-white">
                        <div class="text-center">
                          <q-icon name="star" size="lg" color="yellow" class="q-mb-sm" />
                          <div class="text-subtitle1">Premium Feature</div>
                          <div class="text-caption">See who liked you</div>
                        </div>
                      </div>
                    </div>
                    <q-card-actions align="center">
                      <q-btn
                        color="gradient-pink"
                        label="Upgrade Now"
                        @click="upgradePremium"
                        class="full-width"
                      />
                    </q-card-actions>
                  </q-card>
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- Enhanced Groups Tab -->
          <q-tab-panel name="groups">
            <div class="q-pa-md">
              <!-- Category Tabs -->
              <q-tabs
                v-model="groupCategory"
                dense
                align="justify"
                class="text-pink-6 q-mb-md"
                active-color="pink-6"
                indicator-color="pink-6"
              >
                <q-tab name="all" label="All" />
                <q-tab name="spiritual" label="Spiritual" />
                <q-tab name="social" label="Social" />
                <q-tab name="professional" label="Professional" />
              </q-tabs>

              <div class="row q-col-gutter-md">
                <div
                  v-for="group in filteredGroups"
                  :key="group.id"
                  class="col-12 col-sm-6 col-md-4"
                >
                  <q-card class="group-card cursor-pointer" @click="viewGroup(group)">
                    <q-img :src="group.cover" ratio="16/9" class="rounded-t-borders">
                      <!-- Group Type Badge -->
                      <div class="absolute-top-left q-ma-sm">
                        <q-badge :color="group.private ? 'orange' : 'green'" rounded>
                          {{ group.private ? 'Private' : 'Public' }}
                        </q-badge>
                      </div>

                      <!-- Group Title Overlay -->
                      <div class="absolute-bottom bg-gradient-dark text-white q-pa-md">
                        <div class="text-subtitle1 text-weight-bold">{{ group.title }}</div>
                      </div>
                    </q-img>

                    <q-card-section>
                      <div class="text-body2 text-grey-8 ellipsis-2-lines">
                        {{ group.description }}
                      </div>

                      <!-- Activity Level -->
                      <div class="q-mt-sm flex items-center">
                        <q-icon name="trending_up" size="sm" :color="group.activityColor" class="q-mr-xs" />
                        <span class="text-caption" :class="`text-${group.activityColor}`">
                          {{ group.activity }} activity
                        </span>
                      </div>
                    </q-card-section>

                    <q-separator />

                    <q-card-actions align="between">
                      <div class="flex items-center">
                        <q-icon name="groups" size="sm" color="grey-6" class="q-mr-xs" />
                        <span class="text-caption text-grey-6">{{ group.members }} members</span>
                      </div>

                      <q-btn
                        v-if="!group.joined"
                        flat
                        dense
                        color="pink-6"
                        label="Join"
                        @click.stop="joinGroup(group)"
                      />
                      <q-chip v-else size="sm" color="green" text-color="white" icon="check">
                        Joined
                      </q-chip>
                    </q-card-actions>
                  </q-card>
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- Enhanced Events Tab -->
          <q-tab-panel name="events">
            <div class="q-pa-md">
              <!-- Event Categories -->
              <q-tabs
                v-model="eventCategory"
                dense
                align="justify"
                class="text-pink-6 q-mb-md"
                active-color="pink-6"
                indicator-color="pink-6"
              >
                <q-tab name="upcoming" label="Upcoming" />
                <q-tab name="popular" label="Popular" />
                <q-tab name="nearby" label="Nearby" />
                <q-tab name="virtual" label="Virtual" />
              </q-tabs>

              <div v-for="event in filteredEvents" :key="event.id" class="q-mb-md">
                <q-card class="event-card">
                  <q-img :src="event.banner" ratio="16/9" class="rounded-t-borders">
                    <!-- Event Type Badges -->
                    <div class="absolute-top-right q-ma-sm">
                      <q-badge v-if="event.sponsored" color="pink-6" rounded class="q-mb-xs">
                        <q-icon name="star" size="xs" class="q-mr-xs" />
                        Sponsored
                      </q-badge>
                      <q-badge v-if="event.virtual" color="purple" rounded>
                        <q-icon name="videocam" size="xs" class="q-mr-xs" />
                        Virtual
                      </q-badge>
                    </div>

                    <!-- Quick Actions -->
                    <div class="absolute-top-left q-ma-sm">
                      <q-btn
                        v-if="!event.saved"
                        round
                        flat
                        icon="bookmark_border"
                        color="white"
                        @click.stop="saveEvent(event)"
                        class="bg-dark bg-opacity-50"
                      />
                      <q-btn
                        v-else
                        round
                        flat
                        icon="bookmark"
                        color="pink-6"
                        @click.stop="unsaveEvent(event)"
                        class="bg-white bg-opacity-90"
                      />
                    </div>
                  </q-img>

                  <q-card-section>
                    <div class="text-h6 text-weight-bold">{{ event.title }}</div>

                    <div class="row q-col-gutter-sm q-mt-sm">
                      <div class="col-6">
                        <div class="flex items-center text-grey-7">
                          <q-icon name="schedule" size="sm" class="q-mr-xs" />
                          <span class="text-caption">{{ event.date }}</span>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="flex items-center text-grey-7">
                          <q-icon name="location_on" size="sm" class="q-mr-xs" />
                          <span class="text-caption">{{ event.location }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Attendees Preview -->
                    <div class="q-mt-md flex items-center">
                      <q-avatar-group max="4" size="sm" class="q-mr-sm">
                        <q-avatar v-for="attendee in event.attendees?.slice(0, 4)" :key="attendee.id">
                          <img :src="attendee.avatar" />
                        </q-avatar>
                      </q-avatar-group>
                      <span class="text-caption text-grey-6">
                        {{ event.attendeeCount }} attending
                      </span>
                    </div>

                    <div class="text-body2 text-grey-8 q-mt-sm">
                      {{ event.description }}
                    </div>
                  </q-card-section>

                  <q-separator />

                  <q-card-actions align="between">
                    <div class="flex items-center">
                      <q-chip
                        v-if="event.free"
                        size="sm"
                        color="green"
                        text-color="white"
                        icon="check"
                        label="Free"
                      />
                      <q-chip
                        v-else
                        size="sm"
                        color="pink-1"
                        text-color="pink-7"
                        :label="event.price"
                      />
                    </div>

                    <div>
                      <q-btn
                        v-if="!event.registered"
                        color="pink-6"
                        :label="event.free ? 'RSVP Free' : 'Get Ticket'"
                        @click="event.free ? rsvpEvent(event) : buyTicket(event)"
                      />
                      <q-chip v-else color="green" text-color="white" icon="check">
                        Registered
                      </q-chip>
                    </div>
                  </q-card-actions>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- New Profile Tab -->
          <q-tab-panel name="profile">
            <div class="q-pa-md">
              <q-card class="profile-overview-card">
                <div class="relative-position">
                  <q-img :src="currentUser.avatar" ratio="16/9" class="rounded-t-borders" />
                  <div class="absolute-bottom bg-gradient-dark text-white q-pa-md">
                    <div class="text-h5 text-weight-bold">{{ currentUser.name }}, {{ currentUser.age }}</div>
                    <div class="text-body2">{{ currentUser.bio }}</div>
                  </div>
                  <q-btn
                    round
                    flat
                    icon="edit"
                    color="white"
                    class="absolute-top-right q-ma-md bg-dark bg-opacity-50"
                    @click="editProfile"
                  />
                </div>

                <q-card-section>
                  <!-- Profile Stats -->
                  <div class="row q-col-gutter-md text-center">
                    <div class="col-3">
                      <div class="text-h6 text-weight-bold text-pink-6">{{ profileStats.likes }}</div>
                      <div class="text-caption text-grey-6">Likes</div>
                    </div>
                    <div class="col-3">
                      <div class="text-h6 text-weight-bold text-pink-6">{{ profileStats.matches }}</div>
                      <div class="text-caption text-grey-6">Matches</div>
                    </div>
                    <div class="col-3">
                      <div class="text-h6 text-weight-bold text-pink-6">{{ profileStats.views }}</div>
                      <div class="text-caption text-grey-6">Views</div>
                    </div>
                    <div class="col-3">
                      <div class="text-h6 text-weight-bold text-pink-6">{{ profileStats.messages }}</div>
                      <div class="text-caption text-grey-6">Messages</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Profile Options -->
              <div class="q-mt-md">
                <q-list bordered class="rounded-borders">
                  <q-item clickable @click="editProfile">
                    <q-item-section avatar>
                      <q-icon name="edit" color="pink-6" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Edit Profile</q-item-label>
                      <q-item-label caption>Update your photos and info</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon name="chevron_right" color="grey-5" />
                    </q-item-section>
                  </q-item>

                  <q-separator />

                  <q-item clickable @click="manageSubscription">
                    <q-item-section avatar>
                      <q-icon name="star" color="yellow-7" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Premium Subscription</q-item-label>
                      <q-item-label caption>Unlock premium features</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-chip size="sm" color="pink-6" text-color="white">
                        Upgrade
                      </q-chip>
                    </q-item-section>
                  </q-item>

                  <q-separator />

                  <q-item clickable @click="privacySettings">
                    <q-item-section avatar>
                      <q-icon name="privacy_tip" color="blue-6" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Privacy & Safety</q-item-label>
                      <q-item-label caption>Control who can see your profile</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon name="chevron_right" color="grey-5" />
                    </q-item-section>
                  </q-item>

                  <q-separator />

                  <q-item clickable @click="helpSupport">
                    <q-item-section avatar>
                      <q-icon name="help" color="green-6" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Help & Support</q-item-label>
                      <q-item-label caption>Get help or contact us</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon name="chevron_right" color="grey-5" />
                    </q-item-section>
                  </q-item>

                  <q-separator />

                  <q-item clickable @click="logout">
                    <q-item-section avatar>
                      <q-icon name="logout" color="red-6" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Logout</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

// Reactive state
const tab = ref("discover");
const searchVisible = ref(false);
const searchQuery = ref("");
const groupCategory = ref("all");
const eventCategory = ref("upcoming");

// Filters
const ageFilter = ref({ min: 22, max: 35 });
const distanceFilter = ref(25);
const interestsFilter = ref([]);

// Counters and loading states
const notificationCount = ref(3);
const newProfilesCount = ref(5);
const newMatchesCount = ref(2);
const hasMoreProfiles = ref(true);
const loadingMore = ref(false);

// Interest options
const interestOptions = [
  "Prayer", "Worship", "Bible Study", "Missions", "Youth Ministry",
  "Music", "Sports", "Reading", "Travel", "Cooking", "Fitness"
];

// Current user profile
const currentUser = ref({
  name: "You",
  age: 28,
  bio: "Living for Christ ✝️ | Music lover 🎵 | Adventure seeker 🌟",
  avatar: "https://source.unsplash.com/400x400/?person,portrait"
});

// Profile statistics
const profileStats = ref({
  likes: 245,
  matches: 28,
  views: 1200,
  messages: 156
});

/* --- Enhanced Discover data --- */
const profiles = ref([
  {
    id: 2,
    name: "David",
    age: 29,
    bio: "Worship leader ✝️ | Tech enthusiast 💻 | Hiking ⛰️ | Passionate about discipleship",
    avatar: "https://source.unsplash.com/400x500/?man,portrait",
    boosted: false,
    online: false,
    distance: 7.5,
    interests: ["Worship", "Sports", "Travel"],
    compatibility: 76,
    verified: true
  },
  {
    id: 3,
    name: "Grace",
    age: 24,
    bio: "Youth pastor 🙏 | Coffee addict ☕ | Love serving others | Matthew 5:16",
    avatar: "https://source.unsplash.com/400x500/?woman,christian",
    boosted: false,
    online: true,
    distance: 12.1,
    interests: ["Youth Ministry", "Coffee", "Reading"],
    compatibility: 82,
    verified: false
  },
  {
    id: 4,
    name: "Michael",
    age: 31,
    bio: "Missionary 🌍 | Adventure seeker | Guitar player 🎸 | Building God's kingdom",
    avatar: "https://source.unsplash.com/400x500/?man,adventure",
    boosted: true,
    online: false,
    distance: 5.8,
    interests: ["Missions", "Music", "Adventure"],
    compatibility: 91,
    verified: true
  },
  {
    id: 5,
    name: "Joy",
    age: 27,
    bio: "Children's ministry coordinator 👶 | Baker 🧁 | Psalm 46:10 - Be still and know",
    avatar: "https://source.unsplash.com/400x500/?woman,joy",
    boosted: false,
    online: true,
    distance: 15.3,
    interests: ["Children Ministry", "Baking", "Prayer"],
    compatibility: 78,
    verified: true
  }
]);

/* --- Enhanced Matches data --- */
const recentMatches = ref([
  {
    id: 101,
    name: "Grace",
    avatar: "https://source.unsplash.com/400x400/?woman,portrait",
    matchTime: "2 hours ago",
    unreadMessages: 2,
    online: true
  },
  {
    id: 102,
    name: "Daniel",
    avatar: "https://source.unsplash.com/400x400/?man,smile",
    matchTime: "1 day ago",
    unreadMessages: 0,
    online: false
  },
  {
    id: 103,
    name: "Faith",
    avatar: "https://source.unsplash.com/400x400/?woman,faith",
    matchTime: "3 days ago",
    unreadMessages: 5,
    online: true
  }
]);

const matches = ref([
  {
    id: 1,
    name: "Grace",
    age: 27,
    bio: "Youth leader ✝️ | Loves missions 🌍",
    avatar: "https://source.unsplash.com/400x400/?woman,portrait",
    lastMessage: "That's amazing! I'd love to hear more about your mission trip.",
    lastMessageTime: "2 hours ago",
    unreadMessages: 2,
    online: true
  },
  {
    id: 2,
    name: "Daniel",
    age: 30,
    bio: "Pastor | Coffee enthusiast ☕",
    avatar: "https://source.unsplash.com/400x400/?man,pastor",
    lastMessage: "Thanks for the prayer request, I'll be praying for you!",
    lastMessageTime: "1 day ago",
    unreadMessages: 0,
    online: false
  },
  {
    id: 3,
    name: "Faith",
    age: 25,
    bio: "Missionary kid | Love adventures 🌟",
    avatar: "https://source.unsplash.com/400x400/?woman,adventure",
    lastMessage: "Would you like to join our Bible study group?",
    lastMessageTime: "3 days ago",
    unreadMessages: 5,
    online: true
  }
]);

const likes = ref([
  {
    id: 201,
    avatar: "https://source.unsplash.com/400x400/?portrait,1",
    preview: "Someone special liked you!"
  },
  {
    id: 202,
    avatar: "https://source.unsplash.com/400x400/?portrait,2",
    preview: "New like received!"
  },
  {
    id: 203,
    avatar: "https://source.unsplash.com/400x400/?portrait,3",
    preview: "You have a secret admirer!"
  }
]);

/* --- Enhanced Groups data --- */
const groups = ref([
  {
    id: 1,
    title: "Prayer Partners 🙏",
    description: "Connect with others for daily prayer support and encouragement. Share requests and testimonies.",
    cover: "https://source.unsplash.com/800x400/?prayer,faith",
    members: 124,
    category: "spiritual",
    private: false,
    activity: "High",
    activityColor: "green",
    joined: false
  },
  {
    id: 2,
    title: "Faith & Entrepreneurs 💼✝️",
    description: "Discuss business, faith, and balancing your calling in the marketplace.",
    cover: "https://source.unsplash.com/800x400/?business,teamwork",
    members: 72,
    category: "professional",
    private: true,
    activity: "Medium",
    activityColor: "orange",
    joined: true
  },
  {
    id: 3,
    title: "Young Adults Fellowship",
    description: "Ages 18-35 gathering for fellowship, games, and spiritual growth.",
    cover: "https://source.unsplash.com/800x400/?young,people",
    members: 89,
    category: "social",
    private: false,
    activity: "High",
    activityColor: "green",
    joined: false
  },
  {
    id: 4,
    title: "Worship Musicians Network",
    description: "Connect with other musicians, share resources, and collaborate on worship.",
    cover: "https://source.unsplash.com/800x400/?music,worship",
    members: 156,
    category: "spiritual",
    private: false,
    activity: "Very High",
    activityColor: "green-8",
    joined: true
  }
]);

/* --- Enhanced Events data --- */
const events = ref([
  {
    id: 1,
    title: "Online Prayer Night 🙏",
    date: "Aug 25, 2025",
    location: "Zoom",
    description: "Join believers across the globe for a night of prayer and worship. Special guest speakers and live music.",
    banner: "https://source.unsplash.com/800x400/?prayer,church",
    free: true,
    sponsored: false,
    virtual: true,
    attendeeCount: 234,
    attendees: [
      { id: 1, avatar: "https://source.unsplash.com/100x100/?person,1" },
      { id: 2, avatar: "https://source.unsplash.com/100x100/?person,2" },
      { id: 3, avatar: "https://source.unsplash.com/100x100/?person,3" }
    ],
    saved: false,
    registered: false
  },
  {
    id: 2,
    title: "Faith & Love Retreat 💖",
    date: "Sept 10-12, 2025",
    location: "Lagos, Nigeria",
    description: "A 3-day singles retreat with teachings, worship, and fellowship. Includes meals and accommodation.",
    banner: "https://source.unsplash.com/800x400/?retreat,beach",
    free: false,
    price: "$30",
    sponsored: true,
    virtual: false,
    attendeeCount: 45,
    attendees: [
      { id: 4, avatar: "https://source.unsplash.com/100x100/?person,4" },
      { id: 5, avatar: "https://source.unsplash.com/100x100/?person,5" }
    ],
    saved: true,
    registered: false
  },
  {
    id: 3,
    title: "Christian Singles Game Night",
    date: "Aug 22, 2025",
    location: "Community Center, Victoria Island",
    description: "Fun evening of games, food, and fellowship for Christian singles. Ages 25-40.",
    banner: "https://source.unsplash.com/800x400/?games,fun",
    free: true,
    sponsored: false,
    virtual: false,
    attendeeCount: 67,
    attendees: [
      { id: 6, avatar: "https://source.unsplash.com/100x100/?person,6" },
      { id: 7, avatar: "https://source.unsplash.com/100x100/?person,7" },
      { id: 8, avatar: "https://source.unsplash.com/100x100/?person,8" }
    ],
    saved: false,
    registered: true
  },
  {
    id: 4,
    title: "Worship & Arts Conference",
    date: "Oct 5-7, 2025",
    location: "Abuja Convention Center",
    description: "Three days of workshops, performances, and networking for creative Christians.",
    banner: "https://source.unsplash.com/800x400/?worship,art",
    free: false,
    price: "$75",
    sponsored: true,
    virtual: false,
    attendeeCount: 189,
    attendees: [
      { id: 9, avatar: "https://source.unsplash.com/100x100/?person,9" },
      { id: 10, avatar: "https://source.unsplash.com/100x100/?person,10" }
    ],
    saved: true,
    registered: false
  }
]);

/* --- Computed Properties --- */
const filteredProfiles = computed(() => {
  return profiles.value.filter(profile => {
    // Age filter
    if (profile.age < ageFilter.value.min || profile.age > ageFilter.value.max) {
      return false;
    }

    // Distance filter
    if (profile.distance > distanceFilter.value) {
      return false;
    }

    // Interests filter
    if (interestsFilter.value.length > 0) {
      const hasMatchingInterest = interestsFilter.value.some(interest =>
        profile.interests.includes(interest)
      );
      if (!hasMatchingInterest) {
        return false;
      }
    }

    // Search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      return profile.name.toLowerCase().includes(query) ||
             profile.bio.toLowerCase().includes(query) ||
             profile.interests.some(interest => interest.toLowerCase().includes(query));
    }

    return true;
  });
});

const filteredGroups = computed(() => {
  if (groupCategory.value === "all") {
    return groups.value;
  }
  return groups.value.filter(group => group.category === groupCategory.value);
});

const filteredEvents = computed(() => {
  if (eventCategory.value === "upcoming") {
    return events.value;
  } else if (eventCategory.value === "virtual") {
    return events.value.filter(event => event.virtual);
  } else if (eventCategory.value === "popular") {
    return events.value.sort((a, b) => b.attendeeCount - a.attendeeCount);
  } else if (eventCategory.value === "nearby") {
    return events.value.filter(event => !event.virtual);
  }
  return events.value;
});

/* --- Methods --- */
const toggleSearch = () => {
  searchVisible.value = !searchVisible.value;
  if (!searchVisible.value) {
    searchQuery.value = "";
  }
};

const performSearch = () => {
  console.log("Searching for:", searchQuery.value);
};

const showNotifications = () => {
  console.log("Show notifications");
};

const showProfileMenu = () => {
  console.log("Show profile menu");
};

// Profile actions
const viewProfile = (user) => {
  console.log("View profile:", user.name);
};

const likeUser = (user) => {
  console.log("Liked:", user.name);
  // Add animation or feedback here
};

const passUser = (user) => {
  console.log("Passed:", user.name);
  // Remove from filtered list or add animation
};

const superLikeUser = (user) => {
  console.log("Super liked:", user.name);
  // Special animation for super like
};

const messageUser = (user) => {
  console.log("Message:", user.name);
};

const loadMoreProfiles = async () => {
  loadingMore.value = true;
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Add more profiles (in real app, fetch from API)
  const newProfiles = [
    {
      id: profiles.value.length + 1,
      name: "Hope",
      age: 26,
      bio: "Art teacher 🎨 | Love creating beautiful things for God",
      avatar: "https://source.unsplash.com/400x500/?woman,art",
      boosted: false,
      online: true,
      distance: 8.2,
      interests: ["Art", "Teaching", "Prayer"],
      compatibility: 85,
      verified: true
    }
  ];

  profiles.value.push(...newProfiles);
  loadingMore.value = false;

  // Check if there are more profiles to load
  if (profiles.value.length > 20) {
    hasMoreProfiles.value = false;
  }
};

// Match actions
const openChat = (match) => {
  console.log("Open chat with:", match.name);
};

// Group actions
const viewGroup = (group) => {
  console.log("View group:", group.title);
};

const joinGroup = (group) => {
  console.log("Join group:", group.title);
  group.joined = true;
  group.members += 1;
};

// Event actions
const viewEvent = (event) => {
  console.log("View event:", event.title);
};

const rsvpEvent = (event) => {
  console.log("RSVP:", event.title);
  event.registered = true;
  event.attendeeCount += 1;
};

const buyTicket = (event) => {
  console.log("Buy ticket:", event.title);
};

const saveEvent = (event) => {
  console.log("Save event:", event.title);
  event.saved = true;
};

const unsaveEvent = (event) => {
  console.log("Unsave event:", event.title);
  event.saved = false;
};

// Profile management
const editProfile = () => {
  console.log("Edit profile");
};

const manageSubscription = () => {
  console.log("Manage subscription");
};

const privacySettings = () => {
  console.log("Privacy settings");
};

const helpSupport = () => {
  console.log("Help & support");
};

const logout = () => {
  console.log("Logout");
};

const upgradePremium = () => {
  console.log("Upgrade premium...");
};

/* --- Lifecycle --- */
onMounted(() => {
  console.log("App mounted");
  // Initialize app, load user data, etc.
});
</script>

<style scoped>
/* Enhanced Styling */
.bg-gradient-pink {
  background: linear-gradient(135deg, #e91e63, #f06292);
}

.bg-gradient-dark {
  background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2));
}

.profile-card {
  border-radius: 20px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(233, 30, 99, 0.2);
}

.boosted-card {
  border: 2px solid #e91e63;
  box-shadow: 0 0 20px rgba(233, 30, 99, 0.3);
}

.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

.match-card {
  border-radius: 15px;
  transition: all 0.3s ease;
  position: relative;
}

.match-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
}

.recent-match-card {
  border-radius: 15px;
  width: 120px;
  transition: all 0.2s ease;
}

.recent-match-card:hover {
  transform: scale(1.05);
}

.group-card {
  border-radius: 15px;
  transition: all 0.3s ease;
}

.group-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
}

.event-card {
  border-radius: 15px;
  transition: all 0.3s ease;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.like-card {
  border-radius: 15px;
  position: relative;
}

.profile-overview-card {
  border-radius: 20px;
  overflow: hidden;
}

.blur-img {
  filter: blur(8px);
}

.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-with-badge {
  position: relative;
}

.rounded-borders {
  border-radius: 20px;
}

.rounded-t-borders {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

/* Loading animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.loading-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .profile-card {
    margin-bottom: 1rem;
  }

  .action-btn {
    padding: 8px;
  }
}

/* Dark theme support */
.body--dark .profile-card {
  background: #1e1e1e;
  border: 1px solid #333;
}

.body--dark .match-card {
  background: #1e1e1e;
  border: 1px solid #333;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #e91e63;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #d81b60;
}
</style>
