package Server;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ResponseConstructor {
    private static final DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyy/MM/dd HH:mm:ss");

    Response() {}

    // GET RESPONSE
    public String constructResponse(String payload, String cookie) {
        String response = "HTTP/1.1 200 OK\n" +
                "Date: ${time-stamp}\n" +
                "Set-Cookie: ${cookie}\n" +
                "Content-Length: ${content-length}\n" +
                "Connection: close\n" +
                "Content-Type: text/html\n" +
                "\n" +
                "${payload}\n";

        response = response.replace("${cookie}", cookie)
                .replace("${time-stamp}", dtf.format(LocalDateTime.now()))
                .replace("${content-length}", String.valueOf(payload.length()))
                .replace("${payload}", payload);
        return response;
    }

    // POST REDIRECT RESPONSE - valid guess
    public String constructPostValid(String cookie, String guess, int[] boundaries) {
        String response = "HTTP/1.1 303 See Other\n" +
                "Location: /guess=${guess}/lower=${lowerBound}/upper=${upperBound}//\n" +
                "Date: ${time-stamp}\n" +
                "Set-Cookie: ${cookie}\n" +
                "Connection: close\n" +
                "Content-Type: text/html\n" +
                "\n";

        response = response.replace("${guess}", guess).replace("${time-stamp}", dtf.format(LocalDateTime.now()))
                .replace("${lowerBound}", String.valueOf(boundaries[0]))
                .replace("${upperBound}", String.valueOf(boundaries[1]))
                .replace("${cookie}", cookie);

        return response;
    }

    // Invalid Guess
    public String constructPostInvalid(String cookie, int[] boundaries) {
        String response = "HTTP/1.1 303 See Other\n" +
                "Location: /notValid/lower=${lowerBound}/upper=${upperBound}//\n" +
                "Date: ${time-stamp}\n" +
                "Set-Cookie: ${cookie}\n" +
                "Connection: close\n" +
                "Content-Type: text/html\n" +
                "\n";

        response = response.replace("${lowerBound}", String.valueOf(boundaries[0]))
                .replace("${upperBound}", String.valueOf(boundaries[1]))
                .replace("${time-stamp}", dtf.format(LocalDateTime.now()))
                .replace("${cookie}", cookie);

        return response;
    }

    // Correct Guess
    public String constructEndResponse(String cookie, Integer numOfGuess) {
        String response = "HTTP/1.1 303 See Other\n" +
                "Location: /done?numbersofguesses=${number-of-guesses}\n" +
                "Date: ${time-stamp}\n" +
                "Set-Cookie: ${cookie}\n" +
                "Connection: close\n" +
                "Content-Type: text/html\n";

        response = response.replace("${time-stamp}", dtf.format(LocalDateTime.now()))
                .replace("${number-of-guesses}", numOfGuess.toString())
                .replace("${cookie}", cookie);
        return response;
    }

}
