var layers;
var circles;

function drawGasket() {
	var gask = document.getElementById("gasket");
	var ctx = gask.getContext("2d");
	var show_label = document.getElementById("show_label").checked;
	ctx.clearRect(0,0,600,600);
	var depth = document.getElementById("depth_slider").value;
	document.getElementById("depth_out").value = depth;

	drawCircle(ctx, circles[0][3], true);
	drawCircle(ctx, circles[0][0], false);
	drawCircle(ctx, circles[0][1], false);	
	drawCircle(ctx, circles[0][2], false);
	
	if(show_label) {
		ctx.textAlign = 'center';
		ctx.fillStyle = "#000000";
		ctx.font = "30px Arial";
		ctx.fillText("C4",130,565);
		var fsize = Math.min(30,circles[0][0].r)
		ctx.font = fsize.toFixed(1).toString() + "px Arial";
		ctx.fillText("C1",circles[0][0].x,circles[0][0].y + fsize/2);
		fsize = Math.min(30,circles[0][1].r)
		ctx.font = fsize.toFixed(1).toString() + "px Arial";
		ctx.fillText("C2",circles[0][1].x,circles[0][1].y + fsize/2);
		fsize = Math.min(30,circles[0][2].r)
		ctx.font = fsize.toFixed(1).toString() + "px Arial";
		ctx.fillText("C3",circles[0][2].x,circles[0][2].y + fsize/2);
	}
	for(var d = 1; d < depth; d++) {
		for(var i = 0; i < circles[d].length; i++){
			drawCircle(ctx, circles[d][i], false);
		}
	}
	
}

function already_drawn(c) {
	for(var d = 0; d < circles.length; d++) {
		for(var i = 0; i < circles[d].length; i++){
			var dist = Math.sqrt(Math.abs(Math.pow(c.x - circles[d][i].x,2) + Math.pow(c.y - circles[d][i].y,2)))
			if (dist < 0.1 && Math.abs(c.r - circles[d][i].r) < 0.1) {
				return true;
			}
		}
	}
	return false;
}

function updateRatios() {
	var r1 = document.getElementById("c1_slider").value;
	document.getElementById("c1_out").value = (1 + r1*0.1).toFixed(2);
	var r2 = document.getElementById("c2_slider").value;
	document.getElementById("c2_out").value = (1 + r2*0.1).toFixed(2);
}

// Init
window.onload = function() {
	document.getElementById("show_label").checked = true;
	document.getElementById("colour_picker").value = "FFFFFF";
	document.getElementById("depth_slider").value = 1;
	document.getElementById("depth_out").value = 1;
	document.getElementById("c1_slider").value = 0;
	document.getElementById("c1_out").value = (1.00).toFixed(2);
	document.getElementById("c2_slider").value = 0;
	document.getElementById("c2_out").value = (1.00).toFixed(2);
	genGasket();
	drawGasket();
}

function genGasket() {
	var depth = document.getElementById("depth_slider").max;
	document.getElementById("depth_out").value = 1;
	
	var r1 = document.getElementById("c1_slider").value;
	var r2 = document.getElementById("c2_slider").value;
	
	layers = new Array(depth);
	circles = new Array(depth);
	var outer_r = 279.90206;
	var c04 = makeCircle(300, 300, outer_r, -1);
	var cs = calcBase((1 + r1*0.1), (1 + r2*0.1), -outer_r);
	var c01 = cs[0];
	var c02 = cs[1];
	var c03 = cs[2];
//	var c01 = makeCircle(300, 150, 129.903, 1);
//	var c02 = makeCircle(170.096, 375, 129.903, 1);
//	var c03 = makeCircle(429.903, 375, 129.903, 1);
	
	layers[0] = [[c01,c02,c03],[c01,c02,c04],[c01,c03,c04],[c02,c03,c04]];
	circles[0] =  [c01,c02,c03,c04];
	for(var i = 1; i < depth; i++ ){
		layers[i] = [];
		circles[i] = [];
		for(var j = 0; j < layers[i-1].length; j++){
			var c1 = layers[i-1][j][0];
			var c2 = layers[i-1][j][1];
			var c3 = layers[i-1][j][2];
			var c4 = calcCircle(c1, c2, c3, 1);
			if(c4.r > 1) {
				circles[i].push(c4);
				layers[i].push([c1,c2,c4]);
				layers[i].push([c1,c3,c4]);
				layers[i].push([c2,c3,c4]);
			}
		}
	}
}

