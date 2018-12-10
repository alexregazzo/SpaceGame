let player;
let IMAGES = {};
let bullets = [];
let enemies = [];
let score = 0;

function preload() {
	IMAGES.player = loadImage("player.png");
	IMAGES.enemy = loadImage("enemy.png");
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(155);
	textAlign(CENTER);
	noStroke();
	fill(0, 0, 255);
	text("Press any key to start!", width / 2, height / 2);
}


function reset() {
	player = new Player();
	bullets = [];
	enemies = [];
	score = 0;
	loop();
}

function draw() {
	if (player === undefined) return;
	if (player.life === 0) {
		gameOver();
		noLoop();
		return;
	}
	checkForKeyboardMovements();
	background(51);
	textAlign(LEFT);
	noStroke();
	fill(255);
	textSize(20);
	text("Score: " + str(score), 0, 20);
	player.draw();
	for (let i = bullets.length - 1; i >= 0; i--) {
		bullets[i].animate();
		bullets[i].draw();
		//compare with player
		if (bullets[i].pos.dist(player.pos) < bullets[i].r + player.r) {
			player.hit(bullets[i]);
			bullets[i].alive = false;
		}

		//compare with enemies
		for (let j = enemies.length - 1; j >= 0; j--) {
			if (bullets[i].pos.dist(enemies[j].pos) < bullets[i].r + enemies[j].r) {
				if (enemies[j].hit(bullets[i])) {
					enemies.splice(j, 1);
					enemyKilled(enemies[j]);
				}
				bullets[i].alive = false;
			}
		}


		if (!bullets[i].alive) {
			bullets.splice(i, 1);
		}
	}

	for (let i = enemies.length - 1; i >= 0; i--) {
		if (enemies[i].life <= 0) {
			enemies.splice(i, 1);
			enemyKilled(enemies[i]);
			continue;
		}
		if (player.pos.dist(enemies[i].pos) < player.r + enemies[i].r) {
			player.life = 0;
		}
		enemies[i].animate();
		enemies[i].draw();
		if (enemies[i].outOfScreen()) {
			enemies.splice(i, 1);
		}
	}
	createEnemy();
	createRandomBullets();
}

function enemyKilled(enemy) {
	score++;
}

function createEnemy() {
	if (enemies.length < 10 + round(score / 5)) {
		enemies.push(new Enemy(100 + 10 * score));
	}
}

function createRandomBullets() {
	if (random() < 0.001 * score) {
		bullets.push(new Bullet(createVector(random(width), 0), createVector(0, random(0.5, 5))));
	}
}

class Enemy {
	constructor(maxLife = 100) {
		this.image = IMAGES.enemy;
		this.r = 20;
		// this.pos = createVector(random(width), 0);
		// this.vel = createVector(0, 1);
		this.pos = createVector(random(this.r, width - this.r), -this.r * 2);
		this.vel = createVector(0, 1).setMag(random(0.5, 3));
		this.life = maxLife;
		this.maxLife = maxLife;
	}
	animate() {
		this.pos.add(this.vel);
		if (this.life < 0) {
			this.life = this.maxLife;
		} else if (this.life > this.maxLife) {
			this.life = maxLife;
		}
		this.outOfScreen();
	}
	hit(bullet) {
		this.life -= bullet.strength;
	}

	draw() {
		stroke(0);
		fill(lerpColor(color(255, 0, 0), color(0, 255, 0), this.life / this.maxLife));
		rect(this.pos.x - this.r * 2 / 3, this.pos.y - this.r, map(this.life, 0, this.maxLife, 0, this.r * 4 / 3), this.r / 5)
		imageMode(CENTER);
		image(this.image, this.pos.x, this.pos.y, this.r * 2, this.r * 2);
	}

	outOfScreen() {
		return this.pos.y - this.r > height;
	}
}

class Player {
	constructor() {
		this.image = IMAGES.player;
		this.r = 20;
		this.pos = createVector(width / 2, height - this.r * 3);
		this.lastShoot = millis();
		this.shootDelay = 100;
		this.life = 100;
		this.maxLife = 100;
	}
	hit(bullet) {
		this.life -= bullet.strength;
	}
	move(to) {
		let movingTo = createVector(0, 0);
		let amt = 3;
		switch (to) {
			case 'up':
				movingTo.add(createVector(0, -amt));
				break;
			case 'left':
				movingTo.add(createVector(-amt, 0));
				break;
			case 'down':
				movingTo.add(createVector(0, amt));
				break;
			case 'right':
				movingTo.add(createVector(amt, 0));
				break;
			default:
				console.log("Error", to);
				break;
		}
		let newpos = p5.Vector.add(this.pos, movingTo);
		if (!(newpos.x - this.r < 0 ||
				newpos.x + this.r > width ||
				newpos.y - this.r < 0 ||
				newpos.y + this.r > height))
			this.pos = newpos;
	}
	shoot() {
		if (millis() - this.lastShoot > this.shootDelay) {
			bullets.push(new Bullet(createVector(0, -this.r * 1.5).add(this.pos), createVector(0, -5)))
			this.lastShoot = millis();
		}
	}

	draw() {
		stroke(0);
		fill(lerpColor(color(255, 0, 0), color(0, 255, 0), this.life / this.maxLife));
		rect(this.pos.x - this.r * 2 / 3, this.pos.y + this.r + this.r / 10, map(this.life, 0, this.maxLife, 0, this.r * 4 / 3), this.r / 5)
		imageMode(CENTER);
		image(this.image, this.pos.x, this.pos.y, this.r * 2, this.r * 2);
	}
}

class Bullet {
	constructor(pos, vel) {
		this.pos = pos.copy();
		this.vel = vel.copy();
		this.strength = 10;
		this.r = 5;
		this.alive = true;
	}
	animate() {
		this.pos.add(this.vel);
		this.outOfScreen();
	}
	draw() {
		noStroke();
		fill(0);
		ellipseMode(CENTER);
		ellipse(this.pos.x, this.pos.y, this.r * 2)
	}
	outOfScreen() {
		if (this.pos.x + this.r < 0 ||
			this.pos.x - this.r > width ||
			this.pos.y + this.r < 0 ||
			this.pos.y - this.r > height) {
			this.alive = false;
		}
	}

}

function checkForKeyboardMovements() {
	if (keyIsDown(87)) { //w
		player.move('up');
	}
	if (keyIsDown(65)) { //a
		player.move('left');
	}
	if (keyIsDown(83)) { //s
		player.move('down');
	}
	if (keyIsDown(68)) { //d
		player.move('right');
	}
	if (keyIsDown(32)) { //space
		player.shoot();
	}
}

function gameOver() {
	background(0);
	textAlign(CENTER);
	noStroke();
	fill(255, 0, 0);
	let endGameText = "Game Over!";
	let size = min(width, height) / endGameText.length;
	textSize(size);
	text(endGameText, width / 2, height / 2);
	fill(255, 255, 0);
	text("Score: " + str(score), width / 2, height / 2 + size * 3 / 2);
	fill(0, 0, 255);
	textSize(size / 2);
	text("Press 'space' to try again", width / 2, height / 2 + size * 5 / 2);
}

function keyPressed() {
	if (player === undefined) {
		reset();
	}
	switch (keyCode) {
		case 32: //espaço
			if (player.life === 0) {
				reset();
			}
			break;
	}
}