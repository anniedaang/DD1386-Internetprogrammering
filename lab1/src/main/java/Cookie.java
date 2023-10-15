package Server;

import java.util.Random;
import java.lang.Long;

public class Cookie {
    private static final Random r = new Random();

    public static String parseCookie(String cache) {
        // fetch the cookie from cache
        String cookie = "";

        // try to get cookie if it exists
        if (cache.contains("site-cookie")) {
            String[] info = cache.split("\n");
            for (String ln : info) {
                if (ln.contains("site-cookie=")) {
                    cookie = ln.substring(ln.indexOf("site-cookie=") + "site-cookie=".length());
                }
            }
        } else {
            // if the cookie doesn't exist, create it
            cookie = generateCookie();
        }
        return cookie;
    }

    public static String generateCookie() {
        String cookie = "site-cookie=";
        long val = r.nextLong();
        cookie += Long.toHexString(val);
        return cookie;
    }

    public static String deleteCookie() {
        return "site-cookie=deleted";
    }
}