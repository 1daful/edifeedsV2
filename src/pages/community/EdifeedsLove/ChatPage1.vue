<template>
  <q-page class="column justify-between bg-grey-1" v-if="match">
    <!-- Header with enhanced styling -->
    <q-toolbar class="bg-white text-dark shadow-2 q-px-md">
      <q-btn
        flat
        round
        dense
        icon="arrow_back"
        @click="handleBack"
        class="q-mr-sm"
      />

      <q-avatar size="40px" class="q-mr-sm">
        <img :src="match.avatar || '/default-avatar.png'" />
        <!-- Online status indicator -->
        <q-badge
          v-if="match.online"
          floating
          color="positive"
          rounded
          style="right: 2px; bottom: 2px;"
        />
      </q-avatar>

      <div class="column justify-center flex-1">
        <div class="text-subtitle1 text-weight-medium">{{ match.name }}</div>
        <div class="text-caption text-grey-6">
          <span v-if="otherTyping" class="text-primary">
            <q-spinner-dots size="16px" class="q-mr-xs" />
            typing...
          </span>
          <span v-else-if="match.online" class="text-positive">Online</span>
          <span v-else class="text-grey-5">Last seen {{ formatTime(match.last_seen) }}</span>
        </div>
      </div>

      <!-- Additional header actions -->
      <q-btn flat round dense icon="videocam" @click="startVideoCall" class="q-mr-xs" />
      <q-btn flat round dense icon="call" @click="startVoiceCall" class="q-mr-xs" />
      <q-btn flat round dense icon="more_vert" @click="showMatchOptions = true" />
    </q-toolbar>

    <!-- Messages with enhanced UI -->
    <q-scroll-area
      ref="scrollArea"
      class="col q-px-md q-py-sm"
      :thumb-style="thumbStyle"
      :bar-style="barStyle"
    >
      <div v-for="(msg, index) in messages" :key="msg.id" class="q-mb-sm">
        <!-- Date separator -->
        <div
          v-if="shouldShowDateSeparator(msg, index)"
          class="text-center q-my-md"
        >
          <q-chip
            color="grey-4"
            text-color="grey-7"
            size="sm"
            :label="formatDateSeparator(msg.timestamp)"
          />
        </div>

        <!-- Message bubble with enhanced styling -->
        <div
          :class="[
            'row',
            msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'
          ]"
        >
          <div
            :class="[
              'q-pa-sm q-px-md rounded-borders-lg shadow-1 relative-position',
              msg.sender_id === currentUserId
                ? 'bg-primary text-white message-sent'
                : 'bg-white text-dark message-received',
            ]"
            style="max-width: 75%; min-width: 80px;"
            @contextmenu.prevent="showMessageOptions(msg, $event)"
          >
            <!-- Message content with better formatting -->
            <div class="message-content">
              <div v-if="msg.reply_to" class="reply-preview q-mb-xs">
                <q-separator class="q-mb-xs" />
                <div class="text-caption opacity-70">
                  {{ getReplyPreview(msg.reply_to) }}
                </div>
                <q-separator class="q-mt-xs" />
              </div>

              <div class="message-text">{{ msg.content || msg.text }}</div>

              <!-- Message metadata -->
              <div class="row items-center justify-end q-mt-xs">
                <span class="text-caption" :class="msg.sender_id === currentUserId ? 'text-white' : 'text-grey-6'">
                  {{ formatTime(msg.timestamp) }}
                </span>

                <!-- Message status for sent messages -->
                <div v-if="msg.sender_id === currentUserId" class="q-ml-xs">
                  <q-icon
                    v-if="msg.status === 'sending'"
                    name="schedule"
                    size="14px"
                    class="text-white opacity-70"
                  />
                  <q-icon
                    v-else-if="msg.status === 'sent'"
                    name="done"
                    size="14px"
                    class="text-white opacity-70"
                  />
                  <q-icon
                    v-else-if="msg.status === 'delivered'"
                    name="done_all"
                    size="14px"
                    class="text-white opacity-70"
                  />
                  <q-icon
                    v-else-if="msg.status === 'read'"
                    name="done_all"
                    size="14px"
                    class="text-light-blue-3"
                  />
                  <q-icon
                    v-else-if="msg.status === 'failed'"
                    name="error"
                    size="14px"
                    class="text-negative"
                    @click="resendMessage(msg)"
                  />
                </div>
              </div>
            </div>

            <!-- Message tail -->
            <div
              :class="[
                'message-tail',
                msg.sender_id === currentUserId ? 'message-tail-sent' : 'message-tail-received'
              ]"
            />
          </div>
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="otherTyping && !messages.some(m => m.sender_id !== currentUserId && m.status === 'typing')"
           class="row justify-start q-mb-sm">
        <div class="bg-grey-4 q-pa-sm q-px-md rounded-borders-lg">
          <q-spinner-dots size="20px" color="grey-7" />
        </div>
      </div>

      <!-- Scroll to bottom button -->
      <q-page-sticky
        v-if="showScrollButton"
        position="bottom-right"
        :offset="[18, 80]"
      >
        <q-btn
          fab-mini
          color="primary"
          icon="keyboard_arrow_down"
          @click="scrollToBottom"
        />
      </q-page-sticky>
    </q-scroll-area>

    <!-- Enhanced Input Area -->
    <q-footer class="bg-white">
      <!-- Reply preview -->
      <div v-if="replyingTo" class="q-px-md q-pt-sm">
        <q-card flat bordered class="reply-card">
          <q-card-section class="q-pa-sm">
            <div class="row items-center">
              <q-icon name="reply" size="16px" class="text-primary q-mr-xs" />
              <div class="col text-caption text-grey-7">
                Replying to {{ getReplyPreview(replyingTo) }}
              </div>
              <q-btn
                flat
                round
                dense
                size="sm"
                icon="close"
                @click="cancelReply"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <q-toolbar class="q-px-md">
        <!-- Attachment button -->
        <q-btn
          flat
          round
          dense
          icon="attach_file"
          @click="showAttachmentOptions = true"
          class="q-mr-sm"
        />

        <!-- Message input with enhanced features -->
        <q-input
          ref="messageInput"
          v-model="newMessage"
          outlined
          dense
          rounded
          placeholder="Type a message..."
          class="col"
          :loading="sendingMessage"
          @keyup.enter="handleEnterKey"
          @keydown="handleTyping"
          @focus="markMessagesAsRead"
          autogrow
          :max-height="120"
        >
          <!-- Emoji button -->
          <template v-slot:append>
            <q-btn
              flat
              round
              dense
              icon="sentiment_satisfied"
              @click="showEmojiPicker = !showEmojiPicker"
            />
          </template>
        </q-input>

        <!-- Send/Voice button -->
        <q-btn
          round
          :color="newMessage.trim() ? 'primary' : 'grey-5'"
          :icon="newMessage.trim() ? 'send' : 'mic'"
          class="q-ml-sm"
          :disable="sendingMessage"
          @click="newMessage.trim() ? sendMessage() : startVoiceMessage()"
        />
      </q-toolbar>
    </q-footer>

    <!-- Match Options Dialog -->
    <q-dialog v-model="showMatchOptions">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Chat Options</div>
        </q-card-section>
        <q-list>
          <q-item clickable @click="clearChat">
            <q-item-section avatar>
              <q-icon name="clear_all" />
            </q-item-section>
            <q-item-section>Clear Chat</q-item-section>
          </q-item>
          <q-item clickable @click="blockUser">
            <q-item-section avatar>
              <q-icon name="block" color="negative" />
            </q-item-section>
            <q-item-section>Block User</q-item-section>
          </q-item>
          <q-item clickable @click="reportUser">
            <q-item-section avatar>
              <q-icon name="report" color="negative" />
            </q-item-section>
            <q-item-section>Report User</q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>

    <!-- Message Options Menu -->
    <q-menu v-model="messageOptionsMenu" :target="messageOptionsTarget" context-menu>
      <q-list dense>
        <q-item clickable @click="replyToMessage(selectedMessage)">
          <q-item-section avatar><q-icon name="reply" /></q-item-section>
          <q-item-section>Reply</q-item-section>
        </q-item>
        <q-item clickable @click="copyMessage(selectedMessage)">
          <q-item-section avatar><q-icon name="content_copy" /></q-item-section>
          <q-item-section>Copy</q-item-section>
        </q-item>
        <q-item
          v-if="selectedMessage?.sender_id === currentUserId"
          clickable
          @click="deleteMessage(selectedMessage)"
        >
          <q-item-section avatar><q-icon name="delete" color="negative" /></q-item-section>
          <q-item-section>Delete</q-item-section>
        </q-item>
      </q-list>
    </q-menu>

    <!-- Attachment Options -->
    <q-dialog v-model="showAttachmentOptions">
      <q-card>
        <q-card-section>
          <div class="text-h6">Send Attachment</div>
        </q-card-section>
        <q-list>
          <q-item clickable @click="selectImage">
            <q-item-section avatar>
              <q-icon name="image" color="primary" />
            </q-item-section>
            <q-item-section>Photo</q-item-section>
          </q-item>
          <q-item clickable @click="selectFile">
            <q-item-section avatar>
              <q-icon name="attach_file" color="primary" />
            </q-item-section>
            <q-item-section>File</q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { supabase } from '../../../lib/supabase'
