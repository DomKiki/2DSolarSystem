/********************* Constants *********************/

const canvasSize       = 1200;
const spawnRadiusRange = { min: 1, max: 100 };

const INIT_NONE        = -1,
	  INIT_SPAWN_POS   = 0,
	  INIT_SPAWN_VEL   = 1,
	  INIT_DONE        = 2;
	  
const RATIO_TRACE_VEL  = 50;

const instructionsSize = [800, 300];

/****************** Global variables *****************/

var bodies = [];
var sun, sunRadius, sunDens, actionRadius,
	spawn, spawnRadius = 20, spawnDens = 5, spawnVel;

var G = 1,
	rangeV, rangeR, rangeD,
	alter = 1, alterRate, spawnsPerGen, maxBodies, autoGen;
	
var longestLife, fittestBody,
	cptSpawns = 0, 
	cptGen    = 0;
	
var divOptions, divButtons;
	
var sldG,    sldRangeV,    sldRangeR,    sldRangeD,    sldActionRad,    sldAlter,    sldSpawnsPerGen,    sldMaxBodies,    sldSunRad,    sldSunDens,
	sldGTxt, sldRangeVTxt, sldRangeRTxt, sldRangeDTxt, sldActionRadTxt, sldAlterTxt, sldSpawnsPerGenTxt, sldMaxBodiesTxt, sldSunRadTxt, sldSunDensTxt;
	
var btnGen, btnAutoGen;

var init = 0;

/********************** p5 Methods *******************/

function setup() {
	
    var canvas = createCanvas(canvasSize, canvasSize);
	canvas.parent("canvas");
	canvas.mousePressed(pressCanvas);
	
	initSliders();
	initButtons();
	
	sun = new Body(createVector(width / 2, height / 2), sunRadius, sunDens, "#FFFF00", createVector(0, 0));
	
}

function draw() {
	
    background(0);
	
	// The Sun is not affected by Gravity (for now)
	this.updateSun();
	sun.display(actionRadius, false);
	
	// Init (user input
	if (init != INIT_NONE) {
		showInstructions(instructionsSize);
		if (init == INIT_SPAWN_POS) {
			fill(255,0,0);
			ellipse(mouseX, mouseY, spawnRadius * 2);
		}
		else if (init >= INIT_SPAWN_VEL) {
			spawn.display();
			this.traceSpawnVel();
		}
	}
	
	if (cptGen > 0) {
			
		if ((bodies.length == 0) && (autoGen)) {
			this.newGeneration();
			return;
		}
		
		var show,
			d, i = -1;
		while (i++ < bodies.length) {
			
			show = true;
			if (bodies[i] != null) {
				
				// Only attracted to the Sun (will be changed to `bodies`)
				bodies[i].attract([sun]);
				
				// Out of range of touching the sun (eventually should merge the two bodies into one
				d = bodies[i].pos.dist(sun.pos);
				if ((bodies[i].touches(sun)) || (d >= actionRadius)) {
					
					// Save the best variables for a stable orbit
					if (bodies[i].life > longestLife) {
						longestLife = bodies[i].life;
						fittestBody = bodies[i].copy();
					}
					
					// Respawn an altered version of the fittest
					if (cptSpawns < spawnsPerGen) {
						bodies[i] = altered(spawn, alter);
						cptSpawns++;
					}
					// Delete it
					else {
						bodies.splice(i--, 1);
						show = false;
					}
					
				}
			}
			
			else {	
			
				// First spawn
				if ((i < maxBodies) && (cptSpawns < spawnsPerGen)) {
					bodies[i] = altered(spawn, alter);
					cptSpawns++;
				}
				else
					show = false;
				
			}
			
			// Apply forces and show
			if (show) {
				bodies[i].update(100);
				bodies[i].display();
			}
			
		}
		
		// Display informations
		this.showInfos(fittestBody);
		
	}		
	
}

function mouseWheel(event) {
	if (init == 0) {
		spawnRadius -= (event.delta / 20);
		if (spawnRadius < spawnRadiusRange.min)
			spawnRadius = spawnRadiusRange.min;
		if (spawnRadius > spawnRadiusRange.max)
			spawnRadius = spawnRadiusRange.max;
		return false;
	}
}

function pressCanvas(event) {
	
	switch (init) {
		
		case INIT_SPAWN_POS:
			init  = INIT_SPAWN_VEL;
			spawn = new Body(createVector(mouseX, mouseY), spawnRadius, spawnDens, "#FF1010", createVector(0,0));
			break;
			
		case INIT_SPAWN_VEL:
			spawnVel    = p5.Vector.sub(createVector(mouseX, mouseY), spawn.pos);
			spawnVel.div(RATIO_TRACE_VEL);
			spawn       = new Body(spawn.pos.copy(), spawnRadius, spawnDens, "#FF1010", spawnVel.copy());
			fittestBody = spawn.copy();
			init        = INIT_DONE;
			break;
			
		default: 
			break;
	}	
}

