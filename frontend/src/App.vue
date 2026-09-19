<script setup>
</script>

<template>
  <nav class="top-nav">
    <RouterLink to="/">Dashboard</RouterLink>
    <RouterLink to="/account">My Account</RouterLink>
  </nav>
  <RouterView />
</template>

<style>
* {
  box-sizing: border-box;
}
html,
body,
#app {
  margin: 0;
  padding: 0 1%;
  min-height: 100%;
  background: white;
}
body {
  font-family: Arial, Helvetica, sans-serif;
}
.app {
  min-height: 100vh;
  background: white;
}
</style>

<style scoped>
.top-nav {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}
.top-nav a {
  text-decoration: none;
  color: #333;
}
.top-nav a.router-link-active {
  font-weight: bold;
  color: #000;
}
</style>
