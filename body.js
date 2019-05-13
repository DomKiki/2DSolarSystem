class Body {
	
	constructor(p, r, d, c, v, l=0) {
		
		this.pos   = p.copy();
		this.oPos  = p.copy();
		
		this.rad   = r;
		this.dens  = d;
		this.mass  = this.updateMass();
		
		this.vel   = v.copy();
		this.oVel  = v.copy();
		
		this.acc   = createVector(0,0); 
		this.maxA  = 1;
		
		this.col   = c;
		this.oCol  = color(red(this.col), green(this.col), blue(this.col));
		
		this.life  = l;
		this.oLife = l;
		
		this.f   = [];
		
	}
	
	attract(bodies) {
		
		this.f = [];
		
		var r, force, v,
			resultF, resultA;
		
		for (var b of bodies)
			if (b != this) {	
				// F = G(m1*m2)/r2
				r     = b.pos.dist(this.pos);
				force = (G * this.mass * b.mass) / pow(r,2);
				v     = p5.Vector.sub(this.pos, b.pos);
				v.setMag(force);
				this.f.push(v);
			}
								
		resultF = createVector();
		for (var f of this.f)
			resultF.add(f);
		if (this.f.length > 1)
			resultF.div(this.f.length);
		// F=m*a <=> a=F/m
		var resultA = resultF.div(this.mass).limit(this.maxA);
		this.acc.sub(resultA);
				
	}
	
	touches(body) { return (this.pos.dist(body.pos) <= (this.rad + body.rad)); }
		
	// Wrap universe on itself
	bound() {
		this.pos.x = (this.pos.x + width)  % width;
		this.pos.y = (this.pos.y + height) % height;
	}
	
	inBounds() { return ((this.pos.x >= 0) && (this.pos.x < width) && (this.pos.y >= 0) && (this.pos.y < height)); }
	
	updateMass() { return this.mass = PI * pow(this.rad, 2) * this.dens; }
	
	update(lightRate=100) {

		// Update position (bounded) and velocity
		this.pos.add(this.vel);
		
		// Somehow this.vel.add(l) would write over oVel so we'll resort to this fix
		var l    = this.acc.limit(this.maxA);
		this.vel = createVector(this.vel.x + l.x, this.vel.y + l.y);
		
		// Reset acceleration
		this.acc = createVector();
		
		this.life++;
		this.lighten(lightRate, color("#1010F0"));
		
	}
	
	lighten(mod, dest) { 
	
		if ((this.life % mod) == 0) {
			
			// Deltas toward dest
			var dR = 0,
				dG = 0,
				dB = 0;
			if      (red(this.col)   < red(dest))   dR = 1;
			else if (red(this.col)   > red(dest))   dR = -1;
			if      (green(this.col) < green(dest)) dG = 1;
			else if (green(this.col) > green(dest)) dG = -1;
			if      (blue(this.col)  < blue(dest))  dB = 1;
			else if (blue(this.col)  > blue(dest))  dB = -1;
			
			// Apply deltas
			var r = red(this.col)   + dR,
				g = green(this.col) + dG,
				b = blue(this.col)  + dB;		
			this.col = color(r,g,b); 
			
		}
	}
	
	display(actionR=null, forces=false) {
		
		// Body
		strokeWeight(1);
		fill(this.col);
		stroke(this.col);
		ellipse(this.pos.x, this.pos.y, 2 * this.rad);
		
		// Action Radius
		if (actionR != null) {
			fill  (red(this.col), green(this.col), blue(this.col), 20);
			stroke(red(this.col), green(this.col), blue(this.col), 60);
			ellipse(this.pos.x, this.pos.y, 2 * actionR);
		}
		
		// Forces
		if (forces) {
			var dst;
			for (var f of this.f) {
				dst = p5.Vector.sub(this.pos, f);
				stroke(255, 255, 255, this.pos.dist(dst) / 10);
				line(this.pos.x, this.pos.y, dst.x, dst.y);
			}
		}
	}
	
	// Revert to legacy values
	legacy() {
		this.pos  = this.oPos.copy();
		this.vel  = this.oVel.copy();
		this.life = 0;
		this.col  = this.oCol;
		this.acc  = createVector(0,0);
		return this;
	}
	
	// Update legacy values
	updateLegacy() {
		this.oPos  = this.pos.copy();
		this.oVel  = this.vel.copy();
		this.oLife = this.life;
	}
	
	copy() { 
		var b  = new Body(this.pos.copy(), this.rad, this.dens, this.col, this.vel.copy(), this.life); 
		b.oPos = this.oPos.copy();
		b.oVel = this.oVel.copy();
		b.oCol = this.oCol;
		b.acc  = createVector(0,0);
		return b;
	}

}