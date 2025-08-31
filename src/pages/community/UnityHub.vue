<template>
  <q-page padding>
    <div class="text-h5 text-weight-bold q-mb-md">Unity Hub ✨</div>

    <q-list bordered separator>
      <q-item v-for="activity in activities" :key="activity.id" class="q-py-md">
        <q-item-section avatar>
          <q-avatar size="40px">
            <img v-if="activity.user?.avatar_url" :src="activity.user.avatar_url" />
            <span v-else>👤</span>
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <strong>{{ activity.user?.display_name || 'Anonymous' }}</strong>
            {{ activity.content }}
          </q-item-label>
          <q-item-label caption>{{ timeAgo(activity.created_at) }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "src/lib/supabase";

const activities = ref([]);

onMounted(async () => {
  const { data } = await supabase
    .from("activities")
    .select("*, user:user_id(display_name, avatar_url)")
    .order("created_at", { ascending: false });
  activities.value = data;
});

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hrs ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};
</script>