import { useRoute, useRouter } from 'vue-router'
import { useMatchStore } from '../../../stores/MatchStore'
import { date, Notify, copyToClipboard } from 'quasar'

const route = useRoute()
const router = useRouter()
const scrollArea = ref(null)
const messageInput = ref(null)

// State management
let currentUserId = ref('')
const matchId = route.params.matchId
const messages = ref([])
const newMessage = ref('')
const match = ref({})
const otherUserId = route.params.otherUserId
const typingTimeout = ref(null)
const otherTyping = ref(false)
const sendingMessage = ref(false)
const showScrollButton = ref(false)

// UI State
const showMatchOptions = ref(false)
const showAttachmentOptions = ref(false)
const showEmojiPicker = ref(false)
const messageOptionsMenu = ref(false)
const messageOptionsTarget = ref(null)
const selectedMessage = ref(null)
const replyingTo = ref(null)

// Enhanced data loading with error handling
async function loadMessages() {
  try {
    match.value = useMatchStore().conversations.find((conv) => conv.id == matchId)
    if (!match.value) {
      throw new Error('Match not found')
    }

    messages.value = match.value?.messages?.map(msg => ({
      ...msg,
      status: msg.status || 'sent'
    })) || []

    await nextTick()
    scrollToBottom()
    markMessagesAsRead()
  } catch (error) {
    console.error('Error loading messages:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to load messages',
      timeout: 3000
    })
  }
}

