<template>
  <div class="q-pa-md">
    <q-card class="profile-overview-card">
      <div class="relative-position">
        <q-img :src="currentUser.avatar" ratio="16/9" class="rounded-t-borders" />
        <div class="bg-gradient-dark text-white q-pa-md">
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
</template>

<script setup lang="ts">
const props = defineProps({
  currentUser: {
    type: Object,
    required: true
  },
  matchCount: {
    type: Number,
    required: true
  }
})

const profileStats = {
  likes: 245,
  matches: props.matchCount,
  views: 1200,
  messages: 156
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

</script>

<style scoped>
.profile-card {
  border-radius: 20px;
  transition: all 0.3s ease;
  overflow: hidden;
}
.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(233, 30, 99, 0.2);
}
.profile-overview-card {
  border-radius: 20px;
  overflow: hidden;
}
/* Enhanced Styling */
.bg-gradient-pink {
  background: linear-gradient(135deg, #e91e63, #f06292);
}

.bg-gradient-dark {
  background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2));
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
