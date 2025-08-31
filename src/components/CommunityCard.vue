<template>
  <q-card class="community-card-container" :class="{ 'main-feature': mainFeature }">
    <q-card-section>
      <div class="community-header">
        <div class="community-icon">{{ icon }}</div>
        <div>
          <div class="text-h6 text-weight-bold">{{ title }}</div>
          <div class="text-caption text-grey-7">{{ subtitle }}</div>
        </div>
      </div>

      <div class="q-mt-md">
        <!-- UNITY HUB -->
        <template v-if="title === 'Unity Hub'">
          <div class="recent-activity">
            <div
              v-for="activity in activities"
              :key="activity.id"
              class="activity-item"
            >
              <q-avatar size="40px" font-size="24px" class="user-avatar bg-primary text-white">
                <img v-if="activity.user?.avatar_url" :src="activity.user.avatar_url" />
                <span v-else>👤</span>
              </q-avatar>
              <div class="activity-text">
                <div class="text-body2 text-grey-8">
                  <strong>{{ activity.user?.display_name || 'Anonymous' }}</strong>
                  {{ activity.content }}
                </div>
                <div class="text-caption text-grey-5">{{ timeAgo(activity.created_at) }}</div>
              </div>
            </div>
          </div>
          <q-btn class="cta-button" label="Join the Conversation" to="/community/unity-hub" unelevated />
        </template>

        <!-- PRAYER WALL -->
        <template v-else-if="title === 'Prayer Wall'">
          <div class="prayer-requests">
            <div
              v-for="prayer in prayers"
              :key="prayer.id"
              class="prayer-item"
            >
              <p class="text-body2 text-grey-7">"{{ prayer.content }}"</p>
              <div class="prayer-stats text-caption text-grey-5">
                <span>❤️ {{ prayer.prayers_count }} praying</span>
                <span>💬 {{ prayer.responses_count }} responses</span>
              </div>
            </div>
          </div>
          <q-btn class="cta-button" label="+ Add Prayer Request" @click="showPrayerDialog = true" unelevated />

          <!-- Add Prayer Dialog -->
          <q-dialog v-model="showPrayerDialog">
            <q-card>
              <q-card-section>
                <div class="text-h6">Add Prayer Request</div>
                <q-input v-model="newPrayer" type="textarea" label="Your prayer request..." />
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Cancel" v-close-popup />
                <q-btn color="primary" label="Submit" @click="submitPrayer" />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </template>

        <!-- SMALL GROUPS -->
        <template v-else-if="title === 'Small Groups'">
          <div class="groups-list">
            <div
              v-for="group in groups"
              :key="group.id"
              class="group-item"
            >
              <div class="group-info">
                <div class="text-body1 text-weight-bold">{{ group.name }}</div>
                <span class="text-caption text-grey-7">{{ group.members_count }} members • {{ group.schedule }}</span>
              </div>
              <q-btn outline rounded color="primary" label="Join" @click="joinGroup(group.id)" />
            </div>
          </div>
          <q-btn class="cta-button" label="View All Groups" to="/community/groups" unelevated />
        </template>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabase"; // your supabase client
import { useQuasar } from "quasar";

const props = defineProps({
  icon: String,
  title: String,
  subtitle: String,
  /*mainFeature: {
    type: Boolean,
    default: false,
  },*/
});

const router = useRouter()
const $q = useQuasar();
const activities = ref([]);
const prayers = ref([]);
const groups = ref([]);
const showPrayerDialog = ref(false);
const newPrayer = ref("");

// Load Data
onMounted(async () => {
  if (props.title === "Unity Hub") {
    let { data } = await supabase
      .from("activities")
      .select("*, user:user_id(display_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(3);
    activities.value = data || [];
  }

  if (props.title === "Prayer Wall") {
    let { data } = await supabase
      .from("prayer_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2);
    prayers.value = data || [];
  }

  if (props.title === "Small Groups") {
    let { data } = await supabase.from("groups").select("*").limit(3);
    groups.value = data || [];
  }
});

// Prayer Request Submit
const submitPrayer = async () => {
  if (!newPrayer.value) return;

  try {
    const { data: user } = await supabase.auth.getUser();
    await supabase.from("prayer_requests").insert({
      content: newPrayer.value,
      id: user.user.id,
    });

    $q.notify({ type: "positive", message: "Prayer request added 🙏" });
    showPrayerDialog.value = false;
    newPrayer.value = "";

    // Refresh prayer requests
    let { data } = await supabase
      .from("prayer_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2);
    prayers.value = data || [];
  } catch (error) {
    $q.notify({ type: "negative", message: "Error adding prayer request" });
  }
};

// Join Group
const joinGroup = async (groupId) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    await supabase.from("group_members").insert({
      user_id: user.user.id,
      group_id: groupId,
    });
    router.push({ name: "/edifeeds-love", params: { id: groupId } });
    $q.notify({ type: "positive", message: "You joined the group 🎉" });
  } catch (error) {
    $q.notify({ type: "negative", message: "Error joining group" });
  }
};

// Time formatter
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

<style lang="scss" scoped>
.community-card-container {
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.community-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.community-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.activity-item, .prayer-item, .group-item {
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.8rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.prayer-stats {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cta-button {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-top: 1rem;

  &:hover {
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }
}
</style>
