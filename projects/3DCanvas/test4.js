var mfps = 30;

function main() {
	clean();
	loop();
}

function loop() {
	var stime = new Date();
	var ttake;
	
	c_clear();
	d_clear();
	d_back([0,0,0,100]);
	ttake = new Date() - stime;
	c_add("Flush time: " + ttake + "\n");
	
	d_update();
	ttake = new Date() - stime;
	c_add("Frame Time (ms): " + ttake + "\n");
	c_add("Potential FPS: " + ~~(1000/ttake) + "\n");
	setTimeout("loop()",1000/mfps-ttake);
}