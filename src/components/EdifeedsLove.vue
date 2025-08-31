<template>
  <q-card class="love-card-container" :class="{ 'main-feature': mainFeature }">
    <q-card-section>
      <div class="love-header">
        <div class="love-icon">{{ icon }}</div>
        <div>
          <div class="text-h6 text-weight-bold">{{ title }}</div>
          <div class="text-caption text-grey-7">{{ subtitle }}</div>
        </div>
      </div>

      <div class="q-mt-md">
        <!-- LOVE CONNECTIONS -->
        <template v-if="title === 'Love Connections'">
          <div class="connections-feed">
            <div
              v-for="connection in connections"
              :key="connection.id"
              class="connection-item"
            >
              <q-avatar size="40px" font-size="24px" class="user-avatar bg-red text-white">
                <img v-if="connection.user?.avatar_url" :src="connection.user.avatar_url" />
                <span v-else>💕</span>
              </q-avatar>
              <div class="connection-text">
                <div class="text-body2 text-grey-8">
                  <strong>{{ connection.user?.display_name || 'Someone Special' }}</strong>
                  {{ connection.action }}
                </div>
                <div class="text-caption text-grey-5">{{ timeAgo(connection.created_at) }}</div>
              </div>
            </div>
          </div>
          <q-btn class="cta-button" label="Find Your Match" to="/edifeeds-love" unelevated />
        </template>

        <!-- PRAYER PARTNERS -->
        <template v-else-if="title === 'Prayer Partners'">
          <div class="prayer-partners">
            <div
              v-for="partner in partners"
              :key="partner.id"
              class="partner-item"
            >
              <div class="partner-info">
                <div class="text-body1 text-weight-bold">{{ partner.name }}</div>
                <p class="text-body2 text-grey-7">"{{ partner.prayer_topic }}"</p>
              </div>
              <div class="partner-stats text-caption text-grey-5">
                <span>🙏 {{ partner.prayers_together }} prayers together</span>
              </div>
            </div>
          </div>
          <q-btn class="cta-button" label="Find Prayer Partner" @click="showPartnerDialog = true" unelevated />

          <!-- Find Prayer Partner Dialog -->
          <q-dialog v-model="showPartnerDialog">
            <q-card>
              <q-card-section>
                <div class="text-h6">Find a Prayer Partner</div>
                <q-input v-model="prayerTopic" type="textarea" label="What would you like to pray about together?" />
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Cancel" v-close-popup />
                <q-btn color="red" label="Find Partner" @click="findPrayerPartner" />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </template>

        <!-- CHRISTIAN MATCHES -->
        <template v-else-if="title === 'Christian Matches'">
          <div class="matches-list">
            <div
              v-for="match in matches"
              :key="match.id"
              class="match-item"
            >
              <q-avatar size="50px" class="match-avatar">
                <img v-if="match.avatar_url" :src="match.avatar_url" />
                <span v-else class="text-h6">{{ match.name?.charAt(0) }}</span>
              </q-avatar>
              <div class="match-info">
                <div class="text-body1 text-weight-bold">{{ match.name }}</div>
                <div class="text-caption text-grey-7">
                  {{ match.age }} • {{ match.denomination }} • {{ match.distance }}
                </div>
                <div class="text-body2 text-red-7 q-mt-xs">
                  "{{ match.favorite_verse }}"
                </div>
              </div>
              <q-btn
                round
                color="red"
                icon="favorite"
                @click="likeProfile(match.id)"
                size="sm"
              />
            </div>
          </div>
          <q-btn class="cta-button" label="Browse All Matches" to="/edifeeds-love" unelevated />
        </template>

        <!-- CHRISTIAN DATING TIPS -->
        <template v-else-if="title === 'Dating with Faith'">
          <div class="faith-tips">
            <div
              v-for="tip in faithTips"
              :key="tip.id"
              class="tip-item"
            >
              <div class="tip-icon">{{ tip.icon }}</div>
              <div>
                <div class="text-body1 text-weight-bold">{{ tip.title }}</div>
                <p class="text-body2 text-grey-7">{{ tip.content }}</p>
              </div>
            </div>
          </div>
          <q-btn class="cta-button" label="Read More Tips" to="/edifeeds-love" unelevated />
        </template>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabase";
