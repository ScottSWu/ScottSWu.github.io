var sd;
var mfps = 30;

function main() {
	generate();
	clean();
	setup();
	loop();
}

function generate() {
	var cube = [
		[ [-1,-1,-1],[-1,1,-1],[-1,1,1],[-1,-1,1] ],
		[ [1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1] ],
		[ [-1,-1,-1],[-1,1,-1],[1,1,-1],[1,-1,-1] ],
		[ [-1,-1,1],[-1,1,1],[1,1,1],[1,-1,1] ],
		[ [-1,-1,-1],[-1,-1,1],[1,-1,1],[1,-1,-1] ],
		[ [-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1] ]
	];
	var face,vertex,bx,by,bz;
	light = new point(0,0,0,12);
	for (var k=0; k<64; k++) {
		bx = Math.random()*16-8;
		by = Math.random()*16-8;
		bz = Math.random()*16-8;
		for (var i=0; i<cube.length; i++) {
			face = new poly();
			for (var j=0; j<cube[i].length; j++) {
				vertex = new point(bx + cube[i][j][0],by + cube[i][j][1],bz + cube[i][j][2]);
				face.v.push(vertex);
			}
			polylist.push(face);
		}
	}
}

function setup() {
	sd = 0;
}

function loop() {
	var stime = new Date();
	var ttake;
	
	c_clear();
	cam.setPos(20*fcos(sd),20*fsin(sd),0);
	cam.pointAt(0,0,0);
	sd = sd + 2;
	if (sd>360) sd = sd - 360;
	d_back();
	d_paint();
	ttake = new Date() - stime; c_add("step2: " + ttake + "\n"); // Debug insertion
	
	ttake = new Date() - stime;
	c_add("Potential FPS: " + ~~(1000/ttake) + "\n");
	c_add("Frame Time (ms): " + ttake);
	setTimeout("loop()",1000/mfps-ttake);
}