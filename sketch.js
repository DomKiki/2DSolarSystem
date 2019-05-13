/****************** Global variables *****************/

var canvasSize = 1200;

var bodies = [];
var sun, spawn,
	sunRadius, sunDens, actionRadius;

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

/********************** p5 Methods *******************/

function setup() {
	
    var canvas = createCanvas(canvasSize, canvasSize);
	canvas.parent("canvas");
	
	initSliders();
	initButtons();
	
	sun         = new Body(createVector(width / 2,       height / 2),       sldSunRad, sldSunDens, "#FFFF00", createVector(0,  0));
	fittestBody = new Body(createVector(width / 2 - 300, height / 2 - 500), 10,        5,          "#FF1010", createVector(-6, 3));
	spawn       = fittestBody.copy();
	
}

function draw() {
	
    background(0);
	
	// The Sun is not affected by Gravity (for now)
	this.updateSun();
	sun.display(actionRadius, false);
	spawn.display();
	
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

/************************ Data ***********************/

function altered(ref, fact) {
	
	var v = rangeV * alter,
		r = rangeR * alter,
		d = rangeD * alter;
		
	var alt  = ref.copy();
	alt.col  = "#FFFFFF";
	alt.pos  = p5.Vector.add(ref.oPos, createVector(random(-v, v), random(-v, v)));
	alt.vel  = p5.Vector.add(ref.oVel, createVector(random(-v, v), random(-v, v)));
	alt.rad  = abs(alt.rad  + random(-r, r));
	alt.dens = abs(alt.dens + random(-d, d));
	alt.updateLegacy();
	
	return alt;
}

function newGeneration() {
	
	// Reset
	cptSpawns   = 0;
	longestLife = 0;
	alter       = pow((1 - alterRate), cptGen++);
	bodies      = new Array(maxBodies);
	spawn       = fittestBody.copy().legacy();
	
}

/*********************** Sliders *********************/

function initSliders() {
	
	sldG            = makeSlider(0,    5,       1,       0.05, select("#sldG"),            updateG);
	sldRangeV       = makeSlider(0,    10,      5,       0.1,  select("#sldRangeV"),       updateV);
	sldRangeR       = makeSlider(0,    15,      5,       0.1,  select("#sldRangeR"),       updateR);
	sldRangeD       = makeSlider(0,    10,      5,       0.1,  select("#sldRangeD"),       updateD);
	sldMaxBodies    = makeSlider(1,    1000,    500,     1,    select("#sldMaxBodies"),    updateMaxBodies);
	sldAlter        = makeSlider(0,    1,       0.1,     0.01, select("#sldAlterRate"),    updateAlterRate);
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

function updateSun() {
	sun.rad  = sldSunRad.value();
	sun.dens = sldSunDens.value();
}

function showInfos(f) {
	
	fill(255);
	noStroke();
	textSize(20);
	
	// Previous Generation
	if (cptGen > 1)
		text("Previous Generation\r\n\r\n" +
			 "\r\n\t- Lifespan\t\t\t"  + spawn.oLife + " frames" +
			 "\r\n\t- Position\t\t\t"  + nfc(spawn.oPos.x, 2) + ", " + nfc(spawn.oPos.y, 2) +
			 "\r\n\t- Velocity\t\t\t"  + nfc(spawn.oVel.x, 2) + ", " + nfc(spawn.oVel.y, 2) +
			 "\r\n\t- Radius\t\t\t"    + nfc(spawn.rad,    2) +
			 "\r\n\t- Density\t\t\t"   + nfc(spawn.dens,   2),
			 width - 600, 20, 400, 500);
	
	// Current Generation
	text("Generation #"   + cptGen +
		 "\r\nSpawns\t\t" + cptSpawns +
		 "\r\nFittest" + 
		 "\r\n\t- Lifespan\t\t\t"  + f.oLife + " frames" +
		 "\r\n\t- Position\t\t\t"  + nfc(f.oPos.x, 2) + ", " + nfc(f.oPos.y, 2) +
		 "\r\n\t- Velocity\t\t\t"  + nfc(f.oVel.x, 2) + ", " + nfc(f.oVel.y, 2) +
		 "\r\n\t- Radius\t\t\t"    + nfc(f.rad,    2) +
		 "\r\n\t- Density\t\t\t"   + nfc(f.dens,   2),
		 width - 300, 20, 400, 500);
}