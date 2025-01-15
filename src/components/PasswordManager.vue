<script setup lang="ts">
import { ref, computed } from 'vue';
import { useToast } from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import { PasswordManager } from '@/utils/passwordManager';

const $toast = useToast();

// Form state
const password = ref('');
const storedPasswordKey = ref('');
const retrievalKey = ref('');

// Strength analysis
const passwordStrength = computed(() => {
  return password.value 
    ? PasswordManager.analyzePasswordStrength(password.value)
    : null;
});

// Password generation
const generateStrongPassword = () => {
  password.value = PasswordManager.generatePassword();
  $toast.success('Strong password generated!');
};

// Store password
const storeCurrentPassword = () => {
  if (!storedPasswordKey.value) {
    $toast.error('Please provide a storage key');
    return;
  }
  
  try {
    PasswordManager.storePassword(storedPasswordKey.value, password.value);
    $toast.success('Password securely stored');
  } catch (error) {
    $toast.error('Failed to store password');
  }
};

// Retrieve password
const retrieveStoredPassword = () => {
  if (!retrievalKey.value) {
    $toast.error('Please provide a retrieval key');
    return;
  }
  
  const retrievedPassword = PasswordManager.retrievePassword(retrievalKey.value);
  
  if (retrievedPassword) {
    password.value = retrievedPassword;
    $toast.success('Password retrieved successfully');
  } else {
    $toast.error('No password found for this key');
  }
};

// Strength indicator color
const strengthColor = computed(() => {
  if (!passwordStrength.value) return 'bg-gray-200';
  
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-green-700'
  ];
  
  return colors[passwordStrength.value.score] || 'bg-gray-200';
});
</script>

<template>
  <div class="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
    <h2 class="text-2xl font-bold mb-4 text-center">
      Password Strength Manager
    </h2>
    
    <!-- Password Input -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700">
        Password
      </label>
      <input 
        v-model="password" 
        type="password" 
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        placeholder="Enter your password"
      />
    </div>
    
    <!-- Strength Indicator -->
    <div v-if="passwordStrength" class="mb-4">
      <div class="h-2 rounded" :class="strengthColor"></div>
      <div class="text-sm mt-1">
        Strength: {{ passwordStrength.feedback }}
        <span class="text-xs text-gray-500 ml-2">
          Estimated crack time: {{ passwordStrength.timeToCrack }}
        </span>
      </div>
    </div>
    
    <!-- Password Generation -->
    <button 
      @click="generateStrongPassword"
      class="w-full mb-4 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
    >
      Generate Strong Password
    </button>
    
    <!-- Store Password -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700">
        Store Password Key
      </label>
      <input 
        v-model="storedPasswordKey" 
        type="text" 
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        placeholder="Enter a key to store password"
      />
      <button 
        @click="storeCurrentPassword"
        class="mt-2 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
      >
        Store Password
      </button>
    </div>
    
    <!-- Retrieve Password -->
    <div>
      <label class="block text-sm font-medium text-gray-700">
        Retrieve Password Key
      </label>
      <input 
        v-model="retrievalKey" 
        type="text" 
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        placeholder="Enter key to retrieve password"
      />
      <button 
        @click="retrieveStoredPassword"
        class="mt-2 w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600"
      >
        Retrieve Password
      </button>
    </div>
  </div>
</template>