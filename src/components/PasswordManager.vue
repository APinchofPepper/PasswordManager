<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { PasswordManager } from '@/utils/passwordManager'
import type { StoredCredential } from '@/models/User'
import { UserManager } from '@/models/User'
import { useToast } from 'vue-toast-notification'
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Search,
  Plus,
  Key,
  User as UserIcon,
  AlertCircle,
  Check,
  LogOut,
  ChevronRight,
} from 'lucide-vue-next'

const toast = useToast()

// Authentication state
const isLoggedIn = ref(false)
const currentUser = ref<any>(null)

// Registration/Login form
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const isRegistering = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Toggle between login and registration
const toggleAuthMode = () => {
  isRegistering.value = !isRegistering.value
  username.value = ''
  password.value = ''
  confirmPassword.value = ''
}

// Authentication methods
const handleAuth = () => {
  if (isRegistering.value) {
    // Registration logic
    if (password.value !== confirmPassword.value) {
      toast.error('Passwords do not match')
      return
    }

    const registrationError = UserManager.registerUser(username.value, password.value)
    if (registrationError === null) {
      toast.success('Registration successful. Please log in.')
      isRegistering.value = false
    } else {
      toast.error(registrationError)
    }
  } else {
    // Login logic
    const user = UserManager.loginUser(username.value, password.value)
    if (user) {
      isLoggedIn.value = true
      currentUser.value = user
      loadStoredCredentials()
      toast.success('Login successful')
    } else {
      toast.error('Invalid username or password')
    }
  }
}

// Load stored credentials
const loadStoredCredentials = () => {
  allStoredCredentials.value = UserManager.getAllCredentials()
}

// Password generation
const generateStrongPassword = () => {
  appPassword.value = PasswordManager.generatePassword()
  toast.success('Strong password generated!')
}

// Generate password for editing
const generateEditPassword = () => {
  editPassword.value = PasswordManager.generatePassword()
  toast.success('Strong password generated!')
}

// Store application credential
const storeApplicationCredential = () => {
  try {
    if (!appName.value || !appUsername.value || !appPassword.value) {
      toast.error('Please fill in all fields')
      return
    }

    const success = UserManager.storeApplicationCredential(
      appName.value.trim(),
      appUsername.value.trim(),
      appPassword.value
    )

    if (success) {
      toast.success('Credential stored successfully')
      loadStoredCredentials()
      // Clear input fields
      appName.value = ''
      appUsername.value = ''
      appPassword.value = ''
    } else {
      toast.error('Failed to store credential')
    }
  } catch (error) {
    console.error('Error storing credential:', error)
    toast.error('An error occurred while storing the credential')
  }
}

// View credential details
const viewCredentialDetails = (credential: StoredCredential) => {
  selectedCredential.value = UserManager.getCredentialById(credential.id)
  isEditing.value = false
}

// Start editing credential
const startEditing = (credential: StoredCredential) => {
  editAppName.value = credential.appName
  editUsername.value = credential.username
  editPassword.value = credential.password
  isEditing.value = true
}

// Save edited credential
const saveEditedCredential = () => {
  try {
    if (!selectedCredential.value) return

    const updates: any = {}
    if (editAppName.value !== selectedCredential.value.appName) {
      updates.appName = editAppName.value
    }
    if (editUsername.value !== selectedCredential.value.username) {
      updates.username = editUsername.value
    }
    if (editPassword.value !== selectedCredential.value.password) {
      updates.password = editPassword.value
    }

    const success = UserManager.updateCredential(selectedCredential.value.id, updates)

    if (success) {
      toast.success('Credential updated successfully')
      loadStoredCredentials()
      isEditing.value = false
      selectedCredential.value = null
    } else {
      toast.error('Failed to update credential')
    }
  } catch (error) {
    console.error('Error updating credential:', error)
    toast.error('An error occurred while updating the credential')
  }
}

// Cancel editing
const cancelEditing = () => {
  isEditing.value = false
}

// Delete credential
const deleteCredential = async (credential: StoredCredential) => {
  if (confirm('Are you sure you want to delete this credential?')) {
    try {
      const success = UserManager.deleteCredential(credential.id)
      if (success) {
        toast.success('Credential deleted successfully')
        loadStoredCredentials()
        selectedCredential.value = null
      } else {
        toast.error('Failed to delete credential')
      }
    } catch (error) {
      console.error('Error deleting credential:', error)
      toast.error('An error occurred while deleting the credential')
    }
  }
}

// Copy password to clipboard
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Password copied to clipboard')
  } catch (err) {
    toast.error('Failed to copy password')
  }
}

// Logout
const logout = () => {
  UserManager.logout()
  isLoggedIn.value = false
  currentUser.value = null
  allStoredCredentials.value = []
  toast.success('Logged out successfully')
}

// Password strength
const passwordStrength = computed(() => {
  if (!password.value) return { score: 0, feedback: '' }
  return PasswordManager.analyzePasswordStrength(password.value)
})

