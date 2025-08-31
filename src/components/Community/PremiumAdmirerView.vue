<template>
<!-- Who Liked You Section - Premium Version -->
<div class="text-h6 text-weight-bold q-mt-xl q-mb-md flex items-center">
  <q-icon name="favorite" color="pink-6" class="q-mr-sm" />
  Who Admires You
  <q-chip size="sm" color="pink-1" text-color="pink-7" class="q-ml-sm">
    {{ admirers.length }}
  </q-chip>
  <q-chip size="sm" color="gradient-pink" text-color="white" class="q-ml-sm">
    <q-icon name="star" size="xs" class="q-mr-xs" />
    Premium
  </q-chip>
</div>

<div class="row q-col-gutter-md">
  <div
    v-for="admirer in admirers"
    :key="admirer.id"
    class="col-12 col-sm-6 col-md-4"
  >
    <q-card class="like-card cursor-pointer" @click="viewProfile(admirer.id)">
      <div class="relative-position">
        <q-img :src="admirer.avatar" ratio="1" class="rounded-t-borders" />
        <!-- Online status indicator -->
        <q-badge
          v-if="admirer.isOnline"
          color="positive"
          floating
          class="online-badge"
        >
          <q-icon name="circle" size="xs" />
        </q-badge>
        <!-- New like indicator -->
        <q-badge
          v-if="admirer.isNew"
          color="pink-6"
          floating
          style="top: 12px; right: 12px;"
        >
          New
        </q-badge>
      </div>

      <q-card-section class="q-pa-sm">
        <div class="text-subtitle2 text-weight-medium">{{ admirer.name }}</div>
        <div class="text-caption text-grey-6 q-mb-xs">
          {{ admirer.age }} years old • {{ admirer.distance }} away
        </div>

        <!-- Match percentage if available -->
        <div v-if="admirer.matchPercentage" class="flex items-center q-mb-xs">
          <q-icon name="favorite" size="xs" color="pink-6" class="q-mr-xs" />
          <span class="text-caption text-pink-6 text-weight-medium">
            {{ admirer.matchPercentage }}% match
          </span>
        </div>

        <!-- Mutual interests -->
        <div v-if="admirer.mutualInterests && admirer.mutualInterests.length" class="q-mb-sm">
          <div class="text-caption text-grey-7 q-mb-xs">Mutual interests:</div>
          <div class="flex q-gutter-xs">
            <q-chip
              v-for="interest in admirer.mutualInterests.slice(0, 2)"
              :key="interest"
              size="xs"
              color="pink-1"
              text-color="pink-7"
              dense
            >
              {{ interest }}
            </q-chip>
            <q-chip
              v-if="admirer.mutualInterests.length > 2"
              size="xs"
              color="grey-2"
              text-color="grey-7"
              dense
            >
              +{{ admirer.mutualInterests.length - 2 }}
            </q-chip>
          </div>
        </div>

        <!-- Like timestamp -->
        <div class="text-caption text-grey-5">
          <q-icon name="schedule" size="xs" class="q-mr-xs" />
          Liked {{ formatTimeAgo(admirer.likedAt) }}
        </div>
      </q-card-section>

      <q-card-actions class="q-pa-sm q-pt-none">
        <q-btn
          color="pink-6"
          label="View Profile"
          @click.stop="viewProfile(admirer)"
          class="full-width"
          outline
        />
      </q-card-actions>
    </q-card>
  </div>

  <!-- Empty state when no admirers -->
  <div v-if="admirers.length === 0" class="col-12">
    <q-card class="text-center q-pa-lg">
      <q-icon name="favorite_border" size="64px" color="grey-4" class="q-mb-md" />
      <div class="text-h6 text-grey-6 q-mb-sm">No admirers yet</div>
      <div class="text-body2 text-grey-5">
        Keep swiping and updating your profile to attract more matches!
      </div>
    </q-card>
  </div>
</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

  const props = defineProps({
    admirers: {
      type: Array,
      required: true
    }
  });

  const router = useRouter();
  const viewProfile = (admirer: any) => {
    // Navigate to user's profile
    router.push({
      name: 'edifeeds-love-profile',
      params: {
        otherUser: JSON.stringify(admirer)
      }
    });
  };

  const formatTimeAgo = (timestamp: string | number | Date) => {
    // Format timestamp to human-readable format
    const now = new Date();
    const liked = new Date(timestamp);
    const diff = now.getTime() - liked.getTime();

    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return `${Math.floor(diff/86400000)}d ago`;
  }
</script>
<style scoped>
.like-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.like-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.online-badge {
  top: 8px;
  right: 8px;
  border: 2px solid white;
}

.blur-img {
  filter: none; /* Remove blur for premium users */
}
</style>
