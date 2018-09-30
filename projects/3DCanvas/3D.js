var canvas1,ctx1;
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
	
	this.closest = function() {
		var min = 0;
		for (var i=0; i<this.v.length; i++) min = (distance(cam.pos,this.v[i])<distance(cam.pos,this.v[min])) ? min : i;
		return min;
	}
	
	this.findcenter = function() {
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
	canvas1 = document.getElementById('sc1');
	ctx1 = canvas1.getContext('2d');
	cam = new camera();
	cout = document.getElementById('cout');
	light = new point(0,0,0,1);
	
	ctx1.strokeStyle = "#000000";
	ctx1.fillStyle = "#FFFFFF";
	ctx1.lineWidth = 1;
	ctx1.font = "12px Tahoma";
	ctx1.textAlign = "left";
	ctx1.textBaseline = "top";
	
	var ops = inp.split(";");
	var dem,opt,val;
	for (var i=0; i<ops.length; i++) {
		dem = ops[i].indexOf("=");
		if (dem>=0) {
			opt = ops[i].substring(0,dem).trim().toUpperCase();
			val = ops[i].substring(dem+1).trim();
			if (opt=="PROGRAM") addScript(val,"main");
			else if (opt=="WIDTH") canvas1.width = parseInt(val,10);
			else if (opt=="HEIGHT") canvas1.height = parseInt(val,10);
			else if (opt=="PRECISION") precision = parseInt(val,10);
			else if (opt=="SHADE") smethod = parseInt(val,10);
		}
	}
	
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
		for (var j=0; j<polylist[i].v.length; j++) {
			polylist[i].v[j].d = i;
		}
		polylist[i].findcenter();
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
	var rgb = [0,0,0];
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
	}
	return "rgb(" + rgb.toString() + ")";
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
	return new point((inp.x+1)*cam.screenW/2,cam.screenH-((inp.y+1)*cam.screenH/2),inp.z,inp.d);
}

// Drawing Functions
function d_clear() {
	ctx1.clearRect(0,0,cam.screenW,cam.screenH);
}

function d_back() {
	ctx1.fillStyle = "#000000";
	ctx1.fillRect(0,0,cam.screenW,cam.screenH);
}

function d_blank() {
	ctx1.fillRect(0,0,cam.screenW,cam.screenH);
}

function d_text(k,x,y) {
	ctx1.fillText(k,x,y);
}

function d_paint() {
	var stime = new Date();
	var ind,behind,proj;
	var polyq = new Array(polylist.length);
	polies = polylist.length;
	for (var i=0; i<polies; i++) {
		polyq[i] = polylist[i].v[polylist[i].closest()];
	}
	polyq.sort(function (a,b) { return distance(cam.pos,b) - distance(cam.pos,a); });
	for (var i=0; i<polies; i++) {
		ind = polyq[i].d;
		behind = true;
		ctx1.beginPath();
		for (var j=0; j<polylist[ind].v.length; j++) {
			proj = map(project(polylist[ind].v[j]));
			if (behind && proj.d>0) behind = false;
			ctx1.lineTo(proj.x,proj.y);
		}
		ctx1.closePath();
		if (!behind) {
			ctx1.fillStyle = ctx1.strokeStyle = shade(polylist[ind].center,smethod);
			ctx1.fill();
			ctx1.stroke();
		}
	}
}

// Console Functions
function c_clear() {
	cout.innerHTML = "";
}

function c_add(k) {
	cout.innerHTML = cout.innerHTML + k;
}