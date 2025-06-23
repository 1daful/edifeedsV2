
// components/AuthForm.vue - Main Component
<template>
  <q-layout>
    <q-page-container>
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
            <Form v-if="formMode === 'login'" @submit="handleLogin" :validation-schema="validationRules.loginSchema">
              <Field name="email" v-slot="{ field, errors }">
                <q-input
                  v-bind="field"
                  label="Email Address"
                  type="email"
                  filled
                  class="q-mb-md"
                  :error="!!errors[0]"
                  :error-message="errors[0]"
                  autocomplete="email"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>
              </Field>

              <Field name="password" v-slot="{ field, errors }">
                <q-input
                  v-bind="field"
                  label="Password"
                  :type="showPassword ? 'text' : 'password'"
                  filled
                  class="q-mb-md"
                  :error="!!errors[0]"
                  :error-message="errors[0]"
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
            <Form v-else-if="formMode === 'register'" @submit="handleRegister" :validation-schema="validationRules.registerSchema">
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <Field name="firstName" v-slot="{ field, errors }">
                    <q-input
                      v-bind="field"
                      label="First Name"
                      filled
                      class="q-mb-md"
                      :error="!!errors[0]"
                      :error-message="errors[0]"
                      autocomplete="given-name"
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" />
                      </template>
                    </q-input>
                  </Field>
                </div>
                <div class="col-6">
                  <Field name="lastName" v-slot="{ field, errors }">
                    <q-input
                      v-bind="field"
                      label="Last Name"
                      filled
                      class="q-mb-md"
                      :error="!!errors[0]"
                      :error-message="errors[0]"
                      autocomplete="family-name"
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" />
                      </template>
                    </q-input>
                  </Field>
                </div>
              </div>

              <Field name="email" v-slot="{ field, errors }">
                <q-input
                  v-bind="field"
                  label="Email Address"
                  type="email"
                  filled
                  class="q-mb-md"
                  :error="!!errors[0]"
                  :error-message="errors[0]"
                  autocomplete="email"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>
              </Field>

              <Field name="password" v-slot="{ field, errors }">
                <q-input
                  v-bind="field"
                  label="Password"
                  :type="showPassword ? 'text' : 'password'"
                  filled
                  class="q-mb-md"
                  :error="!!errors[0]"
                  :error-message="errors[0]"
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

              <Field name="confirmPassword" v-slot="{ field, errors }">
                <q-input
                  v-bind="field"
                  label="Confirm Password"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  filled
                  class="q-mb-md"
                  :error="!!errors[0]"
                  :error-message="errors[0]"
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
            <Form v-else @submit="handleForgotPassword" :validation-schema="validationRules.forgotPasswordSchema">
              <Field name="email" v-slot="{ field, errors }">
                <q-input
                  v-bind="field"
                  label="Email Address"
                  type="email"
                  filled
                  class="q-mb-md"
                  :error="!!errors[0]"
                  :error-message="errors[0]"
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
    </q-page-container>
  </q-layout>
</template>