function calcCircle(c1, c2, c3, curve) {
	curve = new Complex(curve,0);
	var k1 = c1.curve/c1.r;
	var k2 = c2.curve/c2.r;
	var k3 = c3.curve/c3.r;
	var descr = k1*k2+k2*k3+k3*k1;
	descr = Math.max(descr,0);
	var k4a = k1 + k2 + k3 + curve*2*Math.sqrt(descr);
	var k4b = k1 + k2 + k3 - curve*2*Math.sqrt(descr);
	k1 = new Complex(k1,0).finalize();
	k2 = new Complex(k2,0).finalize();
	k3 = new Complex(k3,0).finalize();
	k4a = new Complex(k4a,0).finalize();
	k4b = new Complex(k4b,0).finalize();
	var z1 = new Complex(c1.x, c1.y).finalize();
	var z2 = new Complex(c2.x, c2.y).finalize();
	var z3 = new Complex(c3.x, c3.y).finalize();
	var z4a = new Complex(0,0);
	var z4b = new Complex(0,0);
	z4a = z4a.add(k1.mult(k2.mult(z1.mult(z2)))).add(k2.mult(k3.mult(z2.mult(z3)))).add(k1.mult(k3.mult(z1.mult(z3))));
	z4b = z4b.add(k1.mult(k2.mult(z1.mult(z2)))).add(k2.mult(k3.mult(z2.mult(z3)))).add(k1.mult(k3.mult(z1.mult(z3))));
	z4a = z4a.sqrt().finalize();
	z4b = z4b.sqrt().finalize();
	var z4a1 = z4a.mult(new Complex(2,0)).mult(curve);
	var z4a2 = z4a.mult(new Complex(-2,0)).mult(curve);
	var z4b1 = z4b.mult(new Complex(2,0)).mult(curve);
	var z4b2 = z4b.mult(new Complex(-2,0)).mult(curve);
	z4a1 = z4a1.add(z1.mult(k1)).add(z2.mult(k2)).add(z3.mult(k3));
	z4a2 = z4a2.add(z1.mult(k1)).add(z2.mult(k2)).add(z3.mult(k3));
	z4b1 = z4b1.add(z1.mult(k1)).add(z2.mult(k2)).add(z3.mult(k3));
	z4b2 = z4b2.add(z1.mult(k1)).add(z2.mult(k2)).add(z3.mult(k3));
	z4a1 = z4a1.divide(k4a);
	z4a2 = z4a2.divide(k4a);
	z4b1 = z4b1.divide(k4b);
	z4b2 = z4b2.divide(k4b);
	var erra1 = Math.abs(Math.sqrt(Math.pow(c1.x - z4a1.real,2) + Math.pow(c1.y - z4a1.im,2)) - (c1.curve*Math.abs(1/k4a.real) + c1.r));
	var c4a1 = makeCircle(z4a1.real, z4a1.im, Math.abs(1/k4a.real), curve.real);
	var erra2 = Math.abs(Math.sqrt(Math.pow(c1.x - z4a2.real,2) + Math.pow(c1.y - z4a2.im,2)) - (c1.curve*Math.abs(1/k4a.real) + c1.r));
	var c4a2 = makeCircle(z4a2.real, z4a2.im, Math.abs(1/k4a.real), curve.real);
	var errb1 = Math.abs(Math.sqrt(Math.pow(c1.x - z4b1.real,2) + Math.pow(c1.y - z4b1.im,2)) - (c1.curve*Math.abs(1/k4b.real) + c1.r));
	var c4b1 = makeCircle(z4b1.real, z4b1.im, Math.abs(1/k4b.real), curve.real);
	var errb2 = Math.abs(Math.sqrt(Math.pow(c1.x - z4b2.real,2) + Math.pow(c1.y - z4b2.im,2)) - (c1.curve*Math.abs(1/k4b.real) + c1.r));
	var c4b2 = makeCircle(z4b2.real, z4b2.im, Math.abs(1/k4b.real), curve.real);
	
	if( already_drawn(c4a1) ) {
		erra1 = Infinity;
	}
	if( already_drawn(c4a2) ) {
		erra2 = Infinity;
	}
	if( already_drawn(c4b1) ) {
		errb1 = Infinity;
	}
	if( already_drawn(c4b2) ) {
		errb2 = Infinity;
	}
	
	var m = Math.min(erra1, erra2, errb1, errb2);
	var c4= 0;
	if( m == erra1 ) {
		c4 = c4a1;
	} else if( m == erra2 ) {
		c4 = c4a2;
	} else if( m == errb1 ) {
		c4 = c4b1;
	} else {
		c4 = c4b2;
	}
	return c4;
}

