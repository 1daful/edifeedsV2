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
          <q-tab name="matches" icon="favorite_border" class="tab-with-badge">
            <span>Matches</span>
            <q-badge v-if="newMatchesCount > 0" color="green" floating>
              {{ newMatchesCount }}
            </q-badge>
          </q-tab>
          <q-tab name="messages" icon="chat" class="tab-with-badge">
            <span>Messages</span>
            <q-badge v-if="unreadMessagesCount > 0" color="red" floating>
              {{ unreadMessagesCount }}
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

                    </q-img>
                  </div>

                  <q-card-section>
                      <!-- Quick Info -->
                      <div class=" bg-gradient-dark text-white q-pa-md">
                        <div class="text-h6 text-weight-bold">
                          {{ user.display_name }}, {{ user.age }}
                        </div>
                        <div class="text-caption">
                          <q-icon name="location_on" size="xs" class="q-mr-xs" />
                          {{ user.distance }}km away
                        </div>
                      </div>
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

          <!-- New Messages Tab -->
          <q-tab-panel name="messages">
            <div class="q-pa-md">
              <!-- Search Messages -->
              <div class="q-mb-md">
                <q-input
                  v-model="messageSearchQuery"
                  placeholder="Search conversations..."
                  filled
                  dense
                  color="pink-6"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>

              <!-- Active Conversations -->
              <div class="text-h6 text-weight-bold q-mb-md flex items-center">
                <q-icon name="chat_bubble" color="pink-6" class="q-mr-sm" />
                Messages
                <q-chip size="sm" color="pink-1" text-color="pink-7" class="q-ml-sm">
                  {{ conversations.length }}
                </q-chip>
              </div>

              <div class="row q-col-gutter-md">
                <div
                  v-for="conversation in filteredConversations"
                  :key="conversation.id"
                  class="col-12"
                >
                  <q-card
                    class="conversation-card cursor-pointer"
                    @click="openConversation(conversation)"
                    :class="{ 'unread-conversation': conversation.unreadCount > 0 }"
                  >
                    <q-card-section class="row items-center no-wrap">
                      <!-- Avatar with online status -->
                      <div class="relative-position q-mr-md">
                        <q-avatar size="60px">
                          <img :src="conversation.avatar" />
                        </q-avatar>
                        <q-icon
                          v-if="conversation.online"
                          name="fiber_manual_record"
                          color="green"
                          size="sm"
                          class="absolute-bottom-right"
                        />
                      </div>

                      <!-- Conversation Details -->
                      <div class="col">
                        <div class="row items-center justify-between">
                          <div class="text-subtitle1 text-weight-bold">
                            {{ conversation.name }}, {{ conversation.age }}
                          </div>
                          <div class="text-caption text-grey-6">
                            {{ conversation.lastMessageTime }}
                          </div>
                        </div>

                        <!-- Typing indicator or last message -->
                        <div class="row items-center q-mt-xs">
                          <div class="col">
                            <div v-if="conversation.isTyping" class="text-body2 text-pink-6 flex items-center">
                              <q-icon name="edit" size="sm" class="q-mr-xs" />
                              <span class="typing-indicator">typing...</span>
                            </div>
                            <div
                              v-else
                              class="text-body2 text-grey-7 ellipsis"
                              :class="{ 'text-weight-bold text-grey-8': conversation.unreadCount > 0 }"
                            >
                              {{ conversation.lastMessage }}
                            </div>
                          </div>
                        </div>

                        <!-- Unread indicator -->
                        <div v-if="conversation.unreadCount > 0" class="row justify-end q-mt-xs">
                          <q-badge color="pink-6" rounded>
                            {{ conversation.unreadCount }}
                          </q-badge>
                        </div>
                      </div>

                      <!-- Quick Actions -->
                      <div class="column q-ml-md">
                        <q-btn
                          round
                          flat
                          icon="phone"
                          color="green"
                          size="sm"
                          @click.stop="callUser(conversation)"
                          class="q-mb-xs"
                        />
                        <q-btn
                          round
                          flat
                          icon="videocam"
                          color="blue"
                          size="sm"
                          @click.stop="videoCall(conversation)"
                        />
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <!-- Empty state -->
              <div v-if="conversations.length === 0" class="text-center q-py-xl">
                <q-icon name="chat_bubble_outline" size="80px" color="grey-4" />
                <div class="text-h6 text-grey-6 q-mt-md">No conversations yet</div>
                <div class="text-body2 text-grey-5 q-mt-sm">
                  Start chatting with your matches to see conversations here
                </div>
              </div>

              <!-- Message Tips -->
              <q-card class="q-mt-xl bg-pink-1" flat>
                <q-card-section>
                  <div class="text-subtitle2 text-pink-8 flex items-center q-mb-sm">
                    <q-icon name="lightbulb" class="q-mr-sm" />
                    Conversation Tips
                  </div>
                  <div class="text-body2 text-pink-7">
                    • Ask thoughtful questions about their faith journey<br>
                    • Share your testimony and experiences<br>
                    • Discuss shared interests and values<br>
                    • Be authentic and respectful in all conversations
                  </div>
                </q-card-section>
              </q-card>
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
import { dbClient } from "../../../api/apiList";
import { supabase } from "../../../lib/supabase";
import { date } from "quasar";

