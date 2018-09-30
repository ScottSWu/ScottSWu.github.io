---
title: Autotagging mp3 Files
date: 2017-05-20 20:35:10
tags:
- python
- youtube-dl
- mp3
---

I frequently use [youtube-dl](https://rg3.github.io/youtube-dl/) to download mp3s or whole channels.

`youtube-dl -f bestaudio --extract-audio --audio-format mp3 <link>`

However these mp3s won't come with the right ID3 tags. I usually name the mp3s in a consistent fashion, which should make make tagging straightforward. In python, there's a package called [mutagen](https://mutagen.readthedocs.io/en/latest/) which has an easy ID3 editing package.

Editing tags is as simple as:
{% highlight python %}
from mutagen.easyid3 import EasyID3

file = EasyID3("filename.mp3")
audio["title"] = "Title"
audio["artist"] = ["Artist 1", "Artist 2"]
{% endhighlight %}

Putting it all into a simple script lets me tag them all at once, so audio players have an easier time categorizing and sorting.

[https://github.com/ScottSWu/id3tag.py](https://github.com/ScottSWu/id3tag.py)
