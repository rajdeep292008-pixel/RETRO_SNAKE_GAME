/**
 * hard_logic.js – Hard mode enhancements for Snake game
 * Ensures smooth start, correct speed, and optional extra segment.
 */

(function() {
    // Store original functions if needed
    let originalResetGame = window.resetGame;
    let originalMoveSnake = window.moveSnake;

    // Hard mode specific configuration
    const HARD_CONFIG = {
        startSpeed: 75,
        minSpeed: 35,
        startLength: 4,
        pointBonus: 10   // same as normal, but speed is higher
    };

    // Function to apply Hard mode after a reset
    function applyHardMode() {
        if (window.currentDifficulty !== 'hard') return;

        // Set game speed
        if (window.gameSpeed !== undefined) {
            window.gameSpeed = HARD_CONFIG.startSpeed;
        }
        // Set minimum speed limit (will be checked when speed increases)
        window._minSpeed = HARD_CONFIG.minSpeed;

        // Ensure snake length is exactly 4 (if not already)
        if (window.snake && window.snake.length < HARD_CONFIG.startLength) {
            // Add segments at the tail in a safe direction (to the left, if possible)
            let lastSegment = window.snake[window.snake.length - 1];
            let newX = lastSegment.x - 1;
            let newY = lastSegment.y;
            // Make sure we don't go out of bounds (grid is 0-19)
            if (newX < 0) newX = lastSegment.x + 1;
            window.snake.push({ x: newX, y: newY });
        }
        // If snake length is more than 4, trim (should not happen)
        while (window.snake.length > HARD_CONFIG.startLength) {
            window.snake.pop();
        }
    }

    // Override resetGame to include Hard mode setup
    if (originalResetGame) {
        window.resetGame = function() {
            // Call original reset
            originalResetGame();
            // Apply Hard mode if selected
            if (window.currentDifficulty === 'hard') {
                applyHardMode();
            }
        };
    }

    // Override moveSnake to enforce min speed limit
    if (originalMoveSnake) {
        window.moveSnake = function() {
            // Call original move
            originalMoveSnake();
            // After moving, check and enforce min speed for Hard mode
            if (window.currentDifficulty === 'hard' && window.gameSpeed < HARD_CONFIG.minSpeed) {
                window.gameSpeed = HARD_CONFIG.minSpeed;
            }
        };
    }

    // Also listen for restart button to re-apply Hard mode
    document.addEventListener('DOMContentLoaded', function() {
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', function() {
                // Small delay to let original reset complete
                setTimeout(function() {
                    if (window.currentDifficulty === 'hard' && window.gameActive) {
                        applyHardMode();
                    }
                }, 20);
            });
        }
    });
})();