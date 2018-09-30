---
title: Rendering Canvas to mp4 using NodeJS
date: 2015-09-11 18:42:55
tags:
- graphics
- opengl
- javascript
---
I recently put together a "it just works" version of WOsu and WOsu-record.

[WOsu](https://github.com/ScottSWu/wosu) is a JavaScript library for the rhythm game [osu!](https://osu.ppy.sh). Although designed to use any sort of rendering (Canvas, CSS), its working implementation primarily relies on Three.js and WebGL.

Currently the primary use of WOsu is the [Web osu! Replay Viewer](http://sc-wu.com/p/wosu/), which allows users to view replays straight on the web.

[WOsu-record](https://github.com/ScottSWu/wosu-record) is an [Electron](http://electron.atom.io/) application that uses WOsu, ffmpeg and nodejs to record replays to a video file.

Currently the idea is to use the ffmpeg image2pipe feature to write frames through stdin.

First spawn a child ffmpeg process.
{% highlight javascript %}
var recorder = child_process.spawn("ffmpeg.exe", [
    "-y", "-f", "image2pipe",
    "-vcodec", "png", "-r", "60",
    "-i", "-", "-vcodec", "h264",
    "-r", "60", "output.mp4"
]);
{% endhighlight %}

Next, for each frame grab the canvas data and convert to a binary string.
{% highlight javascript %}
var url = canvas.toDataURL();
var data = atob( url.substring(url.indexOf("base64") + 7) );
{% endhighlight %}

Finally, we can write the data to stdin.
{% highlight javascript %}
recorder.stdin.write(data, "binary");
{% endhighlight %}

When finished, we can close the stream.
{% highlight javascript %}
recorder.stdin.end();
{% endhighlight %}
