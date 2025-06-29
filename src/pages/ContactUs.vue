<!-- src/pages/ContactUsPage.vue -->
<template>
  <q-page class="contact-page">
    <!-- Hero Section -->
    <div class="hero-section q-pa-xl text-center">
      <div class="container">
        <h1 class="text-h3 text-weight-bold q-mb-md">Get In Touch</h1>
        <p class="text-h6 text-grey-7 q-mb-lg">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>
    </div>

    <div class="main-content q-pa-lg">
      <div class="row q-col-gutter-xl justify-center">
        <!-- Contact Form -->
        <div class="col-12 col-md-8 col-lg-6">
          <q-card class="contact-form-card" flat bordered>
            <q-card-section class="q-pa-xl">
              <div class="text-h5 q-mb-lg text-center">Send us a message</div>

              <q-form
                @submit.prevent="submitForm"
                ref="contactForm"
                class="q-gutter-md"
              >
                <!-- Name Field -->
                <q-input
                  v-model="form.name"
                  label="Full Name *"
                  outlined
                  :rules="nameRules"
                  lazy-rules
                  :loading="isSubmitting"
                  :disable="isSubmitting"
                  @blur="validateField('name')"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>

                <!-- Email Field -->
                <q-input
                  v-model="form.email"
                  label="Email Address *"
                  type="email"
                  outlined
                  :rules="emailRules"
                  lazy-rules
                  :loading="isSubmitting"
                  :disable="isSubmitting"
                  @blur="validateField('email')"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>

                <!-- Phone Field -->
                <q-input
                  v-model="form.phone"
                  label="Phone Number"
                  outlined
                  :rules="phoneRules"
                  lazy-rules
                  :loading="isSubmitting"
                  :disable="isSubmitting"
                  hint="Optional - for urgent inquiries"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" />
                  </template>
                </q-input>

                <!-- Subject Field -->
                <q-select
                  v-model="form.subject"
                  :options="subjectOptions"
                  label="Subject *"
                  outlined
                  :rules="subjectRules"
                  lazy-rules
                  :loading="isSubmitting"
                  :disable="isSubmitting"
                  emit-value
                  map-options
                >
                  <template v-slot:prepend>
                    <q-icon name="subject" />
                  </template>
                </q-select>

                <!-- Message Field -->
                <q-input
                  v-model="form.message"
                  label="Message *"
                  type="textarea"
                  outlined
                  rows="5"
                  :rules="messageRules"
                  lazy-rules
                  :loading="isSubmitting"
                  :disable="isSubmitting"
                  counter
                  maxlength="1000"
                >
                  <template v-slot:prepend>
                    <q-icon name="message" style="align-self: flex-start; margin-top: 8px;" />
                  </template>
                </q-input>

                <!-- Priority Level -->
                <div class="q-mb-md">
                  <div class="text-subtitle2 q-mb-sm">Priority Level</div>
                  <q-option-group
                    v-model="form.priority"
                    :options="priorityOptions"
                    color="primary"
                    inline
                    :disable="isSubmitting"
                  />
                </div>

                <!-- Newsletter Subscription -->
                <q-checkbox
                  v-model="form.subscribeNewsletter"
                  label="Subscribe to our newsletter for updates"
                  :disable="isSubmitting"
                  class="q-mb-md"
                />

                <!-- Terms Agreement -->
                <q-checkbox
                  v-model="form.agreeTerms"
                  :disable="isSubmitting"
                  class="q-mb-lg"
                >
                  <template v-slot:default>
                    <div class="text-caption">
                      I agree to the
                      <a href="#" class="text-primary">Terms of Service</a>
                      and
                      <a href="#" class="text-primary">Privacy Policy</a> *
                    </div>
                  </template>
                </q-checkbox>

                <!-- Submit Button -->
                <div class="text-center">
                  <q-btn
                    label="Send Message"
                    type="submit"
                    color="primary"
                    size="lg"
                    :loading="isSubmitting"
                    :disable="!isFormValid"
                    class="q-px-xl"
                    no-caps
                  >
                    <template v-slot:loading>
                      <q-spinner-hourglass class="on-left" />
                      Sending...
                    </template>
                  </q-btn>
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>

        <!-- Contact Information Sidebar -->
        <div class="col-12 col-md-4 col-lg-3">
          <q-card flat bordered class="contact-info-card">
            <q-card-section class="q-pa-lg">
              <div class="text-h6 q-mb-md">Contact Information</div>

              <div class="contact-item q-mb-md">
                <q-icon name="location_on" color="primary" size="sm" class="q-mr-sm" />
                <div>
                  <div class="text-weight-medium">Address</div>
                  <div class="text-caption text-grey-7">
                    123 Business Street<br>
                    Suite 100<br>
                    City, State 12345
                  </div>
                </div>
              </div>

              <div class="contact-item q-mb-md">
                <q-icon name="phone" color="primary" size="sm" class="q-mr-sm" />
                <div>
                  <div class="text-weight-medium">Phone</div>
                  <div class="text-caption text-grey-7">+1 (555) 123-4567</div>
                </div>
              </div>

              <div class="contact-item q-mb-md">
                <q-icon name="email" color="primary" size="sm" class="q-mr-sm" />
                <div>
                  <div class="text-weight-medium">Email</div>
                  <div class="text-caption text-grey-7">hello@company.com</div>
                </div>
              </div>

              <div class="contact-item q-mb-lg">
                <q-icon name="schedule" color="primary" size="sm" class="q-mr-sm" />
                <div>
                  <div class="text-weight-medium">Business Hours</div>
                  <div class="text-caption text-grey-7">
                    Mon - Fri: 9:00 AM - 6:00 PM<br>
                    Saturday: 10:00 AM - 4:00 PM<br>
                    Sunday: Closed
                  </div>
                </div>
              </div>

              <!-- Social Media Links -->
              <div class="text-center">
                <div class="text-subtitle2 q-mb-sm">Follow Us</div>
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="fab fa-facebook"
                  class="q-ma-xs"
                  @click="openSocialLink('facebook')"
                />
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="fab fa-twitter"
                  class="q-ma-xs"
                  @click="openSocialLink('twitter')"
                />
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="fab fa-linkedin"
                  class="q-ma-xs"
                  @click="openSocialLink('linkedin')"
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- FAQ Quick Links -->
          <q-card flat bordered class="q-mt-md">
            <q-card-section class="q-pa-lg">
              <div class="text-h6 q-mb-md">Quick Help</div>
              <q-list>
                <q-item clickable v-ripple @click="openFAQ">
                  <q-item-section avatar>
                    <q-icon name="help_outline" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Frequently Asked Questions</q-item-label>
                    <q-item-label caption>Find quick answers</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-ripple @click="openSupport">
                  <q-item-section avatar>
                    <q-icon name="support_agent" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Live Support</q-item-label>
                    <q-item-label caption>Chat with our team</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Success/Error Notifications -->
    <q-dialog v-model="showSuccessDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="text-center q-pa-lg">
          <q-avatar size="80px" color="positive" text-color="white" class="q-mb-md">
            <q-icon name="check_circle" size="50px" />
          </q-avatar>
          <div class="text-h6 q-mb-sm">Message Sent Successfully!</div>
          <div class="text-body2 text-grey-7">
            Thank you, {{ submittedName }}! We've received your message and will get back to you within 24 hours.
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn label="Close" color="primary" @click="closeSuccessDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang='ts'>
import { ref, computed, nextTick } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Form data
const form = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  priority: 'normal',
  subscribeNewsletter: false,
  agreeTerms: false
})

