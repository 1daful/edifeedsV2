<template>
  <q-page class="column justify-between bg-grey-2" v-if="match">
    <!-- Header -->
    <q-toolbar class="bg-white text-dark">
      <q-btn flat round dense icon="arrow_back" @click="$router.back()" />
      <q-item-label>{{ match.name }} </q-item-label>
      <q-avatar>
        <img :src="match.avatar" />
      </q-avatar>
      <div class="q-ml-sm">
        <div class="text-subtitle1">{{ match.name }}</div>
        <div class="text-caption text-grey">
          {{ match.online ? 'Online' : 'Last seen ' + formatTime(match.last_seen) }}
        </div>
      </div>
      <div class="text-caption text-grey">
        <span v-if="otherTyping">typing...</span>
        <span v-else>
          {{ match.online ? 'Online' : 'Last seen ' + formatTime(match.last_seen) }}
        </span>
      </div>
    </q-toolbar>

    <!-- Messages -->
    <div class="col scroll q-pa-md">
      <div v-for="msg in messages" :key="msg.id" class="q-mb-sm">
        <div
          :class="[
            'q-pa-sm q-px-md text-white rounded-borders',
            msg.sender_id === currentUserId ? 'bg-primary self-end' : 'bg-grey-6 self-start',
          ]"
          style="max-width: 70%"
        >
          <div>{{ msg.content }}</div>
          <div class="text-caption text-white text-right">
            {{ formatTime(msg.timestamp) }}
          </div>
          <div
            :class="[
              'q-pa-sm q-px-md rounded-borders',
              msg.sender_id === currentUserId
                ? 'bg-primary text-white self-end'
                : 'bg-grey-6 self-start',
            ]"
            style="max-width: 70%"
          >
            <div>{{ msg.text }}</div>
            <div class="text-caption text-right flex items-center">
              {{ formatTime(msg.timestamp) }}
              <span v-if="msg.sender_id === currentUserId" class="q-ml-xs">
                <q-icon v-if="!msg.sent" name="schedule" size="16px" />
                <!-- clock = sending -->
                <q-icon v-else-if="!msg.read" name="done" size="16px" />
                <!-- single check = delivered -->
                <q-icon v-else name="done_all" size="16px" color="lightblue" />
                <!-- double check = read -->
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <q-footer class="bg-white">
      <q-toolbar>
        <q-input
          v-model="newMessage"
          outlined
          dense
          rounded
          placeholder="Type a message..."
          class="col"
          @keyup.enter="sendMessage"
        />
        <q-btn
          round
          color="primary"
          icon="send"
          class="q-ml-sm"
          :disable="!newMessage.trim()"
          @click="sendMessage"
        />
      </q-toolbar>
    </q-footer>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { supabase } from '../../../lib/supabase'
import { useRoute } from 'vue-router'
import { useMatchStore } from '../../../stores/MatchStore'
import { date } from 'quasar'

const route = useRoute()

let currentUserId // replace with auth user id
const matchId = route.params.matchId // pass when navigating
const messages = ref([])
const newMessage = ref('')
const match = ref({})
const otherUserId = route.params.otherUserId
const typingTimeout = ref(null)
const otherTyping = ref(false)

async function loadMessages() {
  /*let { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })
  if (!error) messages.value = data*/

  match.value = useMatchStore().conversations.filter((conv) => conv.id == matchId)[0]
  messages.value = match.value?.messages || []
  console.log("Match: ", match.value)
}

const formatTime = (timestamp) => date.formatDate(timestamp, 'YYYY-MM-DD HH:mm:ss')

// realtime listener
function subscribeChat() {
  return supabase
    .channel(`chat-${matchId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
      (payload) => {
        messages.value.push(payload.new)
      },
    )
    .subscribe()
}

async function sendMessage() {
  if (!newMessage.value.trim()) return
  const { error } = await supabase.from('messages').insert([
    {
      match_id: matchId,
      sender_id: currentUserId,
      content: newMessage.value,
    },
  ])
  if (!error) newMessage.value = ''
}

let subscription
onMounted(async () => {
  currentUserId = (await (supabase.auth.getUser())).data.user?.id
  await loadMessages()
  subscription = subscribeChat()

  supabase
    .channel('typing')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_presence',
        filter: `user_id=eq.${otherUserId}`,
      },
      (payload) => {
        otherTyping.value = payload.new.is_typing
      },
    )
    .subscribe()

    console.log('RouteParams: ', route.query)
})

onUnmounted(() => {
  if (subscription) supabase.removeChannel(subscription)
})

// watch input for typing
watch(newMessage, async (val) => {
  if (val.trim() !== '') {
    await supabase.from('user_presence').update({ is_typing: true }).eq('user_id', currentUserId)
    resetTypingTimeout()
  }
})

function resetTypingTimeout() {
  clearTimeout(typingTimeout.value)
  typingTimeout.value = setTimeout(async () => {
    await supabase.from('user_presence').update({ is_typing: false }).eq('user_id', currentUserId)
  }, 2000)
}
</script>

<style scoped>
.self-end {
  margin-left: auto;
}
.self-start {
  margin-right: auto;
}
</style>
