<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center" :class="$q.screen.lt.sm ? 'bg-white' : 'onboarding-page-bg'">
        <q-card class="onboarding-card">
          <div v-if="currentStep === 0" class="hero-section text-center text-white">
            <q-icon name="favorite" size="64px" class="love-icon" />
            <div class="text-h4 hero-title">Edifeeds Love</div>
            <p class="text-subtitle1 hero-subtitle">Connect, grow, and share faith with others</p>
            <q-btn
              label="Get Started"
              icon="favorite"
              @click="nextStep"
              rounded
              size="lg"
              class="q-mt-md q-py-md q-px-xl glass-btn"
            />
          </div>

          <div v-if="currentStep > 0 && currentStep <= 4" class="q-pa-md">
            <q-linear-progress :value="progress" size="sm" color="deep-orange" class="q-mb-md" />

            <q-stepper v-model="currentStep" header-nav animated flat class="onboarding-stepper">
              <q-step :name="1" title="Your Info" icon="person" :done="currentStep > 1">
                <div class="text-h5 text-center q-my-md">Let's Get to Know You</div>
                <div class="text-center q-mb-md">
                  <q-avatar
                    size="120px"
                    class="profile-avatar-bg cursor-pointer"
                    @click="showAvatarModal = true"
                  >
                    <div class="text-h3">{{ selectedAvatar }}</div>
                    <q-icon
                      name="photo_camera"
                      size="sm"
                      class="absolute-bottom-right avatar-camera"
                    />
                  </q-avatar>
                  <p class="text-caption text-grey-7 q-mt-sm">Tap to choose your avatar</p>
                </div>
                <q-form ref="step1Form">
                  <q-input
                    v-model="profileData.displayName"
                    label="User Name"
                    outlined
                    rounded
                    dense
                    class="q-mb-md"
                    :rules="[(val) => !!val || 'User Name is required']"
                  />
                  <q-input
                    v-model="profileData.dateOfBirth"
                    label="Date of Birth"
                    mask="date"
                    :rules="[(val) => !!val || 'Date of Birth is required']"
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="profileData.dateOfBirth" @update:model-value="checkAge">
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup label="Close" color="primary" flat />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                  <q-select
                    v-model="profileData.gender"
                    :options="genderOptions"
                    label="Gender"
                    outlined
                    rounded
                    dense
                    class="q-mb-md"
                    :rules="[(val) => !!val || 'Gender is required']"
                  />
                </q-form>
              </q-step>

              <q-step :name="2" title="Bio" icon="article" :done="currentStep > 2">
                <div class="text-h5 text-center q-my-md">Tell Your Story</div>
                <q-form ref="step2Form">
                  <q-input
                    v-model="profileData.bio"
                    label="Your Bio"
                    type="textarea"
                    outlined
                    rounded
                    dense
                    class="q-mb-md"
                    hint="Minimum 20 characters"
                    :rules="[(val) => (val && val.length >= 20) || 'Bio is too short']"
                  />
                  <q-input
                    v-model="profileData.interests"
                    label="Interests"
                    outlined
                    rounded
                    dense
                    class="q-mb-md"
                    placeholder="e.g., reading, hiking, cooking, music"
                  />
                  <q-select
                    v-model="profileData.denomination"
                    :options="denominationOptions"
                    label="Denomination/Spiritual Practice"
                    outlined
                    rounded
                    dense
                    :rules="[(val) => !!val || 'Denomination is required']"
                  />
                </q-form>
              </q-step>

              <q-step :name="3" title="Goals" icon="trending_up" :done="currentStep > 3">
                <div class="text-h5 text-center q-my-md">Your Journey</div>
                <q-form ref="step3Form">
                  <q-select
                    v-model="profileData.relationshipGoals"
                    :options="goalOptions"
                    label="What are you looking for?"
                    outlined
                    rounded
                    dense
                    class="q-mb-md"
                    :rules="[(val) => !!val || 'Relationship goal is required']"
                  />

                  <div class="text-h6 q-mt-lg q-mb-md">
                    Choose your interests (select at least 2):
                  </div>
                  <div class="q-gutter-sm">
                    <q-chip
                      v-for="tag in availableTags"
                      :key="tag.value"
                      clickable
                      @click="toggleTag(tag.value)"
                      :color="selectedTags.includes(tag.value) ? 'deep-orange-5' : 'grey-4'"
                      :text-color="selectedTags.includes(tag.value) ? 'white' : 'black'"
                      size="lg"
                      class="tag-chip"
                    >
                      <q-icon :name="tag.icon" class="q-mr-sm" />
                      {{ tag.label }}
                    </q-chip>
                  </div>
                </q-form>
              </q-step>

              <q-step :name="4" title="Privacy" icon="verified_user">
                <div class="text-h5 text-center q-my-md">Privacy & Safety First</div>
                <q-card flat class="q-mb-md safety-card">
                  <q-card-section class="q-pt-sm">
                    <div class="text-h6 text-deep-orange-5">
                      <q-icon name="gavel" class="q-mr-sm" /> Community Guidelines
                    </div>
                    <ul class="q-mt-sm text-grey-8">
                      <li>Treat everyone with respect and kindness</li>
                      <li>Be authentic and honest in your profile</li>
                      <li>Report any inappropriate behavior</li>
                      <li>Meet in public places for first dates</li>
                      <li>Never share personal financial information</li>
                    </ul>
                  </q-card-section>
                </q-card>

                <q-card flat class="safety-card">
                  <q-card-section class="q-pt-sm">
                    <div class="text-h6 text-deep-orange-5">
                      <q-icon name="security" class="q-mr-sm" /> Your Privacy
                    </div>
                    <p class="text-grey-8 q-mt-sm">
                      Your profile is only visible to verified community members. You have complete
                      control over who can message you and see your information. We use
                      industry-standard encryption to protect your data.
                    </p>
                  </q-card-section>
                </q-card>

                <q-checkbox
                  v-model="agreeToTerms"
                  label="I agree to the Community Guidelines and Privacy Policy. I understand that this platform is designed for meaningful connections within the faith community."
                  class="q-mt-md"
                  color="deep-orange-5"
                />
              </q-step>
            </q-stepper>

            <div class="row q-gutter-md q-mt-lg">
              <q-btn
                v-if="currentStep > 1 && currentStep < 5"
                label="Back"
                icon="arrow_left"
                @click="prevStep"
                color="grey-4"
                text-color="black"
                rounded
                class="col"
              />
              <q-btn
                v-if="currentStep < 4"
                label="Continue"
                icon-right="arrow_right"
                @click="nextStep"
                color="deep-orange-5"
                rounded
                class="col"
                :disable="!canProceed"
              />
              <q-btn
                v-if="currentStep === 4"
                label="Complete Profile"
                icon-right="favorite"
                @click="completeProfile"
                color="deep-orange-5"
                rounded
                class="col"
                :loading="submitting"
                :disable="!canProceed"
              />
            </div>
          </div>

          <div v-if="currentStep === 5" class="completion-section text-center text-white">
            <q-icon name="celebration" size="80px" class="success-icon" />
            <div class="text-h4 completion-title">Welcome to Edifeeds Love!</div>
            <p class="text-subtitle1 completion-subtitle">
              Your profile is ready! Start connecting with amazing people in your faith community
              and discover meaningful relationships.
            </p>
            <q-btn
              label="Start Exploring"
              icon="explore"
              @click="startExploring"
              rounded
              size="lg"
              class="q-mt-md q-py-md q-px-xl glass-btn"
            />
          </div>
        </q-card>
      </q-page>
    </q-page-container>

    <q-dialog v-model="showAvatarModal">
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="text-h6 text-center">Choose Your Avatar</div>
        </q-card-section>
        <q-card-section class="q-gutter-sm text-center">
          <q-btn
            v-for="avatar in avatarOptions"
            :key="avatar"
            :label="avatar"
            @click="selectedAvatar = avatar"
            :outline="selectedAvatar !== avatar"
            color="deep-orange-5"
            size="xl"
            rounded
            class="avatar-btn"
          />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn label="Done" color="deep-orange-5" @click="showAvatarModal = false" rounded />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar, date } from 'quasar'
