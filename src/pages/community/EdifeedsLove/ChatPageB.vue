<template>
  <q-page class="column justify-between chat-container" v-if="match">
    <q-toolbar class="chat-header">
      <q-btn flat round dense icon="arrow_back" @click="$router.back()" class="back-btn" />
      <div class="header-user-info">
        <q-avatar size="45px" class="user-avatar">
          <img :src="match.avatar || '/default-avatar.png'" :alt="match.name" />
          <q-badge v-if="isOnline" floating rounded color="positive" class="online-indicator" />
        </q-avatar>
        <div class="user-details">
          <div class="user-name">{{ match.name || 'Unknown User' }}</div>
          <div class="user-status">
            <q-icon v-if="isOtherTyping" name="edit" size="12px" class="typing-icon" />
            <span class="status-text">
              {{ isOtherTyping ? 'typing...' : (isOnline ? 'Online' : 'Last seen ' + formatTime(match.last_seen)) }}
            </span>
          </div>
        </div>
      </div>
      <q-space />
      <div class="header-actions">
        <q-btn flat round dense icon="videocam" class="action-btn" />
        <q-btn flat round dense icon="call" class="action-btn" />
        <q-btn flat round dense icon="more_vert" class="action-btn">
          <q-menu>
            <q-list>
              <q-item clickable><q-item-section avatar><q-icon name="person" /></q-item-section><q-item-section>View Profile</q-item-section></q-item>
              <q-item clickable><q-item-section avatar><q-icon name="photo" /></q-item-section><q-item-section>Media & Files</q-item-section></q-item>
              <q-item clickable><q-item-section avatar><q-icon name="block" /></q-item-section><q-item-section>Block User</q-item-section></q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-toolbar>

    <div class="messages-container" ref="messagesContainer">
      <div class="messages-list">
        <div class="date-separator">
          <span class="date-text">{{ formatDate(new Date()) }}</span>
        </div>
        <transition-group name="message" tag="div">
          <div
            v-for="(msg, index) in messages"
            :key="msg.id || index"
            :class="['message-wrapper', { 'own-message': msg.sender_id === currentUserId }]"
          >
            <div
              :class="[
                'message-bubble',
                msg.sender_id === currentUserId ? 'sent-message' : 'received-message',
              ]"
            >
              <div class="message-content">
                <div class="message-text">{{ msg.content || '' }}</div>
              </div>
              <div class="message-footer">
                <span class="message-time">{{ formatTime(msg.created_at) }}</span>
                <div v-if="msg.sender_id === currentUserId" class="message-status">
                  <q-icon
                    v-if="!msg.id"
                    name="schedule"
                    size="14px"
                    class="status-icon pending"
                  />
                  <q-icon
                    v-else-if="!msg.read_at"
                    name="done"
                    size="14px"
                    class="status-icon delivered"
                  />
                  <q-icon
                    v-else
                    name="done_all"
                    size="14px"
                    class="status-icon read"
                  />
                </div>
              </div>
            </div>
          </div>
        </transition-group>
        <transition name="typing">
          <div v-if="isOtherTyping" class="typing-indicator">
            <div class="typing-bubble">
              <div class="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <q-footer class="chat-footer">
      <div class="input-container">
        <q-btn
          flat round dense icon="attach_file" class="attachment-btn"
          @click="showAttachmentMenu = !showAttachmentMenu"
        >
          <q-menu v-model="showAttachmentMenu" anchor="top left" self="bottom left">
            <q-list>
              <q-item clickable @click="selectFile('image')"><q-item-section avatar><q-icon name="photo" color="green" /></q-item-section><q-item-section>Photo</q-item-section></q-item>
              <q-item clickable @click="selectFile('video')"><q-item-section avatar><q-icon name="videocam" color="red" /></q-item-section><q-item-section>Video</q-item-section></q-item>
              <q-item clickable @click="selectFile('document')"><q-item-section avatar><q-icon name="description" color="blue" /></q-item-section><q-item-section>Document</q-item-section></q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <div class="input-wrapper">
          <q-input
            v-model="newMessage"
            placeholder="Type a message..."
            class="message-input"
            outlined dense rounded autogrow :maxlength="1000"
            @input="handleInput"
            @keyup.enter.exact="sendMessage"
            @keydown.enter.shift.exact.prevent
            :disable="isLoading"
          >
            <template v-slot:after>
              <q-btn flat round dense icon="emoji_emotions" class="emoji-btn" @click="showEmojiPicker = !showEmojiPicker" />
            </template>
          </q-input>
        </div>
        <transition name="send-btn">
          <q-btn
            v-if="newMessage.trim()"
            round color="primary" icon="send" class="send-btn"
            @click="sendMessage"
            :loading="isLoading"
          />
          <q-btn v-else round flat icon="mic" class="voice-btn" @click="startVoiceRecording" />
        </transition>
      </div>
    </q-footer>
  </q-page>

  <!-- Loading state when match is not available -->
  <q-page v-else class="flex flex-center">
    <q-spinner-dots size="50px" color="primary" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { supabase } from '../../../lib/supabase'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '../../../stores/useChat'
