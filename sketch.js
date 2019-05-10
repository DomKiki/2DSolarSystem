/********************* Constants *********************/

const G = 1;
const planets = 300;

/****************** Global variables *****************/

var bodies = [];
var sun, spawn,
	actionRadius = 1000;

var longestLife,
	longestBody,
	cpt       = 0, 
	cptSpawns = 0;

/********************** p5 Methods *******************/

function setup() {
	
    var canvas = createCanvas(2000, 2000);
	canvas.parent("canvas");
	
	sun   = new Body(width / 2, height / 2, 50, 1, "#FFFF00", createVector(0,0));
	spawn = new Body(width / 2, height / 2 - 200, 10, 5, "#FF1010", createVector(-2.8, 0));
	
	// instantiateBodies(100);
	
	longestLife = 0;
	bodies = new Array(planets);
	
	cptFrames = 0;
	cptSpawns = 0;
	
}

function draw() {
	
    background(0);
	
	// The Sun is not affected by Gravity (for now)
	sun.display(actionRadius, false);
	spawn.display();
	
	var d;
	for (var i = 0; i < planets; i++) {
		
		if (bodies[i] != null) {
			
			// Only attracted to the Sun (will be changed to `bodies`)
			bodies[i].attract([sun]);
			
			// Out of range of touching the sun (eventually should merge the two bodies into one
			d = bodies[i].pos.dist(sun.pos);
			if ((bodies[i].touches(sun)) || (d >= actionRadius)) {
				
				// Save the best variables for a stable orbit
				if (bodies[i].life > longestLife) {
					longestLife = bodies[i].life;
					longestBody = bodies[i].legacy().copy();
				}
				
				// Respawn an altered version of the fittest
				bodies[i] = altered(longestBody.legacy(), 5);
				cptSpawns++;
				
			}
		}
		// First spawn
		else {			
			bodies[i] = altered(spawn, 20);
			cptSpawns++;
			// First instance of longestBody
			if (longestBody == null)
				longestBody = bodies[i];
		}
		
		// Apply forces and show
		bodies[i].update(100);
		bodies[i].display();
		
	}
		
	this.showInfos(longestBody);
	
	cptFrames++;
}

/************************ Data ***********************/

function instantiateBodies(amount, minR=1, maxR=10) {
	
	bodies = [];
	
	var r, dis, pos,
		d, v, 
		maxV = 10;
		c = "#42FFFF",
		step   = (2 * PI) / amount,
		center = createVector(width / 2, height / 2);
		
	for (var i = 0; i < amount; i++) {
		// Value generation
		r   = random(minR, maxR);
		dis = random(50, 600);
		pos = polarCoords(center, sun.rad + dis, i * step);
		d   = random(2,6);
		v   = createVector(random(-maxV,maxV), random(-maxV,maxV));
		// Instantiations
		bodies.push(new Body(pos.x, pos.y, r, d, c, v));
	}
		
}

function polarCoords(p, r, angle) {
	return {
		x: p.x + r * cos(angle),
		y: p.y + r * sin(angle)
	}
}

function altered(ref, max) {
	
	var alt = ref.copy();

	alt.col = "#FFFFFF";
	alt.oVel = alt.vel;
	alt.vel.add(createVector(random(-max,max), random(-max,max)));
	
	alt.rad  += random(-max,max);
	if (alt.rad < 0) alt.rad = 0.1;
	alt.dens += random(-max,max);
	if (alt.dens < 0) alt.dens = 0.1;
	
	return alt;
}

/*********************** Display *********************/

function showInfos(f) {
	fill(255);
	noStroke();
	textSize(20);
	text("Spawns\t\t" + cptSpawns +
		 "\r\nFittest" + 
		 "\r\n\t- Lifespan\t\t\t"  + f.oLife + " frames" +
		 "\r\n\t- Position\t\t\t(" + nfc(f.oPos.x, 2) + ", " + nfc(f.oPos.y, 2) + ")" +
		 "\r\n\t- Velocity\t\t\t(" + nfc(f.oVel.x, 2) + ", " + nfc(f.oVel.y, 2) + ")" +
		 "\r\n\t- Radius\t\t\t"    + nfc(f.rad, 2) +
		 "\r\n\t- Density\t\t\t"   + nfc(f.dens, 2),
		 width-350, 20, 400, 500);
}