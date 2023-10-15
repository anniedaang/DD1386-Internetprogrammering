<template>
  <div id="app">
    <header>
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
          <h1>Booking</h1>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div id="navbarNavDropdown" class="collapse navbar-collapse">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <!-- Admin button -->
              <li class="nav-item dropdown">
                <a
                  id="navbarDropdown"
                  class="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  >Admin</a
                >
                <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                  <li>
                    <router-link
                      v-if="authenticated"
                      class="dropdown-item"
                      :to="{ path: '/admin' }"
                      >{{ authenticated ? "Profile" : "Log In" }}</router-link
                    >
                  </li>
                  <li>
                    <a
                      v-if="authenticated"
                      class="dropdown-item"
                      href="#"
                      @click.prevent="authenticated && logout()"
                      >Log Out</a
                    >
                  </li>
                  <li>
                    <router-link
                      v-if="!authenticated"
                      class="dropdown-item"
                      :to="{ path: '/login' }"
                      >Log In</router-link
                    >
                  </li>
                </ul>
              </li>
              <!-- Time slot button -->
              <li class="nav-item">
                <router-link class="nav-link" to="/showtimeslots"
                  >Time Slot</router-link
                >
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  </div>
  <section class="container-fluid py-4">
    <router-view @log-in="signedIn = true" />
  </section>
</template>

<script>
// @ is an alias to /src
import "bootstrap";

export default {
  name: "App",
  components: {},
  data: () => ({
    username: "",
    state: 0,
    signedIn: false,
  }),
  computed: {
    authenticated() {
      return this.$store.getters.isAuthenticated;
    },
  },
  mounted() {
    const { commit, getters } = this.$store;
    const { push } = this.$router;

    if (getters.username !== "") {
      commit("setUsername", getters.username);
      commit("setAuthenticated", true);
    }

    commit("setAuthenticated", false);
    push(this.authenticated ? "/admin" : "/login");
  },
  methods: {
    redirect(target) {
      this.$router.push(target);
    },
    logout() {
      // Reset all data and state
      this.username = "";
      this.state = 0;
      this.signedIn = false;
      this.$store.commit("clearUsername");
      this.$store.commit("clearAuth");
      this.$router.push("/");
    },
  },
};
</script>

<style>
@import url("bootstrap/dist/css/bootstrap.css");

html,
body {
  /* https://designs.ai/colors */
  background-color: #9da29267;
}

h1 {
  color: #000;
  font-size: 30px;
  font-weight: 500;
  margin: 10px;
}

#header {
  font-family: "Times New Roman", Times, serif;
  background-color: #9ab6ac;
  border-bottom: 1px solid #b91414;
}
</style>
