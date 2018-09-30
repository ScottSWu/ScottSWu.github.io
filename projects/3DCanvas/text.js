var sd = 0;
var mfps = 30;
var text = "";
var parse;

function main() {
	setup();
	loop();
}

function setup() {
	text = document.getElementById("textInput").value.toUpperCase();
	generate();
}

var alphabet = [
	[ [0,0],[0,7],[5,7],[5,0],[4,0],[4,4],[2,4],[2,5],[4,5],[4,6],[1,6],[1,0],[0,0] ], // A
	[ [0,0],[0,7],[4,7],[5,6],[5,4.5],[4,3.5],[1.5,3.5],[1.5,4.5],[4,4.5],[4,5.5],[3,6],[1,6],[1,1],[3,1],[4,1.5],[4,2.5],[1.5,2.5],[1.5,3.5],[4,3.5],[5,2.5],[5,1],[4,0],[0,0] ], // B
	[ [0,1],[0,6],[1,7],[5,7],[5,6],[2,6],[1,5],[1,2],[2,1],[5,1],[5,0],[1,0],[0,1] ], // C
	[ [0,0],[0,7],[4,7],[5,6],[5,1],[4,0],[2,0],[2,1],[3,1],[4,2],[4,5],[3,6],[1,6],[1,0],[0,0] ], // D
	[ [0,0],[0,7],[5,7],[5,6],[1,6],[1,4],[5,4],[5,3],[1,3],[1,1],[5,1],[5,0],[0,0] ], // E
	[ [0,0],[0,7],[5,7],[5,6],[1,6],[1,4],[5,4],[5,3],[1,3],[1,0],[0,0] ], // F
	[ [0,1],[0,6],[1,7],[5,7],[5,6],[2,6],[1,5],[1,2],[2,1],[4,1],[4,2],[3,2],[3,3],[5,3],[5,0],[1,0],[0,1] ], // G
	[ [0,0],[0,7],[1,7],[1,4],[4,4],[4,7],[5,7],[5,0],[4,0],[4,3],[1,3],[1,0],[0,0] ], // H
	[ [0,0],[0,1],[2,1],[2,6],[0,6],[0,7],[5,7],[5,6],[3,6],[3,1],[5,1],[5,0],[0,0] ], // I
	[ [0,1],[1,2],[2,1],[3,2],[3,6],[0,6],[0,7],[5,7],[5,6],[4,6],[4,2],[3,1],[1,0],[0,1] ], // J
	[ [0,0],[0,7],[1,7],[1,4],[4,7],[5,7],[2,4],[5,0],[4,0],[1,3],[1,0],[0,0] ], // K
	[ [0,0],[0,7],[1,7],[1,1],[5,1],[5,0],[0,0] ], // L
	[ [0,0],[0,7],[5,7],[5,0],[4,0],[4,6],[3,6],[3,0],[2,0],[2,6],[1,6],[1,0],[0,0] ], // M
	[ [0,0],[0,7],[1,7],[4,1],[4,7],[5,7],[5,0],[4,0],[1,6],[1,0],[0,0] ], // N
	[ [1,0],[0,1],[0,6],[1,7],[4,7],[5,6],[5,1],[4,0],[2,0],[2,1],[4,1],[4,6],[1,6],[1,0] ], // O
	[ [0,0],[0,7],[5,7],[5,4],[2,4],[2,5],[4,5],[4,6],[1,6],[1,0],[0,0] ], // P
	[ [0,0] ], // Q
	[ [0,0] ], // R
	[ [0,0],[4,0],[5,1],[5,3],[4,4],[1,4],[1,6],[5,6],[5,7],[1,7],[0,6],[0,4],[1,3],[4,3],[4,1],[0,1],[0,0] ], // S
	[ [2,0],[2,6],[0,6],[0,7],[5,7],[5,6],[3,6],[3,0],[2,0] ], // T
	[ [0,0] ], // U
	[ [0,0] ], // V
	[ [0,0],[0,7],[1,7],[1,1],[2,1],[2,7],[3,7],[3,1],[4,1],[4,7],[5,7],[5,0],[0,0] ], // W
	[ [0,0],[2,4],[0,7],[1,7],[2.5,4.5],[4,7],[5,7],[3,4],[5,0],[4,0],[2.5,3.5],[1,0],[0,0] ], // X
	[ [2,0],[2,4],[0,7],[1,7],[2.5,5],[4,7],[5,7],[3,4],[3,0],[2,0] ], // Y
	[ [0,0] ], // Z
	[ [0,0],[1,0],[1,1],[0,1],[0,0] ], // .
	[ [0,0] ], // _
];
function generate() {
	var aind = "ABCDEFGHIJKLMNOPQRSTUVWXYZ. ";
	var ind;
	var face;
	var th = 2;
	
	polylist = new Array(0);
	
	for (var i=0; i<text.length; i++) {
		ind = aind.indexOf(text.charAt(i));
		if (ind==-1) ind = alphabet.length-1;
		cx = 8*(i-text.length/2);
		cy = -1;
		cz = -4;
		
		face = new poly();
		for (var j=0; j<alphabet[ind].length; j++) {
			face.v.push(new point(alphabet[ind][j][0]+cx,cy,alphabet[ind][j][1]+cz,0));
		}
		polylist.push(face);
		
		face = new poly();
		for (var j=0; j<alphabet[ind].length; j++) {
			face.v.push(new point(alphabet[ind][j][0]+cx,cy+th,alphabet[ind][j][1]+cz,0));
		}
		polylist.push(face);
		
		for (var j=0; j<alphabet[ind].length-1; j++) {
			face = new poly();
			face.v.push(new point(alphabet[ind][j][0]+cx,cy,alphabet[ind][j][1]+cz,0));
			face.v.push(new point(alphabet[ind][j][0]+cx,cy+th,alphabet[ind][j][1]+cz,0));
			face.v.push(new point(alphabet[ind][j+1][0]+cx,cy+th,alphabet[ind][j+1][1]+cz,0));
			face.v.push(new point(alphabet[ind][j+1][0]+cx,cy,alphabet[ind][j+1][1]+cz,0));
			polylist.push(face);
		}
	}
	
	light = new point(0,0,-10,text.length*4);
	//light = new point(0,-5,0,10);
	console.log("Generated '" + text + "'");
}

function loop() {
	var stime = new Date();
	
	ntext = document.getElementById("textInput").value.toUpperCase();
	if (ntext!=text) {
		text = ntext;
		generate();
	}
	clean();
	d_setMethod(0);
	var radius = text.length*6+2;
	cam.setPos(radius*fcos(sd),radius*fsin(sd),2);
	cam.pointAt(0,0,0);
	sd = sd + 4;
	if (sd>360) sd = sd - 360;
	d_clear();
	d_paint();
	//d_update();
	
	var ttake = new Date() - stime;
	setTimeout("loop()",1000/mfps-ttake);
}