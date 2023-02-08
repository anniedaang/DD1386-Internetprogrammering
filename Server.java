package Server;

import java.io.*;
import java.net.*;
import java.util.HashMap;

import javax.swing.text.html.HTML;

import Game.GuessGame;

public class Server {

    private static final int port = 8989;

    static HashMap<String, GuessGame> cookieMap = new HashMap<>(); // hashmap to track games with cookie as key
    static HashMap<String, InetAddress> ipMap = new HashMap<>(); // hashmap to track IP adress with cookie as key
    static BufferedReader socketIn;
    static PrintStream socketOut;

    public static void main(String[] args) throws IOException {
        GuessGame guessGame = new GuessGame();
        ResponseConstructor responseCons = new ResponseConstructor();
        int[] limits = new int[2];
        limits[0] = 0;
        limits[1] = 100;
        String cookie = "";

        try (ServerSocket serverSocket = new ServerSocket(port)) {

            System.out.println("Listening on port: " + port);

            while (true) {

                try (Socket socket = serverSocket.accept(); // Open socket
                        // open the BufferedReader for input
                        BufferedReader socketIn = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                        // open the PrintStream for output
                        PrintStream socketOut = new PrintStream(socket.getOutputStream())) {
                    // SKRIV INNANFÖR HÄR

                    // RESPONSE & REQUEST
                    // read the entire cache
                    StringBuilder cache = new StringBuilder();
                    String line = socketIn.readLine();
                    cache.append(line);
                    if (line != null) {
                        while (!line.equals("")) {
                            cache.append(line + "\n");
                            line = socketIn.readLine();
                        }
                    }

                    System.out.println("<<< " + cache.toString()); // log

                    // check if cache starts with GET or POST

                    // process the GET request
                    if (cache.toString().startsWith("GET")) {
                        System.out.println("\nGot GET request\n");

                        // 1. Parse the header to get the user's guess
                        // 2. Check if there is a current game linked to a cookie, otherwise start new
                        // GuessGame

                        // fetch coockie from cache
                        cookie = Cookie.parseCookie(String.valueOf(cache));
                        String[] headers = cache.toString().split("\n"); // split the whole cache into headers
                        String header = headers[0]; // store the first line in headers in header
                        String response;

                        // if the cookie exists in the cookieMap, there's an active game
                        if (cookieMap.containsKey(cookie)) {
                            // fetch the current game with cookie as key
                            guessGame = cookieMap.get(cookie);

                            // if the cache contains /notValid, the guess was out of bounds
                            if (header.contains("/notValid")) {
                                String htmlString = HTMLBuilder.getBadGuessPage(guessGame.getLowerBound(),
                                        guessGame.getUpperBound());
                                // construct response
                                response = responseCons.constructResponse(htmlString, cookie);
                            }
                            // if the cache contains /done?, the guess was the right number
                            else if (header.contains("/done?")) {
                                // build the output html for the page
                                String htmlString = HTMLBuilder.getFinishedPage(guessGame.getCounter());
                                // construct response
                                response = responseCons.constructResponse(htmlString, cookie);
                                // game is finished, remove cookie
                                cookieMap.remove(cookie);
                                cookie = Cookie.deleteCookie();

                            } else { // else if it's a valid guess but incorrect
                                String htmlString = HTMLBuilder.getNewGuessPage(guessGame.getCounter(),
                                        guessGame.getLowerBound(), guessGame.getUpperBound());
                                // construct response
                                response = responseCons.constructResponse(htmlString, cookie);
                            }
                        } else { // the cookie does not exist in the cookieMap, --> start new guessGame
                            // save the cookie from cache
                            cookie = Cookie.parseCookie(String.valueOf(cache));
                            // start a new game and put the new game and corresponding cookie in cookieMap
                            cookieMap.put(cookie, new GuessGame());
                            // get IP
                            InetAddress ipAddress = socket.getLocalAddress();
                            // put IP and corresponding cookie in ipMap
                            ipMap.put(cookie, ipAddress);
                            // build the output html for start page
                            String htmlString = HTMLBuilder.getStartPage();
                            // construct response
                            response = responseCons.constructResponse(htmlString, cookie);
                        }
                        // shut down socket
                        socketOut.print(response);
                        socket.shutdownOutput();
                    }
                    // process the POST request
                    else if (cache.toString().startsWith("POST")) {
                        System.out.println("\n Got a POST-request\n");

                        // parse cookie to retrieve guessgame from hashmap
                        // check if there's current game connected with cookie, otherwise start a new
                        // guessgame

                        // collect cookie from cache and parse it
                        cookie = Cookie.parseCookie(String.valueOf(cache));
                        // get user's IP
                        System.out.println("HERE IS THE COOKIE" + cookie);

                        InetAddress userIP = socket.getInetAddress();
                        System.out.println("User IP = " + userIP);

                        // get the cookie IP address
                        InetAddress cookieIP = ipMap.get(cookie);
                        System.out.println("Cookie IP = " + cookieIP);

                        // if addresses are equal == no cookie theft
                        if (userIP.equals(cookieIP)) {

                            // if the cookie is in the cookieMap, there's an active GuessGame
                            // if the cookie is NOT in the cookieMap, create a new GuessGame
                            if (cookieMap.containsKey(cookie)) {
                                // collect the current game
                                guessGame = cookieMap.get(cookie);
                            } else {
                                // create new game
                                guessGame = new GuessGame();
                                // add cookie and game to cookieMap
                                cookieMap.put(cookie, guessGame);
                                // add cookie and IP adress in ipMap
                                ipMap.put(cookie, socket.getLocalAddress());
                            }

                            // parse the guess from cache
                            try {
                                String userGuess = guessParser(socketIn, cache);
                                String response = null;

                                // if the userguess is out of bounds or invalid
                                if (guessGame.invalidGuess(Integer.parseInt(userGuess))) {
                                    // get limits, same as last round
                                    limits[0] = guessGame.getLowerBound();
                                    limits[1] = guessGame.getUpperBound();
                                    // construct not Valid Response
                                    response = responseCons.constructPostInvalid(cookie, limits);
                                }
                                // if the userguess is correct
                                else if (guessGame.guess(Integer.parseInt(userGuess))) {
                                    // build a correct Post-response
                                    System.out.println("THE GUESS WAS CORRECT");
                                    response = responseCons.constructEndResponse(cookie, guessGame.getCounter());
                                } else { // the userguess is valid but not correct
                                    // update the limits
                                    limits[0] = guessGame.getLowerBound();
                                    limits[1] = guessGame.getUpperBound();
                                    // construct Valid Response
                                    response = responseCons.constructPostValid(cookie, userGuess, limits);
                                }

                                // shut down socket
                                socketOut.print(response);
                                socket.shutdownOutput();

                            } catch (NumberFormatException e) {
                                // if the userGuess is invalid, send a 400 Bad Request
                                System.out.println("Invalid userGuess");
                                socket.shutdownOutput();
                            }

                        } else { // if the IPs are different == coockie theft
                            System.out.println("Cookie hijacking attempt intercepted from ip: " + userIP);
                            String response = "HTTP/1.1 401 Unauthorized";
                            socketOut.print(response);
                            socket.shutdownInput();
                        }
                    } else { // if it's not a GET or POST --> error
                        System.out.println("Not GET or POST --> ERROR");
                        socket.shutdownInput();
                    }

                    System.out.println(" >>> " + "HTTP RESPONSE"); // log
                    System.out.println("-----------------------");
                    socketOut.print("HTTP RESPONSE"); // write
                    socketOut.flush(); // flush
                    // socketOut.close(); // close

                } catch (IOException e) {
                    System.err.println(e.getMessage());
                }

            }
        } catch (IOException e) {
            System.err.println(e.getMessage());
            System.err.println("Could not listen on port: " + port);
            System.exit(1);
        }
    }

