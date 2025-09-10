// Enhanced TicTacToe class with improved visual feedback, animations, and comprehensive comments

class TicTacToe {
  constructor() {
    // DOM Elements - Get references to all game elements for interaction
    this.cells = document.querySelectorAll(".cell");
    this.statusText = document.getElementById("status");
    this.resetButton = document.getElementById("restartBtn");
    this.resetAllButton = document.getElementById("resetAllBtn");
    this.soundToggle = document.getElementById("soundToggle");
    this.musicToggle = document.getElementById("musicToggle");

    // Audio elements: References to HTML audio elements for game sounds and background music
    this.sounds = {
      move: document.getElementById("moveSound"), // Sound when player makes a move
      win: document.getElementById("winSound"), // Sound when player wins
      draw: document.getElementById("drawSound"), // Sound when game ends in draw
      music: document.getElementById("bgMusic"), // Background music
    };

    // Game state variables - Track current game status
    this.board = Array(9).fill(""); // Game board state (empty strings for empty cells)
    this.currentPlayer = "X"; // Current player (X starts first)
    this.gameIsActive = true; // Whether the game is currently playable

    // Sound and music toggle states: Control whether sound effects and background music are played
    this.soundEnabled = true; // Sound effects on/off
    this.musicEnabled = true; // Background music on/off
    this.scores = { X: 0, O: 0, draw: 0 }; // Score tracking for both players and draws
    this.winningCells = []; // Track winning cells for visual effects

    // Win patterns: All possible winning combinations on the 3x3 board
    this.winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Horizontal rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Vertical columns
      [0, 4, 8],
      [2, 4, 6], // Diagonal patterns
    ];

