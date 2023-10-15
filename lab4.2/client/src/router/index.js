import { createRouter, createWebHistory } from "vue-router";
import store from "../store";
import LoginView from "../views/Login.vue";
import ShowTimeSlots from "../views/ShowTimeSlots.vue";
import AdminView from "../views/Admin.vue";
import BookingView from "../views/Booking.vue";

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
    path: "/booking",
    component: BookingView,
    props: (route) => ({ timeslot: route.params.timeslot }),
  },
  {
    path: "/login",
    component: LoginView,
  },
  {
    path: "/showtimeslots",
    component: ShowTimeSlots,
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
    to.path === "/showtimeslots" ||
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