import { useQuasar } from "quasar";

const props = defineProps({
  icon: String,
  title: String,
  subtitle: String,
  mainFeature: {
    type: Boolean,
    default: false,
  },
});

//const router = useRouter()
const $q = useQuasar();
const connections = ref([]);
const partners = ref([]);
const matches = ref([]);
const faithTips = ref([]);
const showPartnerDialog = ref(false);
const prayerTopic = ref("");

// Load Data
onMounted(async () => {
  /*if (props.title === "Love Connections") {
    let { data } = await supabase
      .from("love_activities")
      .select("*, user:user_id(display_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(3);
    connections.value = data || [];
  }

  if (props.title === "Prayer Partners") {
    let { data } = await supabase
      .from("prayer_partners")
      .select("*")
      .order("prayers_together", { ascending: false })
      .limit(2);
    partners.value = data || [];
  }

  if (props.title === "Christian Matches") {
    let { data } = await supabase
      .from("dating_profiles")
      .select("*")
      .eq("is_active", true)
      .limit(3);
    matches.value = data || [];
  }

  if (props.title === "Dating with Faith") {
    // Load faith-based dating tips
    faithTips.value = [
      {
        id: 1,
        icon: "📖",
        title: "Pray Together",
        content: "Couples who pray together grow stronger in faith and love."
      },
      {
        id: 2,
        icon: "💝",
        title: "Honor Boundaries",
        content: "Respect each other's values and commitment to purity."
      }
    ];
  }*/
});

// Find Prayer Partner
const findPrayerPartner = async () => {
  if (!prayerTopic.value) return;

  try {
    const { data: user } = await supabase.auth.getUser();
    await supabase.from("prayer_partner_requests").insert({
      user_id: user.user.id,
      prayer_topic: prayerTopic.value,
    });

    $q.notify({ type: "positive", message: "Finding your prayer partner 🙏❤️" });
    showPartnerDialog.value = false;
    prayerTopic.value = "";
  } catch (error) {
    $q.notify({ type: "negative", message: "Error finding prayer partner" });
  }
};

// Like Profile
const likeProfile = async (profileId) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    await supabase.from("profile_likes").insert({
      liker_id: user.user.id,
      liked_id: profileId,
    });

    $q.notify({ type: "positive", message: "Profile liked! ❤️" });
  } catch (error) {
    $q.notify({ type: "negative", message: "Error liking profile" });
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
.love-card-container {
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(220, 38, 127, 0.15);
  border: 1px solid rgba(220, 38, 127, 0.1);
  background: linear-gradient(145deg, #fff 0%, #fef7f7 100%);
}

.love-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.love-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
}

.connection-item, .partner-item, .tip-item {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(239, 68, 68, 0.03) 100%);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.8rem;
  border: 1px solid rgba(220, 38, 38, 0.1);
}

.connection-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.match-item {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(239, 68, 68, 0.03) 100%);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(220, 38, 38, 0.1);
}

.match-avatar {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
}

.match-info {
  flex: 1;
}

.partner-stats {
  margin-top: 0.5rem;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.tip-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.cta-button {
  width: 100%;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  margin-top: 1rem;
  border-radius: 12px;
  padding: 12px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);

  &:hover {
    box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
    transform: translateY(-1px);
  }
}

.user-avatar {
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
}

// Add some romantic touches
.love-card-container::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(45deg, #dc2626, #f87171, #dc2626);
  border-radius: 20px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.love-card-container:hover::before {
  opacity: 0.1;
}
</style>
