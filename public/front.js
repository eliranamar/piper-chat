var opts = {
	hexLayers: 10,
	circumradius: 30,
	rotSpeed: .1,
	waveSpeed: 3,
	fogStart: 100,
	fogEnd: 9.5 * 30 * Math.sqrt(3),
	distWaveTimePower: 1.8,
	distWaveTimeMult: .12,
	distWaveHeightPower: 2,
	distWaveHeightMult: .2,
	amplitude: 150,
	zOffset: 100,
	postMult: 200,
	preTranslation: new Point2D(0, -200),
	rotationX: Math.PI * .3
};
// Precomputations
var doubleInradius = Math.sqrt(3) * opts.circumradius,
	fogLength = opts.fogEnd - opts.fogStart;
// Compensate float error in point equality detection
var precision = 1e-10;

var c = document.getElementById('c'),
	ctx = c.getContext('2d');

function resize()
{
	c.width = c.offsetWidth;
	c.height = c.offsetHeight;
	ctx.translate(c.width *.5, c.height * .5);
	ctx.globalCompositeOperation = 'lighter';
}
window.addEventListener('resize', resize);
resize();

var angleOffset = 0;
var angleOffsetGoal = 0;
c.addEventListener('mousemove', function(e){
	angleOffsetGoal = Math.PI * (.5 - e.clientX / c.width);
});

function Point2D(x, y)
{
	this.x = x;
	this.y = y;
	this._norm = undefined;
	return this;
}
Point2D.prototype.equals = function(obj)
{
	return Math.abs(this.x - obj.x) < precision && Math.abs(this.y - obj.y) < precision;
};
Point2D.prototype.norm = function(angle)
{
	if(this._norm === undefined)
		this._norm = Math.sqrt(this.x * this.x + this.y * this.y);
	return this._norm;
};
Point2D.prototype.add = function(p)
{
	return new Point2D(this.x + p.x, this.y + p.y);
};
Point2D.prototype.multiply = function(n)
{
	return new Point2D(this.x * n, this.y * n);
};
Point2D.prototype.rotate = function(angle)
{
	var l = this.norm(),
		a = Math.atan2(this.y, this.x) + angle;
	return new Point2D(l * Math.cos(a), l * Math.sin(a));
};
Point2D.prototype.fakeRotateX = function(z, angle)
{
	var l = Math.sqrt(this.y * this.y + z * z),
		a = Math.atan2(this.y, z) + angle;
	var newZ = l * Math.cos(a);
	var newP = new Point2D(this.x / newZ, l * Math.sin(a) / newZ);
	newP.z = newZ;
	return newP;
};

var basePoints = [];
var lines = [];
// Populate base points array
(function()
{
	function getIndex(a, e)
	{
		for(var i = 0, l = a.length; i < l; i++)
			if(a[i].equals(e))
				return i;
		return a.push(e) - 1;
	}
	var PI3 = Math.PI / 3;
	// Offsets between an hex center and its vertices
	var hexPointsOffsets = [],
	// Offset in every 6 directions (starting by south west, clockwise)
		hexOffsets = [];
	var a = -Math.PI * .5, l = opts.circumradius, a2 = 2*PI3, l2 = doubleInradius;
	for(var i = 0; i < 6; i++)
	{
		hexPointsOffsets.push(new Point2D(l * Math.cos(a), l * Math.sin(a)));
		a += PI3;
		hexOffsets.push(new Point2D(l2 * Math.cos(a2), l2 * Math.sin(a2)));
		a2 += PI3;
	}
	function addHex(c)
	{
		var first, previous, next;
		var bLen = basePoints.length;
		first = previous = getIndex(basePoints, c.add(hexPointsOffsets[0]));
		for(var i = 1; i < 6; i++)
		{
			next = getIndex(basePoints, c.add(hexPointsOffsets[i]));
			// Using Point2D to store a couple of int (ugly)
			//if(previousNew || nextNew)
			getIndex(lines, new Point2D(previous, next));
			previous = next;
		}
		getIndex(lines, new Point2D(previous, first));
	}
	function addLayer(n)
	{
		var c = (new Point2D(0,0)).add(hexOffsets[4].multiply(n));
		for(var i = 0; i < 6; i++)
			for(var j = 0; j < n; j++)
			{
				addHex(c);
				c = c.add(hexOffsets[i]);
			}
	}
	for(var layer = 1; layer < opts.hexLayers; layer++)
		addLayer(layer);
	//lines.push(new Point2D(0, 1));
})();

// Store unchanging data
(function()
{
	for(i = 0, l = basePoints.length; i < l; i++)
	{
		var p = basePoints[i];
		var op = 1 - (p.norm() - opts.fogStart) / fogLength;
		if(op < 0) op = 0;
		if(op > 1) op = 1;
		p.op = op;
	}
})();

function loop()
{
	requestAnimationFrame(loop);
	angleOffset += (angleOffsetGoal - angleOffset) *.05;
	var time = Date.now() * 1e-3,
		rot = time * opts.rotSpeed + angleOffset;
	ctx.clearRect(-c.width*.5,-c.height*.5,c.width,c.height);
	var i, l;
	var points = [],
		colors = [];
	for(i = 0, l = basePoints.length; i < l; i++)
	{
		var p = basePoints[i];
		var dist = p.norm() / doubleInradius;
		var t = Math.sin(time * opts.waveSpeed - Math.pow(dist,opts.distWaveTimePower) * opts.distWaveTimeMult);
		t = t / (Math.pow(dist,opts.distWaveHeightPower) * opts.distWaveHeightMult + 1);
		var red = ~~(t * 0),
			green = ~~(t * -169);
		if(red < 0) red = 0;
		if(green < 0) green = 0;
		// colors.push('rgba('+red+','+green+',169,'+p.op+')');
        colors.push('rgba('+0+','+169+',223,'+p.op+')');
		var newPoint = p.rotate(rot).add(opts.preTranslation).fakeRotateX(opts.amplitude * (t + 1) + opts.zOffset, opts.rotationX);
		if(newPoint.z <= 0) continue;
		points[i] = newPoint.multiply(opts.postMult);
	}
	//if(!window.truc) window.truc = true, console.log(points);
	for(i = 0, l = lines.length; i < l; i++)
	{
		ctx.beginPath();
		var line = lines[i],
			from = points[line.x],
			to = points[line.y],
			fromColor = colors[line.x],
			toColor = colors[line.y];
		if(!from || !to)
			continue;
		var gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
		gradient.addColorStop(0, fromColor);
		gradient.addColorStop(1, toColor);
		ctx.strokeStyle = gradient;
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
	}
}
requestAnimationFrame(loop);


// button 
$(document).on('mousemove', function(e) {
    var x = e.pageX;
    var y = e.pageY;
    var w = $(this).width();
    var h = $(this).height();
    var angle = Math.atan2(y-(h/2), x-(w/2)) * (180/Math.PI);
    var rotate = angle + (180-45);
    $('.button .compass')
        .css('-webkit-transform', 'rotate('+rotate+'deg)')
        .css('-moz-transform', 'rotate('+rotate+'deg)')
        .css('-ms-transform', 'rotate('+rotate+'deg)')
        .css('-o-transform', 'rotate('+rotate+'deg)')
        .css('transform', 'rotate('+rotate+'deg)');
});
// tooltip
$('.infoDiv').hover( function(){
// $('#tooltip').removeClass('hide');
$("#tooltip").fadeIn(1000);
}, function(){
$('#tooltip').fadeOut();
} )
