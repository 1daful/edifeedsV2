<!-- src/pages/UserSettingsPage.vue -->
<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">⚙️ Account Settings</div>

    <!-- Account Info -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2">👤 Account Info</div>
        <q-input filled v-model="user.username" label="Username" />
        <q-input filled v-model="user.email" label="Email" disable />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" label="Save Changes" @click="saveProfile" />
      </q-card-actions>
    </q-card>

    <!-- Password Change -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2">🔒 Change Password</div>
        <q-input v-model="oldPassword" filled label="Old Password" type="password" />
        <q-input v-model="newPassword" filled label="New Password" type="password" />
        <q-input v-model="confirmPassword" filled label="Confirm New Password" type="password" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" label="Change Password" @click="changePassword" />
      </q-card-actions>
    </q-card>

    <!-- Preferences -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2">🎨 Preferences</div>
        <q-select filled v-model="theme" :options="['Light', 'Dark']" label="Theme" />
        <q-toggle v-model="notifications" label="Email Notifications" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" label="Update Preferences" @click="savePreferences" />
      </q-card-actions>
    </q-card>

    <!-- Danger Zone -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2 text-negative">🚨 Danger Zone</div>
        <q-btn color="negative" label="Delete My Account" @click="deleteAccount" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const user = ref({ username: '', email: '' });
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const theme = ref<'Light' | 'Dark'>('Light');
const notifications = ref(true);

onMounted(async () => {
  const res = await fetch('/api/user/settings');
  const data = await res.json();
  user.value = data.user;
  theme.value = data.preferences.theme;
  notifications.value = data.preferences.notifications;
});

async function saveProfile() {
  await fetch('/api/user/update', {
    method: 'POST',
    body: JSON.stringify({ username: user.value.username }),
    headers: { 'Content-Type': 'application/json' }
  });
}

async function changePassword() {
  if (newPassword.value !== confirmPassword.value) {
    alert('Passwords do not match');
    return;
  }
  await fetch('/api/user/change-password', {
    method: 'POST',
    body: JSON.stringify({
      oldPassword: oldPassword.value,
      newPassword: newPassword.value
    }),
    headers: { 'Content-Type': 'application/json' }
  });
}

async function savePreferences() {
  await fetch('/api/user/preferences', {
    method: 'POST',
    body: JSON.stringify({
      theme: theme.value,
      notifications: notifications.value
    }),
    headers: { 'Content-Type': 'application/json' }
  });
}

async function deleteAccount() {
  if (confirm('Are you sure? This cannot be undone.')) {
    await fetch('/api/user/delete', { method: 'DELETE' });
    window.location.href = '/';
  }
}
</script>