// Reactive state
const tab = ref("discover");
const searchVisible = ref(false);
const searchQuery = ref("");
const messageSearchQuery = ref("");
const groupCategory = ref("all");
const eventCategory = ref("upcoming");

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate());

  if (!hasBirthdayPassed) {
    age--;
  }

  return age;
}

// Filters
const ageFilter = ref({ min: 22, max: 35 });
const distanceFilter = ref(25);
const interestsFilter = ref([]);

// Counters and loading states
const notificationCount = ref(3);
const newProfilesCount = ref(5);
const newMatchesCount = ref(2);
const unreadMessagesCount = ref(7);
const hasMoreProfiles = ref(true);
const loadingMore = ref(false);

// Interest options
const interestOptions = [
  "Prayer", "Worship", "Bible Study", "Missions", "Youth Ministry",
  "Music", "Sports", "Reading", "Travel", "Cooking", "Fitness"
];

const user = (await supabase.auth.getUser()).data.user

// Current user profile
const currentUser = ref({
  name: "You",
  //age: calculateAge(user?.user_metadata?.date_of_birth || "1995-01-01"),
  //bio: "Living for Christ ✝️ | Music lover 🎵 | Adventure seeker 🌟",
  bio: (await getUserData())?.bio,
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
    display_name: "David",
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
    display_name: "Grace",
    age: 27,
    bio: "Youth leader ✝️ | Loves missions 🌍",
    avatar_url: "https://source.unsplash.com/400x400/?woman,portrait",
    lastMessage: "That's amazing! I'd love to hear more about your mission trip.",
    lastMessageTime: "2 hours ago",
    unreadMessages: 2,
    online: true
  },
  {
    id: 2,
    display_name: "Daniel",
    age: 30,
    bio: "Pastor | Coffee enthusiast ☕",
    avatar_url: "https://source.unsplash.com/400x400/?man,pastor",
    lastMessage: "Thanks for the prayer request, I'll be praying for you!",
    lastMessageTime: "1 day ago",
    unreadMessages: 0,
    online: false
  },
  {
    id: 3,
    display_name: "Faith",
    age: 25,
    bio: "Missionary kid | Love adventures 🌟",
    gender: "female",
    avatar_url: "https://source.unsplash.com/400x400/?woman,adventure",
    lastMessage: "Would you like to join our Bible study group?",
    lastMessageTime: "3 days ago",
    unreadMessages: 5,
    online: true
  }
]);