import { date } from 'quasar'
import { useMatchStore } from '../../../stores/MatchStore'

const route = useRoute()
const router = useRouter()
const matchStore = useMatchStore()
const chat = useChatStore()

const matchId = route.params.matchId as string
const otherUserId = route.query.otherUserId as string
const messagesContainer = ref<HTMLDivElement | null>(null)
const newMessage = ref('')
const match = ref<any>(null)
const showAttachmentMenu = ref(false)
const showEmojiPicker = ref(false)
const isLoading = ref(false)

// Computed properties with null checks
const messages = chat.getMessages(matchId)
const isOtherTyping = computed(() => {
  const typingUsers = chat.getTypingUsers(matchId)
  return typingUsers?.value?.includes(otherUserId) || false
})
const isOnline = computed(() => {
  const presence = chat.getPresence(matchId)
  return presence?.value?.some(p => p.userId === otherUserId) || false
})
const currentUserId = computed(() => chat.currentUserId)

const formatTime = (timestamp: string | null | undefined) => {
  if (!timestamp) return ''
  try {
    const msgDate = new Date(timestamp)
    if (isNaN(msgDate.getTime())) return ''

    const now = new Date()
    const isToday = msgDate.toDateString() === now.toDateString()
    return isToday ? date.formatDate(timestamp, 'HH:mm') : date.formatDate(timestamp, 'MMM D, HH:mm')
  } catch (error) {
    console.error('Error formatting time:', error)
    return ''
  }
}

const formatDate = (dateObj: Date) => {
  try {
    return date.formatDate(dateObj, 'YYYY-MM-DD')
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

async function sendMessage() {
  if (!newMessage.value.trim() || isLoading.value) return

  try {
    isLoading.value = true
    await chat.sendMessage(matchId, otherUserId, newMessage.value)
    newMessage.value = ''
    scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
    // You might want to show a toast notification here
  } finally {
    isLoading.value = false
  }
}

function handleInput() {
  try {
    chat.onUserInput(matchId)
  } catch (error) {
    console.error('Error handling input:', error)
  }
}

function selectFile(type: string) {
  console.log('Selected file type:', type)
  showAttachmentMenu.value = false
}

function startVoiceRecording() {
  console.log('Starting voice recording')
}

// Watch messages with error handling
watch(messages, (newMessages) => {
  if (newMessages && Array.isArray(newMessages)) {
    scrollToBottom()
  }
}, { deep: true })

onMounted(async () => {
  try {
    // Validate required route parameters
    if (!matchId || !otherUserId) {
      console.error('Missing required parameters: matchId or otherUserId')
      router.back()
      return
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Authentication error:', authError)
      return
    }

    if (!user) {
      console.error('User not authenticated')
      router.push('/login') // Adjust route as needed
      return
    }

    chat.setCurrentUser(user.id)

    // Fetch user profile with error handling
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.warn('Could not fetch user profile:', profileError)
      }

      const userProfile = {
        name: profile?.name || 'Unknown User',
        avatar: profile?.avatar_url || '/default-avatar.png',
        userId: user.id
      }

      await chat.subscribeChat(matchId, userProfile)
    } catch (profileError) {
      console.error('Error fetching profile:', profileError)
      // Continue with default profile
      const userProfile = {
        name: 'Unknown User',
        avatar: '/default-avatar.png',
        userId: user.id
      }
      await chat.subscribeChat(matchId, userProfile)
    }

    // Get match data with error handling
    try {
      const getMatch = matchStore.getMatch(matchId)
      if (getMatch) {
        match.value = getMatch.admirer || getMatch.favourite || getMatch.match
      } else {
        console.warn('Match not found in store')
        // You might want to fetch from API here
      }
    } catch (error) {
      console.error('Error getting match:', error)
    }

    // Load chat history
    try {
      await chat.loadHistory(matchId)
      await chat.markRead(matchId)
      scrollToBottom()
    } catch (error) {
      console.error('Error loading chat history:', error)
    }

  } catch (err) {
    console.error('An error occurred during chat initialization:', err)
  }
})

