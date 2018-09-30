var sd;
var mfps = 30;

function main() {
	generate();
	setup();
	clean();
	loop();
}

function generate() {
	var segments = 24;
	var r = 8;
	var face;
	var dome = new Array(segments*(segments-1));
	for (var i=0; i<dome.length; i++) {
		dome[i] = new Array(4);
		for (var j=0; j<dome[i].length; j++) {
			dome[i][j] = new Array(3);
		}
	}
	
	for (var i=0; i<segments-1; i++) {
		for (var j=0; j<segments; j++) {
			dome[i*segments+j][0][0] = r*Math.cos(j/segments*2*Math.PI)*Math.cos(i/segments/2*Math.PI);
			dome[i*segments+j][0][1] = r*Math.sin(j/segments*2*Math.PI)*Math.cos(i/segments/2*Math.PI);
			dome[i*segments+j][0][2] = r*Math.sin(i/segments/2*Math.PI);
			dome[i*segments+j][1][0] = r*Math.cos((j+1)/segments*2*Math.PI)*Math.cos(i/segments/2*Math.PI);
			dome[i*segments+j][1][1] = r*Math.sin((j+1)/segments*2*Math.PI)*Math.cos(i/segments/2*Math.PI);
			dome[i*segments+j][1][2] = r*Math.sin(i/segments/2*Math.PI);
			dome[i*segments+j][2][0] = r*Math.cos((j+1)/segments*2*Math.PI)*Math.cos((i+1)/segments/2*Math.PI);
			dome[i*segments+j][2][1] = r*Math.sin((j+1)/segments*2*Math.PI)*Math.cos((i+1)/segments/2*Math.PI);
			dome[i*segments+j][2][2] = r*Math.sin((i+1)/segments/2*Math.PI);
			dome[i*segments+j][3][0] = r*Math.cos(j/segments*2*Math.PI)*Math.cos((i+1)/segments/2*Math.PI);
			dome[i*segments+j][3][1] = r*Math.sin(j/segments*2*Math.PI)*Math.cos((i+1)/segments/2*Math.PI);
			dome[i*segments+j][3][2] = r*Math.sin((i+1)/segments/2*Math.PI);
		}
	}
	
	for (var i=0; i<dome.length; i++) {
		face = new poly();
		face.v.push(new point(dome[i][0][0],dome[i][0][1],dome[i][0][2],0));
		face.v.push(new point(dome[i][1][0],dome[i][1][1],dome[i][1][2],0));
		face.v.push(new point(dome[i][2][0],dome[i][2][1],dome[i][2][2],0));
		face.v.push(new point(dome[i][3][0],dome[i][3][1],dome[i][3][2],0));
		polylist.push(face);
	}
}

function setup() {
	sd = 0;
	light = new point(12,12,12,24);
}

function loop() {
	var stime = new Date();
	
	var ttake;
	
	cam.setPos(20*fcos(sd),20*fsin(sd),8);
	cam.pointAt(0,0,0);
	sd = sd + 2;
	if (sd>360) sd = sd - 360;
	d_clear();
	d_paint();
	
	ttake = new Date() - stime;
	c_clear();
	c_add("Potential FPS: " + ~~(1000/ttake) + "\n");
	setTimeout("loop()",1000/mfps-ttake);
}