// Form state
const isSubmitting = ref(false)
const showSuccessDialog = ref(false)
const submittedName = ref('')
const contactForm = ref(null)

// Subject options
const subjectOptions = [
  { label: 'General Inquiry', value: 'general' },
  { label: 'Technical Support', value: 'support' },
  { label: 'Sales Question', value: 'sales' },
  { label: 'Partnership Opportunity', value: 'partnership' },
  { label: 'Bug Report', value: 'bug' },
  { label: 'Feature Request', value: 'feature' },
  { label: 'Other', value: 'other' }
]

// Priority options
const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' }
]

// Validation rules
const nameRules = [
  (val: string) => (val && val.length > 0) || 'Name is required',
  (val: string) => (val && val.length >= 2) || 'Name must be at least 2 characters',
  (val: string) => (val && val.length <= 50) || 'Name must be less than 50 characters'
]

const emailRules = [
  (val: string) => (val && val.length > 0) || 'Email is required',
  (val: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(val) || 'Please enter a valid email address'
  }
]

const phoneRules = [
  (val: string) => !val || val.length >= 10 || 'Phone number must be at least 10 digits',
  (val: string) => !val || /^[\d\s\-\+\(\)]+$/.test(val) || 'Please enter a valid phone number'
]

const subjectRules = [
  (val: string) => (val && val.length > 0) || 'Please select a subject'
]

