<template>
  <q-page padding>
    <div class="text-h5 text-weight-bold q-mb-md">Prayer Wall 🙏</div>

    <q-btn
      class="q-mb-md"
      label="+ Add Prayer Request"
      color="primary"
      @click="showPrayerDialog = true"
    />

    <div>
      <q-card
        v-for="prayer in prayers"
        :key="prayer.id"
        class="q-mb-md"
      >
        <q-card-section>
          <p class="text-body1">"{{ prayer.content }}"</p>
          <div class="text-caption text-grey-7">
            ❤️ {{ prayer.prayers_count }} praying • 💬 {{ prayer.responses_count }} responses
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Add Prayer Dialog -->
    <q-dialog v-model="showPrayerDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Add Prayer Request</div>
          <q-input v-model="newPrayer" type="textarea" label="Your prayer request..." />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Submit" @click="submitPrayer" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "src/lib/supabase";
import { useQuasar } from "quasar";

const $q = useQuasar();
const prayers = ref([]);
const showPrayerDialog = ref(false);
const newPrayer = ref("");

onMounted(async () => {
  const { data } = await supabase
    .from("prayer_requests")
    .select("*")
    .order("created_at", { ascending: false });
  prayers.value = data;
});

const submitPrayer = async () => {
  if (!newPrayer.value) return;
  const user = (await supabase.auth.getUser()).data.user;
  await supabase.from("prayer_requests").insert({
    content: newPrayer.value,
    user_id: user.id,
  });
  $q.notify({ type: "positive", message: "Prayer request added 🙏" });
  showPrayerDialog.value = false;
  newPrayer.value = "";
};
</script>