import { dbClient } from '../../../api/apiList'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

// --- STATE MANAGEMENT ---
const currentStep = ref(0) // 0: landing, 1: basic, 2: bio, 3: goals, 4: privacy, 5: complete
const showAvatarModal = ref(false)
const submitting = ref(false)
const agreeToTerms = ref(false)
const selectedTags = ref([])
const selectedAvatar = ref('👤')

const profileData = ref({
  firstName: '',
  lastName: '',
  displayName: '',
  dateOfBirth: null,
  gender: '',
  bio: '',
  interests: '',
  denomination: '',
  relationshipGoals: '',
})

// --- DATA OPTIONS ---
const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say']
const denominationOptions = [
  'Catholic',
  'Protestant',
  'Orthodox',
  'Baptist',
  'Methodist',
  'Lutheran',
  'Presbyterian',
  'Anglican',
  'Pentecostal',
  'Non-denominational',
  'Other',
  'Exploring faith',
]
const goalOptions = [
  'Serious relationship leading to marriage',
  'Dating with marriage in mind',
  'Friendship first, see where it leads',
  'Christian fellowship and community',
  'Not sure yet, open to possibilities',
]
const avatarOptions = [
  '👨',
  '👩',
  '👨‍💼',
  '👩‍💼',
  '👨‍🎓',
  '👩‍🎓',
  '👨‍⚕️',
  '👩‍⚕️',
  '👨‍🏫',
  '👩‍🏫',
  '👨‍🎨',
  '👩‍🎨',
  '🧔',
  '👱‍♀️',
  '👱‍♂️',
  '👩‍🦱',
  '👨‍🦱',
  '👨‍🦲',
  '👩‍🦲',
  '🧓',
]
const availableTags = [
  { value: 'worship', label: 'Worship lover', icon: 'music_note' },
  { value: 'bible-study', label: 'Bible study', icon: 'book' },
  { value: 'traveler', label: 'Traveler', icon: 'flight' },
  { value: 'choir', label: 'Choir member', icon: 'mic' },
  { value: 'volunteer', label: 'Volunteer', icon: 'volunteer_activism' },
  { value: 'prayer', label: 'Prayer warrior', icon: 'self_improvement' },
  { value: 'youth-leader', label: 'Youth leader', icon: 'group' },
  { value: 'musician', label: 'Musician', icon: 'piano' },
  { value: 'outdoors', label: 'Outdoors', icon: 'park' },
  { value: 'cooking', label: 'Cooking', icon: 'restaurant_menu' },
  { value: 'fitness', label: 'Fitness', icon: 'fitness_center' },
  { value: 'arts', label: 'Arts & crafts', icon: 'palette' },
  { value: 'reading', label: 'Reading', icon: 'menu_book' },
  { value: 'photography', label: 'Photography', icon: 'camera_alt' },
  { value: 'dancing', label: 'Dancing', icon: 'dance' },
  { value: 'sports', label: 'Sports', icon: 'sports_soccer' },
]

