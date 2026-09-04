<template>
  <nav class="navbar navbar-expand navbar-light bg-light">
    <div class="container">
      <ul class="navbar-nav">
        <li class="nav-item">
          <router-link to="/" class="nav-link" active-class="active">Home</router-link>
        </li>
        <li class="nav-item">
          <router-link to="/about" class="nav-link" active-class="active">About</router-link>
        </li>
      </ul>
    </div>
  </nav>

  <router-view />
</template>
