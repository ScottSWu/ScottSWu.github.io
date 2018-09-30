
var AmoebaAudio = function(options) {
	var $ = AmoebaAudio.Utils.chain;
	var instance = this;
	
	if (!window.AudioContext && !window.webkitAudioContext) {
		console.err("Error: No AudioContext");
		return;
	}
	
	this.AudioContext = window.AudioContext || window.webkitAudioContext;
	
	{ // Options
		this.parent = options.parent || document.body;
		this.mobile = options.mobile || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
		this.nodeType = 0;
	}
	
	var container,canvas,info,audioContainer,audio,dnd,dnd_link,dnd_file;
	{ // Elements
		this.elements = {
			container : document.createElement("div"),       // Container
			audioContainer : document.createElement("div"),  // Audio container
			audio : this.createMediaElement(),               // Audio element for streaming media
			canvas : document.createElement("canvas"),       // Visualizer canvas
			info : document.createElement("div"),            // Metadata info
			dnd : document.createElement("div"),             // Drag and drop container
			dnd_link : document.createElement("textarea"),   // Drag and drop links
			dnd_file : document.createElement("input"),      // Drag and drpo files
			dnd_play : document.createElement("div"),        // Pause/play control
		};
		
		container        = this.elements.container;
		audioContainer   = this.elements.audioContainer;
		audio            = this.elements.audio;
		canvas           = this.elements.canvas;
		info             = this.elements.info;
		dnd              = this.elements.dnd;
		dnd_link         = this.elements.dnd_link;
		dnd_file         = this.elements.dnd_file;
		dnd_play         = this.elements.dnd_play;
		
		$(container)
			.css({
				"position" : "relative",
				"width" : "100%",
				"height" : "100%"
			})
		;
		
		$(audioContainer)
			.css({
				"position" : "absolute",
				"top" : "5%",
				"left" : "10%",
				"z-index" : 1,
				
				"width" : "80%",
				"height" : "5%",
				"padding" : "1%"
			})
		;
		
		$(canvas)
			.css({
				"position" : "absolute",
				"top" : "0%",
				"left" : "0%",
				"z-index" : 0,
				
				"width" : "100%",
				"height" : "100%"
			})
		;
		
		$(info)
			.css({
				"position" : "absolute",
				"top" : "10%",
				"left" : "0%",
				"z-index" : 2,
				
				"width" : "100%",
				"height" : "8%",
				
				"text-align" : "center"
			})
		;
		
		$(dnd)
			.css({
				"position" : "absolute",
				"left" : "0%",
				"top" : "25%",
				"z-index" : 3,
				
				"width" : "100%",
				"height" : "50%",
				
				"overflow" : "hidden"
			})
		;
		
		$(dnd_link)
			.css({
				"position" : "absolute",
				"top" : "0%",
				"left" : "0%",
				
				"width" : "100%",
				"height" : "100%",
				"display" : "block",
				
				"background-color" : "rgba(0,0,0,0)",
				"opacity" : "0",
				"border" : "none"
			})
			.hide()
		;
		
		$(dnd_file)
			.set("type","file")
			.set("accept","audio/*")
			.css({
				"position" : "absolute",
				"top" : "0%",
				"left" : "0%",
				"display" : "block",
				
				"width" : "100%",
				"height" : "100%",
				
				"opacity" : "0"
		}).hide();
		
		$(dnd_play)
			.css({
				"position" : "absolute",
				"top" : "0%",
				"left" : "25%",
				
				"width" : "50%",
				"height" : "100%",
				
				"cursor" : "pointer"
			})
		;
	}
	
	{ // Listeners
		function typeContains(arr,search) {
			for (var i=0; i<arr.length; i++) {
				if (arr[i].toLowerCase().indexOf(search)>=0) {
					return true;
				}
			}
			return false;
		};
		
		$(dnd)
			.ael("dragenter",function(event) {
				if (typeContains(event.dataTransfer.types,"text/plain")) {
					$(dnd_link).show();
					$(dnd_file).hide();
					$(dnd_play).hide();
				}
				else if (typeContains(event.dataTransfer.types,"file")) {
					$(dnd_link).hide();
					$(dnd_file).show();
					$(dnd_play).hide();
				}
			})
			.ael("mouseout",function(event) {
				$(dnd_link).hide();
				$(dnd_file).hide();
				$(dnd_play).show();
			})
		;
		
		$(dnd_link)
			.ael("drop",function(event) {
				var link = event.dataTransfer.getData("text/plain");
				dnd_link.value = "";
				var ext = link.substring(link.lastIndexOf("."));
				if (ext==".mp3" || ext==".ogg" || ext==".wav") {
					instance.stop();
					instance.load(link);
					instance.play();
				}
				else if (ext==".json") {
					
				}
				return false;
			})
			.ael("dragleave",function(event) {
				$(dnd_link).hide();
				$(dnd_file).hide();
				$(dnd_play).show();
			})
		;
		
		$(dnd_file)
			.ael("drop",function(event) {
				console.log(event);
				var file = event.dataTransfer.files[0];
				console.log(file);
				var reader = new FileReader();
				reader.addEventListener("load",function(event) {
					console.log(event);
					instance.stop();
					instance.load(event.target.result);
					instance.play();
				});
				reader.readAsDataURL(file);
				return false;
			})
			.ael("dragleave",function(event) {
				$(dnd_link).hide();
				$(dnd_file).hide();
				$(dnd_play).show();
			})
		;
		
		$(dnd_play)
			.ael("click",function(event) {
				instance.toggle();
			})
		;
	}
	
	{ // Assembly
		$(container)
			.append(canvas)
		;
		
		$(this.parent)
			.append(container)
		;
	}
	
	{ // Final thoughts
		this.canvasContext = canvas.getContext("2d");
		this.canvasContext.fillStyle = "#808080";
		this.canvasContext.lineWidth = 2;
		this.canvasContext.strokeStyle = "#000000";
	}
	
};

