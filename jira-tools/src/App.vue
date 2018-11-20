<template>
  <div id="app">
    <header class="navbar navbar-expand-lg navbar-light bg-light">
      <span class="navbar-brand">Sprint Report Tool</span>
    </header>
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style lang="scss">

  @import "./assets/scss/app.scss";

  body {
    margin: 0;
  }
 // ...
</style>