function calcBase(r1, r2, outer) {
	var a = 1/(outer*outer);
	var b = -2*(1/(r1*outer) + 1/(r2*outer) + 1/outer);
	var c = 1 + 1/(r1*r1) + 1/(r2*r2) - 2*(1/(r1*r2) + 1/r1 + 1/r2);

	var base1 = Math.abs((-b + Math.sqrt(b*b - 4*a*c))/(2*a));
	var base2 = Math.abs((-b - Math.sqrt(b*b - 4*a*c))/(2*a));
	
	var base = Math.max(base1,base2);
	if( base > -outer ) {
		base = Math.min(base1,base2);
	}
	
	
	outer = Math.abs(outer);
	x3 = 300;
	y3 = 300 + outer - base;
	c03 = makeCircle(x3, y3, base, 1);
	a1 = (1+r1)*base;
	b1 = outer - base;
	c1 = outer - r1*base;
	theta1 = Math.PI/2 - Math.acos((-c1*c1 + a1*a1 + b1*b1)/(2*a1*b1));
	c01 = makeCircle(x3 - Math.cos(theta1)*(1+r1)*base,
		y3 - Math.sin(theta1)*(1+r1)*base, r1*base, 1);
		
	a2 = (1+r2)*base;
	b2 = outer - base;
	c2 = outer - r2*base;
	theta2 = Math.PI/2 - Math.acos((-c2*c2 + a2*a2 + b2*b2)/(2*a2*b2));
	c02 = makeCircle(x3 + Math.cos(theta2)*(1+r2)*base,
		y3 - Math.sin(theta2)*(1+r2)*base, r2*base, 1);
		
	return [c01,c02,c03];	
}

function makeCircle(x, y, r, curve){
	var circle = {
		'x': x,
		'y': y,
		'r': r,
		'curve': curve,
	};
	return circle;
}

function drawCircle(ctx, circle, bounding) {
	var colour = document.getElementById("colour_picker").value;
	ctx.beginPath();
	ctx.arc(circle.x, circle.y, circle.r,0,2*Math.PI);
	if(!bounding) {
		ctx.fillStyle = "#" + colour;
		ctx.fill();
	} else {
		ctx.fillStyle = "#FFFFFF";
		ctx.fill();
	}
	ctx.stroke();
}

