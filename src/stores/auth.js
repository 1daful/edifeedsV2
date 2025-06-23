var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// stores/auth.js - Pinia Store
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '../lib/supabase.js';
export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const login = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
        loading.value = true;
        error.value = null;
        try {
            const { data, error: authError } = yield supabase.auth.signInWithPassword({
                email,
                password
            });
            if (authError)
                throw authError;
            user.value = data.user;
            return { success: true, user: data.user };
        }
        catch (err) {
            error.value = err.message;
            return { success: false, error: err.message };
        }
        finally {
            loading.value = false;
        }
    });
    const register = (email, password, userData = {}) => __awaiter(void 0, void 0, void 0, function* () {
        loading.value = true;
        error.value = null;
        try {
            const { data, error: authError } = yield supabase.auth.signUp({
                email,
                password,
                options: {
                    data: userData
                }
            });
            if (authError)
                throw authError;
            user.value = data.user;
            return { success: true, user: data.user };
        }
        catch (err) {
            error.value = err.message;
            return { success: false, error: err.message };
        }
        finally {
            loading.value = false;
        }
    });
    const logout = () => __awaiter(void 0, void 0, void 0, function* () {
        loading.value = true;
        error.value = null;
        try {
            const { error: authError } = yield supabase.auth.signOut();
            if (authError)
                throw authError;
            user.value = null;
            return { success: true };
        }
        catch (err) {
            error.value = err.message;
            return { success: false, error: err.message };
        }
        finally {
            loading.value = false;
        }
    });
    const resetPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
        loading.value = true;
        error.value = null;
        try {
            const { error: authError } = yield supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });
            if (authError)
                throw authError;
            return { success: true };
        }
        catch (err) {
            error.value = err.message;
            return { success: false, error: err.message };
        }
        finally {
            loading.value = false;
        }
    });
    const clearError = () => {
        error.value = null;
    };
    return {
        user,
        loading,
        error,
        login,
        register,
        logout,
        resetPassword,
        clearError
    };
});
