const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 560;  // Width for 7 bubbles horizontally (80px per bubble)
canvas.height = 600;  // Height for 15 bubbles vertically (40px radius per bubble)

const maxColumns = 7;  // Maximum bubbles horizontally
const maxRows = 15;    // Maximum bubbles vertically
const bubbleRadius = canvas.width / (2 * maxColumns);  // Calculate bubble radius based on canvas width
let bubbles = [];
let shooter = { x: canvas.width / 2, y: canvas.height - 50, angle: 0 };
let currentBubble = createBubble(shooter.x, shooter.y, getRandomColor());
let isShooting = false;
let score = 0;  // To track how many bubbles are burst
let fallingBubble = null; // Track the bubble that is falling

// Background image
let backgroundImage = new Image();
backgroundImage.src = 'background.jpg';  // Path to your background image

// Function to generate random colors for bubbles
function getRandomColor() {
    const colors = ['red', 'green', 'blue', 'yellow', 'purple'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Function to create bubbles
function createBubble(x, y, color) {
    return { x: x, y: y, radius: bubbleRadius, color: color, dx: 0, dy: 0, connected: false, falling: false };
}

// Draw the shooter
function drawShooter() {
    ctx.beginPath();
    ctx.arc(shooter.x, shooter.y, 30, 0, Math.PI * 2);
    ctx.fillStyle = 'gray';
    ctx.fill();
    ctx.closePath();

    // Aiming line
    ctx.beginPath();
    ctx.moveTo(shooter.x, shooter.y);
    ctx.lineTo(shooter.x + 40 * Math.cos(shooter.angle), shooter.y + 40 * Math.sin(shooter.angle));
    ctx.strokeStyle = 'black';
    ctx.stroke();
}

// Draw the bubbles in a grid format
function drawBubbles() {
    bubbles.forEach(bubble => {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = bubble.color;
        ctx.fill();
        ctx.closePath();
    });
}

// Draw the falling bubble (the one that did not connect)
function drawFallingBubble() {
    if (fallingBubble) {
        ctx.beginPath();
        ctx.arc(fallingBubble.x, fallingBubble.y, fallingBubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = fallingBubble.color;
        ctx.fill();
        ctx.closePath();
    }
}

// Shoot the bubble
function shootBubble() {
    if (!isShooting) {
        currentBubble.dx = 5 * Math.cos(shooter.angle);
        currentBubble.dy = 5 * Math.sin(shooter.angle);
        isShooting = true;
    }
}

// Handle bubble collision with walls and check connections
function handleCollisions() {
    currentBubble.x += currentBubble.dx;
    currentBubble.y += currentBubble.dy;

    // Bounce off walls
    if (currentBubble.x + bubbleRadius > canvas.width || currentBubble.x - bubbleRadius < 0) {
        currentBubble.dx *= -1;
    }

    // If bubble hits the top or another bubble, add to the stack
    if (currentBubble.y - bubbleRadius < 0 || detectCollisionWithBubbles(currentBubble)) {
        currentBubble.connected = true; // Mark bubble as connected

        // Add to bubbles list
        bubbles.push({ ...currentBubble });

        // Reset for the next bubble
        currentBubble = createBubble(shooter.x, shooter.y, getRandomColor());
        isShooting = false;
    } else if (currentBubble.y + bubbleRadius >= canvas.height) {
        // If the bubble falls off the screen, reset the shot
        currentBubble = createBubble(shooter.x, shooter.y, getRandomColor());
        isShooting = false;
    } else if (currentBubble.y <= canvas.height / 2 && !detectCollisionWithBubbles(currentBubble) && !currentBubble.connected) {
        // If the bubble hasn't connected, start falling
        currentBubble.dy = 5; // Reverse direction, making the bubble fall
        currentBubble.falling = true;
        fallingBubble = { ...currentBubble };
        isShooting = false;
    }
}

// Detects collision between shooting bubble and stationary bubbles
function detectCollisionWithBubbles(shootingBubble) {
    for (let i = 0; i < bubbles.length; i++) {
        let dx = shootingBubble.x - bubbles[i].x;
        let dy = shootingBubble.y - bubbles[i].y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < bubbleRadius * 2) {
            return true;
        }
    }
    return false;
}

// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Draw the background image
function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);  // Draw the background
}

// Display score
function drawScore() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, 10, 20);  // Display the score in the top left corner
}

// Main game loop
function gameLoop() {
    clearCanvas();
    drawBackground();  // Draw the background before other elements
    drawShooter();
    drawBubbles();
    drawFallingBubble();  // Draw the falling bubble
    drawScore();  // Draw the score on the screen

    if (isShooting) {
        handleCollisions();
    }

    // Draw the current bubble being shot
    ctx.beginPath();
    ctx.arc(currentBubble.x, currentBubble.y, bubbleRadius, 0, Math.PI * 2);
    ctx.fillStyle = currentBubble.color;
    ctx.fill();
    ctx.closePath();

    // Handle the falling bubble
    updateFallingBubble();

    requestAnimationFrame(gameLoop);
}

// Update the falling bubble
function updateFallingBubble() {
    if (fallingBubble) {
        fallingBubble.y += 5;  // Make bubble fall down

        // Remove bubble once it falls off the screen
        if (fallingBubble.y - bubbleRadius > canvas.height) {
            fallingBubble = null;
        }
    }
}

// Handle mouse movement for aiming
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    let mouseX = event.clientX - rect.left;
    let mouseY = event.clientY - rect.top;
    shooter.angle = Math.atan2(mouseY - shooter.y, mouseX - shooter.x);
});

// Handle mouse click for shooting
canvas.addEventListener('click', () => {
    shootBubble();
});

// Start the game
gameLoop();
