package Server;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class HTMLBuilder {
    private static final String filePath = "/Users/anniedang/Documents/GitHub/adang-lab5/src/main/HTML/";
    private static String readFile(String fileName) throws IOException {
        BufferedReader newFile = new BufferedReader(new FileReader(fileName));
        String content = "";
        String line = "";

        while ((line = newFile.readLine()) != null) {
            content += line;
        }
        return content;
    }

    private static String startTextString(String responsePayload) {
        int indexOne = responsePayload.indexOf("<body>") + "<body>".length();
        int indexTwo = responsePayload.indexOf("<form");

        return responsePayload.substring(0, indexOne) +
                "Welcome to the Number Guess Game.<br>Guess a number between 1 and 100." +
                responsePayload.substring(indexTwo);
    }

    private static String guessAgainString(String responsePayload) {
        int indexOne = responsePayload.indexOf("<body>") + "<body>".length();
        int indexTwo = responsePayload.indexOf("<form");

        return responsePayload.substring(0, indexOne) +
                "Nope, guess a number between $lowerBound$ and $upperBound$<br>You have made $numOfGuess$ guess<br>" +
                responsePayload.substring(indexTwo);
    }

    private static String wrongGuessString(String responsePayload) {
        int indexOne = responsePayload.indexOf("<body>") + "<body>".length();
        int indexTwo = responsePayload.indexOf("<form");

        return responsePayload.substring(0, indexOne) +
                "Only numbers between $lowerBound$ and $upperBound$, try again!<br><br>" +
                responsePayload.substring(indexTwo);
    }

    private static String lowerUpperBoundString(String responsePayload, int lower, int upper) {
        responsePayload = responsePayload.replace("$lowerBound$", String.valueOf(lower));
        responsePayload = responsePayload.replace("$upperBound$", String.valueOf(upper));
        return responsePayload;
    }

    public static String numOfGuessString(String responsePayload, int numOfGuess) {
        return responsePayload.replace("$numOfGuess$", String.valueOf(numOfGuess));
    }

    private static String finishedString(String responsePayload) {
        int indexOne = responsePayload.indexOf("<body>") + "<body>".length();
        int indexTwo = responsePayload.indexOf("<br>");

        return responsePayload.substring(0, indexOne) +
                "You made it!!!You have made $numOfGuess$ guesses<br><a href=" +
                responsePayload.substring(indexTwo);
    }

    public static String getStartPage() throws IOException {
        return startTextString(readFile(filePath + "startPage.html"));
    }

    public static String getFinishedPage(int numOfGuess) throws IOException {
        String page = finishedString(readFile(filePath + "finishedPage.html"));
        page = numOfGuessString(page, numOfGuess);
        return page;
    }

    public static String getNewGuessPage(int numOfGuess, int lowerBound, int upperBound) throws IOException {
        String page = guessAgainString(readFile(filePath + "startPage.html"));
        page = lowerUpperBoundString(page, lowerBound, upperBound);
        page = numOfGuessString(page, numOfGuess);
        return page;
    }

    public static String getBadGuessPage(int lowerBound, int upperBound) throws IOException {
        String page = wrongGuessString(readFile(filePath + "startPage.html"));
        page = lowerUpperBoundString(page, lowerBound, upperBound);
        return page;
    }
}