// --- COMPUTED PROPERTIES ---
const progress = computed(() => {
  const totalSteps = 4
  return currentStep.value / totalSteps
})

const isAgeValid = computed(() => {
  if (!profileData.value.dateOfBirth) {
    return false
  }
  const today = new Date()
  const birthDate = new Date(profileData.value.dateOfBirth)
  const age = date.getDateDiff(today, birthDate, 'years')
  return age >= 18
})

const isBasicInfoValid = computed(() => {
  return (
    profileData.value.displayName &&
    isAgeValid.value &&
    profileData.value.gender
  )
})

const isBioValid = computed(() => {
  return (
    profileData.value.bio && profileData.value.bio.length >= 20 && profileData.value.denomination
  )
})

const isGoalsValid = computed(() => {
  return profileData.value.relationshipGoals && selectedTags.value.length >= 2
})

const isPrivacyValid = computed(() => {
  return agreeToTerms.value
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return isBasicInfoValid.value
    case 2:
      return isBioValid.value
    case 3:
      return isGoalsValid.value
    case 4:
      return isPrivacyValid.value
    default:
      return false
  }
})

// --- METHODS ---
const nextStep = () => {
  if (currentStep.value === 0) {
    currentStep.value++
    return
  }
  if (canProceed.value) {
    currentStep.value++
  } else {
    $q.notify({
      message: 'Please fill in all required fields.',
      color: 'red-5',
      icon: 'warning',
    })
  }
}