    public static String guessParser(BufferedReader socketIn, StringBuilder info) throws IOException {
        // save the data-info into a string
        String cache = info.toString();
        // split the cache string with new lines
        String[] cacheArray = cache.split("\n");
        char[] cbuf = new char[0];

        // find the line that contains the guess-length
        for (String ln : cacheArray) {
            if (ln.startsWith("Content-Length: ")) {
                String[] ans = ln.split(" ");
                int ansLength = Integer.parseInt(ans[1]);
                // create a new charArray with the length of ansLength
                cbuf = new char[ansLength];
                // read input from content index 0 ansLength and save it in the charArray
                socketIn.read(cbuf, 0, ansLength);
            }
        }
        String guessString = String.valueOf(cbuf);
        System.out.println(guessString);
        // String[] guessStringArray;
        // parse guessString
        try {
            guessString = guessString.split("=")[1];
            guessString = guessString.split("&")[0];
            int i = Integer.parseInt(guessString);
            return String.valueOf(i);
        } catch (ArrayIndexOutOfBoundsException e) {
            return "-1";
        }

        // System.out.println(guessStringArray[1]);
        // guessStringArray = guessStringArray[1].split("&");

        // error handling
        /*
         * try {
         * int i = Integer.parseInt(guessStringArray[0]);
         * return String.valueOf(i);
         * } catch (NumberFormatException e) {
         * return "-1";
         * }
         */
    }
}