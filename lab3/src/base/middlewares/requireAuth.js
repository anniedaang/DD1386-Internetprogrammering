import sessionManager from "../sessionManager.js";

const requireAuth = (req, res, next) => {
  if (req.path === "/") {
    if (req.headers.cookie) {
      const cookie = req.headers.cookie.split("=")[1];

      if (sessionManager.usernameExists(cookie)) {
        const timestamp = Date.now();
        sessionManager.setClick(timestamp, cookie);
        setTimeout(() => {
          sessionManager.deleteAfterClick(timestamp, cookie);
        }, 10000); // 5 minutes
        next();
        return;
      }
    }
    res.redirect("/login");
  } else if (req.path === "/logout" || req.path === "/profile" || req.path === "/removeOtherUsers" || req.path === "/register") {
    next();

  } else {
    if (req.headers.cookie) {
      const cookie = req.headers.cookie.split("=")[1];

      if (sessionManager.usernameExists(cookie)) {
        res.redirect("/");
        return;
      }
    }
    res.redirect("/login");
  }
};

export default requireAuth;

// förslag: routing