function drawGasket(depth) {
	var gask = document.getElementById("gasket");
	var ctx = gask.getContext("2d");
	ctx.clearRect(0,0,600,600);
	//var depth_radios = document.getElementsByName("depth");
	// var depth;
	// for(var i = 0; i < depth_radios.length; i++) {
		// if(depth_radios[i].type === 'radio' && radios[i].checked) {
			// depth = depth_radios[i].value;
		// }
	// }
	
	var layers = new Array(depth);
	var c01 = makeCircle(300, 150, 129.903, 1);
	var c02 = makeCircle(170.096, 375, 129.903, 1);
	var c03 = makeCircle(429.903, 375, 129.903, 1);
	drawCircle(ctx, c01);
	drawCircle(ctx, c02);
	drawCircle(ctx, c03);
	var c04 = makeCircle(300, 300, 279.90206, -1);
	drawCircle(ctx, c04);
	layers[0] = [[c01,c02,c03],[c01,c02,c04],[c01,c03,c04],[c02,c03,c04]];
	for(var i = 1; i < depth; i++ ){
		layers[i] = [];
		var toDraw = [];
		for(var j = 0; j < layers[i-1].length; j++){
			var c1 = layers[i-1][j][0];
			var c2 = layers[i-1][j][1];
			var c3 = layers[i-1][j][2];
			var c4 = calcCircle(c1, c2, c3, 1);
			if(c4.r > 0.5) {
				toDraw.push(c4);
				layers[i].push([c1,c2,c4]);
				layers[i].push([c1,c3,c4]);
				layers[i].push([c2,c3,c4]);
			}
		}
		for(var d = 0; d < toDraw.length; d++) {
			drawCircle(ctx, toDraw[d]);
		}
	}
}

function calcCircle(c1, c2, c3, curve) {
	curve = new Complex(curve,0);
	var k1 = c1.curve/c1.r;
	var k2 = c2.curve/c2.r;
	var k3 = c3.curve/c3.r;
	var k4 = k1 + k2 + k3 + curve*2*Math.sqrt(k1*k2+k2*k3+k3*k1);
	k1 = new Complex(k1,0).finalize();
	k2 = new Complex(k2,0).finalize();
	k3 = new Complex(k3,0).finalize();
	k4 = new Complex(k4,0).finalize();
	var z1 = new Complex(c1.x, c1.y).finalize();
	var z2 = new Complex(c2.x, c2.y).finalize();
	var z3 = new Complex(c3.x, c3.y).finalize();
	var z4 = new Complex(0,0);
	z4 = z4.add(k1.mult(k2.mult(z1.mult(z2)))).add(k2.mult(k3.mult(z2.mult(z3)))).add(k1.mult(k3.mult(z1.mult(z3))));
	z4 = z4.sqrt().finalize();
	z4a = z4.mult(new Complex(2,0)).mult(curve);
	z4a = z4a.add(z1.mult(k1)).add(z2.mult(k2)).add(z3.mult(k3));
	z4a = z4a.divide(k4);
	var c4 = makeCircle(z4a.real, z4a.im, Math.abs(1/k4.real), curve.real);
	var dist = Math.sqrt(Math.pow(c1.x - c4.x,2) + Math.pow(c1.y - c4.y,2));
	if (Math.abs(dist - (c1.curve*c4.r + c1.r)) > 0.1) {
		z4b = z4.mult(new Complex(-2,0)).mult(curve);
		z4b = z4b.add(z1.mult(k1)).add(z2.mult(k2)).add(z3.mult(k3));
		z4b = z4b.divide(k4);
		var c4 = makeCircle(z4b.real, z4b.im, Math.abs(1/k4.real), curve.real);
	}
	return c4;
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

function drawCircle(ctx, circle) {
	ctx.beginPath();
	ctx.arc(circle.x, circle.y, circle.r,0,2*Math.PI);
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