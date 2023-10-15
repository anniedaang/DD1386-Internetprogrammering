<template>
  <div class="row">
    <div class="col"></div>
    <form class="col" @submit.prevent="authenticate()">
      <h4 class="title-1 text-center font-italic">Please log in</h4>
      <div class="form-group">
        <label for="username">Username:</label>
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
        <label for="password">Password:</label>
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
export default {
  name: "LoginView",
  emits: ["authenticated"],
  data: () => ({
    username: "",
    password: "",
    failedLogin: false,
    msg: "Incorrect password or username",
  }),
  methods: {
    authenticate() {
      const { commit } = this.$store;
      const { push } = this.$router;

      fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
        }),
      })
        .then((response) => response.json())
        .then(({ authenticated }) => {
          commit("setAuthenticated", authenticated);
          if (authenticated === true) {
            this.$emit("authenticated", true);
            push({ path: "/admin" });
          } else {
            this.failedLogin = true;
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },
  },
};
</script>
