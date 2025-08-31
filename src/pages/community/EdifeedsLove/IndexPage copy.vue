<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-1">
    <!-- Header -->
    <q-header elevated class="bg-pink-6 text-white">
      <q-toolbar>
        <q-toolbar-title>💖 Edifeeds Love</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Tabs -->
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
          <q-tab name="discover" label="Discover" icon="favorite" />
          <q-tab name="matches" label="Matches" icon="chat" />
          <q-tab name="groups" label="Groups" icon="groups" />
          <q-tab name="events" label="Events" icon="event" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <!-- Discover Tab -->
          <q-tab-panel name="discover">
            <div class="q-pa-md row q-col-gutter-md">
              <div
                v-for="user in profiles"
                :key="user.id"
                class="col-12 col-sm-6 col-md-4"
              >
                <q-card class="rounded-borders shadow-2">
                  <q-img
                    :src="user.avatar"
                    ratio="4/5"
                    class="rounded-t-borders"
                  >
                    <div
                      v-if="user.boosted"
                      class="absolute-top-right bg-pink-6 text-white text-caption q-pa-xs rounded-borders"
                    >
                      Boosted ✨
                    </div>
                  </q-img>
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-bold">
                      {{ user.name }}, {{ user.age }}
                    </div>
                    <div class="text-caption text-grey-7 ellipsis-2-lines">
                      {{ user.bio }}
                    </div>
                  </q-card-section>
                  <q-card-actions align="between">
                    <q-btn flat round color="pink" icon="favorite" @click="likeUser(user)" />
                    <q-btn flat round color="primary" icon="chat" @click="messageUser(user)" />
                    <q-btn
                      v-if="user.premiumHint"
                      flat
                      dense
                      class="text-caption text-pink-7"
                      @click="upgradePremium"
                    >
                      {{ user.premiumHint }}
                    </q-btn>
                  </q-card-actions>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- Matches Tab -->
          <q-tab-panel name="matches">
            <div class="q-pa-md">
              <div class="text-subtitle1 text-weight-bold q-mb-sm">Your Matches</div>
              <div class="row q-col-gutter-md">
                <div
                  v-for="match in matches"
                  :key="match.id"
                  class="col-12 col-sm-6 col-md-4"
                >
                  <q-card class="rounded-borders shadow-2">
                    <q-img :src="match.avatar" ratio="1" class="rounded-t-borders" />
                    <q-card-section>
                      <div class="text-subtitle1 text-weight-bold">
                        {{ match.name }}, {{ match.age }}
                      </div>
                      <div class="text-caption text-grey-7 ellipsis">
                        {{ match.bio }}
                      </div>
                    </q-card-section>
                    <q-card-actions align="between">
                      <q-btn flat round color="primary" icon="chat" @click="openChat(match)" />
                    </q-card-actions>
                  </q-card>
                </div>
              </div>

              <div class="text-subtitle1 text-weight-bold q-mt-lg q-mb-sm">
                Who Liked You ✨
              </div>
              <div class="row q-col-gutter-md">
                <div
                  v-for="like in likes"
                  :key="like.id"
                  class="col-12 col-sm-6 col-md-4"
                >
                  <q-card class="rounded-borders shadow-2">
                    <div class="relative-position">
                      <q-img :src="like.avatar" ratio="1" class="rounded-t-borders blur-img" />
                      <div class="absolute-full flex flex-center bg-dark bg-opacity-50 text-white">
                        Premium ✨
                      </div>
                    </div>
                    <q-card-section>
                      <div class="text-caption text-grey-7">
                        Unlock to see who liked you
                      </div>
                    </q-card-section>
                    <q-card-actions align="right">
                      <q-btn flat dense color="pink" label="Upgrade" @click="upgradePremium" />
                    </q-card-actions>
                  </q-card>
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- Groups Tab -->
          <q-tab-panel name="groups">
            <div class="q-pa-md row q-col-gutter-md">
              <div
                v-for="group in groups"
                :key="group.id"
                class="col-12 col-sm-6 col-md-4"
              >
                <q-card class="rounded-borders shadow-2 cursor-pointer" @click="joinGroup(group)">
                  <q-img :src="group.cover" ratio="16/9" class="rounded-t-borders">
                    <div
                      class="absolute-bottom bg-dark bg-opacity-50 text-white q-pa-sm text-subtitle2"
                    >
                      {{ group.title }}
                    </div>
                  </q-img>
                  <q-card-section>
                    <div class="text-caption text-grey-7 ellipsis-2-lines">
                      {{ group.description }}
                    </div>
                  </q-card-section>
                  <q-separator />
                  <q-card-actions align="between">
                    <div class="text-caption text-grey-6">
                      👥 {{ group.members }} members
                    </div>
                    <q-btn
                      v-if="group.premiumHint"
                      flat
                      dense
                      class="text-caption text-pink-7"
                      @click.stop="upgradePremium"
                    >
                      {{ group.premiumHint }}
                    </q-btn>
                  </q-card-actions>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <!-- Events Tab -->
          <q-tab-panel name="events">
            <div class="q-pa-md">
              <div v-for="event in events" :key="event.id" class="q-mb-md">
                <q-card class="rounded-borders shadow-2">
                  <q-img :src="event.banner" ratio="16/9" class="rounded-t-borders">
                    <div
                      v-if="event.sponsored"
                      class="absolute-top-right bg-pink-6 text-white text-caption q-pa-xs rounded-borders"
                    >
                      Sponsored ✨
                    </div>
                  </q-img>
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-bold">{{ event.title }}</div>
                    <div class="text-caption text-grey-7 q-mt-xs">
                      {{ event.date }} • {{ event.location }}
                    </div>
                    <div class="text-body2 text-grey-8 q-mt-sm ellipsis-2-lines">
                      {{ event.description }}
                    </div>
                  </q-card-section>
                  <q-separator />
                  <q-card-actions align="between">
                    <q-btn
                      v-if="event.free"
                      flat
                      dense
                      color="primary"
                      label="RSVP Free"
                      @click="rsvpEvent(event)"
                    />
                    <q-btn
                      v-else
                      flat
                      dense
                      color="pink"
                      :label="`Get Ticket (${event.price})`"
                      @click="buyTicket(event)"
                    />
                  </q-card-actions>
                </q-card>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from "vue";

