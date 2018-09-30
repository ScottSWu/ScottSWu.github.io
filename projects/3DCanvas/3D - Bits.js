var canvas,ctx,cimg;
var cam,light;
var cout;
var precision = 2;
var smethod = 2;
var lookup = new Array(6);
var polylist = new Array(0);

var PI = 3.14159265359;
var dPI = 180/PI;

// Objects
function point(cx,cy,cz,cd) {
	this.x = cx;
	this.y = cy;
	this.z = cz;
	this.d = cd;
}

function poly() {
	this.v = new Array(0);
	this.center = new point(0,0,0,0);
	this.normal = new point(0,0,0,0);
	
	this.closest = function() {
		var min = 0;
		for (var i=0; i<this.v.length; i++) min = (distance(cam.pos,this.v[i])<distance(cam.pos,this.v[min])) ? min : i;
		return min;
	}
	
	this.findCenter = function() {
		var sx = 0;
		var sy = 0;
		var sz = 0;
		for (var i=0; i<this.v.length; i++) {
			sx = sx + this.v[i].x;
			sy = sy + this.v[i].y;
			sz = sz + this.v[i].z;
		}
		this.center = new point(sx/this.v.length,sy/this.v.length,sz/this.v.length,0);
	}
	
	this.findNormal = function() {
		var su = new point(this.v[1].x - this.v[0].x,this.v[1].y - this.v[0].y,this.v[1].z - this.v[0].z,0);
		var sv = new point(this.v[2].x - this.v[0].x,this.v[2].y - this.v[0].y,this.v[2].z - this.v[0].z,0);
		this.normal = new point(su.y*sv.z - su.z*sv.y,su.z*sv.x - su.x*sv.z,su.x*sv.y - su.y*sv.x,0);
	}
}

function camera() {
	this.pos = new point(0,0,0,0);
	this.rot = 0;
	this.nod = 0;
	this.yaw = 0;
	this.fovW = 1;
	this.fovH = 1;
	this.fovD = 90;
	this.screenW = 800;
	this.screenH = 600;
	
	this.setPos = function(cx,cy,cz) {
		this.pos.x = cx;
		this.pos.y = cy;
		this.pos.z = cz;
	}
	this.setTurn = function(cr,cn,cy) {
		this.rot = cr%360;
		this.nod = cn%360;
		this.yaw = cy%360;
	}
	
	this.pointAt = function (cx,cy,cz) {
		this.setTurn(Math.atan2(this.pos.y,this.pos.x)*dPI+180,-Math.atan2(this.pos.z,Math.sqrt(Math.pow(this.pos.x,2)+Math.pow(this.pos.y,2))*dPI),0);
	}
}

// Initializer
function init(inp) {
	canvas = document.getElementById('sc1');
	ctx = canvas.getContext('2d');
	cam = new camera();
	cout = document.getElementById('cout');
	light = new point(0,0,0,1);
	
	ctx.strokeStyle = "#000000";
	ctx.fillStyle = "#FFFFFF";
	ctx.lineWidth = 1;
	ctx.font = "12px Tahoma";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	
	var ops = inp.split(";");
	var dem,opt,val;
	for (var i=0; i<ops.length; i++) {
		dem = ops[i].indexOf("=");
		if (dem>=0) {
			opt = ops[i].substring(0,dem).trim().toUpperCase();
			val = ops[i].substring(dem+1).trim();
			if (opt=="PROGRAM") addScript(val,"main");
			else if (opt=="CONSOLE") cout.style.display = val;
			else if (opt=="WIDTH") canvas.width = parseInt(val,10);
			else if (opt=="HEIGHT") canvas.height = parseInt(val,10);
			else if (opt=="PRECISION") precision = parseInt(val,10);
			else if (opt=="SHADE") smethod = parseInt(val,10);
		}
	}
	
	cimg = ctx.createImageData(canvas.width,canvas.height);
	
	for (var i=0; i<6; i++) {
		lookup[i] = new Array(360*precision);
	}
	for (var i=0; i<360*precision; i++) {
		lookup[0][i] = Math.sin(Math.PI*i/180/precision);
		lookup[1][i] = Math.cos(Math.PI*i/180/precision);
		lookup[2][i] = Math.tan(Math.PI*i/180/precision);
	}
}

function addScript(k,mf) {
	var header = document.getElementsByTagName("head")[0];
	var ext = document.createElement("script");
	ext.setAttribute("type","text/javascript");
	ext.setAttribute("src",k);
	ext.setAttribute("onload","javascript: " + mf + "();");
	header.appendChild(ext);
}

function clean() {
	for (var i=0; i<polylist.length; i++) {
		if (polylist[i].v.length==3) polylist[i].v.push(polylist[i].v[0]);
		for (var j=0; j<polylist[i].v.length; j++) {
			polylist[i].v[j].d = i;
		}
		polylist[i].findCenter();
		polylist[i].findNormal();
	}
}

// Lookup Trignometric Functions
function lookupIndex(deg) {
	deg = (deg<0) ? deg%360 + 360 : deg%360;
	return ~~(deg*precision);
}

function fsin(deg) {
	return lookup[0][lookupIndex(deg)];
}

function fcos(deg) {
	return lookup[1][lookupIndex(deg)];
}

function ftan(deg) {
	return lookup[2][lookupIndex(deg)];
}

