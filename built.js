(function (modules, global) {
    var cache = {}, require = function (id) {
            var module = cache[id];
            if (!module) {
                module = cache[id] = {};
                var exports = module.exports = {};
                modules[id].call(exports, require, module, exports, global);
            }
            return module.exports;
        };
    require('0');
    require('1');
}({
    '0': function (require, module, exports, global) {
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
        module.exports = Complex;
    },
    '1': function (require, module, exports, global) {
        var Complex = null;
        function drawGasket() {
            var gask = document.getElementById('gasket');
            var ctx = gask.getContext('2d');
            var depth = 3;
            var layers = new Array(depth);
            var c1 = makeCircle(300, 150, 129.903);
            var c2 = makeCircle(170.096, 375, 129.903);
            var c3 = makeCircle(429.903, 375, 129.903);
            drawCircle(ctx, c1);
            drawCircle(ctx, c2);
            drawCircle(ctx, c3);
            var c4 = calcCircle(c1, c2, c3, -1);
            drawCircle(ctx, c4);
        }
        function calcCircle(c1, c2, c3, curve) {
            myComplex = new Complex();
            var k1 = 1 / c1.r;
            var k2 = 1 / c2.r;
            var k3 = 1 / c3.r;
            var k4 = k1 + k2 + k3 + curve * 2 * Math.sqrt(k1 * k2 + k2 * k3 + k3 * k1);
            var z1 = new Complex(c1.x, c1.y);
            var z2 = new Complex(c2.x, c2.y);
            var z3 = new Complex(c3.x, c3.y);
            var z4 = (z1 * k1 + z2 * k2 + z3 * k3 + curve * myComplex.sqrt(k1 * k2 * z1 * z2 + k2 * k3 * z2 * z3 + k1 * k3 * z1 * z3)) / k4;
            var c4 = makeCircle(z4.real, z4.im, Math.abs(1 / k4));
            return c4;
        }
        function makeCircle(x, y, r) {
            var circle = {
                    'x': x,
                    'y': y,
                    'r': r
                };
            return circle;
        }
        function drawCircle(ctx, circle) {
            ctx.beginPath();
            ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }
}, this));
