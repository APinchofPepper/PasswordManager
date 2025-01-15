<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { PasswordManager } from '@/utils/passwordManager';
import { UserManager } from '@/models/User';
import { useToast } from 'vue-toast-notification';

const toast = useToast();

// Authentication state
const isLoggedIn = ref(false);
const currentUser = ref<any>(null);

// Registration/Login form
const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const isRegistering = ref(false);

// Password management
const generatedPassword = ref('');
const appName = ref('');
const storedAppPassword = ref('');

// Toggle between login and registration
const toggleAuthMode = () => {
  isRegistering.value = !isRegistering.value;
};

// Authentication methods
const handleAuth = () => {
  if (isRegistering.value) {
    // Registration logic
    if (password.value !== confirmPassword.value) {
      toast.error('Passwords do not match');
      return;
    }
    
    const success = UserManager.registerUser(username.value, password.value);
    if (success) {
      toast.success('Registration successful. Please log in.');
      isRegistering.value = false;
    } else {
      toast.error('Username already exists');
    }
  } else {
    // Login logic
    const user = UserManager.loginUser(username.value, password.value);
    if (user) {
      isLoggedIn.value = true;
      currentUser.value = user;
      toast.success('Login successful');
    } else {
      toast.error('Invalid username or password');
    }
  }
};

// Password generation
const generateStrongPassword = () => {
  generatedPassword.value = PasswordManager.generatePassword();
  toast.success('Strong password generated!');
};

// Store application password
const storeApplicationPassword = () => {
  if (!appName.value || !generatedPassword.value) {
    toast.error('Please generate or enter a password');
    return;
  }

  const success = UserManager.storeApplicationPassword(
    appName.value, 
    generatedPassword.value
  );

  if (success) {
    toast.success('Password stored successfully');
    generatedPassword.value = ''; // Clear generated password
    appName.value = '';
  } else {
    toast.error('Failed to store password');
  }
};

// Retrieve stored password
const retrieveStoredPassword = () => {
  if (!appName.value) {
    toast.error('Please enter an application name');
    return;
  }

  const password = UserManager.getApplicationPassword(appName.value);
  
  if (password) {
    storedAppPassword.value = password;
    toast.success('Password retrieved successfully');
  } else {
    toast.error('No password found for this application');
  }
};

// Logout
const logout = () => {
  UserManager.logout();
  isLoggedIn.value = false;
  currentUser.value = null;
  toast.success('Logged out successfully');
};

// Check login status on component mount
onMounted(() => {
  const user = UserManager.getCurrentUser();
  if (user) {
    isLoggedIn.value = true;
    currentUser.value = user;
  }
});
</script>

<template>
  <div class="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
    <!-- Authentication Section -->
    <div v-if="!isLoggedIn">
      <h2 class="text-2xl font-bold mb-4 text-center">
        {{ isRegistering ? 'Register' : 'Login' }}
      </h2>
      
      <form @submit.prevent="handleAuth" class="space-y-4">
        <input 
          v-model="username" 
          type="text" 
          placeholder="Username" 
          required
          class="w-full px-3 py-2 border rounded-md"
        />
        <input 
          v-model="password" 
          type="password" 
          placeholder="Password" 
          required
          class="w-full px-3 py-2 border rounded-md"
        />
        
        <template v-if="isRegistering">
          <input 
            v-model="confirmPassword" 
            type="password" 
            placeholder="Confirm Password" 
            required
            class="w-full px-3 py-2 border rounded-md"
          />
        </template>
        
        <button 
          type="submit" 
          class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          {{ isRegistering ? 'Register' : 'Login' }}
        </button>
      </form>
      
      <p class="text-center mt-4">
        {{ isRegistering ? 'Already have an account?' : 'Need an account?' }}
        <a 
          href="#" 
          @click.prevent="toggleAuthMode" 
          class="text-blue-500 hover:underline"
        >
          {{ isRegistering ? 'Login' : 'Register' }}
        </a>
      </p>
    </div>

    <!-- Password Management Section -->
    <div v-else>
      <h2 class="text-2xl font-bold mb-4 text-center">
        Password Manager
      </h2>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">
          Generated Password
        </label>
        <div class="flex">
          <input 
            :value="generatedPassword" 
            type="text" 
            readonly
            class="flex-grow px-3 py-2 border rounded-md mr-2"
          />
          <button 
            @click="generateStrongPassword"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Generate
          </button>
        </div>
      </div>
      
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">
          Store Password for Application
        </label>
        <input 
          v-model="appName" 
          type="text" 
          placeholder="Application Name"
          class="w-full px-3 py-2 border rounded-md mb-2"
        />
        <button 
          @click="storeApplicationPassword"
          class="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Store Password
        </button>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Retrieve Stored Password
        </label>
        <input 
          v-model="appName" 
          type="text" 
          placeholder="Application Name"
          class="w-full px-3 py-2 border rounded-md mb-2"
        />
        <button 
          @click="retrieveStoredPassword"
          class="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
        >
          Retrieve Password
        </button>
        
        <input 
          v-if="storedAppPassword"
          :value="storedAppPassword" 
          type="text" 
          readonly
          class="w-full px-3 py-2 border rounded-md mt-2"
        />
      </div>
      
      <button 
        @click="logout"
        class="w-full mt-4 bg-red-500 text-white py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  </div>
</template>