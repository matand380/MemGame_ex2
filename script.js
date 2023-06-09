
$(document).ready(function () {
  var playerName;
  var cardPairs;
  var cards;
  var flippedCards = [];
  var matchedPairs = 0;
  var gameStarted = false;
  var elapsedTime = 0;
  var gameInterval;
  var gamePaused = false;

  $("#start-form").submit(function (e) {
    e.preventDefault();
    playerName = $("#player-name").val();
    cardPairs = parseInt($("#card-pairs").val());
    if (cardPairs > 30) {
      cardPairs = 30;
    }
    startGame();
  });

  /**
   * The startGame function hides the game form, displays the player's name and score,
   * generates a new set of cards for each game, renders those cards to the page,
   * and starts a timer.
   */
  function startGame() {
    startClock();
    $("#game-form").hide();
    $("#player-info").text("Player: " + playerName);
    $("#game-container").show();
    $("#pause-btn").show();
    $("#reset-btn").hide();
    $("#resume-btn").hide();
    generateCards();
    redrawGameBoard();
  }

  /**
   * The generateCards function creates an array of card objects.
   * Each card object has a symbol property, which is the path to the image file for that particular card.
   * The generateCards function also sets each cards' flipped and matched properties to false by default.
   * @return An array of card objects
   *
   */

  function generateCards() {
    cards = [];
    var dir = "resources/gameCards/";
    var fileExtension = ".jpeg";
    //load images from resources/gameCards directory into symbols array
    var symbols = [];
    var pairs = cardPairs % 2 === 0 ? cardPairs : cardPairs - 1;
    for (var j = 0; j <= pairs; j++) {
      symbols.push(dir + "img" + j + fileExtension);
    }

    for (var i = 0; i < cardPairs; i++) {
      var card1 = {symbol: symbols[i], flipped: false, matched: false};
      var card2 = {symbol: symbols[i], flipped: false, matched: false};
      cards.push(card1, card2);
    }
    shuffleCards();
  }

  /**
   * I took this shuffleCards function from Stack Overflow.
   */
  function shuffleCards() {
    for (var i = cards.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = cards[i];
      cards[i] = cards[j];
      cards[j] = temp;
    }
  }

  /**
   * The redrawGameBoard function is used to redraw the game board.
   * It empties the game-board div and then appends a new card for each item in the cards array.
   * Each card has an event listener attached that calls flipCard when clicked (click function in jQuery is similar to EventListener in JavaScript).
   * @return The game board with the cards in their proper places
   *
   */
  function redrawGameBoard() {
    var gameBoard = $("#game-board");
    gameBoard.empty();
    for (var i = 0; i < cards.length; i++) {
      var card = $("<div>").addClass("card show hidden").attr("data-index", i);
      gameBoard.append(card);
    }
    $(".card").click(function () {
      var index = $(this).data("index");
      flipCard(index);
    });
  }

  /**
   * The flipCard function is called when a card is clicked.
   * It flips the card over and checks if it matches another flipped card.
   * If it does, both cards are marked as matched and the game continues.
   * If not, both cards are flipped back after a delay of 1 second.
   * @param index Identify which card was clicked
   *
   */
  function flipCard(index) {
    var card = cards[index];

    if (!gameStarted || gamePaused) return;
    if (card.flipped || card.matched) return;

    card.flipped = true;
    flippedCards.push(index);
    updateCardDisplay(index);

    if (flippedCards.length === 2) {
      var indexCard2 = flippedCards.pop();
      var indexCard1 = flippedCards.pop();
      var card1 = cards[indexCard1];
      var card2 = cards[indexCard2];
      if (card1.symbol === card2.symbol) {
        cardsMatch(card1, card2);
      } else {
        gameStarted = false; // Disable clicking during the delay
        setTimeout(function () {
          card1.flipped = false;
          card2.flipped = false;
          updateCardDisplay(indexCard1);
          updateCardDisplay(indexCard2);
          gameStarted = true; // Re-enable clicking after the delay
        }, 1000);
      }
    }
  }


  /**
   * The updateCardDisplay function updates the display of a card at a given index.
   * @param index Identify which card is being updated
   * @return a card element
   *
   */
  function updateCardDisplay(index) {
    var card = cards[index];
    var cardElement = $(".card[data-index='" + index + "']");
    var imgElement = cardElement.find("img");
    if (card.flipped) {
      if (imgElement.length === 0) {
        imgElement = $("<img>").attr("src", card.symbol).addClass("card-img");
        cardElement.empty().append(imgElement);
      }
      cardElement.removeClass("hidden");
      cardElement.addClass("show");
      cardElement.addClass("flip"); // Add flip class for animation
    } else {
      cardElement.removeClass("show");
      cardElement.addClass("flip"); // Add flip class for animation
      // Delay hiding the card and removing flip class to allow the flip animation to complete
      setTimeout(function () {
        cardElement.addClass("hidden");
        cardElement.removeClass("flip"); // Remove flip class to revert animation
      }, 500); // Adjust the delay duration as needed
    }
  }


  /**
   * the following 3 "clock" functions i took from the internet
   */
  function startClock() {
    startTime = new Date().getTime() - elapsedTime;
    gameStarted = true;
    gameInterval = setInterval(updateClock);
  }

  function updateClock() {
    if (!gamePaused) {
      var currentTime = new Date().getTime();
      elapsedTime = currentTime - startTime;
      var elapsedSeconds = Math.floor(elapsedTime / 1000);
      var minutes = Math.floor(elapsedSeconds / 60);
      var seconds = elapsedSeconds % 60;
      $("#clock").text(formatTime(minutes) + ":" + formatTime(seconds));
    }
  }

  function formatTime(time) {
    return time < 10 ? "0" + time : time;
  }

  function checkGameEnd() {
    if (matchedPairs === cardPairs) {
      clearInterval(gameInterval);
      gameStarted = false;
      showGameEnd();
    }
  }

  function showGameEnd() {
    var totalTime = $("#clock").text();
    var gameEndMessage = "Congratulations, " + playerName + "!\nYou finished the game in " + totalTime;
    $("#player-info").text(gameEndMessage);
    $("#pause-btn").hide();
    $("#reset-btn").hide();
    $("#resume-btn").hide();
    elapsedTime = 0;
    $("#play-again-btn").show().click(function () {
      resetGame();
    });
  }

  function resetGame() {
    $("#player-name").val("");
    $("#card-pairs").val("");
    $("#game-container").hide();
    $("#play-again-btn").hide();
    $("#game-form").show();
    matchedPairs = 0;
    gameStarted = false;
    gamePaused = false;
    clearInterval(gameInterval);
    elapsedTime = 0;
  }

  function cardsMatch(card1, card2) {
    card1.matched = true;
    card2.matched = true;
    matchedPairs++;
    checkGameEnd();
    flippedCards = [];
  }

  $("#pause-btn").click(function () {
    pauseGame();
  });

  $("#resume-btn").click(function () {
    resumeGame();
  });

  $("#reset-btn").click(function () {
    resetGame();
  });

  function pauseGame() {
    gamePaused = true;
    clearInterval(gameInterval);
    $("#card-pairs").disabled = true;
    $("#pause-btn").hide();
    $("#resume-btn").show();
    $("#reset-btn").show();
  }

  function resumeGame() {
    gamePaused = false;
    startClock();
    $("#game-container").disabled = false;
    $("#resume-btn").hide();
    $("#reset-btn").hide();
    $("#pause-btn").show();
  }
});
