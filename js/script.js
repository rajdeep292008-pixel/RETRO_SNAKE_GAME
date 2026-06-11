const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('current-score');
        const highScoreEl = document.getElementById('high-score');
        
        let audioCtx = null;
        const GRID_SIZE = 20;
        let tileCount = 20;
        let gameSpeed = 100;
        let score = 0;
        let snake = [{x: 10, y: 10}];
        let food = {x: 5, y: 5};
        let dx = 0, dy = 0;
        let nextDx = 1, nextDy = 0;
        let gameActive = false;
        let lastTime = 0;

        // Load High Score
        let highScore = localStorage.getItem('snakeHigh') || 0;
        highScoreEl.innerText = String(highScore).padStart(3, '0');

        function initAudio() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        }

        function playSound(freq, duration) {
            if (!audioCtx) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.frequency.value = freq;
            osc.type = 'square';
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        }

        function setupCanvas() {
            canvas.width = 400;
            canvas.height = 400;
        }

        function resetGame() {
            snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
            nextDx = 1; nextDy = 0;
            dx = 1; dy = 0;
            score = 0;
            gameSpeed = 100;
            scoreEl.innerText = "000";
            spawnFood();
        }

        function spawnFood() {
            food.x = Math.floor(Math.random() * tileCount);
            food.y = Math.floor(Math.random() * tileCount);
        }

        function gameLoop(timestamp) {
            if (!gameActive) return;

            const delta = timestamp - lastTime;
            if (delta > gameSpeed) {
                lastTime = timestamp;
                moveSnake();
            }
            draw();
            requestAnimationFrame(gameLoop);
        }

        function moveSnake() {
            dx = nextDx; dy = nextDy;
            const head = {x: snake[0].x + dx, y: snake[0].y + dy};

            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || 
                snake.some(s => s.x === head.x && s.y === head.y)) {
                return endGame();
            }

            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                scoreEl.innerText = String(score).padStart(3, '0');
                playSound(440, 0.1);
                spawnFood();
                if (gameSpeed > 50) gameSpeed -= 1;
            } else {
                snake.pop();
            }
        }

        function draw() {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Food
            ctx.fillStyle = varColor('--food-color');
            ctx.fillRect(food.x * GRID_SIZE + 2, food.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);

            // Snake
            snake.forEach((p, i) => {
                ctx.fillStyle = i === 0 ? varColor('--snake-color') : varColor('--ui-accent');
                ctx.fillRect(p.x * GRID_SIZE + 1, p.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
            });
        }

        function varColor(name) {
            return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        }

        function endGame() {
            gameActive = false;
            playSound(100, 0.3);
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('snakeHigh', highScore);
                highScoreEl.innerText = String(highScore).padStart(3, '0');
            }
            document.getElementById('final-score').innerText = score;
            document.getElementById('game-over-screen').classList.remove('hidden');
        }

        // Controls
        window.addEventListener('keydown', e => {
            if (e.key === 'ArrowUp' && dy === 0) { nextDx = 0; nextDy = -1; }
            if (e.key === 'ArrowDown' && dy === 0) { nextDx = 0; nextDy = 1; }
            if (e.key === 'ArrowLeft' && dx === 0) { nextDx = -1; nextDy = 0; }
            if (e.key === 'ArrowRight' && dx === 0) { nextDx = 1; nextDy = 0; }
        });

        document.getElementById('start-btn').onclick = () => {
            initAudio();
            document.getElementById('start-screen').classList.add('hidden');
            gameActive = true;
            setupCanvas();
            resetGame();
            requestAnimationFrame(gameLoop);
        };

        document.getElementById('restart-btn').onclick = () => {
            document.getElementById('game-over-screen').classList.add('hidden');
            gameActive = true;
            resetGame();
            requestAnimationFrame(gameLoop);
        };