/************************ Data ***********************/

function altered(ref, fact) {
	
	var v = rangeV * alter,
		r = rangeR * alter,
		d = rangeD * alter;
		
	var alt  = ref.copy().legacy();
	alt.pos.add(createVector(random(-v, v), random(-v, v)));
	alt.vel.add(createVector(random(-v, v), random(-v, v)));
	alt.rad  = abs(alt.rad  + random(-r, r));
	alt.dens = abs(alt.dens + random(-d, d));
	alt.col  = "#FFFFFF";
	alt.updateLegacy();
	
	return alt;
}

function newGeneration() {
	
	// Reset
	init        = -1;
	cptSpawns   = 0;
	longestLife = 0;
	alter       = pow((1 - alterRate), ++cptGen);
	bodies      = new Array(maxBodies);
	spawn       = fittestBody.copy();
	fittestBody = spawn;
	
}

/*********************** Sliders *********************/

function initSliders() {
	
	sldG            = makeSlider(0,    5,       1,       0.05, select("#sldG"),            updateG);
	sldRangeV       = makeSlider(0,    10,      5,       0.1,  select("#sldRangeV"),       updateV);
	sldRangeR       = makeSlider(0,    15,      5,       0.1,  select("#sldRangeR"),       updateR);
	sldRangeD       = makeSlider(0,    10,      5,       0.1,  select("#sldRangeD"),       updateD);
	sldMaxBodies    = makeSlider(1,    1000,    500,     1,    select("#sldMaxBodies"),    updateMaxBodies);
	sldAlter        = makeSlider(0,    1,       0.5,     0.01, select("#sldAlterRate"),    updateAlterRate);
	sldSpawnsPerGen = makeSlider(1000, 100000,  1000,    1000, select("#sldSpawnsPerGen"), updateSpawnsPerGen);
	
	sldSunRad       = makeSlider(10,   500,     50,      10,   select("#sldSunRad"),       updateSunRad);
	sldSunDens      = makeSlider(1,    100,     1,       1,    select("#sldSunDens"),      updateSunDens);
	sldActionRad    = makeSlider(100,  2*width, width/2, 10,   select("#sldActionRad"),    updateActionRad);
	
	sldGTxt            = select("#sldGTxt");
	sldRangeVTxt       = select("#sldRangeVTxt");
	sldRangeRTxt       = select("#sldRangeRTxt");
	sldRangeDTxt       = select("#sldRangeDTxt");
	sldMaxBodiesTxt    = select("#sldMaxBodiesTxt");
	sldAlterTxt        = select("#sldAlterRateTxt");
	sldSpawnsPerGenTxt = select("#sldSpawnsPerGenTxt");
	
	sldActionRadTxt    = select("#sldActionRadTxt");
	sldSunRadTxt       = select("#sldSunRadTxt");
	sldSunDensTxt      = select("#sldSunDensTxt");
	
	this.updateG();
	this.updateV();
	this.updateR();
	this.updateD();
	this.updateMaxBodies();
	this.updateAlterRate();
	this.updateSpawnsPerGen();
	
	this.updateActionRad();
	this.updateSunRad();
	this.updateSunDens();
	
}

function makeSlider(min, max, value, step, par, callback=null) {
	var sld = createSlider(min, max, value, step).parent(par);
	if (callback)
		  sld.input(callback);
	return sld;
}

function updateG() { 
	G = sldG.value(); 
	sldGTxt.html("G (" + sldG.value() + ")");
}
function updateV() { 
	rangeV = sldRangeV.value(); 
	sldRangeVTxt.html("ΔVel (± " + rangeV + ")");
}
function updateR() { 
	rangeR = sldRangeR.value(); 
	sldRangeRTxt.html("ΔRad (± " + rangeR + ")");
}
function updateD() { 
	rangeD = sldRangeD.value(); 
	sldRangeDTxt.html("ΔDen (± " + rangeD + ")");
}
function updateMaxBodies() {
	maxBodies = sldMaxBodies.value();
	sldMaxBodiesTxt.html("Max Bodies (" + maxBodies + ")");
}
function updateAlterRate() { 
	alterRate = sldAlter.value(); 
	sldAlterTxt.html("Alteration Rate (" + alterRate + ")");
}
function updateSpawnsPerGen() {
	spawnsPerGen = sldSpawnsPerGen.value();
	sldSpawnsPerGenTxt.html("Spawns per Gen (" + spawnsPerGen + ")");
}
function updateSunRad() {
	sunRadius = sldSunRad.value();
	sldSunRadTxt.html("Sun Radius (" + sunRadius + ")");
}
function updateSunDens() {
	sunDens = sldSunDens.value();
	sldSunDensTxt.html("Sun Density (" + sunDens + ")");
}
function updateActionRad() { 
	actionRadius = sldActionRad.value(); 
	sldActionRadTxt.html("Action Radius (" + actionRadius + ")");
}

