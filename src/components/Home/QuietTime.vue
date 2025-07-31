<template><div class="q-mt-lg">
  <q-card class="quiet-time-card" elevation="2">
    <q-card-section class="text-center">
      <div class="row items-center justify-center q-mb-sm">
        <q-icon name="self_improvement" size="md" color="primary" class="q-mr-sm" />
        <div class="text-h6">Quiet Time Corner</div>
      </div>
      <div class="text-body2 text-grey-7 q-mb-md">
        Daily worship, verse, and reflection for your quiet time
      </div>

      <!-- Today's verse -->
      <q-card flat class="verse-card q-mb-md">
        <q-card-section class="q-pa-md">
          <div class="text-italic text-body1">"{{ quietTime.verse.text }}"</div>
          <div class="text-caption text-right q-mt-sm text-primary">
            {{ quietTime.verse.reference }}
          </div>
        </q-card-section>
      </q-card>

      <div class="row q-gutter-sm justify-center">
        <q-btn
          color="primary"
          label="Start Quiet Time"
          icon="play_arrow"
          @click="router.push('/quiet-time')"
          unelevated
        />
        <q-btn
          flat
          color="primary"
          label="Prayer Journal"
          icon="book"
          @click="router.push('/prayer-journal')"
        />
      </div>
    </q-card-section>
  </q-card>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { dbClient } from "../../api/apiList";
import { QuietTime } from "../../utils/types";

const router = useRouter()

  /*const params: RequestQuery = {
    url: "",
    method: "post",
  }*/
const quietTime: QuietTime = await dbClient.get({
    url: "quiet_time",
    method: "get",
    params: {
      columns: [],
      filters: [
        {
          op: "eq",
          col: "createdAt",
          val: new Date().toISOString().split('T')[0]
        }
      ]
    }
  }) || ref({
  text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.',
  reference: 'Jeremiah 29:11'
})
</script>

<style scoped>
.quiet-time-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
}

.verse-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  border-left: 4px solid var(--q-primary);
}
</style>