    // Initialize the game
    this.init();
  }

  // Initialize the game with event listeners and starting state
  init() {
    // Add click event listener to each cell for player moves
    this.cells.forEach((cell) =>
      cell.addEventListener("click", (e) => this.handleCellClick(e))
    );

    // Add event listeners for control buttons
    this.resetButton.addEventListener("click", () => this.resetGame());
    this.resetAllButton.addEventListener("click", () => this.resetAll());
    this.soundToggle.addEventListener("click", () => this.toggleSound());
    this.musicToggle.addEventListener("click", () => this.toggleMusic());

    // Set initial game status message
    this.updateStatus(`Player ${this.currentPlayer}'s turn`);

    // Start playing background music when the game initializes
    this.playBackgroundMusic();

    // Add enhanced visual feedback for better user experience
    this.addCellHoverEffects();
  }

  // Handle when a player clicks on a cell
  handleCellClick(event) {
    const cell = event.target;
    const index = parseInt(cell.dataset.index);

    // Check if the move is valid (cell is empty and game is still active)
    if (this.board[index] === "" && this.gameIsActive) {
      // Start background music on first cell click if music is enabled and not already playing
      if (this.musicEnabled && this.sounds.music.paused) {
        this.playBackgroundMusic();
      }
      // Update the game board state and cell display
      this.board[index] = this.currentPlayer;
      cell.textContent = this.currentPlayer;

      // Add visual enhancement - CSS class for player-specific styling
      cell.setAttribute("data-player", this.currentPlayer);
      cell.classList.add(`player-${this.currentPlayer.toLowerCase()}`);

      // Add cell animation for visual feedback
      this.addCellAnimation(cell);

      // Play move sound effect when a player makes a valid move
      this.playSound(this.sounds.move);

      // Check game outcome after the move
      if (this.checkWin()) {
        this.handleWin();
      }
      // Check if the board is full (draw condition)
      else if (this.board.every((c) => c !== "")) {
        this.handleDraw();
      }
      // Continue game - switch to the other player
      else {
        this.currentPlayer = this.currentPlayer === "X" ? "O" : "X";
        this.updateStatus(`Player ${this.currentPlayer}'s turn`);
      }
    }
  }

  // Check if the current player has won the game
  checkWin() {
    // Check each winning pattern to see if current player has achieved it
    for (let pattern of this.winPatterns) {
      const [a, b, c] = pattern;
      if (
        this.board[a] &&
        this.board[a] === this.board[b] &&
        this.board[a] === this.board[c]
      ) {
        this.winningCells = pattern; // Store winning cells for visual effects
        return true;
      }
    }
    return false;
  }

  // Handle when a player wins the game
  handleWin() {
    // Disable further moves
    this.gameIsActive = false;

    // Update status message with celebration
    this.updateStatus(`🎉 Player ${this.currentPlayer} wins! 🎉`);
    this.statusText.classList.add("win");

    // Update and animate the score for the winning player
    this.scores[this.currentPlayer]++;
    const scoreElement = document.getElementById(`score${this.currentPlayer}`);
    scoreElement.textContent = this.scores[this.currentPlayer];
    scoreElement.classList.add("updated");

    // Add visual effects to winning cells
    this.highlightWinningCells();

    // Handle win sound effects
    if (this.soundEnabled) {
      // Pause background music during win sound playback for better audio experience
      if (this.musicEnabled) this.sounds.music.pause();
      this.sounds.win.currentTime = 0;
      // Play win sound
      this.sounds.win.play().catch(() => {}); // Catch any audio play errors
    }

    // Auto-reset game after delay with proper cleanup
    setTimeout(() => {
      this.resetGame();
      this.statusText.classList.remove("win");
      scoreElement.classList.remove("updated");
    }, 2000);
  }

  // Handle when the game ends in a draw (board full, no winner)
  handleDraw() {
    // Disable further moves
    this.gameIsActive = false;
    this.updateStatus("🤝 It's a draw!");

    // Update and animate the draw score
    this.scores.draw++;
    const drawElement = document.getElementById("scoreDraw");
    drawElement.textContent = this.scores.draw;
    drawElement.classList.add("updated");

    // Play draw sound effect when the game ends in a draw
    if (this.soundEnabled) {
      this.sounds.draw.currentTime = 0;
      this.sounds.draw.play().catch(() => {});
    }

    // Auto-reset game after delay with cleanup
    setTimeout(() => {
      this.resetGame();
      drawElement.classList.remove("updated");
    }, 2000);
  }

  // Reset the game to initial state for a new round
  resetGame() {
    // Clear the game board state
    this.board.fill("");

    // Reset game state variables
    this.currentPlayer = "X";
    this.gameIsActive = true;
    this.winningCells = [];

    // Clean up all visual effects and cell content
    this.cells.forEach((cell) => {
      cell.textContent = "";
      cell.removeAttribute("data-player");
      cell.classList.remove("player-x", "player-o", "winning-cell");
      cell.style.background = "rgba(255, 255, 255, 0.9)"; // Reset to initial white background
      cell.style.removeProperty("backgroundColor"); // Remove hover effect
    });

    // Reset status message
    this.updateStatus(`Player ${this.currentPlayer}'s turn`);

    // Restart background music if it's enabled
    if (this.musicEnabled) this.playBackgroundMusic();
  }

  // Update the game status message displayed to players
  updateStatus(message) {
    this.statusText.textContent = message;
  }

  // Toggle sound effects on/off: Updates the sound state and button icon
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.soundToggle.textContent = this.soundEnabled ? "🔊" : "🔇";

    // Add visual feedback for the toggle action
    this.soundToggle.style.transform = "scale(0.9)";
    setTimeout(() => {
      this.soundToggle.style.transform = "";
    }, 150);
  }

  // Toggle background music on/off: Updates the music state, button icon, and plays/pauses music accordingly
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    this.musicToggle.textContent = this.musicEnabled ? "🎵" : "🔇";

    // Handle music playback based on new state
    if (this.musicEnabled) {
      this.playBackgroundMusic();
    } else {
      this.sounds.music.pause();
    }

    // Add visual feedback for the toggle action
    this.musicToggle.style.transform = "scale(0.9)";
    setTimeout(() => {
      this.musicToggle.style.transform = "";
    }, 150);
  }

  // Play background music: Sets volume and starts playback if music is enabled
  playBackgroundMusic() {
    if (this.musicEnabled) {
      this.sounds.music.volume = 0.3; // Set comfortable volume level
      this.sounds.music.play().catch(() => {}); // Handle any playback errors gracefully
    }
  }

  // Play a sound effect: Resets sound to start and plays it if sound is enabled
  playSound(sound) {
    if (this.soundEnabled && sound) {
      sound.currentTime = 0; // Reset to beginning for immediate playback
      sound.play().catch(() => {}); // Handle any playback errors gracefully
    }
  }

  // Enhanced visual effects methods for better user experience

  // Add animation to cell when it's clicked for visual feedback
  addCellAnimation(cell) {
    cell.style.transform = "scale(1.1)";
    setTimeout(() => {
      cell.style.transform = "";
    }, 200);
  }

  // Highlight winning cells with special visual effects
  highlightWinningCells() {
    this.winningCells.forEach((index) => {
      const cell = this.cells[index];
      cell.classList.add("winning-cell");
    });
  }

  // Add hover effects to cells for better user experience and visual feedback
  addCellHoverEffects() {
    this.cells.forEach((cell) => {
      // Add hover effect when mouse enters cell
      cell.addEventListener("mouseenter", () => {
        if (cell.textContent === "" && this.gameIsActive) {
          cell.style.backgroundColor = "rgba(102, 126, 234, 0.1)";
        }
      });

      // Remove hover effect when mouse leaves cell
      cell.addEventListener("mouseleave", () => {
        if (cell.textContent === "" && this.gameIsActive) {
          cell.style.backgroundColor = "";
        }
      });
    });
  }

  // Reset the whole game and all scores to zero
  resetAll() {
    // Reset scores
    this.scores = { X: 0, O: 0, draw: 0 };
    document.getElementById("scoreX").textContent = "0";
    document.getElementById("scoreO").textContent = "0";
    document.getElementById("scoreDraw").textContent = "0";
    // Reset game board
    this.resetGame();
  }
}

// Initialize the enhanced game when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", () => new TicTacToe());