const tab = ref("discover");

/* --- Discover data --- */
const profiles = ref([
  {
    id: 1,
    name: "Sarah",
    age: 26,
    bio: "Choir singer 🎶 | Loves outreach 💕 | Jeremiah 29:11",
    avatar: "https://source.unsplash.com/400x500/?woman,smile",
    boosted: true,
    premiumHint: null,
  },
  {
    id: 2,
    name: "David",
    age: 29,
    bio: "Worship leader ✝️ | Tech enthusiast 💻 | Hiking ⛰️",
    avatar: "https://source.unsplash.com/400x500/?man,portrait",
    boosted: false,
    premiumHint: "✨ See who liked you",
  },
]);

/* --- Matches data --- */
const matches = ref([
  {
    id: 1,
    name: "Grace",
    age: 27,
    bio: "Youth leader ✝️ | Loves missions 🌍",
    avatar: "https://source.unsplash.com/400x400/?woman,portrait",
  },
]);
const likes = ref([
  { id: 101, avatar: "https://source.unsplash.com/400x400/?portrait" },
]);

/* --- Groups data --- */
const groups = ref([
  {
    id: 1,
    title: "Prayer Partners 🙏",
    description: "Connect with others for daily prayer support and encouragement.",
    cover: "https://source.unsplash.com/800x400/?prayer,faith",
    members: 124,
    premiumHint: null,
  },
  {
    id: 2,
    title: "Faith & Entrepreneurs 💼✝️",
    description: "Discuss business, faith, and balancing your calling.",
    cover: "https://source.unsplash.com/800x400/?business,teamwork",
    members: 72,
    premiumHint: "✨ Advanced filters",
  },
]);

/* --- Events data --- */
const events = ref([
  {
    id: 1,
    title: "Online Prayer Night 🙏",
    date: "Aug 25, 2025",
    location: "Zoom",
    description: "Join believers across the globe for a night of prayer and worship.",
    banner: "https://source.unsplash.com/800x400/?prayer,church",
    free: true,
    sponsored: false,
  },
  {
    id: 2,
    title: "Faith & Love Retreat 💖",
    date: "Sept 10-12, 2025",
    location: "Lagos, Nigeria",
    description: "A 3-day singles retreat with teachings, worship, and fellowship.",
    banner: "https://source.unsplash.com/800x400/?retreat,beach",
    free: false,
    price: "$30",
    sponsored: true,
  },
]);

/* --- Actions --- */
const likeUser = (u) => console.log("Liked:", u.name);
const messageUser = (u) => console.log("Message:", u.name);
const openChat = (u) => console.log("Open chat with:", u.name);
const joinGroup = (g) => console.log("Join group:", g.title);
const rsvpEvent = (e) => console.log("RSVP:", e.title);
const buyTicket = (e) => console.log("Buy ticket:", e.title);
const upgradePremium = () => console.log("Upgrade premium...");
</script>

<style scoped>
.rounded-borders {
  border-radius: 20px;
}
.rounded-t-borders {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}
.blur-img {
  filter: blur(8px);
}
</style>
