<template>
  <q-page class="flex flex-center column q-pa-xl">
    <q-card class="auth-card" flat bordered>
      <q-card-section class="text-center">
        <div class="text-h4 text-primary q-mb-md">
          {{ formMode === 'login' ? 'Welcome Back' : formMode === 'register' ? 'Create Account' : 'Reset Password' }}
        </div>
        <div class="text-body2 text-grey-7">
          {{ getSubtitle() }}
        </div>
      </q-card-section>

      <q-card-section>
        <!-- Error Alert -->
        <q-banner v-if="authStore.error" class="bg-negative text-white q-mb-md" rounded>
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ authStore.error }}
          <template v-slot:action>
            <q-btn flat label="Dismiss" @click="authStore.clearError" />
          </template>
        </q-banner>

        <!-- Success Alert -->
        <q-banner v-if="successMessage" class="bg-positive text-white q-mb-md" rounded>
          <template v-slot:avatar>
            <q-icon name="check_circle" />
          </template>
          {{ successMessage }}
        </q-banner>

        <!-- Login Form -->
        <Form
          v-if="formMode === 'login'"
          :initial-values="{ email: '', password: '' }"
          :validation-schema="validationRules.loginSchema"
          @submit="handleLogin"
        >
          <Field name="email" v-slot="{ value, handleChange, handleBlur, errorMessage }">
            <q-input
              :model-value="value"
              @update:model-value="handleChange"
              @blur="handleBlur"
              label="Email Address"
              type="email"
              filled
              class="q-mb-md"
              :error="!!errorMessage"
              :error-message="errorMessage"
              autocomplete="email"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>
          </Field>

          <Field name="password" v-slot="{ value, handleChange, handleBlur, errorMessage }">
            <q-input
              :model-value="value"
              @update:model-value="handleChange"
              @blur="handleBlur"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              filled
              class="q-mb-md"
              :error="!!errorMessage"
              :error-message="errorMessage"
              autocomplete="current-password"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </Field>

          <div class="row items-center justify-between q-mb-lg">
            <q-checkbox v-model="rememberMe" label="Remember me" />
            <q-btn flat label="Forgot Password?" @click="formMode = 'forgot'" />
          </div>

          <q-btn
            type="submit"
            label="Sign In"
            color="primary"
            class="full-width q-mb-md"
            size="lg"
            :loading="authStore.loading"
            :disable="authStore.loading"
          />
        </Form>

        <!-- Register Form -->
        <Form
          v-else-if="formMode === 'register'"
          :initial-values="{ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }"
          :validation-schema="validationRules.registerSchema"
          @submit="handleRegister"
        >
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <Field name="firstName" v-slot="{ value, handleChange, handleBlur, errorMessage }">
                <q-input
                  :model-value="value"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                  label="First Name"
                  filled
                  class="q-mb-md"
                  :error="!!errorMessage"
                  :error-message="errorMessage"
                  autocomplete="given-name"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>
              </Field>
            </div>
            <div class="col-6">
              <Field name="lastName" v-slot="{ value, handleChange, handleBlur, errorMessage }">
                <q-input
                  :model-value="value"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                  label="Last Name"
                  filled
                  class="q-mb-md"
                  :error="!!errorMessage"
                  :error-message="errorMessage"
                  autocomplete="family-name"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>
              </Field>
            </div>
          </div>

          <Field name="email" v-slot="{ value, handleChange, handleBlur, errorMessage }">
            <q-input
              :model-value="value"
              @update:model-value="handleChange"
              @blur="handleBlur"
              label="Email Address"
              type="email"
              filled
              class="q-mb-md"
              :error="!!errorMessage"
              :error-message="errorMessage"
              autocomplete="email"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>
          </Field>

          <Field name="password" v-slot="{ value, handleChange, handleBlur, errorMessage }">
            <q-input
              :model-value="value"
              @update:model-value="handleChange"
              @blur="handleBlur"
              label="Password"
              :type="showPassword ? 'text' : 'password'"
              filled
              class="q-mb-md"
              :error="!!errorMessage"
              :error-message="errorMessage"
              autocomplete="new-password"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </Field>

          <Field name="confirmPassword" v-slot="{ value, handleChange, handleBlur, errorMessage }">
            <q-input
              :model-value="value"
              @update:model-value="handleChange"
              @blur="handleBlur"
              label="Confirm Password"
              :type="showConfirmPassword ? 'text' : 'password'"
              filled
              class="q-mb-md"
              :error="!!errorMessage"
              :error-message="errorMessage"
              autocomplete="new-password"
            >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showConfirmPassword = !showConfirmPassword"
                />
              </template>
            </q-input>
          </Field>

          <q-checkbox v-model="agreeToTerms" class="q-mb-md">
            <span>I agree to the
              <q-btn flat dense label="Terms of Service" class="text-primary" />
              and
              <q-btn flat dense label="Privacy Policy" class="text-primary" />
            </span>
          </q-checkbox>

          <q-btn
            type="submit"
            label="Create Account"
            color="primary"
            class="full-width q-mb-md"
            size="lg"
            :loading="authStore.loading"
            :disable="authStore.loading || !agreeToTerms"
          />
        </Form>

        <!-- Forgot Password Form -->
        <Form
          v-else
          :initial-values="{ email: '' }"
          :validation-schema="validationRules.forgotPasswordSchema"
          @submit="handleForgotPassword"
        >
          <Field name="email" v-slot="{ value, handleChange, handleBlur, errorMessage }">
            <q-input
              :model-value="value"
              @update:model-value="handleChange"
              @blur="handleBlur"
              label="Email Address"
              type="email"
              filled
              class="q-mb-md"
              :error="!!errorMessage"
              :error-message="errorMessage"
              autocomplete="email"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>
          </Field>

          <q-btn
            type="submit"
            label="Send Reset Link"
            color="primary"
            class="full-width q-mb-md"
            size="lg"
            :loading="authStore.loading"
            :disable="authStore.loading"
          />
        </Form>

        <!-- Form Mode Switcher -->
        <div class="text-center">
          <template v-if="formMode === 'login'">
            Don't have an account?
            <q-btn flat label="Sign Up" @click="formMode = 'register'" />
          </template>
          <template v-else-if="formMode === 'register'">
            Already have an account?
            <q-btn flat label="Sign In" @click="formMode = 'login'" />
          </template>
          <template v-else>
            Remember your password?
            <q-btn flat label="Sign In" @click="formMode = 'login'" />
          </template>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
