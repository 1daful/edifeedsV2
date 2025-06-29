<!-- src/pages/ProfilePage.vue -->
<template>
  <q-page class="q-pa-md">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-dots size="40px" color="primary" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-center q-pa-xl">
      <q-card class="q-pa-md" style="max-width: 400px">
        <q-card-section class="text-center">
          <q-icon name="error" size="48px" color="negative" />
          <div class="text-h6 q-mt-md">Error Loading Profile</div>
          <div class="text-body2 text-grey-7 q-mt-sm">{{ error }}</div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn color="primary" @click="loadProfile" :loading="loading">
            Try Again
          </q-btn>
        </q-card-actions>
      </q-card>
    </div>

    <!-- Profile Content -->
    <div v-else>
      <!-- Profile Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-md">
          <q-avatar
            size="72px"
            :color="user.avatarColor || 'primary'"
            text-color="white"
            class="shadow-2"
          >
            <img v-if="user.avatar" :src="user.avatar" :alt="user.username" />
            <span v-else class="text-h5">{{ initials }}</span>
          </q-avatar>
          <div>
            <div class="text-h5 text-weight-medium">{{ user.displayName || user.username }}</div>
            <div class="text-body2 text-grey-7">{{ user.email }}</div>
            <div v-if="user.joinedDate" class="text-caption text-grey-6">
              Member since {{ formatDate(user.joinedDate) }}
            </div>
          </div>
        </div>

        <div class="row q-gutter-sm">
          <q-btn
            flat
            color="primary"
            icon="edit"
            label="Edit Profile"
            @click="showEditDialog = true"
          />
          <q-btn
            flat
            color="negative"
            icon="logout"
            label="Logout"
            @click="confirmLogout"
          />
        </div>
      </div>

      <!-- Profile Stats -->
      <div class="row q-gutter-md q-mb-lg">
        <q-card class="col-12 col-sm-4">
          <q-card-section class="text-center">
            <div class="text-h4 text-primary">{{ userBookmarks.length }}</div>
            <div class="text-body2 text-grey-7">Bookmarks</div>
          </q-card-section>
        </q-card>
        <q-card class="col-12 col-sm-4">
          <q-card-section class="text-center">
            <div class="text-h4 text-secondary">{{ userCollections.length }}</div>
            <div class="text-body2 text-grey-7">Collections</div>
          </q-card-section>
        </q-card>
        <q-card class="col-12 col-sm-4">
          <q-card-section class="text-center">
            <div class="text-h4 text-accent">{{ userRatings.length }}</div>
            <div class="text-body2 text-grey-7">Ratings</div>
          </q-card-section>
        </q-card>
      </div>

      <q-separator class="q-mb-lg" />

      <!-- Tabs -->
      <q-tabs
        v-model="tab"
        align="left"
        narrow-indicator
        class="text-grey-7"
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab
          name="bookmarks"
          :label="`Bookmarks (${userBookmarks.length})`"
          icon="bookmark"
        />
        <q-tab
          name="collections"
          :label="`Collections (${userCollections.length})`"
          icon="folder"
        />
        <q-tab
          name="comments"
          :label="`Ratings (${userRatings.length})`"
          icon="star"
        />
        <q-tab
          name="settings"
          label="Settings"
          icon="settings"
        />
      </q-tabs>

      <q-separator />

      <!-- Tab Panels -->
      <q-tab-panels v-model="tab" animated transition-prev="slide-right" transition-next="slide-left">
        <q-tab-panel name="bookmarks" class="q-pa-none">
          <div v-if="userBookmarks.length === 0" class="text-center q-pa-xl">
            <q-icon name="bookmark_border" size="64px" color="grey-4" />
            <div class="text-h6 text-grey-6 q-mt-md">No bookmarks yet</div>
            <div class="text-body2 text-grey-5">Start bookmarking items to see them here</div>
          </div>
          <BookmarkList v-else :items="userBookmarks" @remove="removeBookmark" />
        </q-tab-panel>

        <q-tab-panel name="collections" class="q-pa-none">
          <div class="row justify-between items-center q-mb-md">
            <div class="text-h6">My Collections</div>
            <q-btn
              color="primary"
              icon="add"
              label="New Collection"
              @click="showCreateCollection = true"
            />
          </div>
          <div v-if="userCollections.length === 0" class="text-center q-pa-xl">
            <q-icon name="folder_open" size="64px" color="grey-4" />
            <div class="text-h6 text-grey-6 q-mt-md">No collections yet</div>
            <div class="text-body2 text-grey-5">Create your first collection to organize your content</div>
          </div>
          <CollectionList
            v-else
            :collections="userCollections"
            @edit="editCollection"
            @delete="deleteCollection"
          />
        </q-tab-panel>

        <q-tab-panel name="comments" class="q-pa-none">
          <div v-if="userRatings.length === 0" class="text-center q-pa-xl">
            <q-icon name="star_border" size="64px" color="grey-4" />
            <div class="text-h6 text-grey-6 q-mt-md">No ratings yet</div>
            <div class="text-body2 text-grey-5">Rate items to see your reviews here</div>
          </div>
          <RatingList v-else :ratings="userRatings" @edit="editRating" @delete="deleteRating" />
        </q-tab-panel>

        <q-tab-panel name="settings" class="q-pa-md">
          <div class="text-h6 q-mb-md">Account Settings</div>
          <q-list separator>
            <q-item clickable @click="showEditDialog = true">
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Edit Profile</q-item-label>
                <q-item-label caption>Update your profile information</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-item clickable @click="showPasswordDialog = true">
              <q-item-section avatar>
                <q-icon name="lock" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Change Password</q-item-label>
                <q-item-label caption>Update your account password</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" />
              </q-item-section>
            </q-item>

            <q-item clickable @click="toggleNotifications">
              <q-item-section avatar>
                <q-icon name="notifications" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Notifications</q-item-label>
                <q-item-label caption>Manage your notification preferences</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="user.notifications" />
              </q-item-section>
            </q-item>

            <q-item clickable @click="togglePrivateProfile">
              <q-item-section avatar>
                <q-icon name="visibility" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Private Profile</q-item-label>
                <q-item-label caption>Make your profile private</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="user.isPrivate" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- Edit Profile Dialog -->
    <q-dialog v-model="showEditDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Edit Profile</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="updateProfile">
            <q-input
              v-model="editForm.displayName"
              label="Display Name"
              outlined
              class="q-mb-md"
            />
            <q-input
              v-model="editForm.email"
              label="Email"
              type="email"
              outlined
              class="q-mb-md"
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showEditDialog = false" />
          <q-btn color="primary" label="Save" @click="updateProfile" :loading="updating" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Logout Confirmation Dialog -->
    <q-dialog v-model="showLogoutDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Confirm Logout</div>
        </q-card-section>
        <q-card-section>
          Are you sure you want to logout?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showLogoutDialog = false" />
          <q-btn color="negative" label="Logout" @click="logout" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import BookmarkList from '../components/BookmarkList.vue';
