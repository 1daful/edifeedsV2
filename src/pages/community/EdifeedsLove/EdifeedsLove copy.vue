<template>
  <div id="app">
    <div class="app-container">
      <!-- Homepage -->
      <div v-if="currentStep === 'home'" class="hero-section">
        <div class="love-icon">💖</div>
        <h1 style="margin: 0; font-size: 2rem; font-weight: 300">Edifeeds Love</h1>
        <p style="margin: 15px 0; opacity: 0.9; font-size: 1.1rem">
          Connect, grow, and share faith with others
        </p>
        <div style="position: relative; z-index: 10">
          <q-btn
            color="white"
            text-color="primary"
            label="Get Started"
            rounded
            size="lg"
            style="margin-top: 20px; padding: 12px 30px; font-weight: 500"
            @click="startOnboarding"
          />
        </div>
      </div>

      <!-- Step Indicator -->
      <div v-if="currentStep !== 'home' && currentStep !== 'complete'" class="step-indicator">
        <div class="step-dot" :class="{ active: stepIndex >= 0 }"></div>
        <div class="step-dot" :class="{ active: stepIndex >= 1 }"></div>
        <div class="step-dot" :class="{ active: stepIndex >= 2 }"></div>
        <div class="step-dot" :class="{ active: stepIndex >= 3 }"></div>
      </div>

      <!-- Step 1: Basic Info -->
      <transition name="slide" mode="out-in">
        <div v-if="currentStep === 'basic'" key="basic" style="padding: 20px">
          <h2 style="text-align: center; color: #333; margin-bottom: 30px">Let's Get Started</h2>

          <div class="profile-avatar" @click="selectAvatar">
            <i class="material-icons" v-if="!profile.avatar">person</i>
            <span v-else style="font-size: 2rem">{{ profile.avatar }}</span>
          </div>
          <p style="text-align: center; color: #666; margin-bottom: 30px">
            Tap to choose your avatar
          </p>

          <q-input
            v-model="profile.name"
            label="Full Name"
            outlined
            style="margin-bottom: 20px"
            :rules="[(val) => !!val || 'Name is required']"
          />

          <q-input
            v-model="profile.age"
            label="Age"
            type="number"
            outlined
            style="margin-bottom: 20px"
            :rules="[(val) => val >= 18 || 'Must be 18 or older']"
          />

          <q-select
            v-model="profile.gender"
            :options="['Male', 'Female', 'Non-binary', 'Prefer not to say']"
            label="Gender"
            outlined
            style="margin-bottom: 30px"
          />

          <div style="text-align: center">
            <q-btn
              color="primary"
              label="Continue"
              rounded
              size="lg"
              :disable="!isBasicValid"
              @click="nextStep"
            />
          </div>
        </div>
      </transition>

      <!-- Step 2: Bio & Interests -->
      <transition name="slide" mode="out-in">
        <div v-if="currentStep === 'bio'" key="bio" style="padding: 20px">
          <h2 style="text-align: center; color: #333; margin-bottom: 30px">
            Tell Us About Yourself
          </h2>

          <q-input
            v-model="profile.bio"
            label="Short Bio"
            type="textarea"
            outlined
            rows="4"
            style="margin-bottom: 20px"
            hint="Share what makes you unique!"
            :rules="[(val) => (val && val.length >= 20) || 'Please write at least 20 characters']"
          />

          <q-input
            v-model="profile.interests"
            label="Interests (comma-separated)"
            outlined
            style="margin-bottom: 20px"
            hint="e.g., reading, hiking, cooking, music"
          />

          <q-select
            v-model="profile.denomination"
            :options="denominations"
            label="Denomination/Spiritual Practice"
            outlined
            style="margin-bottom: 30px"
          />

          <div style="display: flex; gap: 10px; margin-bottom: 30px">
            <q-btn color="grey-3" text-color="primary" label="Back" rounded @click="prevStep" />
            <q-btn
              color="primary"
              label="Continue"
              rounded
              style="flex: 1"
              :disable="!isBioValid"
              @click="nextStep"
            />
          </div>
        </div>
      </transition>

      <!-- Step 3: Relationship Goals & Tags -->
      <transition name="slide" mode="out-in">
        <div v-if="currentStep === 'goals'" key="goals" style="padding: 20px">
          <h2 style="text-align: center; color: #333; margin-bottom: 30px">Relationship Goals</h2>

          <q-select
            v-model="profile.relationshipGoals"
            :options="relationshipOptions"
            label="What are you looking for?"
            outlined
            style="margin-bottom: 30px"
          />

          <h3 style="color: #333; margin-bottom: 15px">Choose your tags:</h3>
          <div style="margin-bottom: 30px">
            <q-chip
              v-for="tag in availableTags"
              :key="tag.value"
              :class="{ selected: profile.tags.includes(tag.value) }"
              class="tag-chip"
              :color="profile.tags.includes(tag.value) ? 'primary' : 'grey-3'"
              :text-color="profile.tags.includes(tag.value) ? 'white' : 'primary'"
              @click="toggleTag(tag.value)"
            >
              {{ tag.icon }} {{ tag.label }}
            </q-chip>
          </div>

          <div style="display: flex; gap: 10px">
            <q-btn color="grey-3" text-color="primary" label="Back" rounded @click="prevStep" />
            <q-btn
              color="primary"
              label="Continue"
              rounded
              style="flex: 1"
              :disable="!isGoalsValid"
              @click="nextStep"
            />
          </div>
        </div>
      </transition>

      <!-- Step 4: Privacy & Safety -->
      <transition name="slide" mode="out-in">
        <div v-if="currentStep === 'privacy'" key="privacy" style="padding: 20px">
          <h2 style="text-align: center; color: #333; margin-bottom: 30px">Privacy & Safety</h2>

          <q-card flat bordered style="margin-bottom: 20px; padding: 20px">
            <div style="display: flex; align-items: center; margin-bottom: 15px">
              <i class="material-icons" style="color: #ff6b6b; margin-right: 10px">security</i>
              <h3 style="margin: 0; color: #333">Community Guidelines</h3>
            </div>
            <ul style="color: #666; line-height: 1.6">
              <li>Treat everyone with respect and kindness</li>
              <li>Be authentic and honest in your profile</li>
              <li>Report any inappropriate behavior</li>
              <li>Meet in public places for first dates</li>
            </ul>
          </q-card>

          <q-card flat bordered style="margin-bottom: 30px; padding: 20px">
            <div style="display: flex; align-items: center; margin-bottom: 15px">
              <i class="material-icons" style="color: #4caf50; margin-right: 10px">privacy_tip</i>
              <h3 style="margin: 0; color: #333">Your Privacy</h3>
            </div>
            <p style="color: #666; line-height: 1.6; margin: 0">
              Your profile is only visible to verified community members. You control who can
              message you and see your information.
            </p>
          </q-card>

          <q-checkbox
            v-model="profile.agreeToTerms"
            label="I agree to the Community Guidelines and Privacy Policy"
            style="margin-bottom: 30px"
          />

          <div style="display: flex; gap: 10px">
            <q-btn color="grey-3" text-color="primary" label="Back" rounded @click="prevStep" />
            <q-btn
              color="primary"
              label="Complete Profile"
              rounded
              style="flex: 1"
              :disable="!profile.agreeToTerms"
              @click="completeProfile"
            />
          </div>
        </div>
      </transition>

      <!-- Completion Screen -->
      <div v-if="currentStep === 'complete'" class="completed-section">
        <div class="success-icon">🎉</div>
        <h1 style="margin: 0; font-size: 2rem; font-weight: 300">Welcome to Edifeeds Love!</h1>
        <p style="margin: 20px 0; opacity: 0.9; font-size: 1.1rem">
          Your profile is ready. Start connecting with amazing people in your faith community!
        </p>

        <q-btn
          color="white"
          text-color="primary"
          label="Start Exploring"
          rounded
          size="lg"
          style="margin-top: 20px; padding: 12px 30px; font-weight: 500"
          @click="startExploring"
        />
      </div>

      <!-- Avatar Selection Dialog -->
      <q-dialog v-model="showAvatarDialog">
        <q-card style="min-width: 300px">
          <q-card-section>
            <h3 style="margin: 0; text-align: center">Choose Your Avatar</h3>
          </q-card-section>
          <q-card-section>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px">
              <q-btn
                v-for="avatar in avatarOptions"
                :key="avatar"
                :color="profile.avatar === avatar ? 'primary' : 'grey-3'"
                rounded
                style="aspect-ratio: 1; font-size: 1.5rem"
                @click="selectAvatarOption(avatar)"
              >
                {{ avatar }}
              </q-btn>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn label="Done" color="primary" rounded @click="closeAvatarDialog" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, computed } from 'vue';
    const currentStep = ref('home');
    const showAvatarDialog = ref(false);

    const profile = ref({
      name: '',
      age: null,
      gender: '',
      bio: '',
      interests: '',
      denomination: '',
      relationshipGoals: '',
      tags: [],
      agreeToTerms: false,
      avatar: ''
    });

    const denominations = [
        'Catholic', 'Protestant', 'Orthodox', 'Baptist', 'Methodist',
        'Lutheran', 'Presbyterian', 'Anglican', 'Pentecostal',
        'Non-denominational', 'Other', 'Exploring faith'
    ];

    const relationshipOptions = [
        'Serious relationship leading to marriage',
        'Dating with marriage in mind',
        'Friendship first, see where it leads',
        'Christian fellowship and community',
        'Not sure yet, open to possibilities'
    ];

    const availableTags = [
        { value: 'worship', label: 'Worship lover', icon: '🎶' },
        { value: 'bible-study', label: 'Bible study', icon: '📖' },
        { value: 'traveler', label: 'Traveler', icon: '✈️' },
        { value: 'choir', label: 'Choir member', icon: '🎤' },
        { value: 'volunteer', label: 'Volunteer', icon: '🤝' },
        { value: 'prayer', label: 'Prayer warrior', icon: '🙏' },
        { value: 'youth-leader', label: 'Youth leader', icon: '👥' },
        { value: 'musician', label: 'Musician', icon: '🎸' },
        { value: 'outdoors', label: 'Outdoors', icon: '🏞️' },
        { value: 'cooking', label: 'Cooking', icon: '👨‍🍳' },
        { value: 'fitness', label: 'Fitness', icon: '💪' },
        { value: 'arts', label: 'Arts & crafts', icon: '🎨' }
    ];

    const avatarOptions = ['👨', '👩', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍⚕️', '👩‍⚕️', '👨‍🏫', '👩‍🏫', '👨‍🎨', '👩‍🎨', '🧔', '👱‍♀️', '👱‍♂️', '👩‍🦱'];

    const stepIndex = computed(() => {
        const steps = ['basic', 'bio', 'goals', 'privacy'];
        return steps.indexOf(currentStep.value);
    });

    const isBasicValid = computed(() => {
        return profile.value.name &&
                profile.value.age >= 18 &&
                profile.value.gender;
    });

    const isBioValid = computed(() => {
        return profile.value.bio &&
                profile.value.bio.length >= 20 &&
                profile.value.denomination;
    });

    const isGoalsValid = computed(() => {
        return profile.value.relationshipGoals &&
                profile.value.tags.length >= 2;
    });

    const startOnboarding = () => {
        currentStep.value = 'basic';
    };

    const nextStep = () => {
        const steps = ['basic', 'bio', 'goals', 'privacy'];
        const currentIndex = steps.indexOf(currentStep.value);
        if (currentIndex < steps.length - 1) {
            currentStep.value = steps[currentIndex + 1];
        }
    };

    const prevStep = () => {
        const steps = ['basic', 'bio', 'goals', 'privacy'];
        const currentIndex = steps.indexOf(currentStep.value);
        if (currentIndex > 0) {
            currentStep.value = steps[currentIndex - 1];
        }
    };

    const selectAvatar = () => {
        showAvatarDialog.value = true;
    };

    const selectAvatarOption = (avatar) => {
        profile.value.avatar = avatar;
    };

    const closeAvatarDialog = () => {
        showAvatarDialog.value = false;
    };

    const toggleTag = (tagValue) => {
        const index = profile.value.tags.indexOf(tagValue);
        if (index > -1) {
            profile.value.tags.splice(index, 1);
        } else {
            profile.value.tags.push(tagValue);
        }
    };

    const completeProfile = () => {
        // Save profile data (in a real app, this would go to a backend)
        console.log('Profile completed:', profile.value);
        currentStep.value = 'complete';
    };

    const startExploring = () => {
        alert('🎉 Profile complete! In a real app, you would now be taken to the main dating interface.');
        // Reset for demo purposes
        currentStep.value = 'home';
        profile.value = {
            name: '',
            age: null,
            gender: '',
            bio: '',
            interests: '',
            denomination: '',
            relationshipGoals: '',
            tags: [],
            agreeToTerms: false,
            avatar: ''
        };
    };
</script>

<style>
body {
  font-family: 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}
.app-container {
  max-width: 400px;
  margin: 0 auto;
  background: white;
  min-height: 100vh;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}
.hero-section {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 40px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="70" r="1.5" fill="rgba(255,255,255,0.1)"/></svg>');
  animation: float 20s infinite linear;
}
@keyframes float {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
.love-icon {
  font-size: 3rem;
  margin-bottom: 10px;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}
.tag-chip {
  margin: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.tag-chip.selected {
  background: #ff6b6b !important;
  color: white !important;
}
.step-indicator {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}
.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e0e0e0;
  margin: 0 6px;
  transition: all 0.3s ease;
}
.step-dot.active {
  background: #ff6b6b;
  transform: scale(1.2);
}
.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  margin: 20px auto;
  cursor: pointer;
  transition: transform 0.3s ease;
}
.profile-avatar:hover {
  transform: scale(1.05);
}
.slide-enter-active,
.slide-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}
.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
.completed-section {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 40px 20px;
  text-align: center;
}
.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: bounceIn 1s ease;
}
@keyframes bounceIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
