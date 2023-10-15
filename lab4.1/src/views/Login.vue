<template>
  <div class="row">
    <div class="col"></div>
    <form class="col" @submit.prevent="authenticate()">
      <h4 class="title-1 text-center font-italic">Please log in</h4>
      <div class="form-group">
        <label for="username">Username</label>
        <input
          id="username"
          v-model="username"
          type="text"
          class="form-control"
          placeholder="enter username"
          required
        />
      </div>
      <p />
      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="form-control"
          placeholder="enter password"
          required
        />
      </div>
      <div v-if="failedLogin" class="alert alert-danger">{{ msg }}</div>
      <button type="submit" class="btn btn-primary mt-4">Log In</button>
    </form>
    <div class="col"></div>
  </div>
</template>

<script>
import { mapMutations, mapGetters } from "vuex";

export default {
  name: "LoginView",
  data: () => ({
    username: "",
    password: "",
    failedLogin: false,
    msg: "Incorrect password",
  }),
  computed: {
    ...mapGetters(["isAuthenticated"]),
  },
  methods: {
    ...mapMutations(["setAuthenticated", "setUsername"]),
    authenticate() {
      const { push } = this.$router;

      if (this.password === "1234") {
        this.setAuthenticated(true);
        this.setUsername(this.username); // set username in the store
        this.failedLogin = false;
        push({ path: "/admin" });
      } else {
        this.failedLogin = true;
      }
    },
  },
};
</script>
