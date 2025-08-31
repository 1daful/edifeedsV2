// useTyping.js (Vue 3 composable)
import { ref, onBeforeUnmount } from 'vue';
import { supabase } from '../lib/supabase'; // your client

export function useTyping(currentUserId: string) {
  const isTypingByMatch = ref(new Map());
  const channels = new Map(); // matchId -> channel
  const timers = new Map();   // matchId -> timer id

  function ensureChannel(matchId: any) {
    if (channels.has(matchId)) return channels.get(matchId);
    const channel = supabase.channel(`match:${matchId}`, {
      config: { presence: { key: currentUserId } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const othersTyping =
          Object.entries(state)
            .filter(([uid]) => uid !== currentUserId)
            .some(([, clients]) =>
              clients.some(c => c.isTyping === true && c.typingIn === matchId)
            );
        isTypingByMatch.value.set(matchId, othersTyping);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.track({ userId: currentUserId, isTyping: false, typingIn: null });
        }
      });

    channels.set(matchId, channel);
    return channel;
  }

  function startTyping(matchId) {
    const channel = ensureChannel(matchId);
    channel.track({ userId: currentUserId, isTyping: true, typingIn: matchId });

    clearTimeout(timers.get(matchId));
    const id = setTimeout(() => stopTyping(matchId), 3000);
    timers.set(matchId, id);
  }

  function stopTyping(matchId) {
    const channel = channels.get(matchId);
    if (!channel) return;
    clearTimeout(timers.get(matchId));
    channel.track({ userId: currentUserId, isTyping: false, typingIn: null });
  }

  function disposeMatch(matchId) {
    stopTyping(matchId);
    const ch = channels.get(matchId);
    if (ch) supabase.removeChannel(ch);
    channels.delete(matchId);
    timers.delete(matchId);
    isTypingByMatch.value.delete(matchId);
  }

  onBeforeUnmount(() => {
    for (const matchId of channels.keys()) disposeMatch(matchId);
  });

  return {
    isTypingByMatch,
    startTyping,
    stopTyping,
    ensureChannel,
    disposeMatch
  };
}
