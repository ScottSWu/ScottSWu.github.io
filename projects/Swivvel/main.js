window.addEventListener("load",init);

function $$(a) { return document.getElementById(a); }

var ws;
var stage = 0;
var host = "ws://localhost:22196/";
var currentTime = 0;
var currentIndex = 0;
var audioElement;
var loaded = 5000;
var spectrumData = [];
var canvas;
var width = window.innerWidth;
var height = window.innerHeight;
function init() {
	ws = new WebSocket(host);
	stage = 0;
	ws.onopen = function(e) {
		stage = 1;
	};
	ws.onmessage = function(e) {
		var data = JSON.parse(e.data);
		if (stage==0) {
			console.log("Not connected");
		}
		else if (stage==2) { // Loaded
			if (data.status=="retrieving") {
				ws.send("BUFFER,START=0,END=5000");
				stage = 3;
			}
			else {
				console.log("Retrieving failed");
			}
		}
		else if (stage==3) { // Data
			if (data.status=="success") {
				var doplay = false;
				if (spectrumData.length==0) doplay = true;
				var specs = data.data;
				var last = specs.length-1;
				for (var i=0; i<specs.length; i++) {
					spectrumData.push(specs[i]);
				}
				if (doplay) audioElement.play();
			}
		}
	};
	
	initThree();
	
	playb.addEventListener("click",loadAudio);
	
	frame();
}

var renderer,camera,scene;
var player_radius = 0.8;
var player_angle = -Math.PI/2;
var keys = new Array(512);
var mouse = new Array(2);
var bgimage,player,center,center_after;
var pulses = [];
var bgbars = [];
var bgcolors = [
	0xFF0000,0xFF5500,0xFFAE00,0xFFFF00,0xAAFF00,0x60FF00,
	0x04FF00,0x00FF55,0x00FFAA,0x00FBFF,0x00AEFF,0x0055FF,
	0x0800FF,0x5000FF,0xB300FF,0xFB00FF,0xFF00A5,0xFF0051,
];
var tex = {};
var vecWhite;
function initThree() {
	window.addEventListener("keydown",function(e) {
		keys[e.which] = true;
		if (e.which==32 && audioElement) {
			if (audioElement.paused) {
				audioElement.play();
			}
			else {
				audioElement.pause();
			}
		}
	});
	window.addEventListener("keyup",function(e) {
		keys[e.which] = false;
	});
	window.addEventListener("mousemove",function(e) {
		mouse[0] = e.clientX;
		mouse[1] = e.clientY;
	});
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(width,height);
	scene = new THREE.Scene();
	var ratio = width/height;
	camera = new THREE.OrthographicCamera(-ratio,ratio,1,-1);
	camera.position.set(0,0,2);
	camera.lookAt(new THREE.Vector3(0,0,0));
	
	tex.bgtex = THREE.ImageUtils.loadTexture("bg.png");
	tex.playertex = THREE.ImageUtils.loadTexture("player.png");
	tex.centertex = THREE.ImageUtils.loadTexture("center.png");
	tex.pulsetex = THREE.ImageUtils.loadTexture("pulse.png");
	
	vecWhite = new THREE.Vector4(1,1,1,1);
	bgimage = create_quad_mesh({
		x : 0, y : 0, z : -2,
		width: 2*ratio, height: 2,
		color : vecWhite,
		texture : tex.bgtex
	});
	player = create_quad_mesh({
		x : 0, y: -player_radius, z: 2,
		size: 0.04,
		color : vecWhite,
		texture : tex.playertex
	});
	center = create_quad_mesh({
		x : 0, y: 0, z: 0,
		size: 0.4,
		color: vecWhite,
		texture : tex.centertex
	});
	center_after = create_quad_mesh({
		x : 0, y: 0, z: 0,
		size: 0.4,
		color: vecWhite,
		texture : tex.centertex
	});
	for (var i=0; i<18; i++) {
		bgbars.push(new THREE.Mesh(new THREE.PlaneGeometry(1.75/18*ratio,1,2,2),new THREE.MeshBasicMaterial({ color: bgcolors[i], opacity: 0.5 })));
		bgbars[i].position.set(2.0/18*ratio*(i-9) + ratio/18,-1,1);
		bgbars[i].scale.setY(0.01);
	}
	
	player.visible = false;
	center.visible = false;
	center_after.visible = false;
	
	scene.add(camera);
	scene.add(bgimage);
	scene.add(player);
	scene.add(center);
	scene.add(center_after);
	for (var i=0; i<18; i++) {
		scene.add(bgbars[i]);
	}
	
	$$("canvas_container").appendChild(renderer.domElement);
}