// Enhanced message sending with optimistic updates
async function sendMessage() {
  if (!newMessage.value.trim() || sendingMessage.value) return

  const messageContent = newMessage.value.trim()
  const tempId = `temp_${Date.now()}`

  // Optimistic update
  const optimisticMessage = {
    id: tempId,
    content: messageContent,
    sender_id: currentUserId.value,
    timestamp: new Date(),
    status: 'sending',
    reply_to: replyingTo.value?.id || null
  }

  messages.value.push(optimisticMessage)
  newMessage.value = ''
  replyingTo.value = null
  sendingMessage.value = true

  await nextTick()
  scrollToBottom()

  try {
    const { data, error } = await supabase.from('messages').insert([
      {
        match_id: matchId,
        sender_id: currentUserId.value,
        content: messageContent,
        receiver_id: optimisticMessage.reply_to
      }
    ]).select().single()

    if (error) throw error

    // Update optimistic message with real data
    const messageIndex = messages.value.findIndex(m => m.id === tempId)
    if (messageIndex !== -1) {
      messages.value[messageIndex] = { ...data, status: 'sent' }
    }

  } catch (error) {
    console.error('Error sending message:', error)

    // Update message status to failed
    const messageIndex = messages.value.findIndex(m => m.id === tempId)
    if (messageIndex !== -1) {
      messages.value[messageIndex].status = 'failed'
    }

    Notify.create({
      type: 'negative',
      message: 'Failed to send message',
      actions: [
        { label: 'Retry', handler: () => resendMessage(optimisticMessage) }
      ]
    })
  } finally {
    sendingMessage.value = false
  }
}

