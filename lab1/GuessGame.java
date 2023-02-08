package Game;

import java.util.concurrent.ThreadLocalRandom;

public class GuessGame {
    private final int MIN = 1;
    private final int MAX = 100;
    private int rightNum;
    private int counter;
    private int upperBound;
    private int lowerBound;

    public GuessGame() {
        rightNum = ThreadLocalRandom.current().nextInt(MIN, MAX + 1); // randomise a nr that the player has to guess
        lowerBound = MIN;
        upperBound = MAX;
        counter = 0;
    }

    public boolean guess(int guessedNum) {
        if (!(guessedNum - 1 > upperBound || guessedNum + 1 < lowerBound)) {
            counter = counter + 1;
            if (guessedNum == rightNum) {
                return true;
            }
            if (guessedNum < rightNum) {
                lowerBound = guessedNum;
            } else {
                upperBound = guessedNum;
            }
        }
        return false;
    }

    public int getLowerBound() {
        return lowerBound;
    }

    public int getUpperBound() {
        return upperBound;
    }

    public int getCounter() {
        return counter;
    }

    public boolean invalidGuess(int userguess) {
        if (userguess > MAX || userguess < MIN) {
            return true;
        }
        return false;
    }
}
