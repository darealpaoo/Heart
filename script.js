(() => {
    const PI2 = Math.PI * 2;

    // Helper functions
    const random = (min, max) => Math.random() * (max - min + 1) + min;
    const timestamp = () => new Date().getTime();

    // Snowflakes Canvas
    const snowCanvas = document.getElementById('snowflakes');
    const snowCtx = snowCanvas.getContext('2d');
    let snowWidth = snowCanvas.width = window.innerWidth;
    let snowHeight = snowCanvas.height = window.innerHeight;
    const snowflakes = [];

    // Fireworks Canvas
    const fireCanvas = document.getElementById('fireworks');
    const fireCtx = fireCanvas.getContext('2d');
    let fireWidth = fireCanvas.width = window.innerWidth;
    let fireHeight = fireCanvas.height = window.innerHeight;
    const fireworks = [];
    let counter = 0;

    // Resize event
    window.addEventListener('resize', () => {
        snowWidth = snowCanvas.width = window.innerWidth;
        snowHeight = snowCanvas.height = window.innerHeight;
        fireWidth = fireCanvas.width = window.innerWidth;
        fireHeight = fireCanvas.height = window.innerHeight;
    });

    // Snowflake class
    class Snowflake {
        constructor() {
            this.x = random(0, snowWidth);
            this.y = random(0, -200);
            this.radius = random(1, 3);
            this.speed = random(0.5, 1.5);
            this.wind = random(-0.5, 0.5);
            this.opacity = random(0.5, 1);
        }

        update() {
            this.y += this.speed;
            this.x += this.wind;

            if (this.y > snowHeight) {
                this.y = random(0, -200);
                this.x = random(0, snowWidth);
            }

            snowCtx.beginPath();
            snowCtx.arc(this.x, this.y, this.radius, 0, PI2);
            snowCtx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            snowCtx.fill();
        }
    }

    // Firework class
    class Firework {
        constructor(x, y, targetX, targetY, shade, offsprings) {
            this.dead = false;
            this.offsprings = offsprings;
            this.x = x;
            this.y = y;
            this.targetX = targetX;
            this.targetY = targetY;
            this.shade = shade;
            this.history = [];
        }

        update(delta) {
            if (this.dead) return;

            const xDiff = this.targetX - this.x;
            const yDiff = this.targetY - this.y;

            if (Math.abs(xDiff) > 3 || Math.abs(yDiff) > 3) {
                this.x += xDiff * 2 * delta;
                this.y += yDiff * 2 * delta;
                this.history.push({ x: this.x, y: this.y });
                if (this.history.length > 20) this.history.shift();
            } else {
                if (this.offsprings && !this.madeChilds) {
                    const babies = this.offsprings / 2;
                    for (let i = 0; i < babies; i++) {
                        const angle = (PI2 * i) / babies;
                        const targetX = this.x + this.offsprings * Math.cos(angle);
                        const targetY = this.y + this.offsprings * Math.sin(angle);
                        fireworks.push(new Firework(this.x, this.y, targetX, targetY, this.shade, 0));
                    }
                }
                this.madeChilds = true;
                this.history.shift();
            }

            if (this.history.length === 0) {
                this.dead = true;
            } else {
                this.history.forEach((point, i) => {
                    fireCtx.beginPath();
                    fireCtx.fillStyle = `hsl(${this.shade}, 100%, ${i}%)`;
                    fireCtx.arc(point.x, point.y, 1, 0, PI2);
                    fireCtx.fill();
                });
            }
        }
    }

    // Main animation loop
    let then = timestamp();
    function loop() {
        const now = timestamp();
        const delta = (now - then) / 1000;
        then = now;

        // Clear and update snowflakes
        snowCtx.clearRect(0, 0, snowWidth, snowHeight);
        while (snowflakes.length < Math.floor((snowWidth * snowHeight) / 10000)) {
            snowflakes.push(new Snowflake());
        }
        snowflakes.forEach(snowflake => snowflake.update());

        // Clear and update fireworks
        fireCtx.globalCompositeOperation = 'source-over';
        fireCtx.fillStyle = 'rgba(20,20,20,0.2)';
        fireCtx.fillRect(0, 0, fireWidth, fireHeight);
        fireCtx.globalCompositeOperation = 'lighter';
        fireworks.forEach(firework => firework.update(delta));
        fireworks.filter(firework => !firework.dead);

        // Auto-fire fireworks
        counter += delta * 3;
        if (counter >= 1) {
            fireworks.push(new Firework(
                random(fireWidth / 4, (fireWidth * 3) / 4),
                fireHeight,
                random(0, fireWidth),
                random(fireHeight / 10, fireHeight / 2),
                random(0, 360),
                random(30, 110)
            ));
            counter = 0;
        }

        requestAnimationFrame(loop);
    }

    // Event for clicking to add fireworks
    document.addEventListener('click', evt => {
        const x = evt.clientX;
        const y = evt.clientY;

        for (let i = 0; i < random(3, 5); i++) {
            fireworks.push(new Firework(
                random(fireWidth / 4, (fireWidth * 3) / 4),
                fireHeight,
                x,
                y,
                random(0, 360),
                random(30, 110)
            ));
        }
    });

    loop();
})();

