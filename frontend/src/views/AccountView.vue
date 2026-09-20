<script setup>
import { ref, onMounted } from 'vue';
import { api } from '../lib/api';

const user = ref(null);
const checkingSession = ref(true);

const authMode = ref('login'); // 'login' | 'register'
const authEmail = ref('');
const authPassword = ref('');
const authError = ref('');
const authBusy = ref(false);

const link = ref(null);
const linkLoading = ref(false);
const prestoUsername = ref('');
const prestoPassword = ref('');
const linkError = ref('');
const linkBusy = ref(false);
const syncMessage = ref('');

const STATUS_LABELS = {
  active: 'Linked ✅',
  needs_reauth: 'Needs re-login ⚠️',
  disabled: 'Disabled',
};

onMounted(async () => {
  try {
    user.value = await api.me();
    await loadLink();
  } catch {
    user.value = null;
  } finally {
    checkingSession.value = false;
  }
});

async function loadLink() {
  linkLoading.value = true;
  try {
    link.value = await api.getPrestoLink();
  } catch (err) {
    linkError.value = err.message;
  } finally {
    linkLoading.value = false;
  }
}

async function submitAuth() {
  authError.value = '';
  authBusy.value = true;
  try {
    const fn = authMode.value === 'login' ? api.login : api.register;
    user.value = await fn(authEmail.value, authPassword.value);
    authPassword.value = '';
    await loadLink();
  } catch (err) {
    authError.value = err.message;
  } finally {
    authBusy.value = false;
  }
}

async function logout() {
  await api.logout().catch(() => {});
  user.value = null;
  link.value = null;
}

async function submitLink() {
  linkError.value = '';
  linkBusy.value = true;
  try {
    link.value = await api.linkPresto(prestoUsername.value, prestoPassword.value);
    prestoUsername.value = '';
    prestoPassword.value = '';
  } catch (err) {
    linkError.value = err.message;
  } finally {
    linkBusy.value = false;
  }
}

async function unlink() {
  if (!link.value) return;
  linkBusy.value = true;
  try {
    await api.unlinkPresto(link.value.id);
    link.value = null;
  } catch (err) {
    linkError.value = err.message;
  } finally {
    linkBusy.value = false;
  }
}

async function syncNow() {
  if (!link.value) return;
  syncMessage.value = '';
  linkBusy.value = true;
  try {
    link.value = await api.syncPresto(link.value.id);
    syncMessage.value = 'Sync complete.';
  } catch (err) {
    syncMessage.value = err.message;
  } finally {
    linkBusy.value = false;
  }
}
</script>

<template>
  <div class="account-page">
    <p v-if="checkingSession">Loading...</p>

    <section v-else-if="!user" class="auth-card">
      <div class="auth-toggle">
        <button :class="{ active: authMode === 'login' }" @click="authMode = 'login'">Log in</button>
        <button :class="{ active: authMode === 'register' }" @click="authMode = 'register'">Register</button>
      </div>
      <form @submit.prevent="submitAuth">
        <label>
          Email
          <input v-model="authEmail" type="email" required autocomplete="email" />
        </label>
        <label>
          Password
          <input v-model="authPassword" type="password" required autocomplete="current-password" minlength="8" />
        </label>
        <p v-if="authError" class="error">{{ authError }}</p>
        <button type="submit" :disabled="authBusy">
          {{ authMode === 'login' ? 'Log in' : 'Create account' }}
        </button>
      </form>
    </section>

    <section v-else class="account-card">
      <div class="account-header">
        <span>Signed in as {{ user.email }}</span>
        <button @click="logout">Log out</button>
      </div>

      <p v-if="linkLoading">Loading Presto link status...</p>

      <div v-else-if="link" class="presto-link">
        <h3>Presto Account</h3>
        <p>Status: <strong>{{ STATUS_LABELS[link.status] || link.status }}</strong></p>
        <p>Linked account: {{ link.prestoUsername }}</p>

        <div v-if="link.lastLocation" class="last-location">
          <p>Last known location: <strong>{{ link.lastLocation.name }}</strong></p>
          <p v-if="link.lastLocation.timestamp">As of: {{ link.lastLocation.timestamp }}</p>
        </div>
        <p v-else>No activity synced yet.</p>

        <div class="actions">
          <button @click="syncNow" :disabled="linkBusy">Check now</button>
          <button @click="unlink" :disabled="linkBusy" class="danger">Unlink account</button>
        </div>
        <p v-if="syncMessage">{{ syncMessage }}</p>
      </div>

      <form v-else @submit.prevent="submitLink" class="presto-link">
        <h3>Link your Presto Account</h3>
        <p class="disclaimer">
          We use your Presto login only to check your card's last activity, so we can show you
          where it was last used. You can unlink at any time, which permanently deletes the
          stored credential.
        </p>
        <label>
          Presto account email
          <input v-model="prestoUsername" type="email" required />
        </label>
        <label>
          Presto password
          <input v-model="prestoPassword" type="password" required />
        </label>
        <p v-if="linkError" class="error">{{ linkError }}</p>
        <button type="submit" :disabled="linkBusy">Link account</button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.account-page {
  max-width: 480px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.auth-card, .account-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
}
.auth-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.auth-toggle button {
  flex: 1;
  padding: 0.5rem;
}
.auth-toggle button.active {
  font-weight: bold;
  border-bottom: 2px solid #333;
}
form label {
  display: block;
  margin-bottom: 0.75rem;
}
form input {
  display: block;
  width: 100%;
  padding: 0.4rem;
  margin-top: 0.25rem;
}
.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.presto-link {
  margin-top: 1rem;
}
.disclaimer {
  font-size: 0.85rem;
  color: #555;
}
.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
.actions .danger {
  color: #b00020;
}
.error {
  color: #b00020;
}
</style>
