class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
    }

    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
    }

    multiply(n) {
        this.x *= n;
        this.y *= n;
    }

    divide(n) {
        this.x /= n;
        this.y /= n;
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        let m = this.magnitude();
        if (m > 0) {
            this.divide(m);
        }
    }

    limit(max) {
        let m = this.magnitude();
        if (m > max) {
            this.divide(m / max);
        }
    }
    distance(v) {
        let dx = this.x - v.x;
        let dy = this.y - v.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}


class Boid {
    constructor(x, y, speed, direction) {
        this.position = new Vector(x, y);
        this.velocity = new Vector(Math.cos(direction) * speed, Math.sin(direction) * speed);
        this.acceleration = new Vector(0, 0);
    }
    edges() {
        if (this.position.x > canvas.width) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = canvas.width;
        }
        if (this.position.y > canvas.height) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = canvas.height;
        }
    }

    update(boids) {
        this.separation(boids);
        this.alignment(boids);
        this.cohesion(boids);
        this.edges();
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.acceleration.multiply(0);
    }

    separation(boids) {
        let desiredSeparation = 100; // desired seperation
        let steer = new Vector(0, 0);
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            let d = this.position.distance(boids[i].position);
            if ((d > 0) && (d < desiredSeparation)) {
                let diff = new Vector(0, 0);
                diff.x = this.position.x - boids[i].position.x;
                diff.y = this.position.y - boids[i].position.y;
                diff.normalize();
                diff.divide(d);
                steer.add(diff);
                count++;
            }
        }
        if (count > 0) {
            steer.divide(count);
        }
        if (steer.magnitude() > 0) {
            steer.normalize();
            steer.multiply(maxSpeed);
            steer.subtract(this.velocity);
            steer.limit(maxForce);
        }
        this.acceleration.add(steer);
    }

    alignment(boids) {
        let neighbordist = 50; // change range of average direction
        let sum = new Vector(0, 0);
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            let d = this.position.distance(boids[i].position);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(boids[i].velocity);
                count++;
            }
        }
        if (count > 0) {
            sum.divide(count);
            sum.normalize();
            sum.multiply(maxSpeed);
            let steer = new Vector(0, 0);
            steer.x = sum.x - this.velocity.x;
            steer.y = sum.y - this.velocity.y;
            if (steer.x !== 0 || steer.y !== 0) {
                steer.limit(maxForce);
            }
            this.acceleration.add(steer);
        }
    }


    cohesion(boids) {
        let neighbordist = 50; // change how far they wil be atracted to other boids
        let sum = new Vector(0, 0);
        let count = 0;
        for (let i = 0; i < boids.length; i++) {
            let d = this.position.distance(boids[i].position);
            if ((d > 0) && (d < neighbordist)) {
                sum.add(boids[i].position);
                count++;
            }
        }
        if (count > 0) {
            sum.divide(count);
            let desired = new Vector(0, 0);
            desired.x = sum.x - this.position.x;
            desired.y = sum.y - this.position.y;
            if (desired.x !== 0 || desired.y !== 0) {
                desired.normalize();
                desired.multiply(maxSpeed);
                let steer = new Vector(desired.x, desired.y);
                steer.limit(maxForce);
                this.acceleration.add(steer);
            }
        }
    }
}


// Create a canvas and a drawing context
const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');


// rezise canvas
canvas.width = window.innerWidth * 0.7;
canvas.height = window.innerHeight * 0.7;



const maxSpeed = 1; // change max speed
const maxForce = 0.5; // change turning speed/force

// Create a new boid and add it to the boids array
let boids = [];
for (let i = 0; i < 1000; i++) {
    boids.push(new Boid(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2 - 1, Math.random() * 2 * Math.PI));
}


// Animation loop
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < boids.length; i++) {
        boids[i].update(boids);
        ctx.fillStyle = 'purple'
        ctx.beginPath();
        ctx.arc(boids[i].position.x, boids[i].position.y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }
}

window.onload = function() {animate(); }