AmoebaAudio.prototype = {
	constructor : AmoebaAudio,
	
	createMediaElement : function() {
		var $ = AmoebaAudio.Utils.chain;
		var instance = this;
		var audio = document.createElement("audio");
		
		$(audio).css({
			"width" : "100%"
		});
		
		$(audio).set("controls",true);
		
		return audio;
	},
	
	load : function(stream) {
		var AC = new this.AudioContext();
		
		this.nodes = {
			src : AC.createMediaStreamSource(stream),
			gain : AC.createGain(),
			analysis : AC.createAnalyser()
		};
		
		var src = this.nodes.src;
		var gain = this.nodes.gain;
		var analysis = this.nodes.analysis;
		
		gain.gain.value = 0.5;
		analysis.fftSize = 1024;
		analysis.minDecibels = -100;
		analysis.maxDecibels = -40;
		
		src.connect(gain);
		gain.connect(analysis);
		analysis.connect(AC.destination);
	},
	
	play : function(time) {
		this.elements.audio.play();
	},
	
	pause : function() {
		this.elements.audio.pause();
	},
	
	toggle : function() {
		if (this.isPlaying()) {
			this.elements.audio.pause();
		}
		else {
			this.elements.audio.play();
		}
	},
	
	isPlaying : function() {
		if (this.mobile) {
			return false;
		}
		else {
			return !this.elements.audio.paused;
		}
	},
	
	stop : function() {
		this.elements.audio.pause();
	},
	
	draw : function(options) {
		var ctx = this.canvasContext;
		//this.__drawTitle(ctx);
		//this.__drawInfo(ctx);
		this.__drawCanvas(ctx);
	},
	
	__drawTitle : function(ctx) {
		
	},
	
	__drawInfo : function(ctx) {
		
	},
	
	__drawCanvas : function(ctx) {
		var canvas = this.elements.canvas;
		if (canvas.width!=canvas.offsetWidth) canvas.width = canvas.offsetWidth;
		if (canvas.height!=canvas.offsetHeight) canvas.height = canvas.offsetHeight;
		
		var freqsize = 256;
		var freqdata = new Uint8Array(freqsize);
		if (this.nodes && this.nodes.analysis) {
			this.nodes.analysis.getByteFrequencyData(freqdata);
		}
		else {
			for (var i=0; i<freqsize; i++) {
				freqdata[i] = 0;
			}
		}
		
		ctx.clearRect(0,0,canvas.width,canvas.height);
		
		this.__drawCanvasBackground(canvas,ctx,freqdata);
		this.__drawCanvasCenter(canvas,ctx,freqdata);
	},
	
	__drawCanvasBackground : function(canvas,ctx,freqdata) {
		var freqsize = freqdata.length;
		var width = canvas.width;
		var height = canvas.height;
		var factor = height/1600;
		
		var bar = width/freqsize;
		var tbar = bar * 3;
		var qbar = bar * 0.25;
		
		ctx.save();
		
		//ctx.beginPath();
		//ctx.moveTo(0,height);
		var xp,xn,yp,yn;
		yp = height + 40;
		for (var i=0; i<freqsize; i+=4) {
			xp = qbar + bar*i;
			xn = xp + tbar;
			yn = -freqdata[i]*factor;
			
			ctx.fillRect(~~xp,~~yp,tbar,-freqdata[i]*factor);
			/*
			ctx.lineTo(~~xp,~~yp);
			ctx.lineTo(~~xp,~~yn);
			ctx.lineTo(~~xn,~~yn);
			ctx.lineTo(~~xn,~~yp);
			*/
		}
		//ctx.closePath();
		//ctx.fill();
		
		ctx.restore();
	},
	
	__drawCanvasCenter : function(canvas,ctx,freqdata) {
		var colors = [ // 0 - 3
			[0,0,0],
			[0,0,1],
			[0.5,0,0.5],
			[1,0,0],
			[1,0,0]
		];
		function getColor(t) {
			if (t>colors.length-2) t = colors.length-2;
			else if (t<0) t = 0;
			
			var p = ~~t;
			var i = t - p;
			var j = 1 - i;
			var n = p + 1;
			
			return "rgb(" +
				~~((colors[p][0]*j+colors[n][0]*i)*255) + "," +
				~~((colors[p][1]*j+colors[n][1]*i)*255) + "," +
				~~((colors[p][2]*j+colors[n][2]*i)*255) + ")";
		};
		
		var freqsize = freqdata.length;
		var width = canvas.width;
		var height = canvas.height;
		var lower = (width<height) ? width : height;
		var factor = lower/800;
		
		ctx.save();
		ctx.translate(width/2,height/2);
		
		var r,x,y,t;
		var xp = new Array(freqsize), yp = new Array(freqsize);
		var mx = new Array(freqsize), my = new Array(freqsize);
		min = 256;
		max = -256;
		avg = 0;
		for (var i=0; i<freqsize; i++) {
			if (freqdata[i]<min) min = freqdata[i];
			if (freqdata[i]>max) max = freqdata[i];
			avg = avg + freqdata[i];
			
			r = (freqdata[i]+64)*factor;
			
			if (i%2==0) {
				t = i/2;
			}
			else {
				t = (i-1+freqsize)/2;
			}
			
			x = r*Math.sin(t*4*Math.PI/freqsize);
			y = r*Math.cos(t*4*Math.PI/freqsize);
			
			xp[t] = x;
			yp[t] = y;
		}
		
		for (var i=0; i<freqsize; i++) {
			mx[i] = (xp[i] + xp[(i+1)%freqsize])/2;
			my[i] = (yp[i] + yp[(i+1)%freqsize])/2;
		}
		
		avg = avg/freqsize;
		avg = (avg-100)/25;
		
		ctx.strokeStyle = getColor(avg);
		
		ctx.beginPath();
		ctx.moveTo(mx[0],my[0]);
		for (var i=0; i<freqsize-1; i++) {
			ctx.quadraticCurveTo(xp[i+1],yp[i+1],mx[i+1],my[i+1]);
		}
		ctx.quadraticCurveTo(xp[0],yp[0],mx[0],my[0]);
		ctx.closePath();
		ctx.stroke();
		
		ctx.restore();
	}
};

AmoebaAudio.Utils = {
	e : function(id) {
		return document.getElementById(id);
	},
	
	css : function(element,styles) {
		for (var i in styles) {
			elements.style[i] = styles[i];
		}
	},
	
	chain : function(e) {
		return new AmoebaAudio.Utils.Chain(e);
	}
};

AmoebaAudio.Utils.Chain = function(e) {
	this.element = e;
};

AmoebaAudio.Utils.Chain.prototype = { // Chaining utils
	constructor : AmoebaAudio.Utils.Chain,
	
	css : function(styles) {
		for (var i in styles) {
			this.element.style[i] = styles[i];
		}
		
		return this;
	},
	
	ael : function(t,l) {
		this.element.addEventListener(t,l,true);
		return this;
	},
	
	set : function(t,v) {
		this.element[t] = v;
		return this;
	},
	
	append : function(e) {
		this.element.appendChild(e);
		return this;
	},
	
	hide : function() {
		this.element.style.display = "none";
		return this;
	},
	
	show : function() {
		this.element.style.display = "block";
		return this;
	}
};