/*********************** Buttons *********************/

function initButtons() {
	
	btnGen     = makeButton("Generation",      select("#btnNextGen"), newGeneration);
	btnAutoGen = makeButton("Auto-Generation", select("#btnAutoGen"), pressAutoGen);
	
}

function makeButton(txt, par, callback=null) {
	var btn = createButton(txt).parent(par);
	if (callback)
		  btn.mousePressed(callback);
	return btn;
}

function pressAutoGen() {
	autoGen = !autoGen;
	btnAutoGen.style("border-style", (autoGen) ? "inset" : "outset");
}

/*********************** Display *********************/

function traceSpawnVel() {

	var dst = (init == 1) ? createVector(mouseX, mouseY) : p5.Vector.add(spawn.pos, p5.Vector.mult(spawnVel, RATIO_TRACE_VEL));
	var d = p5.Vector.dist(createVector(spawn.pos.x, spawn.pos.y), dst);
	var r = map(d, 0, width / 2, 0, 255),
		g = map(d, 0, width / 2, 255, 0);
	stroke(r, g, 100);
	line(spawn.pos.x, spawn.pos.y, dst.x, dst.y);
	
}

function updateSun() {
	sun.rad  = sldSunRad.value();
	sun.dens = sldSunDens.value();
}

function showInstructions(size) {
	
	fill(255, 255, 255, 80);
	noStroke();
	textSize(40);
	
	var str = "";
	switch (init) {
		case INIT_SPAWN_POS:
			str += "First, we need a Spawning point !\nScroll to setup its size, then click in the Action Radius to locate it !";
			break;
		case INIT_SPAWN_VEL:
			str += "Good ! Now, choose the initial spawning velocity. Be careful not to overshoot !";
			break;
		case INIT_DONE:
			str += "Excellent ! You are now ready to generate your first batch of planets ! If you feel like it, you can tweak the settings below at any time. Good luck !";
	}		
	
	textAlign(CENTER, CENTER);
	text(str, width/2 - size[0]/2, height/2 - size[1]/2 - 200, size[0], size[1]);
	
}

function showInfos(f) {
	
	fill(255, 255, 255, 80);
	noStroke();
	textSize(20);
	textAlign(LEFT, BASELINE);
	
	// Previous Generation
	var prev = new Body(spawn.oPos.copy(), spawn.rad, spawn.dens, spawn.col, spawn.oVel.copy(), spawn.oLife);
	var str  = "";
	if (cptGen == 1)
		str += "Original spawn\r\n";
	else
		str += "Previous Generation\r\n" +
			   "\r\n\t- Lifespan\t\t\t"  + prev.oLife + " frames";			   
	str +=     "\r\n\t- Position\t\t\t"  + nfc(prev.pos.x, 2) + ", " + nfc(prev.pos.y, 2) +
			   "\r\n\t- Velocity\t\t\t"  + nfc(prev.vel.x, 2) + ", " + nfc(prev.vel.y, 2) +
			   "\r\n\t- Radius\t\t\t"    + nfc(prev.rad,   2) +
			   "\r\n\t- Density\t\t\t"   + nfc(prev.dens,  2);
	text(str, 20, 20, 400, 500);
	
	// Current Generation
	text("Generation #"   + cptGen +
		 "\r\n\tAlteration\t\t" + nfc(alter * 100, 2) + "%" +
		 "\r\n\tSpawns\t\t\t" + cptSpawns +
		 "\r\n\tFittest" + 
		 "\r\n\t\t- Lifespan\t\t\t"  + f.oLife + " frames" +
		 "\r\n\t\t- Position\t\t\t"  + nfc(f.oPos.x, 2) + ", " + nfc(f.oPos.y, 2) +
		 "\r\n\t\t- Velocity\t\t\t"  + nfc(f.oVel.x, 2) + ", " + nfc(f.oVel.y, 2) +
		 "\r\n\t\t- Radius\t\t\t"    + nfc(f.rad,    2) +
		 "\r\n\t\t- Density\t\t\t"   + nfc(f.dens,   2),
		 width - 300, 20, 400, 500);
}