const messageRules = [
  (val: string) => (val && val.length > 0) || 'Message is required',
  (val: string) => (val && val.length >= 10) || 'Message must be at least 10 characters',
  (val: string) => (val && val.length <= 1000) || 'Message must be less than 1000 characters'
]

// Computed properties
const isFormValid = computed(() => {
  return form.value.name &&
         form.value.email &&
         form.value.subject &&
         form.value.message &&
         form.value.agreeTerms &&
         form.value.name.length >= 2 &&
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email) &&
         form.value.message.length >= 10
})

// Methods
const validateField = (fieldName) => {
  // Trigger validation for specific field
  nextTick(() => {
    if (contactForm.value) {
      const input = contactForm.value.$el.querySelector(`[name="${fieldName}"]`)
      if (input) {
        input.blur()
      }
    }
  })
}

const submitForm = async () => {
  // Validate form before submission
  const isValid = await contactForm.value.validate()
  if (!isValid) {
    $q.notify({
      type: 'negative',
      message: 'Please correct the errors in the form',
      position: 'top'
    })
    return
  }

  isSubmitting.value = true

  try {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Here you would typically send the data to your backend
    console.log('Form submitted:', form.value)

    // Store submitted name for success dialog
    submittedName.value = form.value.name

    // Show success dialog
    showSuccessDialog.value = true

    // Reset form
    resetForm()

    // Show success notification
    $q.notify({
      type: 'positive',
      message: 'Message sent successfully!',
      position: 'top',
      timeout: 3000
    })

  } catch (error) {
    console.error('Error submitting form:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to send message. Please try again.',
      position: 'top',
      timeout: 5000
    })
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    priority: 'normal',
    subscribeNewsletter: false,
    agreeTerms: false
  }

  // Reset form validation
  if (contactForm.value) {
    contactForm.value.resetValidation()
  }
}

const closeSuccessDialog = () => {
  showSuccessDialog.value = false
  submittedName.value = ''
}

// Social media and external links
const openSocialLink = (platform) => {
  const urls = {
    facebook: 'https://facebook.com/yourcompany',
    twitter: 'https://twitter.com/yourcompany',
    linkedin: 'https://linkedin.com/company/yourcompany'
  }
  window.open(urls[platform], '_blank')
}

const openFAQ = () => {
  // Navigate to FAQ page or open FAQ dialog
  console.log('Opening FAQ')
  $q.notify({
    message: 'FAQ page would open here',
    position: 'bottom'
  })
}

const openSupport = () => {
  // Open live chat or support system
  console.log('Opening live support')
  $q.notify({
    message: 'Live support would open here',
    position: 'bottom'
  })
}
</script>

<style scoped>
.contact-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 2rem;
}

.hero-section .container {
  max-width: 800px;
  margin: 0 auto;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.contact-form-card {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background: white;
}

.contact-info-card {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: white;
}

.contact-item {
  display: flex;
  align-items: flex-start;
}

.contact-item .q-icon {
  margin-top: 2px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-section {
    padding: 2rem 1rem;
  }

  .main-content {
    padding: 1rem;
  }

  .contact-form-card .q-card-section {
    padding: 1.5rem;
  }
}

/* Form animations */
.q-input {
  transition: all 0.3s ease;
}

.q-input:hover {
  transform: translateY(-1px);
}

/* Button hover effects */
.q-btn {
  transition: all 0.3s ease;
}

.q-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* Priority option styling */
.q-option-group .q-radio__label {
  font-weight: 500;
}
</style>