// Enhanced realtime subscription with better error handling
function subscribeChat() {
  return supabase
    .channel(`chat-${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`
      },
      (payload) => {
        // Avoid duplicates from optimistic updates
        if (!messages.value.find(m => m.id === payload.new.id)) {
          messages.value.push({ ...payload.new, status: 'delivered' })
          nextTick(() => scrollToBottom())

          // Show notification if message is from other user
          if (payload.new.sender_id !== currentUserId.value) {
            if (document.hidden) {
              new Notification(`New message from ${match.value.name}`, {
                body: payload.new.content,
                icon: match.value.avatar
              })
            }
          }
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`
      },
      (payload) => {
        const messageIndex = messages.value.findIndex(m => m.id === payload.new.id)
        if (messageIndex !== -1) {
          messages.value[messageIndex] = { ...payload.new }
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to chat')
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Error subscribing to chat')
      }
    })
}

// Enhanced typing indicator
async function handleTyping() {
  if (!currentUserId.value) return

  try {
    await supabase
      .from('user_presence')
      .update({ is_typing: true, last_typing: new Date() })
      .eq('user_id', currentUserId.value)

    resetTypingTimeout()
  } catch (error) {
    console.error('Error updating typing status:', error)
  }
}

function resetTypingTimeout() {
  clearTimeout(typingTimeout.value)
  typingTimeout.value = setTimeout(async () => {
    try {
      await supabase
        .from('user_presence')
        .update({ is_typing: false })
        .eq('user_id', currentUserId.value)
    } catch (error) {
      console.error('Error clearing typing status:', error)
    }
  }, 2000)
}

// Message utilities
function formatTime(timestamp) {
  return date.formatDate(new Date(timestamp), 'HH:mm')
}

function formatDateSeparator(timestamp) {
  const messageDate = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.isSameDate(messageDate, today, 'day')) {
    return 'Today'
  } else if (date.isSameDate(messageDate, yesterday, 'day')) {
    return 'Yesterday'
  } else {
    return date.formatDate(messageDate, 'MMMM D, YYYY')
  }
}

function shouldShowDateSeparator(msg, index) {
  if (index === 0) return true

  const currentDate = new Date(msg.timestamp)
  const previousDate = new Date(messages.value[index - 1].timestamp)

  return !date.isSameDate(currentDate, previousDate, 'day')
}

// Enhanced UI functions
function scrollToBottom() {
  if (scrollArea.value) {
    scrollArea.value.setScrollPosition('vertical', 99999, 300)
  }
}

function handleEnterKey(event) {
  if (event.shiftKey) {
    // Allow new line with Shift+Enter
    return
  }
  event.preventDefault()
  sendMessage()
}

function handleBack() {
  router.back()
}

// Message actions
function showMessageOptions(message, event) {
  selectedMessage.value = message
  messageOptionsTarget.value = event.target
  messageOptionsMenu.value = true
}

function replyToMessage(message) {
  replyingTo.value = message
  messageOptionsMenu.value = false
  messageInput.value?.focus()
}

function cancelReply() {
  replyingTo.value = null
}

function getReplyPreview(message) {
  if (typeof message === 'string') return message
  return message?.content?.substring(0, 50) + (message?.content?.length > 50 ? '...' : '') || ''
}

async function copyMessage(message) {
  try {
    await copyToClipboard(message.content)
    Notify.create({
      type: 'positive',
      message: 'Message copied to clipboard',
      timeout: 2000
    })
  } catch (error) {
    console.error('Error copying message:', error)
  }
  messageOptionsMenu.value = false
}

async function deleteMessage(message) {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', message.id)

    if (error) throw error

    messages.value = messages.value.filter(m => m.id !== message.id)

    Notify.create({
      type: 'positive',
      message: 'Message deleted',
      timeout: 2000
    })
  } catch (error) {
    console.error('Error deleting message:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to delete message',
      timeout: 3000
    })
  }
  messageOptionsMenu.value = false
}

async function resendMessage(message) {
  message.status = 'sending'

  try {
    const { error } = await supabase.from('messages').insert([
      {
        match_id: matchId,
        sender_id: currentUserId.value,
        content: message.content,
        reply_to: message.reply_to
      }
    ])

    if (error) throw error

    message.status = 'sent'
  } catch (error) {
    console.error('Error resending message:', error)
    message.status = 'failed'
  }
}

// Mark messages as read
async function markMessagesAsRead() {
  try {
    const unreadMessages = messages.value.filter(
      m => m.sender_id !== currentUserId.value && m.read !== 'true'
    )

    if (unreadMessages.length > 0) {
      const { error } = await supabase
        .from('messages')
        .update({ read: 'true' })
        .in('id', unreadMessages.map(m => m.id))

      if (!error) {
        unreadMessages.forEach(m => m.read = 'true')
      }
    }
  } catch (error) {
    console.error('Error marking messages as read:', error)
  }
}

// Additional features placeholders
function startVideoCall() {
  console.log('Starting video call...')
}

function startVoiceCall() {
  console.log('Starting voice call...')
}

function startVoiceMessage() {
  console.log('Starting voice message...')
}

function selectImage() {
  console.log('Selecting image...')
  showAttachmentOptions.value = false
}

function selectFile() {
  console.log('Selecting file...')
  showAttachmentOptions.value = false
}

function clearChat() {
  console.log('Clearing chat...')
  showMatchOptions.value = false
}

function blockUser() {
  console.log('Blocking user...')
  showMatchOptions.value = false
}

function reportUser() {
  console.log('Reporting user...')
  showMatchOptions.value = false
}

// Scroll area styling
const thumbStyle = {
  right: '4px',
  borderRadius: '5px',
  backgroundColor: '#027be3',
  width: '5px',
  opacity: 0.75
}

const barStyle = {
  right: '2px',
  borderRadius: '9px',
  backgroundColor: '#027be3',
  width: '9px',
  opacity: 0.2
}

// Lifecycle
let subscription
let presenceSubscription

onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    currentUserId.value = user?.id

    if (!currentUserId.value) {
      throw new Error('User not authenticated')
    }

    await loadMessages()
    subscription = subscribeChat()

    // Subscribe to typing indicators
    presenceSubscription = supabase
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
        }
      )
      .subscribe()

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

  } catch (error) {
    console.error('Error initializing chat:', error)
    Notify.create({
      type: 'negative',
      message: 'Failed to initialize chat',
      timeout: 3000
    })
  }
})

onUnmounted(() => {
  if (subscription) {
    supabase.removeChannel(subscription)
  }
  if (presenceSubscription) {
    supabase.removeChannel(presenceSubscription)
  }

  // Clear typing timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
})

// Watch for scroll position to show/hide scroll button
/*watch(() => scrollArea.value?.getScrollPosition(), (position) => {
  if (position && scrollArea.value) {
    const maxScroll = scrollArea.value.getScrollSize() - scrollArea.value.getContainerSize()
    showScrollButton.value = maxScroll - position > 100
  }
})*/
</script>

<style scoped>
.message-sent {
  border-bottom-right-radius: 4px !important;
}

.message-received {
  border-bottom-left-radius: 4px !important;
}

.message-tail {
  position: absolute;
  bottom: 0;
  width: 0;
  height: 0;
}

.message-tail-sent {
  right: -6px;
  border-left: 6px solid var(--q-primary);
  border-bottom: 6px solid transparent;
}

.message-tail-received {
  left: -6px;
  border-right: 6px solid white;
  border-bottom: 6px solid transparent;
}

.reply-preview {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 8px;
  font-size: 12px;
}

.reply-card {
  background: rgba(0, 0, 0, 0.05);
  border-left: 4px solid var(--q-primary);
}

.message-content {
  word-wrap: break-word;
  word-break: break-word;
}

.message-text {
  white-space: pre-wrap;
}

/* Smooth animations */
.message-bubble {
  transition: all 0.2s ease;
}

.message-bubble:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #027be3;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #0056b3;
}
</style>