const prevStep = () => {
  currentStep.value--
}

const toggleTag = (value) => {
  const index = selectedTags.value.indexOf(value)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(value)
  }
}

const completeProfile = async () => {
  const { data, error } = await supabase.auth.getUser()
  const user = data.user
  if (canProceed.value) {
    submitting.value = true
    const resp = dbClient.post({
      method: 'post',
      url: 'dating_profiles',
      data: {
        id: user?.id,
        display_name: profileData.value.displayName,
        date_of_birth: profileData.value.dateOfBirth,
        gender: profileData.value.gender,
        bio: profileData.value.bio,
        denomination: profileData.value.denomination,
        relationship_goal: profileData.value.relationshipGoals,
        tags: selectedTags.value,
        interests: profileData.value.interests,
      },
    })
    if (!resp) {
      $q.notify({
        message: 'Error creating profile.',
        color: 'red-5',
        icon: 'warning',
      })
      return
    }
    submitting.value = false
    currentStep.value = 5 // Show completion page
    $q.notify({
      message: 'Profile successfully created!',
      color: 'green-5',
      icon: 'check_circle',
    })
  } else {
    $q.notify({
      message: 'Please agree to the terms to complete your profile.',
      color: 'red-5',
      icon: 'warning',
    })
  }
}

const startExploring = () => {
  console.log('Navigating to main app...')
  router.push({ name: 'edifeeds-love' })
  $q.notify({
    message: 'Welcome! You can now start exploring.',
    color: 'blue-5',
    icon: 'compass',
  })
}
</script>

<style scoped>
.onboarding-page-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.onboarding-card {
  max-width: 420px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-radius: 15px;
  overflow: hidden;
  min-height: 95vh;
}

.hero-section {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  padding: 60px 30px;
  position: relative;
  overflow: hidden;
  height: 100%;
  min-height: 95vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.love-icon {
  animation: heartbeat 2s infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

@keyframes heartbeat {
  0%,
  100% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.1);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.1);
  }
  70% {
    transform: scale(1);
  }
}

.glass-btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.profile-avatar-bg {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.profile-avatar-bg:hover {
  transform: scale(1.05) rotate(5deg);
  box-shadow: 0 15px 40px rgba(255, 107, 107, 0.4);
}

.avatar-camera {
  background: white;
  border-radius: 50%;
  padding: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  color: #ff6b6b;
}

.tag-chip {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  border: 2px solid transparent;
}

.tag-chip:hover {
  transform: translateY(-2px);
}

.q-chip.selected {
  border-color: #ff6b6b;
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.safety-card {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 15px;
  border-left: 5px solid #ff6b6b;
}

.completion-section {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  padding: 60px 30px;
  min-height: 95vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.success-icon {
  animation: bounceIn 1s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
}

@keyframes bounceIn {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.3) rotate(-10deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Override Quasar stepper style */
.onboarding-stepper .q-stepper__header {
  display: none;
}
</style>
