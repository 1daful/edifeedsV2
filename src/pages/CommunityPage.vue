<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">Community Feed</div>

    <q-card v-for="(post, index) in communityPosts" :key="index" class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1">{{ post.user }}</div>
        <div class="text-caption text-grey">{{ post.timestamp }}</div>
        <div class="q-mt-sm">{{ post.content }}</div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="between">
        <div>
          <q-btn flat icon="thumb_up" :label="post.reactions.likes.toString()" @click="react(index, 'likes')" />
          <q-btn flat icon="bookmark" :label="post.reactions.bookmarks.toString()" @click="react(index, 'bookmarks')" />
        </div>
        <q-btn flat label="Comment" icon="chat" @click="toggleComments(index)" />
      </q-card-actions>

      <q-slide-transition>
        <div v-show="post.showComments" class="q-pa-sm">
          <div v-for="(comment, cIndex) in post.comments" :key="cIndex" class="q-mb-sm">
            <div class="text-caption text-bold">{{ comment.user }}</div>
            <div class="text-body2">{{ comment.text }}</div>
          </div>

          <q-input dense filled v-model="post.newComment" label="Add a comment..." @keyup.enter="addComment(index)" />
        </div>
      </q-slide-transition>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const communityPosts = ref([
  {
    user: 'Jane D.',
    timestamp: 'Today at 9:30 AM',
    content: '“Woke up with a heart full of worship.”',
    reactions: { likes: 3, bookmarks: 1 },
    comments: [
      { user: 'Faith O.', text: 'Amen to that!' },
      { user: 'Paul R.', text: 'Beautiful reminder.' }
    ],
    newComment: '',
    showComments: false
  },
  {
    user: 'Samuel K.',
    timestamp: 'Yesterday at 4:15 PM',
    content: 'Just added a new playlist on Grace — check it out on my profile!',
    reactions: { likes: 5, bookmarks: 4 },
    comments: [],
    newComment: '',
    showComments: false
  }
])

function toggleComments(index) {
  communityPosts.value[index].showComments = !communityPosts.value[index].showComments
}

function addComment(index) {
  const post = communityPosts.value[index]
  if (post.newComment.trim()) {
    post.comments.push({ user: 'You', text: post.newComment.trim() })
    post.newComment = ''
  }
}

function react(index, type) {
  communityPosts.value[index].reactions[type]++
}
</script>

<style scoped>
.text-subtitle1 {
  font-weight: 600;
}
.text-caption.text-bold {
  font-weight: bold;
}
</style>