onUnmounted(() => {
  try {
    chat.unsubscribeChat(matchId)
  } catch (error) {
    console.error('Error unsubscribing from chat:', error)
  }
})
</script>

<style scoped>
.chat-container {
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.chat-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 8px 16px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.back-btn {
  margin-right: 8px;
  color: #2c3e50;
}

.header-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  position: relative;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.online-indicator {
  width: 12px !important;
  height: 12px !important;
  border: 2px solid white;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 2px;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-text {
  font-size: 12px;
  color: #7f8c8d;
}

.typing-icon {
  color: #3498db;
  animation: pulse 1s infinite;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  color: #7f8c8d;
  transition: color 0.2s ease;
}

.action-btn:hover {
  color: #3498db;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  scroll-behavior: smooth;
}

.messages-list {
  padding: 16px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.date-separator {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.date-text {
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: #7f8c8d;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-wrapper {
  display: flex;
  margin-bottom: 12px;
  animation: fadeInUp 0.3s ease;
}

.message-wrapper.own-message {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 20px;
  position: relative;
  word-wrap: break-word;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.sent-message {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 8px;
}

.received-message {
  background: rgba(255, 255, 255, 0.95);
  color: #2c3e50;
  border-bottom-left-radius: 8px;
  backdrop-filter: blur(20px);
}

.message-content {
  margin-bottom: 4px;
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
}

.message-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
}

.message-status {
  display: flex;
  align-items: center;
}

.status-icon {
  opacity: 0.7;
}

.status-icon.read {
  color: #3498db;
  opacity: 1;
}

.typing-indicator {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 12px;
}

.typing-bubble {
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 16px;
  border-radius: 20px;
  border-bottom-left-radius: 8px;
  backdrop-filter: blur(20px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #bdc3c7;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

.chat-footer {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 12px 16px;
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.attachment-btn, .emoji-btn, .voice-btn {
  color: #7f8c8d;
  transition: color 0.2s ease;
}

.attachment-btn:hover, .emoji-btn:hover {
  color: #3498db;
}

.input-wrapper {
  flex: 1;
}

.message-input {
  border-radius: 25px;
}

.message-input :deep(.q-field__control) {
  border-radius: 25px;
}

.send-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transform: scale(1);
  transition: transform 0.2s ease;
}

.send-btn:hover {
  transform: scale(1.05);
}

.voice-btn {
  color: #e74c3c;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.message-enter-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.typing-enter-active, .typing-leave-active {
  transition: all 0.3s ease;
}

.typing-enter-from, .typing-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.send-btn-enter-active, .send-btn-leave-active {
  transition: all 0.2s ease;
}

.send-btn-enter-from, .send-btn-leave-to {
  opacity: 0;
  transform: scale(0);
}

.messages-container::-webkit-scrollbar {
  width: 4px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
