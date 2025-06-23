<template>
  <q-layout>
    <q-page-container>
      <q-page class="terms-page">
        <!-- Hero Header -->
        <div class="hero-header">
          <div class="hero-content">
            <q-icon name="gavel" size="4rem" class="text-white q-mb-md" />
            <div class="text-h2 text-white text-weight-bold q-mb-sm">Terms of Service</div>
            <div class="text-h5 text-white q-mb-lg opacity-90">Edifeeds - Christian Content Platform</div>
            <q-chip
              color="white"
              text-color="primary"
              class="q-px-lg q-py-sm"
              icon="schedule"
              size="lg"
            >
              <span class="text-weight-medium">Effective Date: January 1, 2024</span>
            </q-chip>
          </div>
          <div class="hero-overlay"></div>
        </div>

        <!-- Introduction Card -->
        <div class="container q-px-md q-py-xl">
          <q-card flat bordered class="intro-card q-pa-lg q-mb-xl">
            <div class="text-center">
              <q-icon name="info" color="primary" size="2rem" class="q-mb-md" />
              <div class="text-h6 text-primary q-mb-md">Welcome to Edifeeds</div>
              <p class="text-body1 text-grey-8 q-mb-lg">
                These Terms of Service govern your access to and use of our Christian content platform.
                By using Edifeeds, you agree to be bound by these Terms and our
                <a href="#" class="text-primary text-decoration-none">Privacy Policy</a>.
              </p>
              <q-banner inline-actions class="bg-orange-1 text-orange-8 rounded-borders">
                <template v-slot:avatar>
                  <q-icon name="warning" color="orange" />
                </template>
                <strong>Important:</strong> If you do not agree with these Terms, please do not use our Service.
              </q-banner>
            </div>
          </q-card>

          <!-- Navigation Tabs -->
          <q-card flat bordered class="q-mb-xl">
            <q-tabs
              v-model="activeTab"
              class="tabs-container"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              mobile-arrows
              outside-arrows
              @update:model-value="onTabChange"
            >
              <q-tab
                v-for="(section, index) in sections"
                :key="section.id"
                :name="section.id"
                :icon="section.icon"
                class="tab-item"
              >
                <div class="tab-content">
                  <div class="section-badge">{{ index + 1 }}</div>
                  <div class="tab-label">{{ section.label }}</div>
                </div>
              </q-tab>
            </q-tabs>
          </q-card>

          <!-- Main Content Layout -->
          <div class="row q-col-gutter-xl">
            <!-- Sidebar Navigation -->
            <div class="col-12 col-lg-3">
              <q-card flat bordered class="sidebar-card">
                <q-card-section class="q-pb-none">
                  <div class="text-h6 text-primary q-mb-md flex items-center">
                    <q-icon name="format_list_bulleted" class="q-mr-sm" />
                    Quick Navigation
                  </div>
                </q-card-section>

                <q-separator class="q-mb-md" />

                <q-card-section class="q-pt-none">
                  <q-list dense class="sidebar-nav">
                    <q-item
                      v-for="(section, index) in sections"
                      :key="section.id"
                      :active="activeTab === section.id"
                      active-class="sidebar-active"
                      clickable
                      v-ripple
                      @click="navigateToSection(section.id)"
                      class="sidebar-item rounded-borders q-mb-xs"
                    >
                      <q-item-section avatar>
                        <div class="sidebar-number">{{ index + 1 }}</div>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">{{ section.label }}</q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-icon name="chevron_right" size="sm" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>

                <!-- Progress Indicator -->
                <q-card-section class="q-pt-none">
                  <q-separator class="q-mb-md" />
                  <div class="text-caption text-grey-6 q-mb-sm">Reading Progress</div>
                  <q-linear-progress
                    :value="readingProgress"
                    color="primary"
                    class="q-mb-sm"
                    size="8px"
                    rounded
                  />
                  <div class="text-caption text-grey-6">
                    {{ Math.round(readingProgress * 100) }}% Complete
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Main Content Area -->
            <div class="col-12 col-lg-9">
              <q-card flat bordered class="content-card">
                <q-card-section class="q-pa-xl">
                  <transition
                    name="fade-slide"
                    mode="out-in"
                    @enter="onEnter"
                    @leave="onLeave"
                  >
                    <div :key="activeTab" class="section-content">
                      <!-- Section Header -->
                      <div class="section-header q-mb-lg">
                        <div class="flex items-center q-mb-md">
                          <div class="section-number-large q-mr-md">
                            {{ getCurrentSectionIndex() + 1 }}
                          </div>
                          <div>
                            <div class="text-h4 text-primary text-weight-bold">
                              {{ getCurrentSection()?.label }}
                            </div>
                            <div class="text-caption text-grey-6">
                              Section {{ getCurrentSectionIndex() + 1 }} of {{ sections.length }}
                            </div>
                          </div>
                        </div>
                        <q-separator />
                      </div>

                      <!-- Section Content -->
                      <div
                        class="section-body text-body1 line-height-relaxed"
                        v-html="getCurrentSection()?.content"
                      ></div>

                      <!-- Section Navigation -->
                      <div class="section-navigation q-mt-xl q-pt-lg">
                        <q-separator class="q-mb-lg" />
                        <div class="row justify-between items-center">
                          <q-btn
                            v-if="getCurrentSectionIndex() > 0"
                            @click="navigateToPrevious"
                            color="grey-6"
                            outline
                            icon="chevron_left"
                            label="Previous"
                            class="nav-btn"
                          />
                          <div v-else></div>

                          <div class="text-center">
                            <q-btn
                              @click="scrollToTop"
                              color="primary"
                              outline
                              icon="keyboard_arrow_up"
                              label="Back to Top"
                              size="sm"
                            />
                          </div>

                          <q-btn
                            v-if="getCurrentSectionIndex() < sections.length - 1"
                            @click="navigateToNext"
                            color="primary"
                            icon-right="chevron_right"
                            label="Next"
                            class="nav-btn"
                          />
                          <div v-else></div>
                        </div>
                      </div>
                    </div>
                  </transition>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Contact Section -->
          <q-card flat bordered class="contact-card q-mt-xl">
            <q-card-section class="q-pa-xl">
              <div class="text-center q-mb-lg">
                <q-icon name="support_agent" size="3rem" color="primary" class="q-mb-md" />
                <div class="text-h5 text-primary text-weight-bold q-mb-sm">Get in Touch</div>
                <div class="text-body1 text-grey-7">
                  Have questions about our Terms of Service? We're here to help.
                </div>
              </div>

              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-4" v-for="contact in contactInfo" :key="contact.type">
                  <q-card flat class="contact-item text-center q-pa-lg">
                    <q-icon :name="contact.icon" size="2rem" :color="contact.color" class="q-mb-md" />
                    <div class="text-subtitle2 text-weight-bold q-mb-sm">{{ contact.label }}</div>
                    <div class="text-body2">
                      <a
                        v-if="contact.link"
                        :href="contact.link"
                        class="text-primary text-decoration-none"
                      >
                        {{ contact.value }}
                      </a>
                      <span v-else>{{ contact.value }}</span>
                    </div>
                  </q-card>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Footer -->
        <footer class="footer-section">
          <div class="container q-px-md">
            <div class="text-center text-white">
              <q-icon name="favorite" color="red" class="q-mr-sm" />
              <span>&copy; 2024 Edifeeds. All rights reserved. | Built with Quasar Framework</span>
            </div>
          </div>
        </footer>

        <!-- Floating Action Button -->
        <q-page-sticky position="bottom-right" :offset="[18, 18]">
          <q-btn
            fab
            icon="help_outline"
            color="secondary"
            @click="showHelp = true"
            class="floating-help-btn"
          >
            <q-tooltip class="bg-secondary">Need Help?</q-tooltip>
          </q-btn>
        </q-page-sticky>

        <!-- Help Dialog -->
        <q-dialog v-model="showHelp">
          <q-card style="min-width: 400px">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-h6">How to Navigate</div>
              <q-space />
              <q-btn icon="close" flat round dense @click="showHelp = false" />
            </q-card-section>

            <q-card-section>
              <q-list>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="tab" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Use tabs to jump between sections</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="list" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Click sidebar items for quick navigation</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="navigation" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Use Previous/Next buttons at section bottom</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'TermsOfService',

  data() {
    return {
      activeTab: 'about',
      showHelp: false,
      readingProgress: 0,

      contactInfo: [
        {
          type: 'email',
          icon: 'email',
          color: 'blue',
          label: 'Email Support',
          value: 'support@edifeeds.com',
          link: 'mailto:support@edifeeds.com'
        },
        {
          type: 'phone',
          icon: 'phone',
          color: 'green',
          label: 'Phone Support',
          value: '+1 (555) 123-4567',
          link: 'tel:+15551234567'
        },
        {
          type: 'address',
          icon: 'location_on',
          color: 'red',
          label: 'Office Address',
          value: '123 Christian Way, Faith City, FC 12345',
          link: null
        }
      ],

      sections: [
        {
          id: 'about',
          label: 'About Edifeeds',
          icon: 'info',
          content: `
            <p class="text-body1 q-mb-md">
              Edifeeds is a Christian content aggregation platform that curates edifying content—videos,
              music, books, quotes, sermons, and more—from various third-party sources for the spiritual
              growth and inspiration of users.
            </p>
            <div class="q-pa-md bg-blue-1 rounded-borders q-mb-md">
              <div class="text-weight-bold text-blue-8 q-mb-sm">
                <q-icon name="lightbulb" class="q-mr-sm" />
                Our Mission
              </div>
              <p class="text-blue-8 q-mb-none">
                We do not claim ownership of third-party content and always strive to credit original
                creators while providing a centralized platform for Christian growth and inspiration.
              </p>
            </div>
          `
        },
        {
          id: 'eligibility',
          label: 'Eligibility',
          icon: 'verified_user',
          content: `
            <p class="text-body1 q-mb-md">
              You must be at least <strong>13 years old</strong> (or the minimum legal age in your jurisdiction)
              to use the Service.
            </p>
            <div class="q-pa-md bg-green-1 rounded-borders q-mb-md">
              <div class="text-weight-bold text-green-8 q-mb-sm">
                <q-icon name="check_circle" class="q-mr-sm" />
                By using Edifeeds, you affirm that:
              </div>
              <ul class="text-green-8">
                <li>You meet the eligibility requirements</li>
                <li>Any information you provide is accurate and truthful</li>
                <li>You will comply with all applicable laws and regulations</li>
              </ul>
            </div>
          `
        },
        {
          id: 'accounts',
          label: 'User Accounts',
          icon: 'account_circle',
          content: `
            <p class="text-body1 q-mb-md">
              Some features of Edifeeds require registration. When creating an account, you agree to:
            </p>
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-4">
                <q-card flat class="bg-orange-1 q-pa-md text-center">
                  <q-icon name="edit" size="2rem" color="orange" class="q-mb-sm" />
                  <div class="text-weight-bold text-orange-8">Accurate Information</div>
                  <div class="text-caption text-orange-7">Provide complete and updated details</div>
                </q-card>
              </div>
              <div class="col-12 col-md-4">
                <q-card flat class="bg-purple-1 q-pa-md text-center">
                  <q-icon name="security" size="2rem" color="purple" class="q-mb-sm" />
                  <div class="text-weight-bold text-purple-8">Account Security</div>
                  <div class="text-caption text-purple-7">Maintain credential security</div>
                </q-card>
              </div>
              <div class="col-12 col-md-4">
                <q-card flat class="bg-red-1 q-pa-md text-center">
                  <q-icon name="report" size="2rem" color="red" class="q-mb-sm" />
                  <div class="text-weight-bold text-red-8">Report Issues</div>
                  <div class="text-caption text-red-7">Notify us of unauthorized access</div>
                </q-card>
              </div>
            </div>
            <div class="q-pa-md bg-amber-1 rounded-borders">
              <div class="text-weight-bold text-amber-8">
                <q-icon name="warning" class="q-mr-sm" />
                Important Responsibility
              </div>
              <p class="text-amber-8 q-mb-none">
                You are responsible for all activities that occur under your account.
              </p>
            </div>
          `
        },
        {
          id: 'conduct',
          label: 'User Conduct',
          icon: 'gavel',
          content: `
            <p class="text-body1 q-mb-md">
              You may interact with content on Edifeeds through reactions, bookmarks, playlists, or comments
              (if enabled). However, you agree <strong>NOT</strong> to:
            </p>
            <q-list bordered class="rounded-borders q-mb-md">
              <q-item>
                <q-item-section avatar>
                  <q-icon name="block" color="red" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Post offensive or defamatory content</q-item-label>
                  <q-item-label caption>Content contrary to Christian values Edifeeds upholds</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item>
                <q-item-section avatar>
                  <q-icon name="dangerous" color="red" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Use for illegal or harmful purposes</q-item-label>
                  <q-item-label caption>Any deceptive or harmful activities</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item>
                <q-item-section avatar>
                  <q-icon name="copyright" color="red" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Infringe intellectual property rights</q-item-label>
                  <q-item-label caption>Respect others' copyrights and trademarks</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item>
                <q-item-section avatar>
                  <q-icon name="bug_report" color="red" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Interfere with platform functionality</q-item-label>
                  <q-item-label caption>Attempt to disrupt or compromise our service</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <div class="q-pa-md bg-red-1 rounded-borders">
              <div class="text-weight-bold text-red-8">
                <q-icon name="admin_panel_settings" class="q-mr-sm" />
                Content Moderation
              </div>
              <p class="text-red-8 q-mb-none">
                We reserve the right to moderate or remove any user-generated content at our discretion.
              </p>
            </div>
          `
        },
        {
          id: 'content',
          label: 'Third-Party Content',
          icon: 'link',
          content: `
            <p class="text-body1 q-mb-md">
              Edifeeds displays content aggregated from various third-party platforms. Here's what you need to know:
            </p>
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-sm-6 col-md-3">
                <q-card flat class="bg-red-1 text-center q-pa-md">
                  <q-icon name="smart_display" size="2rem" color="red" />
                  <div class="text-caption text-red-8 q-mt-sm">YouTube</div>
                </q-card>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-card flat class="bg-green-1 text-center q-pa-md">
                  <q-icon name="music_note" size="2rem" color="green" />
                  <div class="text-caption text-green-8 q-mt-sm">Spotify</div>
                </q-card>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-card flat class="bg-orange-1 text-center q-pa-md">
                  <q-icon name="audiotrack" size="2rem" color="orange" />
                  <div class="text-caption text-orange-8 q-mt-sm">SoundCloud</div>
                </q-card>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-card flat class="bg-blue-1 text-center q-pa-md">
                  <q-icon name="more_horiz" size="2rem" color="blue" />
                  <div class="text-caption text-blue-8 q-mt-sm">Others</div>
                </q-card>
              </div>
            </div>
            <div class="q-pa-md bg-grey-2 rounded-borders">
              <div class="text-weight-bold text-grey-8 q-mb-sm">
                <q-icon name="info" class="q-mr-sm" />
                Important Notice
              </div>
              <p class="text-grey-8 q-mb-none">
                These links and media are governed by their respective terms and privacy policies.
                We are not responsible for the content or practices of any third-party services.
              </p>
            </div>
          `
        },
        {
          id: 'property',
          label: 'Intellectual Property',
          icon: 'copyright',
          content: `
            <div class="row q-col-gutter-lg q-mb-md">
              <div class="col-12 col-md-6">
                <q-card flat class="bg-blue-1 q-pa-lg">
                  <div class="text-center">
                    <q-icon name="business" size="3rem" color="blue" class="q-mb-md" />
                    <div class="text-h6 text-blue-8 q-mb-sm">Our Content</div>
                    <p class="text-blue-8 q-mb-none">
                      All original content, features, and functionality on Edifeeds are our property
                      and protected by applicable intellectual property laws.
                    </p>
                  </div>
                </q-card>
              </div>
              <div class="col-12 col-md-6">
                <q-card flat class="bg-green-1 q-pa-lg">
                  <div class="text-center">
                    <q-icon name="people" size="3rem" color="green" class="q-mb-md" />
                    <div class="text-h6 text-green-8 q-mb-sm">Third-Party Content</div>
                    <p class="text-green-8 q-mb-none">
                      Third-party content belongs to its respective owners. We make efforts to
                      credit and link to original sources.
                    </p>
                  </div>
                </q-card>
              </div>
            </div>
            <div class="q-pa-md bg-amber-1 rounded-borders">
              <div class="text-weight-bold text-amber-8 q-mb-sm">
                <q-icon name="contact_support" class="q-mr-sm" />
                Attribution Issues
              </div>
              <p class="text-amber-8 q-mb-none">
                We encourage creators to contact us for any attribution issues or concerns.
              </p>
            </div>
          `
        },
        {
          id: 'availability',
          label: 'Service Availability',
          icon: 'cloud',
          content: `
            <div class="text-center q-mb-lg">
              <q-icon name="cloud_queue" size="4rem" color="primary" class="q-mb-md" />
              <div class="text-h6 text-primary">Service Commitment</div>
            </div>
            <p class="text-body1 q-mb-md">
              We strive to ensure continuous availability of our Service, but we do not guarantee
              uninterrupted access.
            </p>
            <div class="q-pa-md bg-orange-1 rounded-borders">
              <div class="text-weight-bold text-orange-8 q-mb-sm">
                <q-icon name="settings" class="q-mr-sm" />
                Service Modifications
              </div>
              <p class="text-orange-8 q-mb-none">
                We may modify, suspend, or discontinue any part of the Service at any time without notice.
              </p>
            </div>
          `
        },
        {
          id: 'legal',
          label: 'Legal & Disclaimers',
          icon: 'balance',
          content: `
            <div class="q-mb-lg">
              <div class="text-h6 text-primary q-mb-md">
                <q-icon name="warning" class="q-mr-sm" />
                Disclaimer of Warranties
              </div>
              <p class="text-body1">
                Edifeeds is provided <strong>"as is"</strong> and <strong>"as available."</strong>
                We make no warranties or representations, express or implied, regarding the Service's
                accuracy, reliability, or suitability for a particular purpose.
              </p>
            </div>

            <q-separator class="q-my-lg" />

            <div class="q-mb-lg">
              <div class="text-h6 text-primary q-mb-md">
                <q-icon name="security" class="q-mr-sm" />
                Limitation of Liability
              </div>
              <p class="text-body1">
                To the fullest extent permitted by law, Edifeeds shall not be liable for any indirect,
                incidental, consequential, or punitive damages arising out of or related to your use of the Service.
              </p>
            </div>

            <q-separator class="q-my-lg" />

            <div class="q-mb-lg">
              <div class="text-h6 text-primary q-mb-md">
                <q-icon name="gavel" class="q-mr-sm" />
                Governing Law
              </div>
              <p class="text-body1">
                These Terms shall be governed by and construed in accordance with the laws of
                <strong>[Insert Jurisdiction]</strong>. Any disputes shall be subject to the exclusive
                jurisdiction of the courts in <strong>[Insert Location]</strong>.
              </p>
            </div>
          `
        }
      ]
    };
  },

  computed: {
    getCurrentSection() {
      return () => this.sections.find(section => section.id === this.activeTab);
    },

    getCurrentSectionIndex() {
      return () => this.sections.findIndex(section => section.id === this.activeTab);
    }
  },

  mounted() {
    this.updateReadingProgress();
    window.addEventListener('scroll', this.updateReadingProgress);
  },

  beforeUnmount() {
    window.removeEventListener('scroll', this.updateReadingProgress);
  },

  methods: {
    navigateToSection(sectionId) {
      this.activeTab = sectionId;
      this.scrollToTop();
    },

    navigateToNext() {
      const currentIndex = this.getCurrentSectionIndex();
      if (currentIndex < this.sections.length - 1) {
        this.activeTab = this.sections[currentIndex + 1].id;
        this.scrollToTop();
      }
    },

    navigateToPrevious() {
      const currentIndex = this.getCurrentSectionIndex();
      if (currentIndex > 0) {
        this.activeTab = this.sections[currentIndex - 1].id;
        this.scrollToTop();
      }
    },

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    onTabChange(newTab) {
      this.activeTab = newTab;
      this.scrollToTop();
    },

    updateReadingProgress() {
      const currentIndex = this.getCurrentSectionIndex();
      this.readingProgress = (currentIndex + 1) / this.sections.length;
    },

    onEnter(el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';

      setTimeout(() => {
        el.style.transition = 'all 0.3s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 50);
    },

    onLeave(el) {
      el.style.transition = 'all 0.3s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-20px)';
    }
  }
};
</script>

<style scoped>
/* Hero Section */
.hero-header {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  padding: 2rem;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.hero-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.05"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.05"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Cards */
.intro-card, .content-card, .contact-card, .sidebar-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.intro-card:hover, .content-card:hover, .contact-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* Navigation Tabs */
.tabs-container {
  background: linear-gradient(90deg, #f8f9ff 0%, #ffffff 100%);
  border-radius: 12px 12px 0 0;
}

.tab-item {
  min-height: 80px;
  position: relative;
  overflow: hidden;
}

.tab-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tab-item:hover::before {
  opacity: 1;
}

.tab-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 2;
}

.section-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.tab-label {
  font-weight: 600;
  font-size: 13px;
}

/* Sidebar */
.sidebar-card {
  position: sticky;
  top: 2rem;
}

.sidebar-nav {
  max-height: 400px;
  overflow-y: auto;
}

.sidebar-item {
  transition: all 0.3s ease;
  margin-bottom: 4px;
}

.sidebar-item:hover {
  background: rgba(102, 126, 234, 0.05);
  transform: translateX(4px);
}

.sidebar-active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-left: 4px solid #667eea;
}

.sidebar-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

/* Section Content */
.section-header {
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 1rem;
}

.section-number-large {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.section-body {
  line-height: 1.8;
}

.line-height-relaxed {
  line-height: 1.8;
}

/* Navigation Buttons */
.nav-btn {
  min-width: 120px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* Contact Section */
.contact-item {
  transition: all 0.3s ease;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 255, 0.9) 100%);
}

.contact-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Footer */
.footer-section {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  padding: 2rem 0;
  margin-top: 4rem;
}

/* Floating Action Button */
.floating-help-btn {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.floating-help-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

/* Animations */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-content {
    padding: 1rem;
  }

  .section-number-large {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }

  .tab-content {
    gap: 4px;
  }

  .section-badge {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }

  .tab-label {
    font-size: 11px;
  }

  .sidebar-card {
    position: static;
    margin-bottom: 1rem;
  }

  .nav-btn {
    min-width: 100px;
    padding: 10px 16px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .hero-header {
    min-height: 40vh;
  }

  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .section-body {
    font-size: 15px;
  }
}

/* Dark mode support (if Quasar dark mode is enabled) */
.body--dark .intro-card,
.body--dark .content-card,
.body--dark .contact-card,
.body--dark .sidebar-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.body--dark .contact-item {
  background: rgba(255, 255, 255, 0.03);
}

.body--dark .tabs-container {
  background: rgba(255, 255, 255, 0.05);
}

/* Custom scrollbar for sidebar */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

/* Print styles */
@media print {
  .hero-header,
  .sidebar-card,
  .section-navigation,
  .contact-card,
  .footer-section,
  .floating-help-btn {
    display: none !important;
  }

  .content-card {
    box-shadow: none;
    border: 1px solid #ddd;
  }

  .section-body {
    color: #000;
    font-size: 12pt;
    line-height: 1.6;
  }
}
</style>