const admirers = ref([
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

const likes = ref([]);

//const rejected = ref([]);

//const rejectedBy = ref([]);

const fetchedMatches = ref([])

const fetchedMessages = ref([])

/* --- Messages data --- */
const conversations = ref([
  {
    id: 1,
    name: "Grace",
    age: 27,
    avatar: "https://source.unsplash.com/400x400/?woman,portrait",
    lastMessage: "That's amazing! I'd love to hear more about your mission trip. Are you planning any more in the future?",
    lastMessageTime: "2 min ago",
    unreadCount: 2,
    online: true,
    //isTyping: false,
    messages: [
      { id: 1, text: "Hey! How was your weekend at church?", timestamp: "10:30 AM", sent: false },
      { id: 2, text: "It was incredible! We had a guest speaker who talked about missions in Africa", timestamp: "10:32 AM", sent: true },
      { id: 3, text: "That sounds amazing! I've always felt called to missions too", timestamp: "10:35 AM", sent: false },
      { id: 4, text: "Really? What field are you most interested in?", timestamp: "10:36 AM", sent: true },
      { id: 5, text: "I'm passionate about education and children's ministry. Teaching kids about God's love", timestamp: "10:40 AM", sent: false },
      { id: 6, text: "That's so beautiful! Children have such pure hearts ❤️", timestamp: "10:42 AM", sent: true },
      { id: 7, text: "Exactly! Their faith is so genuine and inspiring", timestamp: "10:45 AM", sent: false },
      { id: 8, text: "That's amazing! I'd love to hear more about your mission trip. Are you planning any more in the future?", timestamp: "2 min ago", sent: false }
    ]
  },
  {
    id: 2,
    name: "Daniel",
    age: 30,
    avatar: "https://source.unsplash.com/400x400/?man,pastor",
    lastMessage: "Thanks for the prayer request, I'll be praying for your family during this time 🙏",
    lastMessageTime: "1 hour ago",
    unreadCount: 0,
    online: false,
    isTyping: false,
    messages: [
      { id: 1, text: "Good morning! Hope you're having a blessed day", timestamp: "9:00 AM", sent: false },
      { id: 2, text: "Morning Daniel! Yes, God is good. How's your sermon prep going?", timestamp: "9:15 AM", sent: true },
      { id: 3, text: "It's going well, focusing on Philippians 4:6-7 this week", timestamp: "9:20 AM", sent: false },
      { id: 4, text: "Perfect timing! I could really use that reminder about anxiety", timestamp: "9:25 AM", sent: true },
      { id: 5, text: "We all need it! God's peace surpasses understanding", timestamp: "9:30 AM", sent: false },
      { id: 6, text: "Actually, could you pray for my family? My dad's going through some health issues", timestamp: "10:00 AM", sent: true },
      { id: 7, text: "Of course! What's going on? I'll add him to our prayer list", timestamp: "10:05 AM", sent: false },
      { id: 8, text: "Thanks for the prayer request, I'll be praying for your family during this time 🙏", timestamp: "1 hour ago", sent: false }
    ]
  },
  {
    id: 3,
    name: "Faith",
    age: 25,
    avatar: "https://source.unsplash.com/400x400/?woman,adventure",
    lastMessage: "Would you like to join our Bible study group? We meet every Wednesday evening",
    lastMessageTime: "Yesterday",
    unreadCount: 3,
    online: true,
    isTyping: true,
    messages: [
      { id: 1, text: "Hi! I saw your profile and loved your heart for missions!", timestamp: "Yesterday 8:00 PM", sent: false },
      { id: 2, text: "Thank you! I saw yours too, being an MK must have given you amazing experiences", timestamp: "Yesterday 8:15 PM", sent: true },
      { id: 3, text: "It really did! I've lived in 5 different countries", timestamp: "Yesterday 8:20 PM", sent: false },
      { id: 4, text: "Wow! That's incredible. What was your favorite place?", timestamp: "Yesterday 8:25 PM", sent: true },
      { id: 5, text: "Probably Kenya. The people there have such joy despite their circumstances", timestamp: "Yesterday 8:30 PM", sent: false },
      { id: 6, text: "I've heard amazing things about the church in Kenya. So much faith!", timestamp: "Yesterday 8:35 PM", sent: true },
      { id: 7, text: "Exactly! It really challenged my own faith journey", timestamp: "Yesterday 8:40 PM", sent: false },
      { id: 8, text: "Would you like to join our Bible study group? We meet every Wednesday evening", timestamp: "Yesterday", sent: false }
    ]
  },
  {
    id: 4,
    name: "Hope",
    age: 26,
    avatar: "https://source.unsplash.com/400x400/?woman,art",
    lastMessage: "I'm working on a new painting series called 'God's Creation' 🎨",
    lastMessageTime: "2 days ago",
    unreadCount: 1,
    online: false,
    isTyping: false,
    messages: [
      { id: 1, text: "Your art is absolutely beautiful! Such a gift from God", timestamp: "3 days ago", sent: true },
      { id: 2, text: "Thank you so much! I try to use my art to glorify Him", timestamp: "3 days ago", sent: false },
      { id: 3, text: "It really shows! What's your current project?", timestamp: "2 days ago", sent: true },
      { id: 4, text: "I'm working on a new painting series called 'God's Creation' 🎨", timestamp: "2 days ago", sent: false }
    ]
  },
  {
    id: 5,
    name: "Joshua",
    age: 32,
    avatar: "https://source.unsplash.com/400x400/?man,smile",
    lastMessage: "See you at church tomorrow! Looking forward to worship together",
    lastMessageTime: "3 days ago",
    unreadCount: 0,
    online: false,
    isTyping: false,
    messages: [
      { id: 1, text: "Great meeting you at the young adults event!", timestamp: "1 week ago", sent: false },
      { id: 2, text: "You too! Thanks for the great conversation about ministry", timestamp: "1 week ago", sent: true },
      { id: 3, text: "Would you like to grab coffee this week and continue our discussion?", timestamp: "5 days ago", sent: false },
      { id: 4, text: "I'd love that! How about Wednesday after work?", timestamp: "4 days ago", sent: true },
      { id: 5, text: "Perfect! There's a great cafe near the church", timestamp: "4 days ago", sent: false },
      { id: 6, text: "See you at church tomorrow! Looking forward to worship together", timestamp: "3 days ago", sent: false }
    ]
  },
  {
    id: 6,
    name: "Sarah",
    age: 28,
    avatar: "https://source.unsplash.com/400x400/?woman,smile",
    lastMessage: "Amen! God's timing is always perfect ✨",
    lastMessageTime: "1 week ago",
    unreadCount: 0,
    online: true,
    isTyping: false,
    messages: [
      { id: 1, text: "How has your prayer life been lately?", timestamp: "1 week ago", sent: false },
      { id: 2, text: "It's been amazing! God has been revealing so much to me", timestamp: "1 week ago", sent: true },
      { id: 3, text: "That's wonderful! He speaks in so many ways", timestamp: "1 week ago", sent: false },
      { id: 4, text: "Amen! God's timing is always perfect ✨", timestamp: "1 week ago", sent: false }
    ]
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

const filteredConversations = computed(() => {
  if (!messageSearchQuery.value) {
    return conversations.value.sort((a, b) => {
      // Sort by unread first, then by most recent
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
      // Then sort by most recent activity
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });
  }

  const query = messageSearchQuery.value.toLowerCase();
  return conversations.value.filter(conversation =>
    conversation.name.toLowerCase().includes(query) ||
    conversation.lastMessage.toLowerCase().includes(query)
  );
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
/*async function getMatches() {
  const userResponse = await supabase.auth.getUser();
  const userId = userResponse.data?.user?.id;
  if (!userId) {
    console.error("User not found or not authenticated");
    return [];
  }
const { data, error } = await supabase
  .from("matches")
  .select(`
    id,
    status,
    user1,
    user2,
    dating_profiles!inner (
      id,
      bio,
      gender,
      date_of_birth,
      user_profiles (
        id,
        display_name,
        avatar_url
      )
    ),
    last_message:messages!inner (
      content,
      created_at
    )
  `)
  .or(`user1.eq.${userId},user2.eq.${userId}`)
  .eq("status", "accepted")
  .order("messages.created_at", { ascending: false })
  .limit(1, { foreignTable: "messages" });


  if (error) {
    console.error(error)
    return []
  }

  return data
}*/

// Like someone
async function likeUser(targetUserId) {
  if (!user) throw new Error('Not logged in')

  const { error } = await supabase.rpc('like_user', {
    liker: user.id,
    liked: targetUserId
  })

  if (error) {
    console.error('Error liking user:', error)
  } else {
    console.log('Like recorded successfully')
  }
}

async function getUserData() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  if (error) {
    console.error('Error fetching user data:', error)
    return null
  }

  return data
}

// Profile actions
const viewProfile = (user) => {
  console.log("View profile:", user.name);
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

// Message actions
const openConversation = (conversation) => {
  console.log("Open conversation with:", conversation.name);
  // Mark messages as read
  conversation.unreadCount = 0;
  // Update total unread count
  updateUnreadCount();
};

const callUser = (conversation) => {
  console.log("Calling:", conversation.name);
};

const videoCall = (conversation) => {
  console.log("Video calling:", conversation.name);
};

const updateUnreadCount = () => {
  unreadMessagesCount.value = conversations.value.reduce((total, conv) => total + conv.unreadCount, 0);
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
onMounted(async () => {
  console.log("App mounted");

    realProfiles = await dbClient.get({
      url: 'dating_profiles',
      params: {
        modifiers: [
          {
            op: 'limit',
            val: 20
          }
        ]
      },
      method: 'get'
    });

    realProfiles = realProfiles.map(profile => ({
      ...profile,
      age: calculateAge(profile.date_of_birth)
    }));
    profiles.value = realProfiles;

   /*const { data, error } = await supabase
  .rpc("get_user_matches_with_messages", { current_user_id: user?.id });*/

  /*(data.forEach(match => {
    const lastMessageContent = match.messages[match.messages.length - 1]?.content || '';
    const unreadCount = match.messages.filter(msg => !msg.read && msg.sender_id === match.id).length;
    if (match.status === "accepted") {
      fetchedMatches.value.push({
        id: match.id,
        display_name: match.display_name,
        avatar_url: match.avatar_url,
        bio: match.bio,
        gender: match.gender,
        age: calculateAge(match.date_of_birth),
        lastMessage: lastMessageContent || '',
        lastMessageTime: match.messages[match.messages.length - 1]?.created_at || '' ? date.formatDate(match.messages[match.messages.length - 1].created_at) : "",
        unreadMessages: unreadCount,
        online: Date.now() - new Date(match.last_seen).getTime() < 120_000
      });
    }

    else if (match.status === "pending" && match.user2 === user?.id) {
      // Incoming like
      admirers.value.push({
        id: match.id,
        avatar: match.user_profiles.avatar_url,
        preview: `${match.user_profiles.display_name} liked you!`
      });
    }

    else if (match.status === "pending" && match.user1 === user?.id) {
      // Outgoing like - could handle differently if desired
      likes.value.push({
        id: match.id,
        avatar: match.user_profiles.avatar_url,
        preview: `You liked ${match.user_profiles.display_name}`
      });
    }

    conversations.value.push({
      id: match.id,
      name: match.display_name,
      avatar: match.avatar_url,
      lastMessage: lastMessageContent || '',
      lastMessageTime: match.messages[match.messages.length - 1]?.created_at || '' ? date.formatDate(match.messages[match.messages.length - 1].created_at) : "",
      unreadCount: unreadCount,
      online: Date.now() - new Date(match.last_seen).getTime() < 120000,
      //isTyping: false,
      age: calculateAge(match.date_of_birth),
      messages: match.messages.map(msg => ({
        id: msg.id,
        text: msg.content,
        timestamp: date.formatDate(msg.created_at),
        read: msg.read,
        sent: () => {if (msg.receiver.id === user?.id) { return true; } else { return false; }}
      }))
    });*/

    /*else if (match.status === "rejected" && match.user2 === user?.id) {
      // Outgoing like - could handle differently if desired
      rejected.value.push({
        id: match.id,
        avatar: match.user_profiles.avatar_url,
        preview: `You rejected ${match.user_profiles.display_name}`
      });
    }

    else if (match.status === "rejected" && match.user1 === user?.id) {
      // Incoming like - could handle differently if desired
      rejectedBy.value.push({
        id: match.id,
        avatar: match.user_profiles.avatar_url,
        preview: `${match.user_profiles.display_name} rejected you!`
      });
    }*/

    /*matches.value.push({
      id: match.id,
      display_name: match.display_name,
      avatar_url: match.avatar_url,
      bio: match.bio,
      gender: match.gender,
      age: calculateAge(match.date_of_birth),
      lastMessage: lastMessageContent || '',
      lastMessageTime: match.messages[match.messages.length - 1]?.created_at || '' ? date.formatDate(match.messages[match.messages.length - 1].created_at) : "",
      unreadMessages: unreadCount,
      online: Date.now() - new Date(match.last_seen).getTime() < 120_000
    });*/
 // });

  interface UserProfile {
    id: number;
    display_name: string;
    avatar_url: string;
  }

if (error) {
  console.error(error);
} else {
  console.log(data);
}

    /*fetchedMatches.value.forEach(match => {
      const lastMessageContent = match.messages[match.messages.length - 1]?.content || '';
      const unreadCount = match.messages.filter(msg => !msg.read && msg.sender_id === match.id).length;
      // Access individual items (each 'match' in the array)
      // and assign their properties to a new object
      matches.value.push({
        id: match.id,
        display_name: match.display_name,
        avatar_url: match.avatar_url,
        bio: match.bio,
        gender: match.gender,
        age: calculateAge(match.date_of_birth),
        lastMessage: lastMessageContent || '',
        lastMessageTime: match.messages[match.messages.length - 1]?.created_at || '' ? date.formatDate(match.messages[match.messages.length - 1].created_at) : "",
        unreadMessages: unreadCount,
        online: Date.now() - new Date(match.last_seen).getTime() < 120_000
      });
    })



    fetchedMessages.value = await dbClient.get({
      url: 'messages',
      params: {
        modifiers: [
          {
            op: 'limit',
            val: 20
          }
        ]
      },
      method: 'get'
    });

    conversations = fetchedMatches.value.filter(message => ({
      messages: [] // Load full conversation when opened
    }));*/
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

  .action-btn {/* Continuing from .action-btn { */
    transition: all 0.2s ease;
    margin: 0 4px;
  }

  .action-btn:hover {
    transform: scale(1.1);
  }

  .recent-match-card {
    border-radius: 15px;
    transition: all 0.3s ease;
    min-width: 120px;
  }

  .recent-match-card:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }

  .match-card {
    border-radius: 20px;
    transition: all 0.3s ease;
  }

  .match-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  }

  .like-card {
    border-radius: 20px;
    overflow: hidden;
  }

  .blur-img {
    filter: blur(8px);
  }

  .conversation-card {
    border-radius: 15px;
    transition: all 0.3s ease;
    border-left: 4px solid transparent;
  }

  .conversation-card:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  }

  .unread-conversation {
    border-left-color: #e91e63;
    background-color: #fce4ec;
  }

  .typing-indicator {
    font-style: italic;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .group-card {
    border-radius: 20px;
    transition: all 0.3s ease;
  }

  .group-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }

  .event-card {
    border-radius: 20px;
    transition: all 0.3s ease;
  }

  .event-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  }

  .profile-overview-card {
    border-radius: 20px;
    overflow: hidden;
  }

  .tab-with-badge {
    position: relative;
  }

  .ellipsis-2-lines {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .rounded-t-borders {
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
  }

  .bg-opacity-50 {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .bg-opacity-70 {
    background-color: rgba(0, 0, 0, 0.7);
  }

  .bg-opacity-90 {
    background-color: rgba(255, 255, 255, 0.9);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .profile-card,
    .match-card,
    .group-card,
    .event-card {
      border-radius: 15px;
    }

    .action-btn {
      margin: 0 2px;
    }
  }
</style>
