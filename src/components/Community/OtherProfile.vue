<template>
  <div class="q-pa-md">
    <q-card class="profile-overview-card">
      <div class="relative-position">
        <q-img :src="profileUser.avatar" ratio="16/9" class="rounded-t-borders" />
        <div class="bg-gradient-dark text-white q-pa-md">
          <div class="text-h5 text-weight-bold">{{ profileUser.name }}, {{ profileUser.age }}</div>
          <div class="text-body2">{{ profileUser.bio }}</div>

          <!-- Online status indicator -->
          <div class="q-mt-sm" v-if="profileUser.isOnline">
            <q-chip size="sm" color="green" text-color="white" icon="circle">
              Online now
            </q-chip>
          </div>
          <div class="q-mt-sm" v-else-if="profileUser.lastSeen">
            <q-chip size="sm" color="grey-6" text-color="white" icon="access_time">
              Last seen {{ formatLastSeen(profileUser.lastSeen) }}
            </q-chip>
          </div>
        </div>

        <!-- Action buttons for visitors -->
        <div class="absolute-top-right q-ma-md">
          <q-btn
            round
            flat
            icon="favorite"
            :color="isLiked ? 'red-5' : 'white'"
            class="q-mr-sm bg-dark bg-opacity-50"
            @click="toggleLike"
          />
          <q-btn
            round
            flat
            icon="more_vert"
            color="white"
            class="bg-dark bg-opacity-50"
            @click="showMoreOptions"
          />
        </div>
      </div>

      <q-card-section>
        <!-- Basic profile info - public stats only -->
        <div class="row q-col-gutter-md text-center" v-if="showPublicStats">
          <div class="col-6">
            <div class="text-h6 text-weight-bold text-pink-6">{{ profileUser.age }}</div>
            <div class="text-caption text-grey-6">Years old</div>
          </div>
          <div class="col-6">
            <div class="text-h6 text-weight-bold text-pink-6">{{ distanceFromUser }}</div>
            <div class="text-caption text-grey-6">km away</div>
          </div>
        </div>

        <!-- Profile details -->
        <div class="q-mt-md" v-if="profileUser.details">
          <div class="text-subtitle2 text-weight-medium q-mb-sm">About {{ profileUser.name }}</div>
          <div class="text-body2 text-grey-8">{{ profileUser.details }}</div>
        </div>

        <!-- Interests/Tags -->
        <div class="q-mt-md" v-if="profileUser.interests && profileUser.interests.length">
          <div class="text-subtitle2 text-weight-medium q-mb-sm">Interests</div>
          <div class="row q-gutter-xs">
            <q-chip
              v-for="interest in profileUser.interests"
              :key="interest"
              size="sm"
              color="pink-1"
              text-color="pink-8"
              :label="interest"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Visitor Actions -->
    <div class="q-mt-md">
      <q-list bordered class="rounded-borders">
        <q-item clickable @click="sendMessage" v-if="canMessage" to="/edifeeds-love-chat">
          <q-item-section avatar>
            <q-icon name="chat" color="pink-6" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Send Message</q-item-label>
            <q-item-label caption>Start a conversation</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" color="grey-5" />
          </q-item-section>
        </q-item>

        <q-separator v-if="canMessage" />

        <q-item clickable @click="viewPhotos" v-if="profileUser.hasPhotos">
          <q-item-section avatar>
            <q-icon name="photo_library" color="blue-6" />
          </q-item-section>
          <q-item-section>
            <q-item-label>View Photos</q-item-label>
            <q-item-label caption>See all {{ profileUser.photoCount }} photos</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" color="grey-5" />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable @click="shareProfile">
          <q-item-section avatar>
            <q-icon name="share" color="green-6" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Share Profile</q-item-label>
            <q-item-label caption>Share with friends</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" color="grey-5" />
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable @click="reportProfile">
          <q-item-section avatar>
            <q-icon name="flag" color="red-6" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Report</q-item-label>
            <q-item-label caption>Report this profile</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- More options dialog -->
    <q-dialog v-model="showMoreDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Profile Options</div>
        </q-card-section>

        <q-list>
          <q-item clickable @click="blockUser" v-close-popup>
            <q-item-section avatar>
              <q-icon name="block" color="red-6" />
            </q-item-section>
            <q-item-section>Block User</q-item-section>
          </q-item>

          <q-item clickable @click="reportProfile" v-close-popup>
            <q-item-section avatar>
              <q-icon name="flag" color="orange-6" />
            </q-item-section>
            <q-item-section>Report Profile</q-item-section>
          </q-item>
        </q-list>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-6" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  profileUser: {
    type: Object,
    required: true
  },
  isMatched: {
    type: Boolean,
    default: false
  },
  distanceFromUser: {
    type: String,
    default: '5'
  },
  showPublicStats: {
    type: Boolean,
    default: true
  }
})

/*const currentUser = async () => {
  return (await supabase.auth.getUser()).data.user
}*/

const emit = defineEmits([
  'like-toggled',
  'message-sent',
  'profile-shared',
  'profile-reported',
  'user-blocked',
  'photos-viewed'
])

// Reactive state
const isLiked = ref(false)
const showMoreDialog = ref(false)

// Computed properties
const canMessage = computed(() => props.isMatched)

// Methods
const toggleLike = () => {
  isLiked.value = !isLiked.value
  emit('like-toggled', {
    userId: props.profileUser.id,
    liked: isLiked.value
  })
}

const sendMessage = () => {
  router.push({ name: 'edifeeds-love-chat', params: { otherUser: JSON.stringify(props.profileUser) } })
  //emit('message-sent', props.profileUser.id)
}

const viewPhotos = () => {
  emit('photos-viewed', props.profileUser.id)
}

const shareProfile = () => {
  emit('profile-shared', props.profileUser.id)
}

const reportProfile = () => {
  emit('profile-reported', props.profileUser.id)
  showMoreDialog.value = false
}

const blockUser = () => {
  emit('user-blocked', props.profileUser.id)
  showMoreDialog.value = false
}

const showMoreOptions = () => {
  showMoreDialog.value = true
}

const formatLastSeen = (lastSeen: string) => {
  // Simple formatting - you can enhance this
  const now = new Date()
  const lastSeenDate = new Date(lastSeen)
  const diffHours = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60))

  if (diffHours < 1) return 'just now'
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return 'over a week ago'
}

onMounted(async () => {
  //const user = await currentUser()
})
</script>

<style scoped>
.profile-overview-card {
  border-radius: 20px;
  overflow: hidden;
}

.bg-gradient-dark {
  background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2));
}

.rounded-t-borders {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.bg-opacity-50 {
  background-color: rgba(0, 0, 0, 0.5);
}

/* Action button hover effects */
.q-btn {
  transition: all 0.2s ease;
}

.q-btn:hover {
  transform: scale(1.05);
}

/* List items hover effect */
.q-item {
  transition: all 0.2s ease;
}

.q-item:hover {
  background-color: rgba(233, 30, 99, 0.05);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profile-overview-card {
    border-radius: 15px;
  }

  .q-btn {
    margin: 0 2px;
  }
}
</style>
