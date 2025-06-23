<template>
<q-layout>
  <q-page-container>

  <q-page class="terms-page q-px-md q-py-xl bg-grey-1 text-grey-9">
    <div class="q-mb-xl text-center">
      <div class="text-h3 text-primary">Terms of Service</div>
      <div class="text-subtitle1">Edifeeds - Christian Content Platform</div>
      <q-chip color="primary" class="q-mt-md" icon="schedule" text-color="white">
        Effective Date: [Insert Date]
      </q-chip>
    </div>

    <q-tabs class="q-mb-lg bg-white shadow-2 rounded-borders" v-model="tab" align="justify">
      <q-tab v-for="item in sections" :key="item.id" :name="item.id" :label="item.label" />
    </q-tabs>

    <div class="row q-col-gutter-xl">
      <!-- Sidebar -->
      <div class="col-12 col-md-3">
        <q-card flat bordered class="q-pa-md sticky-sidebar">
          <div class="text-h6 text-primary q-mb-md">
            <q-icon name="menu_book" class="q-mr-sm" />Quick Navigation
          </div>
          <q-list dense>
            <q-item v-for="item in sections" :key="item.id" clickable @click="tab = item.id">
              <q-item-section>{{ item.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <!-- Main Content -->
      <div class="col-12 col-md-9">
        <q-card flat bordered class="q-pa-lg bg-white">
          <div v-for="(item, index) in sections" :key="item.id" v-show="tab === item.id" class="q-mb-lg">
            <div class="row items-center q-mb-sm">
              <div class="section-number q-mr-sm">{{ index + 1 }}</div>
              <div class="text-h6 text-primary">{{ item.label }}</div>
            </div>
            <div class="text-body1" v-html="item.content" />
          </div>
        </q-card>
      </div>
    </div>

    <q-separator spaced />

    <q-card flat bordered class="q-pa-lg bg-white q-mt-xl">
      <div class="text-h6 text-primary q-mb-md">
        Contact Us
      </div>
      <q-list>
        <q-item>
          <q-item-section avatar>
            <q-icon name="email" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label><strong>Email:</strong> <a href="mailto:support@edifeeds.com">support@edifeeds.com</a></q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            <q-icon name="phone" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label><strong>Phone:</strong> [Insert Phone Number]</q-item-label>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            <q-icon name="location_on" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label><strong>Address:</strong> [Insert Address]</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <q-footer class="text-white bg-grey-9 text-center q-pa-md q-mt-xl">
      <p class="q-mb-none">&copy; 2024 Edifeeds. All rights reserved. | Designed with Quasar UI/UX principles</p>
    </q-footer>
  </q-page>
  </q-page-container>
</q-layout>
</template>

<script>
export default {
  data() {
    return {
      tab: 'about',
      sections: [
        {
          id: 'about',
          label: 'About Edifeeds',
          content: `<p>Edifeeds is a Christian content aggregation platform... </p>`
        },
        {
          id: 'eligibility',
          label: 'Eligibility',
          content: `<p>You must be at least 13 years old...</p>`
        },
        {
          id: 'accounts',
          label: 'User Accounts',
          content: `<p>Some features of Edifeeds require registration. You agree to:</p>
            <ul><li>Provide accurate info</li><li>Maintain security</li><li>Report unauthorized access</li></ul>`
        },
        {
          id: 'conduct',
          label: 'User Conduct',
          content: `<p>You agree not to post offensive content or violate Christian values...</p>`
        },
        {
          id: 'content',
          label: 'Third-Party Content',
          content: `<p>Edifeeds shows media from YouTube, Spotify, etc...</p>`
        },
        {
          id: 'property',
          label: 'Intellectual Property',
          content: `<p>All original content belongs to Edifeeds...</p>`
        },
        {
          id: 'availability',
          label: 'Service Availability',
          content: `<p>We strive for uptime but offer no guarantees...</p>`
        },
        {
          id: 'legal',
          label: 'Legal / Disclaimers',
          content: `<p>We provide Edifeeds "as-is" with no warranties...</p>`
        },
        {
          id: 'contact',
          label: 'Contact Us',
          content: `<p>Email us at support@edifeeds.com...</p>`
        },
      ]
    };
  }
};
</script>

<style scoped>
.section-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1976d2, #26a69a);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
}

.sticky-sidebar {
  position: sticky;
  top: 100px;
}
</style>
