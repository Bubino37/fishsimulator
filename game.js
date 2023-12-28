const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let car = { x: canvas.width / 2, y: canvas.height - 50, width: 50, height: 100 };
let keys = { ArrowLeft: false, ArrowRight: false };

function drawCar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(car.x, car.y, car.width, car.height);
}

function updateGame() {
    if (keys.ArrowLeft && car.x > 0) {
        car.x -= 5;
    }
    if (keys.ArrowRight && car.x < canvas.width - car.width) {
        car.x += 5;
    }
    drawCar();
    requestAnimationFrame(updateGame);
}

function handleOrientation(event) {
    let x = event.gamma; // Naklonenie doľava/doprava
    if (x > 5 && car.x < canvas.width - car.width) {
        car.x += 5;
    } else if (x < -5 && car.x > 0) {
        car.x -= 5;
    }
}

window.addEventListener('deviceorientation', handleOrientation);
window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

updateGame();