function dcos(deg) {
	return Math.cos(deg*Math.PI/180);
}

function dsin(deg) {
	return Math.sin(deg*Math.PI/180);	
}

function dtan(deg) {
	return Math.tan(deg*Math.PI/180);
}

// Math Functions
function distance(a,b) {
	var diff = new point(a.x-b.x,a.y-b.y,a.z-b.z,0);
	return Math.sqrt(diff.x*diff.x + diff.y*diff.y + diff.z*diff.z);
}

function shade(k,method) {
	var rgb = [0,0,0,255];
	var dist = distance(light,k);
	switch (method) {
		default:
		case 0: // Linear
			if (dist<=light.d) rgb[0] = rgb[1] = rgb[2] = ~~((1 - dist/light.d)*255);
			break;
		case 1: // Inverse Square
			if (dist<=light.d) rgb[0] = rgb[1] = rgb[2] = ~~(Math.sqrt(1-dist*dist/light.d/light.d)*255);
			break;
		case 2: // Trigonometric Cosine
			if (dist<=light.d) rgb[0] = rgb[1] = rgb[2] = ~~(fcos(dist/light.d*90)*255);
			break;
		case 3: // Random
			rgb[0] = rgb[1] = rgb[2] = ~~(Math.random()*255);
			break;
		case 4: // Trigonometric Cosine Alpha Shade
			if (dist<=light.d) rgb[3] = ~~(fsin(dist/light.d*90)*255);
			break;
	}
	return rgb;
}

function project(inp) {
	var target = new point(inp.x-cam.pos.x,inp.y-cam.pos.y,inp.z-cam.pos.z,0);
	var rad,turn,lean;
	rad = Math.sqrt(target.x*target.x + target.y*target.y);
	turn = Math.atan2(target.y,target.x)*dPI;
	turn = cam.rot - turn;
	target.x = rad*fcos(turn);
	target.y = rad*fsin(turn);
	rad = Math.sqrt(target.x*target.x + target.z*target.z);
	turn = Math.atan2(target.z,target.x)*dPI;
	turn = turn - cam.nod;
	target.x = rad*fcos(turn);
	target.x = (target.x<0) ? -target.x : target.x;
	target.z = rad*fsin(turn);
	rad = Math.sqrt(target.y*target.y + target.z*target.z);
	lean = Math.atan2(target.z,target.y)*dPI;
	lean = lean - cam.yaw;
	target.y = rad*fcos(lean);
	target.z = rad*fsin(lean);
	return new point(target.y/(target.x*ftan(cam.fovD/2)),target.z/(target.x*ftan(cam.fovD/2)),0,target.x);
}

function map(inp) {
	return new point(~~((inp.x+1)*cam.screenW/2),~~(cam.screenH*(1-inp.y)/2),inp.z,inp.d);
}

// Drawing Functions
function d_clear() {
	ctx.clearRect(0,0,cam.screenW,cam.screenH);
}

function d_flush() {
	cimg = ctx.createImageData(canvas.width,canvas.height);
}

function d_back(rgba) {
	var offset;
	
	for (var i=0; i<cimg.height; i++) {
		for (var j=0; j<cimg.width; j++) {
			offset = (cimg.width * i + j) * 4;
			cimg.data[offset+3] = rgba[3];
		}
	}
}

function d_fill(vs,rgba) {
	var extrema = [vs[0].x,vs[0].x,vs[0].y,vs[0].y];
	var offset;
	for (var i=1; i<3; i++) {
		if (vs[i].x<extrema[0]) extrema[0] = vs[i].x;
		else if (vs[i].x>extrema[1]) extrema[1] = vs[i].x;
		if (vs[i].y<extrema[2]) extrema[2] = vs[i].y;
		else if (vs[i].y>extrema[3]) extrema[3] = vs[i].y;
	}
	for (var i=extrema[2]; i<=extrema[3]; i++) {
		offset = cimg.width*i*4;
		for (var j=offset + extrema[0]*4; j<=offset + extrema[1]*4; j = j+4) {
			if (cimg.data[j+3]==0) cimg.data[j+3] = rgba[3];
		}
	}
}

function d_text(k,x,y) {
	ctx.fillText(k,x,y);
}

function d_paint() {
	var stime = new Date();
	var ind,behind,proj;
	var polyq = new Array(polylist.length);
	var sqv = new Array(4);
	var extrema;
	polies = polylist.length;
	for (var i=0; i<polies; i++) {
		polyq[i] = polylist[i].v[polylist[i].closest()];
	}
	polyq.sort(function (a,b) { return distance(cam.pos,a) - distance(cam.pos,b); });
	
	c_add("Sort Time: " + (new Date() - stime) + "\n");
	
	for (var i=0; i<polies; i++) {
		ind = polyq[i].d;
		behind = true;
		for (var j=0; j<4; j++) {
			sqv[j] = map(project(polylist[ind].v[j]));
			if (behind && sqv[j].d>0) behind = false;
		}
		if (!behind) {
			d_fill(sqv,shade(polylist[ind].center,smethod));
		}
	}
}

function d_update() {
	ctx.putImageData(cimg,0,0);
}

// Console Functions
function c_clear() {
	cout.innerHTML = "";
}

function c_add(k) {
	cout.innerHTML = cout.innerHTML + k;
}