const strengthColor = computed(() => {
  const score = passwordStrength.value.score
  return (
    {
      0: 'bg-red-500',
      1: 'bg-orange-500',
      2: 'bg-yellow-500',
      3: 'bg-green-500',
      4: 'bg-green-600',
    }[score] || 'bg-gray-200'
  )
})

// Credential management
const appName = ref('')
const appUsername = ref('')
const appPassword = ref('')
const showAppPassword = ref(false)
const searchQuery = ref('')
const allStoredCredentials = ref<StoredCredential[]>([])
const selectedCredential = ref<StoredCredential | null>(null)

// Edit mode state
const isEditing = ref(false)
const editAppName = ref('')
const editUsername = ref('')
const editPassword = ref('')
const showEditPassword = ref(false)

// Sort options
const sortBy = ref<'name' | 'username'>('name')
const sortDirection = ref<'asc' | 'desc'>('asc')

// Computed property for filtered and sorted credentials
const filteredCredentials = computed(() => {
  let credentials = allStoredCredentials.value || []

  // Filter
  if (searchQuery.value) {
    credentials = credentials.filter(
      (cred) =>
        cred.appName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        cred.username.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Sort
  return credentials.sort((a, b) => {
    const aValue = sortBy.value === 'name' ? a.appName : a.username
    const bValue = sortBy.value === 'name' ? b.appName : b.username
    return sortDirection.value === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue)
  })
})

const toggleSort = (field: 'name' | 'username') => {
  if (sortBy.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortDirection.value = 'asc'
  }
}

const togglePasswordVisibility = (field: 'main' | 'confirm' | 'app' | 'edit') => {
  switch (field) {
    case 'main':
      showPassword.value = !showPassword.value
      break
    case 'confirm':
      showConfirmPassword.value = !showConfirmPassword.value
      break
    case 'app':
      showAppPassword.value = !showAppPassword.value
      break
    case 'edit':
      showEditPassword.value = !showEditPassword.value
      break
  }
}

// Include all your existing methods here...
</script>

<template>
  <div class="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
    <!-- Authentication Section -->
    <div v-if="!isLoggedIn" class="max-w-md mx-auto p-8">
      <div class="flex justify-center mb-6">
        <Lock class="w-12 h-12 text-blue-500" />
      </div>

      <h2 class="text-2xl font-bold mb-6 text-center text-gray-900">
        {{ isRegistering ? 'Create Your Account' : 'Welcome Back' }}
      </h2>

      <form @submit.prevent="handleAuth" class="space-y-6">
        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700">Username</label>
          <div class="relative">
            <UserIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              v-model="username"
              type="text"
              required
              class="pl-10 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your username"
            />
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-sm font-medium text-gray-700">Password</label>
          <div class="relative">
            <Key class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="pl-10 pr-10 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
            <button
              type="button"
              @click="togglePasswordVisibility('main')"
              class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <Eye v-if="!showPassword" class="h-5 w-5" />
              <EyeOff v-else class="h-5 w-5" />
            </button>
          </div>

          <!-- Password Strength Indicator -->
          <div v-if="isRegistering && password" class="mt-2">
            <div class="h-2 w-full bg-gray-200 rounded-full">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="strengthColor"
                :style="{ width: `${(passwordStrength.score + 1) * 20}%` }"
              ></div>
            </div>
            <p class="mt-1 text-sm text-gray-600">
              Password strength: {{ passwordStrength.feedback }}
            </p>
          </div>
        </div>

        <div v-if="isRegistering" class="space-y-1">
          <label class="text-sm font-medium text-gray-700">Confirm Password</label>
          <div class="relative">
            <Key class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              class="pl-10 pr-10 w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              @click="togglePasswordVisibility('confirm')"
              class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <Eye v-if="!showConfirmPassword" class="h-5 w-5" />
              <EyeOff v-else class="h-5 w-5" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="w-full flex items-center justify-center gap-2 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Lock v-if="!isRegistering" class="h-5 w-5" />
          <Check v-else class="h-5 w-5" />
          {{ isRegistering ? 'Create Account' : 'Sign In' }}
        </button>
      </form>

      <p class="mt-6 text-center text-gray-600">
        {{ isRegistering ? 'Already have an account?' : 'Need an account?' }}
        <a
          href="#"
          @click.prevent="toggleAuthMode"
          class="text-blue-500 hover:text-blue-600 font-medium"
        >
          {{ isRegistering ? 'Sign In' : 'Create Account' }}
        </a>
      </p>
    </div>

    <!-- Credential Management Section -->
    <div v-else class="p-6">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Password Manager</h2>
        <button
          @click="logout"
          class="inline-flex items-center justify-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors min-w-[140px]"
        >
          <LogOut class="h-5 w-5" />
          Sign Out
        </button>
      </div>

      <!-- Add New Credential -->
      <div class="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
        <div class="flex items-center gap-2 mb-4">
          <Plus class="h-5 w-5 text-blue-500" />
          <h3 class="text-lg font-semibold">Add New Credential</h3>
        </div>

        <div class="grid gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
            <input
              v-model="appName"
              type="text"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter application name"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              v-model="appUsername"
              type="text"
              class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div class="flex gap-2">
              <div class="relative flex-1">
                <input
                  v-model="appPassword"
                  :type="showAppPassword ? 'text' : 'password'"
                  class="w-full p-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  @click="togglePasswordVisibility('app')"
                  class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <Eye v-if="!showAppPassword" class="h-5 w-5" />
                  <EyeOff v-else class="h-5 w-5" />
                </button>
              </div>
              <button
                @click="generateStrongPassword"
                class="flex items-center gap-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Key class="h-5 w-5" />
                Generate
              </button>
            </div>
          </div>

          <button
            @click="storeApplicationCredential"
            class="w-full flex items-center justify-center gap-2 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus class="h-5 w-5" />
            Store Credential
          </button>
        </div>
      </div>

      <!-- Search and Credentials List -->
      <div class="bg-white rounded-xl border border-gray-200">
        <div class="p-4 border-b border-gray-200">
          <div class="relative">
            <Search class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              class="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search credentials..."
            />
          </div>
        </div>

        <div class="border-b border-gray-200">
          <div class="flex justify-between items-center px-4 py-2">
            <div class="flex items-center gap-4">
              <button
                @click="toggleSort('name')"
                class="text-sm font-medium text-gray-700 hover:text-blue-500"
                :class="{ 'text-blue-500': sortBy === 'name' }"
              >
                Application
                <ChevronRight
                  class="inline-block h-4 w-4 transition-transform"
                  :class="{
                    'rotate-90': sortBy === 'username' && sortDirection === 'asc',
                    '-rotate-90': sortBy === 'username' && sortDirection === 'desc',
                  }"
                />
              </button>
            </div>
            <span class="text-sm text-gray-500">{{ filteredCredentials.length }} items</span>
          </div>
        </div>

        <div class="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          <div
            v-for="credential in filteredCredentials"
            :key="credential.id"
            @click="viewCredentialDetails(credential)"
            class="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between group"
          >
            <div>
              <h4 class="font-medium text-gray-900">{{ credential.appName }}</h4>
              <p class="text-sm text-gray-500">{{ credential.username }}</p>
            </div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="text-blue-500 hover:text-blue-600">View Details</button>
            </div>
          </div>

          <div v-if="filteredCredentials.length === 0" class="p-8 text-center text-gray-500">
            No credentials found
          </div>
        </div>
      </div>

      <!-- Credential Details Modal -->
      <div
        v-if="selectedCredential && !isEditing"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-xl max-w-md w-full p-6" @click.stop>
          <h2 class="text-xl font-bold mb-6">Credential Details</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Application</label>
              <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                {{ selectedCredential.appName }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                {{ selectedCredential.username }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div class="flex gap-2">
                <input
                  :value="selectedCredential.password"
                  :type="showPassword ? 'text' : 'password'"
                  readonly
                  class="flex-1 p-2.5 bg-gray-50 rounded-lg border border-gray-200"
                />
                <button
                  @click="copyToClipboard(selectedCredential.password)"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                >
                  <Copy class="h-4 w-4" />
                  Copy
                </button>
              </div>
            </div>
          </div>

          <div class="mt-8 space-y-2">
            <button
              @click="startEditing(selectedCredential)"
              class="w-full flex items-center justify-center gap-2 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              @click="deleteCredential(selectedCredential)"
              class="w-full flex items-center justify-center gap-2 bg-red-500 text-white p-3 rounded-lg hover:bg-red-600"
            >
              Delete
            </button>
            <button
              @click="selectedCredential = null"
              class="w-full p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Credential Modal -->
      <div
        v-if="isEditing && selectedCredential"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div class="bg-white rounded-xl max-w-md w-full p-6" @click.stop>
          <h2 class="text-xl font-bold mb-6">Edit Credential</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Application Name</label>
              <input
                v-model="editAppName"
                type="text"
                class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                v-model="editUsername"
                type="text"
                class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <input
                    v-model="editPassword"
                    :type="showEditPassword ? 'text' : 'password'"
                    class="w-full p-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    @click="togglePasswordVisibility('edit')"
                    class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <Eye v-if="!showEditPassword" class="h-5 w-5" />
                    <EyeOff v-else class="h-5 w-5" />
                  </button>
                </div>
                <button
                  @click="generateEditPassword"
                  class="px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                >
                  <Key class="h-5 w-5" />
                  Generate
                </button>
              </div>
            </div>
          </div>

          <div class="mt-8 space-y-2">
            <button
              @click="saveEditedCredential"
              class="w-full flex items-center justify-center gap-2 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600"
            >
              Save Changes
            </button>
            <button
              @click="cancelEditing"
              class="w-full p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