function create_quad_mesh(params) {
	if (params.size!=undefined) {
		params.width = params.height = params.size;
	}
	
	var attributes = {
		scwuColor : { type : 'v4' , value : [] }
	};
	var uniforms = {
		texture : { type : 't' , value : params.texture }
	};
	var mesh = new THREE.Mesh(
		new THREE.PlaneGeometry(params.width,params.height,1,1),
		//new THREE.MeshBasicMaterial({ color : carr[0]*0x10000+carr[1]*0x100+carr[2] , map : WOsu.textures.skin.hitcircle , transparent : false })/*
		new THREE.ShaderMaterial({
			attributes : attributes,
			uniforms : uniforms,
			
			vertexShader : alphaShader.vertexShader,
			fragmentShader : alphaShader.fragmentShader,
			
			side : THREE.DoubleSide,
			blending : alphaShader.blending,
			transparent : true
		})
		//*/
	);
	
	for (var j=0; j<mesh.geometry.vertices.length; j++) {
		attributes.scwuColor.value[j] = params.color;
	}
	
	mesh.attributes = attributes;
	mesh.uniforms = uniforms;
	mesh.position.set(params.x,params.y,params.z);
	
	return mesh;
}

function create_pulse_mesh(params) {
	if (params.size!=undefined) {
		params.width = params.height = params.size;
	}
	
	var attributes = {
		scwuColor : { type : 'v4' , value : [] }
	};
	var uniforms = {
		texture : { type : 't' , value : params.texture }
	};
	var mesh = new THREE.Mesh(
		create_pulse_geometry(params.openings,params.size),
		//new THREE.MeshBasicMaterial({ color : carr[0]*0x10000+carr[1]*0x100+carr[2] , map : WOsu.textures.skin.hitcircle , transparent : false })/*
		new THREE.ShaderMaterial({
			attributes : attributes,
			uniforms : uniforms,
			
			vertexShader : alphaShader.vertexShader,
			fragmentShader : alphaShader.fragmentShader,
			
			side : THREE.DoubleSide,
			blending : alphaShader.blending,
			transparent : true
		})
		//*/
	);
	
	for (var j=0; j<mesh.geometry.vertices.length; j++) {
		attributes.scwuColor.value[j] = params.color;
	}
	
	mesh.attributes = attributes;
	mesh.uniforms = uniforms;
	mesh.position.set(params.x,params.y,params.z);
	
	return mesh;
}

function create_pulse_geometry(openings,r) {
	var geo = new THREE.Geometry();
	geo.vertices.push(new THREE.Vector3(0,0,0));
	var cuv = new THREE.Vector2(0.5,0.5);
	for (var i=0; i<bgcolors.length; i++) {
		var angle = i/bgcolors.length*2*Math.PI;
		geo.vertices.push(new THREE.Vector3(r*Math.cos(angle),r*Math.sin(angle),0));
		if (openings.indexOf(i)<0 && i<bgcolors.length) {
			var nangle = (i+1)/bgcolors.length*2*Math.PI;
			var a1 = i+1;
			var a2 = (i==bgcolors.length-1) ? 1 : i+2;
			geo.faces.push(new THREE.Face3(0,a1,a2));
			geo.faceVertexUvs[0].push([cuv,new THREE.Vector2(0.5*Math.cos(angle)+0.5,0.5*Math.sin(angle)+0.5),new THREE.Vector2(0.5*Math.cos(nangle)+0.5,0.5*Math.sin(nangle)+0.5)]);
		}
	}
	geo.computeBoundingBox();
	return geo;
}

function loadAudio() {
	var audioFile = $$("afurl").value;
	
	$$("input_container").style.display = "none";
	
	// Add element
	audioElement = document.createElement("audio");
	audioElement.src = audioFile;
	audioElement.controls = "controls";
	audioElement.style.marginRight = "3%";
	audioElement.volume = 0.5;
	var ac = $$("audio_container");
	ac.appendChild(audioElement);
	
	player_radius = 0.75;
	player_angle = -Math.PI/2;
	
	everyOther = $$("sel_diff").value;
	openPlaces = $$("sel_open").value;
	
	player.visible = true;
	center.visible= true;
	center_after.visible = true;
	
	ws.send("LOAD,URL=" + btoa(audioFile));
	stage = 2;
}