defineOptions({ name: 'LoginPage' })
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Form, Field } from 'vee-validate'
import { useAuthStore } from '../stores/auth'
import { useValidationRules } from '../composables/useValidation'
import { useQuasar } from 'quasar'

const router = useRouter()
const authStore = useAuthStore()
const validationRules = useValidationRules()
const $q = useQuasar()

const formMode = ref<'login' | 'register' | 'forgot'>('login')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const rememberMe = ref(false)
const agreeToTerms = ref(false)
const successMessage = ref('')

const getSubtitle = () => {
  switch (formMode.value) {
    case 'login':
      return 'Sign in to your account to continue'
    case 'register':
      return 'Create a new account to get started'
    case 'forgot':
      return 'Enter your email to receive a password reset link'
    default:
      return ''
  }
}

const handleLogin = async (values: { email: string; password: string }) => {
  const result = await authStore.login(values.email, values.password)

  if (result.success) {
    /*$q.notify({
      type: 'positive',
      message: 'Login successful!',
      position: 'top'
    })*/
    router.push('/dashboard')
  }
}

const handleRegister = async (values: any) => {
  const userData = {
    first_name: values.firstName,
    last_name: values.lastName,
    full_name: `${values.firstName} ${values.lastName}`
  }

  const result = await authStore.register(values.email, values.password, userData)

  if (result.success) {
    successMessage.value = 'Account created successfully! Please check your email to verify your account.'
    setTimeout(() => {
      formMode.value = 'login'
      successMessage.value = ''
    }, 3000)
  }
}

const handleForgotPassword = async (values: { email: string }) => {
  const result = await authStore.resetPassword(values.email)

  if (result.success) {
    successMessage.value = 'Password reset link sent to your email!'
    setTimeout(() => {
      formMode.value = 'login'
      successMessage.value = ''
    }, 3000)
  }
}
</script>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 480px;
  border-radius: 12px;
}

.q-btn--flat {
  text-transform: none;
}
</style>
