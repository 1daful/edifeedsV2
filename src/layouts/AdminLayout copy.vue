<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Top Bar -->
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title>
          Edifeeds Admin
        </q-toolbar-title>
        <q-space />
        <q-btn dense flat icon="notifications" />
        <q-btn dense flat icon="account_circle" />
      </q-toolbar>
    </q-header>

    <!-- Sidebar Drawer -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
  <q-list>

    <!-- Dashboard -->
    <q-item clickable v-ripple to="/admin">
      <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
      <q-item-section>Dashboard</q-item-section>
    </q-item>

    <!-- Topic Manager -->
    <q-item clickable v-ripple to="/admin/topics">
      <q-item-section avatar><q-icon name="topic" /></q-item-section>
      <q-item-section>Topic Manager</q-item-section>
    </q-item>

    <!-- Content Management -->
    <q-expansion-item icon="collections" label="Content Management" dense>
      <q-list>
        <q-item clickable v-ripple to="/admin/content/videos">
          <q-item-section>Videos</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/content/music">
          <q-item-section>Music</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/content/articles">
          <q-item-section>Articles</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/content/quotes">
          <q-item-section>Quotes</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/admin/content/events">
          <q-item-section>Events</q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>

    <!-- User Management -->
    <q-item clickable v-ripple to="/admin/users">
      <q-item-section avatar><q-icon name="people" /></q-item-section>
      <q-item-section>Users</q-item-section>
    </q-item>

    <!-- Prayer Requests -->
    <q-item clickable v-ripple to="/admin/prayers">
      <q-item-section avatar><q-icon name="favorite" /></q-item-section>
      <q-item-section>Prayer Requests</q-item-section>
    </q-item>

    <!-- Analytics -->
    <q-item clickable v-ripple to="/admin/analytics">
      <q-item-section avatar><q-icon name="analytics" /></q-item-section>
      <q-item-section>Analytics</q-item-section>
    </q-item>

    <!-- Settings -->
    <q-item clickable v-ripple to="/admin/settings">
      <q-item-section avatar><q-icon name="settings" /></q-item-section>
      <q-item-section>Settings</q-item-section>
    </q-item>

    <q-separator />

    <!-- Logout -->
    <q-item clickable v-ripple @click="logout">
      <q-item-section avatar><q-icon name="logout" /></q-item-section>
      <q-item-section>Logout</q-item-section>
    </q-item>

  </q-list>
</q-drawer>


    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const leftDrawerOpen = ref(true)
const router = useRouter()

function logout() {
  // Replace with your actual logout logic
  console.log('Logging out...')
  router.push('/login')
}
</script>
