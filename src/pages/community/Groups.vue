<template>
  <q-page padding>
    <div class="text-h5 text-weight-bold q-mb-md">Small Groups 👥</div>

    <q-list bordered>
      <q-item
        v-for="group in groups"
        :key="group.id"
        clickable
        v-ripple
      >
        <q-item-section>
          <q-item-label>{{ group.name }}</q-item-label>
          <q-item-label caption>{{ group.members_count }} members • {{ group.schedule }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-btn
            outline
            rounded
            color="primary"
            label="Join"
            @click.stop="joinGroup(group.id)"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "src/lib/supabase";
import { useQuasar } from "quasar";

const $q = useQuasar();
const groups = ref([]);

onMounted(async () => {
  const { data } = await supabase.from("groups").select("*");
  groups.value = data;
});

const joinGroup = async (groupId) => {
  const user = (await supabase.auth.getUser()).data.user;
  await supabase.from("group_members").insert({
    user_id: user.id,
    group_id: groupId,
  });
  $q.notify({ type: "positive", message: "You joined the group 🎉" });
};
</script>