import CollectionList from '../components/CollectionList.vue';
import RatingList from '../components/RatingList.vue';

const $q = useQuasar();

// Reactive state
const tab = ref('bookmarks');
const loading = ref(false);
const updating = ref(false);
const error = ref<string | null>(null);

const user = ref({
  username: '',
  email: '',
  displayName: '',
  avatar: '',
  avatarColor: 'primary',
  joinedDate: '',
  notifications: true,
  isPrivate: false
});

const userBookmarks = ref([]);
const userCollections = ref([]);
const userRatings = ref([]);

// Dialog states
const showEditDialog = ref(false);
const showLogoutDialog = ref(false);
const showPasswordDialog = ref(false);
const showCreateCollection = ref(false);

// Form data
const editForm = ref({
  displayName: '',
  email: ''
});

// Computed properties
const initials = computed(() => {
  const name = user.value.displayName || user.value.username;
  return name?.split(' ').map(n => n[0]).join('').slice(0, 2)?.toUpperCase() || '';
});

// Methods
async function loadProfile() {
  loading.value = true;
  error.value = null;

  try {
    const res = await fetch('/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to load profile: ${res.statusText}`);
    }

    const data = await res.json();

    user.value = { ...user.value, ...data.user };
    userBookmarks.value = data.bookmarks || [];
    userCollections.value = data.collections || [];
    userRatings.value = data.ratings || [];

    // Update edit form with current data
    editForm.value = {
      displayName: user.value.displayName,
      email: user.value.email
    };

  } catch (err) {
    console.error('Error loading profile:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load profile';
  } finally {
    loading.value = false;
  }
}

async function updateProfile() {
  updating.value = true;

  try {
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editForm.value)
    });

    if (!res.ok) {
      throw new Error('Failed to update profile');
    }

    const data = await res.json();
    user.value = { ...user.value, ...data.user };

    $q.notify({
      type: 'positive',
      message: 'Profile updated successfully',
      position: 'top'
    });

    showEditDialog.value = false;

  } catch (err) {
    console.error('Error updating profile:', err);
    $q.notify({
      type: 'negative',
      message: 'Failed to update profile',
      position: 'top'
    });
  } finally {
    updating.value = false;
  }
}

function confirmLogout() {
  showLogoutDialog.value = true;
}

async function logout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  } catch (err) {
    console.error('Logout error:', err);
  }

  localStorage.removeItem('token');
  $q.notify({
    type: 'info',
    message: 'Logged out successfully',
    position: 'top'
  });

  window.location.href = '/login';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
}

// Event handlers
function removeBookmark(bookmarkId: string) {
  userBookmarks.value = userBookmarks.value.filter(b => b.id !== bookmarkId);
}

function editCollection(collection: any) {
  // Handle collection editing
  console.log('Edit collection:', collection);
}

function deleteCollection(collectionId: string) {
  userCollections.value = userCollections.value.filter(c => c.id !== collectionId);
}

function editRating(rating: any) {
  // Handle rating editing
  console.log('Edit rating:', rating);
}

function deleteRating(ratingId: string) {
  userRatings.value = userRatings.value.filter(r => r.id !== ratingId);
}

async function toggleNotifications() {
  try {
    await fetch('/api/user/settings', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ notifications: user.value.notifications })
    });

    $q.notify({
      type: 'positive',
      message: `Notifications ${user.value.notifications ? 'enabled' : 'disabled'}`,
      position: 'top'
    });
  } catch (err) {
    console.error('Error updating notifications:', err);
    // Revert the toggle
    user.value.notifications = !user.value.notifications;
  }
}

async function togglePrivateProfile() {
  try {
    await fetch('/api/user/settings', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isPrivate: user.value.isPrivate })
    });

    $q.notify({
      type: 'positive',
      message: `Profile is now ${user.value.isPrivate ? 'private' : 'public'}`,
      position: 'top'
    });
  } catch (err) {
    console.error('Error updating privacy setting:', err);
    // Revert the toggle
    user.value.isPrivate = !user.value.isPrivate;
  }
}

// Lifecycle
onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.q-tab-panels {
  min-height: 400px;
}

.q-avatar {
  transition: all 0.3s ease;
}

.q-avatar:hover {
  transform: scale(1.05);
}

.stats-card {
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
</style>