// Library for Complex Numbers
// from: https://www.npmjs.org/package/Complex
var Complex = function (real, im) {
	this.real = real;
	this.im = im;
};
var prototype = Complex.prototype = {
		fromRect: function (a, b) {
			this.real = a;
			this.im = b;
			return this;
		},
		fromPolar: function (r, phi) {
			if (typeof r == 'string') {
				var parts = r.split(' ');
				r = parts[0];
				phi = parts[1];
			}
			return this.fromRect(r * Math.cos(phi), r * Math.sin(phi));
		},
		toPrecision: function (k) {
			return this.fromRect(this.real.toPrecision(k), this.im.toPrecision(k));
		},
		toFixed: function (k) {
			return this.fromRect(this.real.toFixed(k), this.im.toFixed(k));
		},
		finalize: function () {
			this.fromRect = function (a, b) {
				return new Complex(a, b);
			};
			if (Object.defineProperty) {
				Object.defineProperty(this, 'real', {
					writable: false,
					value: this.real
				});
				Object.defineProperty(this, 'im', {
					writable: false,
					value: this.im
				});
			}
			return this;
		},
		magnitude: function () {
			var a = this.real, b = this.im;
			return Math.sqrt(a * a + b * b);
		},
		angle: function () {
			return Math.atan2(this.im, this.real);
		},
		conjugate: function () {
			return this.fromRect(this.real, -this.im);
		},
		negate: function () {
			return this.fromRect(-this.real, -this.im);
		},
		multiply: function (z) {
			z = Complex.from(z);
			var a = this.real, b = this.im;
			return this.fromRect(z.real * a - z.im * b, b * z.real + z.im * a);
		},
		divide: function (z) {
			z = Complex.from(z);
			var divident = Math.pow(z.real, 2) + Math.pow(z.im, 2), a = this.real, b = this.im;
			return this.fromRect((a * z.real + b * z.im) / divident, (b * z.real - a * z.im) / divident);
		},
		add: function (z) {
			z = Complex.from(z);
			return this.fromRect(this.real + z.real, this.im + z.im);
		},
		subtract: function (z) {
			z = Complex.from(z);
			return this.fromRect(this.real - z.real, this.im - z.im);
		},
		pow: function (z) {
			z = Complex.from(z);
			var result = z.multiply(this.clone().log()).exp();
			return this.fromRect(result.real, result.im);
		},
		sqrt: function () {
			var abs = this.magnitude(), sgn = this.im < 0 ? -1 : 1;
			return this.fromRect(Math.sqrt((abs + this.real) / 2), sgn * Math.sqrt((abs - this.real) / 2));
		},
		log: function (k) {
			if (!k)
				k = 0;
			return this.fromRect(Math.log(this.magnitude()), this.angle() + k * 2 * Math.PI);
		},
		exp: function () {
			return this.fromPolar(Math.exp(this.real), this.im);
		},
		sin: function () {
			var a = this.real, b = this.im;
			return this.fromRect(Math.sin(a) * cosh(b), Math.cos(a) * sinh(b));
		},
		cos: function () {
			var a = this.real, b = this.im;
			return this.fromRect(Math.cos(a) * cosh(b), Math.sin(a) * sinh(b) * -1);
		},
		tan: function () {
			var a = this.real, b = this.im, divident = Math.cos(2 * a) + cosh(2 * b);
			return this.fromRect(Math.sin(2 * a) / divident, sinh(2 * b) / divident);
		},
		sinh: function () {
			var a = this.real, b = this.im;
			return this.fromRect(sinh(a) * Math.cos(b), cosh(a) * Math.sin(b));
		},
		cosh: function () {
			var a = this.real, b = this.im;
			return this.fromRect(cosh(a) * Math.cos(b), sinh(a) * Math.sin(b));
		},
		tanh: function () {
			var a = this.real, b = this.im, divident = cosh(2 * a) + Math.cos(2 * b);
			return this.fromRect(sinh(2 * a) / divident, Math.sin(2 * b) / divident);
		},
		clone: function () {
			return new Complex(this.real, this.im);
		},
		toString: function (polar) {
			if (polar)
				return this.magnitude() + ' ' + this.angle();
			var ret = '', a = this.real, b = this.im;
			if (a)
				ret += a;
			if (a && b || b < 0)
				ret += b < 0 ? '-' : '+';
			if (b) {
				var absIm = Math.abs(b);
				if (absIm != 1)
					ret += absIm;
				ret += 'i';
			}
			return ret || '0';
		},
		equals: function (z) {
			z = Complex.from(z);
			return z.real == this.real && z.im == this.im;
		}
	};
var alias = {
		abs: 'magnitude',
		arg: 'angle',
		phase: 'angle',
		conj: 'conjugate',
		mult: 'multiply',
		dev: 'divide',
		sub: 'subtract'
	};
for (var a in alias)
	prototype[a] = prototype[alias[a]];
var extend = {
		from: function (real, im) {
			if (real instanceof Complex)
				return new Complex(real.real, real.im);
			var type = typeof real;
			if (type == 'string') {
				if (real == 'i')
					real = '0+1i';
				var match = real.match(/(\d+)?([\+\-]\d*)[ij]/);
				if (match) {
					real = match[1];
					im = match[2] == '+' || match[2] == '-' ? match[2] + '1' : match[2];
				}
			}
			real = +real;
			im = +im;
			return new Complex(isNaN(real) ? 0 : real, isNaN(im) ? 0 : im);
		},
		fromPolar: function (r, phi) {
			return new Complex(1, 1).fromPolar(r, phi);
		},
		i: new Complex(0, 1).finalize(),
		one: new Complex(1, 0).finalize()
	};
for (var e in extend)
	Complex[e] = extend[e];
var sinh = function (x) {
	return (Math.pow(Math.E, x) - Math.pow(Math.E, -x)) / 2;
};
var cosh = function (x) {
	return (Math.pow(Math.E, x) + Math.pow(Math.E, -x)) / 2;
};
// End Library