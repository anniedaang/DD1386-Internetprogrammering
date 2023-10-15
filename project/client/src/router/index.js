import { createRouter, createWebHistory } from "vue-router";
import store from "../store";
import LoginView from "../views/Login.vue";
import ShowDocuments from "../views/ShowDocuments.vue";
import AdminView from "../views/Admin.vue";
import RegisterView from "../views/Register.vue";
import Booking from "../views/Booking1.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/admin",
    component: AdminView,
  },
  {
    path: "/register",
    component: RegisterView,
  },
  {
    path: "/booking/:id",
    name: "Booking",
    component: Booking,
  },
  {
    path: "/login",
    component: LoginView,
  },
  {
    path: "/showdocuments",
    component: ShowDocuments,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Setup authentication guard.
router.beforeEach((to, from, next) => {
  if (
    store.state.authenticated ||
    to.path === "/login" ||
    to.path === "/showdocuments" ||
    to.matched.length > 0
  ) {
    next();
  } else {
    console.info(
      "Unauthenticated user or invalid path. Redirecting to login page."
    );
    next(false);
  }
});

export default router;
