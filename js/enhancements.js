/**
 * enhancements.js – difficulty selection + theme toggles
 * Fixed: UI now correctly reflects localStorage on page reload.
 */

(function() {
    function init() {
        // ----- Difficulty settings -----
        const DIFFICULTY_CONFIG = {
            easy:   { startSpeed: 150, minSpeed: 80,  pointBonus: 15, startLength: 3 },
            normal: { startSpeed: 100, minSpeed: 50,  pointBonus: 10, startLength: 3 },
            hard:   { startSpeed: 75,  minSpeed: 35,  pointBonus: 10, startLength: 4 }
        };

        // Load saved preferences (or defaults)
        let currentDifficulty = localStorage.getItem('snakeDifficulty') || 'normal';
        let currentTheme = localStorage.getItem('snakeTheme') || 'neon';

        // Validate (in case stored value is invalid)
        if (!DIFFICULTY_CONFIG[currentDifficulty]) currentDifficulty = 'normal';
        if (!['neon', 'cyberpunk', 'golden'].includes(currentTheme)) currentTheme = 'neon';

        // Make difficulty globally accessible for hard_logic.js
        window.currentDifficulty = currentDifficulty;

        // ----- Apply theme to CSS variables -----
        function applyTheme(themeName) {
            const root = document.documentElement;
            if (themeName === 'neon') {
                root.style.setProperty('--snake-color', '#00ff41');
                root.style.setProperty('--food-color', '#ff3131');
                root.style.setProperty('--ui-accent', '#008f11');
                root.style.setProperty('--bg-color', '#0a0a0c');
            } else if (themeName === 'cyberpunk') {
                root.style.setProperty('--snake-color', '#ff00ff');
                root.style.setProperty('--food-color', '#00ffff');
                root.style.setProperty('--ui-accent', '#aa00ff');
                root.style.setProperty('--bg-color', '#0a001a');
            } else if (themeName === 'golden') {
                root.style.setProperty('--snake-color', '#ffcc00');
                root.style.setProperty('--food-color', '#ff6600');
                root.style.setProperty('--ui-accent', '#b8860b');
                root.style.setProperty('--bg-color', '#1a1208');
            }
            localStorage.setItem('snakeTheme', themeName);
        }

        // Apply saved theme
        applyTheme(currentTheme);

        // ----- Helper: Update difficulty UI and game settings -----
        function setDifficulty(diff) {
            currentDifficulty = diff;
            window.currentDifficulty = diff;
            localStorage.setItem('snakeDifficulty', diff);
            const cfg = DIFFICULTY_CONFIG[diff];
            if (window.gameActive && window.gameSpeed) {
                window.gameSpeed = cfg.startSpeed;
            }
            // For Easy mode, add extra points
            if (diff === 'easy') {
                if (window.moveSnake && !window._easyPatched) {
                    const originalMove = window.moveSnake;
                    window.moveSnake = function() {
                        const oldScore = window.score;
                        originalMove();
                        if (window.score > oldScore) {
                            window.score += 5;
                            window.scoreEl.innerText = String(window.score).padStart(3, '0');
                        }
                    };
                    window._easyPatched = true;
                }
            } else {
                if (window._easyPatched) {
                    // Restore original moveSnake (need to keep a reference)
                    if (window.originalMoveSnakeForEasy) {
                        window.moveSnake = window.originalMoveSnakeForEasy;
                    }
                    window._easyPatched = false;
                }
            }
        }

        // ----- UI: Set active button state -----
        function updateDifficultyButtons() {
            const btns = document.querySelectorAll('.enh-diff-btn');
            btns.forEach(btn => {
                if (btn.getAttribute('data-diff') === currentDifficulty) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }

        function updateThemeButtons() {
            const btns = document.querySelectorAll('.enh-theme-btn');
            btns.forEach(btn => {
                if (btn.getAttribute('data-theme') === currentTheme) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }

        // ----- Event listeners for difficulty buttons -----
        const diffBtns = document.querySelectorAll('.enh-diff-btn');
        diffBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const diff = btn.getAttribute('data-diff');
                setDifficulty(diff);
                updateDifficultyButtons();
            });
        });

        // ----- Event listeners for theme buttons -----
        const themeBtns = document.querySelectorAll('.enh-theme-btn');
        themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.getAttribute('data-theme');
                currentTheme = theme;
                applyTheme(theme);
                updateThemeButtons();
                // Also force redraw of canvas if game is active
                if (window.gameActive && window.draw) {
                    window.draw();
                }
            });
        });

        // Apply initial difficulty settings (overrides any default game speed)
        setDifficulty(currentDifficulty);

        // Set initial button highlights based on loaded preferences
        updateDifficultyButtons();
        updateThemeButtons();

        // Also ensure that when the start or restart button is clicked,
        // the currently selected difficulty is reapplied (hard_logic.js also handles hard mode)
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                // Small delay to let original reset happen, then reapply difficulty speed
                setTimeout(() => {
                    if (window.gameActive) {
                        const cfg = DIFFICULTY_CONFIG[currentDifficulty];
                        if (cfg && window.gameSpeed) window.gameSpeed = cfg.startSpeed;
                    }
                }, 10);
            });
        }
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                setTimeout(() => {
                    if (window.gameActive) {
                        const cfg = DIFFICULTY_CONFIG[currentDifficulty];
                        if (cfg && window.gameSpeed) window.gameSpeed = cfg.startSpeed;
                    }
                }, 20);
            });
        }
    }

    // Wait for DOM and original game script to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();