<template>
  <q-card class="community-card-container" :class="{ 'main-feature': mainFeature }">
    <q-card-section>
      <div class="community-header">
        <div class="community-icon">{{ icon }}</div>
        <div>
          <div class="text-h6 text-weight-bold">{{ title }}</div>
          <div class="text-caption text-grey-7">{{ subtitle }}</div>
        </div>
      </div>
      <div class="q-mt-md">
        <template v-if="title === 'Unity Hub'">
          <div class="recent-activity">
            <div class="activity-item">
              <q-avatar size="40px" font-size="24px" class="user-avatar bg-primary text-white">👤</q-avatar>
              <div class="activity-text">
                <div class="text-body2 text-grey-8"><strong>Sarah M.</strong> shared a prayer request for healing</div>
                <div class="text-caption text-grey-5">2 min ago</div>
              </div>
            </div>
            <div class="activity-item">
              <q-avatar size="40px" font-size="24px" class="user-avatar bg-primary text-white">👤</q-avatar>
              <div class="activity-text">
                <div class="text-body2 text-grey-8"><strong>Pastor John</strong> posted daily devotion</div>
                <div class="text-caption text-grey-5">15 min ago</div>
              </div>
            </div>
            <div class="activity-item">
              <q-avatar size="40px" font-size="24px" class="user-avatar bg-primary text-white">👤</q-avatar>
              <div class="activity-text">
                <div class="text-body2 text-grey-8"><strong>Michael T.</strong> celebrated 1 year of sobriety</div>
                <div class="text-caption text-grey-5">1 hour ago</div>
              </div>
            </div>
          </div>
          <q-btn class="cta-button" label="Join the Conversation" unelevated />
        </template>
        <template v-else-if="title === 'Prayer Wall'">
          <div class="prayer-requests">
            <div class="prayer-item">
              <p class="text-body2 text-grey-7">"Praying for my daughter's healing..."</p>
              <div class="prayer-stats text-caption text-grey-5">
                <span>❤️ 234 praying</span>
                <span>💬 12 responses</span>
              </div>
            </div>
            <div class="prayer-item">
              <p class="text-body2 text-grey-7">"Job interview tomorrow, need wisdom..."</p>
              <div class="prayer-stats text-caption text-grey-5">
                <span>❤️ 89 praying</span>
                <span>💬 8 responses</span>
              </div>
            </div>
          </div>
          <q-btn class="cta-button" label="+ Add Prayer Request" unelevated />
        </template>
        <template v-else-if="title === 'Small Groups'">
          <div class="groups-list">
            <div class="group-item">
              <div class="group-info">
                <div class="text-body1 text-weight-bold">Young Adults Lagos</div>
                <span class="text-caption text-grey-7">23 members • Meets Fridays</span>
              </div>
              <q-btn outline rounded color="primary" label="Join" />
            </div>
            <div class="group-item">
              <div class="group-info">
                <div class="text-body1 text-weight-bold">Marriage & Family</div>
                <span class="text-caption text-grey-7">45 members • Meets Sundays</span>
              </div>
              <q-btn outline rounded color="primary" label="Join" />
            </div>
            <div class="group-item">
              <div class="group-info">
                <div class="text-body1 text-weight-bold">Bible Study Online</div>
                <span class="text-caption text-grey-7">127 members • Daily</span>
              </div>
              <q-btn outline rounded color="primary" label="Join" />
            </div>
          </div>
          <q-btn class="cta-button" label="View All Groups" unelevated />
        </template>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  icon: String,
  title: String,
  subtitle: String,
  mainFeature: {
    type: Boolean,
    default: false
  }
});
</script>

<style lang="scss" scoped>
.community-card-container {
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.community-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.community-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
.activity-item, .prayer-item, .group-item {
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.8rem;
}
.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}
.prayer-stats {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}
.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cta-button {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-top: 1rem;
  &:hover {
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }
}
</style>