var ccolor = [255,255,255];
var lastPulse = -1000000;
var everyOther = 2;
var parity = 0;
var pshift = 0;
var openPlaces = 6;
var openings;
var player_score = 0;
var tpi = 2*Math.PI;
function frame() {
	requestAnimationFrame(frame);
	
	if (audioElement) {
		if (stage>2 && !audioElement.paused && loaded-currentTime<5000) {
			console.log("Req");
			ws.send("BUFFER,START=" + loaded + ",END=" + (loaded+5000));
			loaded += 5000;
		}
		
		player_angle = Math.atan2(height/2-mouse[1],mouse[0]-width/2);
		/*
		if (keys[65] || keys[37]) {
			player_angle += 0.05;
		}
		if (keys[68] || keys[39]) {
			player_angle -= 0.05;
		}
		*/
		
		currentTime = ~~(audioElement.currentTime*1000);
		
		if (currentTime>spectrumData[currentIndex].time) currentIndex++;
		
		var spec = spectrumData[currentIndex].spectrum;
		var max = new Array(0);
		for (var i=0; i<bgbars.length; i++) {
			if (spec[i]<0.0001) {
				bgbars[i].scale.setY(0.0001);
			}
			else {
				bgbars[i].scale.setY(spec[i]/500.0);
			}
			if (max.length<openPlaces) max.push(i);
			else {
				for (var j=0; j<openPlaces; j++) {
					if (spec[i]>spec[max[j]]) {
						max.splice(j,0,i);
						max.pop();
						break;
					}
				}
			}
		}
		openings = max;
		
		var towards = bgcolors[max[0]];
		var tr = (towards>>16) & 0xFF;
		var tg = (towards>>8 ) & 0xFF;
		var tb = (towards    ) & 0xFF;
		var shift = 0.5;
		if (ccolor[0]<tr) ccolor[0] += shift; else if (ccolor[0]>tr) ccolor[0] -= shift;
		if (ccolor[1]<tg) ccolor[1] += shift; else if (ccolor[1]>tg) ccolor[1] -= shift;
		if (ccolor[2]<tb) ccolor[2] += shift; else if (ccolor[2]>tb) ccolor[2] -= shift;
		
		setColor(bgimage,ccolor,1);
		
		if (spectrumData[currentIndex].beat==1) {
			if (currentTime-lastPulse>300) {
				parity++;
				if (parity%everyOther==0) {
					pshift = ~~(18*Math.random());
					for (var i=0; i<openings.length; i++) {
						openings[i] = (openings[i]+pshift)%bgcolors.length;
					}
					var np = create_pulse_mesh({
						x: 0, y: 0, z: 1,
						size: 0.2,
						texture: tex.pulsetex,
						color: new THREE.Vector4(2,2,2,1),
						openings: openings
					});
					np.startTime = currentTime;
					np.openings = new Array(openPlaces);
					np.scored = false;
					for (var i=0; i<openPlaces; i++) {
						np.openings[i] = openings[i];
					}
					pulses.push(np);
					scene.add(np);
					lastPulse = currentTime;
					
					center_after.pulsing = 200;
				}
			}
			spectrumData[currentIndex].beat = 0;
		}
		
		$$("score_container").innerHTML = player_score;
		
		if (center_after.pulsing>0) {
			center_after.scale.set(center_after.pulsing/1000+1,center_after.pulsing/1000+1,1);
			//setColor(center_after,[255,255,255],center_after.pulsing/200);
			center_after.pulsing -= 10;
		}
		
		for (var i=0; i<pulses.length; i++) {
			var diff = (currentTime - pulses[i].startTime)/2000;
			pulses[i].scale.set(1+diff*8,1+diff*8,1);
			if (0.38<diff && diff<0.42) {
				var playerspace = ~~((((player_angle%tpi)+tpi)%tpi)*9/Math.PI);
				if (!pulses[i].scored && pulses[i].openings.indexOf(playerspace)<0) {
					player_score--;
					pulses[i].scored = true;
				}
			}
			else if (diff>0.43) {
				if (!pulses[i].scored) {
					player_score++;
					pulses[i].scored = true;
				}
			}
		}
		if (pulses.length>0 && currentTime-pulses[0].startTime>4000) {
			scene.remove(pulses.shift());
		}
		
		player.position.set(player_radius*Math.cos(player_angle),player_radius*Math.sin(player_angle),0);
		player.rotation.set(0,0,player_angle + Math.PI/2);
	}
	
	renderer.render(scene,camera);
}

function setColor(mesh,color,alpha) {
	var vl = mesh.geometry.vertices.length;
	var sc = mesh.attributes.scwuColor;
	for (var i=0; i<vl; i++) {
		sc.value[i].x = color[0]/255.0;
		sc.value[i].y = color[1]/255.0;
		sc.value[i].z = color[2]/255.0;
		sc.value[i].w = alpha;
	}
	sc.needsUpdate = true;
}

var alphaShader = {
	vertexShader : [
		"varying vec2 vUv;",
		"attribute vec4 scwuColor;",
		"varying vec4 vColor;",

		"void main() {",
		"	vColor = scwuColor;",
		"	vUv = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);",
		"}"
	].join("\n"),

	fragmentShader : [
		"uniform sampler2D texture;",
		"varying vec4 vColor;",
		"varying vec2 vUv;",

		"void main() {",
		"	gl_FragColor = texture2D(texture, vUv) * vColor;",
		"}"
	].join("\n"),
	
	blending : THREE.NormalBlending
};
