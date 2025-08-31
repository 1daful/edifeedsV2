// stores/chat.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// ---- Types ----
export type UUID = string

export interface Message {
  id: UUID
  match_id: UUID
  sender_id: UUID
  content: string
  created_at: string
  read?: string | null
}

export interface TypingEventPayload {
  userId: UUID
  isTyping: boolean
}

export interface PresencePayload {
  userId: UUID
  name?: string
  avatar?: string
}

// ---- Helpers ----
function debounce<T extends (...args: any[]) => void>(fn: T, wait = 600) {
  let t: any
  return (...args: Parameters<T>) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
}

// ---- Store ----
export const useChatStore = defineStore('chat', () => {
  const messagesByMatch = ref<Record<UUID, Message[]>>({})
  const typingByMatch = ref<Record<UUID, Set<UUID>>>({})
  const presenceByMatch = ref<Record<UUID, Record<UUID, PresencePayload>>>({})
  const channels = ref<Record<UUID, RealtimeChannel>>({})
  const currentUserId = ref<UUID | null>(null)

  function setCurrentUser(userId: UUID) {
    currentUserId.value = userId
  }

  // ----- Selectors -----
  const getMessages = (matchId: UUID) => computed(() => messagesByMatch.value[matchId] ?? [])
  const getTypingUsers = (matchId: UUID) => computed(() => Array.from(typingByMatch.value[matchId] ?? new Set()))
  const getPresence = (matchId: UUID) => computed(() => Object.values(presenceByMatch.value[matchId] ?? {}))

  // Ensure containers exist
  function ensureMatchContainers(matchId: UUID) {
    if (!messagesByMatch.value[matchId]) messagesByMatch.value[matchId] = []
    if (!typingByMatch.value[matchId]) typingByMatch.value[matchId] = new Set()
    if (!presenceByMatch.value[matchId]) presenceByMatch.value[matchId] = {}
  }

  // ----- History -----
  async function loadHistory(matchId: UUID, limit = 50, before?: string) {
    ensureMatchContainers(matchId)
    let q = supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (before) q = q.lt('created_at', before)

    const { data, error } = await q
    if (error) throw error

    const older = (data ?? []).reverse() as Message[]

    const existing = new Map((messagesByMatch.value[matchId] ?? []).map(m => [m.id, m]))
    for (const m of older) existing.set(m.id, m)
    messagesByMatch.value[matchId] = Array.from(existing.values()).sort((a, b) => a.created_at.localeCompare(b.created_at))
  }

  // ----- Send message (persists to DB) -----
  async function sendMessage(matchId: UUID, receiverId: UUID, content: string) {
    if (!currentUserId.value) throw new Error('No current user set')
    const { error } = await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: currentUserId.value,
      receiver_id: receiverId,
      content,
    })
    if (error) throw error
  }

  // ----- Read receipts (optional) -----
  async function markRead(matchId: UUID) {
    if (!currentUserId.value) return
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('match_id', matchId)
      .neq('sender_id', currentUserId.value)
      .is('read', false)
    if (error) console.warn('markRead error', error)

      console.log("Called markRead")
  }

  // ----- Typing (broadcast, ephemeral) -----
  function sendTyping(matchId: UUID, isTyping = true) {
    const ch = channels.value[matchId]
    if (!ch || !currentUserId.value) return
    ch.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: currentUserId.value, isTyping } as TypingEventPayload,
    })
  }

  const stopTypingDebounced = debounce((matchId: UUID) => sendTyping(matchId, false), 800)
  function onUserInput(matchId: UUID) {
    sendTyping(matchId, true)
    stopTypingDebounced(matchId)
  }

  // ----- Presence -----
  function presenceTrack(matchId: UUID, payload?: Partial<PresencePayload>) {
    const ch = channels.value[matchId]
    if (!ch || !currentUserId.value) return
    ch.track({
      userId: currentUserId.value,
      ...payload,
    })
  }

  // ----- Subscribe (setup all realtime for a chat) -----
  async function subscribeChat(matchId: UUID, userProfile: Partial<PresencePayload>) {
    ensureMatchContainers(matchId)
    if (channels.value[matchId]) {
      await channels.value[matchId].unsubscribe()
      delete channels.value[matchId]
    }

    const ch = supabase.channel(`chat-${matchId}`, {
      config: {
        broadcast: { ack: false },
        presence: { key: currentUserId.value ?? '' },
      },
    })

    // Listeners
    ch.on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` }, (payload) => {
      const m = payload.new as Message
      const list = messagesByMatch.value[matchId] ?? []
      const idx = list.findIndex(x => x.id === m.id)

      if (payload.eventType === 'INSERT' && idx === -1) {
        list.push(m)
      } else if (payload.eventType === 'UPDATE' && idx !== -1) {
        list[idx] = m
      }
      list.sort((a, b) => a.created_at.localeCompare(b.created_at))
    })

    ch.on('broadcast', { event: 'typing' }, ({ payload }) => {
      const { userId, isTyping } = payload as TypingEventPayload
      if (!userId || userId === currentUserId.value) return
      ensureMatchContainers(matchId)
      const set = typingByMatch.value[matchId]
      if (isTyping) {
        set.add(userId)
      } else {
        set.delete(userId)
      }
      // Remove after 2.5 seconds to handle disconnected users
      setTimeout(() => set.delete(userId), 2500);
    })

    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState() as Record<string, PresencePayload[]>
      const map: Record<UUID, PresencePayload> = {}
      Object.values(state).forEach(arr => arr.forEach(meta => {
        if (meta.userId) map[meta.userId] = meta
      }))
      presenceByMatch.value[matchId] = map
    })

    ch.on('presence', { event: 'join' }, ({ key, newPresences }) => { /* ... */ })
    ch.on('presence', { event: 'leave' }, ({ key, leftPresences }) => { /* ... */ })

    // Subscribe and track self presence
    const { error } = await ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        presenceTrack(matchId, userProfile)
      }
    })

    if (error) throw error
    channels.value[matchId] = ch
  }

  // ----- Unsubscribe / cleanup -----
  async function unsubscribeChat(matchId: UUID) {
    const ch = channels.value[matchId]
    if (!ch) return
    await ch.unsubscribe()
    delete channels.value[matchId]
    delete messagesByMatch.value[matchId]
    delete typingByMatch.value[matchId]
    delete presenceByMatch.value[matchId]
  }

  async function unsubscribeAll() {
    await Promise.all(Object.values(channels.value).map(ch => ch.unsubscribe()))
    channels.value = {}
    messagesByMatch.value = {}
    typingByMatch.value = {}
    presenceByMatch.value = {}
  }

  return {
    messagesByMatch,
    typingByMatch,
    presenceByMatch,
    currentUserId,
    getMessages,
    getTypingUsers,
    getPresence,
    setCurrentUser,
    loadHistory,
    sendMessage,
    markRead,
    onUserInput,
    presenceTrack,
    subscribeChat,
    unsubscribeChat,
    unsubscribeAll,
  }
})
